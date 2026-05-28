import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('sd_token') || localStorage.getItem('sd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('sd_token');
      localStorage.removeItem('sd_token');
      localStorage.removeItem('sd_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
