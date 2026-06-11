import type { Course, Enrollment } from '../types';
import { supabase } from '../lib/supabase';

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

export const coursesService = {
  async getCourses(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select('*, users(name, avatar_url)') as any;

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters?.level && filters.level !== 'All') {
      query = query.eq('level', filters.level);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data) return [];

    return data.map(mapDBCourseToFrontend);
  },

  async getCatalog(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    return this.getCourses(filters);
  },

  async getCourseById(id: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select('*, users(name, avatar_url)')
      .eq('id', id)
      .single() as any;

    if (error) throw error;
    
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('order_index') as any;

    const course = mapDBCourseToFrontend(data);
    if (lessonsData) {
      course.lessons = lessonsData.length;
      course.curriculum = [
        {
          id: 's1',
          title: 'Course Content',
          lessons: lessonsData.map((l: any) => ({
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
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, courses(*, users(name, avatar_url))')
      .eq('student_id', userId) as any;

    if (error) throw error;
    if (!data) return [];

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
    const { data: { user } } = await supabase.auth.getUser();
    const { data: inserted, error } = await supabase
      .from('courses')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        price: data.price,
        teacher_id: user?.id || data.instructorId,
        tags: data.tags,
        is_published: data.isPublished || false,
        duration_hours: 10,
        thumbnail_url: data.thumbnail || '',
      })
      .select('*, users(name, avatar_url)')
      .single() as any;

    if (error) throw error;
    return mapDBCourseToFrontend(inserted);
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const { data: updated, error } = await supabase
      .from('courses')
      .update({
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        price: data.price,
        tags: data.tags,
        is_published: data.isPublished,
      })
      .eq('id', id)
      .select('*, users(name, avatar_url)')
      .single() as any;

    if (error) throw error;
    return mapDBCourseToFrontend(updated);
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },

  async enrollCourse(courseId: string, studentId?: string): Promise<Enrollment> {
    let sId = studentId;
    if (!sId) {
      const { data: { user } } = await supabase.auth.getUser();
      sId = user?.id;
    }
    if (!sId) throw new Error('Unauthenticated');

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        course_id: courseId,
        student_id: sId,
        progress: 0,
      })
      .select()
      .single() as any;

    if (error) throw error;

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
    if (typeof progressOrStudentId === 'number') {
      const { data, error } = await supabase
        .from('enrollments')
        .update({ progress: progressOrStudentId })
        .eq('id', enrollmentIdOrCourseId)
        .select()
        .single() as any;
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('enrollments')
        .update({ progress: maybeProgress ?? 0 })
        .eq('course_id', enrollmentIdOrCourseId)
        .eq('student_id', progressOrStudentId)
        .select()
        .single() as any;
      if (error) throw error;
      return data;
    }
  },

  getCategories(): string[] {
    return ['All', 'Web Development', 'AI & ML', 'Design', 'Computer Science', 'Cloud & DevOps', 'Security', 'Mobile', 'Data Science'];
  }
};
