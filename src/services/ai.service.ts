import { apiClient } from '../lib/apiClient';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CourseRecommendation {
  courseId: string;
  title: string;
  reason: string;
  matchScore: number;
  category: string;
}

export interface QuizGenerationResult {
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    points: number;
  }[];
}

export interface AssignmentCheckResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  plagiarismScore: number;
}

export interface AttendanceInsight {
  insight: string;
  type: 'warning' | 'info' | 'success';
  recommendation: string;
}

export const aiService = {
  async tutorChat(message: string, context?: string): Promise<AIMessage> {
    console.log('[AIService] Calling tutor chat on backend');
    return apiClient.post<AIMessage>('/ai/tutor', { message, context });
  },

  async sendTutorMessage(messages: AIMessage[], context?: string): Promise<AIMessage> {
    const lastMsg = messages[messages.length - 1]?.content || '';
    return this.tutorChat(lastMsg, context);
  },

  async generateQuiz(courseContent: string, difficulty?: string, questionCount?: number): Promise<QuizGenerationResult> {
    console.log('[AIService] Generating quiz on backend');
    return apiClient.post<QuizGenerationResult>('/ai/quiz/generate', {
      courseContent,
      difficulty,
      questionCount
    });
  },

  async checkAssignment(submission: string, rubric: string): Promise<AssignmentCheckResult> {
    console.log('[AIService] Grading assignment on backend');
    return apiClient.post<AssignmentCheckResult>('/ai/assignments/check', {
      submission,
      rubric
    });
  },

  async recommendCourses(studentId: string): Promise<CourseRecommendation[]> {
    console.log('[AIService] Fetching course recommendations from backend');
    const res = await apiClient.post<any>('/ai/recommendations', { studentId });
    return res.recommendations || [];
  },

  async getCourseRecommendations(userId: string, _enrolledCourseIds: string[]): Promise<CourseRecommendation[]> {
    return this.recommendCourses(userId);
  },

  async attendanceInsights(courseIdOrUserId: string, maybeData?: { percentage: number; trend: string }): Promise<AttendanceInsight[]> {
    console.log('[AIService] Fetching attendance insights from backend');
    const res = await apiClient.post<any>('/ai/attendance/insights', {
      courseIdOrUserId,
      percentage: maybeData?.percentage,
      trend: maybeData?.trend
    });
    return res.insights || [];
  },

  async getAttendanceInsights(userId: string, attendanceData: { percentage: number; trend: string }): Promise<AttendanceInsight[]> {
    return this.attendanceInsights(userId, attendanceData);
  }
};
