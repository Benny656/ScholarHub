import type { Assignment, Quiz } from '../types';
import { supabase } from '../lib/supabase';

export const assignmentsService = {
  async getAssignments(courseIdOrUserId?: string): Promise<Assignment[]> {
    let query = supabase.from('assignments').select('*, courses(title)') as any;
    
    let isStudentId = false;
    let enrolledCourseIds: string[] = [];
    
    if (courseIdOrUserId) {
      // Check if it's a student ID
      const { data: enrolls } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', courseIdOrUserId) as any;
        
      if (enrolls && enrolls.length > 0) {
        isStudentId = true;
        enrolledCourseIds = enrolls.map((e: any) => e.course_id).filter(Boolean);
      }
    }

    if (courseIdOrUserId) {
      if (isStudentId) {
        query = query.in('course_id', enrolledCourseIds);
      } else {
        query = query.eq('course_id', courseIdOrUserId);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data) return [];

    let studentId = isStudentId ? courseIdOrUserId : null;
    if (!studentId) {
      const { data: { user } } = await supabase.auth.getUser();
      studentId = user?.id;
    }

    const { data: subData } = studentId 
      ? await supabase.from('submissions').select('*').eq('student_id', studentId) as any
      : { data: [] };

    return data.map((asg: any) => {
      const sub = subData?.find((s: any) => s.assignment_id === asg.id);
      const daysLeft = Math.ceil((new Date(asg.due_date).getTime() - Date.now()) / 86400000);
      let status: Assignment['status'] = 'pending';
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
        type: 'file',
      };
    });
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, courses(title)')
      .eq('id', id)
      .single() as any;

    if (error) throw error;

    return {
      id: data.id,
      title: data.title || '',
      description: data.description || '',
      courseId: data.course_id || '',
      courseName: data.courses?.title || 'Unknown Course',
      dueDate: data.due_date,
      status: 'pending',
      priority: 'medium',
      maxScore: Number(data.max_grade) || 100,
      type: 'file',
    };
  },

  async submitAssignment(
    assignmentId: string,
    fileUrlOrPayload: string | { text?: string; files?: File[] }
  ): Promise<Assignment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    let fileUrl = '';
    if (typeof fileUrlOrPayload === 'string') {
      fileUrl = fileUrlOrPayload;
    } else {
      fileUrl = fileUrlOrPayload.files && fileUrlOrPayload.files[0] 
        ? `https://niebnbpcmnfqfyodkqvr.supabase.co/storage/v1/object/public/assignments/${fileUrlOrPayload.files[0].name}` 
        : fileUrlOrPayload.text || '';
    }

    const { data, error } = await supabase
      .from('submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: user.id,
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single() as any;

    if (error) throw error;

    const asg = await this.getAssignmentById(assignmentId);
    return {
      ...asg,
      status: 'submitted',
      submittedAt: data.submitted_at,
      files: fileUrl ? [fileUrl] : [],
    };
  },

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<any> {
    const { data, error } = await supabase
      .from('submissions')
      .update({
        grade,
        feedback,
      })
      .eq('id', submissionId)
      .select()
      .single() as any;

    if (error) throw error;
    return data;
  },

  async gradeAssignment(id: string, score: number, feedback: string): Promise<Assignment> {
    const data = await this.gradeSubmission(id, score, feedback);
    const asg = await this.getAssignmentById(data.assignment_id);
    return {
      ...asg,
      status: 'graded',
      score,
      feedback,
    };
  },

  async getQuiz(assignmentId: string): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('course_id', assignmentId)
      .limit(1) as any;

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Quiz not found');
    }

    return {
      id: data[0].id,
      assignmentId: data[0].course_id,
      title: data[0].title || 'Quiz',
      questions: data[0].questions || [],
      timeLimit: data[0].duration_minutes || 30,
      attempts: 0,
      maxAttempts: 1,
    };
  },

  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<{ score: number; total: number; results: Record<string, boolean> }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const quiz = await this.getQuiz(quizId);
    let score = 0;
    const results: Record<string, boolean> = {};

    quiz.questions.forEach((q: any) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      results[q.id] = isCorrect;
      if (isCorrect) score += q.points;
    });
    const total = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);

    const { error } = await supabase
      .from('quiz_results')
      .insert({
        quiz_id: quizId,
        student_id: user.id,
        score,
        answers,
        completed_at: new Date().toISOString(),
      });

    if (error) throw error;

    return { score, total, results };
  },

  async getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, courses(title)')
      .eq('teacher_id', teacherId) as any;

    if (error) throw error;
    if (!data) return [];

    return data.map((asg: any) => ({
      id: asg.id,
      title: asg.title || '',
      description: asg.description || '',
      courseId: asg.course_id || '',
      courseName: asg.courses?.title || 'Unknown Course',
      dueDate: asg.due_date,
      status: 'pending',
      priority: 'medium',
      maxScore: Number(asg.max_grade) || 100,
      type: 'file',
    }));
  }
};
