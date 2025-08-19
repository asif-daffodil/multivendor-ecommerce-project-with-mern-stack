import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

// Create a shared axios instance
const api = axios.create({
  baseURL: 'http://localhost:4000',
});

// Attach token from Zustand on each request
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Capture refreshed token from server response header and update Zustand
api.interceptors.response.use(
  (response) => {
    const authHeader = response.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const newToken = authHeader.split(' ')[1];
      const { setAuth, role, user } = useAuthStore.getState();
      setAuth({ token: newToken, role, user });
    }
    return response;
  },
  (error) => {
    // If unauthorized, optionally clear auth
    if (error?.response?.status === 401) {
      // Do not auto-clear; let the app decide. Could redirect to sign-in.
    }
    return Promise.reject(error);
  }
);

export default api;
