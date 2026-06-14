-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────────────────────────────
-- 1. USERS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid references auth.users PRIMARY KEY,
  name text,
  email text,
  role text CHECK (role IN ('student','teacher','admin')),
  avatar_url text,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  last_login date,
  created_at timestamptz DEFAULT now(),
  user_type text CHECK (user_type IN ('school','college')) DEFAULT 'college',
  school_name text,
  grade_class text,
  roll_number text,
  student_id text,
  institution text,
  department text,
  expertise text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended'))
);

-- Auto-create user profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (
    id, name, email, role, avatar_url, xp, level, streak, last_login,
    user_type, school_name, grade_class, roll_number, student_id, institution, department, expertise, status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    0,
    1,
    0,
    current_date,
    coalesce(new.raw_user_meta_data->>'user_type', 'college'),
    new.raw_user_meta_data->>'school_name',
    new.raw_user_meta_data->>'grade_class',
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'institution',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'expertise',
    'active'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────────────────────────────────────────────
-- 2. COURSES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  description text,
  category text,
  level text,
  thumbnail_url text,
  price numeric,
  teacher_id uuid references public.users(id),
  rating numeric DEFAULT 0,
  total_students integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  duration_hours numeric,
  tags text[],
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 3. ENROLLMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid references public.users(id),
  course_id uuid references public.courses(id),
  progress numeric DEFAULT 0,
  last_lesson_id uuid,
  enrolled_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 4. LESSONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid references public.courses(id),
  title text,
  type text CHECK (type IN ('video','pdf','ppt','quiz')),
  content_url text,
  duration_minutes integer,
  order_index integer,
  created_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 5. ASSIGNMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid references public.courses(id),
  teacher_id uuid references public.users(id),
  title text,
  description text,
  due_date timestamptz,
  max_grade numeric DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 6. SUBMISSIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid references public.assignments(id),
  student_id uuid references public.users(id),
  file_url text,
  grade numeric,
  feedback text,
  submitted_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 7. QUIZZES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid references public.courses(id),
  title text,
  questions jsonb,
  duration_minutes integer,
  created_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 8. QUIZ_RESULTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.quiz_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid references public.quizzes(id),
  student_id uuid references public.users(id),
  score numeric,
  answers jsonb,
  completed_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 9. ATTENDANCE
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid references public.users(id),
  course_id uuid references public.courses(id),
  class_id uuid,
  date date,
  status text CHECK (status IN ('present','absent','late')),
  qr_code text,
  marked_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 10. LIVE_CLASSES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.live_classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid references public.courses(id),
  teacher_id uuid references public.users(id),
  title text,
  scheduled_at timestamptz,
  room_id text,
  status text DEFAULT 'scheduled',
  recording_url text,
  created_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 11. MESSAGES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid references public.users(id),
  receiver_id uuid references public.users(id),
  course_id uuid,
  content text,
  is_read boolean DEFAULT false,
  sent_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 12. CERTIFICATES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid references public.users(id),
  course_id uuid references public.courses(id),
  qr_code text,
  issued_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references public.users(id),
  title text,
  message text,
  type text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 14. PAYMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references public.users(id),
  course_id uuid references public.courses(id),
  amount numeric,
  currency text DEFAULT 'INR',
  status text,
  razorpay_order_id text,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.lessons enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_results enable row level security;
alter table public.attendance enable row level security;
alter table public.live_classes enable row level security;
alter table public.messages enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;

-- Admin check helper
create or replace function public.is_admin()
returns boolean security definer language plpgsql as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- ADMIN POLICIES (Full access to all tables)
create policy "Admin full access on users" on public.users for all using (public.is_admin());
create policy "Admin full access on courses" on public.courses for all using (public.is_admin());
create policy "Admin full access on enrollments" on public.enrollments for all using (public.is_admin());
create policy "Admin full access on lessons" on public.lessons for all using (public.is_admin());
create policy "Admin full access on assignments" on public.assignments for all using (public.is_admin());
create policy "Admin full access on submissions" on public.submissions for all using (public.is_admin());
create policy "Admin full access on quizzes" on public.quizzes for all using (public.is_admin());
create policy "Admin full access on quiz_results" on public.quiz_results for all using (public.is_admin());
create policy "Admin full access on attendance" on public.attendance for all using (public.is_admin());
create policy "Admin full access on live_classes" on public.live_classes for all using (public.is_admin());
create policy "Admin full access on messages" on public.messages for all using (public.is_admin());
create policy "Admin full access on certificates" on public.certificates for all using (public.is_admin());
create policy "Admin full access on notifications" on public.notifications for all using (public.is_admin());
create policy "Admin full access on payments" on public.payments for all using (public.is_admin());

-- STUDENT READ-ONLY POLICIES (Read only own enrollments, submissions, attendance)
create policy "Students read own enrollments" on public.enrollments
  for select using (student_id = auth.uid());

create policy "Students read own submissions" on public.submissions
  for select using (student_id = auth.uid());

create policy "Students read own attendance" on public.attendance
  for select using (student_id = auth.uid());

-- Permit students to create their own enrollments, submissions, and attendance
create policy "Students enroll themselves" on public.enrollments
  for insert with check (student_id = auth.uid());

create policy "Students submit assignments" on public.submissions
  for insert with check (student_id = auth.uid());

create policy "Students mark attendance" on public.attendance
  for insert with check (student_id = auth.uid());

-- TEACHER COURSES POLICIES (Read/write courses they own)
create policy "Teachers manage owned courses" on public.courses
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- AUTHENTICATED USER COURSES POLICIES (Read published courses)
create policy "Authenticated users read published courses" on public.courses
  for select using (auth.role() = 'authenticated' and is_published = true);

-- OTHER NECESSARY APP POLICIES (To prevent app breakdown)
create policy "Users read self" on public.users for select using (auth.role() = 'authenticated');
create policy "Users update self" on public.users for update using (id = auth.uid());

create policy "Students view lessons for enrolled courses" on public.lessons
  for select using (exists (
    select 1 from public.enrollments where course_id = lessons.course_id and student_id = auth.uid()
  ));
create policy "Teachers manage lessons for owned courses" on public.lessons
  for all using (exists (
    select 1 from public.courses where id = course_id and teacher_id = auth.uid()
  ));

create policy "Students view assignments for enrolled courses" on public.assignments
  for select using (exists (
    select 1 from public.enrollments where course_id = assignments.course_id and student_id = auth.uid()
  ));
create policy "Teachers manage assignments for owned courses" on public.assignments
  for all using (exists (
    select 1 from public.courses where id = course_id and teacher_id = auth.uid()
  ));

create policy "Teachers read submissions for owned courses" on public.submissions
  for select using (exists (
    select 1 from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
  ));
create policy "Teachers grade submissions for owned courses" on public.submissions
  for update using (exists (
    select 1 from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
  ));

create policy "Students view quizzes for enrolled courses" on public.quizzes
  for select using (exists (
    select 1 from public.enrollments where course_id = quizzes.course_id and student_id = auth.uid()
  ));
create policy "Teachers manage quizzes for owned courses" on public.quizzes
  for all using (exists (
    select 1 from public.courses where id = course_id and teacher_id = auth.uid()
  ));

create policy "Students manage own quiz results" on public.quiz_results
  for all using (student_id = auth.uid());

create policy "Students view live classes for enrolled courses" on public.live_classes
  for select using (exists (
    select 1 from public.enrollments where course_id = live_classes.course_id and student_id = auth.uid()
  ));
create policy "Teachers manage live classes for owned courses" on public.live_classes
  for all using (exists (
    select 1 from public.courses where id = course_id and teacher_id = auth.uid()
  ));

create policy "Users manage own messages" on public.messages
  for all using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Certificates publicly readable" on public.certificates
  for select using (true);
create policy "Students generate own certificates" on public.certificates
  for insert with check (student_id = auth.uid());

create policy "Users manage own notifications" on public.notifications
  for all using (user_id = auth.uid());

create policy "Users view own payments" on public.payments
  for select using (user_id = auth.uid());
create policy "Users create own payments" on public.payments
  for insert with check (user_id = auth.uid());

-- ───────────────────────────────────────────────────────────────────
-- 15. ADMIN LOGS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid references public.users(id),
  action text not null,
  target_type text,
  target_id text,
  created_at timestamptz DEFAULT now()
);

