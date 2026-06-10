-- ═══════════════════════════════════════════════════════════════════
--  ScholarHub — Complete Database Schema (Revamped)
--  Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────────────────────────────
-- 1. USERS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  role        text check (role in ('student','teacher','admin')),
  avatar_url  text,
  xp          integer default 0,
  level       integer default 1,
  streak      integer default 0,
  last_login  date,
  created_at  timestamptz default now()
);

-- Auto-create user on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, role, avatar_url, xp, level, streak, last_login)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    0,
    1,
    0,
    current_date
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
  id              uuid default gen_random_uuid() primary key,
  title           text,
  description     text,
  category        text,
  level           text,
  thumbnail_url   text,
  price           numeric,
  teacher_id      uuid references public.users(id) on delete cascade,
  rating          numeric default 0,
  total_students  integer default 0,
  total_lessons   integer default 0,
  duration_hours  numeric,
  tags            text[],
  is_published    boolean default false,
  created_at      timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 3. ENROLLMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id              uuid default gen_random_uuid() primary key,
  student_id      uuid references public.users(id) on delete cascade,
  course_id       uuid references public.courses(id) on delete cascade,
  progress        numeric default 0,
  last_lesson_id  uuid,
  enrolled_at     timestamptz default now(),
  unique (student_id, course_id)
);

