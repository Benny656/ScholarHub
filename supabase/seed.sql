-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║              SCHOLARHUB — ADMIN SEED (SQL Version)                     ║
-- ║  This file seeds 4 permanent admin accounts at the database level.     ║
-- ║                                                                        ║
-- ║  Usage:                                                                ║
-- ║    Run this in the Supabase SQL Editor, OR                             ║
-- ║    Include it in your supabase/seed.sql for `supabase db reset`.       ║
-- ║                                                                        ║
-- ║  ⚠  IMPORTANT:                                                         ║
-- ║    This SQL file creates users using Supabase's internal              ║
-- ║    auth.users table directly. Only run from the SQL Editor or          ║
-- ║    via psql with superuser access (not from anon/service-role).        ║
-- ║                                                                        ║
-- ║  For the recommended approach (works from CLI + CI/CD), use:           ║
-- ║    npm run seed:admins                                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED FUNCTION: Creates an admin account if it does not already exist.
-- This is idempotent — safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.seed_admin_account(
  p_email    text,
  p_name     text,
  p_password text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_encrypted text;
begin
  -- Check if user already exists in public.users
  select id into v_user_id
  from public.users
  where email = p_email
  limit 1;

  if v_user_id is not null then
    -- Ensure admin role is set
    update public.users
    set role = 'admin'
    where id = v_user_id and role != 'admin';

    return 'skipped: ' || p_email;
  end if;

  -- Check if user exists in auth.users (edge case: auth exists but profile missing)
  select id into v_user_id
  from auth.users
  where email = p_email
  limit 1;

  if v_user_id is null then
    -- Generate a new UUID for the user
    v_user_id := gen_random_uuid();

    -- Insert into auth.users
    -- Note: crypt() with gen_salt('bf') produces bcrypt hash (Supabase-compatible)
    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      aud,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      is_sso_user,
      is_anonymous
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      crypt(p_password, gen_salt('bf')),
      now(),                           -- email_confirmed_at: verified immediately
      'authenticated',
      'authenticated',
      jsonb_build_object(
        'name',      p_name,
        'role',      'admin',
        'user_type', 'college'
      ),
      now(),
      now(),
      '',
      '',
      false,
      false
    );
  end if;

  -- Upsert the public.users profile (trigger may have already created it)
  insert into public.users (
    id,
    name,
    email,
    role,
    avatar_url,
    xp,
    level,
    streak,
    last_login,
    user_type,
    status
  ) values (
    v_user_id,
    p_name,
    p_email,
    'admin',
    null,
    0,
    1,
    0,
    current_date,
    'college',
    'active'
  )
  on conflict (id) do update set
    role       = 'admin',
    name       = excluded.name,
    status     = 'active';

  return 'created: ' || p_email;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RUN SEEDS — 4 ScholarHub Admin Accounts
-- ⚠  DEVELOPMENT/DEMO CONFIGURATION
-- These are the permanent admin accounts for ScholarHub platform access.
-- ─────────────────────────────────────────────────────────────────────────────
select public.seed_admin_account('bennymanuel2020@gmail.com',  'Benny Manuel',       'Admin@123');
select public.seed_admin_account('jerlinsubhiksha@gmail.com',  'Jerlin Subhiksha',   'Admin@123');
select public.seed_admin_account('deepsiseropa@gmail.com',     'Deep Siseropa',      'Admin@123');
select public.seed_admin_account('fredricknewbegin@gmail.com', 'Fredrick Newbegin',  'Admin@123');

-- ─────────────────────────────────────────────────────────────────────────────
-- CLEANUP — Drop the temporary seed function after seeding
-- (Optional — comment this out if you want to re-run later)
-- ─────────────────────────────────────────────────────────────────────────────
-- drop function if exists public.seed_admin_account(text, text, text);

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY — Run this to confirm the accounts were created
-- ─────────────────────────────────────────────────────────────────────────────
select
  u.name,
  u.email,
  u.role,
  u.status,
  au.email_confirmed_at is not null as "email_verified",
  u.created_at
from public.users u
join auth.users au on au.id = u.id
where u.role = 'admin'
order by u.created_at;
