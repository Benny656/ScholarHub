// Auto-generated Supabase database types for ScholarHub
// Matches schema in supabase/schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: 'student' | 'teacher' | 'admin';
          bio: string | null;
          phone: string | null;
          student_id: string | null;
          institution: string | null;
          grade_level: string | null;
          teacher_id: string | null;
          department: string | null;
          expertise: string[] | null;
          rating: number | null;
          total_students: number | null;
          website: string | null;
          linkedin_url: string | null;
          twitter_url: string | null;
          timezone: string | null;
          language: string | null;
          theme: string | null;
          email_notifications: boolean | null;
          push_notifications: boolean | null;
          two_factor_enabled: boolean | null;
          is_verified: boolean | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      courses: {
        Row: {
          id: string;
          instructor_id: string;
          title: string;
          slug: string | null;
          description: string | null;
          short_description: string | null;
          thumbnail_url: string | null;
          preview_video_url: string | null;
          category: string;
          subcategory: string | null;
          level: 'Beginner' | 'Intermediate' | 'Advanced';
          language: string | null;
          tags: string[];
          outcomes: string[];
          requirements: string[];
          price: number;
          original_price: number | null;
          is_free: boolean;
          is_published: boolean;
          is_featured: boolean;
          duration_minutes: number;
          total_lessons: number;
          total_enrolled: number;
          avg_rating: number;
          total_reviews: number;
          completion_rate: number;
          certificate_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_enrolled' | 'avg_rating' | 'total_reviews'>;
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
      };
      course_sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          position: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['course_sections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['course_sections']['Insert']>;
      };
      lessons: {
        Row: {
          id: string;
          section_id: string;
          course_id: string;
          title: string;
          type: 'video' | 'pdf' | 'quiz' | 'assignment' | 'text' | 'embed';
          content_url: string | null;
          content_text: string | null;
          duration_seconds: number;
          position: number;
          is_preview: boolean;
          is_locked: boolean;
          transcript: string | null;
          resources: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          enrolled_at: string;
          last_accessed: string;
          progress_pct: number;
          completed_at: string | null;
          is_active: boolean;
          payment_status: 'free' | 'paid' | 'refunded';
          amount_paid: number;
        };
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'enrolled_at'>;
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>;
      };
      lesson_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          course_id: string;
          is_completed: boolean;
          watch_time_seconds: number;
          last_position_seconds: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lesson_progress']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lesson_progress']['Insert']>;
      };
      assignments: {
        Row: {
          id: string;
          course_id: string | null;
          created_by: string;
          title: string;
          description: string | null;
          type: 'assignment' | 'quiz' | 'project' | 'peer_review';
          instructions: string | null;
          resources: Json;
          due_date: string | null;
          max_score: number;
          passing_score: number;
          time_limit_mins: number | null;
          attempts_allowed: number;
          is_published: boolean;
          ai_grading: boolean;
          rubric: Json;
          questions: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assignments']['Insert']>;
      };
      assignment_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          submitted_at: string;
          content_text: string | null;
          file_urls: string[];
          score: number | null;
          max_score: number | null;
          grade: string | null;
          status: 'draft' | 'submitted' | 'grading' | 'graded' | 'returned';
          feedback_text: string | null;
          ai_feedback: Json | null;
          graded_by: string | null;
          graded_at: string | null;
          attempt_number: number;
          is_late: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assignment_submissions']['Row'], 'id' | 'submitted_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assignment_submissions']['Insert']>;
      };
      live_sessions: {
        Row: {
          id: string;
          course_id: string | null;
          host_id: string;
          title: string;
          description: string | null;
          scheduled_at: string;
          started_at: string | null;
          ended_at: string | null;
          status: 'scheduled' | 'live' | 'ended' | 'cancelled';
          room_id: string;
          recording_url: string | null;
          max_participants: number;
          allow_recording: boolean;
          enable_chat: boolean;
          enable_whiteboard: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['live_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['live_sessions']['Insert']>;
      };
      attendance: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          joined_at: string;
          left_at: string | null;
          duration_mins: number;
          status: 'present' | 'absent' | 'late' | 'excused';
          qr_verified: boolean;
          ip_address: string | null;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          type: 'dm' | 'group' | 'course_group';
          name: string | null;
          avatar_url: string | null;
          course_id: string | null;
          created_by: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          type: 'text' | 'file' | 'image' | 'system';
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          reply_to_id: string | null;
          is_edited: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      certificates: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          issued_at: string;
          verification_code: string;
          grade: string | null;
          score: number | null;
          pdf_url: string | null;
          is_valid: boolean;
          revoked_at: string | null;
          revoke_reason: string | null;
        };
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'issued_at'>;
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'grade' | 'message' | 'announcement' | 'assignment' | 'class' | 'achievement' | 'system';
          title: string;
          body: string;
          link: string | null;
          is_read: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          rating: number;
          title: string | null;
          body: string | null;
          helpful_count: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      ai_chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          context: string | null;
          messages: Json;
          title: string | null;
          model: string;
          tokens_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_chat_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ai_chat_sessions']['Insert']>;
      };
    };
    Views: {
      student_courses: {
        Row: {
          student_id: string;
          course_id: string;
          title: string;
          thumbnail_url: string | null;
          level: string;
          category: string;
          total_lessons: number;
          instructor_name: string;
          progress_pct: number;
          enrolled_at: string;
          last_accessed: string;
          completed_at: string | null;
        };
      };
      course_detail: {
        Row: Database['public']['Tables']['courses']['Row'] & {
          instructor_name: string;
          instructor_avatar: string | null;
          instructor_bio: string | null;
          instructor_rating: number | null;
          instructor_students: number | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
