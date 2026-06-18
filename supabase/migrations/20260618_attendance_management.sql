alter table public.attendance
  add column if not exists marked_by uuid references public.users(id),
  add column if not exists created_at timestamptz default now();

update public.attendance
set created_at = coalesce(created_at, marked_at, now())
where created_at is null;

create unique index if not exists attendance_course_student_date_idx
  on public.attendance (course_id, student_id, date);

do $$
declare
  owner_check text;
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'courses' and column_name = 'instructor_id'
  ) then
    owner_check := 'courses.instructor_id = auth.uid()';
  else
    owner_check := 'courses.teacher_id = auth.uid()';
  end if;

  execute 'drop policy if exists "Teachers read attendance for owned courses" on public.attendance';
  execute 'create policy "Teachers read attendance for owned courses" on public.attendance
    for select using (exists (
      select 1 from public.courses
      where courses.id = attendance.course_id and ' || owner_check || '
    ))';

  execute 'drop policy if exists "Teachers mark attendance for owned courses" on public.attendance';
  execute 'create policy "Teachers mark attendance for owned courses" on public.attendance
    for insert with check (exists (
      select 1 from public.courses
      where courses.id = attendance.course_id and ' || owner_check || '
    ))';

  execute 'drop policy if exists "Teachers update attendance for owned courses" on public.attendance';
  execute 'create policy "Teachers update attendance for owned courses" on public.attendance
    for update using (exists (
      select 1 from public.courses
      where courses.id = attendance.course_id and ' || owner_check || '
    )) with check (exists (
      select 1 from public.courses
      where courses.id = attendance.course_id and ' || owner_check || '
    ))';
end $$;
