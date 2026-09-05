"use client";
import { useState, useRef, useEffect } from 'react';

export default function GuestPicker({ value, onChange, maxGuests = 12 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const { adults = 1, children = 0, infants = 0 } = value;
  const totalGuests = adults + children;

  function adjust(field, delta) {
    const next = { ...value, [field]: Math.max(0, (value[field] || 0) + delta) };
    // adults min 1
    if (next.adults < 1) next.adults = 1;
    // cap total (adults + children)
    if (next.adults + next.children > maxGuests) return;
    // infants max 5
    if (next.infants > 5) return;
    onChange(next);
  }

  const summaryStr = [
    `${adults} adult${adults !== 1 ? 's' : ''}`,
    children > 0 ? `${children} child${children !== 1 ? 'ren' : ''}` : null,
    infants  > 0 ? `${infants} infant${infants  !== 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="gpick" ref={ref}>
      <button
        type="button"
        className={`gpick__trigger ${open ? 'gpick__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="gpick__label">GUESTS</span>
        <span className="gpick__value">{summaryStr}</span>
        <svg className={`gpick__arrow ${open ? 'gpick__arrow--up' : ''}`}
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="gpick__panel" role="dialog" aria-label="Select number of guests">
          <GuestRow
            label="Adults"
            sub="Ages 13 or above"
            value={adults}
            onMinus={() => adjust('adults', -1)}
            onPlus={() => adjust('adults', +1)}
            minusDisabled={adults <= 1}
            plusDisabled={totalGuests >= maxGuests}
          />
          <GuestRow
            label="Children"
            sub="Ages 2–12"
            value={children}
            onMinus={() => adjust('children', -1)}
            onPlus={() => adjust('children', +1)}
            minusDisabled={children <= 0}
            plusDisabled={totalGuests >= maxGuests}
          />
          <GuestRow
            label="Infants"
            sub="Under 2"
            value={infants}
            onMinus={() => adjust('infants', -1)}
            onPlus={() => adjust('infants', +1)}
            minusDisabled={infants <= 0}
            plusDisabled={infants >= 5}
          />
          <button
            type="button"
            className="gpick__done"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

function GuestRow({ label, sub, value, onMinus, onPlus, minusDisabled, plusDisabled }) {
  return (
    <div className="gpick__row">
      <div className="gpick__row-info">
        <span className="gpick__row-label">{label}</span>
        <span className="gpick__row-sub">{sub}</span>
      </div>
      <div className="gpick__counter">
        <button
          type="button"
          className="gpick__btn"
          onClick={onMinus}
          disabled={minusDisabled}
          aria-label={`Decrease ${label}`}
        >−</button>
        <span className="gpick__count">{value}</span>
        <button
          type="button"
          className="gpick__btn"
          onClick={onPlus}
          disabled={plusDisabled}
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  );
}
