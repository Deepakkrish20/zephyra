import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Moon, Sun, ShieldAlert, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toggleDarkMode, initTheme } from '@/utils/theme';

export const PublicLayout = () => {
  const { user, setMockRole } = useAuthStore();
  const { itemCount } = useCartStore();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    initTheme();
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleThemeToggle = () => {
    const darkState = toggleDarkMode();
    setIsDark(darkState);
  };

  const handleRoleChange = (e) => {
    setMockRole(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-bg-primary text-app-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-app-bg-primary border-b border-app-border backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tight bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              <ShoppingBag className="w-6 h-6 text-primary-600" />
              ZEPHYRA
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" className={({ isActive }) => `text-sm font-semibold hover:text-primary-600 transition-colors ${isActive ? 'text-primary-600' : 'text-app-text-secondary'}`}>
                Home
              </NavLink>
              <NavLink to="/products" className={({ isActive }) => `text-sm font-semibold hover:text-primary-600 transition-colors ${isActive ? 'text-primary-600' : 'text-app-text-secondary'}`}>
                Shop Products
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Developer Role Switcher (Mock Auth Help) */}
            <div className="hidden lg:flex items-center gap-2 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 px-3 py-1 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-800 dark:text-yellow-400 font-semibold">Dev Role:</span>
              <select 
                value={user?.role || ''} 
                onChange={handleRoleChange} 
                className="bg-transparent text-xs text-yellow-900 dark:text-yellow-300 font-bold border-none focus:outline-none cursor-pointer"
              >
                <option value="customer" className="bg-app-bg-primary text-app-text-primary">Customer</option>
                <option value="admin" className="bg-app-bg-primary text-app-text-primary">Admin</option>
                <option value="delivery_agent" className="bg-app-bg-primary text-app-text-primary">Delivery Agent</option>
              </select>
            </div>

            {/* Dark Mode */}
            <button 
              onClick={handleThemeToggle} 
              className="p-2 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-app-bg-primary animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Dashboard Link */}
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'delivery_agent' ? '/delivery' : '/customer/profile'} className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                Dashboard ({user.role})
              </Link>
            ) : (
              <span className="text-sm text-app-text-secondary">Not Authenticated</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-app-border bg-app-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-app-text-secondary">
            &copy; {new Date().getFullYear()} Zephyra Inc. Smart Commerce. Real-Time Delivery.
          </p>
          <div className="flex items-center gap-6 text-xs text-app-text-secondary">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default PublicLayout;
