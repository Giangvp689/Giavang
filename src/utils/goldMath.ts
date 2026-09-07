import { GoldItem, StoreSettings, UnitType } from '../types';

// Vietnam gold standard units:
// 1 Lượng (Cây) = 10 Chỉ = 37.5 Gam
// 1 Chỉ = 3.75 Gam = 10 Phân
// 1 Phân = 0.375 Gam
export const GRAMS_PER_LUONG = 37.5;
export const CHI_PER_LUONG = 10;
export const GRAMS_PER_CHI = 3.75;

/**
 * Làm tròn lên theo quy tắc của tiệm:
 * "Làm tròn hàng chục nghìn, Ví dụ 14897 thì làm tròn 14900, Nếu ở 5 thì giữ nguyên, còn dưới 5 cũng làm tròn."
 * 
 * Áp dụng trên đơn vị nghìn/chỉ (tương đương chục nghìn VND/lượng):
 * Với số n (ở hàng nghìn VND):
 * - Nếu tận cùng là 0: giữ nguyên
 * - Nếu dưới 5 (1, 2, 3, 4): làm tròn lên 5
 * - Nếu là 5: giữ nguyên ở 5
 * - Nếu trên 5 (6, 7, 8, 9 ví dụ 14897 có số 7): làm tròn lên 10 (thành 14900)
 */
export function roundStep510(amountInThousands: number): number {
  const rounded = Math.round(amountInThousands);
  const lastDigit = ((rounded % 10) + 10) % 10;
  if (lastDigit === 0) return rounded;
  if (lastDigit < 5) return rounded + (5 - lastDigit);
  if (lastDigit === 5) return rounded;
  // lastDigit > 5: ví dụ 7 -> cộng 3 = 10, 14897 -> 14900
  return rounded + (10 - lastDigit);
}

export function applyRounding(pricePerLuong: number, rule?: 'round_up_step_5_10' | 'round_up_10' | 'round_none'): number {
  if (rule === 'round_none') {
    return Math.round(pricePerLuong);
  }
  if (rule === 'round_up_10') {
    // Làm tròn lên chục nghìn VND/chỉ (= 100.000 VND/lượng)
    return Math.ceil(pricePerLuong / 100000) * 100000;
  }
  // Mặc định: 'round_up_step_5_10' theo đúng yêu cầu người dùng
  // 1 lượng = 10 chỉ. Giá 1 chỉ tính bằng nghìn VND = pricePerLuong / 10000.
  const chiInThousands = pricePerLuong / 10000;
  const roundedChiInThousands = roundStep510(chiInThousands);
  return roundedChiInThousands * 10000;
}

/**
 * Calculates store's final active buy and sell prices based on raw API rates and owner formulas:
 * 1. Store Buy = API Buy * (1 + profitOnBuyPercent / 100)
 * 2. Store Sell = Store Buy * (1 + spreadPercent / 100)
 */
