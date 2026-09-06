import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Columns,
  Rows,
  Pencil,
  X,
  AlertTriangle
} from 'lucide-react';
import { GoldItem, StoreSettings, UnitType, GoldBrand, GoldCategory } from '../types';
import { calculateStorePrices, convertPriceByUnit } from '../utils/goldMath';
import { GoldCalculator } from './GoldCalculator';

interface MobileAdminProps {
  items: GoldItem[];
  settings: StoreSettings;
  unit: UnitType;
  onChangeUnit: (unit: UnitType) => void;
  onUpdateItems: (items: GoldItem[]) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onSaveAll?: (items: GoldItem[], settings: StoreSettings) => Promise<boolean> | void;
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
  onSaveAll,
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
  const [savedNotificationText, setSavedNotificationText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const isSettingsDirtyRef = useRef<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<'tv' | 'admin' | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  // Compute initials for store crest
  const getInitials = (name: string) => {
    if (!name) return 'TV';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      const last = words[words.length - 1];
      const secondLast = words[words.length - 2];
      return `${secondLast[0] || ''}${last[0] || ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Safe setter for settings field that marks dirty
  const updateSettingsField = (patch: Partial<StoreSettings>) => {
    isSettingsDirtyRef.current = true;
    setLocalSettings(prev => ({ ...prev, ...patch }));
  };

  // Modal states for adding, editing & deleting gold items
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemBrand, setNewItemBrand] = useState<GoldBrand>('TIỆM');
  const [newItemPurity, setNewItemPurity] = useState<string>('99.99%');
  const [newItemCategory, setNewItemCategory] = useState<GoldCategory>('jewelry');
  const [newItemBuyThousands, setNewItemBuyThousands] = useState<string>('14350');
  const [newItemSellThousands, setNewItemSellThousands] = useState<string>('14850');
  const [newItemVisible, setNewItemVisible] = useState<boolean>(true);

  // Edit item state
  const [editingItem, setEditingItem] = useState<GoldItem | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editBrand, setEditBrand] = useState<GoldBrand>('TIỆM');
  const [editPurity, setEditPurity] = useState<string>('');
  const [editCategory, setEditCategory] = useState<GoldCategory>('jewelry');
  const [editBuyThousands, setEditBuyThousands] = useState<string>('');
  const [editSellThousands, setEditSellThousands] = useState<string>('');
  const [editVisible, setEditVisible] = useState<boolean>(true);

  // Delete confirmation
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<GoldItem | null>(null);

  // Sync with incoming props safely
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    if (!isSettingsDirtyRef.current) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Base URL calculation for sharing
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const tvUrl = `${origin}/?mode=tv`;
  const adminUrl = `${origin}/?mode=admin`;

  // Save all to Cloud Firestore & TV immediately without race conditions
  const handleSave = async () => {
    setIsSaving(true);
    isSettingsDirtyRef.current = false;
    try {
      if (onSaveAll) {
        await onSaveAll(localItems, localSettings);
      } else {
        onUpdateSettings(localSettings);
        onUpdateItems(localItems);
      }
    } catch (err) {
      console.error('Error saving in MobileAdmin:', err);
    } finally {
      setIsSaving(false);
    }

    setSavedNotificationText(`Đã lưu thành công! Thông tin tiệm "${localSettings.storeName || 'Tiệm Vàng'}" và bảng giá đã đồng bộ lên TV.`);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
    }, 3500);
  };

  // Add new gold item
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    const buyThousands = parseFloat(newItemBuyThousands.replace(/[^0-9]/g, '')) || 14000;
    const sellThousands = parseFloat(newItemSellThousands.replace(/[^0-9]/g, '')) || 14500;
    const vndBuyPerLuong = buyThousands * 1000 * 10;
    const vndSellPerLuong = sellThousands * 1000 * 10;

    const newItem: GoldItem = {
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      brand: newItemBrand,
      purity: newItemPurity.trim() || '99.99%',
      category: newItemCategory,
      apiBuy: vndBuyPerLuong,
      apiSell: vndSellPerLuong,
      baseBuy: vndBuyPerLuong,
      baseSell: vndSellPerLuong,
      trend: 'equal',
      changeAmount: 0,
      useCustomPrice: true,
      customBuy: vndBuyPerLuong,
      customSell: vndSellPerLuong,
      visible: newItemVisible,
      order: localItems.length + 1,
      updatedAt: new Date().toISOString()
    };

    const updated = [newItem, ...localItems];
    setLocalItems(updated);
    onUpdateItems(updated);
    setShowAddModal(false);
    setNewItemName('');
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Open Edit Modal with current item data
  const openEditModal = (item: GoldItem) => {
    const { finalBuy, finalSell } = calculateStorePrices(item, localSettings);
    const buyInThousands = Math.round(convertPriceByUnit(finalBuy, 'chi') / 1000);
    const sellInThousands = Math.round(convertPriceByUnit(finalSell, 'chi') / 1000);

    setEditingItem(item);
    setEditName(item.name);
    setEditBrand(item.brand);
    setEditPurity(item.purity);
    setEditCategory(item.category);
    setEditBuyThousands(buyInThousands.toString());
    setEditSellThousands(sellInThousands.toString());
    setEditVisible(item.visible);
  };

  // Save changes to edited item
  const handleSaveEditedItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    const buyThousands = parseFloat(editBuyThousands.replace(/[^0-9]/g, '')) || 14000;
    const sellThousands = parseFloat(editSellThousands.replace(/[^0-9]/g, '')) || 14500;
    const vndBuyPerLuong = buyThousands * 1000 * 10;
    const vndSellPerLuong = sellThousands * 1000 * 10;

    const updated = localItems.map(it => {
      if (it.id !== editingItem.id) return it;
      return {
        ...it,
        name: editName.trim(),
        brand: editBrand,
        purity: editPurity.trim() || it.purity,
        category: editCategory,
        customBuy: vndBuyPerLuong,
        customSell: vndSellPerLuong,
        useCustomPrice: true,
        visible: editVisible,
        updatedAt: new Date().toISOString()
      };
    });

    setLocalItems(updated);
    onUpdateItems(updated);
    setEditingItem(null);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Confirm delete item
  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    const updated = localItems.filter(it => it.id !== deleteConfirmItem.id);
    setLocalItems(updated);
    onUpdateItems(updated);
    if (editingItem?.id === deleteConfirmItem.id) {
      setEditingItem(null);
    }
    setDeleteConfirmItem(null);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Move item up or down for custom TV ordering
  const handleMoveItem = (itemId: string, direction: 'up' | 'down') => {
    const index = localItems.findIndex(it => it.id === itemId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...localItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLocalItems(reordered);
    onUpdateItems(reordered);
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

  // Reset ALL items to automatic market price & switch pricingMode to 'auto_market'
  const handleResetAllToAuto = () => {
    const updatedItems = localItems.map(item => ({
      ...item,
      customBuy: null,
      customSell: null,
      useCustomPrice: false
    }));
    const updatedSettings: StoreSettings = {
      ...localSettings,
      pricingMode: 'auto_market',
      buyAmountDeltaPerChi: 0,
      sellAmountDeltaPerChi: 0
    };
    setLocalItems(updatedItems);
    setLocalSettings(updatedSettings);
    onUpdateItems(updatedItems);
    onUpdateSettings(updatedSettings);
    onRefreshMarket();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
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
              <div className="w-full h-full bg-red-900 rounded-[10px] flex items-center justify-center text-amber-300 font-serif font-black text-xs sm:text-sm">
                {getInitials(localSettings.storeName)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black font-serif uppercase tracking-wider text-red-800 truncate">
                  {localSettings.storeName || "TIỆM VÀNG"}
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
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-between shadow-md animate-fade-in border border-emerald-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
              <span>{savedNotificationText || 'Đã lưu thành công lên TV tại quầy!'}</span>
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
            
            {/* THẺ ĐIỀU KHIỂN: LẤY GIÁ TỰ ĐỘNG TỪ THỊ TRƯỜNG (SJC, DOJI, PNJ) */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-amber-400 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-900 flex-shrink-0">
                    <Radio className="w-4 h-4 text-amber-700 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-neutral-900 uppercase">
                      Lấy Giá Tự Động Thị Trường
                    </h2>
                    <p className="text-[11px] text-neutral-500">
                      SJC • DOJI • PNJ • Bảo Tín Minh Châu
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Trực tiếp</span>
                  </span>
                  <div className="text-[10px] text-neutral-400 font-medium mt-0.5">
                    {localSettings.lastSyncedAt || 'Hôm nay'}
                  </div>
                </div>
              </div>

              {/* Nút bấm lớn: Lấy giá tự động ngay & Khôi phục về giá tự động chuẩn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onRefreshMarket}
                  disabled={isRefreshing}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-red-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all disabled:opacity-50 border border-amber-300"
                >
                  <RefreshCw className={`w-4 h-4 text-red-950 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="uppercase">
                    {isRefreshing ? 'Đang cập nhật giá...' : 'Lấy Giá Tự Động Ngay'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAllToAuto}
                  className="py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-black text-xs flex items-center justify-center gap-1.5 border border-neutral-300 cursor-pointer active:scale-98 transition-all"
                  title="Xóa mọi giá chỉnh tay bị kẹt và đưa toàn bộ bảng giá về giá chuẩn thị trường 100%"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Đồng Bộ Về Chuẩn Tự Động SJC</span>
                </button>
              </div>

              {/* Lựa chọn 3 Chế độ giá: Tự động 100% | Tự động + Chênh lệch | Thủ công */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-[11px] font-black text-neutral-700 block mb-1.5 uppercase">
                  Chế Độ Tính Giá Bảng TV:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const updated: StoreSettings = { ...localSettings, pricingMode: 'auto_market' };
                      setLocalSettings(updated);
                      onUpdateSettings(updated);
                    }}
                    className={`py-2 px-1.5 rounded-xl text-center text-xs font-black cursor-pointer transition-all border ${
                      (localSettings.pricingMode || 'auto_market') === 'auto_market'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">🟢 Tự Động 100%</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Chuẩn giá SJC</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated: StoreSettings = { ...localSettings, pricingMode: 'formula' };
                      setLocalSettings(updated);
                      onUpdateSettings(updated);
                    }}
                    className={`py-2 px-1.5 rounded-xl text-center text-xs font-black cursor-pointer transition-all border ${
                      localSettings.pricingMode === 'formula'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">⚡ Tự Động + Tiệm</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Cộng/trừ chênh lệch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated: StoreSettings = { ...localSettings, pricingMode: 'custom_override' };
                      setLocalSettings(updated);
                      onUpdateSettings(updated);
                    }}
                    className={`py-2 px-1.5 rounded-xl text-center text-xs font-black cursor-pointer transition-all border ${
                      localSettings.pricingMode === 'custom_override'
                        ? 'bg-red-800 text-white border-red-900 shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">✏️ Giá Tự Đặt</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Tiệm gõ thủ công</div>
                  </button>
                </div>
              </div>

              {/* Bộ lọc thương hiệu */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
                <span className="text-[11px] font-bold text-neutral-500 whitespace-nowrap">Lọc:</span>
                {['ALL', 'SJC', 'PNJ', 'DOJI', 'AAA', 'TIỆM'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrandFilter(b)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all ${
                      brandFilter === b
                        ? 'bg-red-800 text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {b === 'ALL' ? 'Tất cả' : b}
                  </button>
                ))}
              </div>

              {/* Chuyển đổi Bố Cục TV: 1 Bảng (Chữ to) hoặc 2 Bảng (Song song) */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-red-700" />
                  <span>Bố Cục Chiếu TV:</span>
                </span>
                <div className="inline-flex rounded-xl bg-neutral-100 p-0.5 border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      const updated: StoreSettings = { ...localSettings, layoutMode: 'single_col' };
                      setLocalSettings(updated);
                      onUpdateSettings(updated);
                    }}
                    className={`px-3 py-1 rounded-lg font-black text-xs flex items-center gap-1 transition-all cursor-pointer ${
                      localSettings.layoutMode === 'single_col'
                        ? 'bg-red-800 text-white shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Rows className="w-3.5 h-3.5" />
                    <span>1 Bảng (Chữ To)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: StoreSettings = { ...localSettings, layoutMode: 'two_col' };
                      setLocalSettings(updated);
                      onUpdateSettings(updated);
                    }}
                    className={`px-3 py-1 rounded-lg font-black text-xs flex items-center gap-1 transition-all cursor-pointer ${
                      localSettings.layoutMode !== 'single_col'
                        ? 'bg-red-800 text-white shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>2 Bảng (Song Song)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Nút Thêm Loại Vàng Mới Nổi Bật */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm border border-amber-400 cursor-pointer active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
                <span className="uppercase tracking-wider">Thêm Loại Vàng Mới</span>
              </button>
              <div className="text-[11px] font-bold text-neutral-500 bg-white px-3 py-3 rounded-2xl border border-neutral-200 flex-shrink-0">
                {filteredItems.length} loại
              </div>
            </div>

            {/* Danh sách từng loại vàng (Thiết kế dạng Card dọc tối ưu điện thoại) */}
            <div className="space-y-2.5">
              {filteredItems.map((item, idx) => {
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
                    {/* Header thẻ vàng: Tên loại vàng + Nút Lên/Xuống + Sửa + Xóa + Ẩn/Hiện */}
                    <div className="flex items-center justify-between gap-1.5 border-b border-neutral-100 pb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 flex-shrink-0">
                          {item.brand}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-neutral-900 truncate leading-snug">
                            {item.name}
                          </h3>
                          <span className="text-[10px] text-neutral-500 font-medium">
                            Tuổi: {item.purity}
                          </span>
                        </div>
                      </div>

                      {/* Nhóm nút quản trị nhanh cho từng loại vàng */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Đổi thứ tự hiển thị */}
                        <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200">
                          <button
                            type="button"
                            onClick={() => handleMoveItem(item.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-25 cursor-pointer"
                            title="Di chuyển lên trên"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(item.id, 'down')}
                            disabled={idx === filteredItems.length - 1}
                            className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-25 cursor-pointer"
                            title="Di chuyển xuống dưới"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Sửa thông tin loại vàng */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Sửa tên, tuổi vàng, thương hiệu"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-800" />
                          <span className="text-[10px] hidden xs:inline">Sửa</span>
                        </button>

                        {/* Xóa loại vàng */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer transition-colors"
                          title="Xóa loại vàng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Công tắc Ẩn/Hiện trên TV */}
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

                    {/* Trạng thái & nút đặt lại giá tự động & Giá thị trường đối chiếu */}
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pt-1 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isCustom ? (
                          <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            <span>Giá tiệm sửa tay</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Tự động theo {item.brand}</span>
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500 font-mono">
                          (Gốc: Mua {Math.round(convertPriceByUnit(item.apiBuy, 'chi') / 1000).toLocaleString('vi-VN')}k / Bán {Math.round(convertPriceByUnit(item.apiSell, 'chi') / 1000).toLocaleString('vi-VN')}k)
                        </span>
                      </div>

                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleResetToAuto(item.id)}
                          className="px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          ↺ Trả về giá tự động
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
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-neutral-900 uppercase flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-red-700" />
                  <span>Thông Tin Tiệm Vàng</span>
                </h3>
                <span className="text-[10px] font-bold text-neutral-500">
                  Hiển thị trên đầu bảng giá TV
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Tên Tiệm Vàng: <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={localSettings.storeName}
                  onChange={(e) => updateSettingsField({ storeName: e.target.value })}
                  placeholder="Ví dụ: TIỆM VÀNG KIM ĐỨC, VÀNG BẠC ĐỨC KỲ..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm font-black text-red-950 focus:border-red-700 focus:outline-hidden bg-amber-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Khẩu Hiệu / Slogan Banner:</label>
                <input
                  type="text"
                  value={localSettings.slogan}
                  onChange={(e) => updateSettingsField({ slogan: e.target.value })}
                  placeholder="Ví dụ: CHỮ TÍN QUÝ HƠN VÀNG, UY TÍN TẠO NIỀM TIN..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-amber-900 focus:border-red-700 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Địa Chỉ Tiệm:</label>
                  <input
                    type="text"
                    value={localSettings.address}
                    onChange={(e) => updateSettingsField({ address: e.target.value })}
                    placeholder="Địa chỉ quầy tiệm vàng..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:border-red-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Số Hotline / Điện Thoại:</label>
                  <input
                    type="text"
                    value={localSettings.phone}
                    onChange={(e) => updateSettingsField({ phone: e.target.value })}
                    placeholder="Số điện thoại liên hệ..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:border-red-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Dòng Chữ Chạy Thông Báo Dưới TV:</label>
                <textarea
                  rows={2}
                  value={localSettings.marqueeNotice}
                  onChange={(e) => updateSettingsField({ marqueeNotice: e.target.value })}
                  placeholder="Dòng thông báo khuyến mãi, chúc mừng chạy ở chân màn hình TV..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:border-red-700 focus:outline-hidden"
                />
              </div>

              {/* Nút lưu thông tin tiệm chuyên dụng ngay trong thẻ cài đặt */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer border border-amber-400"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSaving ? 'ĐANG LƯU LÊN TV...' : `LƯU THÔNG TIN TIỆM "${(localSettings.storeName || 'TIỆM VÀNG').toUpperCase()}"`}
                  </span>
                </button>
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
                      updateSettingsField({ adminPin: val });
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
                      updateSettingsField({ displayUnit: u.id });
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

            {/* Cài đặt Bố Cục Hiển Thị Trên TV: 1 Bảng hay 2 Bảng */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-neutral-900 uppercase flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-red-700" />
                  <span>Bố Cục Hiển Thị Bảng Giá Trên TV</span>
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  {localSettings.layoutMode === 'single_col' ? '1 Bảng Duy Nhất' : '2 Bảng Song Song'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => updateSettingsField({ layoutMode: 'single_col' })}
                  className={`p-3 rounded-2xl text-left cursor-pointer transition-all border-2 ${
                    localSettings.layoutMode === 'single_col'
                      ? 'bg-red-800 text-white border-amber-400 shadow-md'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs uppercase mb-1">
                    <Rows className="w-4 h-4 text-amber-300" />
                    <span>1 Bảng (Chữ To)</span>
                  </div>
                  <p className={`text-[11px] leading-snug ${localSettings.layoutMode === 'single_col' ? 'text-amber-100' : 'text-neutral-500'}`}>
                    Toàn bộ các loại vàng chạy thành 1 danh sách duy nhất. Thích hợp cho quầy cần chữ số to cực đại.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateSettingsField({ layoutMode: 'two_col' })}
                  className={`p-3 rounded-2xl text-left cursor-pointer transition-all border-2 ${
                    localSettings.layoutMode !== 'single_col'
                      ? 'bg-red-800 text-white border-amber-400 shadow-md'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs uppercase mb-1">
                    <Columns className="w-4 h-4 text-amber-300" />
                    <span>2 Bảng (Song Song)</span>
                  </div>
                  <p className={`text-[11px] leading-snug ${localSettings.layoutMode !== 'single_col' ? 'text-amber-100' : 'text-neutral-500'}`}>
                    Chia làm 2 bảng song song (Vàng chuẩn SJC/PNJ/DOJI bên trái, Nữ trang/Vàng tây bên phải).
                  </p>
                </button>
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
            disabled={isSaving}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer border border-amber-400 disabled:opacity-70"
          >
            <Save className="w-5 h-5 text-amber-300" />
            <span>
              {isSaving
                ? 'ĐANG LƯU & ĐỒNG BỘ LÊN TV...'
                : activeTab === 'store'
                  ? 'LƯU THÔNG TIN TIỆM & CẬP NHẬT TV'
                  : 'LƯU GIÁ & CẬP NHẬT LÊN TV NGAY'}
            </span>
          </button>
        </div>
      </footer>

      {/* MODAL 1: THÊM LOẠI VÀNG MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
            {/* Header Modal */}
            <div className="bg-[#B91C1C] text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-400 text-red-950 font-black">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight text-white">Thêm Loại Vàng Mới</h3>
                  <p className="text-[11px] text-amber-200">Thêm sản phẩm vàng mới vào bảng giá tiệm và TV</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung form thêm */}
            <form onSubmit={handleAddItem} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Tên Loại Vàng: <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vàng Nhẫn Trơn 9999, Dây Chuyền 18K..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold focus:border-red-700 focus:outline-hidden"
                />
              </div>

              {/* Thương hiệu */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Thương Hiệu / Nguồn Gốc:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['TIỆM', 'SJC', 'PNJ', 'DOJI', 'AAA'] as GoldBrand[]).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setNewItemBrand(b)}
                      className={`py-2 px-1 rounded-xl font-black text-xs cursor-pointer border transition-all ${
                        newItemBrand === b
                          ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs font-black'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tuổi vàng */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-neutral-800">Tuổi Vàng / Hàm Lượng:</label>
                  <span className="text-[10px] text-neutral-500">Chọn nhanh hoặc nhập</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-1.5">
                  {['99.99%', '99.9%', '75.0%', '68.0%', '61.0%', '58.5%', '41.6%'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewItemPurity(p)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                        newItemPurity === p
                          ? 'bg-red-800 text-white shadow-2xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: 99.99% hoặc 75.0% (18K)"
                  value={newItemPurity}
                  onChange={(e) => setNewItemPurity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold focus:border-red-700 focus:outline-hidden"
                />
              </div>

              {/* Nhóm hiển thị */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Nhóm Hiển Thị Khi Chiếu 2 Cột:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemCategory('sjc')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newItemCategory !== 'jewelry'
                        ? 'bg-red-50 text-red-950 border-red-400 font-black'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    <div className="font-black text-xs">Cột 1: Vàng Chuẩn</div>
                    <div className="text-[10px] text-neutral-500">Vàng miếng, nhẫn tròn trơn chuẩn</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemCategory('jewelry')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newItemCategory === 'jewelry'
                        ? 'bg-red-50 text-red-950 border-red-400 font-black'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    <div className="font-black text-xs">Cột 2: Nữ Trang</div>
                    <div className="text-[10px] text-neutral-500">Nữ trang, vàng tây, 18K, 14K...</div>
                  </button>
                </div>
              </div>

              {/* Giá Mua Vào & Bán Ra */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-200">
                  <label className="block font-black text-blue-900 text-xs mb-1">
                    MUA VÀO (nghìn/chỉ):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={newItemBuyThousands}
                    onChange={(e) => setNewItemBuyThousands(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-blue-300 text-base font-black text-blue-800 text-center font-mono focus:outline-hidden"
                  />
                  <div className="text-[10px] text-blue-600 text-center mt-1">
                    {newItemBuyThousands ? `${parseFloat(newItemBuyThousands).toLocaleString('vi-VN')} nghìn đ/chỉ` : '0 đ'}
                  </div>
                </div>

                <div className="bg-red-50/70 p-2.5 rounded-2xl border border-red-200">
                  <label className="block font-black text-red-900 text-xs mb-1">
                    BÁN RA (nghìn/chỉ):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={newItemSellThousands}
                    onChange={(e) => setNewItemSellThousands(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-red-300 text-base font-black text-red-800 text-center font-mono focus:outline-hidden"
                  />
                  <div className="text-[10px] text-red-600 text-center mt-1">
                    {newItemSellThousands ? `${parseFloat(newItemSellThousands).toLocaleString('vi-VN')} nghìn đ/chỉ` : '0 đ'}
                  </div>
                </div>
              </div>

              {/* Trạng thái hiển thị */}
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-800">Hiển thị lên màn hình TV ngay:</span>
                <input
                  type="checkbox"
                  checked={newItemVisible}
                  onChange={(e) => setNewItemVisible(e.target.checked)}
                  className="w-4 h-4 text-red-700 accent-red-700 rounded cursor-pointer"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Xác Nhận Thêm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA THÔNG TIN CHI TIẾT LOẠI VÀNG */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
            {/* Header Modal */}
            <div className="bg-[#B91C1C] text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-400 text-red-950 font-black">
                  <Pencil className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight text-white">Sửa Loại Vàng</h3>
                  <p className="text-[11px] text-amber-200">{editingItem.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung form sửa */}
            <form onSubmit={handleSaveEditedItem} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Tên Loại Vàng: <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold focus:border-red-700 focus:outline-hidden"
                />
              </div>

              {/* Thương hiệu */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Thương Hiệu:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['TIỆM', 'SJC', 'PNJ', 'DOJI', 'AAA'] as GoldBrand[]).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setEditBrand(b)}
                      className={`py-2 px-1 rounded-xl font-black text-xs cursor-pointer border transition-all ${
                        editBrand === b
                          ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs font-black'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tuổi vàng */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-neutral-800">Tuổi Vàng / Hàm Lượng:</label>
                  <span className="text-[10px] text-neutral-500">Chọn nhanh hoặc nhập</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-1.5">
                  {['99.99%', '99.9%', '75.0%', '68.0%', '61.0%', '58.5%', '41.6%'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditPurity(p)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                        editPurity === p
                          ? 'bg-red-800 text-white shadow-2xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editPurity}
                  onChange={(e) => setEditPurity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold focus:border-red-700 focus:outline-hidden"
                />
              </div>

              {/* Nhóm hiển thị */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Nhóm Cột Khi Chiếu 2 Bảng:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCategory('sjc')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      editCategory !== 'jewelry'
                        ? 'bg-red-50 text-red-950 border-red-400 font-black'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    <div className="font-black text-xs">Cột 1: Vàng Chuẩn</div>
                    <div className="text-[10px] text-neutral-500">Bảng bên trái TV</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCategory('jewelry')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      editCategory === 'jewelry'
                        ? 'bg-red-50 text-red-950 border-red-400 font-black'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    <div className="font-black text-xs">Cột 2: Nữ Trang</div>
                    <div className="text-[10px] text-neutral-500">Bảng bên phải TV</div>
                  </button>
                </div>
              </div>

              {/* Giá Mua Vào & Bán Ra */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-200">
                  <label className="block font-black text-blue-900 text-xs mb-1">
                    MUA VÀO (nghìn/chỉ):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={editBuyThousands}
                    onChange={(e) => setEditBuyThousands(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-blue-300 text-base font-black text-blue-800 text-center font-mono focus:outline-hidden"
                  />
                  <div className="text-[10px] text-blue-600 text-center mt-1">
                    {editBuyThousands ? `${parseFloat(editBuyThousands).toLocaleString('vi-VN')} nghìn đ/chỉ` : '0 đ'}
                  </div>
                </div>

                <div className="bg-red-50/70 p-2.5 rounded-2xl border border-red-200">
                  <label className="block font-black text-red-900 text-xs mb-1">
                    BÁN RA (nghìn/chỉ):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={editSellThousands}
                    onChange={(e) => setEditSellThousands(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-red-300 text-base font-black text-red-800 text-center font-mono focus:outline-hidden"
                  />
                  <div className="text-[10px] text-red-600 text-center mt-1">
                    {editSellThousands ? `${parseFloat(editSellThousands).toLocaleString('vi-VN')} nghìn đ/chỉ` : '0 đ'}
                  </div>
                </div>
              </div>

              {/* Trạng thái hiển thị */}
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-800">Hiển thị lên màn hình TV:</span>
                <input
                  type="checkbox"
                  checked={editVisible}
                  onChange={(e) => setEditVisible(e.target.checked)}
                  className="w-4 h-4 text-red-700 accent-red-700 rounded cursor-pointer"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmItem(editingItem);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XÁC NHẬN XÓA LOẠI VÀNG */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-neutral-900">Xác Nhận Xóa Loại Vàng?</h4>
              <p className="text-xs text-neutral-600 mt-1">
                Bạn có chắc chắn muốn xóa <span className="font-black text-red-700">"{deleteConfirmItem.name}"</span> khỏi bảng giá không?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 text-xs cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs cursor-pointer shadow-md"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
