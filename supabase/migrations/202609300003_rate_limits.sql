-- Per-user rate limiter shared by the API routes.

-- Stored in Postgres so limits hold across serverless instances. Users can't read or edit
-- the table directly; they can only call consume_rate_limit(), which always acts on auth.uid().

create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_user_bucket_created_idx
  on public.rate_limit_hits (user_id, bucket, created_at desc);

alter table public.rate_limit_hits enable row level security;
alter table public.rate_limit_hits force row level security;
revoke all on public.rate_limit_hits from anon, authenticated;
-- No policies: no direct access for anon/authenticated. Only the function below touches it.

create or replace function public.consume_rate_limit(p_bucket text, p_max int, p_window_seconds int)
returns table (allowed boolean, remaining int, retry_after_seconds int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_count int;
  v_oldest timestamptz;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_max < 1 or p_window_seconds < 1 or p_window_seconds > 86400 * 7 or length(p_bucket) > 64 then
    raise exception 'invalid rate limit arguments' using errcode = '22023';
  end if;

  -- Serialise concurrent calls for the same user+bucket.
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || ':' || p_bucket, 0));

  delete from public.rate_limit_hits
   where user_id = v_user and bucket = p_bucket
     and created_at < now() - make_interval(secs => greatest(p_window_seconds, 86400));

  select count(*), min(created_at) into v_count, v_oldest
    from public.rate_limit_hits
   where user_id = v_user and bucket = p_bucket
     and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return query select false, 0,
      greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::int);
    return;
  end if;

  insert into public.rate_limit_hits (user_id, bucket) values (v_user, p_bucket);
  return query select true, p_max - v_count - 1, 0;
end;
$$;

revoke all on function public.consume_rate_limit(text, int, int) from public, anon;
grant execute on function public.consume_rate_limit(text, int, int) to authenticated;
