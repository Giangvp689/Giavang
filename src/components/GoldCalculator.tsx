import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Receipt, 
  Copy, 
  Check, 
  Printer, 
  Coins,
  Sparkles
} from 'lucide-react';
import { GoldItem, StoreSettings } from '../types';
import { calculateStorePrices, CHI_PER_LUONG, GRAMS_PER_CHI, formatVnd } from '../utils/goldMath';

interface GoldCalculatorProps {
  items: GoldItem[];
  settings: StoreSettings;
  selectedItemInitial?: GoldItem | null;
}

interface CartItem {
  id: string;
  goldItemId: string;
  action: 'buy' | 'sell'; // 'buy' = store sells to customer, 'sell' = customer sells to store
  weightChi: number; // in Chỉ
  laborFee: number; // Tiền công
  stoneFee: number; // Tiền đá
  note: string;
}

export const GoldCalculator: React.FC<GoldCalculatorProps> = ({
  items,
  settings,
  selectedItemInitial
}) => {
  const visibleItems = items.filter(i => i.visible);

  // Active calculator line items
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'item-1',
      goldItemId: selectedItemInitial ? selectedItemInitial.id : (visibleItems[0]?.id || 'sjc-1l'),
      action: 'buy',
      weightChi: 1.0, // 1 chỉ
      laborFee: 200000,
      stoneFee: 0,
      note: 'Nhẫn vàng nữ trang'
    }
  ]);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Add line item
  const handleAddItem = (action: 'buy' | 'sell' = 'buy') => {
    setCart(prev => [
      ...prev,
      {
        id: 'item-' + Date.now(),
        goldItemId: visibleItems[0]?.id || 'sjc-1l',
        action,
        weightChi: 1.0,
        laborFee: action === 'buy' ? 200000 : 0,
        stoneFee: 0,
        note: ''
      }
    ]);
  };

  // Remove line item
  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Update line item
  const updateCartItem = (id: string, field: keyof CartItem, value: any) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, [field]: value };
      }
      return i;
    }));
  };

  // Calculate totals
  let totalCustomerPays = 0; // Total customer pays to store for purchased items
  let totalCustomerReceives = 0; // Total store pays customer for traded-in items
  let totalLabor = 0;
  let totalWeightChi = 0;

  const itemDetails = cart.map(cartItem => {
    const goldItem = items.find(i => i.id === cartItem.goldItemId) || items[0];
    const { finalBuy, finalSell } = calculateStorePrices(goldItem, settings);

    // Rate per chỉ (1 lượng = 10 chỉ)
    const ratePerChi = cartItem.action === 'buy' ? (finalSell / CHI_PER_LUONG) : (finalBuy / CHI_PER_LUONG);
    const goldSubtotal = Math.round(ratePerChi * cartItem.weightChi);
    const subtotal = goldSubtotal + (cartItem.action === 'buy' ? (cartItem.laborFee + cartItem.stoneFee) : 0);

    if (cartItem.action === 'buy') {
      totalCustomerPays += subtotal;
      totalLabor += cartItem.laborFee + cartItem.stoneFee;
      totalWeightChi += cartItem.weightChi;
    } else {
      totalCustomerReceives += subtotal;
    }

    return {
      ...cartItem,
      goldItem,
      ratePerChi,
      goldSubtotal,
      subtotal,
      weightGram: (cartItem.weightChi * GRAMS_PER_CHI).toFixed(2)
    };
  });

  const netBalance = totalCustomerPays - totalCustomerReceives;

  // Copy quote text for customer Zalo/SMS
  const handleCopyQuote = () => {
    const dateStr = new Date().toLocaleString('vi-VN');
    let text = `✨ BÁO GIÁ VÀNG - ${settings.storeName || 'TIỆM VÀNG'} ✨\n`;
    text += `⏰ Thời gian: ${dateStr}\n`;
    if (customerName) text += `👤 Khách hàng: ${customerName} ${customerPhone ? `(${customerPhone})` : ''}\n`;
    text += `------------------------------\n`;

    itemDetails.forEach((item, idx) => {
      const typeStr = item.action === 'buy' ? 'Khách mua' : 'Tiệm thu mua cũ';
      text += `${idx + 1}. [${typeStr}] ${item.goldItem.name}\n`;
      text += `   Trọng lượng: ${item.weightChi} chỉ (~${item.weightGram}g)\n`;
      text += `   Đơn giá: ${formatVnd(item.ratePerChi)} đ/chỉ\n`;
      if (item.laborFee > 0) text += `   Tiền công: ${formatVnd(item.laborFee)} đ\n`;
      text += `   Thành tiền: ${formatVnd(item.subtotal)} đ\n`;
    });

    text += `------------------------------\n`;
    if (totalCustomerReceives > 0) {
      text += `Tổng tiền mua mới: ${formatVnd(totalCustomerPays)} đ\n`;
      text += `Trừ tiền vàng cũ thu lại: -${formatVnd(totalCustomerReceives)} đ\n`;
    }
    text += `👉 TỔNG THANH TOÁN: ${formatVnd(netBalance)} đ\n`;
    text += `📍 ${settings.address}\n`;
    text += `📞 Hotline: ${settings.phone}\n`;
    text += `Kính chúc Quý Khách An Khang Thịnh Vượng!`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-neutral-800">

      {/* Header Banner */}
      <div className="bg-white border-2 border-red-600/20 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-red-600" />
            <h2 className="text-lg sm:text-xl font-black text-red-800 font-serif">
              Bảng Tính Nhanh Tiền Vàng Cho Khách Tại Quầy
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Tính tiền vàng theo số Chỉ/Phân/Gam, cộng tiền công chế tác, trừ tiền vàng cũ thu đổi tại quầy {settings.storeName || 'Tiệm Vàng'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddItem('buy')}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Món Khách Mua</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddItem('sell')}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>+ Thêm Vàng Khách Bán/Đổi</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Line Items */}
        <div className="lg:col-span-8 space-y-4">

          {/* Customer info input */}
          <div className="bg-white border border-neutral-200 rounded-xl p-3.5 flex flex-wrap items-center gap-3 shadow-xs">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] text-neutral-600 font-bold mb-1">
                Tên khách hàng (tùy chọn)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ví dụ: Chị Lan, Anh Hùng..."
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] text-neutral-600 font-bold mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09xx.xxx.xxx"
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Line items */}
          {itemDetails.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center text-neutral-500">
              <p className="text-sm font-medium">Chưa có sản phẩm nào được chọn để tính.</p>
              <button
                type="button"
                onClick={() => handleAddItem('buy')}
                className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                + Thêm món vàng
              </button>
            </div>
          ) : (
            itemDetails.map((item, idx) => (
              <div 
                key={item.id}
                className={`rounded-2xl border-2 p-4 sm:p-5 shadow-xs transition-all ${
                  item.action === 'buy'
                    ? 'bg-white border-red-200'
                    : 'bg-emerald-50/50 border-emerald-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                      item.action === 'buy'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {item.action === 'buy' ? 'Khách Mua' : 'Thu Vàng Cũ'}
                    </span>
                    <span className="text-xs font-bold text-neutral-800">
                      Món #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.action}
                      onChange={(e) => updateCartItem(item.id, 'action', e.target.value)}
                      className="bg-neutral-50 text-xs text-neutral-800 border border-neutral-300 rounded-lg px-2 py-1 cursor-pointer"
                    >
                      <option value="buy">Khách Mua Mới</option>
                      <option value="sell">Tiệm Thu Mua Cũ</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  {/* Select Gold Type */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-neutral-600 font-bold mb-1">
                      Loại vàng niêm yết
                    </label>
                    <select
                      value={item.goldItemId}
                      onChange={(e) => updateCartItem(item.id, 'goldItemId', e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 focus:border-red-600 focus:outline-none cursor-pointer"
                    >
                      {items.map(gold => (
                        <option key={gold.id} value={gold.id}>
                          {gold.brand} - {gold.name} ({gold.purity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weight in Chỉ */}
                  <div>
                    <label className="block text-[11px] text-neutral-600 font-bold mb-1">
                      Trọng lượng (Chỉ)
                    </label>
                    <div className="flex items-center bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 focus-within:border-red-600">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.weightChi}
                        onChange={(e) => updateCartItem(item.id, 'weightChi', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent font-mono font-black text-neutral-900 text-sm focus:outline-none"
                      />
                      <span className="text-xs text-neutral-500 font-bold ml-1">Chỉ</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block font-medium">
                      ~ {item.weightGram} Gam
                    </span>
                  </div>

                  {/* Labor fee */}
                  <div>
                    <label className="block text-[11px] text-neutral-600 font-bold mb-1">
                      Tiền công chế tác (VNĐ)
                    </label>
                    <div className="flex items-center bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 focus-within:border-red-600">
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        disabled={item.action === 'sell'}
                        value={item.laborFee}
                        onChange={(e) => updateCartItem(item.id, 'laborFee', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent font-mono font-bold text-neutral-900 text-sm focus:outline-none disabled:opacity-40"
                      />
                      <span className="text-xs text-neutral-500 ml-1">đ</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal calculation */}
                <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-neutral-600">
                    Đơn giá: <span className="font-mono font-bold text-neutral-800">{formatVnd(item.ratePerChi)} đ/chỉ</span>
                    {' × '}{item.weightChi} chỉ = <strong className="text-neutral-900 font-mono">{formatVnd(item.goldSubtotal)} đ</strong>
                    {item.laborFee > 0 && <span> + Công: {formatVnd(item.laborFee)} đ</span>}
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-500 mr-2">Thành tiền:</span>
                    <span className={`font-mono text-base sm:text-lg font-black ${
                      item.action === 'buy' ? 'text-red-600' : 'text-emerald-700'
                    }`}>
                      {item.action === 'sell' ? '-' : ''}{formatVnd(item.subtotal)} đ
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Invoice Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border-2 border-red-600 rounded-2xl p-5 shadow-sm space-y-4 sticky top-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-red-800 font-serif">
                  TỔNG KẾT BÁO GIÁ
                </h3>
              </div>
              <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">{cart.length} món</span>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 text-xs text-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-500">Tổng trọng lượng mua:</span>
                <span className="font-bold font-mono text-neutral-900">{totalWeightChi.toFixed(2)} Chỉ (~{(totalWeightChi * GRAMS_PER_CHI).toFixed(1)}g)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Tiền vàng mua mới:</span>
                <span className="font-bold font-mono text-red-700">{formatVnd(totalCustomerPays - totalLabor)} đ</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Tổng tiền công chế tác:</span>
                <span className="font-bold font-mono text-neutral-900">{formatVnd(totalLabor)} đ</span>
              </div>

              {totalCustomerReceives > 0 && (
                <div className="flex justify-between text-emerald-800 pt-1 border-t border-neutral-200 font-bold">
                  <span>Trừ tiền vàng cũ thu lại:</span>
                  <span className="font-mono">-{formatVnd(totalCustomerReceives)} đ</span>
                </div>
              )}
            </div>

            {/* Total Balance Box */}
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-center">
              <span className="text-xs font-black text-red-800 uppercase tracking-wide block">
                {netBalance >= 0 ? "Khách Hàng Thanh Toán" : "Tiệm Chi Trả Cho Khách"}
              </span>
              <div 
                className="font-mono text-2xl sm:text-3xl font-black text-red-600 mt-1"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                {formatVnd(Math.abs(netBalance))} đ
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyQuote}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {copiedQuote ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedQuote ? 'Đã Sao Chép Báo Giá!' : 'Sao Chép Báo Giá Gửi Zalo/SMS'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-300 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Báo Giá / Hóa Đơn</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
              Giá niêm yết chính thức tại {settings.storeName || 'Tiệm Vàng'}. Cân điện tử chuẩn quốc gia.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};
