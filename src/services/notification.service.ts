import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export type NotificationType = 'assignments' | 'announcements' | 'system' | 'messages';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  assignments: boolean;
  announcements: boolean;
  system: boolean;
  messages: boolean;
}

/**
 * Utility to send a notification to a specific user, respecting their preferences.
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string
) {
  try {
    // 1. Fetch user's notification preferences
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('Failed to fetch notification preferences for user', userId, profileError);
      // Fallback: assume true if we can't fetch it
    }

    const preferences: NotificationPreferences = profileData?.notification_preferences || {
      assignments: true,
      announcements: true,
      system: true,
      messages: true
    };

    // 2. Check if the user has opted out of this specific type
    if (preferences[type as keyof NotificationPreferences] === false) {
      console.log(`User ${userId} has muted ${type} notifications. Skipping.`);
      return false;
    }

    // 3. Insert into the notifications table
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type
      });

    if (insertError) {
      console.error('Failed to insert notification', insertError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error sending notification', err);
    return false;
  }
}

/**
 * Hook to subscribe to real-time notifications for the logged-in user.
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }
    
    const notifs = data as AppNotification[];
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.is_read).length);
  };

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Subscribe to real-time inserts for this user
    const channel = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications(prev => [newNotif, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
          
          // Show a toast when a new notification arrives
          toast.success(`New Notification: ${newNotif.title}`, {
            icon: '🔔',
            duration: 4000
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert if failed (optional, handled via refetch)
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    // Optimistic UI
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}
