import axios from 'axios';
import Cookies from 'js-cookie';

// ✅ FORCE FIXED: Ab yeh environment variable ke jhanjhat par depend nahi karega.
// Yeh directly port 5000 aur /api par hit karega, jisse 404 error aana band ho jayega.
const api = axios.create({
  baseURL: 'https://samarth-dental-backend-ils2.onrender.com/api', 
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('sd_token') || localStorage.getItem('sd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - only redirect if NOT on /auth/me call
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !err.config?.url?.includes('/auth/me') &&
      !window.location.pathname.includes('/login')
    ) {
      Cookies.remove('sd_token');
      localStorage.removeItem('sd_token');
      localStorage.removeItem('sd_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;