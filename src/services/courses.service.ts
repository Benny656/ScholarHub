import type { Course, Enrollment } from '../types';
import { supabase } from '../lib/supabase';

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Full-Stack Web Development Bootcamp',
    description: 'Master React, Node.js, PostgreSQL, and deployment. Build 5 real-world projects from scratch.',
    instructor: 'Dr. Sarah Chen',
    instructorId: 'u2',
    category: 'Web Development',
    level: 'Intermediate',
    duration: '48h 30m',
    lessons: 12,
    enrolled: 2847,
    rating: 4.8,
    reviews: 934,
    thumbnail: '',
    price: 89,
    tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    curriculum: [
      {
        id: 's1',
        title: 'Getting Started',
        lessons: [
          { id: 'l1', title: 'Course Overview', type: 'video', duration: '5:30', isCompleted: true },
          { id: 'l2', title: 'Setting Up Environment', type: 'video', duration: '12:00', isCompleted: true },
          { id: 'l3', title: 'HTML & CSS Fundamentals', type: 'video', duration: '25:00', isCompleted: false },
        ],
      },
    ],
    outcomes: ['Build production-ready web apps', 'Master React ecosystem', 'Deploy to cloud'],
    requirements: ['Basic JavaScript knowledge', 'Computer with internet access'],
    isPublished: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'c2',
    title: 'Machine Learning Fundamentals',
    description: 'Learn ML algorithms from scratch. Python, scikit-learn, TensorFlow, and real datasets.',
    instructor: 'Prof. Raj Patel',
    instructorId: 'u4',
    category: 'AI & ML',
    level: 'Intermediate',
    duration: '36h 15m',
    lessons: 89,
    enrolled: 1923,
    rating: 4.7,
    reviews: 612,
    thumbnail: '',
    price: 99,
    tags: ['Python', 'TensorFlow', 'scikit-learn', 'Data Science'],
    curriculum: [],
    outcomes: ['Implement ML algorithms', 'Build neural networks', 'Deploy ML models'],
    requirements: ['Python basics', 'Linear algebra fundamentals'],
    isPublished: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
  },
  {
    id: 'c3',
    title: 'UI/UX Design Masterclass',
    description: 'Create stunning interfaces. Figma, design systems, user research, and prototyping.',
    instructor: 'Emma Lawson',
    instructorId: 'u5',
    category: 'Design',
    level: 'Beginner',
    duration: '28h 00m',
    lessons: 72,
    enrolled: 3104,
    rating: 4.9,
    reviews: 1241,
    thumbnail: '',
    price: 69,
    tags: ['Figma', 'Design Systems', 'UX Research', 'Prototyping'],
    curriculum: [],
    outcomes: ['Design pixel-perfect UIs', 'Conduct user research', 'Build design systems'],
    requirements: ['No prior experience needed'],
    isPublished: true,
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-06-10T00:00:00Z',
  },
];

export const MOCK_ENROLLMENTS: Record<string, Enrollment[]> = {
  u1: [
    { courseId: 'c1', userId: 'u1', progress: 68, completedLessons: ['l1', 'l2'], enrolledAt: '2024-01-20T00:00:00Z', lastAccessed: '2024-06-07T10:00:00Z' },
  ],
};

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
    curriculum: [], // populate on demand or via lessons fetch
    outcomes: [],
    requirements: [],
    isPublished: dbCourse.is_published ?? false,
    createdAt: dbCourse.created_at,
    updatedAt: dbCourse.created_at,
  };
}

export const coursesService = {
  async getCourses(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    try {
      let query = supabase
        .from('courses')
        .select('*, users(name, avatar_url)');

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
      
      if (!data || data.length === 0) {
        // Fallback to mock catalog
        return this.getMockCatalog(filters);
      }

      return data.map(mapDBCourseToFrontend);
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to mock courses:', err);
      return this.getMockCatalog(filters);
    }
  },

  // Keep compatibility with CourseCatalog.tsx
  async getCatalog(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    return this.getCourses(filters);
  },

  async getCourseById(id: string): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, users(name, avatar_url)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Fetch lessons for curriculum
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      const course = mapDBCourseToFrontend(data);
      if (lessonsData) {
        course.lessons = lessonsData.length;
        course.curriculum = [
          {
            id: 's1',
            title: 'Course Content',
            lessons: lessonsData.map(l => ({
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
    } catch (err) {
      console.warn('Supabase getCourseById failed, falling back to mock:', err);
      const mock = MOCK_COURSES.find(c => c.id === id);
      if (!mock) throw new Error('Course not found');
      return mock;
    }
  },

  async getEnrolledCourses(userId: string): Promise<{ course: Course; enrollment: Enrollment }[]> {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, courses(*, users(name, avatar_url))')
        .eq('student_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return this.getMockEnrolled(userId);
      }

      return data.map(item => ({
        course: mapDBCourseToFrontend(item.courses),
        enrollment: {
          courseId: item.course_id,
          userId: item.student_id,
          progress: Number(item.progress) || 0,
          completedLessons: [],
          enrolledAt: item.enrolled_at,
        },
      }));
    } catch (err) {
      console.warn('Supabase getEnrolledCourses failed, falling back to mock:', err);
      return this.getMockEnrolled(userId);
    }
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
        duration_hours: 10, // default
        thumbnail_url: data.thumbnail || '',
      })
      .select('*, users(name, avatar_url)')
      .single();

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
      .single();

    if (error) throw error;
    return mapDBCourseToFrontend(updated);
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },

  async enrollCourse(courseId: string, studentId: string): Promise<Enrollment> {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        course_id: courseId,
        student_id: studentId,
        progress: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      courseId: data.course_id,
      userId: data.student_id,
      progress: Number(data.progress) || 0,
      completedLessons: [],
      enrolledAt: data.enrolled_at,
    };
  },

  // Alias for legacy enrollStudent method
  async enrollStudent(courseId: string, userId: string): Promise<Enrollment> {
    return this.enrollCourse(courseId, userId);
  },

  async updateProgress(courseId: string, studentId: string, progress: number): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .update({ progress })
      .eq('course_id', courseId)
      .eq('student_id', studentId);

    if (error) throw error;
  },

  getCategories(): string[] {
    return ['All', 'Web Development', 'AI & ML', 'Design', 'Computer Science', 'Cloud & DevOps', 'Security', 'Mobile', 'Data Science'];
  },

  // Private helpers for mock fallbacks
  getMockCatalog(filters?: { category?: string; level?: string; search?: string }): Course[] {
    let courses = [...MOCK_COURSES];
    if (filters?.category && filters.category !== 'All') {
      courses = courses.filter(c => c.category === filters.category);
    }
    if (filters?.level && filters.level !== 'All') {
      courses = courses.filter(c => c.level === filters.level);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return courses;
  },

  getMockEnrolled(userId: string): { course: Course; enrollment: Enrollment }[] {
    const enrollments = MOCK_ENROLLMENTS[userId] || [];
    return enrollments.map(e => ({
      course: MOCK_COURSES.find(c => c.id === e.courseId)!,
      enrollment: e,
    })).filter(item => item.course);
  }
};
