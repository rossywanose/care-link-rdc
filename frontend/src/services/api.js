import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// ============================================
// Request interceptor - Add JWT token
// ============================================
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      '/auth/login/',
      '/auth/refresh/',
      '/users/register/',
      '/users/register-authority/',
      '/users/verify-matricule/',
      '/users/password-reset-request/',
      '/users/password-reset-verify/',
      '/users/password-reset-confirm/',
    ];

    const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (!isPublic) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// Response interceptor - Handle token refresh
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Auth services
// ============================================
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (data) => api.post('/users/register/', data),
  logout: () => {
    const refresh = localStorage.getItem('refresh_token');
    return api.post('/users/logout/', { refresh });
  },
  refresh: (refreshToken) => axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken }),
  verify: (token) => api.post('/auth/verify/', { token }),
  verifyMatricule: (matricule) => api.post('/users/verify-matricule/', { matricule }),
  registerAuthority: (data) => api.post('/users/register-authority/', data),
  requestPasswordReset: (email) => api.post('/users/password-reset-request/', { email }),
  verifyResetCode: (email, code) => api.post('/users/password-reset-verify/', { email, code }),
  confirmPasswordReset: (email, code, newPassword) => 
    api.post('/users/password-reset-confirm/', { email, code, new_password: newPassword }),
};

// ============================================
// User services
// ============================================
export const userAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.put('/users/profile/', data),
  changePassword: (data) => api.post('/users/password-change/', data),
  getUsers: (params) => api.get('/users/', { params }),
  getUser: (id) => api.get(`/users/${id}/`),
  getAuditLogs: (params) => api.get('/users/audit-logs/', { params }),
};

// ============================================
// Hospital services
// ============================================
export const hospitalAPI = {
  getHospitals: (params) => api.get('/hospitals/', { params }),
  getHospital: (id) => api.get(`/hospitals/${id}/`),
  createHospital: (data) => api.post('/hospitals/create/', data),
  updateHospital: (id, data) => api.put(`/hospitals/${id}/update/`, data),
  getHospitalStats: (id) => api.get(`/hospitals/${id}/stats/`),
  uploadLogo: (id, formData) => api.post(`/hospitals/${id}/upload-logo/`, formData),
  checkStatus: () => api.get('/hospitals/status/check/'),
  activatePayment: () => api.post('/hospitals/activate-payment/'),
};

// ============================================
// Birth certificate services
// ============================================
export const birthAPI = {
  getBirths: (params) => api.get('/births/', { params }),
  getBirth: (id) => api.get(`/births/${id}/`),
  createBirth: (data) => api.post('/births/create/', data),
  updateBirth: (id, data) => api.put(`/births/${id}/update/`, data),
  deleteBirth: (id) => api.delete(`/births/${id}/`),
  validateBirth: (id, action, reason) => api.post(`/births/${id}/validate/`, { action, reason }),
  getBirthStats: () => api.get('/births/stats/'),
  downloadCertificate: (id) => api.get(`/births/${id}/certificate/`, { responseType: 'blob' }),
  // ← NOUVEAU : QR Code + Preview
  getBirthQRCode: (id) => api.get(`/births/${id}/qr-code/`, { responseType: 'blob' }),
  getBirthPreview: (id) => api.get(`/births/${id}/preview/`, { responseType: 'blob' }),
};

// ============================================
// Death certificate services
// ============================================
export const deathAPI = {
  getDeaths: (params) => api.get('/deaths/', { params }),
  getDeath: (id) => api.get(`/deaths/${id}/`),
  createDeath: (data) => api.post('/deaths/create/', data),
  updateDeath: (id, data) => api.put(`/deaths/${id}/update/`, data),
  deleteDeath: (id) => api.delete(`/deaths/${id}/`),
  validateDeath: (id, action, reason) => api.post(`/deaths/${id}/validate/`, { action, reason }),
  getDeathStats: () => api.get('/deaths/stats/'),
  downloadCertificate: (id) => api.get(`/deaths/${id}/certificate/`, { responseType: 'blob' }),
  // ← NOUVEAU : QR Code + Preview
  getDeathQRCode: (id) => api.get(`/deaths/${id}/qr-code/`, { responseType: 'blob' }),
  getDeathPreview: (id) => api.get(`/deaths/${id}/preview/`, { responseType: 'blob' }),
};

// ============================================
// Payment services
// ============================================
export const paymentAPI = {
  createOpeningFee: (data) => api.post('/payments/opening-fee/', data),
  verifyPayment: (paymentId, data = {}) => api.post(`/payments/${paymentId}/verify/`, data),
  getPaymentHistory: () => api.get('/payments/history/'),
};

// ============================================
// Report services
// ============================================
export const reportAPI = {
  getReports: (params) => api.get('/reports/', { params }),
  getReport: (id) => api.get(`/reports/${id}/`),
  createReport: (data) => api.post('/reports/create/', data),
  updateReport: (id, data) => api.put(`/reports/${id}/update/`, data),
  submitReport: (id) => api.post(`/reports/${id}/submit/`),
  reviewReport: (id, action, notes) => api.post(`/reports/${id}/review/`, { action, notes }),
  getCitizenReports: () => api.get('/reports/citizen/'),
  createCitizenReport: (data) => api.post('/reports/citizen/create/', data),
  reviewCitizenReport: (id, action, notes) => api.post(`/reports/citizen/${id}/review/`, { action, notes }),
};

// ============================================
// Notification services
// ============================================
export const notificationAPI = {
  getNotifications: () => api.get('/notifications/'),
  markRead: (id) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
  deleteNotification: (id) => api.delete(`/notifications/${id}/delete/`),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  getPreferences: () => api.get('/notifications/preferences/'),
  updatePreferences: (data) => api.put('/notifications/preferences/', data),
  createSystemNotification: (data) => api.post('/notifications/system/', data),
};

// ============================================
// Logout helper
// ============================================
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/connexion';
};

export default api;