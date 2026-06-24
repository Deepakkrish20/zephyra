import { create } from 'zustand';
import { ROLES } from '../constants/roles';

export const useAuthStore = create((set) => ({
  user: {
    id: 'mock-user-123',
    name: 'Alex Mercer',
    email: 'alex.mercer@zephyra.io',
    role: ROLES.ADMIN, // Defaulting to Admin to easily view dashboard initially
  },
  isAuthenticated: true,
  token: 'mock-jwt-token',
  isLoading: false,
  error: null,

  // Actions placeholders
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // API call placeholder
      set({ 
        isAuthenticated: true, 
        user: { id: 'mock-user-123', name: 'Alex Mercer', email, role: ROLES.ADMIN },
        isLoading: false 
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, token: null });
  },

  // Helper action for testing different roles in UI
  setMockRole: (role) => {
    set((state) => ({
      user: state.user ? { ...state.user, role } : { id: 'mock-user-123', name: 'Alex Mercer', email: 'alex@zephyra.io', role }
    }));
  }
}));
export default useAuthStore;
