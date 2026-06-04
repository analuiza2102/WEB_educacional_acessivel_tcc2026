alter table public.provas
add column if not exists slug text unique;

alter table public.provas
add column if not exists fonte text;

alter table public.provas
add column if not exists last_scraped_at timestamp with time zone;

alter table public.provas
add column if not exists link_status text default 'unknown';

alter table public.provas
add column if not exists last_checked_at timestamp with time zone;
