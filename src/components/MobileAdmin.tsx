import React, { useState } from 'react';
import { 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  Store, 
  Tv, 
  Sliders, 
  DollarSign, 
  Info, 
  Phone, 
  MapPin, 
  Clock, 
  Radio,
  QrCode,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
  Sparkles,
  Calculator,
  ShieldCheck,
  Check,
  Flame,
  ArrowRight
} from 'lucide-react';
import { GoldItem, StoreSettings, UnitType } from '../types';
import { calculateStorePrices, convertPriceByUnit } from '../utils/goldMath';
import { GoldCalculator } from './GoldCalculator';

interface MobileAdminProps {
  items: GoldItem[];
  settings: StoreSettings;
  unit: UnitType;
  onChangeUnit: (unit: UnitType) => void;
  onUpdateItems: (items: GoldItem[]) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onRefreshMarket: () => void;
  isRefreshing: boolean;
  onOpenTV: () => void;
  onLockAdmin: () => void;
  isFirebaseConnected?: boolean;
  lastSyncedTime?: string;
}

export const MobileAdmin: React.FC<MobileAdminProps> = ({
  items,
  settings,
  unit,
  onChangeUnit,
  onUpdateItems,
  onUpdateSettings,
  onRefreshMarket,
  isRefreshing,
  onOpenTV,
  onLockAdmin,
  isFirebaseConnected = false,
  lastSyncedTime = ''
}) => {
  // Mobile active sub-tab: 'pricing' (Đổi giá nhanh) | 'links' (Kết nối TV & Link) | 'store' (Cài đặt) | 'calc' (Máy tính)
  const [activeTab, setActiveTab] = useState<'pricing' | 'links' | 'store' | 'calc'>('pricing');

  // Local working copy of items & settings
  const [localItems, setLocalItems] = useState<GoldItem[]>(items);
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<'tv' | 'admin' | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  // Base URL calculation for sharing
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const tvUrl = `${origin}/?mode=tv`;
  const adminUrl = `${origin}/?mode=admin`;

  // Save all to Cloud Firestore & TV immediately
  const handleSave = () => {
    onUpdateSettings(localSettings);
    onUpdateItems(localItems);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
    }, 3000);
  };

  // Quick adjust price by step (in VND/lượng, 100k/chỉ = 1.000.000 đ/lượng)
  const handleQuickAdjust = (itemId: string, field: 'customBuy' | 'customSell', deltaPerChiInThousands: number) => {
    const deltaVndPerLuong = deltaPerChiInThousands * 1000 * 10;
    
    setLocalItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;

      const { finalBuy, finalSell } = calculateStorePrices(item, localSettings);
      const currentPrice = field === 'customBuy' 
        ? (item.customBuy ?? finalBuy) 
        : (item.customSell ?? finalSell);

      const newPrice = Math.max(1000000, currentPrice + deltaVndPerLuong);

      return {
        ...item,
        [field]: newPrice,
        useCustomPrice: true
      };
    }));
  };

  // Set direct price in nghìn VND/chỉ (e.g. 14360)
  const handleDirectPriceChange = (itemId: string, field: 'customBuy' | 'customSell', rawThousands: string) => {
    const num = parseFloat(rawThousands.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return;
    
    // Convert thousands/chỉ to VND/lượng
    const vndPerLuong = num * 1000 * 10;

    setLocalItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        [field]: vndPerLuong,
        useCustomPrice: true
      };
    }));
  };

  // Reset item to automatic market API price
  const handleResetToAuto = (itemId: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        customBuy: null,
        customSell: null,
        useCustomPrice: false
      };
    }));
  };

  // Toggle item visibility on TV
  const handleToggleVisibility = (itemId: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        visible: !item.visible
      };
    }));
  };

  // Copy link helper
  const handleCopyLink = (type: 'tv' | 'admin', url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(type);
        setTimeout(() => setCopiedLink(null), 2500);
      });
    }
  };

  // Filter items
  const filteredItems = localItems.filter(item => {
    if (brandFilter === 'ALL') return true;
    return item.brand === brandFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-neutral-900 flex flex-col pb-24 selection:bg-red-700 selection:text-white">
      
      {/* 1. TOP HEADER CHO ĐIỆN THOẠI (Không bao giờ bị bóp hình) */}
      <header className="bg-white border-b-2 border-red-700/20 px-3 py-2.5 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand & Store Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xs flex-shrink-0">
              <div className="w-full h-full bg-red-900 rounded-[10px] flex items-center justify-center text-amber-300 font-serif font-black text-sm">
                ĐK
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black font-serif uppercase tracking-wider text-red-800 truncate">
                  {localSettings.storeName || "TIỆM VÀNG ĐỨC KỲ"}
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  Chủ Tiệm
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firebase TV kết nối
                </span>
                {lastSyncedTime && <span>• {lastSyncedTime}</span>}
              </div>
            </div>
          </div>

          {/* Actions: Xem TV & Khóa */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onOpenTV}
              title="Mở Bảng Giá TV"
              className="px-2.5 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Tv className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline uppercase">Xem TV</span>
            </button>

            <button
              type="button"
              onClick={onLockAdmin}
              title="Khóa bảo mật (Đăng xuất)"
              className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-red-700 border border-neutral-300 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Saved Toast Notification */}
        {savedNotification && (
          <div className="mt-2 p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Đã lưu giá thành công! TV tại quầy đang cập nhật tức thì.</span>
            </div>
          </div>
        )}
      </header>

      {/* 2. SUB-NAVIGATION TABS DÀNH CHO MOBILE */}
      <div className="bg-white border-b border-neutral-200 px-2 py-1.5 sticky top-[57px] z-20 shadow-2xs">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
              activeTab === 'pricing'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="truncate">Đổi Giá</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
              activeTab === 'links'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="truncate">Link TV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
              activeTab === 'store'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="truncate">Cài Đặt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
              activeTab === 'calc'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="truncate">Tính Vàng</span>
          </button>
        </div>
      </div>

      {/* 3. NỘI DUNG TỪNG TAB */}
      <main className="flex-1 p-3 max-w-2xl mx-auto w-full">

        {/* TAB 1: ĐỔI GIÁ NHANH TRÊN ĐIỆN THOẠI */}
        {activeTab === 'pricing' && (
          <div className="space-y-3">
            
            {/* Thanh công cụ: Nút lấy giá API mới nhất & Bộ lọc thương hiệu */}
            <div className="bg-white rounded-2xl p-3 border border-neutral-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-neutral-900 uppercase">
                    Chỉnh Giá Vàng Cửa Hàng
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    Đơn vị: <strong className="text-red-700">Nghìn đồng / Chỉ</strong> (Ví dụ 14.360k)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onRefreshMarket}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-red-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-red-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Đang lấy...' : 'Lấy Giá SJC'}</span>
                </button>
              </div>

              {/* Bộ lọc thương hiệu */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['ALL', 'SJC', 'PNJ', 'DOJI', 'AAA', 'TIỆM'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrandFilter(b)}
                    className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all ${
                      brandFilter === b
                        ? 'bg-red-800 text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {b === 'ALL' ? 'Tất cả' : b}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách từng loại vàng (Thiết kế dạng Card dọc tối ưu điện thoại) */}
            <div className="space-y-2.5">
              {filteredItems.map((item) => {
                const { finalBuy, finalSell } = calculateStorePrices(item, localSettings);
                const isCustom = item.useCustomPrice;

                // Value in thousands per chỉ for display/input (vd: 14360)
                const buyInThousands = Math.round(convertPriceByUnit(finalBuy, 'chi') / 1000);
                const sellInThousands = Math.round(convertPriceByUnit(finalSell, 'chi') / 1000);

                return (
                  <div 
                    key={item.id}
                    className={`bg-white rounded-2xl border-2 transition-all p-3 shadow-2xs space-y-2.5 ${
                      !item.visible 
                        ? 'opacity-60 border-neutral-200 bg-neutral-50' 
                        : isCustom 
                          ? 'border-amber-400 bg-amber-50/20' 
                          : 'border-neutral-200'
                    }`}
                  >
                    {/* Header thẻ vàng */}
                    <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 flex-shrink-0">
                          {item.brand}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-neutral-900 truncate leading-snug">
                            {item.name}
                          </h3>
                          <span className="text-[10px] text-neutral-500 font-medium">
                            Tuổi vàng: {item.purity}
                          </span>
                        </div>
                      </div>

                      {/* Công tắc Ẩn/Hiện trên TV */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(item.id)}
                          className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            item.visible
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                          }`}
                          title={item.visible ? 'Đang hiện trên TV (Bấm để ẩn)' : 'Đang ẩn trên TV (Bấm để hiện)'}
                        >
                          {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{item.visible ? 'Hiện TV' : 'Ẩn'}</span>
                        </button>
                      </div>
                    </div>

                    {/* 2 Khối Giá Mua Vào & Bán Ra To Rõ */}
                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* MUA VÀO */}
                      <div className="bg-blue-50/60 rounded-xl p-2 border border-blue-200/80">
                        <div className="flex items-center justify-between text-[11px] font-black text-blue-900 mb-1">
                          <span>MUA VÀO</span>
                          <span className="text-[9px] text-blue-600 font-bold lowercase">nghìn/chỉ</span>
                        </div>

                        {/* Ô nhập số trực tiếp */}
                        <div className="flex items-center bg-white rounded-lg border border-blue-300 px-2 py-1 shadow-2xs">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={buyInThousands.toLocaleString('vi-VN')}
                            onChange={(e) => handleDirectPriceChange(item.id, 'customBuy', e.target.value)}
                            className="w-full text-lg font-black text-blue-700 tracking-tight text-center focus:outline-hidden font-mono"
                          />
                        </div>

                        {/* Các nút bấm nhanh +- 50k, +- 100k */}
                        <div className="grid grid-cols-4 gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customBuy', -100)}
                            className="py-1 rounded bg-white hover:bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200 cursor-pointer text-center"
                          >
                            -100
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customBuy', -50)}
                            className="py-1 rounded bg-white hover:bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200 cursor-pointer text-center"
                          >
                            -50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customBuy', +50)}
                            className="py-1 rounded bg-white hover:bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200 cursor-pointer text-center"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customBuy', +100)}
                            className="py-1 rounded bg-white hover:bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200 cursor-pointer text-center"
                          >
                            +100
                          </button>
                        </div>
                      </div>

                      {/* BÁN RA */}
                      <div className="bg-red-50/60 rounded-xl p-2 border border-red-200/80">
                        <div className="flex items-center justify-between text-[11px] font-black text-red-900 mb-1">
                          <span>BÁN RA</span>
                          <span className="text-[9px] text-red-600 font-bold lowercase">nghìn/chỉ</span>
                        </div>

                        {/* Ô nhập số trực tiếp */}
                        <div className="flex items-center bg-white rounded-lg border border-red-300 px-2 py-1 shadow-2xs">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={sellInThousands.toLocaleString('vi-VN')}
                            onChange={(e) => handleDirectPriceChange(item.id, 'customSell', e.target.value)}
                            className="w-full text-lg font-black text-red-700 tracking-tight text-center focus:outline-hidden font-mono"
                          />
                        </div>

                        {/* Các nút bấm nhanh +- 50k, +- 100k */}
                        <div className="grid grid-cols-4 gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customSell', -100)}
                            className="py-1 rounded bg-white hover:bg-red-100 text-red-800 text-[10px] font-black border border-red-200 cursor-pointer text-center"
                          >
                            -100
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customSell', -50)}
                            className="py-1 rounded bg-white hover:bg-red-100 text-red-800 text-[10px] font-black border border-red-200 cursor-pointer text-center"
                          >
                            -50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customSell', +50)}
                            className="py-1 rounded bg-white hover:bg-red-100 text-red-800 text-[10px] font-black border border-red-200 cursor-pointer text-center"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, 'customSell', +100)}
                            className="py-1 rounded bg-white hover:bg-red-100 text-red-800 text-[10px] font-black border border-red-200 cursor-pointer text-center"
                          >
                            +100
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Trạng thái & nút đặt lại giá tự động */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      {isCustom ? (
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Đang đặt giá riêng thủ công</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Tự động tính theo giá thị trường</span>
                        </div>
                      )}

                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleResetToAuto(item.id)}
                          className="text-xs text-red-700 hover:underline font-bold cursor-pointer"
                        >
                          Quay lại tự động SJC
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: KẾT NỐI TV & 2 ĐƯỜNG LINK RIÊNG BIỆT (Yêu cầu trọng tâm của User) */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            
            {/* Banner Giải thích Luồng Hoạt Động */}
            <div className="bg-gradient-to-r from-red-900 to-[#B91C1C] text-white p-4 rounded-2xl shadow-md border-2 border-amber-400">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h3 className="font-serif font-black text-sm uppercase tracking-wide text-amber-200">
                  Hai Đường Link Riêng Biệt Cho Tiệm Vàng
                </h3>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Hệ thống chia thành 2 đường link độc lập: 
                <strong> Link 1</strong> chiếu trên TV cho khách xem (không bị lẫn nút chỉnh giá). 
                <strong> Link 2</strong> dùng cho điện thoại của Chủ tiệm để đổi giá và cài đặt mọi lúc mọi nơi!
              </p>
            </div>

            {/* CARD 1: ĐƯỜNG LINK CHIẾU TRÊN TV */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-black">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neutral-900 uppercase">
                      1. Đường Link Chiếu TV Khách Xem
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Mở trên Smart TV, màn hình LED hoặc máy tính quầy tiệm
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                  Chuẩn TV 16:9
                </span>
              </div>

              {/* Ô hiển thị URL TV */}
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-700 break-all select-all flex items-center justify-between gap-2">
                <span>{tvUrl}</span>
              </div>

              {/* Các nút hành động cho Link TV */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink('tv', tvUrl)}
                  className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  {copiedLink === 'tv' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink === 'tv' ? 'Đã sao chép!' : 'Sao Chép Link TV'}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenTV}
                  className="py-2.5 px-3 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Mở Xem TV Ngay</span>
                </button>
              </div>

              {/* Mã QR chiếu TV */}
              <div className="pt-2 border-t border-neutral-100 flex items-center gap-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tvUrl)}`} 
                  alt="QR Code TV"
                  className="w-20 h-20 rounded-xl border border-neutral-200 p-1 bg-white shadow-xs flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs text-neutral-600 space-y-1">
                  <p className="font-bold text-neutral-800">Cách cài đặt trên Smart TV:</p>
                  <p>1. Mở trình duyệt web trên Smart TV tiệm vàng.</p>
                  <p>2. Nhập đường link hoặc quét mã QR ở trên.</p>
                  <p>3. Nhấn nút <strong>Toàn màn hình</strong> hoặc F11 để cố định.</p>
                </div>
              </div>
            </div>

            {/* CARD 2: ĐƯỜNG LINK QUẢN LÝ TRÊN ĐIỆN THOẠI */}
            <div className="bg-white rounded-2xl border-2 border-amber-400 p-4 shadow-2xs space-y-3 bg-amber-50/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-red-950 flex items-center justify-center font-black">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neutral-900 uppercase">
                      2. Đường Link Quản Lý Trên Điện Thoại
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Chủ tiệm dùng để đổi giá (Nhập mã 1234)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                  PIN: 1234
                </span>
              </div>

              {/* Ô hiển thị URL Quản lý */}
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-700 break-all select-all flex items-center justify-between gap-2">
                <span>{adminUrl}</span>
              </div>

              {/* Các nút hành động cho Link Điện Thoại */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink('admin', adminUrl)}
                  className="py-2.5 px-3 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  {copiedLink === 'admin' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
                  <span>{copiedLink === 'admin' ? 'Đã sao chép link Điện thoại!' : 'Sao Chép Link Quản Lý (Mở Trên Điện Thoại)'}</span>
                </button>
              </div>

              {/* Mã QR Điện Thoại */}
              <div className="pt-2 border-t border-neutral-100 flex items-center gap-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(adminUrl)}`} 
                  alt="QR Code Admin"
                  className="w-20 h-20 rounded-xl border border-neutral-200 p-1 bg-white shadow-xs flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs text-neutral-600 space-y-1">
                  <p className="font-bold text-neutral-800">Mẹo lưu trên điện thoại:</p>
                  <p>1. Lấy camera điện thoại quét mã QR này.</p>
                  <p>2. Nhập mã PIN <strong>1234</strong>.</p>
                  <p>3. Chọn <strong>"Thêm vào màn hình chính"</strong> để mở như 1 app điện thoại!</p>
                </div>
              </div>
            </div>

            {/* CARD 3: TRẠNG THÁI ĐỒNG BỘ ĐÁM MÂY FIREBASE */}
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-black">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-xs text-emerald-950">
                <p className="font-black uppercase">Đồng Bộ Trực Tiếp Không Cần Refresh</p>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Khi bạn bấm nút <strong>Lưu Giá</strong> trên điện thoại này, màn hình TV tại cửa hàng sẽ tự động cập nhật ngay sau 0.5 giây qua Firebase Firestore!
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CÀI ĐẶT TIỆM & CHÊNH LỆCH LÃI */}
        {activeTab === 'store' && (
          <div className="space-y-3">
            
            {/* Cài đặt thông tin cửa hàng */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-neutral-900 uppercase flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                <Store className="w-4 h-4 text-red-700" />
                <span>Thông Tin Tiệm Vàng</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Tên Tiệm Vàng:</label>
                <input
                  type="text"
                  value={localSettings.storeName}
                  onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold focus:border-red-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Khẩu Hiệu Banner:</label>
                <input
                  type="text"
                  value={localSettings.slogan}
                  onChange={(e) => setLocalSettings({ ...localSettings, slogan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold focus:border-red-700 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Địa Chỉ Tiệm:</label>
                  <input
                    type="text"
                    value={localSettings.address}
                    onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold focus:border-red-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Số Hotline:</label>
                  <input
                    type="text"
                    value={localSettings.phone}
                    onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold focus:border-red-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Dòng Chữ Chạy Thông Báo Dưới TV:</label>
                <textarea
                  rows={2}
                  value={localSettings.marqueeNotice}
                  onChange={(e) => setLocalSettings({ ...localSettings, marqueeNotice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:border-red-700 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Cài đặt bảo mật & Mã PIN */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-neutral-900 uppercase flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                <Lock className="w-4 h-4 text-red-700" />
                <span>Mã PIN Bảo Mật Quản Trị</span>
              </h3>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-neutral-800">Mã PIN Đăng Nhập:</p>
                  <p className="text-[11px] text-neutral-500">Mặc định ban đầu: 1234</p>
                </div>

                <div className="w-28">
                  <input
                    type="text"
                    maxLength={4}
                    value={localSettings.adminPin || '1234'}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setLocalSettings({ ...localSettings, adminPin: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-center font-mono text-base font-black tracking-widest text-red-800 focus:border-red-700 focus:outline-hidden bg-neutral-50"
                  />
                </div>
              </div>
            </div>

            {/* Cài đặt Đơn vị tính hiển thị */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-neutral-900 uppercase flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                <Sliders className="w-4 h-4 text-red-700" />
                <span>Đơn Vị Tính Hiển Thị Trên TV</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'chi' as UnitType, label: 'Chỉ (Phổ biến nhất)' },
                  { id: 'luong' as UnitType, label: 'Lượng / Cây' },
                  { id: 'gam' as UnitType, label: 'Gam' }
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onChangeUnit(u.id);
                      setLocalSettings({ ...localSettings, displayUnit: u.id });
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-black text-center cursor-pointer transition-all ${
                      localSettings.displayUnit === u.id
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: MÁY TÍNH TIỀN VÀNG */}
        {activeTab === 'calc' && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 shadow-2xs">
            <GoldCalculator
              items={localItems}
              settings={localSettings}
            />
          </div>
        )}

      </main>

      {/* 4. THANH NÚT LƯU GIÁ DÍNH DƯỚI CHÂN MÀN HÌNH ĐIỆN THOẠI (Sticky Bottom Action Bar) */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t-2 border-red-700/20 p-3 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer border border-amber-400"
          >
            <Save className="w-5 h-5 text-amber-300" />
            <span>LƯU GIÁ & CẬP NHẬT LÊN TV NGAY</span>
          </button>
        </div>
      </footer>

    </div>
  );
};
