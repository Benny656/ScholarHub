-- ==========================================
-- PEER HUB SCHEMA (Study Groups & Messages)
-- ==========================================

-- 1. Study Groups Table
CREATE TABLE IF NOT EXISTS public.study_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_private boolean DEFAULT false,
  join_code text,
  creator_id uuid references public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on study_groups" ON public.study_groups FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated users can view study groups" ON public.study_groups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create study groups" ON public.study_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Creators can update study groups" ON public.study_groups FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Creators can delete study groups" ON public.study_groups FOR DELETE USING (creator_id = auth.uid());

-- 2. Group Messages Table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid references public.study_groups(id) ON DELETE CASCADE,
  sender_id uuid references public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on group_messages" ON public.group_messages FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated users can read group messages" ON public.group_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert group messages" ON public.group_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- ADD MISSING NOTIFICATIONS SCHEMA (Just in case it wasn't applied)
-- ==========================================
-- Since test-db.js hit 'permission denied', let's grant access explicitly

GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.announcements TO authenticated;
GRANT ALL ON public.study_groups TO authenticated;
GRANT ALL ON public.group_messages TO authenticated;
GRANT ALL ON public.schedule TO authenticated;
