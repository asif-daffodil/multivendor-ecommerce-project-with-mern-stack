import { create } from 'zustand';
import axios from 'axios';

// Initialize state from localStorage (more reliable across reloads)
const tokenFromStorage = (() => {
  try { return localStorage.getItem('token') || null } catch { return null }
})();
const roleFromStorage = (() => {
  try { return localStorage.getItem('role') || null } catch { return null }
})();
const userFromStorage = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

if (tokenFromStorage) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
}

const useAuthStore = create((set) => ({
  token: tokenFromStorage,
  role: roleFromStorage,
  user: userFromStorage,
  isLoggedIn: !!tokenFromStorage,

  setAuth: ({ token, role, user }) => {
    try {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');

      if (role) localStorage.setItem('role', role);
      else localStorage.removeItem('role');

      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    } catch {
      // ignore storage errors
    }

    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];

    set({ token: token || null, role: role || null, user: user || null, isLoggedIn: !!token });
  },

  clearAuth: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
    delete axios.defaults.headers.common['Authorization'];
    set({ token: null, role: null, user: null, isLoggedIn: false });
  },
}));

export default useAuthStore;
