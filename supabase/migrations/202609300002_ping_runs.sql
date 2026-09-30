-- Game Ping Optimizer storage: one ping_run per optimizer test, one ping_result per target tested.
-- Stats are computed server-side from the raw samples (see lib/latency/stats.ts); the client
-- only submits samples.

create table if not exists public.ping_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_id text not null,
  method text not null default 'browser-http-rtt',
  samples_per_target smallint not null,
  recommended_target_id text,
  connection_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.ping_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.ping_runs (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_id text not null,
  target_id text not null,            -- game region id, or 'custom'
  target_label text not null,
  endpoint_host text not null,
  samples real[] not null,            -- RTT in ms; NULL entries are failed/timed-out requests
  received smallint not null,
  failed smallint not null,
  failure_rate real not null,
  min_ms real,
  median_ms real,
  mean_ms real,
  p95_ms real,
  max_ms real,
  jitter_ms real,
  score real,
  created_at timestamptz not null default now()
);

create index if not exists ping_runs_user_created_idx on public.ping_runs (user_id, created_at desc);
create index if not exists ping_runs_user_game_created_idx on public.ping_runs (user_id, game_id, created_at desc);
create index if not exists ping_results_run_idx on public.ping_results (run_id);
create index if not exists ping_results_user_target_created_idx on public.ping_results (user_id, game_id, target_id, created_at desc);

alter table public.ping_runs enable row level security;
alter table public.ping_runs force row level security;
alter table public.ping_results enable row level security;
alter table public.ping_results force row level security;

drop policy if exists "ping_runs_select_own" on public.ping_runs;
create policy "ping_runs_select_own" on public.ping_runs
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "ping_runs_insert_own" on public.ping_runs;
create policy "ping_runs_insert_own" on public.ping_runs
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "ping_runs_delete_own" on public.ping_runs;
create policy "ping_runs_delete_own" on public.ping_runs
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "ping_results_select_own" on public.ping_results;
create policy "ping_results_select_own" on public.ping_results
  for select to authenticated using ((select auth.uid()) = user_id);

-- A result may only be attached to a run the same user owns.
drop policy if exists "ping_results_insert_own" on public.ping_results;
create policy "ping_results_insert_own" on public.ping_results
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.ping_runs r where r.id = run_id and r.user_id = (select auth.uid()))
  );

drop policy if exists "ping_results_delete_own" on public.ping_results;
create policy "ping_results_delete_own" on public.ping_results
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.ping_runs, public.ping_results from anon;
grant select, insert, delete on public.ping_runs, public.ping_results to authenticated;
