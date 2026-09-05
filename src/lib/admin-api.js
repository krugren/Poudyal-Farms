const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, requireAuth = false } = options;

  const headers = { 'Content-Type': 'application/json' };

  if (requireAuth) {
    const token = localStorage.getItem('poudhyal_admin_token');
    if (!token) throw new Error('Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth
export const login = (username, password) =>
  apiRequest('/auth/login', { method: 'POST', body: { username, password } });

export const verifyToken = () =>
  apiRequest('/auth/verify', { requireAuth: true });

// Enquiries
export const submitEnquiry = (data) =>
  apiRequest('/enquiries', { method: 'POST', body: data });

export const getEnquiries = (params = '') =>
  apiRequest(`/enquiries${params}`, { requireAuth: true });

export const updateEnquiryStatus = (id, status) =>
  apiRequest(`/enquiries/${id}`, { method: 'PATCH', body: { status }, requireAuth: true });

// Reservations
export const submitReservation = (data) =>
  apiRequest('/reservations', { method: 'POST', body: data });

export const getAvailability = (month, year) =>
  apiRequest(`/reservations/available?month=${month}&year=${year}`);

export const getReservations = (params = '') =>
  apiRequest(`/reservations${params}`, { requireAuth: true });

export const updateReservationStatus = (id, status) =>
  apiRequest(`/reservations/${id}`, { method: 'PATCH', body: { status }, requireAuth: true });

// Feedback
export const submitFeedback = (data) =>
  apiRequest('/feedback', { method: 'POST', body: data });

export const getFeedback = (page = 1, limit = 12) =>
  apiRequest(`/feedback?page=${page}&limit=${limit}`);

export const deleteFeedback = (id) =>
  apiRequest(`/feedback/${id}`, { method: 'DELETE', requireAuth: true });

// Admin Stats
export const getAdminStats = () =>
  apiRequest('/admin/stats', { requireAuth: true });

// Google Reviews (manual import — free, no API key needed)
export const importGoogleReviews = (reviews) =>
  apiRequest('/admin/google-reviews/import', { method: 'POST', body: { reviews }, requireAuth: true });

export const getGoogleReviewStats = () =>
  apiRequest('/admin/google-reviews/import', { requireAuth: true });

export const toggleFeedback = (id, isVisible) =>
  apiRequest(`/feedback/${id}`, { method: 'PATCH', body: { isVisible }, requireAuth: true });

// Alias for backwards compat
export const toggleFeedbackVisibility = toggleFeedback;

export default apiRequest;
