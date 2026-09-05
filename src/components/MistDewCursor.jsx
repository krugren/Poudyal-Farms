"use client";
import { useEffect, useRef } from 'react';

/**
 * MistDewCursor — Mountain Mist + Dew Drop cursor.
 *
 * ── IFRAME "magic wipe" ────────────────────────────────────────────────────
 *   Direct mouseenter/mouseleave listeners on each <iframe> element (not at
 *   the document level, which has timing gaps and cross-origin quirks).
 *
 *   Enter iframe:
 *     • document.documentElement.classList.remove('no-native-cursor')
 *       → native Google Maps cursor (hand, zoom, etc.) is instantly restored
 *     • All custom cursor elements set opacity 0 (instant, no transition)
 *
 *   Leave iframe:
 *     • document.documentElement.classList.add('no-native-cursor')
 *       → native cursor hidden again
 *     • waitIframe flag set — custom cursor stays hidden
 *     • Next mousemove: snap ALL spring positions to real cursor coords,
 *       THEN show cursor — prevents the "snap from border" jump
 *
 *   MutationObserver watches document.body for dynamically-injected iframes
 *   (lazy-loaded Google Maps, embeds added after mount).
 *
 * ── ADAPTIVE COLOUR — elementsFromPoint() z-stack sampling ────────────────
 *   document.elementsFromPoint() returns ALL elements stacked at cursor pos.
 *   This finds hero__overlay (a sibling, not an ancestor of hero__content)
 *   and correctly reads its dark gradient → cream cursor on the hero photo.
 *   Also handles linear-gradient / radial-gradient CSS backgrounds.
 *
 * ── SPRING PHYSICS ─────────────────────────────────────────────────────────
 *   dot  k=0.50  tight tracking | ring k=0.14  surface-tension lag
 *   mist k=0.36→0.06 spring chain; rear particles drift up when slow
 */

const N_MIST = 10;
const SPRING = [0.36, 0.30, 0.25, 0.21, 0.17, 0.14, 0.11, 0.09, 0.07, 0.06];
const BLUR   = [0, 0, 0, 0, 0.3, 0.6, 0.9, 1.1, 1.4, 1.6];
const OFF    = 'translate(-600px,-600px)';

const C_DARK   = 'rgba(15,36,25,0.95)';
const C_DARK_A = 'rgba(15,36,25,0.06)';
const C_LITE   = 'rgba(250,246,240,0.95)';
const C_LITE_A = 'rgba(250,246,240,0.06)';

function getLuminance(x, y) {
  try {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      if (el.closest?.('[data-cursor-root]')) continue;
      const theme = el.dataset?.cursorTheme;
      if (theme === 'dark')  return 0.0;
      if (theme === 'light') return 1.0;
      const style = getComputedStyle(el);
      const bg = style.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const n = bg.match(/[\d.]+/g);
        if (n && n.length >= 3) {
          const alpha = n[3] !== undefined ? +n[3] : 1;
          if (alpha > 0.1)
            return (0.299 * +n[0] + 0.587 * +n[1] + 0.114 * +n[2]) / 255;
        }
      }
      const bgImg = style.backgroundImage;
      if (bgImg && bgImg !== 'none' && !bgImg.trim().startsWith('url(')) {
        const stops = bgImg.match(/rgba?\([^)]+\)/g);
        if (stops) {
          let sum = 0, cnt = 0;
          for (const s of stops) {
            const n = s.match(/[\d.]+/g);
            if (n && n.length >= 3) {
              sum += (0.299 * +n[0] + 0.587 * +n[1] + 0.114 * +n[2]) / 255;
              cnt++;
            }
          }
          if (cnt > 0) return sum / cnt;
        }
      }
    }
  } catch (_) {/* noop */}
  return 0.1;
}

