-- Exam sessions and practice results are now written exclusively by trusted
-- server routes using the Supabase service-role/secret key. Authenticated
-- users keep read access for the dashboard, AI guard, and result history.
--
-- Before this migration, an authenticated user could insert an arbitrary
-- practice_results row and then update their own exam_sessions row to
-- "submitted", unlocking AI without completing the examination. Direct
-- inserts also allowed arbitrary score history.
--
-- Deployment order:
--   1. Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) on the server.
--   2. Deploy the application code that uses the server-only admin client.
--   3. Apply this migration.
--
-- The admin client bypasses RLS and still verifies user ownership in code.

revoke all on table public.exam_sessions from anon, authenticated;
grant select on table public.exam_sessions to authenticated;
grant all on table public.exam_sessions to service_role;

revoke all on table public.practice_results from anon, authenticated;
grant select on table public.practice_results to authenticated;
grant all on table public.practice_results to service_role;

-- These write policies are no longer used. Dropping them makes the intended
-- access model explicit and ensures a future grant does not silently reopen
-- the bypass.
drop policy if exists "Users can start their own exam sessions"
  on public.exam_sessions;

drop policy if exists "Users can complete their own exam sessions"
  on public.exam_sessions;

drop policy if exists "Users can insert their own practice results"
  on public.practice_results;

notify pgrst, 'reload schema';
