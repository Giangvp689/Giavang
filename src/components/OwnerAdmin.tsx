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
  Layers, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calculator,
  Tv,
  Coins,
  Settings,
  Sliders,
  DollarSign,
  Info,
  Phone,
  MapPin,
  Clock,
  Radio,
  Globe
} from 'lucide-react';
import { GoldItem, StoreSettings, UnitType } from '../types';
import { calculateStorePrices, formatVnd, convertPriceByUnit } from '../utils/goldMath';
import { WorldGoldTicker } from './WorldGoldTicker';

interface OwnerAdminProps {
  items: GoldItem[];
  settings: StoreSettings;
  unit: UnitType;
  onChangeUnit: (unit: UnitType) => void;
  onUpdateItems: (items: GoldItem[]) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onRefreshMarket: () => void;
  isRefreshing: boolean;
  onBackToBoard: () => void;
  isFirebaseConnected?: boolean;
  lastSyncedTime?: string;
  onOpenCalculator?: () => void;
  onLockAdmin?: () => void;
}

export const OwnerAdmin: React.FC<OwnerAdminProps> = ({
  items,
  settings,
  unit,
  onChangeUnit,
  onUpdateItems,
  onUpdateSettings,
  onRefreshMarket,
  isRefreshing,
  onBackToBoard,
  isFirebaseConnected = false,
  lastSyncedTime = '',
  onOpenCalculator,
  onLockAdmin
}) => {
  // Navigation tabs in Admin
  const [adminTab, setAdminTab] = useState<'pricing' | 'items' | 'store'>('pricing');

  // Local state copy for instant editing & preview before saving
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [localItems, setLocalItems] = useState<GoldItem[]>(items);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // New item modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newBrand, setNewBrand] = useState<'SJC' | 'PNJ' | 'DOJI' | 'AAA' | 'TIỆM'>('TIỆM');
  const [newPurity, setNewPurity] = useState<string>('99.99%');
  const [newCategory, setNewCategory] = useState<'sjc' | 'pnj' | 'doji' | 'aaa' | 'jewelry' | 'custom'>('jewelry');
  const [newBuyPrice, setNewBuyPrice] = useState<number>(88500000);
  const [newSellPrice, setNewSellPrice] = useState<number>(89800000);
  const [newNote, setNewNote] = useState<string>('');

  // Brand filter in items tab
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  // Handle Save all to Firestore and propagate to TV
  const handleSaveAll = () => {
    onUpdateSettings(localSettings);
    onUpdateItems(localItems);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
    }, 3500);
  };

  // Toggle item visibility on TV
  const toggleVisibility = (id: string) => {
    const updated = localItems.map(item => {
      if (item.id === id) {
        return { ...item, visible: !item.visible };
      }
      return item;
    });
    setLocalItems(updated);
    onUpdateItems(updated);
  };

  // Update item custom price
  const updateItemCustomPrice = (id: string, field: 'customBuy' | 'customSell', val: number | null) => {
    const updated = localItems.map(item => {
      if (item.id === id) {
        const isCustom = val !== null || (field === 'customBuy' ? item.customSell !== null : item.customBuy !== null);
        return {
          ...item,
          [field]: val,
          useCustomPrice: isCustom
        };
      }
      return item;
    });
    setLocalItems(updated);
    onUpdateItems(updated);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updated = localItems.filter(item => item.id !== id);
    setLocalItems(updated);
    onUpdateItems(updated);
  };

  // Add new item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: GoldItem = {
      id: 'custom-' + Date.now(),
      name: newName.trim(),
      purity: newPurity,
      brand: newBrand,
      category: newCategory,
      apiBuy: newBuyPrice,
      apiSell: newSellPrice,
      baseBuy: newBuyPrice,
      baseSell: newSellPrice,
      prevDayBuy: newBuyPrice - 100000,
      prevDaySell: newSellPrice - 100000,
      trend: 'equal',
      changeAmount: 0,
      profitOnBuyPercent: null,
      spreadPercent: null,
      useCustomPrice: false,
      customBuy: null,
      customSell: null,
      visible: true,
      order: localItems.length + 1,
      note: newNote.trim()
    };

    const updated = [...localItems, newItem];
    setLocalItems(updated);
    onUpdateItems(updated);
    setShowAddModal(false);
    setNewName('');
    setNewNote('');
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Stepper adjustments for Buy & Sell amount deltas (+/- 10k)
  const adjustDelta = (type: 'buy' | 'sell', deltaChange: number) => {
    setLocalSettings(prev => {
      const field = type === 'buy' ? 'buyAmountDeltaPerChi' : 'sellAmountDeltaPerChi';
      const current = prev[field] ?? (type === 'buy' ? -100000 : 100000);
      const next = current + deltaChange;
      return {
        ...prev,
        calculationType: 'amount_delta',
        [field]: next
      };
    });
  };

  // Quick preset buttons for delta amounts
  const buyPresets = [-50000, -100000, -150000, -200000, 0];
  const sellPresets = [50000, 100000, 150000, 200000, 250000];

  // Demo market item for live calculation preview
  const demoMarketPerLuong = 166000000; // 16.600k / chỉ
  const currentBuyDelta = localSettings.buyAmountDeltaPerChi ?? -100000;
  const currentSellDelta = localSettings.sellAmountDeltaPerChi ?? 100000;

  // Filtered items
  const filteredItems = localItems.filter(item => {
    if (brandFilter === 'ALL') return true;
    if (brandFilter === 'SJC') return item.brand === 'SJC' || item.name.includes('SJC');
    if (brandFilter === 'PNJ') return item.brand === 'PNJ' || item.name.includes('PNJ');
    if (brandFilter === 'DOJI') return item.brand === 'DOJI' || item.name.includes('DOJI');
    if (brandFilter === 'JEWELRY') return item.category === 'jewelry' || item.brand === 'TIỆM';
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-24 sm:pb-8 text-neutral-800 animate-fade-in">
      
      {/* Toast Save Alert */}
      {savedNotification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 flex-shrink-0" />
          <div>
            <div className="font-black text-sm">Đã Lưu & Đồng Bộ Thành Công!</div>
            <div className="text-xs text-emerald-100">Bảng giá trên TV đang hiển thị ngay dữ liệu mới nhất.</div>
          </div>
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <div className="bg-white border-2 border-red-700/30 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Store identity & TV shortcut */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToBoard}
            className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer border border-amber-500"
            title="Quay lại Bảng TV"
          >
            <Tv className="w-4 h-4" />
            <span className="uppercase">Quay Lại Bảng TV</span>
          </button>

          <div className="h-6 w-px bg-neutral-300 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-800 text-white uppercase tracking-wider">
                CHỦ TIỆM VÀNG
              </span>
              <h2 className="text-base sm:text-lg font-black text-red-800 font-serif">
                Trung Tâm Quản Trị & Cài Đặt Toàn Diện
              </h2>
            </div>
            <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
              <span>Mã PIN quản trị: <strong className="text-neutral-800 font-mono font-bold">1234</strong></span>
              <span>•</span>
              {isFirebaseConnected && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  Đồng bộ TV tức thì {lastSyncedTime ? `(${lastSyncedTime})` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onClick={onRefreshMarket}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Lấy giá API mới nhất từ SJC, PNJ, DOJI"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Lấy giá API</span>
          </button>

          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="px-3 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Mở máy tính tiền"
            >
              <Calculator className="w-3.5 h-3.5 text-neutral-700" />
              <span className="hidden sm:inline">Máy tính tiền</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>LƯU & ĐỒNG BỘ LÊN TV</span>
          </button>

          {onLockAdmin && (
            <button
              type="button"
              onClick={onLockAdmin}
              className="p-2 rounded-2xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-700 border border-neutral-300 transition-colors cursor-pointer"
              title="Khóa bảo mật Admin"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex bg-neutral-200/80 p-1.5 rounded-2xl gap-1.5 overflow-x-auto text-xs sm:text-sm font-black">
        <button
          type="button"
          onClick={() => setAdminTab('pricing')}
          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'pricing'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Định Giá & Tính Lãi</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('items')}
          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'items'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Quản Lý Loại Vàng ({localItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('store')}
          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'store'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>3. Cài Đặt TV & Cửa Hàng</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ĐỊNH GIÁ & CÔNG THỨC TÍNH TIỀN (AMOUNT DELTA / PERCENT / ROUNDING)
         ========================================================================= */}
      {adminTab === 'pricing' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Method Selector: Direct Money Difference vs Percentage */}
          <div className="bg-white border-2 border-neutral-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-red-800 font-serif flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-700" />
                  Phương Thức Định Giá Tiệm Vàng
                </h3>
                <p className="text-xs text-neutral-600">
                  Chọn cách tiệm vàng tự động tính giá Mua vào và Bán ra từ giá thị trường API.
                </p>
              </div>

              {/* Mode toggles */}
              <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-300 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, calculationType: 'amount_delta', pricingMode: 'formula' }))}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    (localSettings.calculationType || 'amount_delta') === 'amount_delta'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  Trừ/Cộng tiền trực tiếp (Khuyên dùng)
                </button>
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, calculationType: 'percent', pricingMode: 'formula' }))}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    localSettings.calculationType === 'percent'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  Tính theo % Lãi
                </button>
              </div>
            </div>

            {/* DIRECT MONEY DELTA CARDS (Khuyên dùng cho tiệm vàng: -100k mua, +100k bán) */}
            {(localSettings.calculationType || 'amount_delta') === 'amount_delta' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                
                {/* 1. Mua Vào: Trừ tiền (Ví dụ: -100.000 đ/chỉ) */}
                <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        Giá Mua Vào Của Tiệm
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                        Chênh lệch theo 1 Chỉ
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Tiệm mua lại của khách thấp hơn giá thị trường bao nhiêu tiền (Ví dụ: Trừ <strong>-100.000 đ/chỉ</strong>).
                    </p>
                  </div>

                  {/* Stepper +/- 10k buttons for touch/mobile */}
                  <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-emerald-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => adjustDelta('buy', -10000)}
                      className="w-11 h-11 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-900 font-black text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      title="Giảm 10.000 đ"
                    >
                      -
                    </button>

                    <div className="text-center flex-1">
                      <div className="font-mono font-black text-lg sm:text-xl text-emerald-800">
                        {currentBuyDelta > 0 ? `+${(currentBuyDelta / 1000).toLocaleString('vi-VN')}k` : `${(currentBuyDelta / 1000).toLocaleString('vi-VN')}k`} / chỉ
                      </div>
                      <div className="text-[10px] text-neutral-500 font-bold">
                        {currentBuyDelta === 0 ? 'Bằng giá thị trường' : currentBuyDelta < 0 ? `Trừ ${(Math.abs(currentBuyDelta) / 1000)}k mỗi chỉ` : `Cộng ${(currentBuyDelta / 1000)}k mỗi chỉ`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustDelta('buy', 10000)}
                      className="w-11 h-11 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-900 font-black text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      title="Tăng 10.000 đ"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 mb-1.5 block">Chọn nhanh:</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {buyPresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setLocalSettings(prev => ({ ...prev, buyAmountDeltaPerChi: preset }))}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                            currentBuyDelta === preset
                              ? 'bg-emerald-700 text-white font-black shadow-xs ring-2 ring-emerald-500'
                              : 'bg-white text-neutral-700 hover:bg-emerald-100 border border-neutral-300'
                          }`}
                        >
                          {preset === 0 ? 'Gốc' : `${preset / 1000}k`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Bán Ra: Cộng tiền (Ví dụ: +100.000 đ/chỉ) */}
                <div className="bg-red-50/70 border-2 border-red-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-red-900 uppercase tracking-wide flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-red-700" />
                        Giá Bán Ra Cho Khách
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-200/80 text-red-900">
                        Chênh lệch theo 1 Chỉ
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Tiệm bán ra cao hơn giá thị trường bao nhiêu tiền (Ví dụ: Cộng <strong>+100.000 đ/chỉ</strong>).
                    </p>
                  </div>

                  {/* Stepper +/- 10k buttons for touch/mobile */}
                  <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-red-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => adjustDelta('sell', -10000)}
                      className="w-11 h-11 rounded-xl bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-900 font-black text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      title="Giảm 10.000 đ"
                    >
                      -
                    </button>

                    <div className="text-center flex-1">
                      <div className="font-mono font-black text-lg sm:text-xl text-red-800">
                        {currentSellDelta > 0 ? `+${(currentSellDelta / 1000).toLocaleString('vi-VN')}k` : `${(currentSellDelta / 1000).toLocaleString('vi-VN')}k`} / chỉ
                      </div>
                      <div className="text-[10px] text-neutral-500 font-bold">
                        {currentSellDelta === 0 ? 'Bằng giá thị trường' : currentSellDelta > 0 ? `Cộng ${(currentSellDelta / 1000)}k mỗi chỉ` : `Trừ ${(Math.abs(currentSellDelta) / 1000)}k mỗi chỉ`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustDelta('sell', 10000)}
                      className="w-11 h-11 rounded-xl bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-900 font-black text-xl flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      title="Tăng 10.000 đ"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 mb-1.5 block">Chọn nhanh:</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {sellPresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setLocalSettings(prev => ({ ...prev, sellAmountDeltaPerChi: preset }))}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                            currentSellDelta === preset
                              ? 'bg-red-700 text-white font-black shadow-xs ring-2 ring-red-500'
                              : 'bg-white text-neutral-700 hover:bg-red-100 border border-neutral-300'
                          }`}
                        >
                          +{preset / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* PERCENTAGE MODE */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900 block mb-1">% Lãi cộng vào giá Mua API</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={localSettings.globalProfitOnBuyPercent}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, globalProfitOnBuyPercent: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 accent-emerald-700"
                    />
                    <span className="font-mono font-black text-emerald-800 text-sm w-16 text-right">
                      +{localSettings.globalProfitOnBuyPercent}%
                    </span>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                  <span className="text-xs font-bold text-red-900 block mb-1">% Chênh lệch giữa Mua và Bán</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.5"
                      max="6"
                      step="0.1"
                      value={localSettings.globalSpreadPercent}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, globalSpreadPercent: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 accent-red-700"
                    />
                    <span className="font-mono font-black text-red-800 text-sm w-16 text-right">
                      +{localSettings.globalSpreadPercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE SIMULATION VISUAL BOX */}
            <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-neutral-300 font-medium">Mô Phỏng Trực Tiếp (Ví dụ 1 chỉ thị trường = 16.600k):</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-300">Giá hiển thị thực tế trên màn hình TV cho khách</div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 font-mono">
                <div className="text-center bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700">
                  <span className="text-[10px] text-emerald-400 block font-sans uppercase font-black">Tiệm Mua Lại</span>
                  <span className="text-sm sm:text-base font-black text-emerald-300">
                    {((16600000 + currentBuyDelta) / 1000).toLocaleString('vi-VN')}k
                  </span>
                </div>

                <div className="text-neutral-500 font-bold">➔</div>

                <div className="text-center bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700">
                  <span className="text-[10px] text-red-400 block font-sans uppercase font-black">Tiệm Bán Ra</span>
                  <span className="text-sm sm:text-base font-black text-red-300">
                    {((16600000 + currentSellDelta) / 1000).toLocaleString('vi-VN')}k
                  </span>
                </div>
              </div>
            </div>

            {/* ROUNDING RULES (Làm tròn hàng chục nghìn) */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Quy Tắc Làm Tròn Giá Hàng Chục Nghìn (Áp Dụng Lên Bảng TV)
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                  Ví dụ: 14.897k ➔ 14.900k
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Đảm bảo số tiền trên TV luôn tròn đẹp, không có số lẻ cent, nếu ở số 5 thì giữ nguyên, dưới 5 làm tròn lên 5.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, roundingRule: 'round_up_step_5_10' }))}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    (localSettings.roundingRule || 'round_up_step_5_10') === 'round_up_step_5_10'
                      ? 'bg-red-800 text-white border-red-900 shadow-xs'
                      : 'bg-white text-neutral-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div className="text-xs font-black">Làm tròn bước 5 - 10k</div>
                  <div className="text-[10px] opacity-80 mt-0.5">14.897 ➔ 14.900 (Chuẩn tiệm vàng)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, roundingRule: 'round_up_10' }))}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    localSettings.roundingRule === 'round_up_10'
                      ? 'bg-red-800 text-white border-red-900 shadow-xs'
                      : 'bg-white text-neutral-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div className="text-xs font-black">Làm tròn chẵn 10.000 đ</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Làm tròn lên chục nghìn</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, roundingRule: 'round_none' }))}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    localSettings.roundingRule === 'round_none'
                      ? 'bg-red-800 text-white border-red-900 shadow-xs'
                      : 'bg-white text-neutral-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div className="text-xs font-black">Không làm tròn</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Giữ nguyên số lẻ tính toán</div>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: QUẢN LÝ DANH SÁCH LOẠI VÀNG (ẨN/HIỆN TV, SỬA GIÁ, THÊM, XÓA)
         ========================================================================= */}
      {adminTab === 'items' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Item List Header & Controls */}
          <div className="bg-white border-2 border-neutral-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-red-800 font-serif flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-700" />
                Danh Sách Loại Vàng Hiển Thị Trên Bảng TV ({filteredItems.length}/{localItems.length})
              </h3>
              <p className="text-xs text-neutral-600">
                Bật/tắt biểu tượng <Eye className="w-3.5 h-3.5 inline text-emerald-600" /> để Ẩn hoặc Hiện loại vàng trên TV. Gõ giá trực tiếp nếu muốn giá cố định.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Brand Filter */}
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800 focus:outline-none"
              >
                <option value="ALL">Tất cả thương hiệu</option>
                <option value="SJC">SJC</option>
                <option value="PNJ">PNJ</option>
                <option value="DOJI">DOJI</option>
                <option value="JEWELRY">Nữ trang tiệm</option>
              </select>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Thêm loại vàng</span>
              </button>
            </div>
          </div>

          {/* Gold Item Cards for Mobile & Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const { finalBuy, finalSell } = calculateStorePrices(item, localSettings);
              const isCustom = item.useCustomPrice && (item.customBuy !== null || item.customSell !== null);

              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border-2 transition-all shadow-2xs flex flex-col justify-between gap-3 ${
                    item.visible 
                      ? 'border-neutral-200 hover:border-red-400' 
                      : 'border-neutral-300 bg-neutral-100/70 opacity-60'
                  }`}
                >
                  {/* Card Top: Brand, Name & Eye Toggle */}
                  <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        item.brand === 'SJC' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        item.brand === 'PNJ' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                        item.brand === 'DOJI' ? 'bg-red-100 text-red-900 border border-red-300' :
                        'bg-neutral-200 text-neutral-800'
                      }`}>
                        {item.brand}
                      </span>
                      <div>
                        <div className="text-sm font-extrabold text-neutral-900">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium">
                          Tuổi vàng: {item.purity || '99.99%'}
                        </div>
                      </div>
                    </div>

                    {/* Eye toggle button */}
                    <button
                      type="button"
                      onClick={() => toggleVisibility(item.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        item.visible
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                      }`}
                      title={item.visible ? 'Đang hiện trên TV - Bấm để ẩn' : 'Đang ẩn khỏi TV - Bấm để hiện'}
                    >
                      {item.visible ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-500" />}
                      <span>{item.visible ? 'Hiện TV' : 'Đang Ẩn'}</span>
                    </button>
                  </div>

                  {/* Calculated Prices Display */}
                  <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 font-mono">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-sans font-bold block">Tiệm Mua Vào</span>
                      <div className="text-sm font-black text-emerald-900">
                        {Math.round(finalBuy / 10000).toLocaleString('vi-VN')}k / chỉ
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans">
                        Gốc: {Math.round(item.apiBuy / 10000).toLocaleString('vi-VN')}k
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-red-800 font-sans font-bold block">Tiệm Bán Ra</span>
                      <div className="text-sm font-black text-red-900">
                        {Math.round(finalSell / 10000).toLocaleString('vi-VN')}k / chỉ
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans">
                        Gốc: {Math.round(item.apiSell / 10000).toLocaleString('vi-VN')}k
                      </div>
                    </div>
                  </div>

                  {/* Custom Price Overrides input (optional) */}
                  <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-600">
                      <span className="font-semibold">Nhập giá bán riêng (nếu cần):</span>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            updateItemCustomPrice(item.id, 'customBuy', null);
                            updateItemCustomPrice(item.id, 'customSell', null);
                          }}
                          className="text-[10px] text-red-700 font-bold hover:underline cursor-pointer"
                        >
                          Xóa giá riêng (Dùng công thức chung)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Giá mua riêng..."
                        value={item.customBuy ? item.customBuy / 10000 : ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) * 10000 : null;
                          updateItemCustomPrice(item.id, 'customBuy', val);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-red-600"
                      />

                      <input
                        type="number"
                        placeholder="Giá bán riêng..."
                        value={item.customSell ? item.customSell / 10000 : ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) * 10000 : null;
                          updateItemCustomPrice(item.id, 'customSell', val);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  {/* Card Bottom: Delete */}
                  <div className="flex items-center justify-end border-t border-neutral-100 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-neutral-400 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Xóa loại vàng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: CÀI ĐẶT MÀN HÌNH TV & CỬA HÀNG
         ========================================================================= */}
      {adminTab === 'store' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="bg-white border-2 border-neutral-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-red-800 font-serif flex items-center gap-2">
                <Store className="w-5 h-5 text-red-700" />
                Cài Đặt Màn Hình TV & Thông Tin Cửa Hàng
              </h3>
              <p className="text-xs text-neutral-600">
                Tùy chỉnh bố cục hiển thị TV, đơn vị tính, định dạng số và thông tin liên hệ tiệm vàng.
              </p>
            </div>

            {/* Display Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 border-t border-neutral-100 pt-4">
              
              {/* Unit Type: Chỉ vs Lượng */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" />
                  Đơn Vị Tính Hiển Thị
                </label>
                <p className="text-xs text-neutral-600">
                  Chọn đơn vị vàng hiển thị chính thức trên TV quầy giao dịch.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeUnit('chi');
                      setLocalSettings(prev => ({ ...prev, displayUnit: 'chi' }));
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      unit === 'chi'
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    1 Chỉ (Phổ biến nhất)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeUnit('luong');
                      setLocalSettings(prev => ({ ...prev, displayUnit: 'luong' }));
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      unit === 'luong'
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    1 Lượng (Cây)
                  </button>
                </div>
              </div>

              {/* Layout Mode: 2 Columns vs 1 Column */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-red-600" />
                  Bố Cục Màn Hình TV
                </label>
                <p className="text-xs text-neutral-600">
                  Chuẩn 2 cột chia đôi màn hình 16:9 giúp khách nhìn rõ toàn bộ không cần cuộn.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, tvLayoutMode: 'two_col' }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      (localSettings.tvLayoutMode || 'two_col') === 'two_col'
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    2 Cột Cân Đối (Chuẩn TV 16:9)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, tvLayoutMode: 'single_col' }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      localSettings.tvLayoutMode === 'single_col'
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    1 Cột Đơn Dài
                  </button>
                </div>
              </div>

              {/* World Gold Real-Time Ticker Setting */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    Giá Vàng Thế Giới (XAU/USD - Investing.com Live)
                  </label>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Nhảy giây Realtime
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  Hiển thị tỷ giá vàng giao ngay quốc tế XAU/USD, tăng giảm theo thời gian thực từng giây giống Investing.com trên thanh tiêu đề TV.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, showWorldGoldPrice: true }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      localSettings.showWorldGoldPrice !== false
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    ✓ BẬT Hiển Thị
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, showWorldGoldPrice: false }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      localSettings.showWorldGoldPrice === false
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    ✕ TẮT Hiển Thị
                  </button>
                </div>
                {/* Live Preview of World Gold Ticker */}
                <div className="pt-2">
                  <WorldGoldTicker variant="card" />
                </div>
              </div>

              {/* TV Corner Decoration Size Setting */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Kích Thước Cành Đào / Hoa Văn Góc TV
                </label>
                <p className="text-xs text-neutral-600">
                  Tăng giảm độ to rõ, sắc nét của cành đào, mai vàng, lá mùa ở 2 góc trên màn hình TV.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, tvThemeCornerSize: 'normal' }))}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      localSettings.tvThemeCornerSize === 'normal'
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Vừa Phải
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, tvThemeCornerSize: 'large' }))}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      (!localSettings.tvThemeCornerSize || localSettings.tvThemeCornerSize === 'large')
                        ? 'bg-red-800 text-white shadow-xs ring-2 ring-amber-400'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    To Rõ (Khuyên dùng)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, tvThemeCornerSize: 'extralarge' }))}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      localSettings.tvThemeCornerSize === 'extralarge'
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Cực Đại Siêu To
                  </button>
                </div>
              </div>

            </div>

            {/* Store Information Form */}
            <div className="border-t border-neutral-100 pt-4 space-y-4">
              <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                Thông Tin Tiệm Vàng Hiển Thị Trên TV & Chữ Chạy
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Tên Tiệm Vàng:</label>
                  <input
                    type="text"
                    value={localSettings.storeName}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, storeName: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Số Điện Thoại / Hotline:</label>
                  <input
                    type="text"
                    value={localSettings.phone}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Địa Chỉ Tiệm:</label>
                  <input
                    type="text"
                    value={localSettings.address}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Auto-sync Interval */}
            <div className="border-t border-neutral-100 pt-4">
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Tần Suất Tự Động Làm Mới Giá Từ Thị Trường:
              </label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 30, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, autoSyncIntervalMinutes: mins }))}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (localSettings.autoSyncIntervalMinutes || 15) === mins
                        ? 'bg-red-800 text-white font-black shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    Mỗi {mins} phút
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          STICKY BOTTOM BAR FOR MOBILE: NÚT LƯU LUÔN NỔI BẬT DƯỚI ĐÁY
         ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-red-700/20 p-3 sm:hidden shadow-2xl flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToBoard}
          className="py-2.5 px-3 rounded-xl bg-neutral-100 text-neutral-800 font-extrabold text-xs flex items-center gap-1.5 border border-neutral-300 cursor-pointer"
        >
          <Tv className="w-4 h-4 text-red-700" />
          <span>Về TV</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAll}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 to-red-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer uppercase tracking-wide"
        >
          <Save className="w-4 h-4 text-amber-300" />
          <span>LƯU & ĐỒNG BỘ LÊN TV NGAY</span>
        </button>
      </div>

      {/* MODAL THÊM LOẠI VÀNG MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-red-700/30 overflow-hidden text-neutral-800 animate-scale-up">
            <div className="bg-[#B91C1C] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2 font-black text-sm uppercase font-serif">
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Thêm Loại Vàng Riêng Của Tiệm</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-red-900/60 hover:bg-red-800 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Tên loại vàng (Ví dụ: Vàng Ta 9999 Tiệm):</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nhập tên loại vàng..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-bold text-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Thương hiệu:</label>
                  <select
                    value={newBrand}
                    onChange={(e: any) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="TIỆM">TIỆM</option>
                    <option value="SJC">SJC</option>
                    <option value="PNJ">PNJ</option>
                    <option value="DOJI">DOJI</option>
                    <option value="AAA">AAA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Hàm lượng vàng:</label>
                  <input
                    type="text"
                    value={newPurity}
                    onChange={(e) => setNewPurity(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Giá mua gốc (đ/lượng):</label>
                  <input
                    type="number"
                    value={newBuyPrice}
                    onChange={(e) => setNewBuyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-bold font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Giá bán gốc (đ/lượng):</label>
                  <input
                    type="number"
                    value={newSellPrice}
                    onChange={(e) => setNewSellPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lưu Loại Vàng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
