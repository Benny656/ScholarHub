import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const notificationController = {
  // GET /api/notifications
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const userId = req.user!.id;

      const { data, error } = await userClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.warn('getNotifications error:', error.message || error);
      res.json([]);
    }
  },

  // PUT /api/notifications/:id/read
  async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.warn('markRead error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to mark notification as read' });
    }
  },

  // PUT /api/notifications/read-all
  async markAllRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const userId = req.user!.id;

      const { data, error } = await userClient
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      res.json({ success: true, count: data?.length || 0 });
    } catch (error: any) {
      console.warn('markAllRead error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to mark notifications as read' });
    }
  }
};
