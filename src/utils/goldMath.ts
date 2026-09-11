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
export function calculateStorePrices(item: GoldItem, _settings?: StoreSettings): {
  finalBuy: number;
  finalSell: number;
  spread: number;
  spreadPercent: number;
  profitOnBuyAmount: number;
  isCustom: boolean;
  dailyChangeAmount: number;
  dailyChangePercent: number;
} {
  // Directly use the price set by the shop owner
  const finalBuy = (item.customBuy !== null && item.customBuy !== undefined && item.customBuy > 0)
    ? Math.round(item.customBuy)
    : (item.baseBuy || item.apiBuy || 140000000);

  const finalSell = (item.customSell !== null && item.customSell !== undefined && item.customSell > 0)
    ? Math.round(item.customSell)
    : (item.baseSell || item.apiSell || 145000000);

  const spread = Math.max(0, finalSell - finalBuy);
  const spreadPercent = finalBuy > 0 ? parseFloat(((spread / finalBuy) * 100).toFixed(2)) : 0;

  // Chênh lệch giữa giá hôm nay chủ tiệm đặt và giá cuối cùng trước đó
  let dailyChangeAmount = 0;
  if (item.prevDaySell !== undefined && item.prevDaySell !== null && item.prevDaySell > 0) {
    dailyChangeAmount = finalSell - item.prevDaySell;
  } else if (item.changeAmount !== undefined && item.changeAmount !== null) {
    dailyChangeAmount = item.changeAmount;
  }

  const prevRef = (item.prevDaySell && item.prevDaySell > 0) 
    ? item.prevDaySell 
    : (finalSell !== dailyChangeAmount ? finalSell - dailyChangeAmount : finalSell);
  const dailyChangePercent = prevRef > 0 ? parseFloat(((dailyChangeAmount / prevRef) * 100).toFixed(2)) : 0;

  return {
    finalBuy,
    finalSell,
    spread,
    spreadPercent,
    profitOnBuyAmount: 0,
    isCustom: true,
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
