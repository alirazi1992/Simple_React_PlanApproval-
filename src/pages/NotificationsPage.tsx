import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { notificationsApi } from '../lib/api/client';
import type { Notification } from '../lib/types';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await notificationsApi.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">اعلان‌ها</h1>
            <p className="text-gray-600 mt-1">
              فهرست اعلان‌های مرتبط با حساب کاربری شما.
            </p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <Button size="sm" variant="secondary" onClick={handleMarkAllAsRead}>
              علامت‌زدن همه به عنوان خوانده شده
            </Button>
          )}
        </div>

        <Card>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">
              در حال بارگذاری اعلان‌ها...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              اعلان خوانده‌نشده‌ای وجود ندارد.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-3 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(
                          notification.createdAt,
                        ).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleMarkAsRead(notification.id)}
                        >
                          علامت‌زدن به عنوان خوانده شده
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

