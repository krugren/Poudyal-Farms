"use client";
import { useEffect, useRef } from 'react';

/**
 * FourierWave — Animated Fourier synthesis visualisation.
 *
 * SIGNAL PROCESSING — Fourier Synthesis / Superposition
 *   Any periodic waveform f(x) can be decomposed into (or built from)
 *   a weighted sum of sine waves at harmonic frequencies:
 *
 *     f(x, t) = sum_n  A_n * sin(n * omega0 * x  -  phase_n * t)
 *
 *   where:
 *     omega0      = fundamental spatial angular frequency
 *     n * omega0  = nth harmonic (overtone)
 *     A_n         = amplitude (decreasing: A ~ 1/n for odd harmonics)
 *     phase_n     = temporal phase velocity per harmonic
 *
 *   Each harmonic is drawn as a separate SVG path so the viewer can
 *   see individual components AND their superposition simultaneously.
 *   Harmonics 1, 2, 3, 5, 7 are the first five terms of a Fourier series.
 *
 *   Placed in the CTA section as a living decorative signal — the
 *   resonance of the farm with natural rhythms.
 */

// Each entry: { n: harmonic number, amp: amplitude ratio,
//               phase: temporal phase speed, stroke, width }
const HARMONICS = [
  { n: 1, amp: 0.32, phase: 0.26, stroke: 'rgba(212,168,67,0.22)',  width: 1.5 }, // fundamental
  { n: 2, amp: 0.18, phase: 0.51, stroke: 'rgba(212,168,67,0.15)',  width: 1.2 }, // 2nd harmonic
  { n: 3, amp: 0.11, phase: 0.78, stroke: 'rgba(240,220,140,0.11)', width: 1.0 }, // 3rd
  { n: 5, amp: 0.06, phase: 1.08, stroke: 'rgba(250,246,240,0.08)', width: 0.8 }, // 5th
  { n: 7, amp: 0.04, phase: 1.42, stroke: 'rgba(250,246,240,0.06)', width: 0.7 }, // 7th
];

const OMEGA0 = 1.5; // fundamental spatial frequency
const STEPS  = 120; // sample points per path

function buildPath(W, H, harmonic, t) {
  const midY = H * 0.5;
  const amp  = H * harmonic.amp;
  const d = [];
  for (let i = 0; i <= STEPS; i++) {
    const xNorm = i / STEPS;
    const x = xNorm * W;
    const y = midY + amp * Math.sin(harmonic.n * OMEGA0 * xNorm * Math.PI * 2 - harmonic.phase * t);
    d.push(i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(2)}`
                   : `L ${x.toFixed(1)} ${y.toFixed(2)}`);
  }
  return d.join(' ');
}

export default function FourierWave({ height = 90 }) {
  const svgRef   = useRef(null);
  const pathRefs = useRef([]);
  const rafRef   = useRef(null);

  useEffect(() => {
    let t = 0;
    const svg = svgRef.current;
    if (!svg) return;

    function frame() {
      const W = svg.clientWidth;
      const H = svg.clientHeight;
      if (W > 0) {
        t += 0.011;
        HARMONICS.forEach((h, i) => {
          pathRefs.current[i]?.setAttribute('d', buildPath(W, H, h, t));
        });
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        width: '100%', height,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {HARMONICS.map((h, i) => (
        <path
          key={i}
          ref={el => { pathRefs.current[i] = el; }}
          stroke={h.stroke}
          strokeWidth={h.width}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
