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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4 relative z-10">
        <h3 className="text-lg font-bold text-slate-200">System Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3 relative z-10 max-h-[450px] overflow-y-auto pr-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            You are all caught up! No notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && onMarkRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
                notif.read
                  ? 'bg-slate-950/40 border-slate-850 text-slate-400'
                  : 'bg-indigo-500/5 border-indigo-500/20 text-slate-200 hover:bg-indigo-500/10'
              }`}
            >
              {/* Unread circle */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5 animate-pulse"></span>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold truncate">{notif.title}</span>
                  <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                    {getRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{notif.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;
