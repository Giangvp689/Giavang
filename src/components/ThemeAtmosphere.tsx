import React, { useEffect, useRef } from 'react';
import { TvThemeId } from '../types';

interface ThemeAtmosphereProps {
  themeId?: TvThemeId | string;
  effectEnabled?: boolean;
  intensity?: 'light' | 'normal' | 'rich';
  showCorners?: boolean;
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
  isMiniPreview = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const safeThemeId: TvThemeId = (themeId && ['none', 'tet', 'spring', 'summer', 'autumn', 'winter', 'luxury'].includes(themeId))
    ? (themeId as TvThemeId)
    : 'tet';

  // If theme is 'none', do not render any atmosphere or corners
  if (safeThemeId === 'none') {
    return null;
  }

  useEffect(() => {
    if (!effectEnabled) return;
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

      {/* 2. Vector Corner Atmosphere Accents */}
      {showCorners && (
        <>
          {/* Top Left Corner */}
          <div className="absolute top-0 left-0 pointer-events-none transition-transform duration-500 origin-top-left">
            {renderCornerDecoration(safeThemeId, 'top-left', isMiniPreview)}
          </div>

          {/* Top Right Corner */}
          <div className="absolute top-0 right-0 pointer-events-none transition-transform duration-500 origin-top-right">
            {renderCornerDecoration(safeThemeId, 'top-right', isMiniPreview)}
          </div>
        </>
      )}
    </div>
  );
};

// Corner Vector SVG renderer for each theme
function renderCornerDecoration(
  themeId: TvThemeId,
  position: 'top-left' | 'top-right',
  isMini: boolean
) {
  // If 'none', no corner decoration
  if (themeId === 'none') {
    return null;
  }

  const isRight = position === 'top-right';
  const scaleClass = isMini ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52';

  if (themeId === 'tet') {
    // Cành Đào Hồng (Trái) & Cành Mai Vàng (Phải) cho Tết
    return (
      <svg
        viewBox="0 0 200 200"
        className={`${scaleClass} drop-shadow-md transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 C 40 25, 90 40, 140 30 C 160 25, 180 45, 195 55 M 70 35 C 90 70, 120 95, 145 110 M 110 85 C 130 115, 145 135, 155 145"
          stroke="#5c3817"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M30 18 C 50 40, 60 70, 75 85"
          stroke="#78471e"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {isRight ? (
          // Mai vàng
          <>
            <circle cx="140" cy="30" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="140" cy="30" r="4" fill="#ef4444" />
            <circle cx="195" cy="55" r="8" fill="#facc15" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="195" cy="55" r="3" fill="#dc2626" />
            <circle cx="145" cy="110" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="145" cy="110" r="3.5" fill="#ef4444" />
            <circle cx="155" cy="145" r="7" fill="#facc15" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="75" cy="85" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="75" cy="85" r="3" fill="#dc2626" />
            <circle cx="110" cy="25" r="4" fill="#22c55e" />
            <circle cx="170" cy="40" r="4" fill="#22c55e" />
            <circle cx="130" cy="95" r="4" fill="#22c55e" />
            <g transform="translate(145, 110)">
              <line x1="0" y1="0" x2="0" y2="25" stroke="#dc2626" strokeWidth="2" />
              <rect x="-8" y="25" width="16" height="20" rx="4" fill="#dc2626" stroke="#facc15" strokeWidth="1.5" />
              <line x1="-8" y1="35" x2="8" y2="35" stroke="#facc15" strokeWidth="1" />
              <text x="0" y="39" fill="#fef08a" fontSize="9" fontWeight="900" textAnchor="middle">LỘC</text>
              <line x1="0" y1="45" x2="0" y2="58" stroke="#facc15" strokeWidth="2" />
            </g>
          </>
        ) : (
          // Đào hồng
          <>
            <circle cx="140" cy="30" r="10" fill="#fb7185" stroke="#e11d48" strokeWidth="1.5" />
            <circle cx="140" cy="30" r="4" fill="#fef08a" />
            <circle cx="195" cy="55" r="8" fill="#fda4af" stroke="#e11d48" strokeWidth="1.5" />
            <circle cx="195" cy="55" r="3" fill="#fef08a" />
            <circle cx="145" cy="110" r="9" fill="#fb7185" stroke="#e11d48" strokeWidth="1.5" />
            <circle cx="145" cy="110" r="3.5" fill="#fef08a" />
            <circle cx="155" cy="145" r="7" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.5" />
            <circle cx="75" cy="85" r="8" fill="#fda4af" stroke="#e11d48" strokeWidth="1.5" />
            <circle cx="75" cy="85" r="3" fill="#fef08a" />
            <circle cx="110" cy="25" r="4" fill="#4ade80" />
            <circle cx="170" cy="40" r="4" fill="#4ade80" />
            <circle cx="130" cy="95" r="4" fill="#4ade80" />
            <g transform="translate(145, 110)">
              <line x1="0" y1="0" x2="0" y2="25" stroke="#dc2626" strokeWidth="2" />
              <rect x="-8" y="25" width="16" height="20" rx="4" fill="#b91c1c" stroke="#facc15" strokeWidth="1.5" />
              <line x1="-8" y1="35" x2="8" y2="35" stroke="#facc15" strokeWidth="1" />
              <text x="0" y="39" fill="#fef08a" fontSize="9" fontWeight="900" textAnchor="middle">XUÂN</text>
              <line x1="0" y1="45" x2="0" y2="58" stroke="#facc15" strokeWidth="2" />
            </g>
          </>
        )}
      </svg>
    );
  }

  if (themeId === 'spring') {
    // Cành cây lá non xanh mướt chồi non
    return (
      <svg
        viewBox="0 0 200 200"
        className={`${scaleClass} drop-shadow-md transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 C 45 30, 95 45, 150 35 C 175 30, 190 55, 195 70 M 70 35 C 95 75, 125 105, 155 125 M 115 90 C 135 125, 155 145, 165 155"
          stroke="#15803d"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Fresh Green Leaves */}
        <ellipse cx="145" cy="30" rx="14" ry="7" transform="rotate(-20 145 30)" fill="#22c55e" />
        <ellipse cx="190" cy="55" rx="12" ry="6" transform="rotate(25 190 55)" fill="#4ade80" />
        <ellipse cx="150" cy="115" rx="15" ry="7" transform="rotate(40 150 115)" fill="#16a34a" />
        <ellipse cx="160" cy="150" rx="12" ry="6" transform="rotate(55 160 150)" fill="#4ade80" />
        <ellipse cx="80" cy="80" rx="13" ry="6" transform="rotate(35 80 80)" fill="#22c55e" />
        <ellipse cx="115" cy="55" rx="11" ry="5" transform="rotate(-10 115 55)" fill="#86efac" />
        {/* Spring Blossom Petal Accent */}
        <circle cx="165" cy="35" r="5" fill="#fbcfe8" />
        <circle cx="130" cy="100" r="4.5" fill="#fbcfe8" />
      </svg>
    );
  }

  if (themeId === 'summer') {
    // Cành phượng vĩ đỏ cam nồng ấm & hoa phượng nở rực rỡ
    return (
      <svg
        viewBox="0 0 200 200"
        className={`${scaleClass} drop-shadow-md transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 C 40 20, 85 35, 140 25 C 165 20, 185 45, 195 60 M 65 30 C 85 65, 115 90, 145 105 M 105 80 C 125 110, 145 130, 155 140"
          stroke="#7c2d12"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Phoenix Flowers (Hoa Phượng) */}
        <circle cx="140" cy="25" r="11" fill="#dc2626" stroke="#f97316" strokeWidth="1.5" />
        <circle cx="140" cy="25" r="4.5" fill="#fef08a" />
        <circle cx="195" cy="60" r="9" fill="#ea580c" stroke="#dc2626" strokeWidth="1.5" />
        <circle cx="195" cy="60" r="3.5" fill="#fef08a" />
        <circle cx="145" cy="105" r="10" fill="#dc2626" stroke="#f97316" strokeWidth="1.5" />
        <circle cx="145" cy="105" r="4" fill="#fef08a" />
        {/* Tiny leaflets (Lá phượng tí hon) */}
        <ellipse cx="100" cy="40" rx="6" ry="3" fill="#15803d" />
        <ellipse cx="115" cy="35" rx="6" ry="3" fill="#16a34a" />
        <ellipse cx="160" cy="40" rx="6" ry="3" fill="#15803d" />
        <ellipse cx="125" cy="90" rx="6" ry="3" fill="#16a34a" />
      </svg>
    );
  }

  if (themeId === 'autumn') {
    // Cành phong vàng ấm áp
    return (
      <svg
        viewBox="0 0 200 200"
        className={`${scaleClass} drop-shadow-md transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 C 45 25, 90 40, 145 30 C 170 25, 185 50, 195 65 M 70 35 C 95 70, 120 95, 145 115 M 110 85 C 130 120, 150 140, 160 150"
          stroke="#78350f"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Golden Maple Leaves on Branch */}
        <g transform="translate(145, 30) scale(0.9)">
          <path d="M0 -15 L4 -6 L13 -7 L8 -1 L14 4 L5 4 L0 12 L-5 4 L-14 4 L-8 -1 L-13 -7 L-4 -6 Z" fill="#d97706" />
        </g>
        <g transform="translate(195, 65) scale(0.75)">
          <path d="M0 -15 L4 -6 L13 -7 L8 -1 L14 4 L5 4 L0 12 L-5 4 L-14 4 L-8 -1 L-13 -7 L-4 -6 Z" fill="#ea580c" />
        </g>
        <g transform="translate(145, 115) scale(0.85)">
          <path d="M0 -15 L4 -6 L13 -7 L8 -1 L14 4 L5 4 L0 12 L-5 4 L-14 4 L-8 -1 L-13 -7 L-4 -6 Z" fill="#b45309" />
        </g>
        <g transform="translate(75" y="80) scale(0.7)">
          <path d="M0 -15 L4 -6 L13 -7 L8 -1 L14 4 L5 4 L0 12 L-5 4 L-14 4 L-8 -1 L-13 -7 L-4 -6 Z" fill="#f59e0b" />
        </g>
      </svg>
    );
  }

  if (themeId === 'winter') {
    // Cành thông mùa đông phủ tuyết trắng & chuông vàng
    return (
      <svg
        viewBox="0 0 200 200"
        className={`${scaleClass} drop-shadow-md transition-all ${isRight ? '-scale-x-100' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0 C 40 25, 85 35, 140 30 C 165 25, 185 50, 195 65 M 70 30 C 95 70, 120 100, 145 115 M 110 85 C 130 115, 145 135, 155 145"
          stroke="#334155"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Pine needles (Kim thông) */}
        <line x1="80" y1="35" x2="70" y2="55" stroke="#15803d" strokeWidth="2.5" />
        <line x1="95" y1="35" x2="90" y2="60" stroke="#15803d" strokeWidth="2.5" />
        <line x1="120" y1="30" x2="115" y2="55" stroke="#15803d" strokeWidth="2.5" />
        <line x1="135" y1="30" x2="140" y2="55" stroke="#15803d" strokeWidth="2.5" />
        {/* Golden Bell or Red Ribbon */}
        <g transform="translate(145, 115)">
          <path d="M-8 0 C -8 10, -12 18, -14 20 L14 20 C 12 18, 8 10, 8 0 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="0" cy="22" r="3" fill="#b45309" />
          <rect x="-10" y="-4" width="20" height="6" rx="2" fill="#dc2626" />
        </g>
        {/* Crystal Snowflake */}
        <g transform="translate(140, 30) scale(0.8)">
          <circle cx="0" cy="0" r="2" fill="#ffffff" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="-7" y1="-7" x2="7" y2="7" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="-7" y1="7" x2="7" y2="-7" stroke="#ffffff" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // luxury: Hoa văn mây lành hoàng gia & kim tiền
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${scaleClass} drop-shadow-md transition-all ${isRight ? '-scale-x-100' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0 C 30 10, 60 15, 90 10 C 110 5, 130 20, 145 35 C 160 50, 175 60, 190 65 M 40 10 C 70 35, 90 65, 110 90 C 130 115, 145 135, 160 150"
        stroke="#d97706"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M20 5 C 50 15, 75 25, 100 45 C 120 60, 140 85, 155 110"
        stroke="#fbbf24"
        strokeWidth="2"
      />
      <circle cx="145" cy="35" r="14" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <rect x="139" y="29" width="12" height="12" fill="#78350f" rx="1" />
      <circle cx="160" cy="150" r="10" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" />
      <rect x="156" y="146" width="8" height="8" fill="#78350f" rx="1" />
      <path d="M100 85 L103 92 L110 95 L103 98 L100 105 L97 98 L90 95 L97 92 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.5" />
      <path d="M60 40 L62 45 L67 47 L62 49 L60 54 L58 49 L53 47 L58 45 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.5" />
    </svg>
  );
}
