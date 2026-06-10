import type { Assignment, Quiz, QuizQuestion } from '../types';
import { supabase } from '../lib/supabase';

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'React Component Architecture',
    description: 'Design and implement a reusable component library with proper TypeScript types, props validation, and Storybook documentation.',
    courseId: 'c1',
    courseName: 'Full-Stack Web Development',
    dueDate: '2024-06-15T23:59:00Z',
    status: 'pending',
    priority: 'high',
    maxScore: 100,
    type: 'file',
  },
  {
    id: 'a2',
    title: 'ML Model Evaluation',
    description: 'Train and evaluate three different ML models on the provided dataset. Compare accuracy, precision, and recall.',
    courseId: 'c2',
    courseName: 'Machine Learning Fundamentals',
    dueDate: '2024-06-20T23:59:00Z',
    status: 'submitted',
    priority: 'medium',
    maxScore: 100,
    type: 'file',
    submittedAt: '2024-06-12T14:30:00Z',
    files: ['ml_evaluation.ipynb'],
  },
];

export const MOCK_QUIZ: Quiz = {
  id: 'q1',
  assignmentId: 'a4',
  title: 'Data Structures & Algorithms Final Quiz',
  questions: [
    {
      id: 'qq1',
      question: 'What is the time complexity of binary search on a sorted array of n elements?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search halves the search space each iteration, resulting in O(log n) complexity.',
      points: 10,
    },
  ],
  timeLimit: 30,
  attempts: 0,
  maxAttempts: 2,
};

export const assignmentsService = {
  async getAssignments(userId: string): Promise<Assignment[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, courses(title)');

      if (error) throw error;
      if (!data || data.length === 0) return MOCK_ASSIGNMENTS;

      // Fetch submissions for status mapping
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', userId);

      return data.map(asg => {
        const sub = subData?.find(s => s.assignment_id === asg.id);
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
    } catch (err) {
      console.warn('Supabase getAssignments failed, using mock data:', err);
      return MOCK_ASSIGNMENTS;
    }
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, courses(title)')
        .eq('id', id)
        .single();

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
    } catch (err) {
      console.warn('Supabase getAssignmentById failed, using mock:', err);
      const mock = MOCK_ASSIGNMENTS.find(a => a.id === id);
      if (!mock) throw new Error('Assignment not found');
      return mock;
    }
  },

  async submitAssignment(id: string, payload: { text?: string; files?: File[] }): Promise<Assignment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const fileUrl = payload.files && payload.files[0] ? `https://niebnbpcmnfqfyodkqvr.supabase.co/storage/v1/object/public/assignments/${payload.files[0].name}` : '';

    const { data, error } = await supabase
      .from('submissions')
      .upsert({
        assignment_id: id,
        student_id: user.id,
        file_url: fileUrl || payload.text || '',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    const asg = await this.getAssignmentById(id);
    return {
      ...asg,
      status: 'submitted',
      submittedAt: data.submitted_at,
      files: fileUrl ? [fileUrl] : [],
    };
  },

  async getQuiz(assignmentId: string): Promise<Quiz> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', assignmentId) // fallback to course lookup or quiz direct
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return MOCK_QUIZ;

      return {
        id: data[0].id,
        assignmentId: data[0].course_id,
        title: data[0].title || 'Quiz',
        questions: data[0].questions || [],
        timeLimit: data[0].duration_minutes || 30,
        attempts: 0,
        maxAttempts: 1,
      };
    } catch (err) {
      console.warn('Supabase getQuiz failed, using mock:', err);
      return MOCK_QUIZ;
    }
  },

  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<{ score: number; total: number; results: Record<string, boolean> }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const quiz = await this.getQuiz(quizId);
    let score = 0;
    const results: Record<string, boolean> = {};

    quiz.questions.forEach(q => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      results[q.id] = isCorrect;
      if (isCorrect) score += q.points;
    });
    const total = quiz.questions.reduce((sum, q) => sum + q.points, 0);

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
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, courses(title)')
        .eq('teacher_id', teacherId);

      if (error) throw error;
      if (!data || data.length === 0) return MOCK_ASSIGNMENTS;

      return data.map(asg => ({
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
    } catch (err) {
      console.warn('Supabase getTeacherAssignments failed, using mock:', err);
      return MOCK_ASSIGNMENTS;
    }
  },

  async gradeAssignment(id: string, score: number, feedback: string): Promise<Assignment> {
    const { data, error } = await supabase
      .from('submissions')
      .update({
        grade: score,
        feedback,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const asg = await this.getAssignmentById(data.assignment_id);
    return {
      ...asg,
      status: 'graded',
      score,
      feedback,
    };
  },
};
