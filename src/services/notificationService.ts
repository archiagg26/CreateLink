import type { Notification, NotificationType } from '../types/index';
import { getStore } from './store';
import { generateId, nowISO } from './mockUtils';

export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string
): Notification {
  const store = getStore();
  const notification: Notification = {
    id: generateId(),
    userId,
    type,
    title,
    body,
    read: false,
    createdAt: nowISO(),
  };
  store.notifications.set(notification.id, notification);
  return notification;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const store = getStore();
  return Array.from(store.notifications.values())
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markRead(notificationId: string): void {
  const store = getStore();
  const n = store.notifications.get(notificationId);
  if (n) store.notifications.set(notificationId, { ...n, read: true });
}

export function markAllRead(userId: string): void {
  const store = getStore();
  for (const [id, n] of store.notifications.entries()) {
    if (n.userId === userId) store.notifications.set(id, { ...n, read: true });
  }
}
