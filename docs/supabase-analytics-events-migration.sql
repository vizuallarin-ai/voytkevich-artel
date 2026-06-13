-- Supabase migration: analytics_events (Stage 17)
-- Apply when ANALYTICS_STORAGE=supabase

create table if not exists public.analytics_events (
  id uuid primary key,
  name text not null,
  category text not null,
  timestamp timestamptz not null default now(),
  session_id text,
  visitor_id text,
  lead_id uuid references public.leads(id) on delete set null,
  page jsonb default '{}'::jsonb,
  source jsonb default '{}'::jsonb,
  context jsonb default '{}'::jsonb,
  action jsonb default '{}'::jsonb,
  metrics jsonb default '{}'::jsonb,
  meta jsonb default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_timestamp on public.analytics_events (timestamp desc);
create index if not exists idx_analytics_events_name on public.analytics_events (name);
create index if not exists idx_analytics_events_category on public.analytics_events (category);
create index if not exists idx_analytics_events_session_id on public.analytics_events (session_id);
create index if not exists idx_analytics_events_lead_id on public.analytics_events (lead_id);

alter table public.analytics_events add column if not exists payload jsonb not null default '{}'::jsonb;

alter table public.analytics_events enable row level security;

create policy "service_role_all_analytics_events"
  on public.analytics_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
