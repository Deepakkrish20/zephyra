import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Compass, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toggleDarkMode, initTheme } from '@/utils/theme';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotificationStore } from '@/store/notificationStore';

export const DeliveryLayout = () => {
  const { user, logout } = useAuthStore();
  const { connectSocket, disconnectSocket } = useNotificationStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    { name: 'Agent Dashboard', path: '/delivery', icon: LayoutDashboard },
    { name: 'Available Job Offers', path: '/delivery/available-orders', icon: Layers },
    { name: 'My Active Orders', path: '/delivery/accepted-orders', icon: ShieldCheck },
    { name: 'Active GPS Tracking', path: '/delivery/tracking', icon: Compass },
  ];

  return (
    <div className="min-h-screen flex bg-app-bg-secondary text-app-text-primary">
      {/* Sidebar for Delivery Agent */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-app-bg-primary border-r border-app-border transition-transform duration-300 ease-in-out md:static md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-app-border">
          <Link to="/" className="flex items-center gap-2 font-black text-base tracking-tight text-primary-600 dark:text-primary-400">
            <Compass className="w-5 h-5 text-primary-600" />
            ZEPHYRA DRIVER
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1.5 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/delivery'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' 
                    : 'text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-app-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Off Duty
          </button>
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-app-bg-primary border-b border-app-border flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary md:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-500/10 px-3 py-1 rounded-full text-primary-600 dark:text-primary-400">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-bold">On Duty</span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <button 
              onClick={handleThemeToggle} 
              className="p-2 rounded-lg text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-app-border">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-app-text-primary">{user?.name || 'Agent'}</p>
                <p className="text-[10px] text-app-text-secondary font-semibold">
                  ID: #ZEP-DRV-09
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 font-bold text-xs">
                DR
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
export default DeliveryLayout;
