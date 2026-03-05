import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token muddati tugaganligini tekshirish
function isTokenExpired(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return false;
    return Date.now() > parseInt(expiresAt, 10);
  } catch {
    return false;
  }
}

// Token va bog'liq ma'lumotlarni tozalash
function clearAuth() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expires_at');
    }
  } catch {
    // ignore
  }
}

// Request interceptor — token biriktirish
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      // Token muddati tugagan bo'lsa tozalash
      if (isTokenExpired()) {
        clearAuth();
        // Login sahifasiga yo'naltirish
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(new axios.Cancel('Token muddati tugagan'));
      }

      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Response interceptor — 401 xatolikda auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
