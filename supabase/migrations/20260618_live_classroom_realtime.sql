-- Live classroom runtime support.
-- This keeps the existing live_sessions shape intact:
-- classroom_id, teacher_id, meeting_room_id, status = LIVE/ENDED.

alter table public.live_sessions
  add column if not exists host_name text,
  add column if not exists participant_count integer default 0;

create index if not exists idx_live_sessions_classroom_status
  on public.live_sessions (classroom_id, status);

create index if not exists idx_live_sessions_status_started
  on public.live_sessions (status, started_at desc);

create index if not exists idx_session_participants_session_active
  on public.session_participants (session_id, left_at);

alter table public.live_sessions replica identity full;
alter table public.session_participants replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'live_sessions'
  ) then
    alter publication supabase_realtime add table public.live_sessions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'session_participants'
  ) then
    alter publication supabase_realtime add table public.session_participants;
  end if;
end $$;
