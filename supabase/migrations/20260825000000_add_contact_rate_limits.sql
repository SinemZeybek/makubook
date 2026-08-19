-- Tracks contact-form submissions per IP so the API route can rate-limit abuse.
-- No public policies: only the service role (used server-side in the API route) can read/write this.
create table public.contact_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  created_at timestamptz not null default now()
);

create index contact_rate_limits_ip_created_idx
  on public.contact_rate_limits (ip_address, created_at);

alter table public.contact_rate_limits enable row level security;
