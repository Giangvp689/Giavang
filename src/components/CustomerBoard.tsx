import React, { useState, useEffect } from 'react';
import { 
  Maximize, 
  Minimize, 
  Sparkles, 
  Clock, 
  Settings,
  Calculator,
  RefreshCw,
  Columns2,
  List,
  MapPin,
  Phone,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Sliders,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { GoldItem, StoreSettings, UnitType } from '../types';
import { calculateStorePrices, convertPriceByUnit } from '../utils/goldMath';

interface CustomerBoardProps {
  items: GoldItem[];
  settings: StoreSettings;
  unit: UnitType;
  onChangeUnit: (unit: UnitType) => void;
  onUpdateItems?: (items: GoldItem[]) => void;
  onUpdateSettings?: (settings: StoreSettings) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenAdmin?: () => void;
  onOpenCalculator?: () => void;
  onRefreshMarket?: () => void;
  isRefreshing?: boolean;
}

export const CustomerBoard: React.FC<CustomerBoardProps> = ({
  items,
  settings,
  unit,
  onChangeUnit,
  onUpdateItems,
  onUpdateSettings,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenAdmin,
  onOpenCalculator,
  onRefreshMarket,
  isRefreshing = false
}) => {
  // Real-time live clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Layout mode for TV: 'two_col' (fits 16:9 TV screen without scrolling) vs 'single_col'
  const [layoutMode, setLayoutMode] = useState<'two_col' | 'single_col'>('two_col');
  
  // Number format: 'compact' (e.g. 8.850 nghìn/chỉ) vs 'full' (e.g. 8.850.000)
  const [priceFormat, setPriceFormat] = useState<'compact' | 'full'>('compact');

  // Quick Inline Edit Mode, Quick Add Modal & Settings Modal
  const [isQuickEditMode, setIsQuickEditMode] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'pricing' | 'display' | 'items'>('pricing');
  const [newName, setNewName] = useState<string>('');
  const [newBrand, setNewBrand] = useState<string>('TIỆM');
  const [newPurity, setNewPurity] = useState<string>('99.99%');
  const [newBuyPrice, setNewBuyPrice] = useState<number>(88500000);
  const [newSellPrice, setNewSellPrice] = useState<number>(89800000);

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

  // Split items into 2 columns for TV landscape layout
  const midPoint = Math.ceil(visibleItems.length / 2);
  const col1Items = visibleItems.slice(0, midPoint);
  const col2Items = visibleItems.slice(midPoint);

  // Store contact info from settings or explicit user values
  const storeAddress = settings.address || "2C Lê Quý Đôn - Sơn Tây - Hà Nội";
  const storePhone = settings.phone || "0985061955";

  // Handle Quick Price Change
  const handleQuickChangePrice = (id: string, field: 'customBuy' | 'customSell', value: number) => {
    if (!onUpdateItems) return;
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          useCustomPrice: true,
          [field]: value
        };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  // Handle Quick Delete Item
  const handleQuickDeleteItem = (id: string) => {
    if (!onUpdateItems) return;
    const updated = items.filter(item => item.id !== id);
    onUpdateItems(updated);
  };

  // Handle Toggle Item Visibility
  const handleToggleVisibility = (id: string) => {
    if (!onUpdateItems) return;
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, visible: !item.visible };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  // Handle Update Store Settings
  const handleUpdateStoreSettings = (newSettings: StoreSettings) => {
    if (onUpdateSettings) {
      onUpdateSettings(newSettings);
    }
  };

  // Handle Quick Add Item
  const handleQuickAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !onUpdateItems) return;

    const newItem: GoldItem = {
      id: 'custom-' + Date.now(),
      name: newName.trim(),
      purity: newPurity,
      brand: newBrand,
      category: 'custom',
      apiBuy: newBuyPrice,
      apiSell: newSellPrice,
      baseBuy: newBuyPrice,
      baseSell: newSellPrice,
      prevDayBuy: newBuyPrice - 200000,
      prevDaySell: newSellPrice - 200000,
      trend: 'equal',
      changeAmount: 0,
      profitOnBuyPercent: null,
      spreadPercent: null,
      useCustomPrice: settings.pricingMode === 'custom_override',
      customBuy: newBuyPrice,
      customSell: newSellPrice,
      visible: true,
      order: items.length + 1,
      note: ''
    };

    const updated = [...items, newItem];
    onUpdateItems(updated);
    setShowAddModal(false);
    setNewName('');
  };

  // Renders a balanced 4-column table:
  // LOẠI VÀNG (36%) | MUA VÀO (25%) | BÁN RA (25%) | CHÊNH LỆCH (14%)
  const renderColumnTable = (colItems: typeof visibleItems, columnTitle?: string) => (
    <div className="flex-1 flex flex-col h-full bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
      {/* Optional Sub-header for group categorization */}
      {columnTitle && (
        <div className="px-3 py-1 bg-neutral-100 border-b border-neutral-200 text-[11px] sm:text-xs font-black text-neutral-700 uppercase tracking-wider flex items-center justify-between flex-shrink-0">
          <span>{columnTitle}</span>
          <span className="text-[10px] text-neutral-500 font-bold">{colItems.length} loại</span>
        </div>
      )}

      {/* 4 Column Headers: LOẠI VÀNG (Màu đỏ theo yêu cầu) | MUA VÀO | BÁN RA | CHÊNH LỆCH */}
      <div className="flex items-stretch text-white text-xs sm:text-sm font-black uppercase tracking-wider flex-shrink-0 bg-[#B91C1C] border-b-2 border-amber-400 shadow-2xs">
        {/* Col 1: LOẠI VÀNG (36%) - Màu đỏ chuẩn phong cách tiệm vàng */}
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

      {/* Row Items: Toàn bộ nền màu trắng, phân cách đường kẻ mỏng nhẹ, chỉ đổi màu chữ */}
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
              {/* Col 1: LOẠI VÀNG (Cỡ chữ to đậm rõ nét, nền trắng tinh khôi) */}
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

                {isQuickEditMode && (
                  <button
                    type="button"
                    onClick={() => handleQuickDeleteItem(item.id)}
                    title={`Xóa ${item.cleanName}`}
                    className="p-1 rounded-md bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Col 2: MUA VÀO (Màu nền trắng thôi, chỉ chỉnh màu chữ: Chữ xanh dương hoàng gia đậm) */}
              <div className="w-[25%] px-1 py-1 text-center border-l border-neutral-200/80 flex flex-col justify-center bg-white">
                {isQuickEditMode ? (
                  <div className="px-2">
                    <input
                      type="number"
                      step="10000"
                      value={item.customBuy ?? finalBuy}
                      onChange={(e) => handleQuickChangePrice(item.id, 'customBuy', parseFloat(e.target.value) || 0)}
                      className="w-full bg-blue-50 border-2 border-blue-400 rounded-lg px-2 py-1 text-center font-mono font-black text-base sm:text-lg text-[#1D4ED8] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-[#1D4ED8] tracking-tight font-sans tabular-nums leading-none">
                      {formatPrice(finalBuy)}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#1D4ED8]/75 font-bold uppercase mt-0.5">
                      {getUnitSubtitle()}
                    </div>
                  </>
                )}
              </div>

              {/* Col 3: BÁN RA (Màu nền trắng thôi, chỉ chỉnh màu chữ: Chữ đỏ ruby) */}
              <div className="w-[25%] px-1 py-1 text-center border-l border-neutral-200/80 flex flex-col justify-center bg-white">
                {isQuickEditMode ? (
                  <div className="px-2">
                    <input
                      type="number"
                      step="10000"
                      value={item.customSell ?? finalSell}
                      onChange={(e) => handleQuickChangePrice(item.id, 'customSell', parseFloat(e.target.value) || 0)}
                      className="w-full bg-red-50 border-2 border-red-400 rounded-lg px-2 py-1 text-center font-mono font-black text-base sm:text-lg text-[#DC2626] focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-[#DC2626] tracking-tight font-sans tabular-nums leading-none">
                      {formatPrice(finalSell)}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#DC2626]/75 font-bold uppercase mt-0.5">
                      {getUnitSubtitle()}
                    </div>
                  </>
                )}
              </div>

              {/* Col 4: CHÊNH LỆCH SO VỚI HÔM QUA (Màu nền trắng thôi, chỉ chỉnh màu chữ và ký hiệu) */}
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
      {/* 1. TOP MASTER HEADER: Cực Kỳ Nổi Bật Tên Tiệm Vàng & Địa Chỉ */}
      <header className="w-full bg-white border-b-2 border-amber-300/80 px-3 sm:px-6 py-2 shadow-xs flex-shrink-0 z-20">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Left: Brand Crest & Grand Store Name */}
          <div className="flex items-center gap-3">
            {/* Gold Crest */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-red-900 rounded-[10px] flex items-center justify-center text-amber-300 font-serif font-black text-lg sm:text-xl tracking-wider shadow-inner">
                ĐK
              </div>
            </div>

            {/* Store Name & Store Contact */}
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
              
              {/* Address & Phone Number Prominently Displayed */}
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

          {/* Center: Prestigious Store Motto "CHỮ TÍN QUÝ HƠN VÀNG" */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-950 via-[#B91C1C] to-red-950 text-amber-300 border-2 border-amber-400 shadow-md">
              <span className="text-amber-400 font-bold text-sm sm:text-base hidden sm:inline">✦</span>
              <span className="font-serif font-black text-base sm:text-xl lg:text-2xl xl:text-3xl uppercase tracking-widest text-amber-200 drop-shadow-sm whitespace-nowrap">
                CHỮ TÍN QUÝ HƠN VÀNG
              </span>
              <span className="text-amber-400 font-bold text-sm sm:text-base hidden sm:inline">✦</span>
            </div>
          </div>

          {/* Right: Digital Clock, Fullscreen TV, and Settings (Dấu Răng Cưa ⚙️) */}
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

            {/* Dấu Răng Cưa Cài Đặt (⚙️) - Tinh tế, mở bảng cài đặt toàn diện */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              title="Cài đặt hệ thống, định giá & quản lý loại vàng"
              className="p-2 rounded-xl text-neutral-700 hover:text-red-700 hover:bg-red-50 border border-neutral-300 hover:border-red-400 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Settings className="w-5 h-5 text-neutral-700 hover:text-red-700" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN TV GOLD BOARD (Khớp vừa vặn màn hình TV, 4 cột cân đối) */}
      <main className="flex-1 min-h-0 w-full p-2 sm:p-3 lg:p-3.5 overflow-hidden flex flex-col justify-stretch">
        {visibleItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-neutral-200 text-neutral-500 font-bold text-base gap-3">
            <span>Chưa có loại vàng nào trong danh sách.</span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-red-700 text-white rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm loại vàng ngay</span>
            </button>
          </div>
        ) : layoutMode === 'two_col' ? (
          /* Bố cục 2 cột cân đối: Khớp chuẩn 16:9 TV mà không cần cuộn */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full overflow-hidden">
            {renderColumnTable(col1Items, 'Vàng Miếng & Vàng Nhẫn Chuẩn (SJC, PNJ, DOJI)')}
            {renderColumnTable(col2Items, 'Vàng Nữ Trang, Vàng 24K, 18K, 14K, 10K')}
          </div>
        ) : (
          /* Bố cục 1 cột toàn cảnh */
          <div className="h-full overflow-hidden">
            {renderColumnTable(visibleItems)}
          </div>
        )}
      </main>

      {/* 3. RUNNING MARQUEE TICKER: Chạy chậm hơn mượt mà, đầy đủ địa chỉ và số điện thoại tiệm */}
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

      {/* COMPREHENSIVE SETTINGS MODAL (Mở khi bấm Dấu Răng Cưa ⚙️) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-red-700/20 overflow-hidden animate-fade-in text-neutral-800">
            
            {/* Modal Top Header */}
            <div className="bg-[#B91C1C] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-amber-400 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-red-950 flex items-center justify-center font-black shadow-xs">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base sm:text-lg tracking-wider text-amber-200 uppercase">
                    Cài Đặt Hệ Thống & Định Giá Tiệm Vàng
                  </h3>
                  <p className="text-[11px] text-amber-100 font-medium">
                    {settings.storeName || "TIỆM VÀNG ĐỨC KỲ"} • Khẩu hiệu: CHỮ TÍN QUÝ HƠN VÀNG
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-white transition-colors cursor-pointer"
                title="Đóng cài đặt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 sm:px-6 pt-2 gap-2 flex-shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSettingsActiveTab('pricing')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  settingsActiveTab === 'pricing'
                    ? 'bg-white text-red-800 border-red-700 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
                }`}
              >
                <Sliders className="w-4 h-4 text-red-700" />
                <span>1. Định Giá Mua/Bán & Lãi</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsActiveTab('display')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  settingsActiveTab === 'display'
                    ? 'bg-white text-red-800 border-red-700 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
                }`}
              >
                <Columns2 className="w-4 h-4 text-amber-600" />
                <span>2. Tùy Chọn Màn Hình TV</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsActiveTab('items')}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  settingsActiveTab === 'items'
                    ? 'bg-white text-red-800 border-red-700 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
                }`}
              >
                <List className="w-4 h-4 text-emerald-700" />
                <span>3. Quản Lý Danh Sách Vàng</span>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: ĐỊNH GIÁ & TÍNH LÃI */}
              {settingsActiveTab === 'pricing' && (
                <div className="space-y-5">
                  {/* Calculation Mode Selector */}
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                    <label className="text-xs font-black text-neutral-800 uppercase tracking-wider block mb-2">
                      Chọn Phương Thức Định Giá Tiệm:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Mode A: Amount Delta */}
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateStoreSettings({
                            ...settings,
                            calculationType: 'amount_delta',
                            pricingMode: 'formula'
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          (settings.calculationType || 'amount_delta') === 'amount_delta' && settings.pricingMode !== 'custom_override'
                            ? 'bg-red-50 border-red-600 text-red-950 shadow-xs ring-2 ring-red-600/30'
                            : 'bg-white border-neutral-300 hover:bg-neutral-100/80 text-neutral-700'
                        }`}
                      >
                        <div className="font-black text-xs sm:text-sm flex items-center justify-between">
                          <span>Nhập Tiền Chênh Lệch</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-200/60 text-red-800 font-bold">Khuyên dùng</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1">
                          Mua vào trừ tiền, Bán ra cộng tiền (Ví dụ: 16.600 &rarr; Mua 16.500)
                        </p>
                      </button>

                      {/* Mode B: Percent */}
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateStoreSettings({
                            ...settings,
                            calculationType: 'percent',
                            pricingMode: 'formula'
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          settings.calculationType === 'percent' && settings.pricingMode !== 'custom_override'
                            ? 'bg-red-50 border-red-600 text-red-950 shadow-xs ring-2 ring-red-600/30'
                            : 'bg-white border-neutral-300 hover:bg-neutral-100/80 text-neutral-700'
                        }`}
                      >
                        <div className="font-black text-xs sm:text-sm">
                          Tính Theo Tỷ Lệ %
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1">
                          Mua vào trừ % lãi, Bán ra cộng % chênh lệch so với giá API
                        </p>
                      </button>

                      {/* Mode C: Custom Override */}
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateStoreSettings({
                            ...settings,
                            pricingMode: 'custom_override'
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          settings.pricingMode === 'custom_override'
                            ? 'bg-red-50 border-red-600 text-red-950 shadow-xs ring-2 ring-red-600/30'
                            : 'bg-white border-neutral-300 hover:bg-neutral-100/80 text-neutral-700'
                        }`}
                      >
                        <div className="font-black text-xs sm:text-sm">
                          Tự Nhập Giá Trực Tiếp
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1">
                          Gõ giá Mua/Bán cố định theo ý muốn cho từng loại vàng
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Mode-Specific Inputs */}
                  {settings.pricingMode === 'custom_override' ? (
                    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
                      <div className="font-black text-sm flex items-center gap-1.5 text-amber-900">
                        <Edit3 className="w-4 h-4 text-amber-700" />
                        Chế Độ Tự Nhập Giá Trực Tiếp Lên Bảng
                      </div>
                      <p>
                        Bảng TV đang hiển thị theo mức giá bạn tự nhập cho từng loại vàng. Bạn có thể sang tab <strong>3. Quản Lý Danh Sách Vàng</strong> để nhập giá mua vào và bán ra cho từng món.
                      </p>
                    </div>
                  ) : (settings.calculationType || 'amount_delta') === 'amount_delta' ? (
                    /* Amount Delta Mode Inputs */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Buy Delta: Mua vào trừ tiền */}
                        <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-4 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                              <Minus className="w-4 h-4 text-emerald-600" />
                              Mức Trừ Giá Mua Vào
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                              Tiệm Mua Vào
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600">
                            Số tiền trừ đi so với giá thị trường khi tiệm mua vào (nghìn đồng / chỉ).
                          </p>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="10"
                              value={settings.buyAmountDeltaPerChi ?? 100}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdateStoreSettings({
                                  ...settings,
                                  buyAmountDeltaPerChi: val
                                });
                              }}
                              className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 text-emerald-900 font-mono font-black text-base focus:outline-none focus:border-emerald-600"
                            />
                            <span className="text-xs font-bold text-neutral-600 whitespace-nowrap">nghìn/chỉ</span>
                          </div>

                          {/* Quick presets */}
                          <div className="flex flex-wrap gap-1.5">
                            {[50, 100, 150, 200].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  handleUpdateStoreSettings({
                                    ...settings,
                                    buyAmountDeltaPerChi: preset
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  (settings.buyAmountDeltaPerChi ?? 100) === preset
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                                }`}
                              >
                                -{preset}k
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sell Delta: Bán ra cộng tiền */}
                        <div className="bg-white border-2 border-red-500/40 rounded-2xl p-4 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                              <Plus className="w-4 h-4 text-red-600" />
                              Mức Cộng Giá Bán Ra
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-900">
                              Tiệm Bán Ra
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600">
                            Số tiền cộng thêm vào giá thị trường khi tiệm bán ra (nghìn đồng / chỉ).
                          </p>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="10"
                              value={settings.sellAmountDeltaPerChi ?? 100}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdateStoreSettings({
                                  ...settings,
                                  sellAmountDeltaPerChi: val
                                });
                              }}
                              className="w-full bg-red-50 border border-red-300 rounded-xl px-3 py-2 text-red-900 font-mono font-black text-base focus:outline-none focus:border-red-600"
                            />
                            <span className="text-xs font-bold text-neutral-600 whitespace-nowrap">nghìn/chỉ</span>
                          </div>

                          {/* Quick presets */}
                          <div className="flex flex-wrap gap-1.5">
                            {[50, 100, 150, 200].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  handleUpdateStoreSettings({
                                    ...settings,
                                    sellAmountDeltaPerChi: preset
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  (settings.sellAmountDeltaPerChi ?? 100) === preset
                                    ? 'bg-red-600 text-white border-red-700'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                                }`}
                              >
                                +{preset}k
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Visual Simulation */}
                      <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-center justify-around gap-3">
                        <div className="text-center">
                          <span className="text-neutral-500 font-bold block text-[11px]">Giá Thị Trường Ví Dụ</span>
                          <span className="font-mono font-black text-neutral-900 text-sm">16.600.000 đ</span>
                        </div>
                        <div className="text-emerald-700 font-black text-sm text-center">
                          <span className="text-[11px] font-bold block text-emerald-800">Tiệm Mua Vào (-{(settings.buyAmountDeltaPerChi ?? 100)}k)</span>
                          <span className="font-mono text-base">{(16600 - (settings.buyAmountDeltaPerChi ?? 100)).toLocaleString('vi-VN')}.000 đ</span>
                        </div>
                        <div className="text-red-700 font-black text-sm text-center">
                          <span className="text-[11px] font-bold block text-red-800">Tiệm Bán Ra (+{(settings.sellAmountDeltaPerChi ?? 100)}k)</span>
                          <span className="font-mono text-base">{(16600 + (settings.sellAmountDeltaPerChi ?? 100)).toLocaleString('vi-VN')}.000 đ</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Percent Mode Inputs */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Buy Discount % */}
                        <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-4 shadow-2xs space-y-3">
                          <span className="text-xs font-black text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                            <Minus className="w-4 h-4 text-emerald-600" />
                            % Trừ Khi Tiệm Mua Vào
                          </span>
                          <p className="text-xs text-neutral-600">
                            Chiết khấu trừ đi từ giá API khi mua vào để tiệm có lãi (ví dụ: -0.8% hoặc -1.0%).
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={settings.buyDiscountPercent ?? 0.8}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdateStoreSettings({
                                  ...settings,
                                  buyDiscountPercent: val
                                });
                              }}
                              className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 text-emerald-900 font-mono font-black text-base focus:outline-none focus:border-emerald-600"
                            />
                            <span className="text-xs font-bold text-neutral-600">%</span>
                          </div>
                        </div>

                        {/* Sell Margin % */}
                        <div className="bg-white border-2 border-red-500/40 rounded-2xl p-4 shadow-2xs space-y-3">
                          <span className="text-xs font-black text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-red-600" />
                            % Cộng Khi Tiệm Bán Ra
                          </span>
                          <p className="text-xs text-neutral-600">
                            Tỷ lệ phần trăm cộng thêm khi bán ra cho khách (ví dụ: +1.5% hoặc +2.0%).
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={settings.sellMarginPercent ?? 1.5}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdateStoreSettings({
                                  ...settings,
                                  sellMarginPercent: val
                                });
                              }}
                              className="w-full bg-red-50 border border-red-300 rounded-xl px-3 py-2 text-red-900 font-mono font-black text-base focus:outline-none focus:border-red-600"
                            />
                            <span className="text-xs font-bold text-neutral-600">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rounding Rule */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                    <span className="text-xs font-black text-neutral-800 uppercase tracking-wider block">
                      Quy Tắc Làm Tròn Giá (Hàng Chục Nghìn):
                    </span>
                    <p className="text-xs text-neutral-600">
                      Ví dụ: 14.897 nghìn làm tròn thành 14.900 nghìn. Nếu ở số 5 thì giữ nguyên, dưới 5 cũng làm tròn lên 5.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateStoreSettings({
                            ...settings,
                            roundingRule: 'round_up_step_5_10'
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          (settings.roundingRule || 'round_up_step_5_10') === 'round_up_step_5_10'
                            ? 'bg-red-700 text-white border-red-800 shadow-xs'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="font-black">Làm tròn bước 5 - 10</div>
                        <div className="text-[10px] opacity-85 mt-0.5">14897 &rarr; 14900 (Chuẩn tiệm)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateStoreSettings({
                            ...settings,
                            roundingRule: 'round_up_10'
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          settings.roundingRule === 'round_up_10'
                            ? 'bg-red-700 text-white border-red-800 shadow-xs'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="font-black">Làm tròn chẵn 10.000 đ</div>
                        <div className="text-[10px] opacity-85 mt-0.5">Lên hàng chục nghìn</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateStoreSettings({
                            ...settings,
                            roundingRule: 'round_none'
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          settings.roundingRule === 'round_none'
                            ? 'bg-red-700 text-white border-red-800 shadow-xs'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="font-black">Không làm tròn</div>
                        <div className="text-[10px] opacity-85 mt-0.5">Giữ nguyên số lẻ</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TÙY CHỌN MÀN HÌNH TV */}
              {settingsActiveTab === 'display' && (
                <div className="space-y-5 text-xs">
                  {/* Unit Option */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-black text-sm text-neutral-800 block">Đơn Vị Tính Hiển Thị Trên TV</span>
                      <p className="text-neutral-500 text-xs mt-0.5">Chọn hiển thị theo đơn vị Chỉ hoặc Lượng</p>
                    </div>

                    <div className="flex items-center bg-white rounded-xl p-1 border border-neutral-300 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onChangeUnit('chi')}
                        className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
                          unit === 'chi'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        1 Chỉ (nghìn/chỉ)
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeUnit('luong')}
                        className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
                          unit === 'luong'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        1 Lượng (triệu/lượng)
                      </button>
                    </div>
                  </div>

                  {/* Layout Option */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-black text-sm text-neutral-800 block">Bố Cục Bảng Giá TV</span>
                      <p className="text-neutral-500 text-xs mt-0.5">2 Cột chuẩn tỉ lệ 16:9 không bị cuộn màn hình</p>
                    </div>

                    <div className="flex items-center bg-white rounded-xl p-1 border border-neutral-300 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setLayoutMode('two_col')}
                        className={`px-3 py-2 rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          layoutMode === 'two_col'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        <Columns2 className="w-4 h-4" />
                        <span>2 Cột TV (Khớp 16:9)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLayoutMode('single_col')}
                        className={`px-3 py-2 rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          layoutMode === 'single_col'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span>1 Cột Toàn Cảnh</span>
                      </button>
                    </div>
                  </div>

                  {/* Price Format Option */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-black text-sm text-neutral-800 block">Định Dạng Chữ Số</span>
                      <p className="text-neutral-500 text-xs mt-0.5">Số gọn (8.850) hoặc số đầy đủ (8.850.000 VNĐ)</p>
                    </div>

                    <div className="flex items-center bg-white rounded-xl p-1 border border-neutral-300 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setPriceFormat('compact')}
                        className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
                          priceFormat === 'compact'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        Số Gọn (8.850)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceFormat('full')}
                        className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
                          priceFormat === 'full'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        Đầy Đủ (8.850.000)
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Tools */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {onRefreshMarket && (
                      <button
                        type="button"
                        onClick={() => {
                          onRefreshMarket();
                        }}
                        disabled={isRefreshing}
                        className="p-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-black flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 text-red-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Lấy Lại Giá API Mới Nhất</span>
                      </button>
                    )}

                    {onOpenCalculator && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowSettingsModal(false);
                          onOpenCalculator();
                        }}
                        className="p-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Calculator className="w-4 h-4 text-amber-700" />
                        <span>Mở Tiện Ích Máy Tính Tiền Vàng</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: QUẢN LÝ LOẠI VÀNG */}
              {settingsActiveTab === 'items' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <div>
                      <span className="font-black text-sm text-neutral-900 block">Danh Sách Loại Vàng Hiển Thị Trên TV</span>
                      <span className="text-neutral-500 text-xs">Tổng cộng: {items.length} loại vàng</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Loại Vàng Mới</span>
                    </button>
                  </div>

                  {/* Items Table */}
                  <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="max-h-72 overflow-y-auto divide-y divide-neutral-200">
                      {items.map((item) => (
                        <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              {item.brand}
                            </span>
                            <div>
                              <span className="font-black text-neutral-900 text-xs sm:text-sm block truncate">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-medium">
                                Tuổi: {item.purity} • Gốc Mua: {formatPrice(item.apiBuy || item.baseBuy)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Toggle Visibility */}
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(item.id)}
                              title={item.visible ? "Đang hiện trên TV (Click để ẩn)" : "Đang ẩn (Click để hiện)"}
                              className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                item.visible
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200'
                              }`}
                            >
                              {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            {/* Delete Item */}
                            <button
                              type="button"
                              onClick={() => handleQuickDeleteItem(item.id)}
                              title="Xóa loại vàng này"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-300 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Footer */}
            <div className="border-t border-neutral-200 bg-neutral-50 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onOpenAdmin();
                  }}
                  className="text-xs text-red-700 hover:underline font-black flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-red-700" />
                  <span>Vào Trang Quản Trị Đầy Đủ (Mã PIN: 1234) &rarr;</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Lưu & Áp Dụng Ngay Lên Bảng TV</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUICK ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-neutral-300 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-black text-red-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-700" />
                Thêm Loại Vàng Mới Vào Bảng TV
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Tên Loại Vàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vàng Nhẫn Tròn 999.9, Nữ trang 610..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 font-bold focus:outline-none focus:border-red-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Thương Hiệu</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-2 text-neutral-900 font-bold focus:outline-none"
                  >
                    <option value="TIỆM">TIỆM</option>
                    <option value="SJC">SJC</option>
                    <option value="PNJ">PNJ</option>
                    <option value="DOJI">DOJI</option>
                    <option value="AAA">AAA</option>
                    <option value="BTMC">BTMC</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Tuổi Vàng</label>
                  <input
                    type="text"
                    value={newPurity}
                    onChange={(e) => setNewPurity(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-2 text-neutral-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Giá Mua Vào (đ/lượng)</label>
                  <input
                    type="number"
                    step="10000"
                    value={newBuyPrice}
                    onChange={(e) => setNewBuyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-2 text-emerald-900 font-mono font-black text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-red-700 block mb-1">Giá Bán Ra (đ/lượng)</label>
                  <input
                    type="number"
                    step="10000"
                    value={newSellPrice}
                    onChange={(e) => setNewSellPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-red-50 border border-red-300 rounded-lg px-2.5 py-2 text-red-700 font-mono font-black text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Thêm Vào Bảng Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