export function calculateStorePrices(item: GoldItem, settings: StoreSettings): {
  finalBuy: number;
  finalSell: number;
  spread: number;
  spreadPercent: number;
  profitOnBuyAmount: number;
  isCustom: boolean;
  dailyChangeAmount: number;
  dailyChangePercent: number;
} {
  let finalBuy: number;
  let finalSell: number;
  let isCustom = false;

  // Fallback defaults to current market reality (143.5tr - 146.5tr)
  const rawBuy = item.apiBuy || item.baseBuy || 143500000;
  const rawSell = item.apiSell || item.baseSell || 146500000;
  const pricingMode = settings.pricingMode || 'auto_market';

  // 1. Khi loại vàng này được chỉnh sửa giá riêng (hoặc chế độ gõ giá thủ công)
  if (item.useCustomPrice || pricingMode === 'custom_override') {
    finalBuy = item.customBuy !== null && item.customBuy !== undefined && item.customBuy > 0 
      ? Math.round(item.customBuy) 
      : rawBuy;
    finalSell = item.customSell !== null && item.customSell !== undefined && item.customSell > 0 
      ? Math.round(item.customSell) 
      : rawSell;
    isCustom = true;
  }
  // 2. Chế độ TỰ ĐỘNG THỊ TRƯỜNG CHUẨN 100% (Giá SJC, PNJ, DOJI, AAA gốc không bị lệch)
  else if (pricingMode === 'auto_market') {
    finalBuy = rawBuy;
    finalSell = rawSell;
    isCustom = false;
  }
  // 3. Chế độ TỰ ĐỘNG + CHÊNH LỆCH TIỆM (Thị trường +/- tiền hoặc %)
  else {
    const calcType = settings.calculationType || 'amount_delta';

    if (calcType === 'amount_delta') {
      // Chế độ nhập tiền chênh lệch (Ví dụ: giá thị trường 16600 -> mua vào trừ 100 thành 16500, bán ra cộng 100 thành 16700)
      // Đơn vị buyAmountDeltaPerChi: nghìn đồng/chỉ (100 nghìn/chỉ = 1.000.000 đ/lượng)
      const buyDeltaPerLuong = (settings.buyAmountDeltaPerChi ?? 0) * 10000;
      const sellDeltaPerLuong = (settings.sellAmountDeltaPerChi ?? 0) * 10000;

      const unroundedBuy = Math.max(0, rawBuy - buyDeltaPerLuong);
      finalBuy = applyRounding(unroundedBuy, settings.roundingRule);

      const unroundedSell = rawSell + sellDeltaPerLuong;
      finalSell = applyRounding(unroundedSell, settings.roundingRule);
    } else {
      // Chế độ tính theo %:
      // Mua vào trừ % so với giá thị trường (để tiệm có lời khi thu mua)
      const buyDiscountRate = settings.buyDiscountPercent ?? (settings.globalProfitOnBuyPercent ?? 0);
      const unroundedBuy = rawBuy * (1 - buyDiscountRate / 100);
      finalBuy = applyRounding(unroundedBuy, settings.roundingRule);

      // Bán ra cộng % so với giá thị trường / giá mua (để tiệm có lãi khi bán)
      const sellMarginRate = settings.sellMarginPercent ?? (settings.globalSpreadPercent ?? 0);
      const unroundedSell = rawSell * (1 + sellMarginRate / 100);
      finalSell = applyRounding(unroundedSell, settings.roundingRule);
    }
  }

  const spread = Math.max(0, finalSell - finalBuy);
  const spreadPercent = finalBuy > 0 ? parseFloat(((spread / finalBuy) * 100).toFixed(2)) : 0;
  const profitOnBuyAmount = finalBuy - rawBuy;

  // Calculate daily change based on yesterday's reference price
  const prevDaySell = item.prevDaySell || (item.apiSell ? item.apiSell - item.changeAmount : finalSell - 200000);
  const dailyChangeAmount = finalSell - prevDaySell;
  const dailyChangePercent = prevDaySell > 0 ? parseFloat(((dailyChangeAmount / prevDaySell) * 100).toFixed(2)) : 0;

  return {
    finalBuy,
    finalSell,
    spread,
    spreadPercent,
    profitOnBuyAmount,
    isCustom,
    dailyChangeAmount,
    dailyChangePercent
  };
}

/**
 * Convert price per Lượng to specified display unit (chỉ, lượng, gam)
 */
export function convertPriceByUnit(pricePerLuong: number, unit: UnitType): number {
  switch (unit) {
    case 'chi':
      return Math.round(pricePerLuong / CHI_PER_LUONG);
    case 'gam':
      return Math.round(pricePerLuong / GRAMS_PER_LUONG);
    case 'luong':
    default:
      return pricePerLuong;
  }
}

/**
 * Formats a number with Vietnamese thousand separators (e.g. 8.850.000)
 */
export function formatVnd(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return Math.round(amount).toLocaleString('vi-VN');
}

/**
 * Formats gold board digital display value based on unit
 * For 'chi': returns e.g. 8.850 (representing 8.850.000 đ/chỉ in thousands) or full 8.850.000
 */
export function formatUnitDisplay(
  pricePerLuong: number,
  unit: UnitType,
  inThousands: boolean = false
): string {
  const converted = convertPriceByUnit(pricePerLuong, unit);
  if (inThousands) {
    // If unit is 'chi', 8,850,000 becomes "8.850"
    return Math.round(converted / 1000).toLocaleString('vi-VN');
  }
  return converted.toLocaleString('vi-VN');
}

/**
 * Compute total for buying/selling calculation in the store calculator
 */
export function calculateItemTotal(
  pricePerLuong: number,
  quantity: number,
  quantityUnit: UnitType,
  laborFee: number = 0,
  stoneFee: number = 0
): {
  goldAmount: number;
  totalAmount: number;
  quantityInLuong: number;
} {
  let quantityInLuong = quantity;
  if (quantityUnit === 'chi') {
    quantityInLuong = quantity / CHI_PER_LUONG;
  } else if (quantityUnit === 'gam') {
    quantityInLuong = quantity / GRAMS_PER_LUONG;
  }

  const goldAmount = Math.round(pricePerLuong * quantityInLuong);
  const totalAmount = goldAmount + (laborFee || 0) + (stoneFee || 0);

  return {
    goldAmount,
    totalAmount,
    quantityInLuong
  };
}
