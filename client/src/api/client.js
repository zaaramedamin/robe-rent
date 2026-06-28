import axios from 'axios';

// Single axios instance for the whole app. The Vite dev server proxies
// "/api" to the Express backend, so we use a relative baseURL.
const api = axios.create({
  baseURL: '/api',
});

// Attach the admin JWT (if present) to every request so protected
// admin endpoints work transparently.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('robe_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
