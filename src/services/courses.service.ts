import type { Course, Enrollment } from '../types';

function mapDBCourseToFrontend(dbCourse: any): Course {
  return {
    id: dbCourse.id,
    title: dbCourse.title || 'Untitled Course',
    description: dbCourse.description || '',
    instructor: dbCourse.users?.name || 'Unknown Instructor',
    instructorId: dbCourse.teacher_id || '',
    instructorAvatar: dbCourse.users?.avatar_url || '',
    category: dbCourse.category || 'General',
    level: dbCourse.level || 'Beginner',
    duration: dbCourse.duration_hours ? `${dbCourse.duration_hours}h` : '0h',
    lessons: dbCourse.total_lessons || 0,
    enrolled: dbCourse.total_students || 0,
    rating: Number(dbCourse.rating) || 0,
    reviews: 0,
    thumbnail: dbCourse.thumbnail_url || '',
    price: Number(dbCourse.price) || 0,
    tags: dbCourse.tags || [],
    curriculum: [],
    outcomes: [],
    requirements: [],
    isPublished: dbCourse.is_published ?? false,
    createdAt: dbCourse.created_at,
    updatedAt: dbCourse.created_at,
  };
}

import { apiClient } from '../lib/apiClient';

export const coursesService = {
  async getCourses(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    let url = '/classrooms';
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    if (filters?.level && filters.level !== 'All') {
      params.append('level', filters.level);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const data = await apiClient.get<any[]>(url);
    return data.map(mapDBCourseToFrontend);
  },

  async getCatalog(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    return this.getCourses(filters);
  },

  async getCourseById(id: string): Promise<Course> {
    const data = await apiClient.get<any>(`/classrooms/${id}`);
    const course = mapDBCourseToFrontend(data);
    
    if (data.lessons) {
      course.lessons = data.lessons.length;
      course.curriculum = [
        {
          id: 's1',
          title: 'Course Content',
          lessons: data.lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.type as any,
            isCompleted: false,
            isLocked: false,
          })),
        }
      ];
    }
    return course;
  },

  async getEnrolledCourses(userId: string): Promise<{ course: Course; enrollment: Enrollment }[]> {
    console.log('[CoursesService] Fetching enrolled courses from backend for User:', userId);
    const data = await apiClient.get<any[]>('/classrooms/enrolled');
    return data.map((item: any) => ({
      course: mapDBCourseToFrontend(item.courses),
      enrollment: {
        courseId: item.course_id,
        userId: item.student_id,
        progress: Number(item.progress) || 0,
        completedLessons: [],
        enrolledAt: item.enrolled_at,
      },
    }));
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    const inserted = await apiClient.post<any>('/classrooms', {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      price: data.price,
      tags: data.tags,
      isPublished: data.isPublished,
      thumbnail: data.thumbnail,
    });
    return mapDBCourseToFrontend(inserted);
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const updated = await apiClient.put<any>(`/classrooms/${id}`, {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      price: data.price,
      tags: data.tags,
      isPublished: data.isPublished,
    });
    return mapDBCourseToFrontend(updated);
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/classrooms/${id}`);
  },

  async enrollCourse(courseId: string, studentId?: string): Promise<Enrollment> {
    const data = await apiClient.post<any>(`/classrooms/${courseId}/enroll`, { studentId });
    return {
      courseId: data.course_id,
      userId: data.student_id,
      progress: Number(data.progress) || 0,
      completedLessons: [],
      enrolledAt: data.enrolled_at,
    };
  },

  async enrollStudent(courseId: string, userId: string): Promise<Enrollment> {
    return this.enrollCourse(courseId, userId);
  },

  async updateProgress(
    enrollmentIdOrCourseId: string,
    progressOrStudentId: number | string,
    maybeProgress?: number
  ): Promise<any> {
    console.log('[CoursesService] Updating progress on backend:', enrollmentIdOrCourseId);
    let progress = 0;
    let studentId: string | undefined;

    if (typeof progressOrStudentId === 'number') {
      progress = progressOrStudentId;
    } else {
      studentId = progressOrStudentId;
      progress = maybeProgress ?? 0;
    }

    return apiClient.put<any>(`/classrooms/${enrollmentIdOrCourseId}/progress`, {
      progress,
      studentId
    });
  },

  getCategories(): string[] {
    return ['All', 'Web Development', 'AI & ML', 'Design', 'Computer Science', 'Cloud & DevOps', 'Security', 'Mobile', 'Data Science'];
  }
};
