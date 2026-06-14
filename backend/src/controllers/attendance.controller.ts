import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const attendanceController = {
  // POST /api/attendance/mark
  async markAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId, classId, status } = req.body;
      const userId = req.user!.id;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('attendance')
        .insert({
          student_id: userId,
          course_id: courseId,
          class_id: classId,
          date: new Date().toISOString().split('T')[0],
          status
        })
        .select('*, users(name)')
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.warn('markAttendance error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to mark attendance' });
    }
  },

  // GET /api/attendance
  async getAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.query;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('attendance')
        .select('*, users(name), courses(title)')
        .eq('student_id', studentId || req.user!.id);

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.warn('getAttendance error:', error.message || error);
      res.json([]);
    }
  },

  // GET /api/attendance/course/:courseId
  async getCourseAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const { date } = req.query;
      const userClient = getSupabaseForUser(req.user!.token);

      let query = userClient
        .from('attendance')
        .select('*, users(name)')
        .eq('course_id', courseId);

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted = (data || []).map((row: any) => ({
        id: row.id,
        studentId: row.student_id,
        studentName: row.users?.name || 'Student',
        courseId: row.course_id,
        date: row.date,
        status: row.status,
        markedBy: row.qr_code ? 'qr' : 'manual'
      }));

      res.json(formatted);
    } catch (error: any) {
      console.warn('getCourseAttendance error:', error.message || error);
      res.json([]);
    }
  },

  // POST /api/attendance/scan
  async scanQRCode(req: AuthenticatedRequest, res: Response) {
    try {
      const { qrData, studentId } = req.body;
      const userClient = getSupabaseForUser(req.user!.token);

      const parts = qrData.split('/');
      const courseId = parts[3] || 'c1';

      const { data, error } = await userClient
        .from('attendance')
        .insert({
          student_id: studentId || req.user!.id,
          course_id: courseId,
          date: new Date().toISOString().split('T')[0],
          status: 'present',
          qr_code: qrData
        })
        .select('*, users(name)')
        .single();

      if (error) throw error;

      res.status(201).json({
        id: data.id,
        studentId: data.student_id,
        studentName: data.users?.name || 'Student',
        courseId: data.course_id,
        date: data.date,
        status: data.status,
        markedBy: 'qr'
      });
    } catch (error: any) {
      console.warn('scanQRCode error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to scan QR code' });
    }
  },

  // GET /api/attendance/report/:courseId
  async getAttendanceReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('attendance')
        .select('*, users(name)')
        .eq('course_id', courseId);

      if (error) throw error;

      const userMap: Record<string, { present: number; total: number; name: string }> = {};
      data?.forEach((row: any) => {
        const uId = row.student_id;
        if (!userMap[uId]) {
          userMap[uId] = { present: 0, total: 0, name: row.users?.name || 'Student' };
        }
        userMap[uId].total++;
        if (row.status === 'present') {
          userMap[uId].present++;
        }
      });

      const report = Object.values(userMap).map(u => ({
        studentName: u.name,
        percentage: Math.round((u.present / u.total) * 100),
        total: u.total,
        present: u.present
      }));

      res.json(report);
    } catch (error: any) {
      console.warn('getAttendanceReport error:', error.message || error);
      res.json([]);
    }
  }
};
