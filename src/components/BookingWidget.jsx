"use client";
import { useState, useRef } from 'react';
import DualCalendar from './DualCalendar';
import GuestPicker from './GuestPicker';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function sanitize(str, max = 1000) {
  return String(str || '').replace(/<[^>]*>/g, '').trim().slice(0, max);
}

export default function BookingWidget({ rooms }) {
  const [checkIn,  setCheckIn]  = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]     = useState({ adults: 2, children: 0, infants: 0 });
  const [room, setRoom]         = useState(rooms?.[0] || null);

  // form fields
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [notes,    setNotes]    = useState('');
  const [website,  setWebsite]  = useState(''); // honeypot

  const [step,     setStep]     = useState('dates'); // dates | details | success
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const formRef = useRef(null); // scroll anchor for the contact form

  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 0;

  const pricePerNight = room?.pricePerNight || 0;
  const subtotal      = nights * pricePerNight;
  const totalGuests   = guests.adults + guests.children;

  // ── Helpers ──
  function handleDates({ checkIn: ci, checkOut: co }) {
    setCheckIn(ci); setCheckOut(co);
  }

  function handleRoomChange(slug) {
    const found = rooms.find(r => r.slug === slug);
    if (found) setRoom(found);
  }

  function canProceed() {
    return checkIn && checkOut && nights > 0 && room;
  }

  // Scroll to form + focus + shake the first empty required field
  function scrollAndPromptForm() {
    const el = formRef.current;
    if (!el) return;
    // Smooth scroll to form
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // After scroll settles, find first empty required input and focus + shake it
    setTimeout(() => {
      const first = el.querySelector('input[required]:placeholder-shown, input[required][value=""]');
      const target = first || el.querySelector('input[required]');
      if (target) {
        target.focus({ preventScroll: true });
        target.classList.add('bw__field--shake');
        target.addEventListener('animationend', () => target.classList.remove('bw__field--shake'), { once: true });
      }
    }, 400);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (website) { setStep('success'); return; } // honeypot
    setError('');
    setLoading(true);

    const guestBreakdown = `Adults:${guests.adults} Children:${guests.children} Infants:${guests.infants}`;
    const specialRequests = [
      guestBreakdown,
      sanitize(notes, 500),
    ].filter(Boolean).join(' | ');

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            sanitize(name, 100),
          email:           sanitize(email, 200),
          phone:           sanitize(phone, 20),
          checkIn,
          checkOut,
          guests:          totalGuests,
          roomType:        room.slug,
          specialRequests,
          website,          // honeypot field
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ──
  if (step === 'success') {
    return (
      <div className="bw-success">
        <div className="bw-success__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4 12 14.01l-3-3"/>
          </svg>
        </div>
        <h2 className="bw-success__title">Request Received!</h2>
        <p className="bw-success__sub">
          Thank you, {name}. We have received your reservation request for{' '}
          <strong>{room?.name}</strong> from{' '}
          <strong>{fmt(checkIn)}</strong> to <strong>{fmt(checkOut)}</strong>.
        </p>
        <p className="bw-success__note">
          We'll contact you at <strong>{email}</strong> within 24 hours to confirm
          availability and arrange payment. No charge has been made.
        </p>
        <button
          className="btn btn--outline mt-8"
          onClick={() => {
            setStep('dates'); setCheckIn(''); setCheckOut('');
            setName(''); setEmail(''); setPhone(''); setNotes('');
          }}
        >
          Make Another Request
        </button>
      </div>
    );
  }

  // ── Main layout ──
  return (
    <div className="bw">

      {/* ── Left: Calendar + Guest Picker ── */}
      <div className="bw__left">

        {/* Room selector — compact tabs */}
        {rooms?.length > 1 && (
          <div className="bw__room-tabs">
            {rooms.map(r => (
              <button
                key={r.slug}
                type="button"
                className={`bw__room-tab ${room?.slug === r.slug ? 'bw__room-tab--active' : ''}`}
                onClick={() => handleRoomChange(r.slug)}
              >
                <span className="bw__room-tab-name">{r.name}</span>
                <span className="bw__room-tab-price">₹{r.pricePerNight.toLocaleString('en-IN')}/night</span>
              </button>
            ))}
          </div>
        )}

        {/* Dual-month calendar */}
        <DualCalendar
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={handleDates}
          roomSlug={room?.slug}
        />

        {/* Guest picker — shown below calendar */}
        <div className="bw__guest-row">
          <GuestPicker
            value={guests}
            onChange={setGuests}
            maxGuests={room?.maxGuests || 12}
          />
        </div>

        {/* Guest details form — slides in once dates selected */}
        {canProceed() && (
          <form ref={formRef} className="bw__form" onSubmit={handleSubmit} noValidate>
            {/* Honeypot */}
            <div className="hp-field" aria-hidden="true">
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>

            <div className="bw__form-title">Your Details</div>

            <div className="bw__form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  className="form-input"
                  type="tel"
                  required
                  maxLength={20}
                  autoComplete="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 …"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Special Requests</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Dietary needs, arrival time, occasions…"
                />
              </div>
            </div>

            {error && <p className="form-error mt-2">{error}</p>}
          </form>
        )}
      </div>

      {/* ── Right: Sticky pricing sidebar ── */}
      <div className="bw__sidebar">
        <div className="bw__sidebar-card">

          {/* Room name + stars */}
          <div className="bw__card-header">
            <span className="bw__card-room">{room?.name || 'Farm Cottage'}</span>
            <span className="bw__card-stars" aria-label="5 stars">
              {'★'.repeat(5)}
            </span>
          </div>

          {/* Divider */}
          <div className="bw__card-rule" />

          {/* Price headline */}
          <div className="bw__price-row">
            <span className="bw__price">₹{pricePerNight.toLocaleString('en-IN')}</span>
            <span className="bw__price-unit">/ night</span>
          </div>

          {/* Date + guest summary boxes */}
          <div className="bw__summary-grid">
            <div className={`bw__summary-box ${!checkIn ? 'bw__summary-box--empty' : ''}`}>
              <span className="bw__summary-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                CHECK-IN
              </span>
              <span className="bw__summary-value">{checkIn ? fmt(checkIn) : 'Select date'}</span>
            </div>
            <div className={`bw__summary-box ${!checkOut ? 'bw__summary-box--empty' : ''}`}>
              <span className="bw__summary-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                CHECK-OUT
              </span>
              <span className="bw__summary-value">{checkOut ? fmt(checkOut) : 'Select date'}</span>
            </div>
            <div className="bw__summary-box bw__summary-box--full">
              <span className="bw__summary-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                GUESTS
              </span>
              <span className="bw__summary-value">
                {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                {guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : ''}
              </span>
            </div>
          </div>

          {/* Price breakdown — only shown when dates selected */}
          {nights > 0 ? (
            <div className="bw__breakdown">
              <div className="bw__breakdown-row">
                <span>₹{pricePerNight.toLocaleString('en-IN')} × {nights} night{nights !== 1 ? 's' : ''}</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="bw__breakdown-total-row">
                <span>Total</span>
                <span className="bw__breakdown-total-amount">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="bw__breakdown-note">No payment required now</p>
            </div>
          ) : (
            <div className="bw__no-dates-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Select your dates on the calendar
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            className={`bw__cta-btn ${canProceed() ? 'bw__cta-btn--active' : 'bw__cta-btn--idle'}`}
            disabled={loading}
            onClick={() => {
              if (!canProceed()) return;

              // Check if all required fields are filled
              const form = formRef.current;
              const allFilled = name.trim().length >= 2 && email.trim().includes('@') && phone.trim().length >= 5;

              if (!form || !allFilled) {
                // Scroll to form and shake the first empty field
                scrollAndPromptForm();
                return;
              }

              // All good — submit
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }}
          >
            <span>{loading ? 'Submitting…' : canProceed() ? 'Request to Book' : 'Select Dates First'}</span>
            {canProceed() && !loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>

          {/* Trust line */}
          <div className="bw__trust">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {canProceed() ? `Confirmed within 24 hrs · No charge yet` : 'Best price guaranteed · Book direct'}
          </div>

        </div>
      </div>

    </div>


  );
}
