-- Practice results are user data, so they live in Supabase.
-- MongoDB now stores questions only.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) before
-- deploying the updated dashboard and /api/practice-results route.

create table if not exists public.practice_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_type text not null,
  year integer,
  subjects text[] not null default '{}',
  score integer not null check (score >= 0),
  total_marking_score integer not null check (total_marking_score >= 0),
  total_questions integer not null check (total_questions > 0),
  correct_count integer not null check (correct_count >= 0),
  percentage double precision not null check (percentage >= 0 and percentage <= 100),
  created_at timestamptz not null default now(),
  constraint practice_results_correct_count_check
    check (correct_count <= total_questions)
);

-- Dashboard queries: newest results for one user.
create index if not exists practice_results_user_created_idx
  on public.practice_results (user_id, created_at desc);

-- "Best score" query: highest percentage for one user.
create index if not exists practice_results_user_percentage_idx
  on public.practice_results (user_id, percentage desc);

alter table public.practice_results enable row level security;

-- A signed-in student can only read and create their own rows. The API route
-- uses the user's session, so these policies are enforced on every request.
drop policy if exists "Users can read their own practice results"
  on public.practice_results;

create policy "Users can read their own practice results"
  on public.practice_results
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own practice results"
  on public.practice_results;

create policy "Users can insert their own practice results"
  on public.practice_results
  for insert
  with check (auth.uid() = user_id);
