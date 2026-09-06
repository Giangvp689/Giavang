import React, { useState, useEffect } from 'react';
import { 
  Maximize, 
  Minimize, 
  Palette, 
  Scale, 
  Sparkles, 
  Phone, 
  MapPin, 
  Clock, 
  Settings,
  Calculator,
  RotateCcw
} from 'lucide-react';
import { GoldItem, StoreSettings, UnitType } from '../types';
import { calculateStorePrices, convertPriceByUnit } from '../utils/goldMath';

interface CustomerBoardProps {
  items: GoldItem[];
  settings: StoreSettings;
  unit: UnitType;
  onChangeUnit: (unit: UnitType) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenAdmin?: () => void;
  onOpenCalculator?: () => void;
}

export const CustomerBoard: React.FC<CustomerBoardProps> = ({
  items,
  settings,
  unit,
  onChangeUnit,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenAdmin,
  onOpenCalculator
}) => {
  // 2 Master TV Themes:
  // 'led_dark': Bảng LED đen viền vàng kim siêu nét, chống lóa trên TV, độ tương phản tuyệt đối cho người già
  // 'royal_red': Bảng Đỏ Đô Hoàng Gia truyền thống kim hoàn
  const [tvTheme, setTvTheme] = useState<'led_dark' | 'royal_red'>('led_dark');
  
  // Real-time live clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  // Show controls on hover / mouse move
  const [showControlBar, setShowControlBar] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter visible items and clean up any prefix junk like `_ ` or `- `
  const visibleItems = items
    .filter(item => item.visible)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => ({
      ...item,
      // Clean name: remove accidental leading `_ `, `- `, bullet points
      cleanName: item.name.replace(/^[\s_\-–—•*]+/, '').trim()
    }));

  // Format price into giant TV numbers
  const formatTvPrice = (pricePerLuong: number) => {
    const converted = convertPriceByUnit(pricePerLuong, unit);
    if (unit === 'chi' || unit === 'luong') {
      const inThousands = Math.round(converted / 1000);
      return inThousands.toLocaleString('vi-VN');
    }
    return converted.toLocaleString('vi-VN');
  };

  const timeString = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateString = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const isLed = tvTheme === 'led_dark';

  return (
    <div 
      className={`w-full flex-1 flex flex-col justify-between select-none overflow-hidden transition-colors duration-300 ${
        isLed 
          ? 'bg-[#090A0F] text-white' 
          : 'bg-[#55060E] text-white'
      } ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'min-h-[calc(100vh-60px)]'}`}
      onMouseMove={() => setShowControlBar(true)}
    >
      {/* 1. MASTER TV GRAND BANNER HEADER */}
      <header className={`w-full px-4 sm:px-8 py-3 sm:py-4 border-b-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl relative z-10 ${
        isLed 
          ? 'bg-gradient-to-r from-[#140003] via-[#7B030E] to-[#140003] border-yellow-500' 
          : 'bg-gradient-to-r from-[#6A040F] via-[#9D0208] to-[#6A040F] border-yellow-400'
      }`}>
        
        {/* Left: Brand Name & Crest */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 p-0.5 shadow-lg flex-shrink-0">
            <div className="w-full h-full bg-red-950 rounded-[10px] flex items-center justify-center text-yellow-300 font-serif font-black text-xl sm:text-2xl tracking-wider">
              ĐK
            </div>
          </div>

          <div>
            <h1 
              className="text-2xl sm:text-4xl md:text-5xl font-black font-serif uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))'
              }}
            >
              {settings.storeName || "TIỆM VÀNG ĐỨC KỲ"}
            </h1>
            <p className="text-xs sm:text-sm text-yellow-100/90 font-bold uppercase tracking-wider flex items-center gap-2 mt-0.5">
              <span>{settings.slogan || "Uy Tín Trọn Niềm Tin • Chuẩn Tuổi Vàng 100%"}</span>
              {settings.phone && (
                <span className="text-yellow-300 hidden sm:inline">
                  • ĐT: {settings.phone}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Title & Display Unit */}
        <div className="text-center px-4 py-1 rounded-xl bg-black/40 border border-yellow-500/40 shadow-inner">
          <div className="text-lg sm:text-2xl font-black text-yellow-300 uppercase tracking-widest font-serif">
            BẢNG GIÁ VÀNG TRỰC TIẾP
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-2">
            <span>ĐƠN VỊ TÍNH:</span>
            <span className="text-yellow-400 bg-red-950/90 px-2.5 py-0.5 rounded border border-yellow-500/60 font-black">
              {unit === 'chi' ? 'NGHÌN ĐỒNG / 1 CHỈ' : unit === 'luong' ? 'TRIỆU ĐỒNG / 1 LƯỢNG' : 'VNĐ / 1 GAM'}
            </span>
          </div>
        </div>

        {/* Right: Live Digital Clock */}
        <div className="flex items-center gap-3">
          <div className="text-right bg-black/50 border border-yellow-500/50 rounded-xl px-4 py-2 shadow-lg">
            <div 
              className="text-2xl sm:text-3xl md:text-4xl font-black text-yellow-300 tracking-wider leading-none"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              {timeString}
            </div>
            <div className="text-xs sm:text-sm text-yellow-100 font-bold capitalize mt-1">
              {dateString}
            </div>
          </div>
        </div>

      </header>

      {/* 2. FULL-SCREEN 3-COLUMN MASTER GOLD BOARD */}
      <main className="flex-1 w-full flex flex-col justify-start px-2 sm:px-4 lg:px-6 py-2">
        <div className={`w-full flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl border-4 ${
          isLed 
            ? 'bg-[#0F1017] border-yellow-500/80 shadow-black' 
            : 'bg-[#3D0308] border-yellow-400 shadow-2xl'
        }`}>
          
          <table className="w-full flex-1 border-collapse table-fixed">
            {/* Board Column Headers */}
            <thead>
              <tr className={`border-b-4 ${
                isLed 
                  ? 'bg-black border-yellow-500/60' 
                  : 'bg-[#55060E] border-yellow-400'
              }`}>
                {/* Col 1: LOẠI VÀNG (42% width) */}
                <th className="w-[42%] py-3 sm:py-4 px-4 sm:px-8 text-left border-r-4 border-yellow-500/40">
                  <span className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-yellow-300 font-serif">
                    LOẠI VÀNG
                  </span>
                </th>

                {/* Col 2: MUA VÀO (29% width) */}
                <th className={`w-[29%] py-3 sm:py-4 px-4 sm:px-6 text-center border-r-4 border-yellow-500/40 ${
                  isLed ? 'bg-[#002B1B]' : 'bg-[#064E3B]'
                }`}>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-[#00FF88] leading-tight">
                      MUA VÀO
                    </span>
                    <span className="text-xs sm:text-sm text-emerald-200 font-bold lowercase">
                      (tiệm mua)
                    </span>
                  </div>
                </th>

                {/* Col 3: BÁN RA (29% width) */}
                <th className={`w-[29%] py-3 sm:py-4 px-4 sm:px-6 text-center ${
                  isLed ? 'bg-[#3B0208]' : 'bg-[#7F1D1D]'
                }`}>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-[#FF4444] leading-tight">
                      BÁN RA
                    </span>
                    <span className="text-xs sm:text-sm text-red-200 font-bold lowercase">
                      (tiệm bán)
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Board Table Body: Sizing rows proportionally so elderly read with extreme clarity */}
            <tbody className="divide-y-4 divide-yellow-500/30">
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-24 text-center text-yellow-300 font-bold text-2xl">
                    Chưa có loại vàng nào được chọn hiển thị.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item, index) => {
                  const { finalBuy, finalSell } = calculateStorePrices(item, settings);
                  
                  // Alternating subtle backgrounds for contrast
                  const rowBg = isLed
                    ? index % 2 === 0 ? 'bg-[#0D0E15]' : 'bg-[#141622]'
                    : index % 2 === 0 ? 'bg-[#3D0308]' : 'bg-[#4C050B]';

                  return (
                    <tr 
                      key={item.id}
                      className={`transition-colors ${rowBg} hover:bg-yellow-500/10`}
                    >
                      {/* Col 1: Name of Gold - Clean, Giant, Bold, No clutter */}
                      <td className="py-3 sm:py-4 md:py-5 px-4 sm:px-8 border-r-4 border-yellow-500/30">
                        <div className="flex items-center gap-3">
                          {/* Brand Pill */}
                          <span className="text-xs sm:text-base font-black px-2.5 py-1 rounded bg-yellow-400 text-red-950 uppercase tracking-wider shadow-sm flex-shrink-0">
                            {item.brand}
                          </span>

                          {/* Gold Title */}
                          <div className="flex flex-col">
                            <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase text-white tracking-wide leading-tight">
                              {item.cleanName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Col 2: BUY PRICE - SUPER GIANT EMERALD LED NUMBER */}
                      <td className={`py-3 sm:py-4 md:py-5 px-3 sm:px-6 text-center border-r-4 border-yellow-500/30 ${
                        isLed ? 'bg-[#021A11]/60' : 'bg-[#064E3B]/40'
                      }`}>
                        <div 
                          className="font-black leading-none tracking-tight text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#00FF88]"
                          style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            textShadow: '0 0 15px rgba(0, 255, 136, 0.45)'
                          }}
                        >
                          {formatTvPrice(finalBuy)}
                        </div>
                      </td>

                      {/* Col 3: SELL PRICE - SUPER GIANT CRIMSON/GOLD LED NUMBER */}
                      <td className={`py-3 sm:py-4 md:py-5 px-3 sm:px-6 text-center ${
                        isLed ? 'bg-[#260205]/60' : 'bg-[#7F1D1D]/40'
                      }`}>
                        <div 
                          className="font-black leading-none tracking-tight text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FF4444]"
                          style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            textShadow: '0 0 15px rgba(255, 68, 68, 0.45)'
                          }}
                        >
                          {formatTvPrice(finalSell)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        </div>
      </main>

      {/* 3. MARQUEE RUNNING FOOTER TICKER */}
      <footer className={`w-full py-2.5 px-4 border-t-4 flex items-center gap-3 overflow-hidden shadow-2xl relative z-10 ${
        isLed
          ? 'bg-black border-yellow-500 text-yellow-300'
          : 'bg-[#3B0208] border-yellow-400 text-yellow-200'
      }`}>
        <div className="flex-shrink-0 px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-red-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>THÔNG BÁO TIỆM</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee text-sm sm:text-lg font-bold text-white tracking-wide">
            {settings.marqueeNotice || "TIỆM VÀNG ĐỨC KỲ KÍNH CHÀO QUÝ KHÁCH • GIÁ VÀNG CẬP NHẬT TỰ ĐỘNG THEO THỜI GIAN THỰC TỪ SJC, PNJ, DOJI, AAA • CAM KẾT ĐÚNG TUỔI VÀNG 100%, ĐỦ TRỌNG LƯỢNG, BẢO HÀNH LÀM SÁNG TRỌN ĐỜI."}
            <span className="mx-6 text-yellow-400">★ ★ ★</span>
            {settings.phone && `Hotline: ${settings.phone}`}
            <span className="mx-6 text-yellow-400">★ ★ ★</span>
            {settings.address && `Địa chỉ: ${settings.address}`}
          </div>
        </div>
      </footer>

      {/* 4. DISCREET FLOATING CONTROL BAR (Only visible on hover or bottom screen, no clutter on TV) */}
      <div 
        className={`fixed bottom-12 right-6 z-50 transition-opacity duration-300 flex items-center gap-2 p-1.5 rounded-2xl bg-black/85 backdrop-blur-md border-2 border-yellow-500/70 shadow-2xl ${
          showControlBar ? 'opacity-100 pointer-events-auto' : 'opacity-20 hover:opacity-100'
        }`}
      >
        {/* Toggle Unit: Chỉ / Lượng */}
        <div className="flex items-center bg-neutral-900 rounded-xl p-1 border border-neutral-700">
          <button
            type="button"
            onClick={() => onChangeUnit('chi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              unit === 'chi' 
                ? 'bg-yellow-400 text-red-950 shadow-sm' 
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Tính Theo Chỉ
          </button>
          <button
            type="button"
            onClick={() => onChangeUnit('luong')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              unit === 'luong' 
                ? 'bg-yellow-400 text-red-950 shadow-sm' 
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Tính Theo Lượng
          </button>
        </div>

        {/* Toggle Theme: LED Đen vs Đỏ Đô */}
        <button
          type="button"
          onClick={() => setTvTheme(isLed ? 'royal_red' : 'led_dark')}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border border-yellow-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Đổi phong cách màu bảng TV"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{isLed ? 'Đổi: Đỏ Hoàng Gia' : 'Đổi: Bảng LED Đen'}</span>
        </button>

        {/* Fullscreen TV Button */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-red-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Bật/Tắt toàn màn hình TV"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn Hình TV'}</span>
          </button>
        )}

        {/* Return to Admin / Calculator if in Fullscreen */}
        {isFullscreen && onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Cài đặt giá & lãi"
          >
            <Settings className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Cài Lãi</span>
          </button>
        )}
      </div>

    </div>
  );
};
