-- Public, read-only leaderboard for all-time JAMB practice scores.
--
-- The browser only needs the top five names/scores. Keeping the aggregation in
-- Postgres avoids downloading every result just to deduplicate students. The
-- public API reads this function through the server-only service-role client;
-- the function itself is not executable by anon or authenticated roles.
--
-- Scoring rules:
--   The banner shows score / total_marking_score from the same saved row; it
--   never assumes a fixed /400 denominator. Ranking uses the saved percentage,
--   which keeps results comparable within the current JAMB CBT scoring model
--   (2017+). Legacy pre-2017 papers used a different mark weight while still
--   storing a 400 total, so they are excluded rather than mixed with CBT-era
--   percentages.
--
-- Ranking rules:
--   1. JAMB attempts only, using the current CBT scoring model.
--   2. Each student's best percentage.
--   3. Percentage, then raw score, then earliest qualifying result.
--   4. Positive scores only, so empty attempts never occupy the banner.

create or replace function public.get_all_time_jamb_leaderboard(
  p_limit integer default 5
)
returns table (
  display_name text,
  score integer,
  total_marking_score integer,
  percentage double precision,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with best_results as (
    select distinct on (pr.user_id)
      pr.user_id,
      pr.score,
      pr.total_marking_score,
      pr.percentage,
      pr.created_at
    from public.practice_results pr
    where upper(pr.exam_type) = 'JAMB'
      and pr.year > 2016
      and pr.total_marking_score > 0
      and pr.percentage > 0
      and pr.percentage <= 100
      and pr.score >= 0
      and pr.score <= pr.total_marking_score
    order by
      pr.user_id,
      pr.percentage desc,
      pr.score desc,
      pr.created_at asc,
      pr.id asc
  )
  select
    left(
      coalesce(
        nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
        'JAMB Student'
      ),
      40
    ) as display_name,
    br.score,
    br.total_marking_score,
    br.percentage,
    br.created_at
  from best_results br
  join auth.users u on u.id = br.user_id
  order by
    br.percentage desc,
    br.score desc,
    br.created_at asc,
    display_name asc,
    br.user_id asc
  limit greatest(1, least(coalesce(p_limit, 5), 5));
$$;

comment on function public.get_all_time_jamb_leaderboard(integer) is
  'Returns the top distinct JAMB students by best percentage for the public leaderboard.';

revoke all on function public.get_all_time_jamb_leaderboard(integer)
  from public, anon, authenticated;
grant execute on function public.get_all_time_jamb_leaderboard(integer)
  to service_role;

notify pgrst, 'reload schema';
