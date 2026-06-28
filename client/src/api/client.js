import axios from 'axios';
import { isTokenExpired } from '../utils/auth';

const TOKEN_KEY = 'robe_admin_token';

// Single axios instance for the whole app. The Vite dev server proxies
// "/api" to the Express backend, so we use a relative baseURL.
const api = axios.create({
  baseURL: '/api',
});

// Attach the admin JWT (if present and not expired) to every request so
// protected admin endpoints work transparently.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request fails auth while a session exists (expired/invalid token),
// clear it and bounce to the login page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
