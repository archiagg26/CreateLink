import type { Notification } from '../../types/index';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationsPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 relative overflow-hidden">

      <div className="flex items-center justify-between border-b border-[#E7E1D8] pb-4 mb-4 relative z-10">
        <h3 className="text-lg font-bold text-[#1F1F1F]">System Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-bold text-[#A8678A] hover:text-[#BF90A9] transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3 relative z-10 max-h-[450px] overflow-y-auto pr-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-[#6E6A65] text-sm">
            You are all caught up! No notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && onMarkRead(notif.id)}
              className={`p-4 rounded-[20px] border transition-all duration-200 cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
                notif.read
                  ? 'bg-[#F6F2E8] border-[#E7E1D8] text-[#6E6A65]'
                  : 'bg-[#F8EFF3] border-[#E7E1D8] text-[#1F1F1F] hover:bg-[#F8EFF3]/80'
              }`}
            >
              {/* Unread circle */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#A8678A] shrink-0 mt-1.5"></span>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold truncate">{notif.title}</span>
                  <span className="text-[10px] text-[#6E6A65] font-semibold shrink-0">
                    {getRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#6E6A65] leading-relaxed">{notif.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;
