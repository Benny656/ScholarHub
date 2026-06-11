import type { Notification } from '../types';
import { supabase } from '../lib/supabase';

export const notificationsService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) as any;

    if (error) throw error;
    if (!data) return [];

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
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAsRead(id: string): Promise<void> {
    return this.markNotificationRead(id);
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
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
