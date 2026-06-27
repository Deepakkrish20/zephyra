import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  Truck, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toggleDarkMode, initTheme } from '@/utils/theme';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotificationStore } from '@/store/notificationStore';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { connectSocket, disconnectSocket } = useNotificationStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Delivery Agents', path: '/admin/delivery-agents', icon: Truck },
  ];

  return (
    <div className="min-h-screen flex bg-app-bg-secondary text-app-text-primary">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-app-bg-primary border-r border-app-border transition-transform duration-300 ease-in-out md:static md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-app-border">
          <Link to="/" className="flex items-center gap-2 font-mono font-bold text-base tracking-widest text-app-text-primary hover:opacity-90 transition-opacity">
            ZEPHYRA <span className="text-[10px] bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-sans tracking-normal font-bold">ADMIN</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1.5 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-grow p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-all group
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' 
                    : 'text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {item.name}
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-app-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout System
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-app-bg-primary border-b border-app-border flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Control Panel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            {/* Dark Mode */}
            <button 
              onClick={handleThemeToggle} 
              className="p-2 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-app-border">
              <div className="text-right">
                <p className="text-xs font-bold text-app-text-primary">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-app-text-secondary font-semibold uppercase tracking-wider">
                  Root Admin
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 font-bold text-xs">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
