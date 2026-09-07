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
  RefreshCw
} from 'lucide-react';
import { GoldItem, StoreSettings, UnitType } from '../types';
import { calculateStorePrices, convertPriceByUnit } from '../utils/goldMath';
import { ThemeAtmosphere } from './ThemeAtmosphere';
import { getThemeById } from '../data/themesData';
import { WorldGoldTicker } from './WorldGoldTicker';

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
  
  // Theme & Atmosphere details
  const currentTheme = getThemeById(settings.tvTheme || 'none');
  const effectEnabled = settings.tvThemeEffectEnabled !== false;
  const effectIntensity = settings.tvThemeEffectIntensity || 'normal';
  const showCorners = settings.tvThemeShowCorners !== false;

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
  const storeName = (settings.storeName && settings.storeName.trim() !== '') ? settings.storeName : "TIỆM VÀNG";

  // Dynamic Monogram initials for store crest (handles both retail and corporate names like "Công ty TNHH Vàng Bạc Đức Kỳ" -> "ĐK")
  const getInitials = (name: string) => {
    if (!name) return 'TV';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      const last = words[words.length - 1];
      const secondLast = words[words.length - 2];
      return `${secondLast[0] || ''}${last[0] || ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'TV';
  };

  // Adaptive font size for store / company name to prevent truncation
  const getStoreNameFontSize = (name: string) => {
    const len = name.trim().length;
    if (len <= 16) {
      return "text-lg sm:text-2xl md:text-3xl xl:text-4xl";
    }
    if (len <= 24) {
      return "text-base sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl";
    }
    if (len <= 34) {
      return "text-sm sm:text-base md:text-xl lg:text-xl xl:text-2xl 2xl:text-[27px]";
    }
    return "text-xs sm:text-sm md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl";
  };

  // TV Zoom Scale (100%, 96%, 92%) & TV Safe Margins to fit all TVs (including 40" TV with overscan)
  const currentTvScale = settings.tvScalePercent || 100;
  const isTvSafeMargin = settings.tvSafeMargin !== false;

  const handleCycleTvScale = () => {
    const scales = [100, 96, 92];
    const nextIdx = (scales.indexOf(currentTvScale) + 1) % scales.length;
    const nextScale = scales[nextIdx];
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        tvScalePercent: nextScale
      });
    }
  };

  // Renders a balanced 4-column table:
  // Dynamically adjusts column widths based on single_col vs two_col
  const renderColumnTable = (colItems: typeof visibleItems, columnTitle?: string) => {
    const isSingle = layoutMode === 'single_col';
    const col1Width = isSingle ? 'w-[42%]' : 'w-[40%]';
    const col2Width = isSingle ? 'w-[23%]' : 'w-[23%]';
    const col3Width = isSingle ? 'w-[23%]' : 'w-[23%]';
    const col4Width = isSingle ? 'w-[12%]' : 'w-[14%]';

    return (
      <div className="flex-1 flex flex-col h-full bg-white rounded-xl sm:rounded-2xl border border-neutral-300 shadow-xl ring-1 ring-amber-400/40 overflow-hidden">
        {/* Group header if any */}
        {columnTitle && (
          <div className="px-3 sm:px-4 py-1 bg-neutral-100 border-b border-neutral-200 text-xs sm:text-sm font-black text-neutral-800 uppercase tracking-wider flex items-center justify-between flex-shrink-0">
            <span>{columnTitle}</span>
            <span className="text-xs text-neutral-500 font-bold">{colItems.length} loại</span>
          </div>
        )}

        {/* 4 Column Headers: LOẠI VÀNG (Đỏ chuẩn tiệm vàng) | MUA VÀO | BÁN RA | CHÊNH LỆCH */}
        <div className="flex items-stretch text-white text-xs sm:text-sm md:text-base font-black uppercase tracking-wider flex-shrink-0 bg-[#B91C1C] border-b-2 border-amber-400 shadow-2xs">
          {/* Col 1: LOẠI VÀNG */}
          <div className={`${col1Width} px-2 sm:px-3.5 py-1.5 sm:py-2 flex items-center bg-[#B91C1C]`}>
            <span className="text-xs sm:text-sm md:text-base font-black tracking-wide">LOẠI VÀNG</span>
          </div>

          {/* Col 2: MUA VÀO */}
          <div className={`${col2Width} px-1 py-1.5 sm:py-2 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center items-center`}>
            <div className="leading-tight font-black text-xs sm:text-sm md:text-base text-white">MUA VÀO</div>
            <div className="text-[9px] sm:text-[11px] md:text-xs font-bold text-amber-200 uppercase leading-tight mt-0.5">({getUnitSubtitle()})</div>
          </div>

          {/* Col 3: BÁN RA */}
          <div className={`${col3Width} px-1 py-1.5 sm:py-2 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center items-center`}>
            <div className="leading-tight font-black text-xs sm:text-sm md:text-base text-white">BÁN RA</div>
            <div className="text-[9px] sm:text-[11px] md:text-xs font-bold text-amber-200 uppercase leading-tight mt-0.5">({getUnitSubtitle()})</div>
          </div>

          {/* Col 4: CHÊNH LỆCH */}
          <div className={`${col4Width} px-0.5 py-1.5 sm:py-2 text-center bg-[#B91C1C] border-l border-red-800/80 flex flex-col justify-center items-center`}>
            <div className="leading-tight font-black text-[10px] sm:text-xs md:text-sm text-white">CHÊNH LỆCH</div>
            <div className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-amber-200 lowercase leading-tight mt-0.5 hidden xs:block">(so hôm qua)</div>
          </div>
        </div>

        {/* Row Items - Flex-1 so all rows divide vertical space evenly, zero vertical overflow */}
        <div className="flex-1 min-h-0 flex flex-col justify-between divide-y divide-neutral-200/80 overflow-hidden bg-white">
          {colItems.map((item) => {
            const { finalBuy, finalSell, dailyChangeAmount } = calculateStorePrices(item, settings);
            const isUp = dailyChangeAmount > 0;
            const isDown = dailyChangeAmount < 0;

            return (
              <div 
                key={item.id}
                className="flex items-center flex-1 min-h-0 bg-white hover:bg-neutral-50/80 transition-colors overflow-hidden"
              >
                {/* Col 1: LOẠI VÀNG (Chữ vừa vặn, rõ nét, 1 dòng không bị tràn chèn lên nhau) */}
                <div className={`${col1Width} px-2 sm:px-3 py-0.5 flex items-center gap-1 sm:gap-2 min-w-0 bg-white overflow-hidden`}>
                  <span className="flex-shrink-0 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                    {item.brand}
                  </span>
                  <span 
                    className="font-black text-neutral-950 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg truncate leading-tight"
                    title={item.cleanName}
                  >
                    {item.cleanName}
                  </span>
                </div>

                {/* Col 2: MUA VÀO (Chữ xanh dương hoàng gia, cân đối rõ ràng) */}
                <div className={`${col2Width} px-1 py-0.5 text-center border-l border-neutral-200/80 flex items-center justify-center self-stretch bg-white`}>
                  <div className={`font-black text-[#1D4ED8] tracking-tight font-sans tabular-nums leading-none ${
                    isSingle ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg lg:text-xl xl:text-2xl'
                  }`}>
                    {formatPrice(finalBuy)}
                  </div>
                </div>

                {/* Col 3: BÁN RA (Chữ đỏ ruby, cân đối rõ ràng) */}
                <div className={`${col3Width} px-1 py-0.5 text-center border-l border-neutral-200/80 flex items-center justify-center self-stretch bg-white`}>
                  <div className={`font-black text-[#DC2626] tracking-tight font-sans tabular-nums leading-none ${
                    isSingle ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg lg:text-xl xl:text-2xl'
                  }`}>
                    {formatPrice(finalSell)}
                  </div>
                </div>

                {/* Col 4: CHÊNH LỆCH */}
                <div className={`${col4Width} px-0.5 py-0.5 text-center border-l border-neutral-200/80 flex items-center justify-center self-stretch bg-white`}>
                  {isUp ? (
                    <div className="inline-flex items-center gap-0.5 text-emerald-700 font-black text-xs sm:text-sm lg:text-base leading-none">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>+{formatDailyChange(dailyChangeAmount)}</span>
                    </div>
                  ) : isDown ? (
                    <div className="inline-flex items-center gap-0.5 text-rose-700 font-black text-xs sm:text-sm lg:text-base leading-none">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
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

  const activeTheme = settings.tvTheme || 'tet';
  const getThemeContainerBg = (tId: string) => {
    switch (tId) {
      case 'tet':
        // Soft festive imperial cream with pale rose silk & champagne tint
        return 'bg-gradient-to-b from-[#fff5f5] via-[#fffbf7] to-[#fef2f2] text-neutral-900';
      case 'spring':
        // Xanh lá tre kết hợp với trắng ngọc tinh khôi, nhạt nhạt sang trọng
        return 'bg-gradient-to-b from-[#ebf9ef] via-[#ffffff] to-[#e1f5e6] text-neutral-900';
      case 'summer':
        // Mát dịu: Xanh ngọc biển pha lê nhạt kết hợp trắng nắng mai
        return 'bg-gradient-to-b from-[#f0f9ff] via-[#ffffff] to-[#e0f2fe]/60 text-neutral-900';
      case 'autumn':
        // Thu vàng quý phái nhạt: Hổ phách champagne nhạt kết hợp trắng ngà
        return 'bg-gradient-to-b from-[#fffbeb] via-[#ffffff] to-[#fef3c7]/50 text-neutral-900';
      case 'winter':
        // Đông tuyết trắng tinh khôi nhạt: Bạch kim pha lê kết hợp trắng sương
        return 'bg-gradient-to-b from-[#f8fafc] via-[#ffffff] to-[#f1f5f9] text-neutral-900';
      case 'luxury':
        // Hoàng kim 24K nhạt: Vàng champagne nhạt hoàng gia kết hợp ngọc trai trắng
        return 'bg-gradient-to-b from-[#fffdf5] via-[#ffffff] to-[#fef9c3]/40 text-neutral-900';
      case 'none':
      default:
        return 'bg-[#F8F9FA] text-neutral-900';
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between select-none overflow-hidden ${getThemeContainerBg(activeTheme)} ${
        isTvSafeMargin ? 'p-1 sm:p-2 md:p-2.5' : 'p-0'
      }`}
      style={currentTvScale !== 100 ? {
        transform: `scale(${currentTvScale / 100})`,
        transformOrigin: 'center center',
        width: `${10000 / currentTvScale}%`,
        height: `${10000 / currentTvScale}%`,
        marginLeft: `${(100 - 10000 / currentTvScale) / 2}%`,
        marginTop: `${(100 - 10000 / currentTvScale) / 2}%`
      } : undefined}
    >
      {/* HIỆU ỨNG GIAO DIỆN THEO MÙA: HOA ĐÀO, MAI VÀNG, LÁ XANH, NẮNG HẠ, LÁ PHONG, TUYẾT RƠI */}
      <ThemeAtmosphere
        themeId={settings.tvTheme || 'tet'}
        effectEnabled={effectEnabled}
        intensity={effectIntensity}
        showCorners={showCorners}
        cornerSize={settings.tvThemeCornerSize || 'large'}
      />

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

      {/* 1. TOP MASTER HEADER: Tên Tiệm Vàng (Trái - Luôn hiển thị đầy đủ 100%), Slogan Nổi Bật (Chính Giữa) & Công Cụ (Phải) */}
      <header className="w-full bg-white border-b-2 border-amber-300/80 px-2 sm:px-4 md:px-5 py-1.5 sm:py-2 shadow-xs flex-shrink-0 relative z-40">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4 min-h-[44px] sm:min-h-[48px]">
          
          {/* Left: Brand Crest & Store Name (Ưu tiên hiển thị trọn vẹn, không bao giờ bị cắt xén hay che khuất) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-red-900 rounded-[10px] sm:rounded-[12px] flex items-center justify-center text-amber-300 font-serif font-black text-sm sm:text-lg md:text-xl tracking-wider shadow-inner">
                {getInitials(storeName)}
              </div>
            </div>

            <div className="flex flex-col justify-center min-w-0">
              {/* Dòng 1: Tên Công Ty / Tiệm Vàng to đẹp, hiển thị trọn vẹn 100% không bị che */}
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className={`${getStoreNameFontSize(storeName)} font-black font-serif uppercase tracking-wide text-red-800 leading-tight whitespace-nowrap drop-shadow-2xs`}>
                  {storeName}
                </h1>
                {currentTheme.id !== 'none' && currentTheme.badgeText && (
                  <span className={`hidden 2xl:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${currentTheme.badgeBg} flex-shrink-0 whitespace-nowrap shadow-2xs`}>
                    <span>{currentTheme.icon}</span>
                    <span>{currentTheme.badgeText}</span>
                  </span>
                )}
              </div>
              
              {/* Dòng 2: Địa chỉ, Số hotline */}
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-700 font-bold mt-0.5 whitespace-nowrap">
                <span className="flex items-center gap-1 text-neutral-800">
                  <MapPin className="w-3 h-3 text-red-700 flex-shrink-0" />
                  <span>{storeAddress}</span>
                </span>
                <span className="text-neutral-400 hidden sm:inline flex-shrink-0">•</span>
                <span className="flex items-center gap-1 text-red-800 whitespace-nowrap flex-shrink-0 hidden md:inline-flex">
                  <Phone className="w-3 h-3 text-red-700 flex-shrink-0" />
                  <span>Hotline: {storePhone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: BẢNG KHẨU HIỆU SLOGAN NỔI BẬT CHÍNH GIỮA (Nằm trong luồng Flex, căn giữa không gian, KHÔNG BAO GIỜ đè lên tên hiệu vàng) */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-3 min-w-0">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-950 via-[#991B1B] to-red-950 text-amber-300 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/25 flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <span className="text-amber-300 font-black text-xs sm:text-sm animate-pulse flex-shrink-0">✨</span>
              <span className="font-serif font-black text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl uppercase tracking-widest text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] whitespace-nowrap">
                {settings.slogan || "CHỮ TÍN QUÝ HƠN VÀNG"}
              </span>
              <span className="text-amber-300 font-black text-xs sm:text-sm animate-pulse flex-shrink-0">✨</span>
            </div>
          </div>

          {/* Right: Đồng Hồ, TV Zoom & Nút Cài Đặt Quản Trị */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto z-10">
            {/* Live Clock */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 text-right">
              <div className="text-xs sm:text-sm md:text-base font-black text-neutral-900 tracking-tight font-mono leading-none">
                {timeString}
              </div>
              <div className="text-[9px] text-neutral-500 font-medium capitalize hidden md:block mt-0.5">
                {dateString}
              </div>
            </div>

            {/* TV Fit Scale Toggle (Icon ký hiệu TV tối giản, nhấn để đổi 100% -> 96% -> 92% chống tràn mép) */}
            <button
              type="button"
              onClick={handleCycleTvScale}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center shadow-2xs active:scale-95 flex-shrink-0 relative ${
                currentTvScale !== 100
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border-neutral-300/80'
              }`}
              title={`Chỉnh khung TV: ${currentTvScale}% (Nhấn để chuyển 100% -> 96% -> 92% chống tràn mép TV)`}
              aria-label="Chỉnh khung vừa vặn TV"
            >
              <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {currentTvScale !== 100 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
              )}
            </button>

            {/* Fullscreen TV Toggle (Thu gọn icon nhỏ tinh tế) */}
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border border-neutral-300/80 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-95 flex-shrink-0"
                title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình TV'}
                aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* NÚT RĂNG CƯA CÀI ĐẶT QUẢN LÝ (Tối giản nhất, nhỏ xinh, chỉ có biểu tượng bánh răng) */}
            <button
              type="button"
              onClick={onOpenAdmin}
              title="Cài đặt & Đổi giá (Mã PIN: 1234)"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-700 border border-neutral-300/80 hover:border-red-300 transition-all cursor-pointer flex items-center justify-center shadow-2xs active:scale-90 flex-shrink-0"
              aria-label="Cài đặt tiệm vàng"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 hover:rotate-90 text-neutral-500 hover:text-red-700" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN TV GOLD BOARD (Có lề viền 2 bên chuẩn để câu đối và cành hoa nằm gọn ở 2 viền ngoài, chữ và bảng giá bên trong hoàn toàn thông thoáng) */}
      <main className={`flex-1 min-h-0 w-full px-2.5 sm:px-5 ${
        activeTheme === 'tet' ? 'md:px-24 lg:px-32 xl:px-44 2xl:px-48' : 'md:px-12 lg:px-16 xl:px-20'
      } py-1.5 sm:py-2 overflow-hidden flex flex-col justify-stretch relative z-10`}>
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
          /* Bố cục 1 cột: Toàn bộ danh sách gom thành 1 bảng */
          <div className="h-full max-w-6xl mx-auto w-full overflow-hidden flex flex-col justify-stretch">
            {renderColumnTable(visibleItems)}
          </div>
        ) : (
          /* Bố cục 2 cột: Chuẩn TV 16:9 - 2 cột chia đôi màn hình vừa khít */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 h-full overflow-hidden">
            {renderColumnTable(col1Items, 'Vàng Miếng & Vàng Nhẫn Chuẩn (SJC, PNJ, DOJI)')}
            {renderColumnTable(col2Items, 'Vàng Nữ Trang, Vàng 24K, 18K, 14K, 10K')}
          </div>
        )}
      </main>

      {/* 3. RUNNING MARQUEE TICKER & GÓC GIÁ VÀNG QUỐC TẾ REALTIME (Ở 1 góc gọn gàng không chiếm diện tích) */}
      <footer className="w-full bg-white border-t border-neutral-200/90 py-1 sm:py-1.5 px-2.5 sm:px-4 flex items-center justify-between gap-2 shadow-xs flex-shrink-0 z-20">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 px-2 sm:px-2.5 py-0.5 rounded-md bg-red-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>THÔNG BÁO</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1 min-w-0">
            <div className="inline-block animate-marquee text-xs sm:text-sm font-semibold text-neutral-800 tracking-wide">
              {(settings.marqueeNotice && settings.marqueeNotice.trim())
                ? settings.marqueeNotice
                : `${storeName} KÍNH CHÀO QUÝ KHÁCH • ĐỊA CHỈ: ${storeAddress} • ĐIỆN THOẠI: ${storePhone} • BẢNG GIÁ ĐỒNG BỘ TRỰC TIẾP THEO THỜI GIAN THỰC TỪ SJC, PNJ, DOJI, AAA • CAM KẾT ĐÚNG TUỔI VÀNG 100%, ĐỦ TRỌNG LƯỢNG, BẢO HÀNH LÀM SÁNG TRỌN ĐỜI • THU MUA VÀ THU ĐỔI VÀNG CŨ GIÁ TỐT NHẤT.`
              }
              <span className="mx-6 text-amber-500">★ ★ ★</span>
              <span>Hotline: {storePhone}</span>
              <span className="mx-6 text-amber-500">★ ★ ★</span>
              <span>Địa chỉ: {storeAddress}</span>
              <span className="mx-6 text-amber-500">★ ★ ★</span>
              <span>Cập nhật: {settings.dataSourceName || 'SJC, PNJ, DOJI'} lúc {settings.lastSyncedAt || 'vừa xong'}</span>
            </div>
          </div>
        </div>

        {/* Góc Hiển Thị Giá Vàng Quốc Tế Nhảy Thời Gian Thực (XAU/USD - Investing.com) */}
        {settings.showWorldGoldPrice !== false && (
          <div className="flex-shrink-0 border-l border-neutral-200 pl-2 sm:pl-2.5 ml-1">
            <WorldGoldTicker variant="corner" />
          </div>
        )}
      </footer>

    </div>
  );
};
