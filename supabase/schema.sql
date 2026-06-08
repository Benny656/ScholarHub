-- ═══════════════════════════════════════════════════════════════════
--  ScholarHub — Complete Database Schema
--  Run this entire script in: Supabase Dashboard → SQL Editor → New Query
--
--  Tables created:
--   1. profiles          — extended user data beyond auth.users
--   2. courses           — course metadata
--   3. course_sections   — chapters/sections inside a course
--   4. lessons           — individual lessons within a section
--   5. enrollments       — student ↔ course membership + progress
--   6. lesson_progress   — per-lesson completion tracking
--   7. assignments       — assignments & quizzes created by teachers
--   8. assignment_submissions — student submissions + AI feedback
--   9. quiz_attempts     — quiz results
--  10. live_sessions     — scheduled & past live classroom sessions
--  11. attendance        — per-session attendance records
--  12. messages          — direct messages between users
--  13. conversations     — DM thread metadata
--  14. announcements     — course-level or platform-wide notices
--  15. certificates      — issued completion certificates
--  16. notifications     — in-app notification feed
--  17. reviews           — course star ratings + reviews
--  18. ai_chat_sessions  — AI chatbot conversation history
-- ═══════════════════════════════════════════════════════════════════

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- fast text search

-- ───────────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null,
  avatar_url    text,
  role          text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  bio           text,
  phone         text,

  -- Student-specific
  student_id    text unique,
  institution   text,
  grade_level   text,

  -- Teacher-specific
  teacher_id    text unique,
  department    text,
  expertise     text[],
  rating        numeric(3,2) default 0,
  total_students integer default 0,

  -- Social / preferences
  website       text,
  linkedin_url  text,
  twitter_url   text,
  timezone      text default 'UTC',
  language      text default 'en',
  theme         text default 'dark',
  email_notifications boolean default true,
  push_notifications  boolean default true,

  two_factor_enabled  boolean default false,
  is_verified         boolean default false,
  is_active           boolean default true,

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────────────────────────────
-- 2. COURSES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id              uuid primary key default uuid_generate_v4(),
  instructor_id   uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  slug            text unique,
  description     text,
  short_description text,
  thumbnail_url   text,
  preview_video_url text,
  category        text not null,
  subcategory     text,
  level           text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced')),
  language        text default 'English',
  tags            text[] default '{}',
  outcomes        text[] default '{}',
  requirements    text[] default '{}',
  price           numeric(10,2) default 0,
  original_price  numeric(10,2),
  is_free         boolean default false,
  is_published    boolean default false,
  is_featured     boolean default false,
  duration_minutes integer default 0,
  total_lessons   integer default 0,
  total_enrolled  integer default 0,
  avg_rating      numeric(3,2) default 0,
  total_reviews   integer default 0,
  completion_rate numeric(5,2) default 0,
  certificate_enabled boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

-- Full-text search index on courses
create index if not exists courses_title_search on public.courses using gin (to_tsvector('english', title || ' ' || coalesce(description, '')));
create index if not exists courses_instructor_idx on public.courses (instructor_id);
create index if not exists courses_category_idx on public.courses (category);
create index if not exists courses_published_idx on public.courses (is_published);

-- ───────────────────────────────────────────────────────────────────
-- 3. COURSE SECTIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.course_sections (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text,
  position    integer not null default 0,
  created_at  timestamptz default now()
);

create index if not exists sections_course_idx on public.course_sections (course_id, position);

