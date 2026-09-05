"use client";
import { useState, useEffect, useRef } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import StarRating from '@/components/StarRating';
import { submitFeedback } from '@/utils/api';
import { StarIcon } from '@/components/Icons';

export default function FeedbackClient({ sections, initialFeedback, stats }) {
  const hero = sections.hero || {};
  const [feedbackList, setFeedbackList] = useState(initialFeedback || []);
  const [newIds, setNewIds]             = useState(new Set()); // for highlight animation
  const [liveConnected, setLiveConnected] = useState(false);
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '', website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');
  const seenIds = useRef(new Set((initialFeedback || []).map(f => f.id)));

  // ── Live SSE subscription ───────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource('/api/feedback/stream');

    es.addEventListener('connected', () => setLiveConnected(true));

    es.addEventListener('new_review', (e) => {
      try {
        const { reviews } = JSON.parse(e.data);
        // Filter out any review we already show (e.g. optimistic update from submit)
        const fresh = reviews.filter(r => !seenIds.current.has(r.id));
        if (fresh.length === 0) return;

        fresh.forEach(r => seenIds.current.add(r.id));
        setFeedbackList(prev => [...fresh, ...prev]);
        setNewIds(prev => new Set([...prev, ...fresh.map(r => r.id)]));

        // Remove highlight after animation completes
        setTimeout(() => {
          setNewIds(prev => {
            const next = new Set(prev);
            fresh.forEach(r => next.delete(r.id));
            return next;
          });
        }, 2500);
      } catch { /* ignore malformed */ }
    });

    es.onerror = () => setLiveConnected(false);

    return () => es.close();
  }, []);


  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await submitFeedback(formData);
      if (res.feedback) {
        // Optimistic prepend — mark as seen so SSE doesn't duplicate it
        seenIds.current.add(res.feedback.id);
        setFeedbackList(prev => [res.feedback, ...prev]);
        setNewIds(prev => new Set([...prev, res.feedback.id]));
        setTimeout(() => {
          setNewIds(prev => { const n = new Set(prev); n.delete(res.feedback.id); return n; });
        }, 2500);
      }
      setSubmitted(true);
      setFormData({ name: '', rating: 5, comment: '', website: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const totalReviews = stats.total;
  const avgRating = stats.average;
  const dist = stats.distribution;

  return (
    <>
      <section className="pt-nav section">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label">Guest Stories</p>
              <h1 className="section-title">{hero.title || 'Guest Feedback'}</h1>
              <p className="section-subtitle">{hero.subtitle}</p>
            </div>
          </ScrollReveal>

          {/* Stats Overview */}
          <ScrollReveal>
            <div className="card card--static mb-12" style={{ maxWidth: '600px', margin: '0 auto var(--space-12)' }}>
              <div className="stats-box">
                <div style={{ textAlign: 'center', minWidth: 120 }}>
                  <div className="stats-big">{avgRating}</div>
                  <StarRating rating={Math.round(avgRating)} size={18} />
                  <div className="text-xs text-muted mt-2">{totalReviews} reviews</div>
                </div>
                <div className="rating-dist" style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map(n => (
                    <div key={n} className="rating-dist__row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 28 }}>{n} <StarIcon size={12} filled /></span>
                      <div className="rating-dist__bar">
                        <div className="rating-dist__fill" style={{ width: totalReviews > 0 ? `${(dist[n] / totalReviews) * 100}%` : '0%' }} />
                      </div>
                      <span className="rating-dist__count">{dist[n]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider variant="forest" />

      <section className="section section--alt">
        <div className="container">
          {/* Reviews Grid */}
          <div className="feedback-wall mb-12">
          {feedbackList.map((fb, i) => (
              <ScrollReveal key={fb.id} delay={newIds.has(fb.id) ? 0 : i * 0.08}>
                <div
                  className="card review-card"
                  style={newIds.has(fb.id) ? {
                    animation: 'review-highlight 2.5s ease-out forwards',
                    outline: '2px solid var(--color-gold)',
                    outlineOffset: 2,
                  } : {}}
                >
                  <div className="review-header">
                    {fb.authorPhoto
                      ? <img src={fb.authorPhoto} alt={fb.name} className="review-avatar" style={{ objectFit: 'cover', padding: 0 }} />
                      : <div className="review-avatar" style={{ backgroundColor: fb.avatarColor }}>{fb.name.charAt(0)}</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div className="review-author">{fb.name}</div>
                      <StarRating rating={fb.rating} size={14} />
                    </div>
                    {fb.source === 'google' && (
                      <span title="Verified Google Review" style={{ opacity: 0.7, flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="review-comment">&ldquo;{fb.comment}&rdquo;</p>
                  <p className="review-date">{new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="river" />

      <section className="section">
        <div className="container">
          {/* Submit Form */}
          <ScrollReveal>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Share Your Experience</h3>
              {submitted ? (
                <div className="text-center py-8">
                  <LeafIconInline />
                  <h4 style={{ marginTop: 'var(--space-4)' }}>Thank you for your feedback!</h4>
                  <p className="text-sm text-muted mt-2">Your review has been submitted and is now visible to other guests.</p>
                  <button className="btn btn--outline mt-4" onClick={() => setSubmitted(false)}>Write Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="hp-field"><input type="text" name="website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} tabIndex={-1} autoComplete="off" /></div>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" type="text" required minLength={2} maxLength={100} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <StarRating rating={formData.rating} setRating={r => setFormData({...formData, rating: r})} interactive size={24} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Experience</label>
                    <textarea className="form-textarea" required minLength={5} maxLength={1000} value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} placeholder="Tell us about your stay..." />
                  </div>
                  {error && <p className="form-error">{error}</p>}
                  <button type="submit" className="btn btn--primary w-full" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function LeafIconInline() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><path d="M11 20A7 7 0 0 1 4 13C4 6 12 2 12 2s8 4 8 11a7 7 0 0 1-7 7z"/><path d="M12 20V10"/><path d="M8 14c2-1 4-1 6 0"/></svg>;
}
