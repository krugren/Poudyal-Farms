"use client";
import { useState, useRef, useEffect, useCallback } from 'react';

// ── Star polygon points (shared) ─────────────────────────────────────────────
const STAR_PTS = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

// ── FluidStarIcon ─────────────────────────────────────────────────────────────
// fillPercent: 0–100. Uses clip-path on the gold fill polygon for smooth
// continuous fill. Empty stars show a ghost fill so the star shape is always
// visible (required for the drop-shadow clay effect to read correctly).
function FluidStarIcon({ size = 24, fillPercent = 0, interactive = false }) {
  const clipRight = Math.max(0, Math.min(100, 100 - fillPercent));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Interactive: ghost fill so the star shape is visible when empty
          (the drop-shadow follows the star alpha — needs a filled shape) */}
      {interactive ? (
        <polygon
          points={STAR_PTS}
          fill="rgba(212,168,67,0.16)"
          stroke="rgba(212,168,67,0.32)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        /* Non-interactive: classic outline for empty state */
        <polygon
          points={STAR_PTS}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Gold fill, clipped from the right — animates smoothly */}
      <polygon
        points={STAR_PTS}
        fill="currentColor"
        stroke="none"
        style={{
          clipPath : `inset(0 ${clipRight}% 0 0)`,
          transition: interactive ? 'clip-path 0.07s linear' : 'none',
        }}
      />
    </svg>
  );
}

// ── Fill percentage for a star at position `star` (1–5) ─────────────────────
function fillPct(star, val) {
  return Math.min(100, Math.max(0, (val - (star - 1)) * 100));
}

// ── Snap a continuous value to the nearest 0.5 ──────────────────────────────
function snap(val) {
  return Math.max(0.5, Math.round(val * 2) / 2);
}

// ── Map a clientX coordinate to a continuous 0–5 rating ─────────────────────
function continuousFromX(containerEl, clientX) {
  const buttons = containerEl.querySelectorAll('.star-rating__star');
  const cRect   = containerEl.getBoundingClientRect();
  if (clientX <= cRect.left)  return 0;
  if (clientX >= cRect.right) return 5;

  for (let i = 0; i < buttons.length; i++) {
    const r = buttons[i].getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right) {
      return i + (clientX - r.left) / r.width; // precise sub-star fraction
    }
    // In the gap between stars — treat as boundary of next star
    if (i < buttons.length - 1) {
      const nxt = buttons[i + 1].getBoundingClientRect();
      if (clientX > r.right && clientX < nxt.left) return i + 1;
    }
  }
  return 5;
}

// ── Main component ───────────────────────────────────────────────────────────
export default function StarRating({
  rating,
  setRating,
  interactive = false,
  size = 16,
}) {
  const [hoverVal, setHoverVal]  = useState(0); // continuous 0–5 while hovering
  const containerRef             = useRef(null);
  const isDragging               = useRef(false);

  // Live preview during hover/drag; committed value otherwise
  const displayVal = interactive && hoverVal > 0 ? hoverVal : rating;

  // ── Desktop: container-level mouse tracking ──────────────────────────────
  function handleMouseMove(e) {
    setHoverVal(continuousFromX(containerRef.current, e.clientX));
  }
  function handleStarClick(e, star) {
    if (e.clientX === 0) { setRating(star); return; } // keyboard Enter/Space
    const r  = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    setRating(snap((star - 1) + pct));
  }

  // ── Mobile: non-passive touchmove to prevent page scroll while rating ────
  const handleTouchMove = useCallback((e) => {
    if (!interactive || !isDragging.current) return;
    e.preventDefault();
    setHoverVal(continuousFromX(containerRef.current, e.touches[0].clientX));
  }, [interactive]);

  const handleTouchStart = useCallback((e) => {
    if (!interactive) return;
    isDragging.current = true;
    setHoverVal(continuousFromX(containerRef.current, e.touches[0].clientX));
  }, [interactive]);

  const handleTouchEnd = useCallback(() => {
    if (!interactive) return;
    isDragging.current = false;
    if (hoverVal > 0) { setRating(snap(hoverVal)); setHoverVal(0); }
  }, [interactive, hoverVal, setRating]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true  });
    el.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    el.addEventListener('touchend',   handleTouchEnd,   { passive: true  });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove',  handleTouchMove);
      el.removeEventListener('touchend',   handleTouchEnd);
    };
  }, [interactive, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className={`star-rating${interactive ? ' star-rating--interactive' : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of 5 stars`}
      onMouseMove={interactive ? handleMouseMove         : undefined}
      onMouseLeave={interactive ? () => setHoverVal(0)  : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            className="star-rating__star"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            tabIndex={0}
            onClick={(e) => handleStarClick(e, star)}
            style={{ cursor: 'pointer' }}
          >
            <FluidStarIcon
              size={size}
              fillPercent={fillPct(star, displayVal)}
              interactive
            />
          </button>
        ) : (
          // Read-only display — span, no hover, no ghost fill
          <span key={star} className="star-rating__star" style={{ display: 'inline-flex' }}>
            <FluidStarIcon size={size} fillPercent={fillPct(star, rating)} />
          </span>
        )
      )}
    </div>
  );
}
