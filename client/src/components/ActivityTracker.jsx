import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds (satisfies 2 to 4 hours requirement)
const THROTTLE_MS = 30 * 1000; // Throttle writing to localStorage to every 30 seconds

export const ActivityTracker = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check if session is already expired on mount/load
    const checkSession = () => {
      const lastActivityStr = localStorage.getItem('lastActivityTime');
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        const now = Date.now();
        if (now - lastActivity > TIMEOUT_MS) {
          toast.error('Session expired due to inactivity. Please log in again.');
          logout().then(() => {
            navigate('/login', { state: { from: location } });
          });
          return true;
        }
      } else {
        // Initialize if not present
        localStorage.setItem('lastActivityTime', Date.now().toString());
      }
      return false;
    };

    // Run initial check
    const isExpired = checkSession();
    if (isExpired) return;

    // Update last activity timestamp in localStorage (throttled)
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > THROTTLE_MS) {
        localStorage.setItem('lastActivityTime', now.toString());
        lastUpdateRef.current = now;
      }
    };

    // Events to monitor user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      // Check if session has already expired before registering new activity
      // (important if the computer woke up from sleep/suspension)
      const lastActivityStr = localStorage.getItem('lastActivityTime');
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        const now = Date.now();
        if (now - lastActivity > TIMEOUT_MS) {
          toast.error('Session expired due to inactivity. Please log in again.');
          logout().then(() => {
            navigate('/login', { state: { from: location } });
          });
          return;
        }
      }
      updateActivity();
    };

    // Register listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Run interval check every 30 seconds to catch passive inactivity
    const interval = setInterval(() => {
      checkSession();
    }, 30000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated, logout, navigate, location]);

  return null;
};

export default ActivityTracker;
