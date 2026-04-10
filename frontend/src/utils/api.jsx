import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const auth = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  validateResetToken: (token) => apiClient.get(`/auth/validate-token/${token}`),
};

// Barbers endpoints
export const barbers = {
  getAll: () => apiClient.get('/barbers'),
  create: (data) => apiClient.post('/barbers', data),
  update: (id, data) => apiClient.put(`/barbers/${id}`, data),
  delete: (id) => apiClient.delete(`/barbers/${id}`),
  getServices: (barber_id) => apiClient.get(`/barbers/${barber_id}/services`),
  assignService: (barber_id, service_id) => apiClient.post('/barbers/services/assign', { barber_id, service_id }),
  removeService: (barber_id, service_id) => apiClient.post('/barbers/services/remove', { barber_id, service_id }),
  getBreaks: (barber_id) => apiClient.get(`/barbers/${barber_id}/breaks`),
  addBreak: (data) => apiClient.post('/barbers/breaks/add', data),
  updateBreak: (break_id, data) => apiClient.put(`/barbers/breaks/${break_id}`, data),
  deleteBreak: (break_id) => apiClient.delete(`/barbers/breaks/${break_id}`),
};

// Services endpoints
export const services = {
  getAll: () => apiClient.get('/services'),
  create: (data) => apiClient.post('/services', data),
  update: (id, data) => apiClient.put(`/services/${id}`, data),
  delete: (id) => apiClient.delete(`/services/${id}`),
};

// Shops endpoints
export const shops = {
  updateShop: (shopId, data) => apiClient.put(`/shops/${shopId}`, data),
  getShopInfo: (shopId) => apiClient.get(`/shops/${shopId}`),
  checkTrialStatus: (shopId) => apiClient.get(`/shops/${shopId}/trial-status`),
  recordPayment: (shopId, paymentData) => apiClient.post(`/shops/${shopId}/payment`, paymentData),
};

// Appointments endpoints
export const appointments = {
  getAll: (date) => apiClient.get('/appointments', { params: { date } }),
  updateStatus: (id, status, reason) => apiClient.put(`/appointments/${id}`, { status, reason }),
  create: (shopSlug, data) => apiClient.post(`/appointments/book/${shopSlug}`, data),
  getAvailableSlots: (shopSlug, params) =>
    apiClient.get(`/appointments/slots/${shopSlug}`, { params }),
  getByShopSlug: (shopSlug, params) =>
    apiClient.get(`/appointments/public/${shopSlug}`, { params }),
  getCustomerHistory: (shopSlug, phone) =>
    apiClient.get(`/appointments/history/${shopSlug}`, { params: { phone } }),
  getShopOverview: (shopSlug) =>
    apiClient.get(`/dashboard/shop-overview/${shopSlug}`),
};

// Dashboard endpoints
export const dashboard = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getAppointmentsByStatus: (status, limit) =>
    apiClient.get('/dashboard/appointments/by-status', { params: { status, limit } }),
};

export default apiClient;
