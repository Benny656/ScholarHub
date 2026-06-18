import { supabase } from '../lib/supabase';
import type { Assignment, Quiz } from '../types';
import { uploadService } from './upload.service';

export const assignmentsService = {
  async getAssignments(userId?: string): Promise<Assignment[]> {
    console.log('[AssignmentsService] Fetching assignments from Supabase for student:', userId);
    if (!userId) return [];
    
    // Fetch all enrollments for this user
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', userId);
      
    if (enrollmentsError) throw enrollmentsError;
    const courseIds = (enrollments || []).map(e => e.course_id);
    
    if (!courseIds.length) return [];

    // Fetch assignments for those courses
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*, courses(title)')
      .in('course_id', courseIds);

    if (assignmentsError) throw assignmentsError;

    // Fetch submissions for this user
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', userId);

    if (submissionsError) throw submissionsError;

    const submissionMap = new Map((submissions || []).map(s => [s.assignment_id, s]));

    return (assignments || []).map(a => {
      const sub = submissionMap.get(a.id);
      let status: 'pending' | 'submitted' | 'graded' | 'overdue' = 'pending';
      
      const isOverdue = a.due_date && new Date(a.due_date).getTime() < Date.now();
      
      if (sub?.grade !== null && sub?.grade !== undefined) {
        status = 'graded';
      } else if (sub) {
        status = 'submitted';
      } else if (isOverdue) {
        status = 'overdue';
      }

      // Supabase relations map to an array or single object depending on definition, we handle potential array
      const courseTitle = Array.isArray(a.courses) ? a.courses[0]?.title : (a.courses as any)?.title;

      return {
        id: a.id,
        title: a.title || 'Untitled',
        description: a.description || '',
        courseId: a.course_id || '',
        courseName: courseTitle || 'Unknown Course',
        dueDate: a.due_date || new Date().toISOString(),
        status,
        priority: 'medium', // Default
        maxScore: a.max_grade || 100,
        score: sub?.grade || undefined,
        feedback: sub?.feedback || undefined,
        type: 'file', // Default fallback
      } as Assignment;
    });
  },

  async getAssignmentById(id: string, userId?: string): Promise<Assignment> {
    const { data: a, error } = await supabase
      .from('assignments')
      .select('*, courses(title)')
      .eq('id', id)
      .single();
      
    if (error) throw error;

    let sub = null;
    if (userId) {
      const { data } = await supabase.from('submissions').select('*').eq('assignment_id', id).eq('student_id', userId).maybeSingle();
      sub = data;
    }

    let status: 'pending' | 'submitted' | 'graded' | 'overdue' = 'pending';
    const isOverdue = a.due_date && new Date(a.due_date).getTime() < Date.now();
    
    if (sub?.grade !== null && sub?.grade !== undefined) {
      status = 'graded';
    } else if (sub) {
      status = 'submitted';
    } else if (isOverdue) {
      status = 'overdue';
    }

    const courseTitle = Array.isArray(a.courses) ? a.courses[0]?.title : (a.courses as any)?.title;

    return {
      id: a.id,
      title: a.title || 'Untitled',
      description: a.description || '',
      courseId: a.course_id || '',
      courseName: courseTitle || 'Unknown Course',
      dueDate: a.due_date || new Date().toISOString(),
      status,
      priority: 'medium',
      maxScore: a.max_grade || 100,
      score: sub?.grade || undefined,
      feedback: sub?.feedback || undefined,
      type: 'file',
    } as Assignment;
  },

  async submitAssignment(
    assignmentId: string,
    fileUrlOrPayload: string | { text?: string; files?: File[] },
    userId?: string
  ): Promise<any> {
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    }
    if (!userId) throw new Error('User not authenticated');

    let fileUrl = '';
    if (typeof fileUrlOrPayload === 'string') {
      fileUrl = fileUrlOrPayload;
    } else if (fileUrlOrPayload.files && fileUrlOrPayload.files[0]) {
      const uploadResult = await uploadService.uploadFile(fileUrlOrPayload.files[0], `assignments/${assignmentId}`);
      fileUrl = uploadResult.url;
    } else {
      fileUrl = fileUrlOrPayload.text || '';
    }

    // Check if submission already exists
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('student_id', userId)
      .maybeSingle();

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('submissions')
        .update({ file_url: fileUrl, submitted_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: userId,
          file_url: fileUrl,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async getTeacherAssignments(teacherId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, courses(title)')
      .eq('teacher_id', teacherId);
      
    if (error) throw error;
    return data || [];
  },

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<any> {
    const { data, error } = await supabase
      .from('submissions')
      .update({ grade, feedback })
      .eq('id', submissionId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async getQuiz(assignmentId: string): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', assignmentId)
      .single();
      
    if (error) throw error;
    return data as any;
  },

  async submitQuiz(quizId: string, answers: Record<string, number>, userId?: string): Promise<{ score: number; total: number; results: Record<string, boolean> }> {
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    }
    
    const quiz = await this.getQuiz(quizId);
    let score = 0;
    const results: Record<string, boolean> = {};

    (quiz.questions || []).forEach((q: any) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      results[q.id] = isCorrect;
      if (isCorrect) score += (q.points || 10);
    });
    
    const total = (quiz.questions || []).reduce((sum: number, q: any) => sum + (q.points || 10), 0);

    if (userId) {
      await supabase.from('quiz_results').insert({
        quiz_id: quizId,
        student_id: userId,
        score,
        answers,
        completed_at: new Date().toISOString()
      });
    }

    return { score, total, results };
  }
};
