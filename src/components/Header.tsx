import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Calculator, 
  Settings, 
  Clock, 
  RefreshCw, 
  Maximize, 
  Minimize,
  ArrowLeft
} from 'lucide-react';
import { StoreSettings, UnitType } from '../types';

interface HeaderProps {
  settings: StoreSettings;
  activeTab: 'board' | 'calculator' | 'admin';
  onSelectTab: (tab: 'board' | 'calculator' | 'admin') => void;
  unit: UnitType;
  onChangeUnit: (unit: UnitType) => void;
  onRefreshMarket: () => void;
  isRefreshing: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  onSelectTab,
  unit,
  onChangeUnit,
  onRefreshMarket,
  isRefreshing,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateString = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getInitials = (name: string) => {
    if (!name) return 'TV';
    const clean = name.replace(/^(tiệm vàng|vàng bạc|dntn|cty|doanh nghiệp)\s+/i, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'TV';
  };

  return (
    <header className="w-full bg-white border-b border-neutral-200 shadow-xs sticky top-0 z-30">
      {/* Top Banner: Clean White with Red & Gold Accents */}
      <div className="border-b border-neutral-100 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Store Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xs flex-shrink-0">
              <div className="w-full h-full bg-red-800 rounded-[10px] flex items-center justify-center text-amber-300 font-serif font-black text-base shadow-inner">
                {getInitials(settings.storeName || "TIỆM VÀNG")}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-red-800 font-serif uppercase whitespace-nowrap">
                  {settings.storeName || "TIỆM VÀNG"}
                </h1>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 whitespace-nowrap">
                  Thời gian thực SJC • PNJ • DOJI
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 font-semibold hidden sm:flex">
                <span>📍 {settings.address || "Quầy giao dịch"}</span>
                <span>•</span>
                <span>📞 Hotline: {settings.phone || "Liên hệ"}</span>
              </div>
            </div>
          </div>

          {/* Right: Clock & Fullscreen Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1 text-center flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-600 flex-shrink-0" />
              <div className="text-left leading-tight">
                <div className="text-neutral-900 font-mono text-sm sm:text-base font-black">
                  {timeString}
                </div>
                <div className="text-[10px] text-neutral-500 capitalize hidden sm:block">
                  {dateString}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('board')}
              title="Quay lại Bảng Giá TV"
              className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Tv className="w-4 h-4 text-amber-300" />
              <span className="uppercase">Xem Bảng TV</span>
            </button>
          </div>

        </div>
      </div>

      {/* Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('board')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'board'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Bảng Giá Khách Xem</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Máy Tính Tiền</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Lãi & Giá (Chủ Tiệm)</span>
          </button>
        </div>

        {/* Live Refresh Market API */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshMarket}
            disabled={isRefreshing}
            title="Lấy giá mới nhất từ thị trường"
            className="px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-amber-50 text-red-800 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Cập nhật giá mới</span>
          </button>
        </div>

      </div>
    </header>
  );
};
