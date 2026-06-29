import { create } from 'zustand';
import authApi from '../services/authApi';

// Safely parse user from localStorage
const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to parse saved user:', error);
    return null;
  }
};

const savedToken = localStorage.getItem('token');
const savedUser = getSavedUser();
const savedRole = localStorage.getItem('role') || (savedUser ? savedUser.role : null);

export const useAuthStore = create((set) => ({
  user: savedUser,
  role: savedRole,
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,

  // Action: Login user
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });

      // Expected backend response: { success: true, message: '...', data: { user, token } }
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
      localStorage.setItem('lastActivityTime', Date.now().toString());

      set({
        isAuthenticated: true,
        user,
        role: user.role,
        token,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  // Action: Register customer
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({ name, email, password, role: 'customer' });
      set({ isLoading: false });
      return response;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  // Action: Verify customer email
  verifyEmail: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.verifyEmail(email, code);
      set({ isLoading: false });
      return response;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Verification failed';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  // Action: Get current user details from database (anti-spoofing)
  getCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.getCurrentUser();
      const { user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);

      set({
        user,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch current user';
      // If session is unauthorized or expired, clean up local state
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('lastActivityTime');

        set({
          user: null,
          role: null,
          token: null,
          isAuthenticated: false,
        });
      }
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  // Action: Logout user
  logout: async () => {
    set({ isLoading: true });
    try {
      // Best-effort logout call to backend
      await authApi.logout();
    } catch (err) {
      console.warn('Backend logout call failed, cleaning up local session anyway:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('lastActivityTime');

      set({
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // Helper action for testing different roles in UI (Developer Toolbar)
  setMockRole: (role) => {
    set((state) => {
      const updatedUser = state.user
        ? { ...state.user, role }
        : { id: 'mock-user-123', name: 'Alex Mercer', email: 'alex@zephyra.io', role };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('role', role);
      return { user: updatedUser, role };
    });
  },
}));

export default useAuthStore;
