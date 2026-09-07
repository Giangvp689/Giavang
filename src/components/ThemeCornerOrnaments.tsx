import React from 'react';
import { TvThemeId } from '../types';

interface CornerProps {
  themeId: TvThemeId;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  isMini: boolean;
  cornerSize?: 'normal' | 'large' | 'extralarge';
}

export const ThemeCornerOrnament: React.FC<CornerProps> = ({
  themeId,
  position,
  isMini,
  cornerSize = 'large'
}) => {
  if (themeId === 'none') return null;

  const isRight = position === 'bottom-right' || position === 'top-right';

  // Slender vertical proportions hugging outer border
  let scaleClass = 'w-14 h-72 sm:w-16 sm:h-80 md:w-20 md:h-[400px] lg:w-24 lg:h-[440px] xl:w-28 xl:h-[490px]';
  if (isMini) {
    scaleClass = 'w-8 h-28 sm:w-9 sm:h-36';
  } else if (cornerSize === 'extralarge') {
    scaleClass = 'w-16 h-80 sm:w-20 sm:h-96 md:w-24 md:h-[450px] lg:w-28 lg:h-[500px] xl:w-32 xl:h-[560px]';
  } else if (cornerSize === 'normal') {
    scaleClass = 'w-12 h-60 sm:w-14 sm:h-72 md:w-17 md:h-80 lg:w-20 lg:h-[380px]';
  }

  const uniqueId = `ornament-${themeId}-${position}-${isMini ? 'm' : 'f'}`;

  return (
    <svg
      viewBox="0 0 110 440"
      className={`${scaleClass} transition-all duration-300 pointer-events-none drop-shadow-[0_4px_12px_rgba(212,175,55,0.22)] ${isRight ? '-scale-x-100' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Imperial 24K Polished Gold Gradient */}
        <linearGradient id={`${uniqueId}-gold`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#85581A" />
          <stop offset="25%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#FFF2B2" />
          <stop offset="75%" stopColor="#E5C158" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>

        {/* Pure Champagne Gold Ribbon */}
        <linearGradient id={`${uniqueId}-champagne`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="50%" stopColor="#F5D77F" />
          <stop offset="100%" stopColor="#C8963E" />
        </linearGradient>

        {/* Imperial Jade & Emerald Gradient */}
        <linearGradient id={`${uniqueId}-jade`} x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#064E3B" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="70%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>

        {/* Ruby Silk Gradient (Đào Thắm Hoàng Gia) */}
        <linearGradient id={`${uniqueId}-ruby`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#881337" />
          <stop offset="40%" stopColor="#E11D48" />
          <stop offset="70%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#FFE4E6" />
        </linearGradient>

        {/* Amber & Golden Topaz (Mùa Thu) */}
        <linearGradient id={`${uniqueId}-amber`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="40%" stopColor="#D97706" />
          <stop offset="70%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>

        {/* Platinum Ice & Sapphire Crystal (Mùa Đông) */}
        <linearGradient id={`${uniqueId}-frost`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="40%" stopColor="#1E293B" />
          <stop offset="75%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        {/* Lotus Silk & Rose Quartz (Mùa Hè) */}
        <linearGradient id={`${uniqueId}-lotus`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#9D174D" />
          <stop offset="50%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#FFF1F2" />
        </linearGradient>
      </defs>

      {/* 1. THEME TẾT: Cành Đào Thắm (Trái) & Cành Mai Vàng (Phải) Chạm Lọng Kim Hoàn Quý Phái */}
      {themeId === 'tet' && (
        <g>
          {/* Thân cành uốn lượn thon gọn theo lối vẽ Kim Hoàn cung đình */}
          <path
            d="M 2 440 C 22 390, 24 330, 18 280 C 12 225, 28 170, 22 110 C 17 65, 26 30, 20 2"
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 18 280 C 36 250, 52 220, 48 185 M 22 170 C 40 140, 56 105, 50 70 M 20 80 C 32 55, 42 35, 38 12"
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Đường chỉ vàng 24K phản chiếu ánh kim thanh mảnh */}
          <path
            d="M 4 435 C 23 388, 25 332, 19 282"
            stroke="#FFF2B2"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {isRight ? (
            /* HOA MAI HOÀNG KIM 24K (Viền Phải): Cánh hoa mai kim hoàn dát vàng nhiều lớp nhụy đính đá ruby */
            <>
              {/* Đỉnh ngọn: Đóa Mai Hoàng Kim vươn cao đón nắng */}
              <g transform="translate(20, 22)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -4 -7, -3 -12, 0 -14 C 3 -12, 4 -7, 0 0 Z"
                    fill={`url(#${uniqueId}-champagne)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="3.2" fill="#B91C1C" />
                <circle cx="0" cy="0" r="1.5" fill="#FFF2B2" />
              </g>

              {/* Hoa mai 2 (y = 70) */}
              <g transform="translate(50, 70) scale(1.1)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -4.5 -8, -3.5 -13, 0 -15 C 3.5 -13, 4.5 -8, 0 0 Z"
                    fill={`url(#${uniqueId}-champagne)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="3.5" fill="#B91C1C" />
                <circle cx="0" cy="0" r="1.6" fill="#FFF2B2" />
              </g>

              {/* Hoa mai 3 (y = 185) */}
              <g transform="translate(48, 185)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -4 -7, -3 -12, 0 -14 C 3 -12, 4 -7, 0 0 Z"
                    fill={`url(#${uniqueId}-champagne)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="3" fill="#B91C1C" />
              </g>

              {/* Hoa mai 4 (y = 280) */}
              <g transform="translate(18, 280) scale(0.9)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -4 -7, -3 -12, 0 -14 C 3 -12, 4 -7, 0 0 Z"
                    fill={`url(#${uniqueId}-champagne)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="2.8" fill="#B91C1C" />
              </g>

              {/* Kim Nguyên Bảo 9999 đúc vàng hoàng gia */}
              <g transform="translate(44, 130) scale(0.95)">
                <path d="M -9 4 L 9 4 C 11 0, 13 -2, 11 -4 L -11 -4 C -13 -2, -11 0, -9 4 Z" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.8" />
                <ellipse cx="0" cy="-4" rx="9.5" ry="3.5" fill="#FFF2B2" stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.8" />
                <circle cx="0" cy="-4.5" r="2.5" fill="#D4AF37" />
              </g>

              {/* Đồng tiền phong thủy vàng ròng chạm lọng */}
              <g transform="translate(30, 95)">
                <circle cx="0" cy="0" r="7.5" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="1" />
                <rect x="-2.5" y="-2.5" width="5" height="5" fill="#FFFBEB" rx="0.5" stroke="#AA771C" strokeWidth="0.6" />
              </g>
            </>
          ) : (
            /* HOA ĐÀO BÍCH HOÀNG CUNG (Viền Trái): Cánh lụa hồng ngọc viền chỉ vàng 24K */
            <>
              {/* Đỉnh ngọn: Hoa đào thắm nở rộ */}
              <g transform="translate(20, 22)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -4.5 -7, -4 -12, 0 -14 C 4 -12, 4.5 -7, 0 0 Z"
                    fill={`url(#${uniqueId}-ruby)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="3.2" fill="#881337" />
                <circle cx="0" cy="0" r="1.5" fill="#FFF2B2" />
              </g>

              {/* Hoa đào 2 (y = 70) */}
              <g transform="translate(50, 70) scale(1.1)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -5 -8, -4 -13, 0 -15 C 4 -13, 5 -8, 0 0 Z"
                    fill={`url(#${uniqueId}-ruby)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="3.5" fill="#881337" />
                <circle cx="0" cy="0" r="1.6" fill="#FFF2B2" />
              </g>

              {/* Hoa đào 3 (y = 185) */}
              <g transform="translate(48, 185)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -4.5 -7, -4 -12, 0 -14 C 4 -12, 4.5 -7, 0 0 Z"
                    fill={`url(#${uniqueId}-ruby)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="3" fill="#881337" />
              </g>

              {/* Hoa đào 4 (y = 280) */}
              <g transform="translate(18, 280) scale(0.9)">
                {[0, 72, 144, 216, 288].map((rot, idx) => (
                  <path
                    key={idx}
                    d="M 0 0 C -4.5 -7, -4 -12, 0 -14 C 4 -12, 4.5 -7, 0 0 Z"
                    fill={`url(#${uniqueId}-ruby)`}
                    stroke={`url(#${uniqueId}-gold)`}
                    strokeWidth="0.8"
                    transform={`rotate(${rot})`}
                  />
                ))}
                <circle cx="0" cy="0" r="2.8" fill="#881337" />
              </g>

              {/* Thẻ bài gấm lụa Phúc Lộc mạ vàng */}
              <g transform="translate(44, 130) scale(0.9)">
                <rect x="-7" y="-11" width="14" height="22" rx="3" fill="#991B1B" stroke={`url(#${uniqueId}-gold)`} strokeWidth="1.2" />
                <circle cx="0" cy="-3" r="3.5" fill={`url(#${uniqueId}-gold)`} />
                <path d="M 0 11 L 0 19 M -2 19 L 2 19" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* Đồng tiền phong thủy vàng ròng */}
              <g transform="translate(30, 95)">
                <circle cx="0" cy="0" r="7.5" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="1" />
                <rect x="-2.5" y="-2.5" width="5" height="5" fill="#FFFBEB" rx="0.5" stroke="#AA771C" strokeWidth="0.6" />
              </g>
            </>
          )}

          {/* Lộc non ngọc bích điểm vàng vươn lên */}
          <path d="M 38 12 C 40 4, 46 2, 44 -4 C 42 2, 36 6, 38 12 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.6" />
          <path d="M 52 140 C 56 132, 62 130, 60 124 C 57 128, 51 133, 52 140 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.6" />
          <path d="M 28 230 C 32 222, 38 220, 36 214 C 33 218, 27 223, 28 230 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.6" />

          {/* Tia kim cương 4 cánh tỏa sáng sang trọng */}
          <path d="M 40 45 L 41.5 50 L 46.5 51.5 L 41.5 53 L 40 58 L 38.5 53 L 33.5 51.5 L 38.5 50 Z" fill="#FFF2B2" />
          <path d="M 32 210 L 33 214 L 37 215 L 33 216 L 32 220 L 31 216 L 27 215 L 31 214 Z" fill="#FFF2B2" />
        </g>
      )}

      {/* 2. THEME MÙA XUÂN: Trúc Ngọc Bích Nạm Vàng 24K (Imperial Jade & Gold Bamboo) */}
      {themeId === 'spring' && (
        <g>
          {/* Thân trúc ngọc bích thon gọn, quý phái */}
          <path d="M 6 440 L 10 335" stroke={`url(#${uniqueId}-jade)`} strokeWidth="5" strokeLinecap="round" />
          <rect x="5" y="331" width="10" height="3" rx="1.5" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.5" />

          <path d="M 11 330 L 15 225" stroke={`url(#${uniqueId}-jade)`} strokeWidth="4.2" strokeLinecap="round" />
          <rect x="10" y="221" width="9" height="3" rx="1.5" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.5" />

          <path d="M 16 220 L 20 115" stroke={`url(#${uniqueId}-jade)`} strokeWidth="3.5" strokeLinecap="round" />
          <rect x="15" y="111" width="8" height="2.8" rx="1.5" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.5" />

          <path d="M 21 110 L 24 15" stroke={`url(#${uniqueId}-jade)`} strokeWidth="3" strokeLinecap="round" />

          {/* Nhánh trúc thanh thoát mạ vàng vươn cao */}
          <path d="M 11 330 C 24 305, 38 275, 48 245" stroke={`url(#${uniqueId}-gold)`} strokeWidth="2" strokeLinecap="round" />
          <path d="M 16 220 C 30 195, 44 165, 54 135" stroke={`url(#${uniqueId}-gold)`} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 21 110 C 32 85, 46 60, 52 30" stroke={`url(#${uniqueId}-gold)`} strokeWidth="1.5" strokeLinecap="round" />

          {/* Lá trúc ngọc vuốt nhọn viền chỉ vàng óng ánh */}
          <path d="M 24 15 C 28 5, 36 0, 32 -10 C 26 -2, 22 5, 24 15 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.7" />
          <path d="M 24 15 C 32 10, 42 8, 48 2 C 40 4, 30 6, 24 15 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.7" />
          <path d="M 52 30 C 60 22, 68 18, 74 10 C 66 14, 56 18, 52 30 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.7" />
          <path d="M 54 135 C 64 125, 75 120, 82 110 C 72 116, 62 120, 54 135 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.7" />
          <path d="M 48 245 C 58 235, 68 230, 75 220 C 66 226, 56 230, 48 245 Z" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.7" />

          {/* Bướm phượng hoàng kim cánh lụa dát vàng bay lượn */}
          <g transform="translate(62, 65) scale(0.9)">
            <path d="M 0 0 C 8 -10, 16 -8, 14 2 C 12 7, 4 5, 0 0 Z" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.6" />
            <path d="M 0 0 C -8 -10, -16 -8, -14 2 C -12 7, -4 5, 0 0 Z" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="1.5" fill="#881337" />
          </g>

          {/* Hạt bụi ngọc & tia sáng lấp lánh */}
          <circle cx="28" cy="180" r="1.5" fill="#FFF2B2" />
          <circle cx="42" cy="90" r="1.5" fill="#FFF2B2" />
        </g>
      )}

      {/* 3. THEME MÙA HÈ: Kim Liên Cung Đình & Hướng Dương Hoàng Gia (Royal Lotus & Sunflower) */}
      {themeId === 'summer' && (
        <g>
          {/* Cuống sen ngọc bích viền vàng thanh tao */}
          <path
            d="M 6 440 C 14 360, 18 280, 20 200 C 22 130, 24 70, 26 25"
            stroke={`url(#${uniqueId}-jade)`}
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <path
            d="M 20 200 C 32 170, 46 140, 50 105"
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Lá sen ngọc xòe dáng chén ngọc hứng tài lộc */}
          <g transform="translate(24, 320)">
            <ellipse cx="0" cy="0" rx="18" ry="8" fill={`url(#${uniqueId}-jade)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="1" />
            <line x1="0" y1="0" x2="-12" y2="-4" stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.6" />
            <line x1="0" y1="0" x2="12" y2="-4" stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.6" />
            <circle cx="2" cy="-2" r="2" fill="#FFF2B2" opacity="0.9" />
          </g>

          {/* Đóa Hoa Hướng Dương Hoàng Kim (ở y = 105) */}
          <g transform="translate(50, 105) scale(0.95)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, idx) => (
              <ellipse
                key={idx}
                cx="0"
                cy="-10"
                rx="3.5"
                ry="7"
                fill={`url(#${uniqueId}-champagne)`}
                stroke={`url(#${uniqueId}-gold)`}
                strokeWidth="0.6"
                transform={`rotate(${rot})`}
              />
            ))}
            <circle cx="0" cy="0" r="6" fill={`url(#${uniqueId}-amber)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="1" />
            <circle cx="0" cy="0" r="2.5" fill="#FFF2B2" />
          </g>

          {/* Đóa Sen Cung Đình Dát Vàng (ở y = 25) */}
          <g transform="translate(26, 25)">
            {/* Cánh sen hồng ngọc viền vàng kim */}
            <path d="M 0 -16 C -8 -6, -9 4, 0 8 C 9 4, 8 -6, 0 -16 Z" fill={`url(#${uniqueId}-lotus)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.9" />
            <path d="M -5 -8 C -11 0, -9 6, -3 8 C -3 4, -4 -2, -5 -8 Z" fill={`url(#${uniqueId}-lotus)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.7" />
            <path d="M 5 -8 C 11 0, 9 6, 3 8 C 3 4, 4 -2, 5 -8 Z" fill={`url(#${uniqueId}-lotus)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.7" />
            <ellipse cx="0" cy="8" rx="4" ry="2" fill={`url(#${uniqueId}-gold)`} />
          </g>

          {/* Hạt đom đóm hoàng kim dạ quang lấp lánh */}
          <circle cx="44" cy="50" r="2.5" fill="#FFF2B2" />
          <circle cx="34" cy="225" r="2" fill="#FFF2B2" />
        </g>
      )}

      {/* 4. THEME MÙA THU: Phong Hổ Phách Dát Vàng (Amber & Gold Maple) */}
      {themeId === 'autumn' && (
        <g>
          {/* Cành phong gỗ trầm dát chỉ vàng */}
          <path
            d="M 2 440 C 20 395, 22 345, 18 290 C 14 235, 26 175, 22 115 C 18 70, 26 35, 22 2 M 18 290 C 36 260, 48 225, 44 195 M 22 170 C 40 140, 52 105, 46 75"
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Lá phong chạm khắc kim hoàn với gân dát vàng óng ả */}
          <g transform="translate(22, 25) scale(0.95)">
            <path d="M0 -14 L3 -6 L11 -7 L7 -1 L12 4 L5 4 L0 10 L-5 4 L-12 4 L-7 -1 L-11 -7 L-3 -6 Z" fill={`url(#${uniqueId}-amber)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.8" />
          </g>
          <g transform="translate(46, 75) scale(0.9)">
            <path d="M0 -14 L3 -6 L11 -7 L7 -1 L12 4 L5 4 L0 10 L-5 4 L-12 4 L-7 -1 L-11 -7 L-3 -6 Z" fill={`url(#${uniqueId}-amber)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.8" />
          </g>
          <g transform="translate(22, 170) scale(0.85)">
            <path d="M0 -14 L3 -6 L11 -7 L7 -1 L12 4 L5 4 L0 10 L-5 4 L-12 4 L-7 -1 L-11 -7 L-3 -6 Z" fill={`url(#${uniqueId}-amber)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.8" />
          </g>
          <g transform="translate(44, 195) scale(0.85)">
            <path d="M0 -14 L3 -6 L11 -7 L7 -1 L12 4 L5 4 L0 10 L-5 4 L-12 4 L-7 -1 L-11 -7 L-3 -6 Z" fill={`url(#${uniqueId}-amber)`} stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.8" />
          </g>

          {/* Chùm ngọc hồ lô vàng 9999 chiêu tài cát tường */}
          <g transform="translate(34, 120)">
            <circle cx="0" cy="0" r="4.5" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.7" />
            <circle cx="0" cy="-6" r="3" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.7" />
            <circle cx="0" cy="-6" r="1" fill="#FFF2B2" />
          </g>
        </g>
      )}

      {/* 5. THEME MÙA ĐÔNG: Bạch Kim Tùng Bách & Chuông Cung Đình (Platinum Pine & Royal Bell) */}
      {themeId === 'winter' && (
        <g>
          {/* Thân tùng bạch kim phủ sương tuyết pha lê */}
          <path
            d="M 2 440 C 18 395, 20 345, 18 290 C 14 235, 24 175, 20 115 C 16 70, 24 35, 20 2"
            stroke={`url(#${uniqueId}-frost)`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line x1="18" y1="290" x2="42" y2="260" stroke={`url(#${uniqueId}-frost)`} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="20" y1="180" x2="44" y2="150" stroke={`url(#${uniqueId}-frost)`} strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="80" x2="40" y2="55" stroke={`url(#${uniqueId}-frost)`} strokeWidth="1.8" strokeLinecap="round" />

          {/* Kim tùng xanh ngọc viền ánh bạc bạch kim */}
          <g transform="translate(20, 30)">
            <line x1="0" y1="0" x2="16" y2="-12" stroke="#0F766E" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="0" y1="0" x2="20" y2="-4" stroke="#14B8A6" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="0" y1="0" x2="16" y2="6" stroke="#0F766E" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0 -2 Q 10 -10, 16 -12" stroke="#F8FAFC" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          <g transform="translate(44, 150)">
            <line x1="0" y1="0" x2="18" y2="-10" stroke="#0F766E" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="0" y1="0" x2="22" y2="-2" stroke="#14B8A6" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0 -2 Q 12 -8, 18 -10" stroke="#F8FAFC" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Quả Chuông Vàng Cung Đình đính dải lụa đỏ ruby */}
          <g transform="translate(26, 210) scale(0.9)">
            <path d="M -7 10 C -7 3, -10 -2, -12 -4 L 12 -4 C 10 -2, 7 3, 7 10 Z" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.9" />
            <ellipse cx="0" cy="10" rx="7" ry="2" fill="#AA771C" />
            <circle cx="0" cy="12" r="2" fill="#FFF2B2" />
            <circle cx="0" cy="-5" r="2.5" fill="#991B1B" />
          </g>

          {/* Bông tuyết pha lê 6 cánh */}
          <g transform="translate(42, 90) scale(0.7)">
            {[0, 60, 120].map((deg, i) => (
              <line key={i} x1="-8" y1="0" x2="8" y2="0" stroke="#E2E8F0" strokeWidth="1.2" transform={`rotate(${deg})`} />
            ))}
            <circle cx="0" cy="0" r="1.5" fill="#FFF2B2" />
          </g>
        </g>
      )}

      {/* 6. THEME HOÀNG KIM (LUXURY): Cây Kim Tiền 24K Hoàng Gia - Đẳng Cấp Kim Hoàn Đỉnh Cao */}
      {themeId === 'luxury' && (
        <g>
          {/* Thân cây đúc vàng ròng 24K uốn lượn thon thả thế Long Vũ */}
          <path
            d="M 2 440 C 22 395, 26 340, 20 290 C 14 235, 28 175, 22 115 C 16 70, 26 35, 20 2"
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <path
            d="M 20 290 C 38 260, 52 225, 46 190 M 22 170 C 40 140, 54 105, 48 70"
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 4 435 C 23 392, 27 342, 21 292"
            stroke="#FFF2B2"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Hoa mai vàng ròng đính hạt ngọc ruby đỏ */}
          <g transform="translate(20, 25)">
            {[0, 72, 144, 216, 288].map((rot, idx) => (
              <ellipse
                key={idx}
                cx="0"
                cy="-10"
                rx="4"
                ry="7"
                fill={`url(#${uniqueId}-champagne)`}
                stroke={`url(#${uniqueId}-gold)`}
                strokeWidth="0.8"
                transform={`rotate(${rot})`}
              />
            ))}
            <circle cx="0" cy="0" r="3.5" fill="#991B1B" />
            <circle cx="0" cy="0" r="1.6" fill="#FFF2B2" />
          </g>

          {/* Đồng Tiền Vàng Hoàng Cung Chiêu Tài Tấn Bảo */}
          <g transform="translate(48, 70) scale(0.95)">
            <circle cx="0" cy="0" r="13" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="10" fill={`url(#${uniqueId}-champagne)`} stroke="#AA771C" strokeWidth="0.6" />
            <rect x="-3.5" y="-3.5" width="7" height="7" fill="#991B1B" rx="1" stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.8" />
          </g>

          {/* Thỏi Vàng Kim Nguyên Bảo 9999 Hoàng Gia */}
          <g transform="translate(46, 190) scale(0.95)">
            <path d="M -9 4 L 9 4 C 11 0, 13 -2, 11 -4 L -11 -4 C -13 -2, -11 0, -9 4 Z" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="0.9" />
            <ellipse cx="0" cy="-4" rx="9.5" ry="3.5" fill="#FFF2B2" stroke={`url(#${uniqueId}-gold)`} strokeWidth="0.8" />
            <circle cx="0" cy="-4.5" r="2.5" fill="#D4AF37" />
          </g>

          {/* Đồng tiền phong thủy vàng ròng */}
          <g transform="translate(24, 170) scale(0.85)">
            <circle cx="0" cy="0" r="10" fill={`url(#${uniqueId}-gold)`} stroke="#85581A" strokeWidth="1.2" />
            <rect x="-3" y="-3" width="6" height="6" fill="#FFFBEB" rx="0.8" stroke="#AA771C" strokeWidth="0.6" />
          </g>

          {/* Ngôi sao Kim Cương Ánh Sáng Vàng Hoàng Gia tỏa rạng 8 hướng */}
          <path d="M 36 120 L 38 126 L 44 128 L 38 130 L 36 136 L 34 130 L 28 128 L 34 126 Z" fill="#FFF2B2" />
          <path d="M 30 250 L 32 255 L 37 257 L 32 259 L 30 264 L 28 259 L 23 257 L 28 255 Z" fill="#FFF2B2" />
        </g>
      )}
    </svg>
  );
};
