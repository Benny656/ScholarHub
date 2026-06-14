import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const assignmentController = {
  // GET /api/assignments
  async getAssignments(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const userId = req.user!.id;
      const role = req.user!.role;

      let courseIds: string[] = [];

      if (role === 'student') {
        const { data: enrolls } = await userClient
          .from('enrollments')
          .select('course_id')
          .eq('student_id', userId);
        
        if (enrolls) {
          courseIds = enrolls.map(e => e.course_id);
        }
      } else {
        const { data: courses } = await userClient
          .from('courses')
          .select('id')
          .eq('teacher_id', userId);
        
        if (courses) {
          courseIds = courses.map(c => c.id);
        }
      }

      let query = userClient.from('assignments').select('*, courses(title)');
      if (courseIds.length > 0) {
        query = query.in('course_id', courseIds);
      }

      const { data: assignments, error } = await query;
      if (error) throw error;

      // Fetch submissions for student
      let submissions: any[] = [];
      if (role === 'student') {
        const { data: subs } = await userClient
          .from('submissions')
          .select('*')
          .eq('student_id', userId);
        
        if (subs) {
          submissions = subs;
        }
      }

      const formatted = (assignments || []).map((asg: any) => {
        const sub = submissions.find(s => s.assignment_id === asg.id);
        const daysLeft = Math.ceil((new Date(asg.due_date).getTime() - Date.now()) / 86400000);
        let status = 'pending';
        if (sub) {
          status = sub.grade !== null && sub.grade !== undefined ? 'graded' : 'submitted';
        } else if (daysLeft < 0) {
          status = 'overdue';
        }

        return {
          id: asg.id,
          title: asg.title || '',
          description: asg.description || '',
          courseId: asg.course_id || '',
          courseName: asg.courses?.title || 'Unknown Course',
          dueDate: asg.due_date,
          status,
          priority: daysLeft <= 3 ? 'high' : 'medium',
          maxScore: Number(asg.max_grade) || 100,
          score: sub ? Number(sub.grade) : undefined,
          feedback: sub?.feedback || undefined,
          files: sub?.file_url ? [sub.file_url] : [],
          submittedAt: sub?.submitted_at || undefined,
          type: 'file'
        };
      });

      res.json(formatted);
    } catch (error: any) {
      console.warn('getAssignments error:', error.message || error);
      res.json([]);
    }
  },

  // GET /api/assignments/:id
  async getAssignmentById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('assignments')
        .select('*, courses(title)')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.json({
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        courseId: data.course_id || '',
        courseName: data.courses?.title || 'Unknown Course',
        dueDate: data.due_date,
        status: 'pending',
        priority: 'medium',
        maxScore: Number(data.max_grade) || 100,
        type: 'file'
      });
    } catch (error: any) {
      console.warn('getAssignmentById error:', error.message || error);
      res.status(404).json({ error: 'Assignment not found' });
    }
  },

  // POST /api/assignments/:id/submit
  async submitAssignment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { fileUrl } = req.body;
      const userId = req.user!.id;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('submissions')
        .upsert({
          assignment_id: id,
          student_id: userId,
          file_url: fileUrl,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error: any) {
      console.warn('submitAssignment error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to submit assignment' });
    }
  },

  // POST /api/submissions/:id/grade
  async gradeSubmission(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { grade, feedback } = req.body;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('submissions')
        .update({ grade, feedback })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.warn('gradeSubmission error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to grade submission' });
    }
  },

  // GET /api/quizzes/:courseId
  async getQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Quiz not found');
      }

      res.json({
        id: data[0].id,
        assignmentId: data[0].course_id,
        title: data[0].title || 'Quiz',
        questions: data[0].questions || [],
        timeLimit: data[0].duration_minutes || 30,
        attempts: 0,
        maxAttempts: 1
      });
    } catch (error: any) {
      console.warn('getQuiz error:', error.message || error);
      res.status(404).json({ error: 'Quiz not found' });
    }
  },

  // POST /api/quizzes/:id/submit
  async submitQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { score, answers } = req.body;
      const userId = req.user!.id;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('quiz_results')
        .insert({
          quiz_id: id,
          student_id: userId,
          score,
          answers,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.warn('submitQuiz error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to submit quiz' });
    }
  },

  // GET /api/teacher/assignments
  async getTeacherAssignments(req: AuthenticatedRequest, res: Response) {
    try {
      const { teacherId } = req.query;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('assignments')
        .select('*, courses(title)')
        .eq('teacher_id', teacherId || req.user!.id);

      if (error) throw error;

      const formatted = (data || []).map((asg: any) => ({
        id: asg.id,
        title: asg.title || '',
        description: asg.description || '',
        courseId: asg.course_id || '',
        courseName: asg.courses?.title || 'Unknown Course',
        dueDate: asg.due_date,
        status: 'pending',
        priority: 'medium',
        maxScore: Number(asg.max_grade) || 100,
        type: 'file'
      }));

      res.json(formatted);
    } catch (error: any) {
      console.warn('getTeacherAssignments error:', error.message || error);
      res.json([]);
    }
  }
};
