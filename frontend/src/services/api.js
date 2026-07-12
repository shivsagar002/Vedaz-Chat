import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  login: (username) => api.post('/auth/login', { username }),
  getUsers: () => api.get('/auth/users'),
};

// ─── Messages API ────────────────────────────────────────────────────────────
export const messagesApi = {
  getHistory: (room = 'general', page = 1, limit = 50) =>
    api.get('/messages', { params: { room, page, limit } }),
  sendMessage: (payload) => api.post('/messages', payload),
  markRead: (room, username) => api.patch('/messages/read', { room, username }),
};

export default api;
