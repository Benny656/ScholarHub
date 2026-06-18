// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'teacher' | 'admin';
export type TeacherTrack = 'college' | 'k12';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  phone?: string;
  institution?: string;
  createdAt: string;
  updatedAt?: string;
  // Student-specific
  studentId?: string;
  gradeLevel?: string;
  enrolledCourses?: string[];
  // Teacher-specific
  teacherId?: string;
  department?: string;
  expertise?: string[];
  teacherTrack?: TeacherTrack;
  // Admin-specific
  permissions?: string[];
  status?: 'active' | 'suspended';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Courses ─────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  instructorAvatar?: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  reviews: number;
  thumbnail?: string;
  price: number;
  tags: string[];
  curriculum: CurriculumSection[];
  outcomes: string[];
  requirements: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'assignment';
  duration?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface Enrollment {
  courseId: string;
  userId: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  lastAccessed?: string;
}

// ─── Assignments ──────────────────────────────────────────────────────────────
export type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue';
export type AssignmentPriority = 'low' | 'medium' | 'high';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  maxScore: number;
  score?: number;
  feedback?: string;
  files?: string[];
  submittedAt?: string;
  type: 'text' | 'file' | 'quiz';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  assignmentId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  attempts: number;
  maxAttempts: number;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: 'qr' | 'manual' | 'auto';
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
}

export interface Conversation {
  id: string;
  participants: { id: string; name: string; avatar?: string }[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'direct' | 'group' | 'course';
  name?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  courseId?: string;
  courseName?: string;
  createdAt: string;
  pinned: boolean;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface GradeData {
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
}

export interface ProgressData {
  week: string;
  hoursSpent: number;
  lessonsCompleted: number;
  score: number;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  revenue: number;
  completionRate: number;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
export type EventType = 'class' | 'exam' | 'assignment' | 'deadline' | 'event' | 'meeting' | 'holiday';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: EventType;
  courseId?: string;
  courseName?: string;
  description?: string;
  location?: string;
}

// ─── Certificates ─────────────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  verificationCode: string;
  instructorName: string;
  grade?: string;
  pdfUrl?: string;
}

// ─── Classroom ────────────────────────────────────────────────────────────────
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
  role: 'host' | 'participant';
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  link?: string;
}
