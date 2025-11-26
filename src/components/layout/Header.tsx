import { useEffect, useState } from 'react';
import { BellIcon } from 'lucide-react';
import { notificationsApi } from '../../lib/api/client';
import type { Notification } from '../../lib/types';
import { Link } from 'react-router-dom';
export function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadNotifications();
  }, []);
  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? {
        ...n,
        isRead: true
      } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      task: '📋',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type];
  };
  return <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1" />

        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>}
          </button>

          {showDropdown && <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">اعلان‌ها</h3>
                </div>

                {isLoading ? <div className="p-4 text-center text-gray-500">
                    در حال بارگذاری...
                  </div> : notifications.length === 0 ? <div className="p-4 text-center text-gray-500">
                    اعلانی وجود ندارد
                  </div> : <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 5).map(notification => <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(notification.createdAt).toLocaleDateString('fa-IR')}
                              </span>
                              {!notification.isRead && <button onClick={() => handleMarkAsRead(notification.id)} className="text-xs text-primary-600 hover:text-primary-700">
                                  علامت‌گذاری به عنوان خوانده شده
                                </button>}
                            </div>
                          </div>
                        </div>
                      </div>)}
                  </div>}

                <div className="p-3 border-t border-gray-200">
                  <Link to="/notifications" onClick={() => setShowDropdown(false)} className="block text-center text-sm text-primary-600 hover:text-primary-700">
                    مشاهده همه اعلان‌ها
                  </Link>
                </div>
              </div>
            </>}
        </div>
      </div>
    </header>;
}
