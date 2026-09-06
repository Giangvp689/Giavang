/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CustomerBoard } from './components/CustomerBoard';
import { OwnerAdmin } from './components/OwnerAdmin';
import { GoldCalculator } from './components/GoldCalculator';
import { PinModal } from './components/PinModal';
import { GoldItem, StoreSettings, UnitType, PublicRatesResponse } from './types';
import { INITIAL_GOLD_ITEMS, INITIAL_STORE_SETTINGS } from './data/defaultData';
import { 
  subscribeToStoreConfig, 
  saveStoreConfigToFirebase, 
  fetchStoreConfigFromFirebase,
  subscribeToMarketRates 
} from './firebase';
import { getLiveMarketRates } from './utils/marketRatesService';
import { Tv, Sparkles, X, Radio, Clock, Wifi } from 'lucide-react';

const LOCAL_STORAGE_ITEMS_KEY = 'tiem_vang_ducky_items_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'tiem_vang_ducky_settings_v1';

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
        // Overwrite old dummy address/phone if present
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

  const [activeTab, setActiveTab] = useState<'board' | 'calculator' | 'admin'>('board');
  const [unit, setUnit] = useState<UnitType>(settings.displayUnit || 'chi');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [calcSelectedItem, setCalcSelectedItem] = useState<GoldItem | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Keep ref to avoid stale state in callbacks
  const isUpdatingFromRemoteRef = useRef<boolean>(false);

  // Sync settings & items to Firebase, backend server and localStorage
  const persistState = useCallback(async (newItems: GoldItem[], newSettings: StoreSettings) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(newItems));
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));

      // 1. Primary: Save directly to Firebase Firestore for real-time sync across TV & Mobile
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
        // Silently ignore if static hosting like Vercel
      });
    } catch (e) {
      console.error('Error persisting state:', e);
    }
  }, []);

  // Fetch Public Gold Prices from live feeds (SJC, PNJ, DOJI, AAA)
  const fetchMarketRates = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      // Use robust multi-source service that works on both local container and Vercel/GitHub
      const data = await getLiveMarketRates();
      if (data && data.rates && data.rates.length > 0) {
        setItems(prevItems => {
          const updated = prevItems.map(item => {
            // Find matching market rate by id or exact match
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

  // Firebase Real-time Listener: Updates instantly when any device (e.g. mobile phone) changes prices or settings!
  useEffect(() => {
    let unsubscribeStore: (() => void) | undefined;
    let unsubscribeRates: (() => void) | undefined;

    // 1. Initial load from Firestore or seed if empty
    async function initFirebaseData() {
      try {
        const cloudData = await fetchStoreConfigFromFirebase();
        if (cloudData && cloudData.items && cloudData.items.length > 0) {
          isUpdatingFromRemoteRef.current = true;
          setItems(cloudData.items);
          if (cloudData.settings) {
            setSettings(cloudData.settings);
            if (cloudData.settings.displayUnit) {
              setUnit(cloudData.settings.displayUnit);
            }
          }
          setIsFirebaseConnected(true);
          isUpdatingFromRemoteRef.current = false;
        } else {
          // Initialize empty Firestore with current items & settings
          saveStoreConfigToFirebase(items, settings, 'initial_seed')
            .then(() => setIsFirebaseConnected(true))
            .catch(() => {});
        }
      } catch (err) {
        console.warn('Firebase initial load fallback:', err);
      }

      // Also trigger initial live market rates check
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

    // 3. Real-time subscription to market rates synced by any client
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

  // Periodic auto-sync based on store settings (e.g. every 15 minutes)
  useEffect(() => {
    const minutes = Math.max(2, settings.autoSyncIntervalMinutes || 15);
    const interval = setInterval(() => {
      fetchMarketRates(false);
    }, minutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.autoSyncIntervalMinutes, fetchMarketRates]);

  // Fullscreen toggle
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

  // Switch to calculator with specific item
  const handleOpenCalculatorWithItem = (item: GoldItem) => {
    setCalcSelectedItem(item);
    setActiveTab('calculator');
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col selection:bg-red-600 selection:text-white ${
      isFullscreen ? 'p-0 overflow-hidden' : ''
    }`}>

      {activeTab === 'board' ? (
        /* Full TV Board View (fits 100vh of TV screen without vertical overflow) */
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
          onOpenAdmin={() => {
            setIsFullscreen(false);
            setActiveTab('admin');
          }}
          onOpenCalculator={() => {
            setIsFullscreen(false);
            setActiveTab('calculator');
          }}
          onRefreshMarket={() => fetchMarketRates(true)}
          isRefreshing={isRefreshing}
          isFirebaseConnected={isFirebaseConnected}
          lastSyncedTime={lastSyncTime}
        />
      ) : (
        /* Standard Pages (Calculator, Owner Admin Settings) with clean light header */
        <>
          <Header
            settings={settings}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            unit={unit}
            onChangeUnit={(u) => {
              setUnit(u);
              handleUpdateSettings({ ...settings, displayUnit: u });
            }}
            onRefreshMarket={() => fetchMarketRates(true)}
            isRefreshing={isRefreshing}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
            {activeTab === 'calculator' && (
              <GoldCalculator
                items={items}
                settings={settings}
                selectedItemInitial={calcSelectedItem}
              />
            )}

            {activeTab === 'admin' && (
              <OwnerAdmin
                items={items}
                settings={settings}
                onUpdateItems={handleUpdateItems}
                onUpdateSettings={handleUpdateSettings}
                onRefreshMarket={() => fetchMarketRates(true)}
                isRefreshing={isRefreshing}
              />
            )}
          </main>

          <footer className="bg-white border-t border-neutral-200 py-3 text-xs text-neutral-600">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-red-700 font-serif uppercase">{settings.storeName}</span>
                <span>• Hệ thống Bảng Giá Vàng Điện Tử Chiếu TV Cho Khách</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  API Thời Gian Thực: SJC • PNJ • DOJI • AAA
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('board')}
                  className="text-red-700 hover:underline font-bold cursor-pointer"
                >
                  Xem Bảng Giá TV
                </button>
              </div>
            </div>
          </footer>
        </>
      )}

    </div>
  );
}
