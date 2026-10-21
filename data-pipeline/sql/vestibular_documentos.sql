-- Execute depois de alter_vestibulares_for_scrapers.sql, antes de rodar a nova versão do scraper FUVEST.
-- Guarda títulos e URLs das publicações oficiais sem confundi-las com documentos exigidos do candidato.
create table if not exists public.vestibular_documentos (
  id uuid primary key default gen_random_uuid(),
  vestibular_id uuid not null references public.vestibulares(id) on delete cascade,
  url text not null,
  titulo text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vestibular_id, url)
);

create index if not exists idx_vestibular_documentos_ordem
  on public.vestibular_documentos (vestibular_id, ordem);

drop trigger if exists set_vestibular_documentos_updated_at on public.vestibular_documentos;
create trigger set_vestibular_documentos_updated_at
before update on public.vestibular_documentos
for each row execute function public.set_updated_at();

alter table public.vestibular_documentos enable row level security;
grant select on public.vestibular_documentos to anon, authenticated;
revoke insert, update, delete on public.vestibular_documentos from anon, authenticated;

drop policy if exists "Public can read published vestibular documentos" on public.vestibular_documentos;
create policy "Public can read published vestibular documentos"
on public.vestibular_documentos for select
using (exists (
  select 1 from public.vestibulares v
  where v.id = vestibular_id and v.status = 'published'
));
