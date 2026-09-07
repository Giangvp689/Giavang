import React from 'react';
import { TvThemeId } from '../types';

interface ThemeBackdropDecorationsProps {
  themeId: TvThemeId;
  isMini?: boolean;
}

export const ThemeBackdropDecorations: React.FC<ThemeBackdropDecorationsProps> = ({
  themeId,
  isMini = false
}) => {
  if (themeId === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* =========================================================
          1. THEME TẾT: LIỄN CÂU ĐỐI THƯ PHÁP ĐỎ VÀNG & KHUÊ VĂN CÁC
         ========================================================= */}
      {themeId === 'tet' && (
        <>
          {/* Subtle Vietnamese Architectural Heritage Watermark (Khuê Văn Các & Mái Đình Cổ Kính) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl opacity-15 pointer-events-none flex items-end justify-center">
            <svg viewBox="0 0 1000 240" className="w-full h-auto text-amber-300 fill-current">
              {/* Khuê Văn Các Center Silhouette */}
              <g transform="translate(370, 20)">
                {/* Roof tiers */}
                <path d="M130 0 L180 30 L220 35 L200 45 L60 45 L40 35 L80 30 Z" />
                <path d="M130 15 L240 60 L250 70 L10 70 L20 60 Z" />
                {/* Round window (Gác sao Khuê) */}
                <circle cx="130" cy="110" r="28" fill="none" stroke="currentColor" strokeWidth="6" />
                <circle cx="130" cy="110" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
                {/* Ray lines radiating from circular window */}
                <line x1="130" y1="75" x2="130" y2="145" stroke="currentColor" strokeWidth="2.5" />
                <line x1="95" y1="110" x2="165" y2="110" stroke="currentColor" strokeWidth="2.5" />
                <line x1="105" y1="85" x2="155" y2="135" stroke="currentColor" strokeWidth="2" />
                <line x1="105" y1="135" x2="155" y2="85" stroke="currentColor" strokeWidth="2" />
                {/* Lower pillars and balustrade */}
                <rect x="50" y="145" width="160" height="8" />
                <rect x="65" y="153" width="16" height="75" />
                <rect x="105" y="153" width="16" height="75" />
                <rect x="140" y="153" width="16" height="75" />
                <rect x="180" y="153" width="16" height="75" />
                {/* Stone base platform */}
                <rect x="40" y="225" width="180" height="15" rx="3" />
              </g>
              {/* Auspicious cloud swirls flanking */}
              <path d="M120 180 Q160 140 200 180 Q240 200 270 170 Q300 210 240 215 L120 215 Z" opacity="0.4" />
              <path d="M880 180 Q840 140 800 180 Q760 200 730 170 Q700 210 760 215 L880 215 Z" opacity="0.4" />
            </svg>
          </div>

          {/* CÂU ĐỐI TẾT THƯ PHÁP VIỆT NAM (Treo 2 bên mép TV) */}
          {/* LIỄN BÊN TRÁI: NĂM MỚI HẠNH PHÚC BÌNH AN ĐẾN */}
          <div
            className={`absolute top-14 sm:top-16 left-1 sm:left-2 md:left-3 z-20 flex flex-col items-center drop-shadow-xl transition-all ${
              isMini ? 'scale-50 origin-top-left' : 'scale-90 sm:scale-95 md:scale-100 origin-top-left'
            }`}
          >
            {/* Dây treo ngọc đỏ */}
            <div className="w-0.5 h-4 sm:h-6 bg-amber-400" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-xs ring-1 ring-amber-200" />

            {/* Trục cuốn liễn trên (Gỗ sơn son thếp vàng) */}
            <div className="w-12 sm:w-14 md:w-16 h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 border border-amber-200 shadow-md my-0.5 flex justify-between px-0.5">
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
            </div>

            {/* Thân liễn đỏ lụa gấm */}
            <div className="w-9 sm:w-11 md:w-13 bg-gradient-to-b from-[#991B1B] via-[#7F1D1D] to-[#991B1B] border-x-2 border-y border-amber-400 rounded-sm py-2 px-1 flex flex-col items-center gap-1 sm:gap-1.5 shadow-2xl relative overflow-hidden">
              {/* Hoa văn chìm trên vải gấm */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

              {/* Chữ thư pháp dọc: NĂM MỚI HẠNH PHÚC BÌNH AN ĐẾN */}
              {['NĂM', 'MỚI', 'HẠNH', 'PHÚC', 'BÌNH', 'AN', 'ĐẾN'].map((word, i) => (
                <span
                  key={i}
                  className="font-serif font-black text-[9px] sm:text-[11px] md:text-xs text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight tracking-wider"
                >
                  {word}
                </span>
              ))}

              {/* Triện son đỏ vàng may mắn */}
              <div className="mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border border-amber-400/80 bg-red-950 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-amber-300 font-serif shadow-xs">
                CÁT
              </div>
            </div>

            {/* Trục cuốn liễn dưới */}
            <div className="w-12 sm:w-14 md:w-16 h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 border border-amber-200 shadow-md my-0.5 flex justify-between px-0.5">
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
            </div>

            {/* Đồng tiền vàng phong thủy & Tua rua vàng kim */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border border-amber-200 shadow-md flex items-center justify-center p-0.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-red-900 border border-amber-300/80" />
              </div>
              <div className="w-1 h-5 sm:h-7 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 rounded-b-md shadow-xs animate-pulse" />
            </div>
          </div>

          {/* LIỄN BÊN PHẢI: NGÀY XUÂN VINH HOA PHÚ QUÝ VỀ */}
          <div
            className={`absolute top-14 sm:top-16 right-1 sm:right-2 md:right-3 z-20 flex flex-col items-center drop-shadow-xl transition-all ${
              isMini ? 'scale-50 origin-top-right' : 'scale-90 sm:scale-95 md:scale-100 origin-top-right'
            }`}
          >
            {/* Dây treo ngọc đỏ */}
            <div className="w-0.5 h-4 sm:h-6 bg-amber-400" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-xs ring-1 ring-amber-200" />

            {/* Trục cuốn liễn trên */}
            <div className="w-12 sm:w-14 md:w-16 h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 border border-amber-200 shadow-md my-0.5 flex justify-between px-0.5">
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
            </div>

            {/* Thân liễn đỏ lụa gấm */}
            <div className="w-9 sm:w-11 md:w-13 bg-gradient-to-b from-[#991B1B] via-[#7F1D1D] to-[#991B1B] border-x-2 border-y border-amber-400 rounded-sm py-2 px-1 flex flex-col items-center gap-1 sm:gap-1.5 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

              {/* Chữ thư pháp dọc: NGÀY XUÂN VINH HOA PHÚ QUÝ VỀ */}
              {['NGÀY', 'XUÂN', 'VINH', 'HOA', 'PHÚ', 'QUÝ', 'VỀ'].map((word, i) => (
                <span
                  key={i}
                  className="font-serif font-black text-[9px] sm:text-[11px] md:text-xs text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight tracking-wider"
                >
                  {word}
                </span>
              ))}

              {/* Triện son đỏ vàng may mắn */}
              <div className="mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border border-amber-400/80 bg-red-950 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-amber-300 font-serif shadow-xs">
                LỘC
              </div>
            </div>

            {/* Trục cuốn liễn dưới */}
            <div className="w-12 sm:w-14 md:w-16 h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 border border-amber-200 shadow-md my-0.5 flex justify-between px-0.5">
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
              <span className="w-1.5 h-full rounded-full bg-amber-900/60" />
            </div>

            {/* Đồng tiền vàng phong thủy & Tua rua vàng kim */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border border-amber-200 shadow-md flex items-center justify-center p-0.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-red-900 border border-amber-300/80" />
              </div>
              <div className="w-1 h-5 sm:h-7 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 rounded-b-md shadow-xs animate-pulse" />
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          2. THEME MÙA HÈ: MÁT ÁNH NẮNG CHIẾU (SUN RAYS CANOPY)
         ========================================================= */}
      {themeId === 'summer' && (
        <>
          {/* Luminous Sunburst Beam at Top Left */}
          <div className="absolute -top-16 -left-16 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-radial from-yellow-300/35 via-amber-300/15 to-transparent blur-2xl pointer-events-none" />

          {/* Radiant Diagonal Sun Rays SVG */}
          <svg
            viewBox="0 0 1000 600"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-screen"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sunray-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.7" />
                <stop offset="40%" stopColor="#fde047" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sunray-grad-2" x1="0%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fef08a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Sun Rays beaming diagonally downwards across the board */}
            <polygon points="0,0 220,600 320,600 0,0" fill="url(#sunray-grad-1)" />
            <polygon points="0,0 420,600 550,600 0,0" fill="url(#sunray-grad-2)" />
            <polygon points="0,0 680,600 820,600 0,0" fill="url(#sunray-grad-1)" />
            <polygon points="0,0 900,450 1000,500 0,0" fill="url(#sunray-grad-2)" />

            {/* Soft Sun Disk in corner */}
            <circle cx="20" cy="20" r="100" fill="#fef08a" opacity="0.35" />
            <circle cx="20" cy="20" r="50" fill="#ffffff" opacity="0.6" />
          </svg>
        </>
      )}

      {/* =========================================================
          3. THEME MÙA THU: GIÓ THU HEO MAY CUỐN LÁ
         ========================================================= */}
      {themeId === 'autumn' && (
        <>
          {/* Subtle Golden Harvest Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-radial from-amber-400/20 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />

          {/* Streamlined Autumn Wind Swirl SVG */}
          <svg
            viewBox="0 0 1000 400"
            className="absolute inset-x-0 top-1/4 w-full h-auto pointer-events-none opacity-20"
            fill="none"
          >
            <path
              d="M-50 120 Q 250 40 500 140 T 1050 90"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="8 12"
            />
            <path
              d="M-50 160 Q 300 240 600 130 T 1050 180"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="12 16"
            />
          </svg>
        </>
      )}

      {/* =========================================================
          4. THEME MÙA ĐÔNG: VIỀN NHŨ BĂNG TUYẾT PHA LÊ (ICICLES)
         ========================================================= */}
      {themeId === 'winter' && (
        <>
          {/* Top Edge Frost & Crystal Icicles Fringe */}
          <div className="absolute top-0 inset-x-0 h-10 sm:h-12 pointer-events-none opacity-85 z-20">
            <svg
              viewBox="0 0 1000 50"
              preserveAspectRatio="none"
              className="w-full h-full text-sky-100 fill-current drop-shadow-[0_2px_8px_rgba(186,230,253,0.6)]"
            >
              <path d="M0 0 L1000 0 L1000 6 Q985 24 980 6 Q965 32 955 6 Q935 42 925 6 Q910 20 900 6 Q885 36 875 6 Q850 48 840 6 Q820 22 810 6 Q790 38 780 6 Q750 44 740 6 Q720 26 710 6 Q685 46 675 6 Q655 20 645 6 Q620 40 610 6 Q580 48 570 6 Q550 22 540 6 Q515 36 505 6 Q485 45 475 6 Q450 20 440 6 Q415 38 405 6 Q380 46 370 6 Q345 22 335 6 Q310 42 300 6 Q275 28 265 6 Q240 48 230 6 Q205 20 195 6 Q170 36 160 6 Q135 44 125 6 Q100 24 90 6 Q65 42 55 6 Q30 20 20 6 Q10 16 0 6 Z" />
            </svg>
          </div>

          {/* Winter Frost Vignette Corners */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#bae6fd15,transparent_60%)] pointer-events-none" />
        </>
      )}

      {/* =========================================================
          5. THEME MÙA XUÂN: ÉN LƯỢN ĐÓN XUÂN
         ========================================================= */}
      {themeId === 'spring' && (
        <div className="absolute top-10 right-12 w-48 h-32 opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 120" className="w-full h-full fill-emerald-800 text-emerald-800">
            {/* Pair of Spring Swallows in sky */}
            <path d="M40 30 Q60 15 90 22 Q75 35 60 38 L45 55 L55 42 Q30 40 40 30 Z" />
            <path d="M120 60 Q135 48 160 54 Q148 64 136 67 L124 80 L132 70 Q112 68 120 60 Z" />
          </svg>
        </div>
      )}

      {/* =========================================================
          6. THEME HOÀNG KIM: DÁT VÀNG HOÀNG GIA & KHUNG VIỀN 24K
         ========================================================= */}
      {themeId === 'luxury' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle Royal Damask Watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(#fbbf24_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-radial from-amber-500/10 to-transparent blur-3xl" />
        </div>
      )}
    </div>
  );
};
