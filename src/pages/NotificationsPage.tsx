import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import NotificationsPanel from '../components/shared/NotificationsPanel';

export default function NotificationsPage() {
  const { currentUser } = useAuthStore();
  const { notifications, loadNotifications, markRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    if (currentUser) {
      loadNotifications(currentUser.id);
    }
  }, [currentUser, loadNotifications]);

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Notifications Feed
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Review updates regarding your applications, trust scores, and campaigns.
        </p>
      </div>

      <NotificationsPanel
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={() => markAllRead(currentUser.id)}
      />
    </div>
  );
}
