/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CustomerBoard } from './components/CustomerBoard';
import { MobileAdmin } from './components/MobileAdmin';
import { AdminLogin } from './components/AdminLogin';
import { PinModal } from './components/PinModal';
import { GoldCalculator } from './components/GoldCalculator';
import { GoldItem, StoreSettings, UnitType } from './types';
import { INITIAL_GOLD_ITEMS, INITIAL_STORE_SETTINGS } from './data/defaultData';
import { 
  subscribeToStoreConfig, 
  saveStoreConfigToFirebase, 
  fetchStoreConfigFromFirebase,
  subscribeToMarketRates 
} from './firebase';
import { getLiveMarketRates } from './utils/marketRatesService';

const LOCAL_STORAGE_ITEMS_KEY = 'tiem_vang_ducky_items_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'tiem_vang_ducky_settings_v1';
const LOCAL_STORAGE_AUTH_KEY = 'tiem_vang_admin_authenticated';

// Determine initial tab from URL: ?mode=admin or /admin or #admin
function getInitialTab(): 'board' | 'admin' | 'calculator' {
  if (typeof window !== 'undefined') {
    const search = window.location.search;
    const hash = window.location.hash;
    const path = window.location.pathname;
    if (search.includes('mode=admin') || search.includes('admin=1') || hash === '#admin' || path.startsWith('/admin')) {
      return 'admin';
    }
    if (search.includes('mode=calc') || hash === '#calc') {
      return 'calculator';
    }
  }
  return 'board';
}

