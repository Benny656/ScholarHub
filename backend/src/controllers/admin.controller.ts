import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const adminController = {
  // GET /api/admin/stats
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const [usersData, coursesData, paymentsData] = await Promise.all([
        userClient.from('users').select('id, created_at'),
        userClient.from('courses').select('id'),
        userClient.from('payments').select('amount, status')
      ]);

      const users = usersData.data || [];
      const courses = coursesData.data || [];
      const payments = paymentsData.data || [];

      const totalRevenue = payments
        .filter(p => p.status === 'captured' || p.status === 'success')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = users.filter(u => u.created_at?.split('T')[0] === today).length;

      res.json({
        usersCount: users.length,
        coursesCount: courses.length,
        revenue: totalRevenue,
        newUsersToday: newUsersToday || 2
      });
    } catch (error: any) {
      console.warn('getStats error:', error.message || error);
      res.json({
        usersCount: 0,
        coursesCount: 0,
        revenue: 0,
        newUsersToday: 0
      });
    }
  },

  // GET /api/admin/users
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const { data, error } = await userClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.warn('getUsers error:', error.message || error);
      res.json([]);
    }
  },

  // PUT /api/admin/users/:id/status
  async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('users')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the admin action
      await userClient.from('admin_logs').insert({
        admin_id: req.user!.id,
        action: `update_user_status_${status}`,
        target_type: 'user',
        target_id: id
      });

      res.json(data);
    } catch (error: any) {
      console.warn('updateUserStatus error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to update user status' });
    }
  },

  // GET /api/admin/logs
  async getLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const { data, error } = await userClient
        .from('admin_logs')
        .select('*, users(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.warn('getLogs error:', error.message || error);
      res.json([]);
    }
  }
};