-- ───────────────────────────────────────────────────────────────────
-- 4. LESSONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.lessons (
  id            uuid primary key default uuid_generate_v4(),
  section_id    uuid not null references public.course_sections(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  type          text not null default 'video' check (type in ('video', 'pdf', 'quiz', 'assignment', 'text', 'embed')),
  content_url   text,
  content_text  text,
  duration_seconds integer default 0,
  position      integer not null default 0,
  is_preview    boolean default false,
  is_locked     boolean default true,
  transcript    text,
  resources     jsonb default '[]',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

create index if not exists lessons_section_idx on public.lessons (section_id, position);
create index if not exists lessons_course_idx on public.lessons (course_id);

-- ───────────────────────────────────────────────────────────────────
-- 5. ENROLLMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  enrolled_at     timestamptz default now(),
  last_accessed   timestamptz default now(),
  progress_pct    numeric(5,2) default 0,
  completed_at    timestamptz,
  is_active       boolean default true,
  payment_status  text default 'free' check (payment_status in ('free', 'paid', 'refunded')),
  amount_paid     numeric(10,2) default 0,
  unique (student_id, course_id)
);

create index if not exists enrollments_student_idx on public.enrollments (student_id);
create index if not exists enrollments_course_idx on public.enrollments (course_id);

-- Auto-increment course enrollment count
create or replace function public.update_enrollment_count()
returns trigger language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.courses set total_enrolled = total_enrolled + 1 where id = new.course_id;
  elsif TG_OP = 'DELETE' then
    update public.courses set total_enrolled = greatest(0, total_enrolled - 1) where id = old.course_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger enrollment_count_trigger
  after insert or delete on public.enrollments
  for each row execute function public.update_enrollment_count();

-- ───────────────────────────────────────────────────────────────────
-- 6. LESSON PROGRESS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.lesson_progress (
  id           uuid primary key default uuid_generate_v4(),
  student_id   uuid not null references public.profiles(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  is_completed boolean default false,
  watch_time_seconds integer default 0,
  last_position_seconds integer default 0,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (student_id, lesson_id)
);

create trigger lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create index if not exists lesson_progress_student_idx on public.lesson_progress (student_id, course_id);

-- ───────────────────────────────────────────────────────────────────
-- 7. ASSIGNMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.assignments (
  id              uuid primary key default uuid_generate_v4(),
  course_id       uuid references public.courses(id) on delete cascade,
  created_by      uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text,
  type            text not null default 'assignment' check (type in ('assignment', 'quiz', 'project', 'peer_review')),
  instructions    text,
  resources       jsonb default '[]',
  due_date        timestamptz,
  max_score       integer default 100,
  passing_score   integer default 60,
  time_limit_mins integer,    -- for quizzes
  attempts_allowed integer default 1,
  is_published    boolean default false,
  ai_grading      boolean default false,
  rubric          jsonb default '[]',
  questions       jsonb default '[]',  -- quiz questions array
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger assignments_updated_at before update on public.assignments
  for each row execute function public.set_updated_at();

create index if not exists assignments_course_idx on public.assignments (course_id);
create index if not exists assignments_teacher_idx on public.assignments (created_by);

-- ───────────────────────────────────────────────────────────────────
-- 8. ASSIGNMENT SUBMISSIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.assignment_submissions (
  id              uuid primary key default uuid_generate_v4(),
  assignment_id   uuid not null references public.assignments(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  submitted_at    timestamptz default now(),
  content_text    text,
  file_urls       text[] default '{}',
  score           numeric(5,2),
  max_score       integer,
  grade           text,
  status          text not null default 'submitted' check (status in ('draft', 'submitted', 'grading', 'graded', 'returned')),
  feedback_text   text,
  ai_feedback     jsonb,          -- structured AI feedback
  graded_by       uuid references public.profiles(id),
  graded_at       timestamptz,
  attempt_number  integer default 1,
  is_late         boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger submissions_updated_at before update on public.assignment_submissions
  for each row execute function public.set_updated_at();

create index if not exists submissions_assignment_idx on public.assignment_submissions (assignment_id);
create index if not exists submissions_student_idx on public.assignment_submissions (student_id);

-- ───────────────────────────────────────────────────────────────────
-- 9. QUIZ ATTEMPTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.quiz_attempts (
  id              uuid primary key default uuid_generate_v4(),
  assignment_id   uuid not null references public.assignments(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  started_at      timestamptz default now(),
  submitted_at    timestamptz,
  answers         jsonb not null default '{}',  -- { questionId: selectedOption }
  score           numeric(5,2),
  max_score       integer,
  percentage      numeric(5,2),
  passed          boolean,
  time_taken_secs integer,
  attempt_number  integer default 1
);

create index if not exists quiz_attempts_student_idx on public.quiz_attempts (student_id, assignment_id);

-- ───────────────────────────────────────────────────────────────────
-- 10. LIVE SESSIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.live_sessions (
  id              uuid primary key default uuid_generate_v4(),
  course_id       uuid references public.courses(id) on delete set null,
  host_id         uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text,
  scheduled_at    timestamptz not null,
  started_at      timestamptz,
  ended_at        timestamptz,
  status          text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended', 'cancelled')),
  room_id         text unique default uuid_generate_v4()::text,
  recording_url   text,
  max_participants integer default 100,
  allow_recording  boolean default true,
  enable_chat      boolean default true,
  enable_whiteboard boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger live_sessions_updated_at before update on public.live_sessions
  for each row execute function public.set_updated_at();

create index if not exists live_sessions_course_idx on public.live_sessions (course_id);
create index if not exists live_sessions_host_idx on public.live_sessions (host_id);
create index if not exists live_sessions_status_idx on public.live_sessions (status, scheduled_at);

-- ───────────────────────────────────────────────────────────────────
-- 11. ATTENDANCE
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.attendance (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references public.live_sessions(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  joined_at       timestamptz default now(),
  left_at         timestamptz,
  duration_mins   integer default 0,
  status          text not null default 'present' check (status in ('present', 'absent', 'late', 'excused')),
  qr_verified     boolean default false,
  ip_address      text,
  unique (session_id, student_id)
);

create index if not exists attendance_session_idx on public.attendance (session_id);
create index if not exists attendance_student_idx on public.attendance (student_id);

-- ───────────────────────────────────────────────────────────────────
-- 12. CONVERSATIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null default 'dm' check (type in ('dm', 'group', 'course_group')),
  name        text,                              -- used for group chats
  avatar_url  text,
  course_id   uuid references public.courses(id) on delete set null,
  created_by  uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz default now(),
  created_at  timestamptz default now()
);

create index if not exists conversations_last_msg_idx on public.conversations (last_message_at desc);

-- Conversation participants
create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  joined_at       timestamptz default now(),
  last_read_at    timestamptz default now(),
  is_admin        boolean default false,
  is_muted        boolean default false,
  primary key (conversation_id, user_id)
);

create index if not exists participants_user_idx on public.conversation_participants (user_id, conversation_id);

-- ───────────────────────────────────────────────────────────────────
-- 13. MESSAGES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  content         text not null,
  type            text not null default 'text' check (type in ('text', 'file', 'image', 'system')),
  file_url        text,
  file_name       text,
  file_size       integer,
  reply_to_id     uuid references public.messages(id) on delete set null,
  is_edited       boolean default false,
  is_deleted      boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger messages_updated_at before update on public.messages
  for each row execute function public.set_updated_at();

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender_id);

-- Auto-update last_message_at on conversations
create or replace function public.update_conversation_timestamp()
returns trigger language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger message_conversation_timestamp
  after insert on public.messages
  for each row execute function public.update_conversation_timestamp();

-- ───────────────────────────────────────────────────────────────────
-- 14. ANNOUNCEMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.announcements (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid references public.courses(id) on delete cascade,   -- null = platform-wide
  title       text not null,
  content     text not null,
  is_pinned   boolean default false,
  is_global   boolean default false,
  target_roles text[] default '{student,teacher}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger announcements_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

create index if not exists announcements_course_idx on public.announcements (course_id, created_at desc);

-- ───────────────────────────────────────────────────────────────────
-- 15. CERTIFICATES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.certificates (
  id                uuid primary key default uuid_generate_v4(),
  student_id        uuid not null references public.profiles(id) on delete cascade,
  course_id         uuid not null references public.courses(id) on delete cascade,
  issued_at         timestamptz default now(),
  verification_code text unique not null default 'SH-' || upper(substring(uuid_generate_v4()::text, 1, 12)),
  grade             text,
  score             numeric(5,2),
  pdf_url           text,
  is_valid          boolean default true,
  revoked_at        timestamptz,
  revoke_reason     text,
  unique (student_id, course_id)
);

create index if not exists certificates_student_idx on public.certificates (student_id);
create index if not exists certificates_verification_idx on public.certificates (verification_code);

-- ───────────────────────────────────────────────────────────────────
-- 16. NOTIFICATIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('grade', 'message', 'announcement', 'assignment', 'class', 'achievement', 'system')),
  title       text not null,
  body        text not null,
  link        text,
  is_read     boolean default false,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

-- ───────────────────────────────────────────────────────────────────
-- 17. REVIEWS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  title       text,
  body        text,
  helpful_count integer default 0,
  is_verified boolean default true,  -- purchased/enrolled student
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (course_id, student_id)
);

create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

create index if not exists reviews_course_idx on public.reviews (course_id, rating desc);

-- Auto-update course average rating
create or replace function public.update_course_rating()
returns trigger language plpgsql
as $$
declare
  v_course_id uuid;
  v_avg numeric;
  v_count integer;
begin
  v_course_id := coalesce(new.course_id, old.course_id);
  select avg(rating)::numeric(3,2), count(*) into v_avg, v_count
  from public.reviews where course_id = v_course_id;
  update public.courses set avg_rating = coalesce(v_avg, 0), total_reviews = v_count where id = v_course_id;
  return coalesce(new, old);
end;
$$;

create trigger reviews_update_rating
  after insert or update or delete on public.reviews
  for each row execute function public.update_course_rating();

-- ───────────────────────────────────────────────────────────────────
-- 18. AI CHAT SESSIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.ai_chat_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  context     text,   -- 'course:courseId' | 'assignment:id' | 'general'
  messages    jsonb not null default '[]',  -- [{role, content, timestamp}]
  title       text,
  model       text default 'gemini-1.5-flash',
  tokens_used integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger ai_chat_sessions_updated_at before update on public.ai_chat_sessions
  for each row execute function public.set_updated_at();

create index if not exists ai_chat_user_idx on public.ai_chat_sessions (user_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.live_sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.announcements enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.ai_chat_sessions enable row level security;

-- ─── PROFILES ─────────────────────────────────────────────────────
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- ─── COURSES ──────────────────────────────────────────────────────
create policy "Published courses are public" on public.courses
  for select using (is_published = true or instructor_id = auth.uid());

create policy "Teachers can create courses" on public.courses
  for insert with check (
    auth.uid() = instructor_id and
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

create policy "Teachers can update their courses" on public.courses
  for update using (instructor_id = auth.uid());

create policy "Teachers can delete their courses" on public.courses
  for delete using (instructor_id = auth.uid());

-- ─── COURSE SECTIONS & LESSONS ────────────────────────────────────
create policy "Sections of published courses are viewable" on public.course_sections
  for select using (
    exists (select 1 from public.courses where id = course_id and (is_published = true or instructor_id = auth.uid()))
  );

create policy "Teachers manage their sections" on public.course_sections
  for all using (
    exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
  );

create policy "Lessons of published courses are viewable" on public.lessons
  for select using (
    exists (select 1 from public.courses where id = course_id and (is_published = true or instructor_id = auth.uid()))
  );

create policy "Teachers manage their lessons" on public.lessons
  for all using (
    exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
  );

-- ─── ENROLLMENTS ──────────────────────────────────────────────────
create policy "Students see their enrollments" on public.enrollments
  for select using (student_id = auth.uid());

create policy "Teachers see course enrollments" on public.enrollments
  for select using (
    exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid())
  );

create policy "Students can enroll" on public.enrollments
  for insert with check (student_id = auth.uid());

create policy "Students can update their enrollment" on public.enrollments
  for update using (student_id = auth.uid());

-- ─── LESSON PROGRESS ──────────────────────────────────────────────
create policy "Students manage their progress" on public.lesson_progress
  for all using (student_id = auth.uid());

-- ─── ASSIGNMENTS ──────────────────────────────────────────────────
create policy "Students see assignments for enrolled courses" on public.assignments
  for select using (
    is_published = true and (
      course_id is null or
      exists (select 1 from public.enrollments where course_id = assignments.course_id and student_id = auth.uid())
    )
  );

create policy "Teachers manage their assignments" on public.assignments
  for all using (created_by = auth.uid());

-- ─── SUBMISSIONS ──────────────────────────────────────────────────
create policy "Students see their submissions" on public.assignment_submissions
  for select using (student_id = auth.uid());

create policy "Teachers see submissions for their assignments" on public.assignment_submissions
  for select using (
    exists (select 1 from public.assignments where id = assignment_id and created_by = auth.uid())
  );

create policy "Students create submissions" on public.assignment_submissions
  for insert with check (student_id = auth.uid());

create policy "Students update their submissions" on public.assignment_submissions
  for update using (student_id = auth.uid() and status in ('draft', 'submitted'));

create policy "Teachers grade submissions" on public.assignment_submissions
  for update using (
    exists (select 1 from public.assignments where id = assignment_id and created_by = auth.uid())
  );

-- ─── QUIZ ATTEMPTS ────────────────────────────────────────────────
create policy "Students manage their quiz attempts" on public.quiz_attempts
  for all using (student_id = auth.uid());

-- ─── LIVE SESSIONS ────────────────────────────────────────────────
create policy "Live sessions are viewable when enrolled or host" on public.live_sessions
  for select using (
    host_id = auth.uid() or
    course_id is null or
    exists (select 1 from public.enrollments where course_id = live_sessions.course_id and student_id = auth.uid())
  );

create policy "Teachers manage their sessions" on public.live_sessions
  for all using (host_id = auth.uid());

-- ─── ATTENDANCE ───────────────────────────────────────────────────
create policy "Students see their attendance" on public.attendance
  for select using (student_id = auth.uid());

create policy "Teachers see attendance for their sessions" on public.attendance
  for select using (
    exists (select 1 from public.live_sessions where id = session_id and host_id = auth.uid())
  );

create policy "Attendance can be marked by anyone in session" on public.attendance
  for insert with check (student_id = auth.uid());

create policy "Teachers update attendance" on public.attendance
  for update using (
    exists (select 1 from public.live_sessions where id = session_id and host_id = auth.uid())
  );

-- ─── CONVERSATIONS & MESSAGES ─────────────────────────────────────
create policy "Users see their conversations" on public.conversations
  for select using (
    exists (select 1 from public.conversation_participants where conversation_id = id and user_id = auth.uid())
  );

create policy "Users create conversations" on public.conversations
  for insert with check (created_by = auth.uid());

create policy "Participants see conversation membership" on public.conversation_participants
  for select using (user_id = auth.uid() or
    exists (select 1 from public.conversation_participants cp2
            where cp2.conversation_id = conversation_id and cp2.user_id = auth.uid()));

create policy "Users join conversations" on public.conversation_participants
  for insert with check (user_id = auth.uid());

create policy "Users see messages in their conversations" on public.messages
  for select using (
    exists (select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id and user_id = auth.uid())
  );

create policy "Users send messages to their conversations" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    exists (select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id and user_id = auth.uid())
  );

create policy "Users edit their messages" on public.messages
  for update using (sender_id = auth.uid());

-- ─── ANNOUNCEMENTS ────────────────────────────────────────────────
create policy "Everyone can read announcements" on public.announcements
  for select using (
    is_global = true or
    course_id is null or
    exists (select 1 from public.enrollments where course_id = announcements.course_id and student_id = auth.uid()) or
    author_id = auth.uid()
  );

create policy "Teachers and admins create announcements" on public.announcements
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

create policy "Authors manage their announcements" on public.announcements
  for all using (author_id = auth.uid());

-- ─── CERTIFICATES ─────────────────────────────────────────────────
create policy "Certificates are publicly verifiable" on public.certificates
  for select using (true);

create policy "System creates certificates" on public.certificates
  for insert with check (student_id = auth.uid());

-- ─── NOTIFICATIONS ────────────────────────────────────────────────
create policy "Users see their notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "Users update their notifications (mark read)" on public.notifications
  for update using (user_id = auth.uid());

-- ─── REVIEWS ──────────────────────────────────────────────────────
create policy "Reviews are public" on public.reviews
  for select using (true);

create policy "Enrolled students can review" on public.reviews
  for insert with check (
    student_id = auth.uid() and
    exists (select 1 from public.enrollments where course_id = reviews.course_id and student_id = auth.uid())
  );

create policy "Students manage their reviews" on public.reviews
  for all using (student_id = auth.uid());

-- ─── AI CHAT ──────────────────────────────────────────────────────
create policy "Users manage their AI chat sessions" on public.ai_chat_sessions
  for all using (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- REALTIME
-- Enable realtime for tables that need live updates
-- ═══════════════════════════════════════════════════════════════════
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    public.messages,
    public.notifications,
    public.live_sessions,
    public.attendance;
commit;

-- ═══════════════════════════════════════════════════════════════════
-- USEFUL VIEWS
-- ═══════════════════════════════════════════════════════════════════

-- Enrolled courses with progress for a student
create or replace view public.student_courses as
select
  e.student_id,
  c.id as course_id,
  c.title,
  c.thumbnail_url,
  c.level,
  c.category,
  c.total_lessons,
  p.full_name as instructor_name,
  e.progress_pct,
  e.enrolled_at,
  e.last_accessed,
  e.completed_at
from public.enrollments e
join public.courses c on c.id = e.course_id
join public.profiles p on p.id = c.instructor_id
where e.is_active = true;

-- Course with instructor details
create or replace view public.course_detail as
select
  c.*,
  p.full_name as instructor_name,
  p.avatar_url as instructor_avatar,
  p.bio as instructor_bio,
  p.rating as instructor_rating,
  p.total_students as instructor_students
from public.courses c
join public.profiles p on p.id = c.instructor_id;

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these separately in Storage tab or via the Supabase dashboard
-- ═══════════════════════════════════════════════════════════════════
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('course-thumbnails', 'course-thumbnails', true);
-- insert into storage.buckets (id, name, public) values ('course-videos', 'course-videos', false);
-- insert into storage.buckets (id, name, public) values ('course-materials', 'course-materials', false);
-- insert into storage.buckets (id, name, public) values ('assignments', 'assignments', false);
-- insert into storage.buckets (id, name, public) values ('certificates', 'certificates', true);

-- ═══════════════════════════════════════════════════════════════════
-- DONE ✅
-- Your ScholarHub database is ready.
-- ═══════════════════════════════════════════════════════════════════
