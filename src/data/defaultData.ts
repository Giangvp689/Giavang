import { GoldItem, StoreSettings } from '../types';

/**
 * Dữ liệu bảng giá vàng: Lấy trực tiếp 100% từ Firebase Firestore của tiệm.
 * Không tải sẵn bất kỳ danh sách cố định nào.
 */
export const INITIAL_GOLD_ITEMS: GoldItem[] = [];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: "TIỆM VÀNG THỊNH VƯỢNG",
  slogan: "CHỮ TÍN QUÝ HƠN VÀNG",
  phone: "0985061955",
  address: "2C Lê Quý Đôn - Sơn Tây - Hà Nội",
  marqueeNotice: "CHÀO MỪNG QUÝ KHÁCH • BẢNG GIÁ VÀNG NIÊM YẾT CHÍNH THỨC CỦA TIỆM • CAM KẾT VÀNG ĐÚNG TUỔI 100%, ĐỦ TRỌNG LƯỢNG • THU MUA VÀ THU ĐỔI VÀNG CŨ GIÁ TỐT NHẤT.",
  displayUnit: "chi",
  
  // Định giá mặc định: 'custom_override' (Chỉnh tay trực tiếp của tiệm, chủ tiệm tự định giá)
  calculationType: "custom_override",
  buyAmountDeltaPerChi: 0,
  sellAmountDeltaPerChi: 0,
  
  buyDiscountPercent: 0,
  sellMarginPercent: 0,
  
  globalProfitOnBuyPercent: 0,
  globalSpreadPercent: 0,
  pricingMode: "custom_override", // Mặc định chỉnh tay hoàn toàn của tiệm
  roundingRule: "round_none",
  autoSyncIntervalMinutes: 60,
  lastSyncedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  dataSourceName: "Bảng Giá Niêm Yết Của Tiệm",
  adminPin: "1234",
  showTrendColumn: true,
  showSpreadColumn: true,
  tvFontSize: "large",
  layoutMode: "single_col", // Mặc định 1 bảng lớn thoáng đẹp cho 3-5 loại vàng
  priceDisplayFormat: "compact",
  tvScalePercent: 100,
  tvSafeMargin: true,
  tvTheme: 'tet',
  tvThemeEffectEnabled: true,
  tvThemeEffectIntensity: 'normal',
  tvThemeShowCorners: true,
  tvThemeCornerSize: 'large',
  showWorldGoldPrice: true
};
