"use client";
import { useRef, useEffect, useState } from 'react';

/**
 * SectionDivider — Cinematic nature-themed animated SVG dividers.
 * Variants: 'mountains', 'river', 'forest', 'terraces'
 */
export default function SectionDivider({ variant = 'mountains', flip = false, dark = false }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Colours that shift with dark-section context
  const fill1 = dark ? 'rgba(26,60,42,0.25)'  : 'rgba(45,90,63,0.12)';
  const fill2 = dark ? 'rgba(26,60,42,0.40)'  : 'rgba(45,90,63,0.20)';
  const fill3 = dark ? 'rgba(26,60,42,0.55)'  : 'rgba(45,90,63,0.30)';
  const gold1 = dark ? 'rgba(212,168,67,0.55)': 'rgba(212,168,67,0.75)';
  const gold2 = dark ? 'rgba(212,168,67,0.35)': 'rgba(212,168,67,0.50)';
  const mistId = `mist-${variant}-${dark ? 'd' : 'l'}`;

  return (
    <div
      ref={ref}
      className={`sd sd--${variant} ${visible ? 'sd--visible' : ''} ${flip ? 'sd--flip' : ''} ${dark ? 'sd--dark' : ''}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="sd__svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={mistId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dark ? '#0f2419' : '#faf6f0'} stopOpacity="0" />
            <stop offset="100%" stopColor={dark ? '#0f2419' : '#faf6f0'} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* ──── MOUNTAINS ──── */}
        {variant === 'mountains' && (
          <>
            {/* Back range — faintest, furthest */}
            <path className="sd__layer sd__layer--1"
              d="M0,88 L90,62 L180,76 L300,40 L420,58 L540,30 L640,52 L740,22 L840,48 L960,34 L1080,52 L1180,26 L1300,50 L1380,38 L1440,55 L1440,120 L0,120 Z"
              fill={fill1} />
            {/* Mid range */}
            <path className="sd__layer sd__layer--2"
              d="M0,96 L130,70 L220,84 L350,52 L460,68 L560,45 L680,66 L780,38 L880,60 L1000,48 L1120,64 L1240,42 L1360,58 L1440,68 L1440,120 L0,120 Z"
              fill={fill2} />
            {/* Foreground ridge — strongest */}
            <path className="sd__layer sd__layer--3"
              d="M0,104 L170,84 L320,94 L440,72 L570,84 L690,66 L810,78 L940,62 L1070,76 L1210,64 L1340,78 L1440,86 L1440,120 L0,120 Z"
              fill={fill3} />
            {/* Mist pool at base */}
            <rect className="sd__mist" x="0" y="75" width="1440" height="45" fill={`url(#${mistId})`} />
            {/* Golden horizon — the critical glowing line */}
            <path className="sd__horizon"
              d="M0,86 Q180,74 360,80 Q540,86 720,78 Q900,70 1080,80 Q1260,90 1440,82"
              fill="none" stroke={gold1} strokeWidth="1.8" strokeLinecap="round" />
            {/* Softer secondary glow line just below */}
            <path className="sd__horizon sd__horizon--secondary"
              d="M0,90 Q200,80 400,85 Q600,90 720,83 Q900,76 1100,85 Q1300,93 1440,87"
              fill="none" stroke={gold2} strokeWidth="3.5" strokeLinecap="round" />
          </>
        )}

        {/* ──── RIVER ──── */}
        {variant === 'river' && (
          <>
            <path className="sd__layer sd__layer--1"
              d="M0,82 C240,66 480,96 720,72 C960,50 1200,86 1440,68 L1440,120 L0,120 Z"
              fill={fill1} />
            <path className="sd__layer sd__layer--2"
              d="M0,94 C200,78 400,100 600,84 C800,68 1000,96 1200,80 C1350,68 1420,84 1440,80 L1440,120 L0,120 Z"
              fill={fill2} />
            {/* Primary water-line */}
            <path className="sd__river"
              d="M-60,82 C120,70 320,96 520,78 C720,62 920,94 1120,78 C1320,64 1440,82 1500,76"
              fill="none" stroke={gold1} strokeWidth="1.8" strokeLinecap="round" />
            {/* Secondary shimmer line */}
            <path className="sd__river sd__river--2"
              d="M-60,90 C140,80 340,102 540,86 C740,72 940,100 1140,86 C1340,74 1440,90 1500,84"
              fill="none" stroke={gold2} strokeWidth="3.5" strokeLinecap="round" />
            {/* Floating pebble particles */}
            <circle className="sd__particle sd__particle--1" cx="310" cy="80" r="2.5" fill={gold1} />
            <circle className="sd__particle sd__particle--2" cx="660" cy="74" r="1.8" fill={gold1} />
            <circle className="sd__particle sd__particle--3" cx="1010" cy="82" r="2.2" fill={gold1} />
            <circle className="sd__particle sd__particle--4" cx="490" cy="90" r="1.5" fill={gold2} />
          </>
        )}

        {/* ──── FOREST ──── */}
        {variant === 'forest' && (
          <>
            {/* Deep canopy — far layer */}
            <path className="sd__layer sd__layer--1"
              d="M0,72 Q60,56 120,66 Q180,50 240,62 Q300,46 360,58 Q420,44 480,54 Q540,40 600,52 Q660,38 720,50 Q780,36 840,48 Q900,34 960,46 Q1020,32 1080,44 Q1140,36 1200,46 Q1260,40 1320,50 Q1380,44 1440,52 L1440,120 L0,120 Z"
              fill={fill1} />
            {/* Mid canopy */}
            <path className="sd__layer sd__layer--2"
              d="M0,84 Q80,70 160,78 Q240,66 320,74 Q400,62 480,70 Q560,58 640,66 Q720,54 800,62 Q880,50 960,60 Q1040,52 1120,62 Q1200,56 1280,66 Q1360,60 1440,68 L1440,120 L0,120 Z"
              fill={fill2} />
            {/* Foreground edge */}
            <path className="sd__layer sd__layer--3"
              d="M0,96 Q100,84 200,90 Q300,78 400,88 Q500,76 600,84 Q700,74 800,82 Q900,72 1000,80 Q1100,72 1200,80 Q1300,76 1440,84 L1440,120 L0,120 Z"
              fill={fill3} />
            {/* Mist at base */}
            <rect className="sd__mist" x="0" y="78" width="1440" height="42" fill={`url(#${mistId})`} />
            {/* Drifting leaves */}
            <ellipse className="sd__leaf sd__leaf--1" cx="252" cy="66" rx="6" ry="3.5" fill={gold1} opacity="0.8" transform="rotate(-30 252 66)" />
            <ellipse className="sd__leaf sd__leaf--2" cx="588" cy="56" rx="5" ry="3" fill={fill3} opacity="0.9" transform="rotate(20 588 56)" />
            <ellipse className="sd__leaf sd__leaf--3" cx="928" cy="63" rx="7" ry="4" fill={gold2} opacity="0.8" transform="rotate(-15 928 63)" />
            <ellipse className="sd__leaf sd__leaf--4" cx="1198" cy="70" rx="5" ry="3" fill={fill3} opacity="0.85" transform="rotate(35 1198 70)" />
            {/* Golden canopy-break horizon */}
            <path className="sd__horizon"
              d="M0,84 Q360,72 720,80 Q1080,88 1440,76"
              fill="none" stroke={gold1} strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}

        {/* ──── TERRACES ──── */}
        {variant === 'terraces' && (
          <>
            {/* Top stepped layer */}
            <path className="sd__layer sd__layer--1"
              d="M0,66 L200,66 L200,60 L440,60 L440,54 L680,54 L680,48 L920,48 L920,54 L1160,54 L1160,60 L1440,60 L1440,120 L0,120 Z"
              fill={fill1} />
            {/* Mid terrace */}
            <path className="sd__layer sd__layer--2"
              d="M0,80 L180,80 L180,74 L420,74 L420,68 L660,68 L660,62 L900,62 L900,68 L1140,68 L1140,74 L1440,74 L1440,120 L0,120 Z"
              fill={fill2} />
            {/* Bottom terrace */}
            <path className="sd__layer sd__layer--3"
              d="M0,96 L160,96 L160,90 L400,90 L400,84 L640,84 L640,78 L880,78 L880,84 L1120,84 L1120,90 L1440,90 L1440,120 L0,120 Z"
              fill={fill3} />
            {/* Golden terrace edge lines */}
            <line className="sd__terrace-line sd__terrace-line--1" x1="0" y1="66" x2="1440" y2="60" stroke={gold1} strokeWidth="1.5" />
            <line className="sd__terrace-line sd__terrace-line--2" x1="0" y1="80" x2="1440" y2="74" stroke={gold1} strokeWidth="1.5" />
            <line className="sd__terrace-line sd__terrace-line--3" x1="0" y1="96" x2="1440" y2="90" stroke={gold2} strokeWidth="1.5" />
            {/* Tea bush markers */}
            <circle className="sd__particle sd__particle--1" cx="320" cy="62"  r="2.8" fill={gold1} />
            <circle className="sd__particle sd__particle--2" cx="560" cy="56"  r="2.2" fill={gold1} />
            <circle className="sd__particle sd__particle--3" cx="800" cy="50"  r="2.5" fill={gold2} />
            <circle className="sd__particle sd__particle--4" cx="1040" cy="56" r="2" fill={gold2} />
            {/* Mist pool */}
            <rect className="sd__mist" x="0" y="78" width="1440" height="42" fill={`url(#${mistId})`} />
          </>
        )}
      </svg>
    </div>
  );
}
