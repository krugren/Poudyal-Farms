"use client";
import { useEffect } from 'react';

/**
 * SmoothScroll — Lenis-powered smooth scroll provider.
 * Mounted once in ClientLayout. No UI output.
 */
export default function SmoothScroll() {
  useEffect(() => {
    let lenis;
    let rafId;

    async function init() {
      const { default: Lenis } = await import('lenis');

      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false, // Let mobile scroll feel native
      });

      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }

    init();

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
