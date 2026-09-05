// ═══════════════════════════════════════════
// API Client — All requests go through here
// ═══════════════════════════════════════════

const BASE = '/api';

async function request(path, options = {}) {
  const { method = 'GET', body, auth = false } = options;

  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pf_token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  // Handle binary responses (Excel export)
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('spreadsheetml')) {
    return res.blob();
  }

  return res.json();
}

// ── Content API ──
export const fetchSettings = () => request('/content/settings');
export const fetchPageContent = (page) => request(`/content/page/${page}`);
export const fetchActivities = () => request('/content/activities');
export const fetchRooms = () => request('/content/rooms');
export const fetchTravelGuide = () => request('/content/travel-guide');
export const fetchGallery = (category) => request(`/content/gallery${category ? `?category=${category}` : ''}`);

// ── Feedback ──
export const fetchFeedback = (page = 1) => request(`/feedback?page=${page}&limit=12`);
export const submitFeedback = (data) => request('/feedback', { method: 'POST', body: data });
export const fetchAllFeedback = (page = 1, limit = 20) => request(`/feedback?page=${page}&limit=${limit}&all=true`, { auth: true });
export const toggleFeedbackVisibility = (id, isVisible) => request(`/feedback/${id}`, { method: 'PATCH', body: { isVisible }, auth: true });
export const deleteFeedback = (id) => request(`/feedback/${id}`, { method: 'DELETE', auth: true });

// ── Enquiries ──
export const submitEnquiry = (data) => request('/enquiries', { method: 'POST', body: data });

// ── Reservations ──
export const submitReservation = (data) => request('/reservations', { method: 'POST', body: data });
export const fetchAvailability = (month, year) => request(`/reservations/available?month=${month}&year=${year}`);

// ── Auth ──
export const login = (username, password) => request('/auth/login', { method: 'POST', body: { username, password } });
export const verifyToken = () => request('/auth/verify', { auth: true });

// ── Admin ──
export const fetchAdminStats = () => request('/admin/stats', { auth: true });
export const fetchEnquiries = (page = 1, status) => request(`/enquiries?page=${page}${status ? `&status=${status}` : ''}`, { auth: true });
export const updateEnquiryStatus = (id, status) => request(`/enquiries/${id}`, { method: 'PATCH', body: { status }, auth: true });
export const fetchReservations = (page = 1, status) => request(`/reservations?page=${page}${status ? `&status=${status}` : ''}`, { auth: true });
export const updateReservationStatus = (id, status) => request(`/reservations/${id}`, { method: 'PATCH', body: { status }, auth: true });
export const exportData = async (type) => {
  const blob = await request(`/admin/export/${type}`, { auth: true });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `poudhyal-${type}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
