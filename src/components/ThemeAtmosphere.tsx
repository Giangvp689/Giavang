import React, { useEffect, useRef } from 'react';
import { TvThemeId } from '../types';
import { ThemeCornerOrnament } from './ThemeCornerOrnaments';
import { ThemeBackdropDecorations } from './ThemeBackdropDecorations';

interface ThemeAtmosphereProps {
  themeId?: TvThemeId | string;
  effectEnabled?: boolean;
  intensity?: 'light' | 'normal' | 'rich';
  showCorners?: boolean;
  cornerSize?: 'normal' | 'large' | 'extralarge';
  isMiniPreview?: boolean;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  flipPhase: number;
  flipSpeed: number;
  phase: number;
  phaseSpeed: number;
  wingPhase: number;
  life: number;
  maxLife: number;
  opacity: number;
  baseOpacity: number;
  kind: number; // 0, 1, 2, 3
  color: string;
}

export const ThemeAtmosphere: React.FC<ThemeAtmosphereProps> = ({
  themeId = 'tet',
  effectEnabled = true,
  intensity = 'normal',
  showCorners = true,
  cornerSize = 'large',
  isMiniPreview = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const safeThemeId: TvThemeId = (themeId && ['none', 'tet', 'spring', 'summer', 'autumn', 'winter', 'luxury'].includes(themeId))
    ? (themeId as TvThemeId)
    : 'tet';

  const safeCornerSize: 'normal' | 'large' | 'extralarge' =
    (cornerSize === 'normal' || cornerSize === 'extralarge') ? cornerSize : 'large';

  useEffect(() => {
    if (!effectEnabled || safeThemeId === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Determine particle count based on intensity & preview mode
    let count = 42;
    if (isMiniPreview) {
      count = 16;
    } else {
      if (intensity === 'light') count = 24;
      else if (intensity === 'rich') count = 68;
    }

    const particles: Particle[] = [];

    // Color palettes per theme
    const getPalette = (tId: TvThemeId) => {
      switch (tId) {
        case 'tet':
          return ['#ffd700', '#f59e0b', '#facc15', '#fef08a', '#ef4444', '#fda4af', '#fbbf24'];
        case 'spring':
          return ['#34d399', '#10b981', '#f472b6', '#fb7185', '#fde047', '#38bdf8'];
        case 'summer':
          return ['#fef08a', '#fde047', '#38bdf8', '#7dd3fc', '#ffffff', '#fbbf24', '#bae6fd'];
        case 'autumn':
          return ['#dc2626', '#ea580c', '#f59e0b', '#d97706', '#b45309', '#fde68a', '#c2410c'];
        case 'winter':
          return ['#ffffff', '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#ffffff'];
        case 'luxury':
        default:
          return ['#fbbf24', '#f59e0b', '#ffd700', '#facc15', '#fef08a', '#fffbeb'];
      }
    };

    const palette = getPalette(safeThemeId);

    // Initialize particles according to theme
    for (let i = 0; i < count; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const baseOp = 0.5 + Math.random() * 0.45;

      let speedX = (Math.random() - 0.5) * 0.5;
      let speedY = 0.8 + Math.random() * 0.9;
      let rotSpeed = (Math.random() - 0.5) * 0.04;
      let pSize = (isMiniPreview ? 6 : 10) + Math.random() * (isMiniPreview ? 6 : 12);
      let kind = Math.floor(Math.random() * 4);

      if (safeThemeId === 'tet') {
        // TẾT: Tiền vàng & Kim Nguyên Bảo rơi từ trên xuống
        speedX = (Math.random() - 0.5) * 0.7;
        speedY = (isMiniPreview ? 0.6 : 0.9) + Math.random() * (isMiniPreview ? 0.8 : 1.2);
        rotSpeed = (Math.random() - 0.5) * 0.035;
        pSize = (isMiniPreview ? 8 : 14) + Math.random() * (isMiniPreview ? 7 : 14);
      } else if (safeThemeId === 'summer') {
        // MÙA HÈ: Ánh nắng chiếu, hạt bụi nắng lơ lửng & bong bóng nước mát bay lên
        if (kind === 0 || kind === 1) {
          // Bong bóng nước bay từ DƯỚI LÊN
          speedX = (Math.random() - 0.5) * 0.4;
          speedY = -0.5 - Math.random() * 0.7;
          pSize = (isMiniPreview ? 6 : 10) + Math.random() * (isMiniPreview ? 8 : 14);
        } else {
          // Hạt bụi nắng lơ lửng chậm chạp trong luồng sáng
          speedX = 0.3 + Math.random() * 0.4;
          speedY = 0.3 + Math.random() * 0.4;
          pSize = (isMiniPreview ? 3 : 5) + Math.random() * (isMiniPreview ? 4 : 7);
        }
      } else if (safeThemeId === 'autumn') {
        // MÙA THU: Gió heo may thổi ngang cuốn lá vàng xoay rơi
        speedX = (isMiniPreview ? 1.4 : 2.2) + Math.random() * (isMiniPreview ? 1.0 : 1.8);
        speedY = 0.35 + Math.random() * 0.55;
        rotSpeed = 0.03 + Math.random() * 0.04;
        pSize = (isMiniPreview ? 8 : 13) + Math.random() * (isMiniPreview ? 6 : 12);
      } else if (safeThemeId === 'winter') {
        // MÙA ĐÔNG: Tuyết rơi đa tầng cực êm đềm
        speedX = (Math.random() - 0.5) * 0.4;
        speedY = (isMiniPreview ? 0.4 : 0.6) + Math.random() * (isMiniPreview ? 0.5 : 0.8);
        rotSpeed = (Math.random() - 0.5) * 0.02;
        pSize = (isMiniPreview ? 4 : 7) + Math.random() * (isMiniPreview ? 6 : 11);
      } else if (safeThemeId === 'spring') {
        // MÙA XUÂN: Đàn én sải cánh chao lượn & hoa đào mai
        if (kind === 0) {
          // Chim én bay ngang
          speedX = (isMiniPreview ? 1.5 : 2.4) + Math.random() * 1.2;
          speedY = (Math.random() - 0.5) * 0.3;
          pSize = (isMiniPreview ? 12 : 20) + Math.random() * (isMiniPreview ? 6 : 10);
        } else {
          // Hoa mai hoa đào rơi phấp phới
          speedX = 0.6 + Math.random() * 0.7;
          speedY = 0.5 + Math.random() * 0.7;
          pSize = (isMiniPreview ? 6 : 9) + Math.random() * (isMiniPreview ? 5 : 9);
        }
      } else if (safeThemeId === 'luxury') {
        // HOÀNG KIM: Mưa bụi vàng 24K rơi nhẹ & quầng sáng bokeh
        if (kind === 0 || kind === 1) {
          // Bụi vàng ròng 24K rơi thẳng lấp lánh
          speedX = (Math.random() - 0.5) * 0.2;
          speedY = (isMiniPreview ? 0.7 : 1.1) + Math.random() * (isMiniPreview ? 0.6 : 1.0);
          pSize = (isMiniPreview ? 3 : 5) + Math.random() * (isMiniPreview ? 3 : 6);
        } else {
          // Quầng sáng Bokeh lơ lửng tại chỗ
          speedX = 0;
          speedY = 0;
          pSize = (isMiniPreview ? 12 : 22) + Math.random() * (isMiniPreview ? 14 : 32);
        }
      }

      particles.push({
        x: rx,
        y: ry,
        baseX: rx,
        baseY: ry,
        size: pSize,
        speedX,
        speedY,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed,
        flipPhase: Math.random() * Math.PI * 2,
        flipSpeed: 0.04 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.02 + Math.random() * 0.03,
        wingPhase: Math.random() * Math.PI * 2,
        life: Math.floor(Math.random() * 120),
        maxLife: 100 + Math.floor(Math.random() * 80),
        opacity: baseOp,
        baseOpacity: baseOp,
        kind,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    let tick = 0;

    // =========================================================================
    // CANVAS DRAWING HELPERS (ĐỒNG TIỀN VÀNG, THỎI VÀNG, HOA, LÁ, TUYẾT, NẮNG)
    // =========================================================================

    // 1. Thỏi Vàng Nén Kim Nguyên Bảo 9999 (Sycee Ingot)
    const drawGoldIngot = (c: CanvasRenderingContext2D, size: number) => {
      const s = size * 0.9;
      // Ingot boat base
      const grad = c.createLinearGradient(-s * 0.8, -s * 0.4, s * 0.8, s * 0.5);
      grad.addColorStop(0, '#d97706');
      grad.addColorStop(0.3, '#fde047');
      grad.addColorStop(0.6, '#ffd700');
      grad.addColorStop(1, '#b45309');

      c.fillStyle = grad;
      c.beginPath();
      // Boat bottom curvature
      c.moveTo(-s * 0.9, -s * 0.2);
      c.quadraticCurveTo(-s * 0.6, s * 0.7, 0, s * 0.75);
      c.quadraticCurveTo(s * 0.6, s * 0.7, s * 0.9, -s * 0.2);
      // Boat top rim
      c.quadraticCurveTo(s * 0.5, -s * 0.05, 0, -s * 0.05);
      c.quadraticCurveTo(-s * 0.5, -s * 0.05, -s * 0.9, -s * 0.2);
      c.closePath();
      c.fill();
      c.strokeStyle = '#fef08a';
      c.lineWidth = 1;
      c.stroke();

      // Raised central golden egg / crown
      const eggGrad = c.createRadialGradient(0, -s * 0.25, s * 0.1, 0, -s * 0.25, s * 0.5);
      eggGrad.addColorStop(0, '#ffffff');
      eggGrad.addColorStop(0.3, '#fef08a');
      eggGrad.addColorStop(0.7, '#f59e0b');
      eggGrad.addColorStop(1, '#b45309');
      c.fillStyle = eggGrad;
      c.beginPath();
      c.ellipse(0, -s * 0.22, s * 0.45, s * 0.32, 0, 0, Math.PI * 2);
      c.fill();

      // Micro specular glint
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(-s * 0.15, -s * 0.32, s * 0.09, 0, Math.PI * 2);
      c.fill();
    };

    // 2. Đồng Tiền Xu Vàng Cổ May Mắn (Gold Coin with Square Hole & 3D Flipping)
    const drawAncientGoldCoin = (c: CanvasRenderingContext2D, size: number, flipScale: number) => {
      const s = size * 0.85;
      c.save();
      // 3D Flip scale effect
      c.scale(flipScale, 1);

      // Outer coin circle with metallic gold gradient
      const coinGrad = c.createLinearGradient(-s, -s, s, s);
      coinGrad.addColorStop(0, '#d97706');
      coinGrad.addColorStop(0.25, '#fef08a');
      coinGrad.addColorStop(0.5, '#ffd700');
      coinGrad.addColorStop(0.85, '#f59e0b');
      coinGrad.addColorStop(1, '#92400e');

      c.fillStyle = coinGrad;
      c.beginPath();
      c.arc(0, 0, s, 0, Math.PI * 2);
      c.fill();

      // Outer embossed rim
      c.strokeStyle = '#fef9c3';
      c.lineWidth = Math.max(1, s * 0.12);
      c.stroke();

      // Inner square cutout (Lỗ vuông đồng tiền cổ)
      const sq = s * 0.38;
      c.fillStyle = '#78350f';
      c.fillRect(-sq / 2, -sq / 2, sq, sq);
      c.strokeStyle = '#fde047';
      c.lineWidth = 1;
      c.strokeRect(-sq / 2, -sq / 2, sq, sq);

      // Specular sheen across face
      c.fillStyle = 'rgba(255, 255, 255, 0.45)';
      c.beginPath();
      c.arc(-s * 0.3, -s * 0.3, s * 0.25, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    // 3. Cánh Hoa Mai Vàng 5 Cánh & Cánh Hoa Đào Hồng
    const drawFlowerPetal = (c: CanvasRenderingContext2D, size: number, color: string) => {
      const s = size * 0.8;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, -s);
      c.bezierCurveTo(s * 0.7, -s * 0.7, s * 0.8, s * 0.3, 0, s);
      c.bezierCurveTo(-s * 0.8, s * 0.3, -s * 0.7, -s * 0.7, 0, -s);
      c.fill();

      // Center vein
      c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -s * 0.7);
      c.lineTo(0, s * 0.7);
      c.stroke();
    };

    // 4. Pháo Hoa Que Mini Nở Lấp Lánh
    const drawSparklerBurst = (c: CanvasRenderingContext2D, size: number, color: string, lifeRatio: number) => {
      const radius = size * (0.35 + 0.8 * lifeRatio);
      const rays = 8;
      c.save();
      for (let i = 0; i < rays; i++) {
        const angle = (i * Math.PI * 2) / rays;
        const x1 = Math.cos(angle) * (radius * 0.25);
        const y1 = Math.sin(angle) * (radius * 0.25);
        const x2 = Math.cos(angle) * radius;
        const y2 = Math.sin(angle) * radius;
        c.strokeStyle = color;
        c.lineWidth = 1.4 * (1 - lifeRatio * 0.5);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(x2, y2, 1.2, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    };

    // 5. Hạt Bụi Nắng Vàng Óng Ánh Mùa Hè
    const drawSunDust = (c: CanvasRenderingContext2D, size: number, color: string) => {
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, size * 1.5, 0, Math.PI * 2);
      c.fill();
    };

    // 6. Bong Bóng Nước Pha Lê Khúc Xạ Cầu Vồng (Mát Rượi)
    const drawBubble = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.save();
      c.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(0, 0, size * 0.8, 0, Math.PI * 2);
      c.stroke();

      const grad = c.createRadialGradient(-size * 0.3, -size * 0.3, size * 0.1, 0, 0, size * 0.8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
      grad.addColorStop(1, 'rgba(244, 114, 182, 0.25)');
      c.fillStyle = grad;
      c.fill();

      // Crescent light reflection
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(-size * 0.35, -size * 0.35, size * 0.22, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    // 7. Lá Phong Đỏ Cam Mùa Thu (Japanese Maple Leaf)
    const drawMapleLeaf = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.fillStyle = color;
      const s = size * 0.75;
      c.beginPath();
      c.moveTo(0, -s * 1.3);
      c.lineTo(s * 0.35, -s * 0.6);
      c.lineTo(s * 1.1, -s * 0.7);
      c.lineTo(s * 0.7, -s * 0.1);
      c.lineTo(s * 1.2, s * 0.4);
      c.lineTo(s * 0.4, s * 0.4);
      c.lineTo(0, s * 1.1);
      c.lineTo(-s * 0.4, s * 0.4);
      c.lineTo(-s * 1.2, s * 0.4);
      c.lineTo(-s * 0.7, -s * 0.1);
      c.lineTo(-s * 1.1, -s * 0.7);
      c.lineTo(-s * 0.35, -s * 0.6);
      c.closePath();
      c.fill();
    };

    // 8. Lá Ngân Hạnh Vàng Óng Mùa Thu (Ginkgo Biloba Leaf)
    const drawGinkgoLeaf = (c: CanvasRenderingContext2D, size: number, color: string) => {
      const s = size * 0.8;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, s * 0.9);
      // Petiole stem
      c.lineTo(0, s * 0.3);
      // Fan curve
      c.bezierCurveTo(-s * 0.9, s * 0.2, -s * 1.1, -s * 0.6, -s * 0.3, -s * 0.9);
      c.quadraticCurveTo(0, -s * 0.6, s * 0.3, -s * 0.9);
      c.bezierCurveTo(s * 1.1, -s * 0.6, s * 0.9, s * 0.2, 0, s * 0.3);
      c.closePath();
      c.fill();
    };

    // 9. Bông Tuyết Pha Lê 6 Cánh Mùa Đông (Intricate Snowflake)
    const drawSnowflake = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.strokeStyle = color;
      c.lineWidth = isMiniPreview ? 1 : 1.5;
      c.lineCap = 'round';
      const r = size * 0.7;
      for (let i = 0; i < 6; i++) {
        c.save();
        c.rotate((i * Math.PI) / 3);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, -r);
        c.moveTo(0, -r * 0.6);
        c.lineTo(-r * 0.3, -r * 0.8);
        c.moveTo(0, -r * 0.6);
        c.lineTo(r * 0.3, -r * 0.8);
        c.moveTo(0, -r * 0.35);
        c.lineTo(-r * 0.2, -r * 0.5);
        c.moveTo(0, -r * 0.35);
        c.lineTo(r * 0.2, -r * 0.5);
        c.stroke();
        c.restore();
      }
    };

    // 10. Chim Én Mùa Xuân Sải Cánh Chao Lượn
    const drawSwallow = (c: CanvasRenderingContext2D, size: number, wingFlap: number) => {
      const s = size * 0.8;
      const flap = Math.sin(wingFlap);
      c.fillStyle = '#1e293b';

      // Swallow body
      c.beginPath();
      c.ellipse(0, 0, s * 0.5, s * 0.14, 0, 0, Math.PI * 2);
      c.fill();

      // Forked tail (Đuôi én chẻ đôi)
      c.beginPath();
      c.moveTo(-s * 0.45, 0);
      c.lineTo(-s * 1.1, -s * 0.25);
      c.lineTo(-s * 0.75, 0);
      c.lineTo(-s * 1.1, s * 0.25);
      c.closePath();
      c.fill();

      // Wings with dynamic flap
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(s * 0.2, flap * s * 1.1, s * 0.6, flap * s * 1.3);
      c.quadraticCurveTo(s * 0.2, flap * s * 0.7, -s * 0.1, flap * s * 0.3);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(-s * 0.2, -flap * s * 1.1, -s * 0.6, -flap * s * 1.3);
      c.quadraticCurveTo(-s * 0.2, -flap * s * 0.7, s * 0.1, -flap * s * 0.3);
      c.closePath();
      c.fill();
    };

    // 11. Mưa Bụi Vàng Ròng 24K (Cascading Gold Dust Streak)
    const drawGoldDustStreak = (c: CanvasRenderingContext2D, size: number, color: string) => {
      const grad = c.createLinearGradient(0, -size * 2.5, 0, size);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0)');
      grad.addColorStop(0.7, color);
      grad.addColorStop(1, '#ffffff');

      c.strokeStyle = grad;
      c.lineWidth = isMiniPreview ? 1.2 : 1.8;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, -size * 2.5);
      c.lineTo(0, size);
      c.stroke();

      // Sparkle bead at tip
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, size, 1.2, 0, Math.PI * 2);
      c.fill();
    };

    // 12. Quầng Sáng Bokeh Vàng Óng & Ngôi Sao Kim Cương 8 Cánh
    const drawBokeh = (c: CanvasRenderingContext2D, size: number, color: string) => {
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, size);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, 'rgba(250, 204, 21, 0.35)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, size, 0, Math.PI * 2);
      c.fill();
    };

    const drawDiamondStar = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.fillStyle = color;
      c.beginPath();
      const outer = size * 0.9;
      const inner = outer * 0.18;
      for (let i = 0; i < 8; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = (i * Math.PI) / 4;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.fill();

      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 0, size * 0.22, 0, Math.PI * 2);
      c.fill();
    };

    // =========================================================================
    // MAIN ANIMATION LOOP
    // =========================================================================
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // A. THEME SUMMER: Dynamic Radiant Sunbeams on Canvas
      if (safeThemeId === 'summer') {
        ctx.save();
        const beamAlpha = 0.12 + 0.05 * Math.sin(tick * 0.02);
        const grad = ctx.createRadialGradient(0, 0, 20, width * 0.5, height * 0.6, width * 0.8);
        grad.addColorStop(0, `rgba(254, 240, 138, ${beamAlpha * 2})`);
        grad.addColorStop(0.4, `rgba(253, 224, 71, ${beamAlpha})`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // B. THEME AUTUMN: Dynamic Wind Trails on Canvas
      if (safeThemeId === 'autumn' && tick % 2 === 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const windY1 = height * 0.35 + Math.sin(tick * 0.015) * 30;
        ctx.moveTo(-50, windY1);
        ctx.bezierCurveTo(width * 0.3, windY1 - 40, width * 0.6, windY1 + 50, width + 50, windY1 - 20);
        ctx.stroke();
        ctx.restore();
      }

      // Render Individual Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();

        if (safeThemeId === 'tet') {
          // 🧧 TẾT: TIỀN VÀNG RƠI & KIM NGUYÊN BẢO 3D & CÁNH HOA ĐÀO MAI
          p.y += p.speedY;
          p.phase += p.phaseSpeed;
          p.x += Math.sin(p.phase) * 0.85;
          p.rotation += p.rotSpeed;
          p.flipPhase += p.flipSpeed;

          // Wrap when reaching bottom
          if (p.y > height + 35) {
            p.y = -35;
            p.x = Math.random() * width;
          }

          const flipScale = Math.cos(p.flipPhase);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;

          if (p.kind === 0) {
            // Thỏi Vàng Nén Kim Nguyên Bảo 9999
            drawGoldIngot(ctx, p.size);
          } else if (p.kind === 1) {
            // Đồng Tiền Xu Vàng Cổ May Mắn Xoay 3D
            drawAncientGoldCoin(ctx, p.size, flipScale);
          } else if (p.kind === 2) {
            // Cánh Hoa Đào Hồng & Hoa Mai Vàng
            drawFlowerPetal(ctx, p.size, p.color);
          } else {
            // Pháo Hoa Que Mini Nở Lấp Lánh
            p.life++;
            if (p.life >= p.maxLife) p.life = 0;
            drawSparklerBurst(ctx, p.size, p.color, p.life / p.maxLife);
          }

        } else if (safeThemeId === 'summer') {
          // ☀️ MÙA HÈ: MÁT ÁNH NẮNG CHIẾU (HẠT BỤI NẮNG VÀNG & BONG BÓNG MÁT BAY LÊN)
          p.y += p.speedY; // Upward for bubbles, downward for motes
          p.phase += p.phaseSpeed;
          p.x += Math.sin(tick * 0.02 + p.phase) * 0.5;

          if (p.speedY < 0 && p.y < -30) {
            p.y = height + 20;
            p.x = Math.random() * width;
          } else if (p.speedY > 0 && p.y > height + 30) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          const pulseAlpha = p.baseOpacity * (0.4 + 0.6 * Math.sin(tick * 0.035 + p.phase));
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = Math.max(0.1, Math.min(1, pulseAlpha));

          if (p.kind === 0 || p.kind === 1) {
            // Bong Bóng Nước Pha Lê Mát Lạnh
            drawBubble(ctx, p.size, p.color);
          } else {
            // Hạt Bụi Nắng Vàng Óng
            drawSunDust(ctx, p.size, p.color);
          }

        } else if (safeThemeId === 'autumn') {
          // 🍂 MÙA THU: GIÓ THU HEO MAY CUỐN LÁ VÀNG RƠI
          p.x += p.speedX; // Swirling left to right with the wind
          p.y += p.speedY;
          p.phase += p.phaseSpeed;
          p.rotation += p.rotSpeed;

          // Wrap horizontally
          if (p.x > width + 40) {
            p.x = -40;
            p.y = Math.random() * (height * 0.85);
          }
          if (p.y > height + 30) {
            p.y = -20;
          }

          ctx.translate(p.x, p.y + Math.sin(p.phase) * 14);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;

          if (p.kind === 0 || p.kind === 1) {
            // Lá Phong Đỏ Cam
            drawMapleLeaf(ctx, p.size, p.color);
          } else if (p.kind === 2) {
            // Lá Ngân Hạnh Vàng Óng (Ginkgo)
            drawGinkgoLeaf(ctx, p.size, p.color);
          } else {
            // Lá Sồi Mật Ong
            drawFlowerPetal(ctx, p.size, p.color);
          }

        } else if (safeThemeId === 'winter') {
          // ❄️ MÙA ĐÔNG: TUYẾT LẠNH ĐA TẦNG RƠI ÊM ĐỀM
          p.y += p.speedY;
          p.phase += p.phaseSpeed;
          p.x += Math.sin(tick * 0.015 + p.phase) * 0.55;
          p.rotation += p.rotSpeed;

          if (p.y > height + 30) {
            p.y = -25;
            p.x = Math.random() * width;
          }

          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;

          if (p.kind === 0 || p.kind === 1) {
            // Bông Tuyết Pha Lê 6 Cánh Tinh Xảo
            drawSnowflake(ctx, p.size, p.color);
          } else {
            // Bông Tuyết Trắng Mịn
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (safeThemeId === 'spring') {
          // 🌿 MÙA XUÂN: ÉN LƯỢN SẢI CÁNH & CÁNH HOA ĐÀO MAI
          p.x += p.speedX;
          p.phase += p.phaseSpeed;
          p.y += Math.sin(p.phase) * 0.8;
          p.wingPhase += 0.2;

          if (p.x > width + 50) {
            p.x = -50;
            p.y = Math.random() * (height * 0.7);
          }

          ctx.translate(p.x, p.y);
          ctx.globalAlpha = p.opacity;

          if (p.kind === 0) {
            // Chim én mùa xuân
            ctx.rotate(Math.sin(p.phase) * 0.18 + 0.05);
            drawSwallow(ctx, p.size, p.wingPhase);
          } else {
            // Cánh hoa đào xuân phấp phới
            p.rotation += p.rotSpeed;
            ctx.rotate(p.rotation);
            drawFlowerPetal(ctx, p.size, p.color);
          }

        } else if (safeThemeId === 'luxury') {
          // ✨ HOÀNG KIM: MƯA BỤI VÀNG RÒNG 24K & QUẦNG SÁNG BOKEH HOÀNG GIA
          if (p.kind === 0 || p.kind === 1) {
            // Mưa bụi vàng 24K rơi lấp lánh
            p.y += p.speedY;
            if (p.y > height + 30) {
              p.y = -20;
              p.x = Math.random() * width;
            }
            ctx.translate(p.x, p.y);
            ctx.globalAlpha = p.opacity;
            drawGoldDustStreak(ctx, p.size, p.color);
          } else {
            // Quầng sáng Bokeh lơ lửng tại chỗ
            p.phase += p.phaseSpeed;
            const driftX = Math.sin(tick * 0.012 + p.phase) * (isMiniPreview ? 8 : 16);
            const driftY = Math.cos(tick * 0.01 + p.phase) * (isMiniPreview ? 8 : 16);
            const breathe = 0.35 + 0.65 * Math.sin(tick * 0.025 + p.phase);
            const sz = p.size * (0.8 + 0.3 * Math.sin(tick * 0.02 + p.phase));

            ctx.translate(p.baseX + driftX, p.baseY + driftY);
            ctx.globalAlpha = Math.max(0.1, Math.min(1, p.baseOpacity * breathe));

            if (p.kind === 2) {
              drawBokeh(ctx, sz, p.color);
            } else {
              drawDiamondStar(ctx, sz * 0.6, p.color);
            }
          }
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [safeThemeId, effectEnabled, intensity, isMiniPreview]);

  // If theme is 'none', do not render any canvas or corners
  if (safeThemeId === 'none') {
    return null;
  }

  return (
    <div
      className={`pointer-events-none overflow-hidden select-none ${
        isMiniPreview ? 'absolute inset-0 z-10' : 'fixed inset-0 z-10'
      }`}
    >
      {/* 1. Theme Backdrop Decorations (Khuê Văn Các, Câu đối Tết, Ánh nắng hè, Nhũ băng đông) */}
      <ThemeBackdropDecorations themeId={safeThemeId} isMini={isMiniPreview} />

      {/* 2. Canvas Dynamic Ambient Particles (Tiền vàng rơi, Tuyết rơi, Nắng chiếu, Gió lá vàng) */}
      {effectEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      )}

      {/* 3. Vector Side Border Atmosphere Accents (Cành hoa vươn cao ở 2 bên mép TV) */}
      {showCorners && (
        <>
          {/* Left Border Decoration */}
          <div className="absolute bottom-7 sm:bottom-8 md:bottom-9 left-0 pointer-events-none transition-transform duration-500 origin-bottom-left z-20">
            <ThemeCornerOrnament
              themeId={safeThemeId}
              position="bottom-left"
              isMini={isMiniPreview}
              cornerSize={safeCornerSize}
            />
          </div>

          {/* Right Border Decoration */}
          <div className="absolute bottom-7 sm:bottom-8 md:bottom-9 right-0 pointer-events-none transition-transform duration-500 origin-bottom-right z-20">
            <ThemeCornerOrnament
              themeId={safeThemeId}
              position="bottom-right"
              isMini={isMiniPreview}
              cornerSize={safeCornerSize}
            />
          </div>
        </>
      )}
    </div>
  );
};
