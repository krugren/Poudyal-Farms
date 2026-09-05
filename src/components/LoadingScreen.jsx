"use client";
import { useEffect, useRef, useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// Poudhyal Farms — Cinematic Nature Loading Screen
//
// Design principles:
//  • Calm, slow, poetic — never erratic or rushed
//  • Fireflies drift with ultra-smooth organic paths (low speed)
//  • Leaves fall gently, rotating slowly like real ones in still air
//  • Mist wisps move almost imperceptibly
//  • Minimum 5 seconds before content appears
//  • SEO: page HTML renders server-side; loader is CSS-only overlay
// ═══════════════════════════════════════════════════════════════

// ── Organic smooth noise (layered sines — no sharp jumps) ──
function organicNoise(t, seed) {
  // Very slow, blended frequencies — prevents any sudden direction changes
  return (
    Math.sin(t * 0.18 + seed)        * 0.50 +
    Math.sin(t * 0.07 + seed * 1.9)  * 0.30 +
    Math.sin(t * 0.31 + seed * 0.5)  * 0.20
  );
}

// ── Firefly: slow, gentle drifter ──
function createFirefly(w, h) {
  return {
    x:            Math.random() * w,
    y:            Math.random() * h,
    vx:           0,
    vy:           0,
    seed:         Math.random() * 200,
    // Very low speed — fireflies barely move
    driftSpeed:   0.04 + Math.random() * 0.06,
    // How far they wander from origin (pixels)
    wander:       40  + Math.random() * 80,
    originX:      0,  // set after creation
    originY:      0,
    radius:       1.2 + Math.random() * 2.5,
    color:        ['#d4a843','#e8c86e','#f5e6c8','#7a9a7e','#a8c49a'][Math.floor(Math.random() * 5)],
    opacity:      0,
    maxOpacity:   0.25 + Math.random() * 0.55,
    // Each firefly breathes at its own slow rate
    pulseSpeed:   0.25 + Math.random() * 0.45,
    pulseSeed:    Math.random() * 100,
    glowRadius:   10  + Math.random() * 22,
    spawnDelay:   Math.random() * 2000,   // stagger appearance over 2s
  };
}

// ── Leaf: slow spiral fall ──
function createLeaf(w, h, fromTop = false) {
  return {
    x:            Math.random() * w,
    y:            fromTop ? -20 - Math.random() * 80 : Math.random() * h,
    size:         5 + Math.random() * 9,
    color:        ['#2d5a3f','#3a7050','#1a3c2a','#4a8a60','#5a7a4a'][Math.floor(Math.random() * 5)],
    rotation:     Math.random() * Math.PI * 2,
    // Very slow rotation — about 1 full turn every 20 seconds
    rotSpeed:     (Math.random() > 0.5 ? 1 : -1) * (0.004 + Math.random() * 0.008),
    // Slow fall — takes 20–40 seconds to cross screen height
    fallSpeed:    0.12 + Math.random() * 0.22,
    // Gentle horizontal sway (small amplitude)
    swayAmplitude: 12 + Math.random() * 20,
    swaySeed:     Math.random() * 100,
    swaySpeed:    0.12 + Math.random() * 0.20,
    opacity:      0.12 + Math.random() * 0.28,
  };
}

// ── Mist wisp: nearly invisible, barely drifting ──
function createMist(w, h) {
  return {
    x:      Math.random() * w,
    y:      h * 0.3 + Math.random() * h * 0.5,
    rx:     180 + Math.random() * 300,
    ry:     60  + Math.random() * 100,
    seed:   Math.random() * 100,
    speed:  0.02 + Math.random() * 0.04,
    opacity: 0.04 + Math.random() * 0.06,
    color:  '#a8c49a',
  };
}

// ── Draw bezier leaf shape ──
function drawLeaf(ctx, x, y, size, rotation, color, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo( size * 0.55, -size * 0.5,  size * 0.45,  size * 0.3, 0,  size);
  ctx.bezierCurveTo(-size * 0.45,  size * 0.3, -size * 0.55, -size * 0.5, 0, -size);
  ctx.fill();
  // Central vein
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity * 0.35;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.75);
  ctx.lineTo(0,  size * 0.65);
  ctx.stroke();
  ctx.restore();
}

