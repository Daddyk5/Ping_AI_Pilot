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

create index if not exists ping_history_created_at_idx
  on public.ping_history (created_at desc);

-- alter table public.ping_history enable row level security;

comment on table public.ping_history is
  'PingPilot AI backend-only latency test history. Access through Next.js API routes using the Supabase service role key.';
