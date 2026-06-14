import type { Assignment, Quiz } from '../types';
import { apiClient } from '../lib/apiClient';
import { uploadService } from './upload.service';

export const assignmentsService = {
  async getAssignments(courseIdOrUserId?: string): Promise<Assignment[]> {
    console.log('[AssignmentsService] Fetching assignments from backend');
    let path = '/assignments';
    if (courseIdOrUserId) {
      path += `?userIdOrCourseId=${courseIdOrUserId}`;
    }
    return apiClient.get<Assignment[]>(path);
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    console.log('[AssignmentsService] Fetching assignment details from backend for:', id);
    return apiClient.get<Assignment>(`/assignments/${id}`);
  },

  async submitAssignment(
    assignmentId: string,
    fileUrlOrPayload: string | { text?: string; files?: File[] }
  ): Promise<Assignment> {
    console.log('[AssignmentsService] Submitting assignment via backend for:', assignmentId);

    let fileUrl = '';
    if (typeof fileUrlOrPayload === 'string') {
      fileUrl = fileUrlOrPayload;
    } else if (fileUrlOrPayload.files && fileUrlOrPayload.files[0]) {
      const uploadResult = await uploadService.uploadFile(fileUrlOrPayload.files[0], `assignments/${assignmentId}`);
      fileUrl = uploadResult.url;
    } else {
      fileUrl = fileUrlOrPayload.text || '';
    }

    const data = await apiClient.post<any>(`/assignments/${assignmentId}/submit`, { fileUrl });
    const asg = await this.getAssignmentById(assignmentId);
    
    return {
      ...asg,
      status: 'submitted',
      submittedAt: data.submitted_at,
      files: fileUrl ? [fileUrl] : [],
    };
  },

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<any> {
    console.log('[AssignmentsService] Grading submission via backend:', submissionId);
    return apiClient.post<any>(`/submissions/${submissionId}/grade`, { grade, feedback });
  },

  async gradeAssignment(id: string, score: number, feedback: string): Promise<Assignment> {
    const data = await this.gradeSubmission(id, score, feedback);
    const asg = await this.getAssignmentById(data.assignment_id || id);
    return {
      ...asg,
      status: 'graded',
      score,
      feedback,
    };
  },

  async getQuiz(assignmentId: string): Promise<Quiz> {
    console.log('[AssignmentsService] Fetching quiz from backend for course:', assignmentId);
    return apiClient.get<Quiz>(`/quizzes/${assignmentId}`);
  },

  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<{ score: number; total: number; results: Record<string, boolean> }> {
    console.log('[AssignmentsService] Submitting quiz attempt to backend:', quizId);
    
    const quiz = await this.getQuiz(quizId);
    let score = 0;
    const results: Record<string, boolean> = {};

    quiz.questions.forEach((q: any) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      results[q.id] = isCorrect;
      if (isCorrect) score += q.points;
    });
    const total = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);

    await apiClient.post<any>(`/quizzes/${quizId}/submit`, { score, answers });

    return { score, total, results };
  },

  async getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    console.log('[AssignmentsService] Fetching assignments for teacher from backend');
    return apiClient.get<Assignment[]>(`/teacher/assignments?teacherId=${teacherId}`);
  }
};
