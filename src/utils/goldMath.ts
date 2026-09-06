import { GoldItem, StoreSettings, UnitType } from '../types';

// Vietnam gold standard units:
// 1 Lượng (Cây) = 10 Chỉ = 37.5 Gam
// 1 Chỉ = 3.75 Gam = 10 Phân
// 1 Phân = 0.375 Gam
export const GRAMS_PER_LUONG = 37.5;
export const CHI_PER_LUONG = 10;
export const GRAMS_PER_CHI = 3.75;

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

  const rawBuy = item.apiBuy || item.baseBuy || 88000000;
  const rawSell = item.apiSell || item.baseSell || 90000000;

  // 1. Check if owner set manual custom override price
  if (item.useCustomPrice && item.customBuy && item.customSell) {
    finalBuy = Math.round(item.customBuy);
    finalSell = Math.round(item.customSell);
    isCustom = true;
  } else {
    // 2. Apply Core Formula requested by owner:
    // Profit % added to API Buy price (default e.g. +1.0%)
    const profitBuyRate = (item.profitOnBuyPercent !== null && item.profitOnBuyPercent !== undefined)
      ? item.profitOnBuyPercent
      : (settings.globalProfitOnBuyPercent ?? 1.0);

    // Spread % between Buy and Sell (default e.g. 2.0%)
    const spreadRate = (item.spreadPercent !== null && item.spreadPercent !== undefined)
      ? item.spreadPercent
      : (settings.globalSpreadPercent ?? 2.0);

    // Calculate Store Buy from API Buy
    finalBuy = Math.round(rawBuy * (1 + profitBuyRate / 100));
    // Round to nearest 10,000 VND for clean retail display
    finalBuy = Math.round(finalBuy / 10000) * 10000;

    // Calculate Store Sell based on Store Buy + Spread %
    finalSell = Math.round(finalBuy * (1 + spreadRate / 100));
    finalSell = Math.round(finalSell / 10000) * 10000;
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
