-- Run this once in Supabase Dashboard > SQL Editor.
-- The backend's secret key is the only client allowed to read or change these rows.
create table if not exists public.site_content (
  key text primary key check (key in ('packages.json', 'vehicles.json', 'blog.json')),
  value jsonb not null
);

alter table public.site_content enable row level security;
revoke all on table public.site_content from anon, authenticated;
grant select, insert, update, delete on table public.site_content to service_role;