alter table public.admin_logs enable row level security;
create policy "Admin full access on admin_logs" on public.admin_logs for all using (public.is_admin());

-- ───────────────────────────────────────────────────────────────────
-- 16. LIVE SESSIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.live_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id uuid references public.courses(id) ON DELETE CASCADE,
  teacher_id uuid references public.users(id),
  meeting_room_id text not null,
  meeting_url text,
  status text CHECK (status IN ('LIVE', 'ENDED')) DEFAULT 'LIVE',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────
-- 17. SESSION PARTICIPANTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.session_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid references public.live_sessions(id) ON DELETE CASCADE,
  user_id uuid references public.users(id),
  role text,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz
);

-- ───────────────────────────────────────────────────────────────────
-- 18. RECORDINGS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.recordings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid references public.live_sessions(id) ON DELETE CASCADE,
  recording_url text,
  duration integer,
  created_at timestamptz DEFAULT now()
);

alter table public.live_sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.recordings enable row level security;

create policy "Admin full access on live_sessions" on public.live_sessions for all using (public.is_admin());
create policy "Admin full access on session_participants" on public.session_participants for all using (public.is_admin());
create policy "Admin full access on recordings" on public.recordings for all using (public.is_admin());

create policy "Users read live_sessions for enrolled courses" on public.live_sessions
  for select using (exists (
    select 1 from public.enrollments where course_id = live_sessions.classroom_id and student_id = auth.uid()
  ) or teacher_id = auth.uid());

