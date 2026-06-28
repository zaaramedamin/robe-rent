import { create } from 'zustand';
import { adminLogin } from '../api/services';

const TOKEN_KEY = 'robe_admin_token';

/**
 * Zustand store for admin authentication.
 * The JWT is persisted in localStorage so a refresh keeps the admin
 * logged in. `client.js` reads the same key to authorise requests.
 */
export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,

  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),

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
