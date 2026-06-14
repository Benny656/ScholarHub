import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';
import { MOCK_COURSES, MOCK_SESSIONS } from '../mockData.js';

export const dashboardController = {
  // GET /api/teacher/dashboard
  async getTeacherDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const teacherId = req.user!.id;

      // 1. Fetch owned courses
      const { data: courses, error: coursesError } = await userClient
        .from('courses')
        .select('*')
        .eq('teacher_id', teacherId);

      if (coursesError) throw coursesError;

      const courseIds = (courses || []).map(c => c.id);
      const activeCoursesCount = courses?.length || 0;

      // 2. Fetch total students enrolled in these courses
      let totalStudentsCount = 0;
      if (courseIds.length > 0) {
        const { count, error: enrollmentsError } = await userClient
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds);

        if (enrollmentsError) throw enrollmentsError;
        totalStudentsCount = count || 0;
      }

      // 3. Fetch pending evaluations
      let pendingEvaluationsCount = 0;
      if (courseIds.length > 0) {
        // Find assignment IDs
        const { data: assignments, error: assignmentsError } = await userClient
          .from('assignments')
          .select('id')
          .in('course_id', courseIds);

        if (assignmentsError) throw assignmentsError;
        const assignmentIds = (assignments || []).map(a => a.id);

        if (assignmentIds.length > 0) {
          const { count, error: submissionsError } = await userClient
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .in('assignment_id', assignmentIds)
            .is('grade', null);

          if (submissionsError) throw submissionsError;
          pendingEvaluationsCount = count || 0;
        }
      }

      // 4. Fetch attendance rate
      let attendanceRate = 95;
      if (courseIds.length > 0) {
        const { data: attendance, error: attendanceError } = await userClient
          .from('attendance')
          .select('status')
          .in('course_id', courseIds);

        if (attendanceError) throw attendanceError;
        if (attendance && attendance.length > 0) {
          const present = attendance.filter(a => a.status === 'present').length;
          attendanceRate = Math.round((present / attendance.length) * 100);
        }
      }

      // 5. Fetch upcoming live classes for today
      let todayClasses: any[] = [];
      if (courseIds.length > 0) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const { data: sessions, error: sessionsError } = await userClient
          .from('live_classes')
          .select('*, courses(title)')
          .in('course_id', courseIds)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .order('scheduled_at', { ascending: true });

        if (sessionsError) {
          console.warn('Today classes fetch join failed, querying simple select:', sessionsError.message);
          const { data: simpleSessions } = await userClient
            .from('live_classes')
            .select('*')
            .in('course_id', courseIds)
            .gte('scheduled_at', startOfDay.toISOString())
            .lte('scheduled_at', endOfDay.toISOString());
            
          todayClasses = (simpleSessions || []).map(s => ({
            id: s.id,
            title: s.title,
            time: new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            course: 'Virtual Classroom Session',
            roomId: s.room_id,
          }));
        } else {
          todayClasses = (sessions || []).map(s => ({
            id: s.id,
            title: s.title,
            time: new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            course: s.courses?.title || 'Unknown Course',
            roomId: s.room_id,
          }));
        }
      }

      res.json({
        stats: {
          activeCourses: activeCoursesCount,
          totalStudents: totalStudentsCount,
          pendingEvaluations: pendingEvaluationsCount,
          attendanceRate,
        },
        courses: (courses || []).map(c => ({
          id: c.id,
          title: c.title,
          students: c.total_students || 0,
          progress: c.rating ? Math.round(Number(c.rating) * 20) : 0,
          nextSession: 'TBD',
        })),
        todayClasses,
      });
    } catch (error: any) {
      console.error('getTeacherDashboard error:', error.message || error);
      res.json({
        stats: {
          activeCourses: 0,
          totalStudents: 0,
          pendingEvaluations: 0,
          attendanceRate: 100,
        },
        courses: [],
        todayClasses: [],
      });
    }
  }
};
