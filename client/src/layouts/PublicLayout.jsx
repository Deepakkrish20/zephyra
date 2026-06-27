import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Moon, Sun, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toggleDarkMode, initTheme } from '@/utils/theme';

export const PublicLayout = () => {
  const { user, logout } = useAuthStore();
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
              <NavLink to="/" className={({ isActive }) => `text-sm font-semibold hover:text-primary-500 transition-colors ${isActive ? 'text-primary-500' : 'text-app-text-secondary'}`}>
                Home
              </NavLink>
              <NavLink to="/products" className={({ isActive }) => `text-sm font-semibold hover:text-primary-500 transition-colors ${isActive ? 'text-primary-500' : 'text-app-text-secondary'}`}>
                Catalog
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
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
                <span className="absolute -top-1 -right-1 bg-primary-500 text-zinc-950 font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-app-bg-primary animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Dashboard Link */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'delivery_agent' ? '/delivery' : '/customer/profile'} className="text-sm font-bold bg-primary-500 hover:bg-primary-600 text-zinc-950 px-4 py-2 rounded-lg transition-colors">
                  Dashboard ({user.role})
                </Link>
                <button 
                  onClick={logout} 
                  className="text-sm font-bold bg-[#71eb44] hover:bg-[#71eb44]/90 text-zinc-950 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-bold bg-[#71eb44] hover:bg-[#71eb44]/90 text-zinc-950 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                  Login
                </Link>
              </div>
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
