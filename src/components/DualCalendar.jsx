"use client";
import { useState, useEffect, useCallback } from 'react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function isoDate(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function addMonths(year, month, delta) {
  let m = month - 1 + delta;
  let y = year + Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  return { year: y, month: m + 1 };
}

// ── Single-month grid ──────────────────────────────────────────────────────
function MonthGrid({ year, month, checkIn, checkOut, hovered, bookedDates, onDateClick, onDateHover, isFirst, today }) {
  const daysInMonth  = new Date(year, month, 0).getDate();
  const startWeekday = new Date(year, month - 1, 1).getDay();

  const cells = [];

  // blank leading cells
  for (let i = 0; i < startWeekday; i++) {
    cells.push(<div key={`b${i}`} className="dcal__day dcal__day--blank" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = isoDate(year, month, d);
    const dateObj  = new Date(dateStr + 'T00:00:00');
    const todayObj = new Date(today + 'T00:00:00');

    const isPast   = dateObj < todayObj;
    const isBooked = bookedDates.has(dateStr);
    const disabled = isPast || isBooked;

    const isStart  = checkIn === dateStr;
    const isEnd    = checkOut === dateStr;

    // range highlight: between checkIn..checkOut or checkIn..hovered
    const rangeEnd = checkOut || hovered;
    let isInRange  = false;
    if (checkIn && rangeEnd && !isStart) {
      const ci = new Date(checkIn  + 'T00:00:00');
      const ce = new Date(rangeEnd + 'T00:00:00');
      if (ci < ce) {
        isInRange = dateObj > ci && dateObj < ce;
      }
    }
    const isHovEnd = !checkOut && hovered === dateStr && checkIn && dateObj > new Date(checkIn + 'T00:00:00');

    let cls = 'dcal__day';
    if (disabled)   cls += ' dcal__day--disabled';
    if (isStart)    cls += ' dcal__day--start';
    if (isEnd)      cls += ' dcal__day--end';
    if (isInRange)  cls += ' dcal__day--range';
    if (isHovEnd)   cls += ' dcal__day--hov-end';
    if (isBooked && !isPast) cls += ' dcal__day--booked';

    cells.push(
      <button
        key={dateStr}
        type="button"
        className={cls}
        disabled={disabled}
        onClick={() => !disabled && onDateClick(dateStr)}
        onMouseEnter={() => !disabled && onDateHover(dateStr)}
        aria-label={dateStr}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="dcal__month">
      <div className="dcal__month-header">
        {MONTH_NAMES[month - 1]} {year}
      </div>
      <div className="dcal__weekdays">
        {DAY_LABELS.map(l => <div key={l} className="dcal__wday">{l}</div>)}
      </div>
      <div className="dcal__grid">{cells}</div>
    </div>
  );
}

// ── DualCalendar ───────────────────────────────────────────────────────────
export default function DualCalendar({ checkIn, checkOut, onChange, roomSlug }) {
  const todayStr   = new Date().toISOString().split('T')[0];
  const nowY = parseInt(todayStr.split('-')[0]);
  const nowM = parseInt(todayStr.split('-')[1]);

  const [leftYear,  setLeftYear]  = useState(nowY);
  const [leftMonth, setLeftMonth] = useState(nowM);
  const [hovered,   setHovered]   = useState(null);
  const [bookedDates, setBooked]  = useState(new Set());
  const [loading,   setLoading]   = useState(false);

  // right month is always leftMonth + 1
  const { year: rightYear, month: rightMonth } = addMonths(leftYear, leftMonth, 1);

  // fetch booked dates for the two visible months
  const fetchBooked = useCallback(async () => {
    setLoading(true);
    try {
      const params1 = new URLSearchParams({ month: leftMonth,  year: leftYear  });
      const params2 = new URLSearchParams({ month: rightMonth, year: rightYear });
      const [r1, r2] = await Promise.all([
        fetch(`/api/reservations/available?${params1}`).then(r => r.json()),
        fetch(`/api/reservations/available?${params2}`).then(r => r.json()),
      ]);
      const combined = new Set([
        ...Object.keys(r1.bookedDates || {}),
        ...Object.keys(r2.bookedDates || {}),
      ]);
      setBooked(combined);
    } catch {
      // fail silently — user can still pick dates
    } finally {
      setLoading(false);
    }
  }, [leftYear, leftMonth, rightYear, rightMonth]);

  useEffect(() => { fetchBooked(); }, [fetchBooked]);

  function handleDateClick(dateStr) {
    if (!checkIn || (checkIn && checkOut)) {
      // start fresh selection
      onChange({ checkIn: dateStr, checkOut: '' });
      return;
    }
    // second click
    if (dateStr <= checkIn) {
      onChange({ checkIn: dateStr, checkOut: '' });
      return;
    }
    // check for booked dates in range
    let cur = new Date(checkIn + 'T00:00:00');
    const end = new Date(dateStr + 'T00:00:00');
    let blocked = false;
    while (cur < end) {
      if (bookedDates.has(cur.toISOString().split('T')[0])) { blocked = true; break; }
      cur.setDate(cur.getDate() + 1);
    }
    if (blocked) {
      onChange({ checkIn: dateStr, checkOut: '' });
    } else {
      onChange({ checkIn, checkOut: dateStr });
    }
  }

  function handlePrev() {
    const minY = nowY; const minM = nowM;
    if (leftYear === minY && leftMonth === minM) return;
    const prev = addMonths(leftYear, leftMonth, -1);
    setLeftYear(prev.year); setLeftMonth(prev.month);
  }

  function handleNext() {
    const next = addMonths(leftYear, leftMonth, 1);
    setLeftYear(next.year); setLeftMonth(next.month);
  }

  const canGoPrev = !(leftYear === nowY && leftMonth === nowM);

  const nightCount = checkIn && checkOut
    ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 0;

  return (
    <div className="dcal">
      {/* Nav row */}
      <div className="dcal__nav">
        <button
          type="button"
          className="dcal__nav-btn"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          ‹
        </button>

        <span className="dcal__status">
          {loading ? (
            <span className="dcal__loading">Loading…</span>
          ) : checkIn && checkOut ? (
            <strong>{nightCount} night{nightCount !== 1 ? 's' : ''}</strong>
          ) : checkIn ? (
            <span className="dcal__hint">Select check-out date</span>
          ) : (
            <span className="dcal__hint">Select check-in date</span>
          )}
        </span>

        <button
          type="button"
          className="dcal__nav-btn"
          onClick={handleNext}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Two month grids */}
      <div className="dcal__months" onMouseLeave={() => setHovered(null)}>
        <MonthGrid
          year={leftYear} month={leftMonth}
          checkIn={checkIn} checkOut={checkOut}
          hovered={hovered}
          bookedDates={bookedDates}
          onDateClick={handleDateClick}
          onDateHover={setHovered}
          today={todayStr}
          isFirst
        />
        <div className="dcal__divider" />
        <MonthGrid
          year={rightYear} month={rightMonth}
          checkIn={checkIn} checkOut={checkOut}
          hovered={hovered}
          bookedDates={bookedDates}
          onDateClick={handleDateClick}
          onDateHover={setHovered}
          today={todayStr}
        />
      </div>

      {/* Legend + clear */}
      <div className="dcal__footer">
        <div className="dcal__legend">
          <span className="dcal__legend-dot dcal__legend-dot--booked" />
          <span>Unavailable</span>
        </div>
        {(checkIn || checkOut) && (
          <button
            type="button"
            className="dcal__clear"
            onClick={() => onChange({ checkIn: '', checkOut: '' })}
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
