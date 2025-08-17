import create from 'zustand';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

// Initialize state from cookies if present
const tokenFromCookie = cookies.get('token') || null;
const roleFromCookie = cookies.get('role') || null;
let userFromCookie = null;
try {
  const raw = cookies.get('user');
  if (raw) userFromCookie = JSON.parse(raw);
} catch {
  userFromCookie = null;
}

const useAuthStore = create((set) => ({
  token: tokenFromCookie,
  role: roleFromCookie,
  user: userFromCookie,
  isLoggedIn: !!tokenFromCookie,

  setAuth: ({ token, role, user }) => {
    if (token) cookies.set('token', token, { path: '/', sameSite: 'lax' });
    if (role) cookies.set('role', role, { path: '/', sameSite: 'lax' });
    if (user) cookies.set('user', JSON.stringify(user), { path: '/', sameSite: 'lax' });

    set({ token: token || null, role: role || null, user: user || null, isLoggedIn: !!token });
  },

  clearAuth: () => {
    cookies.remove('token', { path: '/' });
    cookies.remove('role', { path: '/' });
    cookies.remove('user', { path: '/' });
    set({ token: null, role: null, user: null, isLoggedIn: false });
  },
}));

export default useAuthStore;
