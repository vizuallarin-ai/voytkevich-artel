-- Supabase migration: leads table (Stage 14 + VPS production)
-- Apply when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set and LEADS_STORAGE=supabase

create table if not exists public.leads (
  id uuid primary key,
  status text not null default 'new',
  source_type text not null,
  source_name text,
  page_slug text,
  current_url text,
  referrer text,
  cta_label text,
  name text not null,
  phone text not null,
  messenger text,
  email text,
  request_type text not null,
  request_title text,
  comment text,
  context jsonb not null default '{}'::jsonb,
  qualification jsonb not null default '{}'::jsonb,
  analytics jsonb not null default '{}'::jsonb,
  lead_score integer,
  readiness text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_source_type_idx on public.leads (source_type);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_readiness_idx on public.leads (readiness);

alter table public.leads add column if not exists payload jsonb not null default '{}'::jsonb;

-- RLS: service role only (dashboard uses server-side key)
alter table public.leads enable row level security;

create policy "service_role_all_leads"
  on public.leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
