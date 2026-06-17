-- ==========================================
-- 20. NOTIFICATION SYSTEM & WIDGETS SCHEMA
-- ==========================================

-- A. Update Profiles with Preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"assignments": true, "announcements": true, "system": true}'::jsonb;

-- Users table update to keep them somewhat mirrored just in case
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"assignments": true, "announcements": true, "system": true}'::jsonb;

-- B. Modify notifications policy to allow authenticated users to send notifications
-- (The existing policy only allows users to manage their own. We need to allow inserts from others, e.g. teachers)
DROP POLICY IF EXISTS "Users can insert notifications for others" ON public.notifications;
CREATE POLICY "Users can insert notifications for others" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- C. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid references public.users(id),
  target_role text, -- e.g. 'school-student', 'unistudents', 'all'
  content text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Announcements RLS
CREATE POLICY "Admin full access on announcements" ON public.announcements FOR ALL USING (public.is_admin());

CREATE POLICY "Teachers can create announcements" ON public.announcements 
  FOR INSERT WITH CHECK (exists (select 1 from public.users where id = auth.uid() and role = 'teacher'));

CREATE POLICY "Users can read announcements" ON public.announcements 
  FOR SELECT USING (auth.role() = 'authenticated');

-- D. Schedule Table
CREATE TABLE IF NOT EXISTS public.schedule (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references public.users(id),
  title text,
  time text, -- e.g., '10:00 AM'
  day_of_week text, -- e.g., 'Monday'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

-- Schedule RLS
CREATE POLICY "Admin full access on schedule" ON public.schedule FOR ALL USING (public.is_admin());

CREATE POLICY "Users manage own schedule" ON public.schedule 
  FOR ALL USING (user_id = auth.uid());
