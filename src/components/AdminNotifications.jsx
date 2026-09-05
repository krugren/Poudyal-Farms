"use client";
import { useState, useEffect, useRef, useCallback } from 'react';

// ── Notification Bell + Toast for Admin Dashboard ────────────────────────────
// Connects to /api/notifications/stream via SSE.
// Shows a bell badge for unread counts and toast pop-ups for live events.

const TYPE_META = {
  reservation: { icon: '🏡', label: 'New Reservation', color: '#d4a843', tab: 'reservations' },
  enquiry:     { icon: '✉️',  label: 'New Enquiry',     color: '#4285F4', tab: 'enquiries'    },
  review:      { icon: '⭐',  label: 'New Review',      color: '#2d5a3f', tab: 'reviews'      },
};

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ toast, onDismiss }) {
  const meta = TYPE_META[toast.type] || {};
  const item = toast.items?.[0];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="notif-toast"
      style={{ borderLeftColor: meta.color }}
      onClick={() => onDismiss(toast.id)}
      role="alert"
      aria-live="polite"
    >
      <span className="notif-toast__icon">{meta.icon}</span>
      <div className="notif-toast__body">
        <div className="notif-toast__label">{meta.label}</div>
        <div className="notif-toast__name">
          {item?.guestName || item?.name || 'Someone'}
          {toast.count > 1 && ` +${toast.count - 1} more`}
        </div>
      </div>
      <button className="notif-toast__close" aria-label="Dismiss">×</button>
    </div>
  );
}

// ── Bell ──────────────────────────────────────────────────────────────────────

function Bell({ count }) {
  return (
    <div className="notif-bell" aria-label={`${count} new notifications`}>
      🔔
      {count > 0 && (
        <span className="notif-bell__badge">{count > 9 ? '9+' : count}</span>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminNotifications({ onNavigate }) {
  const [notifications, setNotifications] = useState([]); // history list
  const [toasts, setToasts]               = useState([]);  // active pop-ups
  const [open, setOpen]                   = useState(false);
  const [connected, setConnected]         = useState(false);
  const dropRef = useRef(null);
  const esRef   = useRef(null);

  const unread = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((type, data) => {
    const id = `${type}_${Date.now()}`;
    const notif = { id, type, ...data, read: false, receivedAt: new Date() };

    setNotifications(prev => [notif, ...prev].slice(0, 50)); // keep last 50
    setToasts(prev => [...prev, { ...notif }]);
  }, []);

  // Connect SSE
  useEffect(() => {
    const token = localStorage.getItem('poudhyal_admin_token');
    if (!token) return;

    const url = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('connected', () => setConnected(true));

    ['reservation', 'enquiry', 'review'].forEach(type => {
      es.addEventListener(type, (e) => {
        try {
          const data = JSON.parse(e.data);
          addNotification(type, data);
        } catch { /* ignore malformed */ }
      });
    });

    es.onerror = () => {
      setConnected(false);
      // EventSource auto-reconnects — no manual retry needed
    };

    return () => { es.close(); setConnected(false); };
  }, [addNotification]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleNotifClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    onNavigate?.(TYPE_META[notif.type]?.tab);
    setOpen(false);
  };

  return (
    <>
      {/* Toast stack — top-right corner */}
      <div className="notif-toast-stack" aria-live="polite">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Bell button + dropdown */}
      <div className="notif-wrap" ref={dropRef}>
        <button
          className="notif-btn"
          onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          title={connected ? 'Live notifications active' : 'Connecting…'}
        >
          <Bell count={unread} />
          {/* Live dot */}
          <span className={`notif-dot ${connected ? 'notif-dot--live' : 'notif-dot--off'}`} />
        </button>

        {open && (
          <div className="notif-dropdown" role="dialog" aria-label="Notifications">
            <div className="notif-dropdown__header">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <button className="notif-dropdown__clear" onClick={() => setNotifications([])}>
                  Clear all
                </button>
              )}
            </div>

            <div className="notif-dropdown__list">
              {notifications.length === 0 ? (
                <div className="notif-dropdown__empty">
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                  No notifications yet.<br />
                  <span style={{ fontSize: 11 }}>New reservations, enquiries, and reviews will appear here.</span>
                </div>
              ) : (
                notifications.map(n => {
                  const meta = TYPE_META[n.type] || {};
                  const item = n.items?.[0];
                  return (
                    <button
                      key={n.id}
                      className={`notif-item ${n.read ? '' : 'notif-item--unread'}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <span className="notif-item__icon">{meta.icon}</span>
                      <div className="notif-item__body">
                        <div className="notif-item__label">{meta.label}</div>
                        <div className="notif-item__name">
                          {item?.guestName || item?.name || 'Someone'}
                          {n.count > 1 && ` +${n.count - 1} more`}
                        </div>
                      </div>
                      <div className="notif-item__time">
                        {new Date(n.receivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