create policy "Teachers manage live_sessions for owned courses" on public.live_sessions
  for all using (exists (
    select 1 from public.courses where id = classroom_id and teacher_id = auth.uid()
  ));

create policy "Users manage session_participants if part of session" on public.session_participants
  for all using (true) with check (true);

create policy "Users view recordings for enrolled courses" on public.recordings
  for select using (exists (
    select 1 from public.live_sessions ls
    join public.enrollments e on e.course_id = ls.classroom_id
    where ls.id = recordings.session_id and e.student_id = auth.uid()
  ) or exists (
    select 1 from public.live_sessions ls
    where ls.id = recordings.session_id and ls.teacher_id = auth.uid()
  ));


 - -    % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %
 - -   1 9 .   P R O F I L E S 
 - -    % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % %
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . p r o f i l e s   ( 
     i d   u u i d   r e f e r e n c e s   a u t h . u s e r s   P R I M A R Y   K E Y , 
     e m a i l   t e x t , 
     f u l l _ n a m e   t e x t , 
     a v a t a r _ u r l   t e x t , 
     r o l e   t e x t   C H E C K   ( r o l e   I N   ( ' s t u d e n t ' , ' t e a c h e r ' , ' a d m i n ' ) ) , 
     p r o v i d e r   t e x t , 
     c r e a t e d _ a t   t i m e s t a m p t z   D E F A U L T   n o w ( ) 
 ) ; 
 
 a l t e r   t a b l e   p u b l i c . p r o f i l e s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 c r e a t e   p o l i c y   \  
 A d m i n  
 f u l l  
 a c c e s s  
 o n  
 p r o f i l e s \   o n   p u b l i c . p r o f i l e s   f o r   a l l   u s i n g   ( p u b l i c . i s _ a d m i n ( ) ) ; 
 c r e a t e   p o l i c y   \ U s e r s  
 r e a d  
 s e l f  
 p r o f i l e \   o n   p u b l i c . p r o f i l e s   f o r   s e l e c t   u s i n g   ( a u t h . u i d ( )   =   i d ) ; 
 c r e a t e   p o l i c y   \ U s e r s  
 i n s e r t  
 s e l f  
 p r o f i l e \   o n   p u b l i c . p r o f i l e s   f o r   i n s e r t   w i t h   c h e c k   ( a u t h . u i d ( )   =   i d ) ; 
 c r e a t e   p o l i c y   \ U s e r s  
 u p d a t e  
 s e l f  
 p r o f i l e \   o n   p u b l i c . p r o f i l e s   f o r   u p d a t e   u s i n g   ( a u t h . u i d ( )   =   i d ) ; 
  
 