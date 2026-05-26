import { apiFetch } from './client';

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  bookingId?: number | null;
  linkRoute?: string | null;
  linkParams?: Record<string, string | number>;
};

export type NotificationsPayload = {
  notifications: AppNotification[];
  unreadCount: number;
};

function isNotFound(message: string): boolean {
  return message.includes('404');
}

export async function fetchNotifications(
  token: string,
): Promise<NotificationsPayload | null> {
  try {
    return await apiFetch<NotificationsPayload>('/notifications', {
      auth: true,
      token,
    });
  } catch (error: any) {
    if (isNotFound(error?.message || '')) {
      return null;
    }
    throw error;
  }
}

export async function markNotificationRead(
  token: string,
  id: number,
): Promise<{ unreadCount: number } | null> {
  try {
    const data = await apiFetch<{ unreadCount: number }>(`/notifications/${id}/read`, {
      method: 'POST',
      auth: true,
      token,
      body: {},
    });
    return { unreadCount: data.unreadCount ?? 0 };
  } catch (error: any) {
    if (isNotFound(error?.message || '')) {
      return null;
    }
    throw error;
  }
}

export async function markAllNotificationsRead(
  token: string,
): Promise<{ unreadCount: number } | null> {
  try {
    const data = await apiFetch<{ unreadCount: number }>('/notifications/read-all', {
      method: 'POST',
      auth: true,
      token,
      body: {},
    });
    return { unreadCount: data.unreadCount ?? 0 };
  } catch (error: any) {
    if (isNotFound(error?.message || '')) {
      return null;
    }
    throw error;
  }
}
