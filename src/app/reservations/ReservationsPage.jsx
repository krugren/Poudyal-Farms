"use client";
import { useState } from 'react';
import Calendar from '../../components/Calendar';
import ScrollReveal from '../../components/ScrollReveal';
import { submitReservation } from '../../utils/api';

const ROOM_TYPES = [
  { id: 'farm-cottage', name: 'Farm Cottage', price: 3500, desc: 'Cozy wooden cottage with private balcony facing the mountains. Perfect for couples.' },
  { id: 'heritage-room', name: 'Heritage Room', price: 4500, desc: 'Spacious room in the main house with traditional Sikkimese architecture. Ideal for families.' },
  { id: 'mountain-suite', name: 'Mountain Suite', price: 6000, desc: 'Luxury suite with panoramic views, fireplace, and premium amenities.' },
  { id: 'farm-tour', name: 'Day Farm Tour (No Stay)', price: 1000, desc: 'Guided tour of the farm, lunch included. Select any check-in date.' }
];

export default function ReservationsPage() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', guests: 2, room_type: '', special_requests: ''
  });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkIn) {
      setErrorMessage("Please select a check-in date from the calendar.");
      return;
    }
    if (formData.room_type !== 'farm-tour' && !checkOut) {
      setErrorMessage("Please select a check-out date from the calendar.");
      return;
    }
    if (!formData.room_type) {
      setErrorMessage("Please select a room type.");
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await submitReservation({
        ...formData,
        check_in: checkIn,
        check_out: formData.room_type === 'farm-tour' ? checkIn : checkOut,
        company: ''
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to submit reservation request.');
    }
  };

  return (
    <div className="page-reservations pt-nav">
      <div className="container">
        <div className="text-center mb-12">
          <div className="section-divider"></div>
          <h1 className="section-title">Book Your Stay</h1>
          <p className="section-subtitle">Select your dates and experience to begin your journey to the hills.</p>
        </div>

        {status === 'success' ? (
          <ScrollReveal>
            <div className="card text-center success-card">
              <div className="success-icon">✨</div>
              <h2>Request Received!</h2>
              <p>Thank you, {formData.name}. We have received your reservation request for {checkIn}.</p>
              <p>We will contact you shortly at {formData.email} to confirm your booking and arrange payment.</p>
              <button className="btn btn--primary mt-8" onClick={() => { setStatus('idle'); setCheckIn(''); setCheckOut(''); }}>Make Another Booking</button>
            </div>
          </ScrollReveal>
        ) : (
          <div className="reservation-layout">
            <ScrollReveal direction="right">
              <div className="reservation-sidebar">
                <div className="card mb-6">
                  <h3 className="mb-4">1. Select Dates</h3>
                  <Calendar
                    checkIn={checkIn}
                    checkOut={checkOut}
                    setCheckIn={setCheckIn}
                    setCheckOut={setCheckOut}
                  />
                  <div className="date-summary mt-4">
                    <div className="date-box">
                      <span className="label">Check In</span>
                      <span className="value">{checkIn || '--'}</span>
                    </div>
                    <div className="date-box">
                      <span className="label">Check Out</span>
                      <span className="value">{checkOut || '--'}</span>
                    </div>
                  </div>
                </div>

                <div className="card room-selection">
                  <h3 className="mb-4">2. Select Experience</h3>
                  <div className="room-options">
                    {ROOM_TYPES.map(room => (
                      <label
                        key={room.id}
                        className={`room-card ${formData.room_type === room.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="room_type"
                          value={room.id}
                          checked={formData.room_type === room.id}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="room-card-inner">
                          <h4>{room.name}</h4>
                          <p className="price">₹{room.price} <span>/ night</span></p>
                          <p className="desc">{room.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
              <div className="card reservation-form-card">
                <h3 className="mb-6">3. Guest Details</h3>
                <form onSubmit={handleSubmit} className="reservation-form">
                  <input type="text" name="company" className="hp-field" tabIndex="-1" autoComplete="off" />

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} placeholder="e.g. Jane Doe" />
                  </div>

                  <div className="grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input type="tel" name="phone" className="form-input" required value={formData.phone} onChange={handleChange} placeholder="+91..." />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Number of Guests *</label>
                    <select name="guests" className="form-select" value={formData.guests} onChange={handleChange}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'Guest':'Guests'}</option>)}
                      <option value="7">7+ (Group)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Special Requests (Optional)</label>
                    <textarea name="special_requests" className="form-textarea" style={{ minHeight: '80px' }} value={formData.special_requests} onChange={handleChange} placeholder="Dietary requirements, arrival time, etc."></textarea>
                  </div>

                  {errorMessage && <div className="form-error mb-4">{errorMessage}</div>}

                  <button type="submit" className="btn btn--primary w-full mt-4" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Submitting...' : 'Request Booking'}
                  </button>
                  <p className="text-center text-xs text-muted mt-4">
                    No payment required now. We will confirm availability and contact you.
                  </p>
                </form>
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>
    </div>
  );
}
