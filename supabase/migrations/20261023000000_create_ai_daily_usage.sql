create table if not exists public.ai_daily_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date),
  constraint ai_daily_usage_used_count_check check (used_count >= 0)
);

comment on table public.ai_daily_usage is
  'Daily AI Study Assistant message counters, keyed by Nigerian calendar day.';

alter table public.ai_daily_usage enable row level security;

revoke all on table public.ai_daily_usage from anon, authenticated;

create or replace function public.get_ai_study_usage()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_daily_limit constant integer := 5;
  v_user_id uuid := auth.uid();
  v_today date := (now() at time zone 'Africa/Lagos')::date;
  v_used integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select used_count
    into v_used
    from public.ai_daily_usage
   where user_id = v_user_id
     and usage_date = v_today;

  v_used := coalesce(v_used, 0);

  return jsonb_build_object(
    'allowed', v_used < c_daily_limit,
    'used', v_used,
    'limit', c_daily_limit,
    'remaining', greatest(c_daily_limit - v_used, 0),
    'date', v_today
  );
end;
$$;

create or replace function public.reserve_ai_study_message()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_daily_limit constant integer := 5;
  v_user_id uuid := auth.uid();
  v_today date := (now() at time zone 'Africa/Lagos')::date;
  v_used integer;
  v_allowed boolean := false;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  insert into public.ai_daily_usage (user_id, usage_date, used_count)
  values (v_user_id, v_today, 1)
  on conflict (user_id, usage_date) do update
    set used_count = public.ai_daily_usage.used_count + 1,
        updated_at = now()
    where public.ai_daily_usage.used_count < c_daily_limit
  returning used_count into v_used;

  if v_used is not null then
    v_allowed := true;
  else
    select used_count
      into v_used
      from public.ai_daily_usage
     where user_id = v_user_id
       and usage_date = v_today;
  end if;

  v_used := coalesce(v_used, c_daily_limit);

  return jsonb_build_object(
    'allowed', v_allowed,
    'used', v_used,
    'limit', c_daily_limit,
    'remaining', greatest(c_daily_limit - v_used, 0),
    'date', v_today
  );
end;
$$;

revoke all on function public.get_ai_study_usage() from public;
revoke all on function public.reserve_ai_study_message() from public;

grant execute on function public.get_ai_study_usage() to authenticated;
grant execute on function public.reserve_ai_study_message() to authenticated;

notify pgrst, 'reload schema';
