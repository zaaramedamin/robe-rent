import { create } from 'zustand';
import { adminLogin } from '../api/services';
import { isTokenExpired } from '../utils/auth';

const TOKEN_KEY = 'robe_admin_token';

// Read the stored token, discarding it if it has already expired.
function readToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token || null;
}

/**
 * Zustand store for admin authentication.
 * The JWT is persisted in localStorage so a refresh keeps the admin
 * logged in. Expired tokens are treated as logged-out. `client.js` reads
 * the same key to authorise requests and clears it on a 401.
 */
export const useAuthStore = create((set, get) => ({
  token: readToken(),

  isAuthenticated: () => {
    const { token } = get();
    return Boolean(token) && !isTokenExpired(token);
  },

  async login(username, password) {
    const { token } = await adminLogin(username, password);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token });
    return token;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },
}));
