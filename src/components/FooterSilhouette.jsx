"use client";
import FourierWave from './FourierWave';

/**
 * FooterSilhouette — Himalayan silhouette + floating Fourier waves.
 *
 * LAYER ORDER (bottom → top):
 *   1. SVG   — mountain + pine-tree silhouette (position: absolute fill)
 *   2. HTML  — FourierWave rendered AFTER the SVG in DOM order
 *              → naturally paints on top within the same stacking context
 *
 * SKY — no gradient rect.
 *   The wrapper div is purely transparent above the mountain fills.
 *   Whatever section sits above the footer (CTA, form, contact section)
 *   shows through directly as the sky — no fake green overlay on light pages.
 *
 * POSITION — top: -120px (120 px of the silhouette rise above the footer
 *   boundary into the section above). The section above IS the sky.
 */

// ── Deterministic pine tree silhouette ──────────────────────────────────────
const PINE_PATH = (() => {
  const BASE = 148, SPAN = 180, W = 22, N = 65;
  const pts = [`M0,${SPAN}`, `L0,${BASE}`];
  for (let i = 0; i < N; i++) {
    const cx = i * W + W / 2;
    const h  = 20 + (i * 13) % 19;
    pts.push(`L${cx},${BASE - h}`, `L${cx + W / 2},${BASE}`);
  }
  pts.push(`L1440,${BASE}`, `L1440,${SPAN}`, 'Z');
  return pts.join(' ');
})();

// ── Kanchenjunga-inspired peak profile ──────────────────────────────────────
const MOUNTAIN_BACK =
  'M0,180 L0,90 Q62,84 105,74 C148,62 192,50 232,34 ' +
  'Q262,20 282,28 L322,52 Q375,14 412,16 L450,56 ' +
  'Q494,6 528,2 Q564,0 598,4 L622,42 ' +
  'Q666,20 706,24 L732,50 Q782,14 824,18 L852,60 ' +
  'Q908,30 964,36 L1016,70 ' +
  'C1070,48 1132,40 1192,50 L1252,80 ' +
  'Q1328,64 1388,78 Q1420,84 1440,88 L1440,180 Z';

// ── Rolling foothills ────────────────────────────────────────────────────────
const MOUNTAIN_MID =
  'M0,180 L0,120 C85,113 168,106 250,114 C318,122 372,102 438,107 ' +
  'C506,112 558,122 622,112 C686,102 740,118 806,110 ' +
  'C870,102 924,120 988,114 C1052,108 1128,124 1200,117 ' +
  'C1274,110 1360,122 1440,118 L1440,180 Z';

export default function FooterSilhouette() {
  return (
    <div
      aria-hidden="true"
      className="footer-silhouette"
      style={{
        position     : 'absolute',
        top          : '-120px',
        left         : 0,
        right        : 0,
        width        : '100%',
        height       : '180px',
        pointerEvents: 'none',
        zIndex       : 5,
      }}
    >
      {/* ── Layer 1: Mountain + pine SVG ──────────────────────────────────
          position: absolute so the FourierWave div can overlay it cleanly.
          No sky rect — section above shows through as pure transparent sky. */}
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          display: 'block',
        }}
      >
        {/* Far Himalayan peaks — solid, no gradient */}
        <path d={MOUNTAIN_BACK} fill="#1d4228" />

        {/* Mid foothills — solid */}
        <path d={MOUNTAIN_MID}  fill="#142818" />

        {/* Pine-tree ground — exact footer colour */}
        <path d={PINE_PATH}     fill="#0f2419" />
      </svg>

      {/* ── Layer 2: Fourier waves — floats in the sky above the peaks ───
          Rendered AFTER the SVG so it naturally paints on top.
          top: 5px places the waves in the transparent sky zone (top ~40 px
          of the silhouette are above the highest mountain peaks). */}
      <div
        style={{
          position: 'absolute',
          top     : '5px',
          left    : 0,
          right   : 0,
          height  : '55px',
          zIndex  : 1,
        }}
      >
        <FourierWave height={55} />
      </div>
    </div>
  );
}
