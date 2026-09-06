/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CustomerBoard } from './components/CustomerBoard';
import { OwnerAdmin } from './components/OwnerAdmin';
import { GoldCalculator } from './components/GoldCalculator';
import { GoldItem, StoreSettings, UnitType, PublicRatesResponse } from './types';
import { INITIAL_GOLD_ITEMS, INITIAL_STORE_SETTINGS } from './data/defaultData';
import { Tv, Sparkles, X, Radio, Clock } from 'lucide-react';

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

  // Sync settings & items to backend server and localStorage
  const persistState = useCallback(async (newItems: GoldItem[], newSettings: StoreSettings) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(newItems));
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));

      await fetch('/api/store/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems, settings: newSettings })
      });
    } catch (e) {
      // Fallback works with localStorage
    }
  }, []);

  // Fetch Public Gold Prices from live feeds (SJC, PNJ, DOJI, AAA)
  const fetchMarketRates = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/gold/public-rates');
      if (res.ok) {
        const data: PublicRatesResponse = await res.json();
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
      }
    } catch (err) {
      console.warn('Could not fetch market rates, relying on active rates:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  }, [settings, persistState]);

  // Load saved configuration from server on initial load
  useEffect(() => {
    async function loadServerConfig() {
      try {
        const res = await fetch('/api/store/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.settings) {
            if (data.settings.items && Array.isArray(data.settings.items) && data.settings.items.length > 0) {
              setItems(data.settings.items);
            }
            if (data.settings.settings) {
              setSettings(data.settings.settings);
              if (data.settings.settings.displayUnit) {
                setUnit(data.settings.settings.displayUnit);
              }
            }
          }
        }
      } catch (e) {
        // Use local state
      }
      // Then fetch real-time market live rates
      fetchMarketRates(false);
    }

    loadServerConfig();
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
