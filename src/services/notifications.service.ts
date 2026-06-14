import type { Notification } from '../types';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabase';

export const notificationsService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    console.log('[NotificationsService] Fetching notifications from backend for User:', userId);
    const data = await apiClient.get<any[]>('/notifications');
    return data.map((row: any) => ({
      id: row.id,
      title: row.title || 'Notification',
      message: row.message || '',
      type: (row.type as any) || 'info',
      timestamp: row.created_at,
      isRead: row.is_read ?? false,
    }));
  },

  async markNotificationRead(id: string): Promise<void> {
    console.log('[NotificationsService] Marking notification read on backend:', id);
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAsRead(id: string): Promise<void> {
    return this.markNotificationRead(id);
  },

  async markAllAsRead(_userId: string): Promise<void> {
    console.log('[NotificationsService] Marking all notifications read on backend');
    await apiClient.put('/notifications/read-all');
  },

  subscribeToNotifications(userId: string, onNotification: (notif: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new;
          onNotification({
            id: row.id,
            title: row.title,
            message: row.message,
            type: row.type || 'info',
            timestamp: row.created_at,
            isRead: row.is_read,
          });
        }
      )
      .subscribe();
  }
};
