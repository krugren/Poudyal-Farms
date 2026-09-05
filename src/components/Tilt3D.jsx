"use client";
import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Tilt3D — Spring-physics 3D card tilt with specular glare.
 *
 * LINEAR ALGEBRA
 *   The tilt is the composition of two rotation matrices applied
 *   to the card's local coordinate system:
 *     M = Perspective(d) · Ry(θy) · Rx(θx)
 *   where θy = nx · strength  (horizontal mouse normalised to [−1,1])
 *         θx = −ny · strength (vertical mouse normalised to [−1,1])
 *   CSS computes the full matrix product on the GPU via
 *   `perspective() rotateY() rotateX()`.
 *
 * CALCULUS — Exponential Spring
 *   The return-to-rest is modelled as exponential decay:
 *     dε/dt = −k · ε   →   ε(t) = ε₀ · e^(−kt)
 *   Discretised per-frame: currAngle += (target − curr) · k
 *   k ≈ 0.12 gives a critically-damped feel (~8 frames to settle).
 *
 * OPTICS — Specular Glare
 *   A radial gradient mimics the specular highlight predicted by
 *   the Law of Reflection (angle of incidence = angle of reflection).
 *   The glare peak moves to the "mirror image" of the viewer as the
 *   card tilts, following the half-vector H = (L + V) / |L + V|.
 *
 * Touch devices: Tilt3D is transparent — it renders a plain div so
 * existing CSS :hover rules apply unmodified (Fitts's Law applies).
 */
export default function Tilt3D({
  children,
  strength = 10,   // max rotation in degrees
  scale    = 1.024,// scale factor on hover
  glare    = true, // show specular glare overlay
  className = '',
  style     = {},
}) {
  const ref      = useRef(null);
  const glareRef = useRef(null);
  const rafRef   = useRef(null);
  const s        = useRef({
    currX: 0, currY: 0,
    targX: 0, targY: 0,
    glX: 50,  glY: 50,
    hovering: false,
  });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Animation loop (spring physics) ──────────────────────────────────────
  const animate = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // Calculus: discrete exponential decay towards target angles
    const k = 0.12;
    s.current.currX += (s.current.targX - s.current.currX) * k;
    s.current.currY += (s.current.targY - s.current.currY) * k;

    const rx = s.current.currX;
    const ry = s.current.currY;
    const sc = s.current.hovering ? scale : 1;

    // Linear Algebra: M = Perspective · Ry(ry) · Rx(rx) · Scale
    el.style.transform =
      `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${sc},${sc},1)`;

    // Optics: specular glare at reflected viewer position
    if (glare && glareRef.current) {
      glareRef.current.style.background =
        `radial-gradient(circle at ${s.current.glX}% ${s.current.glY}%, ` +
        `rgba(255,255,255,0.11) 0%, transparent 62%)`;
    }

    // Continue only while visually significant
    const moving =
      Math.abs(s.current.targX - s.current.currX) > 0.008 ||
      Math.abs(s.current.targY - s.current.currY) > 0.008;
    if (s.current.hovering || moving) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      rafRef.current = null;
    }
  }, [scale, glare]);

  const startLoop = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // Normalise to [−1, 1] in each axis
    const nx = ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
    const ny = ((e.clientY - rect.top)   / rect.height) * 2 - 1;
    s.current.targX = -ny * strength; // pitch  (Rx)
    s.current.targY =  nx * strength; // yaw    (Ry)
    // Specular: glare follows surface reflection of viewer direction
    s.current.glX = (nx + 1) / 2 * 100;
    s.current.glY = (ny + 1) / 2 * 100;
    startLoop();
  }, [strength, startLoop]);

  const onEnter = useCallback(() => { s.current.hovering = true;  startLoop(); }, [startLoop]);
  const onLeave = useCallback(() => {
    s.current.hovering = false;
    s.current.targX = 0;
    s.current.targY = 0;
    startLoop();
  }, [startLoop]);

  // ── Touch fallback ────────────────────────────────────────────────────────
  if (isTouch) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transformStyle:  'preserve-3d',
        willChange:      'transform',
        transition:      'box-shadow 0.35s ease',
        position:        'relative',
        cursor:          'default',
      }}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Optics: glare overlay — simulates specular surface highlight */}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      )}
      {children}
    </div>
  );
}
