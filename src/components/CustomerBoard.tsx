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
  Minus,
  Sliders,
  Tv,
  ArrowRight,
  Share2,
  Columns,
  Rows,
  RefreshCw
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
  onUpdateSettings,
  onRefreshMarket,
  isRefreshing = false,
  isFirebaseConnected = false,
  lastSyncedTime = ''
}) => {
  // Real-time live clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Layout mode for TV: checks settings.layoutMode (supports 'single_col' or 'two_col')
  const layoutMode = settings.layoutMode || 'two_col';
  const priceFormat = 'compact';

  // Toggle layout mode between 1 bảng duy nhất and 2 bảng song song
  const handleToggleLayout = () => {
    const nextMode = layoutMode === 'single_col' ? 'two_col' : 'single_col';
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        layoutMode: nextMode
      });
    }
  };

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

  // Format daily change compared to yesterday
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

  const storeAddress = settings.address || "2C Lê Quý Đôn - Sơn Tây - Hà Nội";
  const storePhone = settings.phone || "0985061955";
  const storeName = (settings.storeName && settings.storeName.trim() !== '') ? settings.storeName : "TIỆM VÀNG ĐỨC KỲ";

  // Monogram initials for store crest (e.g., "TIỆM VÀNG ĐỨC KỲ" -> "ĐK")
  const getInitials = (name: string) => {
    if (!name) return 'ĐK';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      const last = words[words.length - 1];
      const secondLast = words[words.length - 2];
      return `${secondLast[0] || ''}${last[0] || ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Renders a balanced 4-column table:
  // Dynamically adjusts column widths based on single_col vs two_col
  const renderColumnTable = (colItems: typeof visibleItems, columnTitle?: string) => {
    const isSingle = layoutMode === 'single_col';
    const col1Width = isSingle ? 'w-[44%]' : 'w-[38%]';
    const col2Width = isSingle ? 'w-[22%]' : 'w-[24%]';
    const col3Width = isSingle ? 'w-[22%]' : 'w-[24%]';
    const col4Width = isSingle ? 'w-[12%]' : 'w-[14%]';

    return (
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
          {/* Col 1: LOẠI VÀNG */}
          <div className={`${col1Width} px-3 sm:px-4 py-2 flex items-center bg-[#B91C1C]`}>
            <span>LOẠI VÀNG</span>
          </div>

          {/* Col 2: MUA VÀO */}
          <div className={`${col2Width} px-1 py-1.5 sm:py-2 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center items-center`}>
            <div className="leading-tight font-black text-xs sm:text-sm text-white">MUA VÀO</div>
            <div className="text-[9px] sm:text-[11px] font-bold text-amber-200 uppercase leading-tight mt-0.5">({getUnitSubtitle()})</div>
          </div>

          {/* Col 3: BÁN RA */}
          <div className={`${col3Width} px-1 py-1.5 sm:py-2 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center items-center`}>
            <div className="leading-tight font-black text-xs sm:text-sm text-white">BÁN RA</div>
            <div className="text-[9px] sm:text-[11px] font-bold text-amber-200 uppercase leading-tight mt-0.5">({getUnitSubtitle()})</div>
          </div>

          {/* Col 4: CHÊNH LỆCH */}
          <div className={`${col4Width} px-0.5 py-1.5 sm:py-2 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center items-center`}>
            <div className="leading-tight font-black text-[10px] sm:text-xs text-white">CHÊNH LỆCH</div>
            <div className="text-[8px] sm:text-[9px] font-bold text-amber-200 lowercase leading-tight mt-0.5 hidden xs:block">(so hôm qua)</div>
          </div>
        </div>

        {/* Row Items */}
        <div className="flex-1 flex flex-col justify-between divide-y divide-neutral-200/80 overflow-y-auto sm:overflow-hidden bg-white">
          {colItems.map((item) => {
            const { finalBuy, finalSell, dailyChangeAmount } = calculateStorePrices(item, settings);
            const isUp = dailyChangeAmount > 0;
            const isDown = dailyChangeAmount < 0;

            return (
              <div 
                key={item.id}
                className="flex items-center flex-1 min-h-[44px] sm:min-h-0 bg-white hover:bg-neutral-50/80 transition-colors"
              >
                {/* Col 1: LOẠI VÀNG (Hiển thị đầy đủ tên, không bị cắt bóp) */}
                <div className={`${col1Width} px-2.5 sm:px-4 py-1.5 flex items-center gap-1.5 sm:gap-2.5 min-w-0 bg-white`}>
                  <span className="flex-shrink-0 text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                    {item.brand}
                  </span>
                  <span 
                    className={`font-black text-neutral-900 leading-snug break-words ${
                      isSingle 
                        ? 'text-xs sm:text-sm lg:text-base xl:text-lg line-clamp-2 sm:line-clamp-1' 
                        : 'text-xs sm:text-sm lg:text-base line-clamp-2 sm:line-clamp-1'
                    }`} 
                    title={item.cleanName}
                  >
                    {item.cleanName}
                  </span>
                </div>

                {/* Col 2: MUA VÀO (Chữ xanh dương hoàng gia, cân đối rõ ràng) */}
                <div className={`${col2Width} px-1 py-1 text-center border-l border-neutral-200/80 flex items-center justify-center self-stretch bg-white`}>
                  <div className={`font-black text-[#1D4ED8] tracking-tight font-sans tabular-nums leading-none ${
                    isSingle ? 'text-lg sm:text-2xl lg:text-3xl' : 'text-base sm:text-xl lg:text-2xl xl:text-3xl'
                  }`}>
                    {formatPrice(finalBuy)}
                  </div>
                </div>

                {/* Col 3: BÁN RA (Chữ đỏ ruby, cân đối rõ ràng) */}
                <div className={`${col3Width} px-1 py-1 text-center border-l border-neutral-200/80 flex items-center justify-center self-stretch bg-white`}>
                  <div className={`font-black text-[#DC2626] tracking-tight font-sans tabular-nums leading-none ${
                    isSingle ? 'text-lg sm:text-2xl lg:text-3xl' : 'text-base sm:text-xl lg:text-2xl xl:text-3xl'
                  }`}>
                    {formatPrice(finalSell)}
                  </div>
                </div>

                {/* Col 4: CHÊNH LỆCH */}
                <div className={`${col4Width} px-0.5 py-1 text-center border-l border-neutral-200/80 flex items-center justify-center self-stretch bg-white`}>
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
                </div>

              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`w-full h-screen max-h-screen flex flex-col justify-between select-none overflow-hidden bg-[#F8F9FA] text-neutral-900 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* 0. SLIM BANNER TRÊN MOBILE DÀNH CHO CHỦ TIỆM ĐỔI GIÁ (Không bị che khuất) */}
      <div className="md:hidden bg-gradient-to-r from-red-900 via-[#B91C1C] to-red-900 text-white px-3 py-1.5 flex items-center justify-between border-b border-amber-400 z-30 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200 truncate">
          <Settings className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Chủ Tiệm Vào Đổi Giá:</span>
        </div>
        <button
          type="button"
          onClick={onOpenAdmin}
          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all flex-shrink-0"
        >
          <span>NHẬP MÃ 1234</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. TOP MASTER HEADER: Tên Tiệm Vàng, Địa Chỉ & Nút Vào Quản Trị */}
      <header className="w-full bg-white border-b-2 border-amber-300/80 px-2 sm:px-6 py-2 shadow-xs flex-shrink-0 z-20">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Crest & Store Name - LUÔN HIỂN THỊ ĐỦ 100% TÊN HIỆU, KHÔNG BAO GIỜ BỊ CẮT XÉN */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-red-900 rounded-[12px] flex items-center justify-center text-amber-300 font-serif font-black text-base sm:text-xl tracking-wider shadow-inner">
                {getInitials(storeName)}
              </div>
            </div>

            <div className="flex flex-col justify-center flex-shrink-0">
              {/* Dòng 1: Tên Tiệm Vàng to đẹp, nổi bật, TUYỆT ĐỐI KHÔNG BỊ TRUNCATE / CẮT CHỮ */}
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black font-serif uppercase tracking-wide sm:tracking-wider text-red-800 leading-tight whitespace-nowrap drop-shadow-2xs">
                  {storeName}
                </h1>
                <span className="hidden 2xl:inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex-shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SJC • PNJ • DOJI • AAA
                </span>
              </div>
              
              {/* Dòng 2: Địa chỉ, Số hotline và huy hiệu */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-700 font-bold mt-0.5">
                <span className="flex items-center gap-1 text-red-950 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
                  <span>{storeAddress}</span>
                </span>
                <span className="text-neutral-300 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-red-800 whitespace-nowrap">
                  <Phone className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
                  <span>Hotline: {storePhone}</span>
                </span>
                <span className="inline-flex 2xl:hidden items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex-shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SJC • PNJ • DOJI
                </span>
              </div>
            </div>
          </div>

          {/* Center: Store Motto (Ẩn khi màn hình chưa cực rộng để nhường trọn không gian cho tên hiệu tiệm vàng) */}
          <div className="hidden 2xl:flex flex-1 items-center justify-center px-3">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-950 via-[#B91C1C] to-red-950 text-amber-300 border-2 border-amber-400 shadow-md">
              <span className="text-amber-400 font-bold text-sm sm:text-base">✦</span>
              <span className="font-serif font-black text-sm sm:text-base lg:text-lg uppercase tracking-widest text-amber-200 drop-shadow-sm whitespace-nowrap">
                {settings.slogan || "CHỮ TÍN QUÝ HƠN VÀNG"}
              </span>
              <span className="text-amber-400 font-bold text-sm sm:text-base">✦</span>
            </div>
          </div>

          {/* Right: Đồng Hồ, Lấy Giá Tự Động, Toàn màn hình TV & Nút Quản Lý Đổi Giá */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Digital Live Clock */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-xl px-2 sm:px-3 py-1 text-right">
              <div className="text-xs sm:text-base font-black text-neutral-900 tracking-tight font-mono leading-none">
                {timeString}
              </div>
              <div className="text-[10px] text-neutral-500 font-medium capitalize hidden sm:block mt-0.5">
                {dateString}
              </div>
            </div>

            {/* NÚT LẤY GIÁ TỰ ĐỘNG SJC • PNJ • DOJI */}
            {onRefreshMarket && (
              <button
                type="button"
                onClick={onRefreshMarket}
                disabled={isRefreshing}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:from-amber-500 active:to-amber-600 text-red-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50 border border-amber-300"
                title="Lấy giá mới nhất trực tiếp từ thị trường (SJC, PNJ, DOJI)"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-red-900 flex-shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-extrabold uppercase hidden md:inline">
                  {isRefreshing ? 'Đang lấy giá...' : 'Lấy Giá Tự Động'}
                </span>
                <span className="font-extrabold uppercase md:hidden">
                  {isRefreshing ? 'Đang lấy...' : 'Lấy Giá'}
                </span>
              </button>
            )}

            {/* Nút Chuyển Đổi 1 BẢNG / 2 BẢNG (1 Chạm) */}
            <button
              type="button"
              onClick={handleToggleLayout}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs border border-neutral-300 active:scale-95 transition-all"
              title={layoutMode === 'single_col' ? "Đang hiện 1 Bảng. Nhấn để chuyển sang 2 Bảng song song" : "Đang hiện 2 Bảng. Nhấn để chuyển sang 1 Bảng to rõ"}
            >
              {layoutMode === 'single_col' ? (
                <>
                  <Columns className="w-3.5 h-3.5 text-red-700" />
                  <span className="font-extrabold uppercase hidden sm:inline">Chuyển 2 Bảng</span>
                  <span className="font-extrabold uppercase sm:hidden">2 Bảng</span>
                </>
              ) : (
                <>
                  <Rows className="w-3.5 h-3.5 text-red-700" />
                  <span className="font-extrabold uppercase hidden sm:inline">Chuyển 1 Bảng</span>
                  <span className="font-extrabold uppercase sm:hidden">1 Bảng</span>
                </>
              )}
            </button>

            {/* Fullscreen TV Toggle */}
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-black items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                title="Bật/tắt toàn màn hình TV"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span className="hidden md:inline font-extrabold uppercase">
                  {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                </span>
              </button>
            )}

            {/* NÚT QUẢN TRỊ & ĐỔI GIÁ (LUÔN HIỆN RÕ RÀNG) */}
            <button
              type="button"
              onClick={onOpenAdmin}
              title="Vào Trang Quản Trị & Đổi Giá (Mã PIN: 1234)"
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border border-amber-400"
            >
              <Settings className="w-4 h-4 text-amber-300" />
              <span className="font-serif uppercase tracking-wider">
                Quản Lý <span className="hidden sm:inline">(1234)</span>
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN TV GOLD BOARD (Khớp vừa vặn màn hình TV, 4 cột cân đối) */}
      <main className="flex-1 min-h-0 w-full p-2 sm:p-3 overflow-hidden flex flex-col justify-stretch">
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
        ) : layoutMode === 'single_col' ? (
          /* Bố cục 1 cột: Toàn bộ danh sách gom thành 1 bảng duy nhất to rõ cực đại */
          <div className="h-full max-w-6xl mx-auto w-full overflow-y-auto sm:overflow-hidden flex flex-col justify-stretch">
            {renderColumnTable(visibleItems)}
          </div>
        ) : (
          /* Bố cục 2 cột: Trên màn hình lớn chia 2 cột song song */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 h-full overflow-y-auto lg:overflow-hidden">
            {renderColumnTable(col1Items, 'Vàng Miếng & Vàng Nhẫn Chuẩn (SJC, PNJ, DOJI)')}
            {renderColumnTable(col2Items, 'Vàng Nữ Trang, Vàng 24K, 18K, 14K, 10K')}
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
