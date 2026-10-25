alter table public.ai_daily_usage
  add column if not exists ask_used_count integer not null default 0,
  add column if not exists last_request_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ai_daily_usage_ask_used_count_check'
      and conrelid = 'public.ai_daily_usage'::regclass
  ) then
    alter table public.ai_daily_usage
      add constraint ai_daily_usage_ask_used_count_check
      check (ask_used_count >= 0);
  end if;
end $$;

revoke all on table public.ai_daily_usage from anon, authenticated;

create or replace function public.get_ai_study_usage()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_daily_limit constant integer := 5;
  c_cooldown constant interval := interval '3 seconds';
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_today date := (v_now at time zone 'Africa/Lagos')::date;
  v_used integer;
  v_last timestamptz;
  v_cooldown_remaining integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select used_count, last_request_at
    into v_used, v_last
    from public.ai_daily_usage
   where user_id = v_user_id
     and usage_date = v_today;

  v_used := coalesce(v_used, 0);

  if v_last is not null then
    v_cooldown_remaining := greatest(
      ceil(extract(epoch from (v_last + c_cooldown - v_now)))::integer,
      0
    );
  end if;

  return jsonb_build_object(
    'allowed', v_used < c_daily_limit,
    'reason', case when v_used < c_daily_limit then 'ok' else 'daily_limit' end,
    'used', v_used,
    'limit', c_daily_limit,
    'remaining', greatest(c_daily_limit - v_used, 0),
    'cooldown_remaining', v_cooldown_remaining,
    'retry_after', v_cooldown_remaining,
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
  c_cooldown constant interval := interval '3 seconds';
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_today date := (v_now at time zone 'Africa/Lagos')::date;
  v_cutoff timestamptz := v_now - c_cooldown;
  v_used integer;
  v_last timestamptz;
  v_allowed boolean := false;
  v_reason text := 'unavailable';
  v_retry_after integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  insert into public.ai_daily_usage (
    user_id,
    usage_date,
    used_count,
    ask_used_count,
    last_request_at
  )
  values (v_user_id, v_today, 1, 0, v_now)
  on conflict (user_id, usage_date) do update
    set used_count = public.ai_daily_usage.used_count + 1,
        last_request_at = v_now,
        updated_at = v_now
    where public.ai_daily_usage.used_count < c_daily_limit
      and (
        public.ai_daily_usage.last_request_at is null
        or public.ai_daily_usage.last_request_at <= v_cutoff
      )
  returning used_count, last_request_at into v_used, v_last;

  if v_used is not null then
    v_allowed := true;
    v_reason := 'ok';
  else
    select used_count, last_request_at
      into v_used, v_last
      from public.ai_daily_usage
     where user_id = v_user_id
       and usage_date = v_today;

    if v_used >= c_daily_limit then
      v_reason := 'daily_limit';
    elsif v_last is not null and v_last > v_cutoff then
      v_reason := 'cooldown';
      v_retry_after := greatest(
        ceil(extract(epoch from (v_last + c_cooldown - v_now)))::integer,
        0
      );
    else
      v_reason := 'unavailable';
    end if;
  end if;

  return jsonb_build_object(
    'allowed', v_allowed,
    'reason', v_reason,
    'used', coalesce(v_used, c_daily_limit),
    'limit', c_daily_limit,
    'remaining', greatest(c_daily_limit - coalesce(v_used, c_daily_limit), 0),
    'cooldown_remaining', v_retry_after,
    'retry_after', v_retry_after,
    'date', v_today
  );
end;
$$;

create or replace function public.get_ai_ask_usage()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_daily_limit constant integer := 3;
  c_cooldown constant interval := interval '3 seconds';
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_today date := (v_now at time zone 'Africa/Lagos')::date;
  v_used integer;
  v_last timestamptz;
  v_cooldown_remaining integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select ask_used_count, last_request_at
    into v_used, v_last
    from public.ai_daily_usage
   where user_id = v_user_id
     and usage_date = v_today;

  v_used := coalesce(v_used, 0);

  if v_last is not null then
    v_cooldown_remaining := greatest(
      ceil(extract(epoch from (v_last + c_cooldown - v_now)))::integer,
      0
    );
  end if;

  return jsonb_build_object(
    'allowed', v_used < c_daily_limit,
    'reason', case when v_used < c_daily_limit then 'ok' else 'daily_limit' end,
    'used', v_used,
    'limit', c_daily_limit,
    'remaining', greatest(c_daily_limit - v_used, 0),
    'cooldown_remaining', v_cooldown_remaining,
    'retry_after', v_cooldown_remaining,
    'date', v_today
  );
end;
$$;

create or replace function public.reserve_ai_ask_message()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_daily_limit constant integer := 3;
  c_cooldown constant interval := interval '3 seconds';
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_today date := (v_now at time zone 'Africa/Lagos')::date;
  v_cutoff timestamptz := v_now - c_cooldown;
  v_used integer;
  v_last timestamptz;
  v_allowed boolean := false;
  v_reason text := 'unavailable';
  v_retry_after integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  insert into public.ai_daily_usage (
    user_id,
    usage_date,
    used_count,
    ask_used_count,
    last_request_at
  )
  values (v_user_id, v_today, 0, 1, v_now)
  on conflict (user_id, usage_date) do update
    set ask_used_count = public.ai_daily_usage.ask_used_count + 1,
        last_request_at = v_now,
        updated_at = v_now
    where public.ai_daily_usage.ask_used_count < c_daily_limit
      and (
        public.ai_daily_usage.last_request_at is null
        or public.ai_daily_usage.last_request_at <= v_cutoff
      )
  returning ask_used_count, last_request_at into v_used, v_last;

  if v_used is not null then
    v_allowed := true;
    v_reason := 'ok';
  else
    select ask_used_count, last_request_at
      into v_used, v_last
      from public.ai_daily_usage
     where user_id = v_user_id
       and usage_date = v_today;

    if v_used >= c_daily_limit then
      v_reason := 'daily_limit';
    elsif v_last is not null and v_last > v_cutoff then
      v_reason := 'cooldown';
      v_retry_after := greatest(
        ceil(extract(epoch from (v_last + c_cooldown - v_now)))::integer,
        0
      );
    else
      v_reason := 'unavailable';
    end if;
  end if;

  return jsonb_build_object(
    'allowed', v_allowed,
    'reason', v_reason,
    'used', coalesce(v_used, c_daily_limit),
    'limit', c_daily_limit,
    'remaining', greatest(c_daily_limit - coalesce(v_used, c_daily_limit), 0),
    'cooldown_remaining', v_retry_after,
    'retry_after', v_retry_after,
    'date', v_today
  );
end;
$$;

revoke all on function public.get_ai_study_usage() from public;
revoke all on function public.reserve_ai_study_message() from public;
revoke all on function public.get_ai_ask_usage() from public;
revoke all on function public.reserve_ai_ask_message() from public;

grant execute on function public.get_ai_study_usage() to authenticated;
grant execute on function public.reserve_ai_study_message() to authenticated;
grant execute on function public.get_ai_ask_usage() to authenticated;
grant execute on function public.reserve_ai_ask_message() to authenticated;

notify pgrst, 'reload schema';
