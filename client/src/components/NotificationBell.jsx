import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ShoppingBag, Truck, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import useNotificationStore from '@/store/notificationStore';

const formatRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
};

const getNotificationIcon = (type) => {
  const iconClass = "w-4 h-4";
  if (type.includes('created')) {
    return (
      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
        <ShoppingBag className={iconClass} />
      </div>
    );
  }
  if (type.includes('approved')) {
    return (
      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
        <CheckCircle className={iconClass} />
      </div>
    );
  }
  if (type.includes('rejected')) {
    return (
      <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
        <XCircle className={iconClass} />
      </div>
    );
  }
  if (type.includes('accepted') || type.includes('picked_up') || type.includes('out_for_delivery')) {
    return (
      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
        <Truck className={iconClass} />
      </div>
    );
  }
  if (type.includes('delivered')) {
    return (
      <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
        <Check className={iconClass} />
      </div>
    );
  }
  return (
    <div className="p-2 bg-secondary-500/10 text-secondary-500 rounded-xl">
      <Bell className={iconClass} />
    </div>
  );
};

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    clearNotifications 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchNotifications]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell Button Trigger */}
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-xl text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary transition-all duration-250 cursor-pointer relative focus:outline-none border border-transparent hover:border-app-border"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 text-white text-[9px] font-extrabold flex items-center justify-center rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Glassmorphic Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[480px] overflow-hidden flex flex-col z-50 bg-app-bg-primary/80 backdrop-blur-xl border border-app-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 transform origin-top-right">
          {/* Header */}
          <div className="p-4 border-b border-app-border flex items-center justify-between bg-app-bg-secondary/40">
            <div>
              <h3 className="font-bold text-sm text-app-text-primary">Notifications</h3>
              <p className="text-xs text-app-text-secondary">
                {unreadCount} unread message{unreadCount !== 1 && 's'}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer bg-transparent border-none"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="p-1 rounded text-app-text-secondary hover:bg-app-bg-secondary hover:text-danger-500 transition-colors cursor-pointer"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-app-border/60 max-h-[360px] custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-4 bg-app-bg-secondary rounded-full border border-app-border">
                  <Bell className="w-6 h-6 text-app-text-secondary opacity-60" />
                </div>
                <p className="text-xs text-app-text-secondary font-medium">All caught up! No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 flex gap-3 transition-colors relative group hover:bg-app-bg-secondary/30 ${
                    !notification.isRead ? 'bg-primary-500/5 dark:bg-primary-500/2.5' : ''
                  }`}
                >
                  {/* Icon Wrapper */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-grow space-y-1">
                    <p className={`text-xs leading-relaxed text-app-text-primary ${
                      !notification.isRead ? 'font-semibold' : 'font-medium'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-app-text-secondary font-medium">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions (Mark as Read single) */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-1.5 bg-app-bg-primary border border-app-border text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Unread Status Bullet */}
                  {!notification.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full group-hover:hidden" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
