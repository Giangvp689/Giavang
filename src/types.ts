export type GoldCategory = 'sjc' | 'pnj' | 'doji' | 'aaa' | 'jewelry' | 'custom';

export type GoldBrand = 'SJC' | 'PNJ' | 'DOJI' | 'AAA' | 'TIỆM';

export type UnitType = 'chi' | 'luong' | 'gam';

export type PriceTrend = 'up' | 'down' | 'equal';

export interface GoldItem {
  id: string;
  name: string;
  purity: string; // e.g. "99.99%", "75.00%", "58.50%"
  brand: GoldBrand;
  category: GoldCategory;
  apiBuy: number; // Raw Buy price from API (VND per lượng)
  apiSell: number; // Raw Sell price from API (VND per lượng)
  baseBuy: number; // Compatibility field = apiBuy
  baseSell: number; // Compatibility field = apiSell
  prevDayBuy?: number; // Yesterday's buy price for calculating daily change
  prevDaySell?: number; // Yesterday's sell price for calculating daily change
  trend: PriceTrend;
  changeAmount: number; // Daily price change in VND (so với ngày hôm trước)
  changePercent?: number; // Daily percentage change e.g. +0.22%
  
  // Owner customizations (Formula):
  // 1. Profit % added to API Buy price (e.g. +1.0% as user requested)
  profitOnBuyPercent?: number | null;
  // 2. Spread % between Buy and Sell (e.g. 2.0% -> Sell = Buy * (1 + spread%))
  spreadPercent?: number | null;
  
  // Manual override (nếu chủ tiệm muốn tự gõ giá cứng)
  useCustomPrice?: boolean;
  customBuy?: number | null;
  customSell?: number | null;
  
  visible: boolean; // Whether visible on customer TV board
  order: number;
  updatedAt?: string;
  note?: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  phone: string;
  address: string;
  marqueeNotice: string;
  displayUnit: UnitType;
  
  // Core Formula as requested by user:
  // "thiết lập tỷ lệ phần trăm lãi cộng thêm vào giá mua từ API (ví dụ: 1%) và tỷ lệ phần trăm chênh lệch giữa giá mua và giá bán"
  globalProfitOnBuyPercent: number; // Ví dụ: 1.0 = +1.0% cộng vào giá mua API
  globalSpreadPercent: number; // Ví dụ: 2.0 = 2.0% chênh lệch giữa giá mua và bán
  
  pricingMode: 'formula' | 'custom_override';
  autoSyncIntervalMinutes: number;
  lastSyncedAt: string;
  dataSourceName: string;
  adminPin: string;
  showTrendColumn: boolean;
  showSpreadColumn: boolean;
  tvFontSize?: 'normal' | 'large' | 'extralarge';
}

export interface PublicRatesResponse {
  success: boolean;
  source: string;
  timestamp: string;
  rates: Array<{
    id: string;
    name: string;
    purity: string;
    brand: GoldBrand;
    category: GoldCategory;
    buy: number;
    sell: number;
    prevDayBuy?: number;
    prevDaySell?: number;
    trend: PriceTrend;
    changeAmount: number;
    changePercent?: number;
  }>;
}

export interface CalculationLineItem {
  id: string;
  goldItemId: string;
  type: 'buy' | 'sell'; // 'buy' = customer buys from store, 'sell' = store buys back from customer
  quantityUnit: 'luong' | 'chi' | 'gam';
  quantity: number;
  laborFee: number; // Tiền công (VND)
  stoneFee: number; // Tiền đá (VND)
  customPricePerUnit?: number;
}