-- ───────────────────────────────────────────────────────────────────
-- 4. LESSONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.lessons (
  id                uuid default gen_random_uuid() primary key,
  course_id         uuid references public.courses(id) on delete cascade,
  title             text,
  type              text check (type in ('video','pdf','ppt','quiz')),
  content_url       text,
  duration_minutes  integer,
  order_index       integer,
  created_at        timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 5. ASSIGNMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.assignments (
  id            uuid default gen_random_uuid() primary key,
  course_id     uuid references public.courses(id) on delete cascade,
  teacher_id    uuid references public.users(id) on delete cascade,
  title         text,
  description   text,
  due_date      timestamptz,
  max_grade     numeric default 100,
  created_at    timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 6. SUBMISSIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.submissions (
  id              uuid default gen_random_uuid() primary key,
  assignment_id   uuid references public.assignments(id) on delete cascade,
  student_id      uuid references public.users(id) on delete cascade,
  file_url        text,
  grade           numeric,
  feedback        text,
  submitted_at    timestamptz default now(),
  unique (assignment_id, student_id)
);

-- ───────────────────────────────────────────────────────────────────
-- 7. QUIZZES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.quizzes (
  id                uuid default gen_random_uuid() primary key,
  course_id         uuid references public.courses(id) on delete cascade,
  title             text,
  questions         jsonb,
  duration_minutes  integer,
  created_at        timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 8. QUIZ_RESULTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.quiz_results (
  id            uuid default gen_random_uuid() primary key,
  quiz_id       uuid references public.quizzes(id) on delete cascade,
  student_id    uuid references public.users(id) on delete cascade,
  score         numeric,
  answers       jsonb,
  completed_at  timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 9. ATTENDANCE
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.attendance (
  id          uuid default gen_random_uuid() primary key,
  student_id  uuid references public.users(id) on delete cascade,
  course_id   uuid references public.courses(id) on delete cascade,
  class_id    uuid,
  date        date,
  status      text check (status in ('present','absent','late')),
  qr_code     text,
  marked_at   timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 10. LIVE_CLASSES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.live_classes (
  id             uuid default gen_random_uuid() primary key,
  course_id      uuid references public.courses(id) on delete cascade,
  teacher_id     uuid references public.users(id) on delete cascade,
  title          text,
  scheduled_at   timestamptz,
  room_id        text,
  status         text default 'scheduled',
  recording_url  text,
  created_at     timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 11. MESSAGES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id          uuid default gen_random_uuid() primary key,
  sender_id   uuid references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  course_id   uuid,
  content     text,
  is_read     boolean default false,
  sent_at     timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 12. CERTIFICATES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.certificates (
  id          uuid default gen_random_uuid() primary key,
  student_id  uuid references public.users(id) on delete cascade,
  course_id   uuid references public.courses(id) on delete cascade,
  qr_code     text,
  issued_at   timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.users(id) on delete cascade,
  title       text,
  message     text,
  type        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 14. PAYMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                 uuid default gen_random_uuid() primary key,
  user_id            uuid references public.users(id) on delete cascade,
  course_id          uuid references public.courses(id) on delete cascade,
  amount             numeric,
  currency           text default 'INR',
  status             text,
  razorpay_order_id  text,
  created_at         timestamptz default now()
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

-- USERS POLICIES
create policy "Users are viewable by authenticated users" on public.users
  for select using (auth.role() = 'authenticated');

create policy "Users can update their own row" on public.users
  for update using (auth.uid() = id);

-- COURSES POLICIES
create policy "Anyone can read published courses" on public.courses
  for select using (is_published = true or teacher_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Teachers can insert their own courses" on public.courses
  for insert with check (teacher_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Teachers can update/delete their own courses" on public.courses
  for all using (teacher_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- ENROLLMENTS POLICIES
create policy "Students can view their own enrollments" on public.enrollments
  for select using (student_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Students can enroll themselves" on public.enrollments
  for insert with check (student_id = auth.uid());

create policy "Students can update their progress" on public.enrollments
  for update using (student_id = auth.uid());

-- LESSONS POLICIES
create policy "Students see lessons for courses they are enrolled in" on public.lessons
  for select using (exists (
    select 1 from public.enrollments where course_id = lessons.course_id and student_id = auth.uid()
  ) or exists (
    select 1 from public.courses where id = lessons.course_id and teacher_id = auth.uid()
  ) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Teachers can manage lessons for their courses" on public.lessons
  for all using (exists (
    select 1 from public.courses where id = course_id and teacher_id = auth.uid()
  ) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- ASSIGNMENTS POLICIES
create policy "Students see assignments for enrolled courses" on public.assignments
  for select using (exists (
    select 1 from public.enrollments where course_id = assignments.course_id and student_id = auth.uid()
  ) or teacher_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Teachers manage assignments" on public.assignments
  for all using (teacher_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- SUBMISSIONS POLICIES
create policy "Students only read their own submissions" on public.submissions
  for select using (student_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Students can insert their own submissions" on public.submissions
  for insert with check (student_id = auth.uid());

create policy "Teachers can view submissions for their courses" on public.submissions
  for select using (exists (
    select 1 from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
  ) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Teachers can grade submissions for their courses" on public.submissions
  for update using (exists (
    select 1 from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
  ) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- QUIZZES & RESULTS POLICIES
create policy "Students can read quizzes for enrolled courses" on public.quizzes
  for select using (exists (
    select 1 from public.enrollments where course_id = quizzes.course_id and student_id = auth.uid()
  ) or exists (
    select 1 from public.courses where id = quizzes.course_id and teacher_id = auth.uid()
  ) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Teachers manage quizzes for their courses" on public.quizzes
  for all using (exists (
    select 1 from public.courses where id = course_id and teacher_id = auth.uid()
  ) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Students can view and create quiz results" on public.quiz_results
  for all using (student_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- ATTENDANCE POLICIES
create policy "Students see their own attendance" on public.attendance
  for select using (student_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Students can mark attendance" on public.attendance
  for insert with check (student_id = auth.uid());

create policy "Teachers manage attendance for their courses" on public.attendance
  for all using (exists (
    select 1 from public.courses where id = course_id and teacher_id = auth.uid()
  ) or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- LIVE_CLASSES POLICIES
create policy "Students can view live classes if enrolled" on public.live_classes
  for select using (exists (
    select 1 from public.enrollments where course_id = live_classes.course_id and student_id = auth.uid()
  ) or teacher_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Teachers manage live classes" on public.live_classes
  for all using (teacher_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- MESSAGES POLICIES
create policy "Users can read/write their own messages" on public.messages
  for all using (sender_id = auth.uid() or receiver_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- CERTIFICATES POLICIES
create policy "Certificates are publicly viewable" on public.certificates
  for select using (true);

create policy "Students can insert their own certificates" on public.certificates
  for insert with check (student_id = auth.uid());

-- NOTIFICATIONS POLICIES
create policy "Users manage their own notifications" on public.notifications
  for all using (user_id = auth.uid());

-- PAYMENTS POLICIES
create policy "Users view their own payments" on public.payments
  for select using (user_id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Users create their own payments" on public.payments
  for insert with check (user_id = auth.uid());

-- Admin override policy for all tables
create policy "Admin manages everything" on public.users for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Enable realtime for tables that need live updates
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    public.messages,
    public.notifications,
    public.live_classes,
    public.attendance;
commit;

-- ═══════════════════════════════════════════════════════════════════
-- DONE ✅
-- Your revamped ScholarHub database schema is ready.
-- ═══════════════════════════════════════════════════════════════════
