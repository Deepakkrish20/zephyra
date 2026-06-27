import { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, Package, MapPin, Moon, Sun, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toggleDarkMode, initTheme } from '@/utils/theme';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotificationStore } from '@/store/notificationStore';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

export const CustomerLayout = () => {
  const { user, logout } = useAuthStore();
  const { connectSocket, disconnectSocket } = useNotificationStore();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    initTheme();
    setIsDark(document.documentElement.classList.contains('dark'));

    if (user) {
      connectSocket(user);
    }

    return () => {
      disconnectSocket();
    };
  }, [user, connectSocket, disconnectSocket]);

  const handleThemeToggle = () => {
    const darkState = toggleDarkMode();
    setIsDark(darkState);
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-bg-primary text-app-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-app-bg-primary border-b border-app-border backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-mono font-bold text-lg tracking-widest text-app-text-primary hover:opacity-90 transition-opacity">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              ZEPHYRA
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/products" className="text-sm font-semibold text-app-text-secondary hover:text-primary-600 transition-colors">
                Products Catalogue
              </NavLink>
              <NavLink to="/customer/orders" className={({ isActive }) => `text-sm font-semibold hover:text-primary-600 transition-colors flex items-center gap-1.5 ${isActive ? 'text-primary-600' : 'text-app-text-secondary'}`}>
                <Package className="w-4 h-4" />
                My Orders
              </NavLink>
              <NavLink to="/customer/track" className={({ isActive }) => `text-sm font-semibold hover:text-primary-600 transition-colors flex items-center gap-1.5 ${isActive ? 'text-primary-600' : 'text-app-text-secondary'}`}>
                <MapPin className="w-4 h-4" />
                Live Tracking
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <button 
              onClick={handleThemeToggle} 
              className="p-2 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown Simulation */}
            <div className="flex items-center gap-3 pl-3 border-l border-app-border">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-bold text-app-text-primary">{user?.name || 'Customer'}</p>
                <p className="text-xs text-app-text-secondary">{user?.email || 'customer@zephyra.io'}</p>
              </div>
              <NavLink to="/customer/profile" className={({ isActive }) => `p-2 rounded-lg hover:bg-app-bg-secondary transition-colors ${isActive ? 'text-primary-600' : 'text-app-text-secondary'}`}>
                <User className="w-5 h-5" />
              </NavLink>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb / User Dashboard Indicator */}
      <div className="bg-app-bg-secondary border-b border-app-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-app-text-secondary">
            Customer Dashboard
          </h2>
          <span className="text-xs text-secondary-600 dark:text-secondary-400 font-bold bg-secondary-50 dark:bg-secondary-500/10 px-2 py-0.5 rounded-full">
            Authorized Account
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-app-border bg-app-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between text-xs text-app-text-secondary">
          <p>&copy; {new Date().getFullYear()} Zephyra Inc. Customer Console.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:underline">Home</Link>
            <a href="#" className="hover:underline">Help & Support</a>
          </div>
        </div>
      </footer>

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Logout" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-app-text-secondary leading-relaxed">
            Are you sure you want to sign out of your Zephyra account? Any active order tracking session will continue in the background.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-app-border">
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)} className="font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmLogout} className="font-bold cursor-pointer">
              Confirm Logout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default CustomerLayout;
