"use client";
import { useState } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { submitEnquiry } from '../../utils/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitEnquiry({ ...formData, website: '' }); // honeypot
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="page-contact pt-nav">
      <div className="container">
        
        <div className="text-center mb-12">
          <div className="section-divider"></div>
          <h1 className="section-title">Get in Touch</h1>
          <p className="section-subtitle">Have questions? We're here to help you plan your perfect getaway.</p>
        </div>

        <div className="grid-2 align-start">
          {/* Contact Info & Map */}
          <ScrollReveal direction="right">
            <div className="contact-info">
              <div className="card mb-8">
                <h3 className="mb-6">Contact Information</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <div>
                      <strong>Address</strong>
                      <p>Poudhyal Farms, Rumtek-Ranka Road,<br/>Gangtok, Sikkim 737101, India</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p><a href="tel:+919876543210">+91 98765 43210</a></p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <div>
                      <strong>Email</strong>
                      <p><a href="mailto:stay@poudhyalfarms.com">stay@poudhyalfarms.com</a></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="map-wrapper card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14217.915082101344!2d88.58652431738283!3d27.330800099999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a570498305fb%3A0xc6ebf19a0a4c0717!2sGangtok%2C%20Sikkim!5e0!3m2!1sen!2sin!4v1717671510464!5m2!1sen!2sin" 
                  width="100%" 
                  height="300" 
                  style={{ border: 0, borderRadius: 'var(--radius-md)' }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Poudhyal Farms Location Map"
                ></iframe>
              </div>
            </div>
          </ScrollReveal>

          {/* Enquiry Form */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="card enquiry-form-card">
              <h3 className="mb-6">Send an Enquiry</h3>
              
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="success-icon mb-4">✨</div>
                  <h4>Message Sent!</h4>
                  <p className="text-muted">Thank you for reaching out. We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input type="text" name="website" className="hp-field" tabIndex="-1" autoComplete="off" />
                  
                  <div className="grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="grid-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject *</label>
                      <select name="subject" className="form-select" value={formData.subject} onChange={handleChange}>
                        <option value="General Enquiry">General Enquiry</option>
                        <option value="Group Booking">Group Booking (7+ Guests)</option>
                        <option value="Event Hosting">Event Hosting</option>
                        <option value="Farm Tour Only">Farm Tour Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Message *</label>
                    <textarea name="message" className="form-textarea" required value={formData.message} onChange={handleChange}></textarea>
                  </div>

                  <button type="submit" className="btn btn--primary w-full mt-4" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                  {status === 'error' && <p className="form-error text-center mt-2">Failed to send message. Please try again.</p>}
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>

      </div>
    </div>
  );
}
