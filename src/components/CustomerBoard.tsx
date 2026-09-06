import React, { useState, useEffect } from 'react';
import { 
  Maximize, 
  Minimize, 
  Sparkles, 
  Settings,
  MapPin,
  Phone,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { GoldItem, StoreSettings, UnitType } from '../types';
import { calculateStorePrices, convertPriceByUnit } from '../utils/goldMath';

interface CustomerBoardProps {
  items: GoldItem[];
  settings: StoreSettings;
  unit: UnitType;
  onChangeUnit?: (unit: UnitType) => void;
  onUpdateItems?: (items: GoldItem[]) => void;
  onUpdateSettings?: (settings: StoreSettings) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenAdmin?: () => void;
  onOpenCalculator?: () => void;
  onRefreshMarket?: () => void;
  isRefreshing?: boolean;
  isFirebaseConnected?: boolean;
  lastSyncedTime?: string;
}

export const CustomerBoard: React.FC<CustomerBoardProps> = ({
  items,
  settings,
  unit,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenAdmin,
  isFirebaseConnected = false,
  lastSyncedTime = ''
}) => {
  // Real-time live clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Layout mode for TV: settings.tvLayoutMode or default 'two_col' (fits 16:9 TV screen without scrolling)
  const layoutMode = settings.tvLayoutMode || 'two_col';
  
  // Number format: 'compact' (e.g. 8.850 nghìn/chỉ) vs 'full' (e.g. 8.850.000)
  const priceFormat = 'compact';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter visible items
  const visibleItems = items
    .filter(item => item.visible)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => ({
      ...item,
      cleanName: item.name.replace(/^[\s_\-–—•*]+/, '').trim()
    }));

  // Format price into prominent, readable TV numbers
  const formatPrice = (pricePerLuong: number) => {
    const converted = convertPriceByUnit(pricePerLuong, unit);
    if (priceFormat === 'compact') {
      if (unit === 'chi' || unit === 'luong') {
        const inThousands = Math.round(converted / 1000);
        return inThousands.toLocaleString('vi-VN');
      }
    }
    return converted.toLocaleString('vi-VN');
  };

  // Format daily change compared to yesterday (Chênh lệch so với hôm qua)
  const formatDailyChange = (changePerLuong: number) => {
    const absChange = Math.abs(changePerLuong);
    const converted = convertPriceByUnit(absChange, unit);
    if (priceFormat === 'compact') {
      if (unit === 'chi' || unit === 'luong') {
        const inThousands = Math.round(converted / 1000);
        return inThousands.toLocaleString('vi-VN');
      }
    }
    return converted.toLocaleString('vi-VN');
  };

  const getUnitSubtitle = () => {
    if (unit === 'chi') {
      return priceFormat === 'compact' ? 'nghìn/chỉ' : 'VNĐ/chỉ';
    }
    if (unit === 'luong') {
      return priceFormat === 'compact' ? 'nghìn/lượng' : 'VNĐ/lượng';
    }
    return 'VNĐ/gam';
  };

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

  // Split items into 2 columns for TV landscape layout (fits 16:9 TV screen)
  const midPoint = Math.ceil(visibleItems.length / 2);
  const col1Items = visibleItems.slice(0, midPoint);
  const col2Items = visibleItems.slice(midPoint);

  // Store contact info from settings or defaults
  const storeAddress = settings.address || "2C Lê Quý Đôn - Sơn Tây - Hà Nội";
  const storePhone = settings.phone || "0985061955";

  // Renders a balanced 4-column table:
  // LOẠI VÀNG (36%) | MUA VÀO (25%) | BÁN RA (25%) | CHÊNH LỆCH (14%)
  const renderColumnTable = (colItems: typeof visibleItems, columnTitle?: string) => (
    <div className="flex-1 flex flex-col h-full bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Group header if any */}
      {columnTitle && (
        <div className="px-3 py-1 bg-neutral-100 border-b border-neutral-200 text-[11px] sm:text-xs font-black text-neutral-700 uppercase tracking-wider flex items-center justify-between flex-shrink-0">
          <span>{columnTitle}</span>
          <span className="text-[10px] text-neutral-500 font-bold">{colItems.length} loại</span>
        </div>
      )}

      {/* 4 Column Headers: LOẠI VÀNG (Đỏ chuẩn tiệm vàng) | MUA VÀO | BÁN RA | CHÊNH LỆCH */}
      <div className="flex items-stretch text-white text-xs sm:text-sm font-black uppercase tracking-wider flex-shrink-0 bg-[#B91C1C] border-b-2 border-amber-400 shadow-2xs">
        {/* Col 1: LOẠI VÀNG (36%) */}
        <div className="w-[36%] px-3 sm:px-4 py-2 flex items-center bg-[#B91C1C]">
          <span>LOẠI VÀNG</span>
        </div>

        {/* Col 2: MUA VÀO (25%) */}
        <div className="w-[25%] px-1 py-1.5 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center">
          <div className="leading-tight font-black text-xs sm:text-sm text-white">MUA VÀO</div>
          <div className="text-[10px] font-medium text-amber-200 lowercase leading-none">(tiệm mua)</div>
        </div>

        {/* Col 3: BÁN RA (25%) */}
        <div className="w-[25%] px-1 py-1.5 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center">
          <div className="leading-tight font-black text-xs sm:text-sm text-white">BÁN RA</div>
          <div className="text-[10px] font-medium text-amber-200 lowercase leading-none">(tiệm bán)</div>
        </div>

        {/* Col 4: CHÊNH LỆCH (14%) */}
        <div className="w-[14%] px-1 py-1.5 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center">
          <div className="leading-tight font-black text-[11px] sm:text-xs text-white">CHÊNH LỆCH</div>
          <div className="text-[9px] font-medium text-amber-200 lowercase leading-none">(so hôm qua)</div>
        </div>
      </div>

      {/* Row Items */}
      <div className="flex-1 flex flex-col justify-between divide-y divide-neutral-200/80 overflow-hidden bg-white">
        {colItems.map((item) => {
          const { finalBuy, finalSell, dailyChangeAmount } = calculateStorePrices(item, settings);
          const isUp = dailyChangeAmount > 0;
          const isDown = dailyChangeAmount < 0;

          return (
            <div 
              key={item.id}
              className="flex items-stretch flex-1 bg-white hover:bg-neutral-50/80 transition-colors"
            >
              {/* Col 1: LOẠI VÀNG */}
              <div className="w-[36%] px-3 sm:px-4 py-1 flex items-center justify-between gap-2 min-w-0 bg-white">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="flex-shrink-0 text-xs sm:text-sm font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                    {item.brand}
                  </span>
                  <span 
                    className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-neutral-900 truncate tracking-tight leading-snug" 
                    title={item.cleanName}
                  >
                    {item.cleanName}
                  </span>
                </div>
              </div>

              {/* Col 2: MUA VÀO (Chữ xanh dương hoàng gia) */}
              <div className="w-[25%] px-1 py-1 text-center border-l border-neutral-200/80 flex flex-col justify-center bg-white">
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-[#1D4ED8] tracking-tight font-sans tabular-nums leading-none">
                  {formatPrice(finalBuy)}
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#1D4ED8]/75 font-bold uppercase mt-0.5">
                  {getUnitSubtitle()}
                </div>
              </div>

              {/* Col 3: BÁN RA (Chữ đỏ ruby) */}
              <div className="w-[25%] px-1 py-1 text-center border-l border-neutral-200/80 flex flex-col justify-center bg-white">
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-[#DC2626] tracking-tight font-sans tabular-nums leading-none">
                  {formatPrice(finalSell)}
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#DC2626]/75 font-bold uppercase mt-0.5">
                  {getUnitSubtitle()}
                </div>
              </div>

              {/* Col 4: CHÊNH LỆCH */}
              <div className="w-[14%] px-1 py-1 text-center border-l border-neutral-200/80 flex flex-col justify-center items-center bg-white">
                {isUp ? (
                  <div className="inline-flex items-center gap-0.5 text-emerald-700 font-black text-xs sm:text-sm lg:text-base leading-none">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                    <span>+{formatDailyChange(dailyChangeAmount)}</span>
                  </div>
                ) : isDown ? (
                  <div className="inline-flex items-center gap-0.5 text-rose-700 font-black text-xs sm:text-sm lg:text-base leading-none">
                    <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 flex-shrink-0" />
                    <span>-{formatDailyChange(dailyChangeAmount)}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-0.5 text-neutral-400 font-bold text-xs sm:text-sm leading-none">
                    <Minus className="w-3.5 h-3.5 text-neutral-400" />
                    <span>0</span>
                  </div>
                )}
                <div className="text-[8px] sm:text-[9px] text-neutral-400 font-bold uppercase mt-0.5">
                  {priceFormat === 'compact' ? 'k/đơn vị' : 'đ'}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div 
      className={`w-full h-screen max-h-screen flex flex-col justify-between select-none overflow-hidden bg-[#F8F9FA] text-neutral-900 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* 1. TOP MASTER HEADER: Tên Tiệm Vàng, Địa Chỉ, Khẩu Hiệu & Nút Vào Quản Trị */}
      <header className="w-full bg-white border-b-2 border-amber-300/80 px-3 sm:px-6 py-2 shadow-xs flex-shrink-0 z-20">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Left: Brand Crest & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-red-900 rounded-[10px] flex items-center justify-center text-amber-300 font-serif font-black text-lg sm:text-xl tracking-wider shadow-inner">
                ĐK
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif uppercase tracking-widest text-red-800 leading-none drop-shadow-2xs">
                  {settings.storeName || "TIỆM VÀNG ĐỨC KỲ"}
                </h1>
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SJC • PNJ • DOJI • AAA
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-700 font-bold mt-1">
                <span className="flex items-center gap-1 text-red-950">
                  <MapPin className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
                  <span>{storeAddress}</span>
                </span>
                <span className="text-neutral-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-red-800">
                  <Phone className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
                  <span>Hotline: {storePhone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Store Motto "CHỮ TÍN QUÝ HƠN VÀNG" */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-950 via-[#B91C1C] to-red-950 text-amber-300 border-2 border-amber-400 shadow-md">
              <span className="text-amber-400 font-bold text-sm sm:text-base hidden sm:inline">✦</span>
              <span className="font-serif font-black text-base sm:text-xl lg:text-2xl xl:text-3xl uppercase tracking-widest text-amber-200 drop-shadow-sm whitespace-nowrap">
                CHỮ TÍN QUÝ HƠN VÀNG
              </span>
              <span className="text-amber-400 font-bold text-sm sm:text-base hidden sm:inline">✦</span>
            </div>
          </div>

          {/* Right: Digital Clock, Fullscreen TV, Firebase Status, and Settings ⚙️ */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Digital Live Clock */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-xl px-2.5 sm:px-3 py-1 text-right">
              <div className="text-sm sm:text-lg font-black text-neutral-900 tracking-tight font-mono leading-none">
                {timeString}
              </div>
              <div className="text-[10px] text-neutral-500 font-medium capitalize hidden sm:block mt-0.5">
                {dateString}
              </div>
            </div>

            {/* Fullscreen TV Toggle */}
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                title="Bật/tắt toàn màn hình TV"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span className="hidden sm:inline font-extrabold uppercase">
                  {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình TV'}
                </span>
              </button>
            )}

            {/* Firebase Cloud Live Sync Badge */}
            {isFirebaseConnected && (
              <div 
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold"
                title={`Đã kết nối Firebase Firestore • Đồng bộ TV tức thì${lastSyncedTime ? ` (Lần cuối: ${lastSyncedTime})` : ''}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-black">Firebase TV</span>
              </div>
            )}

            {/* Nút Răng Cưa Cài Đặt (⚙️) - Bấm vào sẽ mở popup nhập PIN 1234 vào Admin */}
            <button
              type="button"
              onClick={onOpenAdmin}
              title="Vào Trung Tâm Quản Trị Chủ Tiệm (Mã PIN: 1234)"
              className="p-2 sm:p-2.5 rounded-xl text-neutral-700 hover:text-red-700 hover:bg-red-50 border border-neutral-300 hover:border-red-400 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Settings className="w-5 h-5 text-neutral-700 hover:text-red-700" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN TV GOLD BOARD (Khớp vừa vặn màn hình TV, 4 cột cân đối) */}
      <main className="flex-1 min-h-0 w-full p-2 sm:p-3 lg:p-3.5 overflow-hidden flex flex-col justify-stretch">
        {visibleItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 font-bold text-base gap-3">
            <span>Chưa có loại vàng nào trong danh sách hiển thị.</span>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-4 py-2 bg-red-700 text-white rounded-xl font-black text-xs cursor-pointer"
            >
              Vào Quản Trị Thêm Loại Vàng
            </button>
          </div>
        ) : layoutMode === 'two_col' ? (
          /* Bố cục 2 cột cân đối: Chuẩn TV 16:9 không cần cuộn trang */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full overflow-hidden">
            {renderColumnTable(col1Items, 'Vàng Miếng & Vàng Nhẫn Chuẩn (SJC, PNJ, DOJI)')}
            {renderColumnTable(col2Items, 'Vàng Nữ Trang, Vàng 24K, 18K, 14K, 10K')}
          </div>
        ) : (
          /* Bố cục 1 cột */
          <div className="h-full overflow-hidden">
            {renderColumnTable(visibleItems)}
          </div>
        )}
      </main>

      {/* 3. RUNNING MARQUEE TICKER: Đầy đủ địa chỉ và số điện thoại tiệm */}
      <footer className="w-full bg-white border-t border-neutral-200/90 py-1.5 px-3 sm:px-4 flex items-center gap-2.5 shadow-xs flex-shrink-0 z-20">
        <div className="flex-shrink-0 px-2.5 py-0.5 rounded-md bg-red-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>THÔNG BÁO</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee text-xs sm:text-sm font-semibold text-neutral-800 tracking-wide">
            {`TIỆM VÀNG ĐỨC KỲ KÍNH CHÀO QUÝ KHÁCH • ĐỊA CHỈ: ${storeAddress} • ĐIỆN THOẠI: ${storePhone} • BẢNG GIÁ ĐỒNG BỘ TRỰC TIẾP THEO THỜI GIAN THỰC TỪ SJC, PNJ, DOJI, AAA • CAM KẾT ĐÚNG TUỔI VÀNG 100%, ĐỦ TRỌNG LƯỢNG, BẢO HÀNH LÀM SÁNG TRỌN ĐỜI • THU MUA VÀ THU ĐỔI VÀNG CŨ GIÁ TỐT NHẤT.`}
            <span className="mx-6 text-amber-500">★ ★ ★</span>
            <span>Hotline: {storePhone}</span>
            <span className="mx-6 text-amber-500">★ ★ ★</span>
            <span>Địa chỉ: {storeAddress}</span>
            <span className="mx-6 text-amber-500">★ ★ ★</span>
            <span>Cập nhật: {settings.dataSourceName || 'SJC, PNJ, DOJI'} lúc {settings.lastSyncedAt || 'vừa xong'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
