export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Standalone flat Row types
export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'student' | 'teacher' | 'admin' | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  last_login: string | null;
  created_at: string;
};

export type CourseRow = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  level: string | null;
  thumbnail_url: string | null;
  price: number | null;
  teacher_id: string | null;
  rating: number;
  total_students: number;
  total_lessons: number;
  duration_hours: number | null;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
};

export type EnrollmentRow = {
  id: string;
  student_id: string | null;
  course_id: string | null;
  progress: number;
  last_lesson_id: string | null;
  enrolled_at: string;
};

export type LessonRow = {
  id: string;
  course_id: string | null;
  title: string | null;
  type: 'video' | 'pdf' | 'ppt' | 'quiz' | null;
  content_url: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  created_at: string;
};

export type AssignmentRow = {
  id: string;
  course_id: string | null;
  teacher_id: string | null;
  title: string | null;
  description: string | null;
  due_date: string | null;
  max_grade: number;
  created_at: string;
};

export type SubmissionRow = {
  id: string;
  assignment_id: string | null;
  student_id: string | null;
  file_url: string | null;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
};

export type QuizRow = {
  id: string;
  course_id: string | null;
  title: string | null;
  questions: any;
  duration_minutes: number | null;
  created_at: string;
};

export type QuizResultRow = {
  id: string;
  quiz_id: string | null;
  student_id: string | null;
  score: number | null;
  answers: any;
  completed_at: string;
};

export type AttendanceRow = {
  id: string;
  student_id: string | null;
  course_id: string | null;
  class_id: string | null;
  date: string | null;
  status: 'present' | 'absent' | 'late' | null;
  qr_code: string | null;
  marked_at: string;
};

export type LiveClassRow = {
  id: string;
  course_id: string | null;
  teacher_id: string | null;
  title: string | null;
  scheduled_at: string | null;
  room_id: string | null;
  status: string;
  recording_url: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  course_id: string | null;
  content: string | null;
  is_read: boolean;
  sent_at: string;
};

export type CertificateRow = {
  id: string;
  student_id: string | null;
  course_id: string | null;
  qr_code: string | null;
  issued_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  message: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  user_id: string | null;
  course_id: string | null;
  amount: number | null;
  currency: string;
  status: string | null;
  razorpay_order_id: string | null;
  created_at: string;
};

// Standalone flat Insert types
export type UserInsert = Partial<Omit<UserRow, 'created_at'>> & { id: string };
export type CourseInsert = Partial<Omit<CourseRow, 'id' | 'created_at'>>;
export type EnrollmentInsert = Partial<Omit<EnrollmentRow, 'id' | 'enrolled_at'>>;
export type LessonInsert = Partial<Omit<LessonRow, 'id' | 'created_at'>>;
export type AssignmentInsert = Partial<Omit<AssignmentRow, 'id' | 'created_at'>>;
export type SubmissionInsert = Partial<Omit<SubmissionRow, 'id' | 'submitted_at'>>;
export type QuizInsert = Partial<Omit<QuizRow, 'id' | 'created_at'>>;
export type QuizResultInsert = Partial<Omit<QuizResultRow, 'id' | 'completed_at'>>;
export type AttendanceInsert = Partial<Omit<AttendanceRow, 'id' | 'marked_at'>>;
export type LiveClassInsert = Partial<Omit<LiveClassRow, 'id' | 'created_at'>>;
export type MessageInsert = Partial<Omit<MessageRow, 'id' | 'sent_at'>>;
export type CertificateInsert = Partial<Omit<CertificateRow, 'id' | 'issued_at'>>;
export type NotificationInsert = Partial<Omit<NotificationRow, 'id' | 'created_at'>>;
export type PaymentInsert = Partial<Omit<PaymentRow, 'id' | 'created_at'>>;

// Standalone flat Update types
export type UserUpdate = Partial<UserRow>;
export type CourseUpdate = Partial<CourseRow>;
export type EnrollmentUpdate = Partial<EnrollmentRow>;
export type LessonUpdate = Partial<LessonRow>;
export type AssignmentUpdate = Partial<AssignmentRow>;
export type SubmissionUpdate = Partial<SubmissionRow>;
export type QuizUpdate = Partial<QuizRow>;
export type QuizResultUpdate = Partial<QuizResultRow>;
export type AttendanceUpdate = Partial<AttendanceRow>;
export type LiveClassUpdate = Partial<LiveClassRow>;
export type MessageUpdate = Partial<MessageRow>;
export type CertificateUpdate = Partial<CertificateRow>;
export type NotificationUpdate = Partial<NotificationRow>;
export type PaymentUpdate = Partial<PaymentRow>;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      courses: {
        Row: CourseRow;
        Insert: CourseInsert;
        Update: CourseUpdate;
        Relationships: [
          {
            foreignKeyName: "courses_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      enrollments: {
        Row: EnrollmentRow;
        Insert: EnrollmentInsert;
        Update: EnrollmentUpdate;
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      lessons: {
        Row: LessonRow;
        Insert: LessonInsert;
        Update: LessonUpdate;
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      assignments: {
        Row: AssignmentRow;
        Insert: AssignmentInsert;
        Update: AssignmentUpdate;
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      submissions: {
        Row: SubmissionRow;
        Insert: SubmissionInsert;
        Update: SubmissionUpdate;
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      quizzes: {
        Row: QuizRow;
        Insert: QuizInsert;
        Update: QuizUpdate;
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      quiz_results: {
        Row: QuizResultRow;
        Insert: QuizResultInsert;
        Update: QuizResultUpdate;
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_results_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      attendance: {
        Row: AttendanceRow;
        Insert: AttendanceInsert;
        Update: AttendanceUpdate;
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      live_classes: {
        Row: LiveClassRow;
        Insert: LiveClassInsert;
        Update: LiveClassUpdate;
        Relationships: [
          {
            foreignKeyName: "live_classes_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_classes_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: MessageUpdate;
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      certificates: {
        Row: CertificateRow;
        Insert: CertificateInsert;
        Update: CertificateUpdate;
        Relationships: [
          {
            foreignKeyName: "certificates_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
