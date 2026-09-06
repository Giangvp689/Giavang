import React, { useState } from 'react';
import { 
  Save, 
  RefreshCw, 
  Percent, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calculator
} from 'lucide-react';
import { GoldItem, StoreSettings } from '../types';
import { calculateStorePrices, formatVnd } from '../utils/goldMath';

interface OwnerAdminProps {
  items: GoldItem[];
  settings: StoreSettings;
  onUpdateItems: (items: GoldItem[]) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onRefreshMarket: () => void;
  isRefreshing: boolean;
}

export const OwnerAdmin: React.FC<OwnerAdminProps> = ({
  items,
  settings,
  onUpdateItems,
  onUpdateSettings,
  onRefreshMarket,
  isRefreshing
}) => {
  // Authentication PIN protection (Default: 1234)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Editable local states
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [localItems, setLocalItems] = useState<GoldItem[]>(items);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // New Gold Item Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPurity, setNewItemPurity] = useState<string>('99.99%');
  const [newItemBrand, setNewItemBrand] = useState<'SJC' | 'PNJ' | 'DOJI' | 'AAA' | 'TIỆM'>('TIỆM');
  const [newItemCategory, setNewItemCategory] = useState<'sjc' | 'pnj' | 'doji' | 'aaa' | 'jewelry' | 'custom'>('jewelry');
  const [newItemApiBuy, setNewItemApiBuy] = useState<number>(87000000);
  const [newItemApiSell, setNewItemApiSell] = useState<number>(89000000);
  const [newItemNote, setNewItemNote] = useState<string>('');

  // Handle PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Mã PIN không đúng! (Mã mặc định là: 1234)');
    }
  };

  // Save all settings and items to parent & backend
  const handleSaveAll = () => {
    onUpdateSettings(localSettings);
    onUpdateItems(localItems);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
    }, 3500);
  };

  // Update item field
  const updateItemField = (id: string, field: keyof GoldItem, value: any) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Toggle item visibility
  const toggleItemVisibility = (id: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, visible: !item.visible };
      }
      return item;
    }));
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa loại vàng này khỏi danh sách?')) {
      setLocalItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Add new custom item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GoldItem = {
      id: 'custom-' + Date.now(),
      name: newItemName.trim(),
      purity: newItemPurity,
      brand: newItemBrand,
      category: newItemCategory,
      apiBuy: newItemApiBuy,
      apiSell: newItemApiSell,
      baseBuy: newItemApiBuy,
      baseSell: newItemApiSell,
      prevDayBuy: newItemApiBuy - 200000,
      prevDaySell: newItemApiSell - 200000,
      trend: 'equal',
      changeAmount: 0,
      profitOnBuyPercent: null,
      spreadPercent: null,
      useCustomPrice: false,
      customBuy: null,
      customSell: null,
      visible: true,
      order: localItems.length + 1,
      note: newItemNote.trim()
    };

    setLocalItems(prev => [...prev, newItem]);
    setShowAddModal(false);
    setNewItemName('');
    setNewItemNote('');
  };

  // Presets for owner quick click
  const profitOnBuyPresets = [0, 0.5, 1.0, 1.5, 2.0, 2.5];
  const spreadPresets = [1.0, 1.5, 1.8, 2.0, 2.5, 3.0];

  // PIN Entry Gatekeeper
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full bg-white border-2 border-red-600/30 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-600 flex items-center justify-center text-red-600 mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-red-700 font-serif uppercase tracking-wide">
            KHU VỰC QUẢN TRỊ CHỦ TIỆM
          </h2>
          <p className="text-xs text-neutral-600 mt-1 mb-6 leading-relaxed">
            Vui lòng nhập mã PIN bảo mật để thiết lập tỷ lệ lãi cộng thêm, chênh lệch mua bán và quản lý bảng giá Tiệm Vàng Đức Kỳ.
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Nhập mã PIN (Mặc định: 1234)"
                autoFocus
                className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-300 rounded-xl text-center text-xl font-mono tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
              {pinError && (
                <p className="text-xs text-red-600 mt-2 font-bold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-wide shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Mở Khóa Quản Trị
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
            Mã PIN bảo mật mặc định ban đầu là: <strong className="text-red-700 font-mono">1234</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-neutral-800">

      {/* Save Success Alert */}
      {savedNotification && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-sm">
              Đã lưu thành công! Bảng giá vàng trên TV và máy tính tiền đã được cập nhật đồng bộ ngay lập tức.
            </span>
          </div>
        </div>
      )}

      {/* Top Admin Action Header */}
      <div className="bg-white border-2 border-red-600/20 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-black bg-red-600 text-white uppercase">
              CHỦ TIỆM ĐỨC KỲ
            </span>
            <h2 className="text-lg sm:text-xl font-black text-red-800 font-serif">
              Thiết Lập Tỷ Lệ Lãi & Giá Bán Tự Động
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Dữ liệu gốc được đồng bộ trực tiếp từ: <strong className="text-red-700">{settings.dataSourceName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onRefreshMarket}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Lấy lại giá API</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu & Áp Dụng Ngay Lên TV</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: CORE OWNER FORMULA (User's Exact Requested Feature) */}
      <div className="bg-white border-2 border-red-600 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
            <Percent className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-red-800 font-serif">
              1. Công Thức Tính Giá Tự Động Cho Toàn Tiệm
            </h3>
            <p className="text-xs text-neutral-600">
              Hệ thống tự động lấy giá gốc từ API (SJC, PNJ, DOJI, AAA), cộng thêm % lãi và áp dụng % chênh lệch mua bán để ra giá niêm yết cuối cùng cho khách.
            </p>
          </div>
        </div>

        {/* Formula Visual Box */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 sm:p-4 my-4 flex flex-col md:flex-row items-center justify-around gap-3 text-xs sm:text-sm">
          <div className="text-center">
            <span className="text-neutral-500 font-medium block">Giá Mua Gốc từ API</span>
            <span className="font-mono font-bold text-neutral-800 text-sm">88.500.000 đ</span>
          </div>

          <div className="text-red-600 font-extrabold flex items-center gap-1">
            <ArrowRight className="w-4 h-4 hidden md:inline" />
            <span>+ {localSettings.globalProfitOnBuyPercent}% Lãi</span>
            <ArrowRight className="w-4 h-4 hidden md:inline" />
          </div>

          <div className="text-center bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg">
            <span className="text-emerald-700 font-medium block text-xs">Giá Tiệm Mua Vào</span>
            <span className="font-mono font-black text-emerald-800 text-sm">
              {formatVnd(Math.round(88500000 * (1 + localSettings.globalProfitOnBuyPercent / 100) / 10000) * 10000)} đ
            </span>
          </div>

          <div className="text-red-600 font-extrabold flex items-center gap-1">
            <ArrowRight className="w-4 h-4 hidden md:inline" />
            <span>+ {localSettings.globalSpreadPercent}% Chênh Lệch</span>
            <ArrowRight className="w-4 h-4 hidden md:inline" />
          </div>

          <div className="text-center bg-red-50 border border-red-300 px-3 py-1.5 rounded-lg">
            <span className="text-red-700 font-medium block text-xs">Giá Tiệm Bán Ra Cho Khách</span>
            <span className="font-mono font-black text-red-700 text-sm">
              {formatVnd(Math.round(Math.round(88500000 * (1 + localSettings.globalProfitOnBuyPercent / 100) / 10000) * 10000 * (1 + localSettings.globalSpreadPercent / 100) / 10000) * 10000)} đ
            </span>
          </div>
        </div>

        {/* 2 Sliders & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          
          {/* Step 1: % Lãi cộng thêm vào giá mua API */}
          <div className="bg-white border-2 border-emerald-600/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Bước 1: % Lãi Cộng Thêm Vào Giá Mua API
                </span>
                <span className="text-xs text-neutral-500 font-medium">Đức Kỳ Mua Vào</span>
              </div>

              <p className="text-xs text-neutral-600 mt-1 mb-4 leading-relaxed">
                Tỷ lệ phần trăm cộng thêm vào giá mua từ API (Ví dụ: <strong>1.0%</strong> như bạn muốn).
                Giá Mua Tiệm = Giá API Mua × (1 + <strong>{localSettings.globalProfitOnBuyPercent}%</strong>).
              </p>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {profitOnBuyPresets.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, globalProfitOnBuyPercent: val }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      localSettings.globalProfitOnBuyPercent === val
                        ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-600/30'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                    }`}
                  >
                    +{val}%
                  </button>
                ))}
              </div>

              {/* Slider & Number input */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={localSettings.globalProfitOnBuyPercent}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, globalProfitOnBuyPercent: parseFloat(e.target.value) || 0 }))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-300 rounded-lg px-2.5 py-1 w-24">
                  <input
                    type="number"
                    step="0.1"
                    value={localSettings.globalProfitOnBuyPercent}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, globalProfitOnBuyPercent: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-transparent text-right font-mono font-black text-emerald-800 text-sm focus:outline-none"
                  />
                  <span className="text-xs text-emerald-800 font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200 text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-lg font-medium">
              Đang thiết lập: Cộng thêm <strong className="text-emerald-700 font-bold">+{localSettings.globalProfitOnBuyPercent}%</strong> vào giá mua gốc từ API.
            </div>
          </div>

          {/* Step 2: % Chênh lệch giữa giá mua và giá bán */}
          <div className="bg-white border-2 border-red-600/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-red-800 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-red-600" />
                  Bước 2: % Chênh Lệch Giữa Giá Mua & Bán (Spread %)
                </span>
                <span className="text-xs text-neutral-500 font-medium">Đức Kỳ Bán Ra</span>
              </div>

              <p className="text-xs text-neutral-600 mt-1 mb-4 leading-relaxed">
                Tỷ lệ phần trăm chênh lệch giữa giá mua và giá bán của tiệm (Ví dụ: <strong>2.0%</strong>).
                Giá Bán Tiệm = Giá Mua Tiệm × (1 + <strong>{localSettings.globalSpreadPercent}%</strong>).
              </p>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {spreadPresets.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, globalSpreadPercent: val }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      localSettings.globalSpreadPercent === val
                        ? 'bg-red-600 text-white font-black shadow-xs ring-2 ring-red-600/30'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>

              {/* Slider & Number input */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.1"
                  value={localSettings.globalSpreadPercent}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, globalSpreadPercent: parseFloat(e.target.value) || 0 }))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-300 rounded-lg px-2.5 py-1 w-24">
                  <input
                    type="number"
                    step="0.1"
                    value={localSettings.globalSpreadPercent}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, globalSpreadPercent: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-transparent text-right font-mono font-black text-red-700 text-sm focus:outline-none"
                  />
                  <span className="text-xs text-red-700 font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200 text-xs text-red-900 bg-red-50 p-2.5 rounded-lg font-medium">
              Đang thiết lập: Giá bán ra của tiệm chênh lệch cao hơn giá mua là <strong className="text-red-700 font-bold">{localSettings.globalSpreadPercent}%</strong>.
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: ITEM-BY-ITEM REAL-TIME PREVIEW & INDIVIDUAL OVERRIDES */}
      <div className="bg-white border-2 border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 font-serif flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600" />
              2. Bảng Tính Giá Chi Tiết Từng Loại Vàng (SJC, PNJ, DOJI, AAA, Nữ Trang)
            </h3>
            <p className="text-xs text-neutral-600">
              Kiểm tra trực tiếp giá gốc API và giá sau khi cộng lãi. Bạn có thể ẩn/hiện loại vàng hoặc tự nhập giá cố định nếu cần.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Loại Vàng Riêng Của Tiệm</span>
          </button>
        </div>

        {/* Table of items */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-neutral-100 text-neutral-700 uppercase tracking-wider text-[11px] font-black border-b border-neutral-300">
                <th className="py-3 px-3 text-center w-12">Hiện TV</th>
                <th className="py-3 px-3">Thương Hiệu & Loại Vàng</th>
                <th className="py-3 px-3">Giá Gốc API (đ/lượng)</th>
                <th className="py-3 px-3">Chế Độ Tính</th>
                <th className="py-3 px-3 text-right text-emerald-800">Giá Tiệm Mua (VNĐ)</th>
                <th className="py-3 px-3 text-right text-red-700">Giá Tiệm Bán (VNĐ)</th>
                <th className="py-3 px-3 text-center w-14">Xóa</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200">
              {localItems.map((item) => {
                const { finalBuy, finalSell } = calculateStorePrices(item, localSettings);

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-yellow-50/50 transition-colors ${!item.visible ? 'opacity-45 bg-neutral-100' : 'bg-white'}`}
                  >
                    {/* Visibility Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleItemVisibility(item.id)}
                        title={item.visible ? "Đang hiển thị trên bảng TV (Click để ẩn)" : "Đang ẩn (Click để hiện)"}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          item.visible 
                            ? 'text-red-700 bg-red-50 hover:bg-red-100' 
                            : 'text-neutral-400 bg-neutral-200 hover:text-neutral-700'
                        }`}
                      >
                        {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Name, Brand & Purity */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900">{item.name}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800">
                          {item.brand}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                        <span>Tuổi vàng:</span>
                        <input
                          type="text"
                          value={item.purity}
                          onChange={(e) => updateItemField(item.id, 'purity', e.target.value)}
                          className="w-16 bg-neutral-50 px-1 rounded border border-neutral-300 text-neutral-800 font-mono text-[11px]"
                        />
                      </div>
                    </td>

                    {/* Raw API Rate */}
                    <td className="py-3 px-3 text-neutral-600 font-mono text-xs">
                      <div>Mua: <strong className="text-neutral-900">{formatVnd(item.apiBuy || item.baseBuy)}</strong></div>
                      <div>Bán: <strong className="text-neutral-900">{formatVnd(item.apiSell || item.baseSell)}</strong></div>
                    </td>

                    {/* Pricing Mode Toggle */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!item.useCustomPrice}
                            onChange={(e) => updateItemField(item.id, 'useCustomPrice', e.target.checked)}
                            className="rounded accent-red-600 cursor-pointer"
                          />
                          <span className={item.useCustomPrice ? "text-red-700 font-bold" : "text-neutral-600"}>
                            Tự nhập giá cố định
                          </span>
                        </label>

                        {!item.useCustomPrice && (
                          <span className="text-[11px] text-neutral-500">
                            Theo công thức tiệm (+{localSettings.globalProfitOnBuyPercent}% mua, {localSettings.globalSpreadPercent}% bán)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Final Buy Price */}
                    <td className="py-3 px-3 text-right">
                      {item.useCustomPrice ? (
                        <input
                          type="number"
                          step="10000"
                          value={item.customBuy || finalBuy}
                          onChange={(e) => updateItemField(item.id, 'customBuy', parseFloat(e.target.value) || 0)}
                          className="w-28 bg-emerald-50 border border-emerald-300 rounded px-2 py-1 text-right text-emerald-800 font-mono font-black text-xs"
                        />
                      ) : (
                        <div className="font-mono font-black text-emerald-700 text-sm">
                          {formatVnd(finalBuy)} đ
                        </div>
                      )}
                    </td>

                    {/* Final Sell Price */}
                    <td className="py-3 px-3 text-right">
                      {item.useCustomPrice ? (
                        <input
                          type="number"
                          step="10000"
                          value={item.customSell || finalSell}
                          onChange={(e) => updateItemField(item.id, 'customSell', parseFloat(e.target.value) || 0)}
                          className="w-28 bg-red-50 border border-red-300 rounded px-2 py-1 text-right text-red-700 font-mono font-black text-xs"
                        />
                      ) : (
                        <div className="font-mono font-black text-red-600 text-sm">
                          {formatVnd(finalSell)} đ
                        </div>
                      )}
                    </td>

                    {/* Delete Item */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Xóa loại vàng này"
                        className="p-1 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: STORE INFORMATION & PIN SETTINGS */}
      <div className="bg-white border-2 border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-black text-neutral-900 font-serif flex items-center gap-2">
          <Store className="w-5 h-5 text-red-600" />
          3. Cài Đặt Thông Tin Tiệm & Màn Hình TV
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Tên Tiệm Vàng
            </label>
            <input
              type="text"
              value={localSettings.storeName}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, storeName: e.target.value }))}
              placeholder="TIỆM VÀNG ĐỨC KỲ"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm font-bold focus:border-red-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Khẩu hiệu / Slogan tiệm
            </label>
            <input
              type="text"
              value={localSettings.slogan}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, slogan: e.target.value }))}
              placeholder="UY TÍN TẠO THƯƠNG HIỆU - GIÁ CẢ MINH BẠCH"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Số Điện Thoại / Hotline
            </label>
            <input
              type="text"
              value={localSettings.phone}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="0988.666.888 - 024.3888.9999"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Địa Chỉ Tiệm
            </label>
            <input
              type="text"
              value={localSettings.address}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Số 88 Phố Vàng Bạc, Hoàn Kiếm, Hà Nội"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Dòng Chữ Chạy LED Ở Chân Màn Hình TV (Marquee Ticker)
            </label>
            <textarea
              rows={2}
              value={localSettings.marqueeNotice}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, marqueeNotice: e.target.value }))}
              placeholder="Thông báo chúc mừng, bảo hành và cam kết chất lượng..."
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Đổi Mã PIN Quản Trị (Mặc định: 1234)
            </label>
            <input
              type="text"
              maxLength={8}
              value={localSettings.adminPin}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, adminPin: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-red-700 font-mono font-bold text-sm focus:border-red-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showTrendColumn}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, showTrendColumn: e.target.checked }))}
                className="rounded accent-red-600 cursor-pointer"
              />
              <span>Hiển thị cột Biến Động trong ngày (So với hôm trước)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showSpreadColumn}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, showSpreadColumn: e.target.checked }))}
                className="rounded accent-red-600 cursor-pointer"
              />
              <span>Hiển thị cột Chênh Lệch (Spread)</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-bold cursor-pointer"
          >
            Khóa Cài Đặt (Thoát)
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md active:scale-95 cursor-pointer"
          >
            Lưu Tất Cả Cài Đặt
          </button>
        </div>
      </div>

      {/* Modal: Add New Gold Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border-2 border-red-600 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-lg font-black text-red-800 font-serif">
                Thêm Loại Vàng Mới Vào Bảng Giá
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Tên Loại Vàng *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ví dụ: Vàng Tây 18K Đính Đá, Kiềng Cưới 24K..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Thương Hiệu
                  </label>
                  <select
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:outline-none cursor-pointer"
                  >
                    <option value="TIỆM">Tiệm Đức Kỳ</option>
                    <option value="SJC">SJC</option>
                    <option value="PNJ">PNJ</option>
                    <option value="DOJI">DOJI</option>
                    <option value="AAA">AAA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Tuổi Vàng / Hàm Lượng
                  </label>
                  <input
                    type="text"
                    value={newItemPurity}
                    onChange={(e) => setNewItemPurity(e.target.value)}
                    placeholder="Ví dụ: 99.99%, 75.00%..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 mb-1">
                    Giá Gốc Thu Mua (đ/lượng)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={newItemApiBuy}
                    onChange={(e) => setNewItemApiBuy(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-emerald-300 rounded-xl text-emerald-800 font-mono font-bold text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-700 mb-1">
                    Giá Gốc Bán Ra (đ/lượng)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={newItemApiSell}
                    onChange={(e) => setNewItemApiSell(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-red-300 rounded-xl text-red-700 font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Ghi chú mô tả (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={newItemNote}
                  onChange={(e) => setNewItemNote(e.target.value)}
                  placeholder="Ví dụ: Trang sức vàng cưới Đức Kỳ, bảo hành làm sáng miễn phí..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Thêm Vào Bảng Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
