"use client";
import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { PinIcon, PhoneIcon, MailIcon, ClockIcon, ChevronDownIcon } from '@/components/Icons';
import { submitEnquiry } from '@/utils/api';

export default function ContactClient({ sections, settings }) {
  const hero = sections.hero || {};
  const faq = sections.faq || {};
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitEnquiry(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const hours = settings.working_hours || {};
  const faqItems = [];
  for (let i = 1; i <= 5; i++) {
    if (faq[`q${i}`]) faqItems.push({ q: faq[`q${i}`], a: faq[`a${i}`] });
  }

  return (
    <>
    <section className="pt-nav section">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="section-label">Reach Out</p>
            <h1 className="section-title">{hero.title || 'Get in Touch'}</h1>
            <p className="section-subtitle">{hero.subtitle}</p>
          </div>
        </ScrollReveal>

        {/* Contact Cards */}
        <div className="grid-4 mb-12">
          <ScrollReveal delay={0}>
            <div className="card contact-card">
              <div className="contact-card__icon"><PinIcon size={22} /></div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>Address</h4>
                <a
                    href="https://www.google.com/maps/search/?api=1&query=Poudhyal+Farms+Rumtek-Ranka+Road+Gangtok+Sikkim+737101"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: 'var(--color-forest)' }}
                  >{settings.address}</a>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="card contact-card">
              <div className="contact-card__icon"><PhoneIcon size={22} /></div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>Phone</h4>
                <a href={`tel:${settings.phone?.replace(/\s/g, '')}`} className="text-sm" style={{ color: 'var(--color-forest)' }}>{settings.phone}</a>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="card contact-card">
              <div className="contact-card__icon"><MailIcon size={22} /></div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>Email</h4>
                <a href={`mailto:${settings.email}`} className="text-sm" style={{ color: 'var(--color-forest)' }}>{settings.email}</a>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="card contact-card">
              <div className="contact-card__icon"><ClockIcon size={22} /></div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>Hours</h4>
                <p className="text-sm text-muted">Reception: {hours.reception || '8 AM – 9 PM'}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>

    <SectionDivider variant="mountains" />

    <section className="section section--alt">
      <div className="container">
        <div className="grid-2 mb-12">
          {/* Enquiry Form */}
          <ScrollReveal direction="left">
            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Send Us a Message</h3>
              {submitted ? (
                <div className="text-center py-8">
                  <MailIcon size={48} className="text-muted mb-4" style={{ margin: '0 auto', display: 'block', color: 'var(--color-forest)' }} />
                  <h4>Message Sent!</h4>
                  <p className="text-sm text-muted mt-2">We&apos;ll respond within 24 hours.</p>
                  <button className="btn btn--outline mt-4" onClick={() => setSubmitted(false)}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="hp-field"><input type="text" name="website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} tabIndex={-1} autoComplete="off" /></div>
                  <div className="grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-input" type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                  </div>
                  {error && <p className="form-error">{error}</p>}
                  <button type="submit" className="btn btn--primary w-full" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* Map + FAQ */}
          <ScrollReveal direction="right">
            <div className="map-wrapper mb-8">
              <iframe src={settings.map_embed_url} width="100%" height="280" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Poudhyal Farms Location" />
            </div>
            {faqItems.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Frequently Asked</h3>
                {faqItems.map((item, i) => (
                  <div key={i} className="faq-item">
                    <button className="faq-question" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      {item.q}
                      <ChevronDownIcon size={18} />
                    </button>
                    <div className={`faq-answer ${openFaq === i ? 'faq-answer--open' : ''}`}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
    </>
  );
}
