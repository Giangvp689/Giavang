import React, { useEffect, useRef } from 'react';
import { TvThemeId } from '../types';

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
  phase: number;
  phaseSpeed: number;
  wingPhase: number;
  life: number;
  maxLife: number;
  opacity: number;
  baseOpacity: number;
  kind: number; // 0, 1, 2
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
    let count = 36;
    if (isMiniPreview) {
      count = 14;
    } else {
      if (intensity === 'light') count = 20;
      else if (intensity === 'rich') count = 55;
    }

    const particles: Particle[] = [];

    // Color palettes
    const getPalette = (tId: TvThemeId) => {
      switch (tId) {
        case 'tet':
          return ['#facc15', '#f59e0b', '#ef4444', '#f43f5e', '#fef08a', '#fda4af'];
        case 'spring':
          return ['#facc15', '#34d399', '#f472b6', '#fef9c3', '#10b981', '#38bdf8'];
        case 'summer':
          return ['#a3e635', '#bef264', '#fde047', '#38bdf8', '#fbbf24', '#ffffff'];
        case 'autumn':
          return ['#d97706', '#b45309', '#f59e0b', '#ea580c', '#c2410c', '#fde68a'];
        case 'winter':
          return ['#ffffff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#f0f9ff', '#ffffff'];
        case 'luxury':
        default:
          return ['#fbbf24', '#f59e0b', '#facc15', '#fef08a', '#ffd700', '#fffbeb'];
      }
    };

    const palette = getPalette(safeThemeId);

    // Initialize particles according to theme
    for (let i = 0; i < count; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const baseOp = 0.4 + Math.random() * 0.5;

      let speedX = (Math.random() - 0.5) * 0.4;
      let speedY = 0.6 + Math.random() * 0.6;
      let rotSpeed = (Math.random() - 0.5) * 0.03;
      let pSize = (isMiniPreview ? 5 : 8) + Math.random() * (isMiniPreview ? 6 : 12);

      // Customize initial values per theme
      if (safeThemeId === 'spring') {
        // Butterfly wave flight
        speedX = 0.7 + Math.random() * 0.7; // Moving left to right
        speedY = (Math.random() - 0.5) * 0.3;
        pSize = (isMiniPreview ? 7 : 12) + Math.random() * (isMiniPreview ? 4 : 8);
      } else if (safeThemeId === 'summer') {
        // Upward floating fireflies / bubbles
        speedX = (Math.random() - 0.5) * 0.5;
        speedY = 0.45 + Math.random() * 0.65; // Moves UP
        pSize = (isMiniPreview ? 5 : 9) + Math.random() * (isMiniPreview ? 6 : 10);
      } else if (safeThemeId === 'autumn') {
        // Horizontal breeze
        speedX = 1.6 + Math.random() * 1.2;
        speedY = 0.25 + Math.random() * 0.45;
        rotSpeed = 0.02 + Math.random() * 0.03;
        pSize = (isMiniPreview ? 7 : 11) + Math.random() * (isMiniPreview ? 5 : 10);
      } else if (safeThemeId === 'winter') {
        // Ultra-slow calm falling snow
        speedX = (Math.random() - 0.5) * 0.3;
        speedY = 0.35 + Math.random() * 0.45;
        rotSpeed = (Math.random() - 0.5) * 0.01;
        pSize = (isMiniPreview ? 4 : 7) + Math.random() * (isMiniPreview ? 5 : 9);
      } else if (safeThemeId === 'luxury') {
        // Stationary floating bokeh / diamond flares
        speedX = 0;
        speedY = 0;
        pSize = (isMiniPreview ? 10 : 20) + Math.random() * (isMiniPreview ? 14 : 32);
      } else if (safeThemeId === 'tet') {
        // Mini celebration firework sparks
        speedX = (Math.random() - 0.5) * 0.6;
        speedY = -0.5 - Math.random() * 0.8;
        pSize = (isMiniPreview ? 6 : 10) + Math.random() * (isMiniPreview ? 6 : 12);
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
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.02 + Math.random() * 0.03,
        wingPhase: Math.random() * Math.PI * 2,
        life: Math.floor(Math.random() * 120),
        maxLife: 100 + Math.floor(Math.random() * 80),
        opacity: baseOp,
        baseOpacity: baseOp,
        kind: Math.floor(Math.random() * 3),
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    let tick = 0;

    // Helper: Draw Butterfly
    const drawButterfly = (c: CanvasRenderingContext2D, size: number, wingFlap: number, color: string) => {
      const flapScale = Math.abs(wingFlap) * 0.8 + 0.2;
      const s = size * 0.8;

      // Body
      c.fillStyle = '#374151';
      c.beginPath();
      c.ellipse(0, 0, s * 0.12, s * 0.55, 0, 0, Math.PI * 2);
      c.fill();

      // Antennae
      c.strokeStyle = '#374151';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-s * 0.08, -s * 0.45);
      c.quadraticCurveTo(-s * 0.25, -s * 0.8, -s * 0.35, -s * 0.7);
      c.moveTo(s * 0.08, -s * 0.45);
      c.quadraticCurveTo(s * 0.25, -s * 0.8, s * 0.35, -s * 0.7);
      c.stroke();

      // Left Wings
      c.save();
      c.scale(flapScale, 1);
      // Forewing
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(-s * 0.08, -s * 0.1);
      c.bezierCurveTo(-s * 0.7, -s * 0.9, -s * 1.3, -s * 0.5, -s * 0.9, 0);
      c.bezierCurveTo(-s * 0.5, s * 0.1, -s * 0.2, 0, -s * 0.08, 0);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.15)';
      c.lineWidth = 1;
      c.stroke();

      // Hindwing
      c.beginPath();
      c.moveTo(-s * 0.08, 0);
      c.bezierCurveTo(-s * 0.7, s * 0.2, -s * 0.9, s * 0.7, -s * 0.4, s * 0.7);
      c.bezierCurveTo(-s * 0.15, s * 0.5, -s * 0.08, s * 0.3, -s * 0.08, s * 0.1);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();

      // Right Wings
      c.save();
      c.scale(-flapScale, 1);
      // Forewing
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(-s * 0.08, -s * 0.1);
      c.bezierCurveTo(-s * 0.7, -s * 0.9, -s * 1.3, -s * 0.5, -s * 0.9, 0);
      c.bezierCurveTo(-s * 0.5, s * 0.1, -s * 0.2, 0, -s * 0.08, 0);
      c.closePath();
      c.fill();
      c.stroke();

      // Hindwing
      c.beginPath();
      c.moveTo(-s * 0.08, 0);
      c.bezierCurveTo(-s * 0.7, s * 0.2, -s * 0.9, s * 0.7, -s * 0.4, s * 0.7);
      c.bezierCurveTo(-s * 0.15, s * 0.5, -s * 0.08, s * 0.3, -s * 0.08, s * 0.1);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    };

    // Helper: Draw Glowing Firefly
    const drawFirefly = (c: CanvasRenderingContext2D, size: number, color: string) => {
      // Outer radial glow halo
      const grad = c.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 1.4);
      grad.addColorStop(0, color);
      grad.addColorStop(0.35, 'rgba(253, 224, 71, 0.4)');
      grad.addColorStop(1, 'rgba(163, 230, 53, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, size * 1.4, 0, Math.PI * 2);
      c.fill();

      // Bright inner core
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      c.fill();
    };

    // Helper: Draw Translucent Soap Bubble / Water Drop
    const drawBubble = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.save();
      c.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(0, 0, size * 0.8, 0, Math.PI * 2);
      c.stroke();

      // Soft iridescent interior
      const grad = c.createRadialGradient(-size * 0.3, -size * 0.3, size * 0.1, 0, 0, size * 0.8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(1, 'rgba(244, 114, 182, 0.2)');
      c.fillStyle = grad;
      c.fill();

      // Crescent light reflection
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(-size * 0.35, -size * 0.35, size * 0.2, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    // Helper: Draw Soft Bokeh Orb
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

    // Helper: Draw Diamond Twinkle Star Flare
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

      // Micro center flare
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      c.fill();
    };

    // Helper: Draw Japanese Maple Leaf
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

    // Helper: Draw 6-Branch Crystal Snowflake
    const drawSnowflake = (c: CanvasRenderingContext2D, size: number, color: string) => {
      c.strokeStyle = color;
      c.lineWidth = isMiniPreview ? 1 : 1.5;
      c.lineCap = 'round';
      const r = size * 0.65;
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
        c.stroke();
        c.restore();
      }
    };

    // Helper: Draw Mini Fireworks Celebration Sparkler
    const drawSparklerBurst = (c: CanvasRenderingContext2D, size: number, color: string, lifeRatio: number) => {
      const radius = size * (0.4 + 0.8 * lifeRatio);
      const rays = 8;
      c.save();
      for (let i = 0; i < rays; i++) {
        const angle = (i * Math.PI * 2) / rays;
        const x1 = Math.cos(angle) * (radius * 0.3);
        const y1 = Math.sin(angle) * (radius * 0.3);
        const x2 = Math.cos(angle) * radius;
        const y2 = Math.sin(angle) * radius;
        c.strokeStyle = color;
        c.lineWidth = 1.4 * (1 - lifeRatio * 0.5);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();

        // Tip spark
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(x2, y2, 1.2, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    };

    // Animation Render Loop
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.save();

        if (safeThemeId === 'tet') {
          // 🌸 TẾT: Pháo hoa que mini nở nhẹ & tia sáng vàng đỏ lấp lánh mừng xuân
          p.life++;
          p.y += p.speedY;
          p.x += p.speedX;
          const lifeRatio = p.life / p.maxLife;
          const fadeAlpha = p.baseOpacity * (lifeRatio < 0.2 ? lifeRatio * 5 : 1 - (lifeRatio - 0.2) / 0.8);

          if (p.life >= p.maxLife || p.y < -30) {
            p.life = 0;
            p.x = Math.random() * width;
            p.y = height * 0.4 + Math.random() * (height * 0.55);
            p.color = palette[Math.floor(Math.random() * palette.length)];
          }

          ctx.translate(p.x, p.y);
          ctx.globalAlpha = Math.max(0, Math.min(1, fadeAlpha));

          if (p.kind === 0) {
            drawSparklerBurst(ctx, p.size, p.color, lifeRatio);
          } else if (p.kind === 1) {
            drawDiamondStar(ctx, p.size * (0.8 + 0.4 * Math.sin(tick * 0.05 + p.phase)), p.color);
          } else {
            // Golden auspicious sparkle ember
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (safeThemeId === 'spring') {
          // 🌿 MÙA XUÂN: Đàn bướm xuân vỗ cánh dập dờn & bụi phấn hoa bay lượn
          p.x += p.speedX;
          p.phase += p.phaseSpeed;
          p.y += Math.sin(p.phase) * 0.65;
          p.wingPhase += 0.18;

          // Wrap horizontally
          if (p.x > width + 40) {
            p.x = -40;
            p.y = Math.random() * height;
          }

          ctx.translate(p.x, p.y);
          ctx.rotate(Math.sin(p.phase) * 0.25 + 0.1);
          ctx.globalAlpha = p.opacity;

          if (p.kind === 0 || p.kind === 1) {
            drawButterfly(ctx, p.size, Math.cos(p.wingPhase), p.color);
          } else {
            // Glowing pollen sparkle
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (safeThemeId === 'summer') {
          // ☀️ MÙA HÈ: Đom đóm dạ quang & bong bóng nước bay từ DƯỚI LÊN TRÊN
          p.y -= p.speedY; // Moves UP!
          p.phase += p.phaseSpeed;
          p.x += Math.sin(tick * 0.02 + p.phase) * 0.4;

          // Wrap around at top
          if (p.y < -30) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }

          const pulseAlpha = p.baseOpacity * (0.35 + 0.65 * Math.sin(tick * 0.035 + p.phase));
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = Math.max(0.1, Math.min(1, pulseAlpha));

          if (p.kind === 0 || p.kind === 1) {
            drawFirefly(ctx, p.size, p.color);
          } else {
            drawBubble(ctx, p.size * 0.85, p.color);
          }

        } else if (safeThemeId === 'autumn') {
          // 🍂 MÙA THU: Gió heo may thổi ngang cuốn lá phong lượn sóng chao nghiêng
          p.x += p.speedX; // Moves LEFT TO RIGHT
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

          ctx.translate(p.x, p.y + Math.sin(p.phase) * 12);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;

          if (p.kind === 0) {
            drawMapleLeaf(ctx, p.size, p.color);
          } else if (p.kind === 1) {
            // Golden oak leaf
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 0.45, p.size * 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 0.8);
            ctx.lineTo(0, p.size * 0.8);
            ctx.stroke();
          } else {
            drawDiamondStar(ctx, p.size * 0.6, '#fde68a');
          }

        } else if (safeThemeId === 'winter') {
          // ❄️ MÙA ĐÔNG: Bông tuyết pha lê 6 cánh xoay tròn rơi cực chậm rãi
          p.y += p.speedY; // Ultra-slow calm fall
          p.phase += p.phaseSpeed;
          p.x += Math.sin(tick * 0.015 + p.phase) * 0.45;
          p.rotation += p.rotSpeed;

          if (p.y > height + 30) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;

          if (p.kind === 0 || p.kind === 1) {
            drawSnowflake(ctx, p.size, p.color);
          } else {
            // Soft white snow orb
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (safeThemeId === 'luxury') {
          // ✨ HOÀNG KIM: Quầng sáng Bokeh vàng óng lơ lửng & sao kim cương tỏa rạng tại chỗ
          p.phase += p.phaseSpeed;
          const driftX = Math.sin(tick * 0.012 + p.phase) * (isMiniPreview ? 8 : 16);
          const driftY = Math.cos(tick * 0.01 + p.phase) * (isMiniPreview ? 8 : 16);
          const breathe = 0.35 + 0.65 * Math.sin(tick * 0.025 + p.phase);
          const sz = p.size * (0.8 + 0.3 * Math.sin(tick * 0.02 + p.phase));

          ctx.translate(p.baseX + driftX, p.baseY + driftY);
          ctx.globalAlpha = Math.max(0.1, Math.min(1, p.baseOpacity * breathe));

          if (p.kind === 0) {
            drawBokeh(ctx, sz, p.color);
          } else if (p.kind === 1) {
            drawDiamondStar(ctx, sz * 0.6, p.color);
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, sz * 0.25, 0, Math.PI * 2);
            ctx.fill();
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
      {/* 1. Canvas Dynamic Ambient Particles */}
      {effectEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* 2. Vector Side Border Atmosphere Accents (Nằm gọn gàng ở 2 bên viền màn hình, không che chữ bảng giá) */}
      {showCorners && (
        <>
          {/* Left Border Decoration */}
          <div className="absolute top-12 sm:top-14 md:top-16 left-0 pointer-events-none transition-transform duration-500 origin-top-left z-0">
            {renderCornerDecoration(safeThemeId, 'top-left', isMiniPreview, safeCornerSize)}
          </div>

          {/* Right Border Decoration */}
          <div className="absolute top-12 sm:top-14 md:top-16 right-0 pointer-events-none transition-transform duration-500 origin-top-right z-0">
            {renderCornerDecoration(safeThemeId, 'top-right', isMiniPreview, safeCornerSize)}
          </div>
        </>
      )}
    </div>
  );
};

// Side Border Vector SVG renderer for each theme (Thon gọn buông dọc 2 viền, không lấn vào bảng giá)
function renderCornerDecoration(
  themeId: TvThemeId,
  position: 'top-left' | 'top-right',
  isMini: boolean,
  cornerSize: 'normal' | 'large' | 'extralarge' = 'large'
) {
  // If 'none', no decoration
  if (themeId === 'none') {
    return null;
  }

  const isRight = position === 'top-right';

  // Slender vertical border dimensions: tall and narrow to hug the outer edge ("2 viền")
  let scaleClass = 'w-12 h-72 sm:w-14 sm:h-80 md:w-18 md:h-[390px] lg:w-22 lg:h-[430px] xl:w-26 xl:h-[470px]';
  if (isMini) {
    scaleClass = 'w-7 h-28 sm:w-8 sm:h-36';
  } else if (cornerSize === 'extralarge') {
    scaleClass = 'w-14 h-80 sm:w-16 sm:h-96 md:w-20 md:h-[430px] lg:w-26 lg:h-[480px] xl:w-30 xl:h-[530px]';
  } else if (cornerSize === 'normal') {
    scaleClass = 'w-10 h-60 sm:w-12 sm:h-72 md:w-14 md:h-80 lg:w-18 lg:h-[370px]';
  }

  if (themeId === 'tet') {
    // Cành Đào Hồng (Viền Trái) & Cành Mai Vàng (Viền Phải) buông rủ dọc 2 bên viền TV
    return (
      <svg
        viewBox="0 0 100 440"
        className={`${scaleClass} drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Gnarled Vertical Trunk hugging the border edge */}
        <path
          d="M 0 0 C 18 20, 26 55, 24 95 C 20 135, 36 175, 28 220 C 20 265, 34 310, 22 360 C 14 395, 26 415, 18 435 M 24 95 C 44 112, 55 138, 50 165 M 28 200 C 50 216, 60 245, 48 275 M 15 45 C 32 58, 42 78, 36 100"
          stroke="#451a03"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Bark Highlights */}
        <path
          d="M 0 0 C 18 20, 26 55, 24 95 C 20 135, 36 175, 28 220 M 24 95 C 44 112, 55 138, 50 165"
          stroke="#78350f"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 5 10 C 16 35, 22 75, 20 110"
          stroke="#b45309"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {isRight ? (
          // MAI VÀNG PHÚ QUÝ (Viền Phải: Mai vàng 5 cánh, nụ xanh, liễn LỘC, đồng tiền cổ)
          <>
            {/* Blossom 1 - Upper */}
            <g transform="translate(24, 55)">
              <circle cx="-8" cy="0" r="9" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="8" cy="0" r="9" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="0" cy="-8" r="9" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="-5" cy="6" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="5" cy="6" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="5" fill="#dc2626" />
              <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
            </g>

            {/* Blossom 2 - Mid Twig */}
            <g transform="translate(50, 160) scale(0.95)">
              <circle cx="-7" cy="0" r="8" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="7" cy="0" r="8" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="0" cy="-7" r="8" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="-4" cy="5" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="4" cy="5" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="4.5" fill="#dc2626" />
              <circle cx="0" cy="0" r="2" fill="#fef08a" />
            </g>

            {/* Blossom 3 - Center Branch */}
            <g transform="translate(28, 220) scale(0.9)">
              <circle cx="-7" cy="0" r="8" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="7" cy="0" r="8" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="0" cy="-7" r="8" fill="#facc15" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="-4" cy="5" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="4" cy="5" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="4" fill="#dc2626" />
            </g>

            {/* Blossom 4 - Lower Twig */}
            <g transform="translate(48, 275) scale(0.85)">
              <circle cx="-6" cy="0" r="7" fill="#fde047" stroke="#d97706" strokeWidth="1" />
              <circle cx="6" cy="0" r="7" fill="#fde047" stroke="#d97706" strokeWidth="1" />
              <circle cx="0" cy="-6" r="7" fill="#fde047" stroke="#d97706" strokeWidth="1" />
              <circle cx="-4" cy="5" r="7" fill="#facc15" stroke="#d97706" strokeWidth="1" />
              <circle cx="4" cy="5" r="7" fill="#facc15" stroke="#d97706" strokeWidth="1" />
              <circle cx="0" cy="0" r="3.5" fill="#dc2626" />
            </g>

            {/* Blossom 5 - Bottom Cascade */}
            <g transform="translate(22, 360) scale(0.8)">
              <circle cx="-6" cy="0" r="7" fill="#facc15" stroke="#d97706" strokeWidth="1" />
              <circle cx="6" cy="0" r="7" fill="#facc15" stroke="#d97706" strokeWidth="1" />
              <circle cx="0" cy="-6" r="7" fill="#facc15" stroke="#d97706" strokeWidth="1" />
              <circle cx="-4" cy="5" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <circle cx="4" cy="5" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <circle cx="0" cy="0" r="3.5" fill="#dc2626" />
            </g>

            {/* Green Buds along border */}
            <circle cx="34" cy="30" r="4.5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <circle cx="56" cy="130" r="4" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <circle cx="36" cy="180" r="4.5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <circle cx="52" cy="245" r="4" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <circle cx="28" cy="320" r="4" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <circle cx="18" cy="420" r="3.5" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />

            {/* Hanging Lucky Red Packet "LỘC" */}
            <g transform="translate(48, 275)">
              <line x1="0" y1="0" x2="0" y2="24" stroke="#b91c1c" strokeWidth="1.5" />
              <rect x="-9" y="24" width="18" height="24" rx="3.5" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
              <circle cx="0" cy="36" r="6" fill="#b91c1c" />
              <text x="0" y="39" fill="#fef08a" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="serif">LỘC</text>
              <line x1="0" y1="48" x2="0" y2="60" stroke="#fbbf24" strokeWidth="2" />
              <circle cx="0" cy="61" r="2" fill="#d97706" />
            </g>

            {/* Gold coin */}
            <g transform="translate(32, 115)">
              <circle cx="0" cy="0" r="7" fill="#facc15" stroke="#b45309" strokeWidth="1.5" />
              <rect x="-2.5" y="-2.5" width="5" height="5" fill="#78350f" rx="0.5" />
            </g>
          </>
        ) : (
          // ĐÀO HỒNG TẾT (Viền Trái: Cành đào hồng phấn buông dọc viền, liễn XUÂN, lộc biếc)
          <>
            {/* Blossom 1 - Upper */}
            <g transform="translate(24, 55)">
              <circle cx="-8" cy="0" r="9" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="8" cy="0" r="9" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="0" cy="-8" r="9" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="-5" cy="6" r="9" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="5" cy="6" r="9" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="5" fill="#be123c" />
              <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
            </g>

            {/* Blossom 2 - Mid Twig */}
            <g transform="translate(50, 160) scale(0.95)">
              <circle cx="-7" cy="0" r="8" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="7" cy="0" r="8" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="0" cy="-7" r="8" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="-4" cy="5" r="8" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="4" cy="5" r="8" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="4.5" fill="#be123c" />
              <circle cx="0" cy="0" r="2" fill="#fef08a" />
            </g>

            {/* Blossom 3 - Center Branch */}
            <g transform="translate(28, 220) scale(0.9)">
              <circle cx="-7" cy="0" r="8" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="7" cy="0" r="8" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="0" cy="-7" r="8" fill="#fb7185" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="-4" cy="5" r="8" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="4" cy="5" r="8" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="4" fill="#be123c" />
            </g>

            {/* Blossom 4 - Lower Twig */}
            <g transform="translate(48, 275) scale(0.85)">
              <circle cx="-6" cy="0" r="7" fill="#fda4af" stroke="#e11d48" strokeWidth="1" />
              <circle cx="6" cy="0" r="7" fill="#fda4af" stroke="#e11d48" strokeWidth="1" />
              <circle cx="0" cy="-6" r="7" fill="#fda4af" stroke="#e11d48" strokeWidth="1" />
              <circle cx="-4" cy="5" r="7" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
              <circle cx="4" cy="5" r="7" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
              <circle cx="0" cy="0" r="3.5" fill="#be123c" />
            </g>

            {/* Blossom 5 - Bottom Cascade */}
            <g transform="translate(22, 360) scale(0.8)">
              <circle cx="-6" cy="0" r="7" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
              <circle cx="6" cy="0" r="7" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
              <circle cx="0" cy="-6" r="7" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
              <circle cx="-4" cy="5" r="7" fill="#f43f5e" stroke="#e11d48" strokeWidth="1" />
              <circle cx="4" cy="5" r="7" fill="#f43f5e" stroke="#e11d48" strokeWidth="1" />
              <circle cx="0" cy="0" r="3.5" fill="#be123c" />
            </g>

            {/* Green Buds along border */}
            <circle cx="34" cy="30" r="4.5" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <circle cx="56" cy="130" r="4" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <circle cx="36" cy="180" r="4.5" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <circle cx="52" cy="245" r="4" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <circle cx="28" cy="320" r="4" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
            <circle cx="18" cy="420" r="3.5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />

            {/* Hanging Auspicious Red Packet "XUÂN" */}
            <g transform="translate(48, 275)">
              <line x1="0" y1="0" x2="0" y2="24" stroke="#b91c1c" strokeWidth="1.5" />
              <rect x="-9" y="24" width="18" height="24" rx="3.5" fill="#b91c1c" stroke="#fbbf24" strokeWidth="1.5" />
              <circle cx="0" cy="36" r="6" fill="#991b1b" />
              <text x="0" y="39" fill="#fef08a" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="serif">XUÂN</text>
              <line x1="0" y1="48" x2="0" y2="60" stroke="#fbbf24" strokeWidth="2" />
              <circle cx="0" cy="61" r="2" fill="#d97706" />
            </g>

            {/* Gold coin */}
            <g transform="translate(32, 115)">
              <circle cx="0" cy="0" r="7" fill="#facc15" stroke="#b45309" strokeWidth="1.5" />
              <rect x="-2.5" y="-2.5" width="5" height="5" fill="#78350f" rx="0.5" />
            </g>
          </>
        )}
      </svg>
    );
  }

  if (themeId === 'spring') {
    // Cành cây lá non xanh mướt chồi non ôm viền
    return (
      <svg
        viewBox="0 0 100 440"
        className={`${scaleClass} drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0 0 C 18 25, 26 65, 22 110 C 18 155, 34 200, 26 250 C 18 295, 32 340, 20 390 C 14 415, 24 430, 18 440 M 22 110 C 42 130, 52 160, 46 185 M 26 230 C 46 250, 56 280, 44 305"
          stroke="#166534"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 0 0 C 18 25, 26 65, 22 110"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Lush Green Spring Leaves along the border */}
        <ellipse cx="26" cy="55" rx="14" ry="7" transform="rotate(-15 26 55)" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        <ellipse cx="46" cy="180" rx="15" ry="7" transform="rotate(30 46 180)" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
        <ellipse cx="28" cy="245" rx="16" ry="8" transform="rotate(40 28 245)" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
        <ellipse cx="44" cy="300" rx="14" ry="7" transform="rotate(35 44 300)" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
        <ellipse cx="22" cy="380" rx="13" ry="6" transform="rotate(25 22 380)" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        {/* Little blossom buds */}
        <circle cx="36" cy="120" r="6" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1" />
        <circle cx="36" cy="120" r="2" fill="#fbbf24" />
        <circle cx="38" cy="270" r="6" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1" />
        <circle cx="38" cy="270" r="2" fill="#fbbf24" />
      </svg>
    );
  }

  if (themeId === 'summer') {
    // Cành phượng vĩ đỏ rực rỡ buông dọc viền
    return (
      <svg
        viewBox="0 0 100 440"
        className={`${scaleClass} drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0 0 C 16 25, 24 65, 20 110 C 16 155, 30 200, 24 250 C 16 295, 28 340, 18 390 M 20 110 C 40 128, 50 155, 44 180 M 24 230 C 42 248, 52 275, 40 300"
          stroke="#7c2d12"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Red Phoenix Flowers */}
        <g transform="translate(24, 60)">
          <ellipse cx="-7" cy="0" rx="8" ry="5" fill="#dc2626" />
          <ellipse cx="7" cy="0" rx="8" ry="5" fill="#dc2626" />
          <ellipse cx="0" cy="-7" rx="5" ry="8" fill="#ea580c" />
          <ellipse cx="0" cy="0" r="3" fill="#7f1d1d" />
        </g>
        <g transform="translate(46, 175) scale(0.9)">
          <ellipse cx="-7" cy="0" rx="8" ry="5" fill="#dc2626" />
          <ellipse cx="7" cy="0" rx="8" ry="5" fill="#dc2626" />
          <ellipse cx="0" cy="-7" rx="5" ry="8" fill="#ea580c" />
          <ellipse cx="0" cy="0" r="3" fill="#7f1d1d" />
        </g>
        <g transform="translate(26, 260) scale(0.85)">
          <ellipse cx="-7" cy="0" rx="8" ry="5" fill="#dc2626" />
          <ellipse cx="7" cy="0" rx="8" ry="5" fill="#dc2626" />
          <ellipse cx="0" cy="0" r="3" fill="#7f1d1d" />
        </g>
        {/* Feather Leaflets */}
        <ellipse cx="32" cy="110" rx="7" ry="3" fill="#15803d" />
        <ellipse cx="38" cy="210" rx="7" ry="3" fill="#16a34a" />
        <ellipse cx="32" cy="330" rx="7" ry="3" fill="#15803d" />
      </svg>
    );
  }

  if (themeId === 'autumn') {
    // Cành phong lá đỏ vàng mùa thu ôm viền
    return (
      <svg
        viewBox="0 0 100 440"
        className={`${scaleClass} drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0 0 C 16 25, 24 65, 20 110 C 16 155, 30 200, 24 250 C 16 295, 28 340, 18 390 M 20 110 C 40 128, 50 155, 44 180 M 24 230 C 42 248, 52 275, 40 300"
          stroke="#78350f"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Maple Leaves */}
        <g transform="translate(24, 60) scale(0.9)">
          <path d="M0 -12 L3 -5 L10 -6 L6 -1 L11 3 L4 3 L0 9 L-4 3 L-11 3 L-6 -1 L-10 -6 L-3 -5 Z" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
        </g>
        <g transform="translate(46, 175) scale(0.85)">
          <path d="M0 -12 L3 -5 L10 -6 L6 -1 L11 3 L4 3 L0 9 L-4 3 L-11 3 L-6 -1 L-10 -6 L-3 -5 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="0.8" />
        </g>
        <g transform="translate(26, 260) scale(0.8)">
          <path d="M0 -12 L3 -5 L10 -6 L6 -1 L11 3 L4 3 L0 9 L-4 3 L-11 3 L-6 -1 L-10 -6 L-3 -5 Z" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
        </g>
        <g transform="translate(38, 350) scale(0.75)">
          <path d="M0 -12 L3 -5 L10 -6 L6 -1 L11 3 L4 3 L0 9 L-4 3 L-11 3 L-6 -1 L-10 -6 L-3 -5 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
        </g>
      </svg>
    );
  }

  if (themeId === 'winter') {
    // Cành thông mùa đông phủ tuyết trắng buông viền
    return (
      <svg
        viewBox="0 0 100 440"
        className={`${scaleClass} drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0 0 C 16 25, 24 65, 20 110 C 16 155, 30 200, 24 250 C 16 295, 28 340, 18 390"
          stroke="#334155"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Pine needles clusters along border */}
        <line x1="20" y1="60" x2="38" y2="75" stroke="#15803d" strokeWidth="3" />
        <line x1="22" y1="120" x2="42" y2="135" stroke="#16a34a" strokeWidth="3" />
        <line x1="24" y1="200" x2="46" y2="215" stroke="#15803d" strokeWidth="3" />
        <line x1="20" y1="290" x2="40" y2="305" stroke="#16a34a" strokeWidth="3" />
        {/* Snow blankets */}
        <path d="M12 55 C 20 60, 30 62, 36 58 Q 38 54, 32 54 C 24 54, 16 52, 10 50 Z" fill="#ffffff" />
        <path d="M14 115 C 22 120, 34 122, 40 118 Q 42 114, 36 114 C 26 114, 18 112, 12 110 Z" fill="#ffffff" />
        {/* Holiday Bell */}
        <g transform="translate(24, 250) scale(0.8)">
          <path d="M-9 0 C -9 11, -14 20, -16 22 L16 22 C 14 20, 9 11, 9 0 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="0" cy="24" r="3.5" fill="#b45309" />
          <rect x="-11" y="-4" width="22" height="7" rx="2" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  // luxury: Hoa văn mây lành hoàng cung & kim tiền cổ 24K buông viền
  return (
    <svg
      viewBox="0 0 100 440"
      className={`${scaleClass} drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] transition-all ${isRight ? '-scale-x-100' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 0 0 C 16 20, 24 55, 20 95 C 16 135, 30 175, 24 220 C 16 265, 28 310, 18 360 C 14 395, 22 415, 16 435"
        stroke="#d97706"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 4 8 C 18 25, 22 55, 18 90 C 14 125, 26 165, 20 205"
        stroke="#fbbf24"
        strokeWidth="2.5"
      />
      {/* Imperial Gold Coins along border */}
      <g transform="translate(24, 60) scale(0.75)">
        <circle cx="0" cy="0" r="16" fill="#fbbf24" stroke="#b45309" strokeWidth="2.5" />
        <rect x="-5" y="-5" width="10" height="10" fill="#78350f" rx="1" />
      </g>
      <g transform="translate(30, 220) scale(0.65)">
        <circle cx="0" cy="0" r="16" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
        <rect x="-5" y="-5" width="10" height="10" fill="#78350f" rx="1" />
      </g>
      {/* Diamond Sparkle Stars */}
      <path d="M 32 140 L 34 147 L 41 150 L 34 153 L 32 160 L 30 153 L 23 150 L 30 147 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
      <path d="M 26 310 L 28 316 L 34 318 L 28 320 L 26 326 L 24 320 L 18 318 L 24 316 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
    </svg>
  );
}
