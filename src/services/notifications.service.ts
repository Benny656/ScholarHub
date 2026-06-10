import type { Notification } from '../types';
import { supabase } from '../lib/supabase';

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Assignment Graded', message: 'Your UX Research Report received a score of 87/100', type: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: false, link: '/assignments/a3' },
  { id: 'n2', title: 'New Message', message: 'Dr. Sarah Chen sent you a message', type: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), isRead: false, link: '/messages' },
  { id: 'n3', title: 'Assignment Due Soon', message: 'React Component Architecture due in 3 days', type: 'warning', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), isRead: true, link: '/assignments/a1' },
];

export const notificationsService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return MOCK_NOTIFICATIONS;

      return data.map(row => ({
        id: row.id,
        title: row.title || 'Notification',
        message: row.message || '',
        type: (row.type as any) || 'info',
        timestamp: row.created_at,
        isRead: row.is_read ?? false,
      }));
    } catch (err) {
      console.warn('Supabase getNotifications failed, using mock data:', err);
      return MOCK_NOTIFICATIONS;
    }
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Realtime subscription helper
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
