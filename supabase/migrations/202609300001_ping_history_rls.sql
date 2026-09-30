-- Make ping_history per-user and enforce ownership with Row Level Security.
-- Idempotent: safe on a fresh project and on one that already has the old table.

create table if not exists public.ping_history (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  region text not null,
  current_ping int,
  average_ping int,
  lowest_ping int,
  highest_ping int,
  jitter int,
  packet_loss numeric,
  score numeric,
  stability text,
  mode text,
  created_at timestamptz default now()
);

alter table public.ping_history
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- Legacy rows were written by the service role with no owner and cannot be attributed
-- to any user. Decision (2026-09-30): drop them.
delete from public.ping_history where user_id is null;

alter table public.ping_history
  alter column user_id set not null,
  alter column user_id set default auth.uid();

create index if not exists ping_history_user_created_idx
  on public.ping_history (user_id, created_at desc);

drop index if exists public.ping_history_created_at_idx;

alter table public.ping_history enable row level security;
-- Also apply RLS to the table owner, so a misconfigured role can't bypass it.
alter table public.ping_history force row level security;

drop policy if exists "ping_history_select_own" on public.ping_history;
create policy "ping_history_select_own" on public.ping_history
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "ping_history_insert_own" on public.ping_history;
create policy "ping_history_insert_own" on public.ping_history
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "ping_history_delete_own" on public.ping_history;
create policy "ping_history_delete_own" on public.ping_history
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- No update policy: history rows are immutable.
-- The anon role gets no policies, so it cannot read or write anything.

revoke all on public.ping_history from anon;
grant select, insert, delete on public.ping_history to authenticated;

comment on table public.ping_history is
  'Per-user latency test history. Accessed with the user''s own session; RLS restricts every row to its owner.';
