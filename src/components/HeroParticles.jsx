"use client";
import { useEffect, useRef } from 'react';

// ══════════════════════════════════════════════════════════════════
//  STATISTICS — Box-Muller Transform
//  Converts two Uniform(0,1) samples into a Gaussian(μ, σ) sample.
//  z = √(−2 ln u₁) · cos(2π u₂)
//  Produces the natural "cluster-at-centre" density seen in real
//  phenomena — particles are denser near origin, thinning outward.
// ══════════════════════════════════════════════════════════════════
function gaussian(mean = 0, std = 1) {
  const u1 = Math.max(1e-10, Math.random());
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ══════════════════════════════════════════════════════════════════
//  FLUID DYNAMICS — Divergence-Free Velocity from Stream Function ψ
//  In 2D incompressible flow, any scalar field ψ(x,y,t) gives a
//  velocity field via its curl that satisfies ∇·u = 0:
//    u = ∂ψ/∂y   v = −∂ψ/∂x
//  ψ is approximated with layered trigonometric harmonics, which
//  also connects this directly to Fourier representation.
//  The numerical gradient uses central finite differences.
// ══════════════════════════════════════════════════════════════════
function psi(x, y, t) {
  return (
    Math.sin(x * 0.70 + t * 0.28) * Math.cos(y * 0.90) * 0.55 +
    Math.cos(x * 1.40 - y * 0.80 + t * 0.22) * 0.28 +
    Math.sin(x * 0.50 + y * 1.35 - t * 0.38) * 0.17
  );
}
function curlVel(x, y, t) {
  const eps = 0.06;
  return {
    u:  (psi(x, y + eps, t) - psi(x, y - eps, t)) / (2 * eps), // ∂ψ/∂y
    v: -(psi(x + eps, y, t) - psi(x - eps, y, t)) / (2 * eps), // −∂ψ/∂x
  };
}

// ══════════════════════════════════════════════════════════════════
//  SYSTEMS THEORY / EMERGENCE — Boid
//  No central controller. Each boid follows 3 LOCAL rules only.
//  Complex global flocking EMERGES from their interactions:
//    1. Separation — avoid crowding neighbours (repulsion)
//    2. Alignment  — steer toward average heading  (velocity match)
//    3. Cohesion   — steer toward centre of mass   (attraction)
//  The weights control the character of emergence: high separation
//  → sparse clouds; high cohesion → tight murmurations.
// ══════════════════════════════════════════════════════════════════
const SEP_R   = 1.1;    // separation radius
const NEIGH_R = 3.0;    // neighbourhood radius
const MAX_V   = 0.022;  // max speed
const MAX_F   = 0.0014; // max steering force magnitude
const W_SEP   = 1.6;    // separation weight (dominates at close range)
const W_ALI   = 0.7;    // alignment weight
const W_COH   = 0.5;    // cohesion weight
const BOUNDS  = { x: 8.8, y: 5.2, z: 2.6 };

class Boid {
  constructor() {
    // Statistics: Gaussian-clustered spawn — higher density at origin
    this.x = gaussian(0, 3.4);
    this.y = gaussian(0, 2.0);
    this.z = gaussian(0, 1.1);

    // Uniform random heading on unit circle (constrained Z for 2.5D feel)
    const θ = Math.random() * Math.PI * 2;
    const s = 0.006 + Math.random() * 0.008;
    this.vx = s * Math.cos(θ);
    this.vy = s * Math.sin(θ) * 0.55;
    this.vz = (Math.random() - 0.5) * s * 0.25;

    this.ax = 0; this.ay = 0; this.az = 0;
    this.brightness = 0.5 + Math.random() * 0.5;
  }

  steer(boids) {
    let sx = 0, sy = 0, sz = 0, sn = 0; // separation accumulators
    let ax = 0, ay = 0, az = 0, an = 0; // alignment accumulators
    let cx = 0, cy = 0, cz = 0, cn = 0; // cohesion accumulators

    for (const b of boids) {
      if (b === this) continue;
      const dx = b.x - this.x, dy = b.y - this.y, dz = b.z - this.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (d < SEP_R && d > 0) {
        // Separation: flee with inverse-distance weighting
        sx -= dx / d; sy -= dy / d; sz -= dz / d; sn++;
      }
      if (d < NEIGH_R && d > 0) {
        // Alignment: accumulate neighbour velocities
        ax += b.vx; ay += b.vy; az += b.vz; an++;
        // Cohesion: accumulate neighbour positions
        cx += b.x; cy += b.y; cz += b.z; cn++;
      }
    }

    if (sn) this._force(sx / sn, sy / sn, sz / sn, W_SEP);
    if (an) this._force(ax / an - this.vx, ay / an - this.vy, az / an - this.vz, W_ALI);
    if (cn) this._force(cx / cn - this.x, cy / cn - this.y, cz / cn - this.z, W_COH);
  }

  _force(fx, fy, fz, w) {
    const len = Math.sqrt(fx * fx + fy * fy + fz * fz);
    if (len < 1e-9) return;
    const f = (w * MAX_F) / len;
    this.ax += fx * f; this.ay += fy * f; this.az += fz * f;
  }

  update(t) {
    // FLUID DYNAMICS: curl velocity field nudges boids through the mist
    const cv = curlVel(this.x * 0.38, this.y * 0.38, t);
    this.ax += cv.u * 0.00022;
    this.ay += cv.v * 0.00022;

    // CALCULUS: Euler integration — vₙ₊₁ = vₙ + aₙ,  xₙ₊₁ = xₙ + vₙ₊₁
    this.vx += this.ax; this.vy += this.ay; this.vz += this.az;

    // Speed clamp (L² norm)
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
    if (spd > MAX_V) { const r = MAX_V / spd; this.vx *= r; this.vy *= r; this.vz *= r; }

    this.x += this.vx; this.y += this.vy; this.z += this.vz;
    this.ax = 0; this.ay = 0; this.az = 0;

    // Elastic soft boundary — linear restoring force when outside box
    if (Math.abs(this.x) > BOUNDS.x) this.vx -= Math.sign(this.x) * 0.0025;
    if (Math.abs(this.y) > BOUNDS.y) this.vy -= Math.sign(this.y) * 0.0025;
    if (Math.abs(this.z) > BOUNDS.z) this.vz -= Math.sign(this.z) * 0.0012;

    // Speed → visual brightness mapping (Calculus: proportional)
    this.brightness = 0.32 + Math.min(0.68, spd / MAX_V * 0.68);
  }
}

export default function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer, animId;
    let destroyed = false;

    async function init() {
      const THREE = await import('three');
      if (destroyed) return;

      // Reduce particle count on mobile (performance budget)
      const isMobile = canvas.offsetWidth < 768;
      const COUNT = isMobile ? 75 : 140;

      const scene  = new THREE.Scene();
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
      camera.position.z = 6;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);

      // Initialise boids with Gaussian distribution
      const boids = Array.from({ length: COUNT }, () => new Boid());

      const posArr  = new Float32Array(COUNT * 3);
      const sizeArr = new Float32Array(COUNT);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(posArr,  3));
      geo.setAttribute('size',     new THREE.BufferAttribute(sizeArr, 1));

      const mat = new THREE.PointsMaterial({
        color:           0xf5e4a8,  // warm cream-gold
        size:            0.058,
        transparent:     true,
        opacity:         0.48,
        blending:        THREE.AdditiveBlending,
        depthWrite:      false,
        sizeAttenuation: true,
      });

      scene.add(new THREE.Points(geo, mat));

      let t = 0;
      function loop() {
        if (destroyed) return;
        animId = requestAnimationFrame(loop);
        t += 0.007;

        // Boids: two-pass update (steer then move)
        for (const b of boids) b.steer(boids);
        for (const b of boids) b.update(t);

        // Sync to GPU buffer
        for (let i = 0; i < COUNT; i++) {
          posArr[i * 3]     = boids[i].x;
          posArr[i * 3 + 1] = boids[i].y;
          posArr[i * 3 + 2] = boids[i].z;
          sizeArr[i]        = boids[i].brightness;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.size.needsUpdate     = true;

        // Slow sinusoidal camera drift for perceived depth
        camera.position.x = Math.sin(t * 0.038) * 0.22;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      }
      loop();

      const onResize = () => {
        if (!canvas || destroyed) return;
        const nw = canvas.offsetWidth, nh = canvas.offsetHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize, { passive: true });

      return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
      };
    }

    let cleanup;
    init().then(fn => { cleanup = fn; });

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        mixBlendMode: 'screen',
      }}
    />
  );
}
