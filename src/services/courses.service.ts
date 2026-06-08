import type { Course, Enrollment } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    lessons: 124,
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
      {
        id: 's2',
        title: 'React Fundamentals',
        lessons: [
          { id: 'l4', title: 'React Basics', type: 'video', duration: '20:00', isCompleted: false, isLocked: false },
          { id: 'l5', title: 'Hooks Deep Dive', type: 'video', duration: '35:00', isCompleted: false, isLocked: true },
          { id: 'l6', title: 'React Quiz', type: 'quiz', isCompleted: false, isLocked: true },
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
    curriculum: [
      {
        id: 's3',
        title: 'ML Basics',
        lessons: [
          { id: 'l7', title: 'What is ML?', type: 'video', duration: '8:00', isCompleted: true },
          { id: 'l8', title: 'Python for ML', type: 'video', duration: '30:00', isCompleted: false },
        ],
      },
    ],
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
    curriculum: [
      {
        id: 's4',
        title: 'Design Foundations',
        lessons: [
          { id: 'l9', title: 'Color Theory', type: 'video', duration: '15:00', isCompleted: true },
          { id: 'l10', title: 'Typography', type: 'video', duration: '12:00', isCompleted: true },
          { id: 'l11', title: 'Figma Basics', type: 'pdf', isCompleted: false },
        ],
      },
    ],
    outcomes: ['Design pixel-perfect UIs', 'Conduct user research', 'Build design systems'],
    requirements: ['No prior experience needed'],
    isPublished: true,
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-06-10T00:00:00Z',
  },
  {
    id: 'c4',
    title: 'Data Structures & Algorithms',
    description: 'Ace technical interviews. Arrays, trees, graphs, dynamic programming, and 200+ problems.',
    instructor: 'Dr. Sarah Chen',
    instructorId: 'u2',
    category: 'Computer Science',
    level: 'Advanced',
    duration: '52h 00m',
    lessons: 148,
    enrolled: 4521,
    rating: 4.6,
    reviews: 2134,
    thumbnail: '',
    price: 79,
    tags: ['Algorithms', 'LeetCode', 'Python', 'JavaScript'],
    curriculum: [],
    outcomes: ['Solve complex algorithmic problems', 'Pass FAANG interviews'],
    requirements: ['Programming basics in any language'],
    isPublished: true,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-06-05T00:00:00Z',
  },
  {
    id: 'c5',
    title: 'Cloud Computing with AWS',
    description: 'AWS Solutions Architect prep. EC2, S3, Lambda, RDS, and DevOps pipelines.',
    instructor: 'James Park',
    instructorId: 'u6',
    category: 'Cloud & DevOps',
    level: 'Intermediate',
    duration: '40h 00m',
    lessons: 102,
    enrolled: 1678,
    rating: 4.5,
    reviews: 445,
    thumbnail: '',
    price: 119,
    tags: ['AWS', 'DevOps', 'Docker', 'Kubernetes'],
    curriculum: [],
    outcomes: ['Architect cloud solutions', 'Pass AWS certifications'],
    requirements: ['Basic networking knowledge'],
    isPublished: true,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-06-08T00:00:00Z',
  },
  {
    id: 'c6',
    title: 'Cybersecurity Fundamentals',
    description: 'Ethical hacking, penetration testing, network security, and OWASP Top 10.',
    instructor: 'Lisa Morgan',
    instructorId: 'u7',
    category: 'Security',
    level: 'Beginner',
    duration: '32h 00m',
    lessons: 85,
    enrolled: 2290,
    rating: 4.7,
    reviews: 876,
    thumbnail: '',
    price: 89,
    tags: ['Security', 'Ethical Hacking', 'Networking', 'OWASP'],
    curriculum: [],
    outcomes: ['Identify security vulnerabilities', 'Perform penetration testing'],
    requirements: ['Basic computer knowledge'],
    isPublished: true,
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-06-12T00:00:00Z',
  },
];

export const MOCK_ENROLLMENTS: Record<string, Enrollment[]> = {
  u1: [
    { courseId: 'c1', userId: 'u1', progress: 68, completedLessons: ['l1', 'l2', 'l7', 'l9', 'l10'], enrolledAt: '2024-01-20T00:00:00Z', lastAccessed: '2024-06-07T10:00:00Z' },
    { courseId: 'c2', userId: 'u1', progress: 34, completedLessons: ['l7'], enrolledAt: '2024-02-15T00:00:00Z', lastAccessed: '2024-06-05T10:00:00Z' },
    { courseId: 'c3', userId: 'u1', progress: 91, completedLessons: ['l9', 'l10'], enrolledAt: '2024-03-10T00:00:00Z', lastAccessed: '2024-06-06T10:00:00Z' },
  ],
};

export const coursesService = {
  async getCatalog(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    await delay(600);
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
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    // In real app: GET /api/courses?category=...&level=...&search=...
    return courses;
  },

  async getCourseById(id: string): Promise<Course> {
    await delay(400);
    const course = MOCK_COURSES.find(c => c.id === id);
    if (!course) throw new Error('Course not found');
    return course;
  },

  async getEnrolledCourses(userId: string): Promise<{ course: Course; enrollment: Enrollment }[]> {
    await delay(500);
    const enrollments = MOCK_ENROLLMENTS[userId] || [];
    return enrollments.map(e => ({
      course: MOCK_COURSES.find(c => c.id === e.courseId)!,
      enrollment: e,
    })).filter(item => item.course);
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    await delay(800);
    const newCourse: Course = {
      id: `c-${Date.now()}`,
      title: data.title || 'Untitled Course',
      description: data.description || '',
      instructor: data.instructor || '',
      instructorId: data.instructorId || '',
      category: data.category || 'General',
      level: data.level || 'Beginner',
      duration: data.duration || '0h',
      lessons: 0,
      enrolled: 0,
      rating: 0,
      reviews: 0,
      price: data.price || 0,
      tags: data.tags || [],
      curriculum: data.curriculum || [],
      outcomes: data.outcomes || [],
      requirements: data.requirements || [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // In real app: POST /api/courses
    return newCourse;
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    await delay(600);
    const course = MOCK_COURSES.find(c => c.id === id);
    if (!course) throw new Error('Course not found');
    // In real app: PUT /api/courses/:id
    return { ...course, ...data, updatedAt: new Date().toISOString() };
  },

  async deleteCourse(id: string): Promise<void> {
    await delay(500);
    // In real app: DELETE /api/courses/:id
  },

  async enrollStudent(courseId: string, userId: string): Promise<Enrollment> {
    await delay(500);
    const enrollment: Enrollment = {
      courseId,
      userId,
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date().toISOString(),
    };
    // In real app: POST /api/courses/:id/enroll
    return enrollment;
  },

  getCategories(): string[] {
    return ['All', 'Web Development', 'AI & ML', 'Design', 'Computer Science', 'Cloud & DevOps', 'Security', 'Mobile', 'Data Science'];
  },
};
