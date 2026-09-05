"use client";
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import BookingWidget from '@/components/BookingWidget';
import { CalendarIcon } from '@/components/Icons';

export default function ReservationsClient({ sections, rooms, settings }) {
  const hero = sections.hero || {};

  return (
    <>
      {/* ── Hero header ── */}
      <section className="pt-nav section">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="section-label"><CalendarIcon size={14} /> Reservations</p>
              <h1 className="section-title">{hero.title || 'Book Your Stay'}</h1>
              <p className="section-subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
                {hero.subtitle || 'Select your dates, choose your room, and reserve your spot in the hills.'}
              </p>
            </div>
          </ScrollReveal>

          {/* ── Booking Widget ── */}
          <ScrollReveal>
            <div id="booking-form">
              <BookingWidget rooms={rooms} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider variant="terraces" />

      {/* ── Why book direct ── */}
      <section className="section section--alt">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="section-label">Book Direct</p>
              <h2 className="section-title" style={{ fontSize: 'var(--text-2xl)' }}>
                Why Reserve With Us Directly?
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid-3">
            {[
              { icon: '₹', title: 'Best Price Guaranteed', desc: 'No commission mark-ups. What you see is what you pay — the exact same rate the host receives.' },
              { icon: '✉', title: 'Direct Communication', desc: 'Talk directly with the hosts. Get personalised tips, arrange early check-in, or organise special surprises.' },
              { icon: '🌿', title: 'Flexible & Personal', desc: 'We work around your plans. Long stays, special dietary needs, farm experiences — just ask.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="card bw-reason-card">
                  <div className="bw-reason-card__icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
