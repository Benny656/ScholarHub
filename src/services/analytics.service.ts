import type { GradeData, ProgressData, PlatformStats } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  async getStudentGrades(userId: string): Promise<GradeData[]> {
    await delay(500);
    // In real app: GET /api/analytics/student/:userId/grades
    return [
      { subject: 'Web Development', score: 87, maxScore: 100, grade: 'A' },
      { subject: 'Machine Learning', score: 74, maxScore: 100, grade: 'B+' },
      { subject: 'UI/UX Design', score: 93, maxScore: 100, grade: 'A+' },
      { subject: 'Data Structures', score: 68, maxScore: 100, grade: 'B' },
      { subject: 'Cloud Computing', score: 81, maxScore: 100, grade: 'A-' },
      { subject: 'Cybersecurity', score: 89, maxScore: 100, grade: 'A' },
    ];
  },

  async getProgressData(userId: string): Promise<ProgressData[]> {
    await delay(500);
    // In real app: GET /api/analytics/student/:userId/progress
    return [
      { week: 'Jan W1', hoursSpent: 8, lessonsCompleted: 5, score: 72 },
      { week: 'Jan W2', hoursSpent: 12, lessonsCompleted: 8, score: 76 },
      { week: 'Jan W3', hoursSpent: 10, lessonsCompleted: 6, score: 79 },
      { week: 'Jan W4', hoursSpent: 15, lessonsCompleted: 11, score: 82 },
      { week: 'Feb W1', hoursSpent: 9, lessonsCompleted: 7, score: 80 },
      { week: 'Feb W2', hoursSpent: 13, lessonsCompleted: 9, score: 84 },
      { week: 'Feb W3', hoursSpent: 16, lessonsCompleted: 12, score: 86 },
      { week: 'Feb W4', hoursSpent: 11, lessonsCompleted: 8, score: 83 },
      { week: 'Mar W1', hoursSpent: 14, lessonsCompleted: 10, score: 87 },
      { week: 'Mar W2', hoursSpent: 18, lessonsCompleted: 14, score: 90 },
      { week: 'Mar W3', hoursSpent: 12, lessonsCompleted: 9, score: 88 },
      { week: 'Mar W4', hoursSpent: 20, lessonsCompleted: 15, score: 92 },
    ];
  },

  async getPlatformStats(): Promise<PlatformStats> {
    await delay(600);
    // In real app: GET /api/analytics/platform (admin only)
    return {
      totalUsers: 12847,
      activeUsers: 4231,
      totalCourses: 248,
      totalEnrollments: 38921,
      revenue: 284750,
      completionRate: 67.4,
    };
  },

  async getRevenueData(): Promise<{ month: string; revenue: number; enrollments: number }[]> {
    await delay(500);
    // In real app: GET /api/analytics/revenue
    return [
      { month: 'Jan', revenue: 18200, enrollments: 234 },
      { month: 'Feb', revenue: 21500, enrollments: 287 },
      { month: 'Mar', revenue: 19800, enrollments: 261 },
      { month: 'Apr', revenue: 24300, enrollments: 318 },
      { month: 'May', revenue: 28900, enrollments: 376 },
      { month: 'Jun', revenue: 31200, enrollments: 402 },
    ];
  },

  async getEngagementData(): Promise<{ day: string; active: number; new: number }[]> {
    await delay(500);
    // In real app: GET /api/analytics/engagement
    return [
      { day: 'Mon', active: 3420, new: 124 },
      { day: 'Tue', active: 3810, new: 156 },
      { day: 'Wed', active: 4230, new: 189 },
      { day: 'Thu', active: 3920, new: 143 },
      { day: 'Fri', active: 3650, new: 131 },
      { day: 'Sat', active: 2840, new: 98 },
      { day: 'Sun', active: 2190, new: 76 },
    ];
  },

  async getCourseCompletionData(userId: string): Promise<{ course: string; progress: number; started: string }[]> {
    await delay(400);
    // In real app: GET /api/analytics/student/:userId/completion
    return [
      { course: 'Full-Stack Web Dev', progress: 68, started: '2024-01-20' },
      { course: 'Machine Learning', progress: 34, started: '2024-02-15' },
      { course: 'UI/UX Design', progress: 91, started: '2024-03-10' },
    ];
  },

  async getTeacherStats(teacherId: string): Promise<{ label: string; value: number | string }[]> {
    await delay(400);
    // In real app: GET /api/analytics/teacher/:teacherId
    return [
      { label: 'Total Students', value: 847 },
      { label: 'Active Courses', value: 4 },
      { label: 'Avg Rating', value: '4.8' },
      { label: 'Completion Rate', value: '73%' },
    ];
  },

  // Alias for Analytics page
  async getGrades(userId: string) {
    return this.getStudentGrades(userId);
  },
};
