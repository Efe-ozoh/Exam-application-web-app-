-- Store the per-subject breakdown calculated by the server when a practice
-- result is saved. Existing rows stay NULL so the dashboard can fall back to
-- the original overall-only display for historical attempts.
alter table public.practice_results
  add column if not exists subject_scores jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'practice_results_subject_scores_array_check'
      and conrelid = 'public.practice_results'::regclass
  ) then
    alter table public.practice_results
      add constraint practice_results_subject_scores_array_check
      check (subject_scores is null or jsonb_typeof(subject_scores) = 'array');
  end if;
end $$;