// ── PHASE TIMINGS (ms) ──
const T_LOGO     = 800;   // logo fades in
const T_TITLE    = 1800;  // title letters appear
const T_TAGLINE  = 2800;  // tagline appears
const T_EXIT     = 5200;  // begin exit fade  (5.2 s minimum)
const T_DONE     = 5900;  // unmount loader   (5.9 s total)

export default function LoadingScreen({ onComplete }) {
  const canvasRef  = useRef(null);
  const mouseRef   = useRef({ x: -9999, y: -9999 });
  const startRef   = useRef(Date.now());
  const animRef    = useRef(null);
  const doneRef    = useRef(false);

  const [phase,   setPhase]   = useState(0);
  const [exiting, setExiting] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleTouchMove = useCallback((e) => {
    const t = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && t) mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // ── Particle pools ──
    const fireflies = Array.from({ length: 38 }, () => {
      const f = createFirefly(w, h);
      f.originX = f.x;
      f.originY = f.y;
      return f;
    });
    const leaves  = Array.from({ length: 9 }, () => createLeaf(w, h));
    const misties = Array.from({ length: 4 }, () => createMist(w, h));

    let t = 0; // time counter in seconds

    function animate() {
      const elapsed = Date.now() - startRef.current;
      // Increment by ~16ms expressed as slow float
      t += 0.016;

      ctx.clearRect(0, 0, w, h);

      // ── Background — deep forest night ──
      const bg = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.5, Math.max(w, h) * 0.85);
      bg.addColorStop(0,   '#1a3c2a');
      bg.addColorStop(0.45,'#0f2419');
      bg.addColorStop(1,   '#070e0a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── Mist wisps (drawn first, beneath everything) ──
      for (const m of misties) {
        const mx = m.x + organicNoise(t * m.speed,        m.seed)      * 60;
        const my = m.y + organicNoise(t * m.speed * 0.6,  m.seed + 30) * 30;
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, m.rx);
        grad.addColorStop(0,   m.color + '18');
        grad.addColorStop(0.5, m.color + '08');
        grad.addColorStop(1,   'transparent');
        ctx.save();
        ctx.scale(1, m.ry / m.rx);
        ctx.fillStyle = grad;
        ctx.globalAlpha = m.opacity;
        ctx.beginPath();
        ctx.arc(mx, my * (m.rx / m.ry), m.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Leaves ──
      for (const leaf of leaves) {
        leaf.y += leaf.fallSpeed;
        leaf.x += Math.sin(t * leaf.swaySpeed + leaf.swaySeed) * leaf.swayAmplitude * 0.012;
        leaf.rotation += leaf.rotSpeed;
        if (leaf.y > h + 40) Object.assign(leaf, createLeaf(w, h, true));
        drawLeaf(ctx, leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.color, leaf.opacity);
      }

      // ── Fireflies ──
      const { x: mx, y: my } = mouseRef.current;

      for (const f of fireflies) {
        if (elapsed < f.spawnDelay) continue;

        // Very slow organic drift — position is always near origin
        const noiseX = organicNoise(t * f.driftSpeed,        f.seed)      * f.wander;
        const noiseY = organicNoise(t * f.driftSpeed * 0.7,  f.seed + 80) * f.wander;
        const targetX = f.originX + noiseX;
        const targetY = f.originY + noiseY;

        // Gentle mouse warmth (attraction, not repulsion)
        const dx   = mx - f.originX;
        const dy   = my - f.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let tx = targetX, ty = targetY;
        if (dist < 180 && dist > 0) {
          const pull = ((180 - dist) / 180) * 0.35;
          tx += dx * pull;
          ty += dy * pull;
        }

        // Smooth lerp toward target — never snaps
        f.x += (tx - f.x) * 0.018;
        f.y += (ty - f.y) * 0.018;

        // Wrap origin (not position) for seamless wandering
        if (f.originX < -30) f.originX = w + 30;
        if (f.originX > w + 30) f.originX = -30;
        if (f.originY < -30) f.originY = h + 30;
        if (f.originY > h + 30) f.originY = -30;

        // Slow breathing pulse
        const pulse = (Math.sin(t * f.pulseSpeed + f.pulseSeed) + 1) / 2;
        const targetOpacity = f.maxOpacity * (0.2 + pulse * 0.8);
        f.opacity += (targetOpacity - f.opacity) * 0.025;

        // Outer glow
        ctx.save();
        const glowGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowRadius);
        glowGrad.addColorStop(0,   f.color + Math.round(f.opacity * 80).toString(16).padStart(2,'0'));
        glowGrad.addColorStop(0.5, f.color + '12');
        glowGrad.addColorStop(1,   'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(f.x - f.glowRadius, f.y - f.glowRadius, f.glowRadius * 2, f.glowRadius * 2);
        ctx.restore();

        // Core dot
        ctx.save();
        ctx.globalAlpha = f.opacity;
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Phase triggers ──
      if (!doneRef.current) {
        if (elapsed > T_LOGO    && phase < 1) setPhase(1);
        if (elapsed > T_TITLE   && phase < 2) setPhase(2);
        if (elapsed > T_TAGLINE && phase < 3) setPhase(3);
        if (elapsed > T_EXIT    && phase < 4) {
          setPhase(4);
          setExiting(true);
          setTimeout(() => {
            doneRef.current = true;
            onComplete?.();
          }, T_DONE - T_EXIT);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove',  handleMouseMove);
    window.addEventListener('touchmove',  handleTouchMove, { passive: true });

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove',  handleMouseMove);
      window.removeEventListener('touchmove',  handleTouchMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — canvas loop is self-contained

  // Progress: fills over T_EXIT milliseconds
  const elapsed  = Date.now() - startRef.current;
  const progress = Math.min(elapsed / T_EXIT, 1);

  return (
    /*
     * SEO note: this div is position:fixed with z-index:10000.
     * The page HTML beneath it is still fully rendered and indexed by
     * crawlers (Googlebot doesn't wait for JS). No content is hidden
     * from bots. The loader simply overlays on first user visit.
     */
    <div className={`loader ${exiting ? 'loader--exit' : ''}`} role="status" aria-label="Loading Poudhyal Farms">
      <canvas ref={canvasRef} className="loader__canvas" />

      <div className="loader__content">
        {/* Logo mark */}
        <div className={`loader__logo ${phase >= 1 ? 'loader__logo--visible' : ''}`}>
          <svg width="68" height="68" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M24 4C24 4 8 14 8 28a16 16 0 0 0 32 0C40 14 24 4 24 4z" fill="url(#loader-grad)" opacity="0.18" />
            <path d="M24 6C24 6 10 15 10 27a14 14 0 0 0 28 0C38 15 24 6 24 6z" stroke="#d4a843" strokeWidth="1.5" fill="none" />
            <path d="M24 38V18"          stroke="#d4a843" strokeWidth="1"   strokeLinecap="round" />
            <path d="M18 26c3-2 6-2 9 0" stroke="#d4a843" strokeWidth="1"   strokeLinecap="round" />
            <path d="M16 21c4-3 8-3 12 0" stroke="#d4a843" strokeWidth="1"  strokeLinecap="round" />
            <defs>
              <linearGradient id="loader-grad" x1="8" y1="4" x2="40" y2="44">
                <stop offset="0%"   stopColor="#2d5a3f" />
                <stop offset="100%" stopColor="#d4a843" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Farm name — letters drop in one by one */}
        <div className={`loader__title ${phase >= 2 ? 'loader__title--visible' : ''}`}>
          {'POUDHYAL  FARMS'.split('').map((char, i) => (
            <span key={i} className="loader__char" style={{ animationDelay: `${i * 50}ms` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <div className={`loader__tagline ${phase >= 3 ? 'loader__tagline--visible' : ''}`}>
          <span className="loader__line" />
          <span>Organic Farmstay&ensp;·&ensp;Sikkim</span>
          <span className="loader__line" />
        </div>

        {/* Progress bar — takes T_EXIT ms to fill */}
        <div className="loader__progress">
          <div className="loader__progress-bar" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  );
}