export default function MistDewCursor() {
  const mouse      = useRef({ x: -600, y: -600 });
  const prevM      = useRef({ x: -600, y: -600 });
  const dotPos     = useRef({ x: -600, y: -600 });
  const ringPos    = useRef({ x: -600, y: -600 });
  const mistPos    = useRef(SPRING.map(() => ({ x: -600, y: -600 })));
  const isLight    = useRef(false);
  const waitIframe = useRef(false);
  const frame_n    = useRef(0);

  const dotEl    = useRef(null);
  const ringWrap = useRef(null);
  const ringFace = useRef(null);
  const mistEls  = useRef([]);
  const raf      = useRef(null);
  const ready    = useRef(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.documentElement.classList.add('no-native-cursor');

    if (!document.getElementById('mist-kf')) {
      const s = document.createElement('style');
      s.id = 'mist-kf';
      s.textContent = `
        @keyframes mistRipple {
          from { width:0; height:0; opacity:0.75; }
          to   { width:60px; height:60px; opacity:0; }
        }
      `;
      document.head.appendChild(s);
    }

    // ── Colour / show / hide helpers ───────────────────────────────────
    function applyColour(light) {
      const [fg, bgFill] = light ? [C_DARK, C_DARK_A] : [C_LITE, C_LITE_A];
      if (dotEl.current)    dotEl.current.style.backgroundColor    = fg;
      if (ringFace.current) {
        ringFace.current.style.borderColor     = fg;
        ringFace.current.style.backgroundColor = bgFill;
      }
      mistEls.current.forEach(el => { if (el) el.style.backgroundColor = fg; });
      isLight.current = light;
    }

    function showCursor() {
      if (dotEl.current)    dotEl.current.style.opacity    = '1';
      if (ringWrap.current) ringWrap.current.style.opacity = '1';
      // mist particles: opacity driven per-frame by rAF (auto-recovers)
    }

    // Instant hide — no CSS transition delay (critical for iframe wipe)
    function hideCursor() {
      if (dotEl.current) {
        dotEl.current.style.transition = 'none';
        dotEl.current.style.opacity    = '0';
        // Restore transition after paint
        requestAnimationFrame(() => {
          if (dotEl.current)
            dotEl.current.style.transition = 'opacity 0.18s ease, background-color 0.35s ease';
        });
      }
      if (ringWrap.current) {
        ringWrap.current.style.transition = 'none';
        ringWrap.current.style.opacity    = '0';
        requestAnimationFrame(() => {
          if (ringWrap.current)
            ringWrap.current.style.transition = 'opacity 0.2s ease';
        });
      }
      mistEls.current.forEach(el => el && (el.style.opacity = '0'));
    }

    function snapToPoint(x, y) {
      mouse.current = prevM.current = { x, y };
      dotPos.current = ringPos.current = { x, y };
      mistPos.current.forEach(m => { m.x = x; m.y = y; });
    }

    // ── IFRAME magic wipe — direct element listeners ───────────────────
    const onIframeEnter = () => {
      // Instantly restore native cursor inside the embed
      document.documentElement.classList.remove('no-native-cursor');
      hideCursor();
    };

    const onIframeLeave = () => {
      // Re-suppress native cursor; defer showing custom cursor until position snap
      document.documentElement.classList.add('no-native-cursor');
      waitIframe.current = true;
    };

    function attachIframeListeners(iframe) {
      if (iframe.dataset.cursorBound) return;
      iframe.dataset.cursorBound = '1';
      iframe.addEventListener('mouseenter', onIframeEnter);
      iframe.addEventListener('mouseleave', onIframeLeave);
    }

    // Attach to all current iframes
    document.querySelectorAll('iframe').forEach(attachIframeListeners);

    // Watch for iframes injected after mount (lazy maps, embeds)
    const mutObs = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IFRAME') attachIframeListeners(node);
          node.querySelectorAll?.('iframe').forEach(attachIframeListeners);
        });
      });
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    // ── Mouse event handlers ───────────────────────────────────────────
    const onMove = (e) => {
      const { clientX: x, clientY: y } = e;

      if (!ready.current) {
        snapToPoint(x, y);
        ready.current = true;
        applyColour(getLuminance(x, y) > 0.55);
        return;
      }

      if (waitIframe.current) {
        // First move after leaving iframe: snap positions → reveal cursor cleanly
        waitIframe.current = false;
        snapToPoint(x, y);
        showCursor();
        return;
      }

      prevM.current = { ...mouse.current };
      mouse.current = { x, y };
    };

    const onOver = (e) => {
      if (e.target.closest('a,button,[role="button"],input,textarea,select,label,[tabindex]')) {
        if (ringFace.current) ringFace.current.style.transform = 'scale(1.75)';
        if (dotEl.current)    dotEl.current.style.opacity      = '0';
      }
    };

    const onOut = (e) => {
      if (e.target.closest('a,button,[role="button"],input,textarea,select,label,[tabindex]')) {
        if (ringFace.current) ringFace.current.style.transform = 'scale(1)';
        if (dotEl.current)    dotEl.current.style.opacity      = '1';
      }
    };

    const onClick = (e) => {
      const fg = isLight.current ? C_DARK : C_LITE;
      const el = document.createElement('div');
      Object.assign(el.style, {
        position    : 'fixed',
        left        : `${e.clientX}px`,
        top         : `${e.clientY}px`,
        borderRadius: '50%',
        border      : `1.5px solid ${fg}`,
        transform   : 'translate(-50%,-50%)',
        pointerEvents: 'none',
        zIndex      : '999998',
        animation   : 'mistRipple 0.65s ease-out forwards',
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };

    // Viewport leave/enter (not iframe — those are handled above)
    const onPageLeave  = () => hideCursor();
    const onPageEnter  = () => { if (!waitIframe.current) showCursor(); };

    document.addEventListener('mousemove',  onMove,     { passive: true });
    document.addEventListener('mouseover',  onOver,     { passive: true });
    document.addEventListener('mouseout',   onOut,      { passive: true });
    document.addEventListener('click',      onClick);
    document.documentElement.addEventListener('mouseleave', onPageLeave);
    document.documentElement.addEventListener('mouseenter', onPageEnter);

    // ── rAF animation loop ─────────────────────────────────────────────
    function animate() {
      frame_n.current++;

      if (ready.current) {
        const mx = mouse.current.x;
        const my = mouse.current.y;
        const vx = mx - prevM.current.x;
        const vy = my - prevM.current.y;
        const speed = Math.hypot(vx, vy);

        // Adaptive colour every 6 frames
        if (frame_n.current % 6 === 0) {
          const light = getLuminance(mx, my) > 0.55;
          if (light !== isLight.current) applyColour(light);
        }

        // Dot
        dotPos.current.x += (mx - dotPos.current.x) * 0.5;
        dotPos.current.y += (my - dotPos.current.y) * 0.5;
        if (dotEl.current) {
          dotEl.current.style.transform =
            `translate(${dotPos.current.x - 5}px,${dotPos.current.y - 5}px)`;
        }

        // Ring
        ringPos.current.x += (mx - ringPos.current.x) * 0.14;
        ringPos.current.y += (my - ringPos.current.y) * 0.14;
        if (ringWrap.current) {
          ringWrap.current.style.transform =
            `translate(${ringPos.current.x}px,${ringPos.current.y}px)`;
        }

        // Mist chain + upward drift
        let px = mx, py = my;
        for (let i = 0; i < N_MIST; i++) {
          const p = mistPos.current[i];
          const k = SPRING[i];
          p.x += (px - p.x) * k;
          p.y += (py - p.y) * k;
          if (i >= 3 && speed < 5) {
            p.y -= 0.22 * (1 - k) * (1 - speed / 5);
          }
          px = p.x; py = p.y;

          const el = mistEls.current[i];
          if (!el) continue;
          const sz = Math.max(1.5, 8.5 - i * 0.68);
          const op = Math.max(0.03, 0.7 * (1 - i / N_MIST) ** 1.4);
          el.style.transform = `translate(${p.x - sz * 0.5}px,${p.y - sz * 0.5}px)`;
          el.style.opacity   = op;
          el.style.width     = sz + 'px';
          el.style.height    = sz + 'px';
        }
      }

      raf.current = requestAnimationFrame(animate);
    }
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('no-native-cursor');
      document.querySelectorAll('iframe[data-cursor-bound]').forEach(iframe => {
        iframe.removeEventListener('mouseenter', onIframeEnter);
        iframe.removeEventListener('mouseleave', onIframeLeave);
        delete iframe.dataset.cursorBound;
      });
      mutObs.disconnect();
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseout',   onOut);
      document.removeEventListener('click',      onClick);
      document.documentElement.removeEventListener('mouseleave', onPageLeave);
      document.documentElement.removeEventListener('mouseenter', onPageEnter);
      document.getElementById('mist-kf')?.remove();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-cursor-root=""
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999999 }}
    >
      {Array.from({ length: N_MIST }).map((_, i) => (
        <div
          key={i}
          ref={el => { mistEls.current[i] = el; }}
          style={{
            position       : 'fixed',
            top            : 0,
            left           : 0,
            borderRadius   : '50%',
            backgroundColor: C_LITE,
            pointerEvents  : 'none',
            willChange     : 'transform, opacity',
            transform      : OFF,
            filter         : BLUR[i] > 0 ? `blur(${BLUR[i]}px)` : 'none',
            transition     : 'background-color 0.35s ease',
          }}
        />
      ))}

      <div
        ref={ringWrap}
        style={{
          position    : 'fixed',
          top         : 0,
          left        : 0,
          pointerEvents: 'none',
          willChange  : 'transform',
          transform   : OFF,
          transition  : 'opacity 0.2s ease',
        }}
      >
        <div
          ref={ringFace}
          style={{
            position       : 'absolute',
            top            : '-12px',
            left           : '-12px',
            width          : '24px',
            height         : '24px',
            borderRadius   : '50%',
            border         : `1.5px solid ${C_LITE}`,
            backgroundColor: C_LITE_A,
            transition     : [
              'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)',
              'border-color 0.35s ease',
              'background-color 0.35s ease',
            ].join(', '),
          }}
        />
      </div>

      <div
        ref={dotEl}
        style={{
          position       : 'fixed',
          top            : 0,
          left           : 0,
          width          : '10px',
          height         : '10px',
          borderRadius   : '50%',
          backgroundColor: C_LITE,
          pointerEvents  : 'none',
          willChange     : 'transform',
          transform      : OFF,
          transition     : 'opacity 0.18s ease, background-color 0.35s ease',
        }}
      />
    </div>
  );
}
