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
  
  // Pricing calculation configuration:
  // 1. calculationType: 'percent' (mua vào -%, bán ra +%) | 'amount_delta' (mua vào -tiền, bán ra +tiền ví dụ 16600 -> 16500) | 'custom_override'
  calculationType: 'percent' | 'amount_delta' | 'custom_override';
  
  // When calculationType === 'percent':
  buyDiscountPercent: number; // Mua vào trừ % so với thị trường, vd 0.8% (để tiệm có lãi)
  sellMarginPercent: number; // Bán ra cộng % so với thị trường/mua vào, vd 1.5%

  // When calculationType === 'amount_delta' (tiền chênh lệch tính theo nghìn VND/chỉ):
  // Ví dụ: thị trường 16600, mua vào trừ 100k -> 16500; bán ra cộng 100k -> 16700
  buyAmountDeltaPerChi: number; // Số tiền trừ khi mua vào (nghìn đồng/chỉ, vd: 100 = 100.000 đ/chỉ = 1.000.000 đ/lượng)
  sellAmountDeltaPerChi: number; // Số tiền cộng khi bán ra (nghìn đồng/chỉ, vd: 100 = 100.000 đ/chỉ = 1.000.000 đ/lượng)

  // Legacy fallback fields
  globalProfitOnBuyPercent: number;
  globalSpreadPercent: number;
  
  // Pricing mode:
  // - 'auto_market': 100% chuẩn giá thị trường SJC, PNJ, DOJI (không bị trừ hoặc cộng lệch)
  // - 'formula': Tự động lấy giá thị trường + cộng/trừ chênh lệch của tiệm (amount_delta hoặc percent)
  // - 'custom_override': Chủ tiệm tự gõ giá cứng thủ công
  pricingMode: 'auto_market' | 'formula' | 'custom_override';
  roundingRule?: 'round_up_step_5_10' | 'round_up_10' | 'round_none';
  autoSyncIntervalMinutes: number;
  lastSyncedAt: string;
  dataSourceName: string;
  adminPin: string;
  showTrendColumn: boolean;
  showSpreadColumn: boolean;
  tvFontSize?: 'normal' | 'large' | 'extralarge';
  layoutMode?: 'two_col' | 'single_col';
  priceDisplayFormat?: 'compact' | 'full';
  tvScalePercent?: number; // 90 | 95 | 100
  tvSafeMargin?: boolean; // Khớp khung viền an toàn cho TV (chống tràn mép màn hình 40" - 65")
  
  // Cài đặt Giao Diện & Hiệu Ứng Bảng TV (Tết, Mùa Xuân, Mùa Hè, Mùa Thu, Mùa Đông, Hoàng Kim)
  tvTheme?: TvThemeId;
  tvThemeEffectEnabled?: boolean;
  tvThemeEffectIntensity?: 'light' | 'normal' | 'rich';
  tvThemeShowCorners?: boolean;
  tvThemeCornerSize?: 'normal' | 'large' | 'extralarge'; // Độ to & rõ của hoa văn góc TV

  // Cài đặt Giá Vàng Thế Giới (XAU/USD - Theo thời gian thực từng giây)
  showWorldGoldPrice?: boolean;
}

export interface WorldGoldRate {
  symbol: string; // 'XAU/USD'
  price: number; // e.g. 4411.23
  priceFormatted: string; // "4,411.23"
  change: number; // e.g. -19.10
  changeFormatted: string; // "-19.10"
  changePercent: number; // e.g. -0.43
  changePercentFormatted: string; // "(-0.43%)"
  high: number;
  low: number;
  direction: 'up' | 'down' | 'same';
  vndEquivalentPerLuong: number; // Quy đổi VNĐ/lượng ước tính
  lastUpdated: string;
  source: string; // "Investing.com (XAU/USD)"
}

export type TvThemeId = 'none' | 'tet' | 'spring' | 'summer' | 'autumn' | 'winter' | 'luxury';

export interface TvThemeDefinition {
  id: TvThemeId;
  name: string;
  seasonName: string;
  subtitle: string;
  icon: string;
  sloganTag: string;
  fallingType: string;
  primaryColor: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  tagline: string;
  description: string;
  effectDescription: string;
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