export default function App() {
  // Initialize state with fallback to localStorage or built-in defaults
  const [items, setItems] = useState<GoldItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading items from localStorage:', e);
    }
    return INITIAL_GOLD_ITEMS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.address || parsed.address.includes('Số 88 Phố Vàng Bạc')) {
          parsed.address = INITIAL_STORE_SETTINGS.address;
        }
        if (!parsed.phone || parsed.phone.includes('0988.666.888')) {
          parsed.phone = INITIAL_STORE_SETTINGS.phone;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return INITIAL_STORE_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<'board' | 'admin' | 'calculator'>(getInitialTab);
  const [unit, setUnit] = useState<UnitType>(settings.displayUnit || 'chi');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Admin authentication state (PIN 1234)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  // Sync URL query parameters (?mode=tv vs ?mode=admin)
  const updateUrlMode = useCallback((mode: 'tv' | 'admin' | 'calc') => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'admin') {
        url.searchParams.set('mode', 'admin');
      } else if (mode === 'calc') {
        url.searchParams.set('mode', 'calc');
      } else {
        url.searchParams.set('mode', 'tv');
      }
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keep ref to avoid stale state in callbacks
  const isUpdatingFromRemoteRef = useRef<boolean>(false);

  // Sync settings & items to Firebase Firestore, backend server and localStorage
  const persistState = useCallback(async (newItems: GoldItem[], newSettings: StoreSettings) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(newItems));
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));

      // 1. Primary: Save directly to Firebase Firestore for instant live sync across TV & Mobile
      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
      const success = await saveStoreConfigToFirebase(
        newItems, 
        newSettings, 
        isMobileDevice ? 'mobile_admin' : 'desktop_tv'
      );
      if (success) {
        setIsFirebaseConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }

      // 2. Secondary: Fallback to local Express API if running
      fetch('/api/store/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems, settings: newSettings })
      }).catch(() => {
        // Silently ignore if static hosting
      });
    } catch (e) {
      console.error('Error persisting state:', e);
    }
  }, []);

  // Fetch Public Gold Prices from live feeds (SJC, PNJ, DOJI, AAA)
  const fetchMarketRates = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const data = await getLiveMarketRates();
      if (data && data.rates && data.rates.length > 0) {
        setItems(prevItems => {
          const updated = prevItems.map(item => {
            const match = data.rates.find(r => 
              r.id === item.id || 
              (r.brand === item.brand && r.name.toLowerCase() === item.name.toLowerCase())
            );

            if (match) {
              return {
                ...item,
                apiBuy: match.buy,
                apiSell: match.sell,
                baseBuy: match.buy,
                baseSell: match.sell,
                prevDayBuy: match.prevDayBuy || (match.buy - (match.changeAmount || 0)),
                prevDaySell: match.prevDaySell || (match.sell - (match.changeAmount || 0)),
                trend: match.trend || item.trend,
                changeAmount: match.changeAmount ?? item.changeAmount
              };
            }
            return item;
          });

          const newSettings: StoreSettings = {
            ...settings,
            lastSyncedAt: data.timestamp || new Date().toLocaleTimeString('vi-VN'),
            dataSourceName: data.source || settings.dataSourceName
          };

          setSettings(newSettings);
          persistState(updated, newSettings);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Could not fetch market rates, relying on active rates:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  }, [settings, persistState]);

  // Firebase Real-time Listener: Updates instantly when phone changes prices or settings!
  useEffect(() => {
    let unsubscribeStore: (() => void) | undefined;
    let unsubscribeRates: (() => void) | undefined;

    // 1. Initial load from Firestore or seed if empty
    async function initFirebaseData() {
      try {
        const cloudData = await fetchStoreConfigFromFirebase();
        if (cloudData && cloudData.items && cloudData.items.length > 0) {
          isUpdatingFromRemoteRef.current = true;
          // Verify if cloudData items have legacy stale rates (e.g. SJC < 100,000,000)
          const sjc = cloudData.items.find(i => i.id === 'sjc-1l');
          const isStale = !sjc || sjc.apiBuy < 100000000;

          if (isStale) {
            setItems(INITIAL_GOLD_ITEMS);
            const freshSettings: StoreSettings = {
              ...(cloudData.settings || settings),
              pricingMode: 'auto_market'
            };
            setSettings(freshSettings);
            saveStoreConfigToFirebase(INITIAL_GOLD_ITEMS, freshSettings, 'market_upgrade').catch(() => {});
          } else {
            setItems(cloudData.items);
            if (cloudData.settings) {
              setSettings(cloudData.settings);
              if (cloudData.settings.displayUnit) {
                setUnit(cloudData.settings.displayUnit);
              }
            }
          }
          setIsFirebaseConnected(true);
          isUpdatingFromRemoteRef.current = false;
        } else {
          saveStoreConfigToFirebase(INITIAL_GOLD_ITEMS, settings, 'initial_seed')
            .then(() => setIsFirebaseConnected(true))
            .catch(() => {});
        }
      } catch (err) {
        console.warn('Firebase initial load fallback:', err);
      }

      fetchMarketRates(false);
    }

    initFirebaseData();

    // 2. Real-time subscription to store configuration
    unsubscribeStore = subscribeToStoreConfig(
      (data) => {
        setIsFirebaseConnected(true);
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
        if (data.settings) {
          setSettings(data.settings);
          if (data.settings.displayUnit) {
            setUnit(data.settings.displayUnit);
          }
        }
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      },
      (err) => {
        console.warn('[Firebase] Connection status:', err);
      }
    );

    // 3. Real-time subscription to market rates
    unsubscribeRates = subscribeToMarketRates((ratesData) => {
      if (ratesData && ratesData.rates && ratesData.rates.length > 0) {
        setItems(prevItems => {
          return prevItems.map(item => {
            const match = ratesData.rates.find(r => r.id === item.id);
            if (match) {
              return {
                ...item,
                apiBuy: match.buy,
                apiSell: match.sell,
                baseBuy: match.buy,
                baseSell: match.sell,
                prevDayBuy: match.prevDayBuy || (match.buy - (match.changeAmount || 0)),
                prevDaySell: match.prevDaySell || (match.sell - (match.changeAmount || 0)),
                trend: match.trend || item.trend,
                changeAmount: match.changeAmount ?? item.changeAmount
              };
            }
            return item;
          });
        });
      }
    });

    return () => {
      if (unsubscribeStore) unsubscribeStore();
      if (unsubscribeRates) unsubscribeRates();
    };
  }, []);

  // Periodic auto-sync based on store settings
  useEffect(() => {
    const minutes = Math.max(2, settings.autoSyncIntervalMinutes || 15);
    const interval = setInterval(() => {
      fetchMarketRates(false);
    }, minutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.autoSyncIntervalMinutes, fetchMarketRates]);

  // Fullscreen toggle for TV mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Update Settings handler
  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    setUnit(newSettings.displayUnit);
    persistState(items, newSettings);
  };

  // Update Items handler
  const handleUpdateItems = (newItems: GoldItem[]) => {
    setItems(newItems);
    persistState(newItems, settings);
  };

  // Navigation handlers
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setActiveTab('admin');
      updateUrlMode('admin');
    } else {
      setShowPinModal(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    setShowPinModal(false);
    setActiveTab('admin');
    updateUrlMode('admin');
  };

  const handleAdminLock = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    } catch (e) {
      console.error(e);
    }
    setActiveTab('board');
    updateUrlMode('tv');
  };

  const handleSwitchToTV = () => {
    setActiveTab('board');
    updateUrlMode('tv');
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col selection:bg-red-600 selection:text-white ${
      isFullscreen ? 'p-0 overflow-hidden' : ''
    }`}>

      {/* CHẾ ĐỘ 1: BẢNG GIÁ TV CHIẾU CHO KHÁCH XEM (URL: ?mode=tv hoặc mặc định) */}
      {activeTab === 'board' && (
        <>
          <CustomerBoard
            items={items}
            settings={settings}
            unit={unit}
            onChangeUnit={(u) => {
              setUnit(u);
              handleUpdateSettings({ ...settings, displayUnit: u });
            }}
            onUpdateItems={handleUpdateItems}
            onUpdateSettings={handleUpdateSettings}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onOpenAdmin={handleOpenAdmin}
            onOpenCalculator={() => {
              setActiveTab('calculator');
              updateUrlMode('calc');
            }}
            onRefreshMarket={() => fetchMarketRates(true)}
            isRefreshing={isRefreshing}
            isFirebaseConnected={isFirebaseConnected}
            lastSyncedTime={lastSyncTime}
          />

          {/* Modal Nhập PIN 1234 khi bấm Quản lý từ Bảng TV */}
          <PinModal
            isOpen={showPinModal}
            onClose={() => setShowPinModal(false)}
            onSuccess={handleAdminAuthSuccess}
            correctPin={settings.adminPin || '1234'}
          />
        </>
      )}

      {/* CHẾ ĐỘ 2: TRANG QUẢN TRỊ CHỦ TIỆM ĐIỆN THOẠI (URL: ?mode=admin) */}
      {activeTab === 'admin' && (
        isAdminAuthenticated ? (
          /* Đã đăng nhập: Vào thẳng Giao diện Quản Lý Điện Thoại (Không bị bóp hình) */
          <MobileAdmin
            items={items}
            settings={settings}
            unit={unit}
            onChangeUnit={(u) => {
              setUnit(u);
              handleUpdateSettings({ ...settings, displayUnit: u });
            }}
            onUpdateItems={handleUpdateItems}
            onUpdateSettings={handleUpdateSettings}
            onRefreshMarket={() => fetchMarketRates(true)}
            isRefreshing={isRefreshing}
            onOpenTV={handleSwitchToTV}
            onLockAdmin={handleAdminLock}
            isFirebaseConnected={isFirebaseConnected}
            lastSyncedTime={lastSyncTime}
          />
        ) : (
          /* Chưa đăng nhập: Hiện ngay Màn hình Đăng Nhập PIN 1234 to rõ */
          <AdminLogin
            onSuccess={handleAdminAuthSuccess}
            onBackToTV={handleSwitchToTV}
            correctPin={settings.adminPin || '1234'}
            storeName={settings.storeName}
          />
        )
      )}

      {/* CHẾ ĐỘ 3: MÁY TÍNH TIỀN VÀNG */}
      {activeTab === 'calculator' && (
        <div className="min-h-screen bg-[#FAF7F0] p-4 flex flex-col">
          <div className="max-w-2xl mx-auto w-full mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSwitchToTV}
              className="px-3 py-1.5 rounded-xl bg-red-800 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              ← Quay Lại Bảng TV
            </button>
            <button
              type="button"
              onClick={handleOpenAdmin}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Vào Quản Trị (1234)
            </button>
          </div>
          <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-4 shadow-sm border border-neutral-200">
            <GoldCalculator
              items={items}
              settings={settings}
            />
          </div>
        </div>
      )}

    </div>
  );
}
