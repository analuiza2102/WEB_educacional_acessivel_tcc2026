-- Execute no SQL Editor do Supabase antes de rodar o scraper FUVEST.
alter table public.vestibulares add column if not exists slug text unique;
alter table public.vestibulares add column if not exists instituicao text;
alter table public.vestibulares add column if not exists organizadora text;
alter table public.vestibulares add column if not exists edicao text;
alter table public.vestibulares add column if not exists ano integer;
alter table public.vestibulares add column if not exists situacao text;
alter table public.vestibulares add column if not exists inscricao_inicio timestamptz;
alter table public.vestibulares add column if not exists inscricao_fim timestamptz;
alter table public.vestibulares add column if not exists taxa_inscricao numeric(10,2);
alter table public.vestibulares add column if not exists isencao_inicio timestamptz;
alter table public.vestibulares add column if not exists isencao_fim timestamptz;
alter table public.vestibulares add column if not exists edital_url text;
alter table public.vestibulares add column if not exists manual_url text;
alter table public.vestibulares add column if not exists guia_inclusao_url text;
alter table public.vestibulares add column if not exists inscricao_url text;
alter table public.vestibulares add column if not exists fonte text;
alter table public.vestibulares add column if not exists fonte_url text;
alter table public.vestibulares add column if not exists last_scraped_at timestamptz;
alter table public.vestibulares add column if not exists last_checked_at timestamptz;
alter table public.vestibulares add column if not exists review_notes text;

create table if not exists public.vestibular_eventos (
  id uuid primary key default gen_random_uuid(),
  vestibular_id uuid not null references public.vestibulares(id) on delete cascade,
  event_key text not null,
  tipo text,
  titulo text not null,
  data_inicio timestamptz,
  data_fim timestamptz,
  descricao text,
  ordem integer default 0,
  fonte_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (vestibular_id, event_key)
);

create index if not exists idx_vestibular_eventos_vestibular_ordem
  on public.vestibular_eventos (vestibular_id, ordem);

drop trigger if exists set_vestibular_eventos_updated_at on public.vestibular_eventos;
create trigger set_vestibular_eventos_updated_at
before update on public.vestibular_eventos
for each row execute function public.set_updated_at();

alter table public.vestibular_eventos enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'vestibular_eventos'
      and policyname = 'Public can read published vestibular eventos'
  ) then
    create policy "Public can read published vestibular eventos"
    on public.vestibular_eventos for select
    using (exists (
      select 1 from public.vestibulares v
      where v.id = vestibular_id and v.status = 'published'
    ));
  end if;
end;
$$;
