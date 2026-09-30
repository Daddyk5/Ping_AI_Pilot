-- Per-user settings + admin-only aggregate usage stats.

-- 1. User settings ------------------------------------------------------------------------

create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  notify_weekly_summary boolean not null default false,
  notify_degradation boolean not null default false,
  default_game text,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;
alter table public.user_settings force row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own" on public.user_settings
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own" on public.user_settings
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own" on public.user_settings
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.user_settings from anon;
grant select, insert, update on public.user_settings to authenticated;

-- 2. Admin usage stats ----------------------------------------------------------------------
-- Admins are users whose app_metadata.role = 'admin'. app_metadata can only be changed with
-- the service role or SQL (never by the user), so the JWT claim is trustworthy. To grant:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'you@example.com';
-- The user must sign out and in again (or refresh the session) to pick up the claim.
--
-- security definer lets this aggregate across users despite RLS; it returns counts only,
-- never user-identifying rows.

create or replace function public.admin_usage_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generatedAt', now(),
    'users', jsonb_build_object(
      'total', (select count(*) from auth.users),
      'new7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
      'new30d', (select count(*) from auth.users where created_at > now() - interval '30 days'),
      'active7d', (select count(distinct user_id) from public.ping_runs where created_at > now() - interval '7 days'),
      'active30d', (select count(distinct user_id) from public.ping_runs where created_at > now() - interval '30 days')
    ),
    'runs', jsonb_build_object(
      'total', (select count(*) from public.ping_runs),
      'last30d', (select count(*) from public.ping_runs where created_at > now() - interval '30 days')
    ),
    'runsPerDay', coalesce((
      select jsonb_agg(jsonb_build_object('day', day, 'runs', runs) order by day)
      from (
        select date_trunc('day', created_at)::date as day, count(*) as runs
        from public.ping_runs
        where created_at > now() - interval '30 days'
        group by 1
      ) d
    ), '[]'::jsonb),
    'runsByGame', coalesce((
      select jsonb_agg(jsonb_build_object('gameId', game_id, 'runs', runs) order by runs desc)
      from (
        select game_id, count(*) as runs
        from public.ping_runs
        where created_at > now() - interval '30 days'
        group by 1
      ) g
    ), '[]'::jsonb),
    'runs7d', (select count(*) from public.ping_runs where created_at > now() - interval '7 days')
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_usage_stats() from public, anon;
grant execute on function public.admin_usage_stats() to authenticated;
