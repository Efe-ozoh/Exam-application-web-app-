-- Formal (Mock) examinations need authoritative server-side state so AI
-- features can be locked until the attempt is submitted successfully.
--
-- The existing app only stored completed attempts in practice_results. This
-- table records the in-progress attempt. A session is "active" from the moment
-- a Mock exam page is started until /api/practice-results successfully saves
-- the result and completes the session. Timer expiry alone never completes it.

create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_type text not null,
  year integer,
  subjects text[] not null default '{}',
  mode text not null default 'Mock',
  status text not null default 'active',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  practice_result_id uuid references public.practice_results (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_sessions_mode_check check (mode in ('Mock', 'Practice')),
  constraint exam_sessions_status_check
    check (status in ('active', 'submitted', 'abandoned'))
);

-- A student can have only one examination in progress at a time. This is what
-- makes multi-tab enforcement work: every tab reads the same active session.
create unique index if not exists exam_sessions_one_active_per_user_idx
  on public.exam_sessions (user_id)
  where status = 'active';

create index if not exists exam_sessions_user_status_idx
  on public.exam_sessions (user_id, status, started_at desc);

alter table public.exam_sessions enable row level security;

drop policy if exists "Users can read their own exam sessions"
  on public.exam_sessions;

create policy "Users can read their own exam sessions"
  on public.exam_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can start their own exam sessions"
  on public.exam_sessions;

create policy "Users can start their own exam sessions"
  on public.exam_sessions
  for insert
  with check (auth.uid() = user_id and status = 'active');

-- A session can only be completed when it is linked to a persisted result
-- owned by the same student for the same exam type and year. This prevents an
-- active exam from being marked submitted without saving a result first.
drop policy if exists "Users can complete their own exam sessions"
  on public.exam_sessions;

create policy "Users can complete their own exam sessions"
  on public.exam_sessions
  for update
  using (auth.uid() = user_id and status = 'active')
  with check (
    auth.uid() = user_id
    and status = 'submitted'
    and practice_result_id is not null
    and exists (
      select 1
      from public.practice_results pr
      where pr.id = exam_sessions.practice_result_id
        and pr.user_id = auth.uid()
        and upper(pr.exam_type) = upper(exam_sessions.exam_type)
        and pr.year is not distinct from exam_sessions.year
    )
  );

notify pgrst, 'reload schema';
