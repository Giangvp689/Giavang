import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Calculator, 
  Settings, 
  Clock, 
  RefreshCw, 
  Maximize, 
  Minimize
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

  return (
    <header className="w-full bg-[#FAF7F2] border-b border-amber-200/80 shadow-xs sticky top-0 z-30">
      {/* Top Prestigious Bordeaux & Gold Banner */}
      <div className="bg-red-900 text-white px-4 sm:px-6 py-2.5 border-b-2 border-amber-500/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Store Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-red-950 font-serif font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
              ĐK
            </div>

            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-wider text-amber-300 font-serif uppercase">
                {settings.storeName || "TIỆM VÀNG ĐỨC KỲ"}
              </h1>
              <p className="text-xs text-amber-100 font-medium hidden sm:block">
                {settings.slogan || "Uy Tín Trọn Niềm Tin • Chuẩn Tuổi Vàng 100%"}
                {settings.phone && ` • ĐT: ${settings.phone}`}
              </p>
            </div>
          </div>

          {/* Right: Clock & TV Mode Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-red-950/80 border border-amber-400/40 rounded-lg px-3 py-1 text-center flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <div className="text-left leading-tight">
                <div className="text-amber-300 font-mono text-sm sm:text-base font-black">
                  {timeString}
                </div>
                <div className="text-[10px] text-amber-100 capitalize hidden sm:block">
                  {dateString}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleFullscreen}
              title="Phóng to bảng giá toàn màn hình TV"
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span className="font-extrabold uppercase">Màn Hình TV</span>
            </button>
          </div>

        </div>
      </div>

      {/* Clean Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('board')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'board'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-white hover:bg-amber-100 text-neutral-800 border border-amber-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Bảng Giá Khách Xem</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-white hover:bg-amber-100 text-neutral-800 border border-amber-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Máy Tính Tiền</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white hover:bg-amber-100 text-neutral-800 border border-amber-200'
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
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-red-900 border border-amber-300 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Cập nhật giá mới</span>
          </button>
        </div>

      </div>
    </header>
  );
};
