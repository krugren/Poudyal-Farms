"use client";
import { Fragment, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogoIcon, CalendarIcon, MailIcon, StarIcon,
  UsersIcon, SparkleIcon, CheckIcon, DownloadIcon,
} from '@/components/Icons';
import {
  getAdminStats, getEnquiries, getReservations, getFeedback,
  updateEnquiryStatus, updateReservationStatus, toggleFeedback,
  deleteFeedback, importGoogleReviews, verifyToken,
} from '@/lib/admin-api';
import AdminNotifications from '@/components/AdminNotifications';
import GalleryTab from '@/components/GalleryTab';

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

const AVATAR_COLORS = ['#1a3c2a','#2d5a3f','#d4a843','#c44b3f','#4285F4','#7c3aed','#0891b2','#854d0e'];
function avatarColor(name) { return AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name) { return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

function Stars({ n }) {
  return <span className="a-stars">{'★'.repeat(Math.max(1, Math.min(5, n || 5)))}</span>;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function RefreshBtn({ onClick, loading }) {
  return (
    <button className="a-btn a-btn--outline a-btn--sm" onClick={onClick} disabled={loading}>
      <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none' }}>↻</span>
      {loading ? 'Refreshing…' : 'Refresh'}
    </button>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ stats, enquiries, reservations, reviews }) {
  const newEnquiries = enquiries.filter(e => e.status === 'new').length;
  const pendingRes = reservations.filter(r => r.status === 'pending').length;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div>
      <div className="a-stats-grid">
        <div className="a-stat-card">
          <div className="a-stat-card__icon a-stat-card__icon--green">📬</div>
          <div>
            <div className="a-stat-card__num">{stats?.totalEnquiries ?? enquiries.length}</div>
            <div className="a-stat-card__label">Total Enquiries</div>
            {newEnquiries > 0 && <span className="a-stat-card__tag a-stat-card__tag--danger">{newEnquiries} unread</span>}
            {newEnquiries === 0 && <span className="a-stat-card__tag a-stat-card__tag--ok">All read</span>}
          </div>
        </div>
        <div className="a-stat-card">
          <div className="a-stat-card__icon a-stat-card__icon--gold">🏡</div>
          <div>
            <div className="a-stat-card__num">{stats?.totalReservations ?? reservations.length}</div>
            <div className="a-stat-card__label">Reservations</div>
            {pendingRes > 0 && <span className="a-stat-card__tag a-stat-card__tag--warn">{pendingRes} pending</span>}
            {pendingRes === 0 && <span className="a-stat-card__tag a-stat-card__tag--ok">All handled</span>}
          </div>
        </div>
        <div className="a-stat-card">
          <div className="a-stat-card__icon a-stat-card__icon--gold">⭐</div>
          <div>
            <div className="a-stat-card__num">{avgRating}</div>
            <div className="a-stat-card__label">Avg. Rating</div>
            <span className="a-stat-card__tag a-stat-card__tag--ok">{reviews.length} reviews total</span>
          </div>
        </div>
        <div className="a-stat-card">
          <div className="a-stat-card__icon a-stat-card__icon--blue">🌐</div>
          <div>
            <div className="a-stat-card__num">{reviews.filter(r => r.source === 'google').length}</div>
            <div className="a-stat-card__label">Google Reviews</div>
            <span className="a-stat-card__tag a-stat-card__tag--ok">{reviews.filter(r => r.isVisible).length} visible</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="a-panel">
          <div className="a-panel__header">
            <span className="a-panel__title">Recent Enquiries</span>
          </div>
          <table className="a-table">
            <tbody>
              {enquiries.slice(0, 5).map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="a-avatar" style={{ background: avatarColor(e.name) }}>{initials(e.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: '#8a9485' }}>{e.subject}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`a-badge a-badge--${e.status || 'new'}`}>{e.status || 'new'}</span>
                  </td>
                </tr>
              ))}
              {enquiries.length === 0 && <tr><td colSpan={2} className="a-empty">No enquiries yet</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="a-panel">
          <div className="a-panel__header">
            <span className="a-panel__title">Recent Reservations</span>
          </div>
          <table className="a-table">
            <tbody>
              {reservations.slice(0, 5).map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.guestName || r.name}</div>
                    <div style={{ fontSize: 11, color: '#8a9485' }}>{fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`a-badge a-badge--${r.status || 'pending'}`}>{r.status || 'pending'}</span>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && <tr><td colSpan={2} className="a-empty">No reservations yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Enquiries Tab ────────────────────────────────────────────────────────────

function EnquiriesTab({ enquiries, onStatusChange }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="a-panel">
      <div className="a-panel__header">
        <span className="a-panel__title">All Enquiries</span>
        <span style={{ fontSize: 12, color: '#8a9485' }}>{enquiries.length} total</span>
      </div>
      {enquiries.length === 0 ? (
        <div className="a-empty"><div className="a-empty-icon">📭</div>No enquiries yet</div>
      ) : (
        <table className="a-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map(e => (
              <Fragment key={e.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="a-avatar" style={{ background: avatarColor(e.name) }}>{initials(e.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: '#8a9485' }}>{e.email}</div>
                        {e.phone && <div style={{ fontSize: 11, color: '#8a9485' }}>{e.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 240 }}>
                    <div style={{ fontWeight: 500 }}>{e.subject}</div>
                    <div style={{ fontSize: 12, color: '#8a9485', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{e.message}</div>
                  </td>
                  <td style={{ fontSize: 12, color: '#8a9485', whiteSpace: 'nowrap' }}>{fmtDate(e.createdAt)}</td>
                  <td><span className={`a-badge a-badge--${e.status || 'new'}`}>{e.status || 'new'}</span></td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <select
                      className="a-select"
                      value={e.status || 'new'}
                      onChange={ev => onStatusChange(e.id, ev.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </td>
                </tr>
                {expanded === e.id && (
                  <tr>
                    <td colSpan={5} style={{ background: '#f8faf6', padding: '16px 24px' }}>
                      <div style={{ fontSize: 13, color: '#2c3e2e', lineHeight: 1.7, maxWidth: 600 }}>{e.message}</div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <a href={`mailto:${e.email}?subject=Re: ${e.subject}`} className="a-btn a-btn--primary a-btn--sm">Reply via Email</a>
                        {e.phone && <a href={`tel:${e.phone}`} className="a-btn a-btn--outline a-btn--sm">Call</a>}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Reservations Tab ─────────────────────────────────────────────────────────

function ReservationsTab({ reservations, onStatusChange }) {
  return (
    <div className="a-panel">
      <div className="a-panel__header">
        <span className="a-panel__title">All Reservations</span>
        <span style={{ fontSize: 12, color: '#8a9485' }}>{reservations.length} total</span>
      </div>
      {reservations.length === 0 ? (
        <div className="a-empty"><div className="a-empty-icon">🏡</div>No reservations yet</div>
      ) : (
        <table className="a-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.guestName || r.name}</div>
                  <div style={{ fontSize: 11, color: '#8a9485' }}>{r.email}</div>
                  {r.phone && <div style={{ fontSize: 11, color: '#8a9485' }}>{r.phone}</div>}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 500 }}>{fmtDate(r.checkIn)}</div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 500 }}>{fmtDate(r.checkOut)}</div>
                </td>
                <td>{r.guests ?? r.numberOfGuests ?? '—'}</td>
                <td style={{ fontSize: 12, color: '#4a5c4e' }}>{r.roomType || r.accommodation || '—'}</td>
                <td><span className={`a-badge a-badge--${r.status || 'pending'}`}>{r.status || 'pending'}</span></td>
                <td>
                  <select
                    className="a-select"
                    value={r.status || 'pending'}
                    onChange={ev => onStatusChange(r.id, ev.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab({ reviews, onToggle, onDelete }) {
  return (
    <div className="a-panel">
      <div className="a-panel__header">
        <span className="a-panel__title">All Reviews</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#8a9485' }}>{reviews.filter(r => r.isVisible).length} visible / {reviews.length} total</span>
        </div>
      </div>
      {reviews.length === 0 ? (
        <div className="a-empty"><div className="a-empty-icon">⭐</div>No reviews yet. Import some from Google!</div>
      ) : (
        <table className="a-table">
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Source</th>
              <th>Visible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="a-avatar" style={{ background: r.authorPhoto ? 'transparent' : avatarColor(r.name) }}>
                      {r.authorPhoto ? <img src={r.authorPhoto} alt={r.name} /> : initials(r.name)}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name || r.reviewerName}</span>
                  </div>
                </td>
                <td><Stars n={r.rating} /></td>
                <td style={{ maxWidth: 280, fontSize: 12.5, color: '#4a5c4e', lineHeight: 1.5 }}>
                  <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.comment}
                  </div>
                </td>
                <td style={{ fontSize: 12, color: '#8a9485', whiteSpace: 'nowrap' }}>{fmtDate(r.createdAt)}</td>
                <td>
                  {r.source === 'google'
                    ? <span className="a-badge a-badge--google">Google</span>
                    : <span className="a-badge a-badge--read">Website</span>}
                </td>
                <td>
                  <button
                    className={`a-badge ${r.isVisible ? 'a-badge--visible' : 'a-badge--hidden'}`}
                    onClick={() => onToggle(r.id, !r.isVisible)}
                    style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {r.isVisible ? '👁 Visible' : '🚫 Hidden'}
                  </button>
                </td>
                <td>
                  <button className="a-btn a-btn--danger" onClick={() => { if (confirm(`Delete review by ${r.name}?`)) onDelete(r.id); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Import Google Reviews Tab ─────────────────────────────────────────────────

const BLANK_REVIEW = { name: '', rating: 5, comment: '', date: '', photoUrl: '' };

function ImportTab({ onImported }) {
  const [form, setForm] = useState({ ...BLANK_REVIEW });
  const [queue, setQueue] = useState([]);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text: string }
  const [photoPreviewOk, setPhotoPreviewOk] = useState(false);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addToQueue = () => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Reviewer name is required.' }); return; }
    if (!form.comment.trim()) { setMsg({ type: 'error', text: 'Review text is required.' }); return; }
    setQueue(q => [...q, { ...form, id: Date.now() }]);
    setForm({ ...BLANK_REVIEW });
    setPhotoPreviewOk(false);
    setMsg(null);
  };

  const removeFromQueue = (id) => setQueue(q => q.filter(r => r.id !== id));

  const importAll = async () => {
    if (queue.length === 0) { setMsg({ type: 'error', text: 'Add at least one review to the queue first.' }); return; }
    setImporting(true);
    setMsg(null);
    try {
      const payload = queue.map(r => ({
        googleReviewId: `manual_${r.name.toLowerCase().replace(/\s+/g,'_')}_${Date.now()}`,
        name: r.name.trim(),
        rating: r.rating,
        comment: r.comment.trim(),
        createdAt: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
        authorPhoto: r.photoUrl.trim() || undefined,
      }));
      const res = await importGoogleReviews(payload);
      setMsg({ type: 'success', text: `✅ Imported ${res.imported ?? queue.length} review(s) successfully!` });
      setQueue([]);
      onImported?.();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Import failed. Please try again.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* How-to Steps */}
      <div className="a-panel" style={{ marginBottom: 24 }}>
        <div className="a-panel__header">
          <span className="a-panel__title">How to import Google Reviews</span>
        </div>
        <div className="a-panel__body">
          <div className="a-steps">
            {[
              { n: '1', title: 'Find your reviews', desc: 'Open Google Maps, search your farm, click Reviews tab' },
              { n: '2', title: 'Copy the details', desc: 'Note the reviewer name, star rating, and review text' },
              { n: '3', title: 'Fill the form below', desc: 'Enter each review using the form, add to queue' },
              { n: '4', title: 'Import all at once', desc: 'Click "Import All" to publish reviews on your website' },
            ].map(s => (
              <div key={s.n} className="a-step">
                <div className="a-step__num">{s.n}</div>
                <div className="a-step__text"><strong>{s.title}</strong>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <div className="a-panel">
          <div className="a-panel__header">
            <span className="a-panel__title">Add a Review</span>
          </div>
          <div className="a-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {msg && (
              <div className={`a-alert a-alert--${msg.type}`}>
                {msg.text}
              </div>
            )}

            <div className="a-form-group">
              <label className="a-form-label">Reviewer Name *</label>
              <input
                className="a-form-input"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
              />
            </div>

            <div className="a-form-group">
              <label className="a-form-label">Star Rating *</label>
              <div className="a-star-picker">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setField('rating', n)}
                    style={{ color: n <= form.rating ? '#d4a843' : '#d1d5db' }}
                    aria-label={`${n} star`}
                  >
                    ★
                  </button>
                ))}
                <span style={{ fontSize: 13, color: '#8a9485', marginLeft: 4, alignSelf: 'center' }}>
                  {form.rating} star{form.rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="a-form-group">
              <label className="a-form-label">Review Date</label>
              <input
                type="date"
                className="a-form-input"
                value={form.date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setField('date', e.target.value)}
              />
              <span style={{ fontSize: 11, color: '#8a9485' }}>Leave blank to use today's date</span>
            </div>

            <div className="a-form-group">
              <label className="a-form-label">Review Text *</label>
              <textarea
                className="a-form-textarea"
                placeholder="Paste the review text here…"
                value={form.comment}
                onChange={e => setField('comment', e.target.value)}
                rows={4}
              />
            </div>

            <div className="a-form-group">
              <label className="a-form-label">Google Profile Photo URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#8a9485' }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  className="a-form-input"
                  placeholder="https://lh3.googleusercontent.com/…"
                  value={form.photoUrl}
                  onChange={e => { setField('photoUrl', e.target.value); setPhotoPreviewOk(false); }}
                  style={{ flex: 1 }}
                />
                {form.photoUrl && (
                  <img
                    src={form.photoUrl}
                    alt="preview"
                    className="a-photo-preview"
                    onLoad={() => setPhotoPreviewOk(true)}
                    onError={() => setPhotoPreviewOk(false)}
                    style={{ display: photoPreviewOk ? 'block' : 'none' }}
                  />
                )}
                {form.photoUrl && !photoPreviewOk && (
                  <div className="a-photo-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef0ea', fontSize: 10, color: '#8a9485', textAlign: 'center', lineHeight: 1.2 }}>
                    No<br/>preview
                  </div>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#8a9485' }}>Right-click the reviewer's photo on Google → "Copy image address"</span>
            </div>

            <button className="a-btn a-btn--gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={addToQueue}>
              + Add to Import Queue
            </button>
          </div>
        </div>

        {/* Queue */}
        <div>
          <div className="a-panel">
            <div className="a-panel__header">
              <span className="a-panel__title">Import Queue</span>
              <span style={{ fontSize: 12, color: '#8a9485' }}>{queue.length} review{queue.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="a-panel__body">
              {queue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#8a9485' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                  <div style={{ fontSize: 13 }}>Fill the form and click<br/>"Add to Import Queue"</div>
                </div>
              ) : (
                <div className="a-review-queue">
                  {queue.map(r => (
                    <div key={r.id} className="a-queue-card">
                      <div className="a-queue-card__avatar" style={{ background: r.photoUrl ? 'transparent' : avatarColor(r.name) }}>
                        {r.photoUrl
                          ? <img src={r.photoUrl} alt={r.name} onError={ev => { ev.target.style.display='none'; ev.target.parentElement.textContent = initials(r.name); }} />
                          : initials(r.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="a-queue-card__name">{r.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <span className="a-stars-sm">{'★'.repeat(r.rating)}</span>
                          {r.date && <span style={{ fontSize: 11, color: '#8a9485' }}>{fmtDate(r.date)}</span>}
                        </div>
                        <div className="a-queue-card__comment">{r.comment}</div>
                      </div>
                      <button className="a-queue-card__remove" onClick={() => removeFromQueue(r.id)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {queue.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button
                    className="a-btn a-btn--primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={importAll}
                    disabled={importing}
                  >
                    {importing ? 'Importing…' : `⬆ Import ${queue.length} Review${queue.length !== 1 ? 's' : ''}`}
                  </button>
                  <button className="a-btn a-btn--outline" onClick={() => setQueue([])}>Clear</button>
                </div>
              )}

              {msg && queue.length === 0 && (
                <div className={`a-alert a-alert--${msg.type}`} style={{ marginTop: 12 }}>
                  {msg.text}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="a-panel" style={{ marginTop: 16 }}>
            <div className="a-panel__body" style={{ paddingTop: 16, paddingBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#4a5c4e', fontWeight: 600, marginBottom: 8 }}>💡 Tips</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#8a9485', lineHeight: 1.8 }}>
                <li>You can queue multiple reviews before importing</li>
                <li>Duplicate reviews (same text) are automatically skipped</li>
                <li>New imports are hidden by default — go to Reviews tab to make them visible</li>
                <li>The photo URL must be a direct image link (ending in .jpg, or from lh3.googleusercontent.com)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',     label: 'Overview',             icon: '▦' },
  { id: 'enquiries',   label: 'Enquiries',             icon: '✉' },
  { id: 'reservations', label: 'Reservations',         icon: '📅' },
  { id: 'reviews',     label: 'Reviews',               icon: '⭐' },
  { id: 'gallery',     label: 'Gallery',               icon: '🖼️' },
  { id: 'import',      label: 'Import Google Reviews', icon: '🔄' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchAll = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [s, eRes, rRes, fbRes] = await Promise.all([
        getAdminStats().catch(() => null),
        getEnquiries(),
        getReservations(),
        getFeedback(1, 200),
      ]);
      setStats(s);
      setEnquiries(eRes?.enquiries ?? eRes ?? []);
      setReservations(rRes?.reservations ?? rRes ?? []);
      setReviews(fbRes?.feedback ?? fbRes ?? []);
    } catch (err) {
      if (err.message === 'Not authenticated' || err.message === 'Session expired. Please login again.') {
        localStorage.removeItem('poudhyal_admin_token');
        router.push('/admin');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleEnquiryStatus = async (id, status) => {
    await updateEnquiryStatus(id, status);
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };
  const handleReservationStatus = async (id, status) => {
    await updateReservationStatus(id, status);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  const handleToggleReview = async (id, isVisible) => {
    await toggleFeedback(id, isVisible);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isVisible } : r));
  };
  const handleDeleteReview = async (id) => {
    await deleteFeedback(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };
  const handleLogout = () => {
    localStorage.removeItem('poudhyal_admin_token');
    router.push('/admin');
  };

  const newEnquiries = enquiries.filter(e => e.status === 'new').length;
  const pendingRes = reservations.filter(r => r.status === 'pending').length;

  const TOPBAR_TITLES = {
    overview:     { title: 'Dashboard Overview',       sub: 'Welcome back! Here\'s your farm\'s activity at a glance.' },
    enquiries:    { title: 'Enquiries',                sub: 'Manage guest enquiries and respond to questions.' },
    reservations: { title: 'Reservations',             sub: 'Track and manage all farmstay bookings.' },
    reviews:      { title: 'Reviews',                  sub: 'Manage visibility of guest reviews shown on your website.' },
    gallery:      { title: 'Gallery',                  sub: 'Upload and manage photos shown on the public gallery.' },
    import:       { title: 'Import Google Reviews',    sub: 'Add reviews from Google Maps directly to your website.' },
  };

  if (loading) {
    return (
      <div className="a-loading">
        <LogoIcon size={40} style={{ color: '#d4a843' }} />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="a-shell">
      {/* Sidebar */}
      <aside className="a-sidebar">
        <div className="a-sidebar__logo">
          <LogoIcon size={32} style={{ color: '#d4a843' }} />
          <div className="a-sidebar__logo-text">
            <strong>Poudhyal Farms</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="a-sidebar__nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`a-nav-item${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="a-nav-icon" style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
              {t.id === 'enquiries' && newEnquiries > 0 && <span className="a-nav-badge">{newEnquiries}</span>}
              {t.id === 'reservations' && pendingRes > 0 && <span className="a-nav-badge a-nav-badge--warning">{pendingRes}</span>}
            </button>
          ))}
        </nav>

        <div className="a-sidebar__footer">
          <a href="/" target="_blank" className="a-sidebar-link">
            🌐 View Live Site
          </a>
          <button className="a-logout-btn" onClick={handleLogout}>
            <span>⎋</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="a-main">
        <div className="a-topbar">
          <div>
            <div className="a-topbar__title">{TOPBAR_TITLES[tab].title}</div>
            <div className="a-topbar__subtitle">{TOPBAR_TITLES[tab].sub}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AdminNotifications onNavigate={(t) => t && setTab(t)} />
            <RefreshBtn onClick={() => fetchAll(true)} loading={refreshing} />
          </div>
        </div>

        <div className="a-content">
          {tab === 'overview' && (
            <OverviewTab stats={stats} enquiries={enquiries} reservations={reservations} reviews={reviews} />
          )}
          {tab === 'enquiries' && (
            <EnquiriesTab enquiries={enquiries} onStatusChange={handleEnquiryStatus} />
          )}
          {tab === 'reservations' && (
            <ReservationsTab reservations={reservations} onStatusChange={handleReservationStatus} />
          )}
          {tab === 'reviews' && (
            <ReviewsTab reviews={reviews} onToggle={handleToggleReview} onDelete={handleDeleteReview} />
          )}
          {tab === 'gallery' && <GalleryTab />}
          {tab === 'import' && (
            <ImportTab onImported={() => { fetchAll(true); setTab('reviews'); }} />
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
