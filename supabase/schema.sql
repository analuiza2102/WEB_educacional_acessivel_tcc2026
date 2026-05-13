create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cursos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  plataforma text not null,
  area text not null,
  gratuito boolean not null default true,
  duracao text,
  nivel text,
  descricao text,
  link text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vestibulares (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text,
  nivel text,
  prazo text,
  inscricoes_abertas boolean not null default false,
  isencao_disponivel boolean not null default false,
  acessibilidade text[] not null default '{}',
  descricao text,
  passos text[] not null default '{}',
  documentos text[] not null default '{}',
  datas jsonb not null default '[]'::jsonb,
  link_oficial text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  instituicao text not null,
  ano integer not null,
  tipo text,
  area text,
  nivel text,
  formato text not null default 'pdf',
  url_arquivo text,
  url_gabarito text,
  url_oficial text,
  gabarito boolean not null default false,
  resolucao boolean not null default false,
  numero_questoes integer not null default 0,
  tags text[] not null default '{}',
  download_count integer not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cursos_status on public.cursos(status);
create index if not exists idx_cursos_area on public.cursos(area);
create index if not exists idx_cursos_plataforma on public.cursos(plataforma);
create index if not exists idx_vestibulares_status on public.vestibulares(status);
create index if not exists idx_vestibulares_tipo on public.vestibulares(tipo);
create index if not exists idx_vestibulares_inscricoes on public.vestibulares(inscricoes_abertas);
create index if not exists idx_provas_status on public.provas(status);
create index if not exists idx_provas_instituicao on public.provas(instituicao);
create index if not exists idx_provas_ano on public.provas(ano desc);

drop trigger if exists set_cursos_updated_at on public.cursos;
create trigger set_cursos_updated_at
before update on public.cursos
for each row execute function public.set_updated_at();

drop trigger if exists set_vestibulares_updated_at on public.vestibulares;
create trigger set_vestibulares_updated_at
before update on public.vestibulares
for each row execute function public.set_updated_at();

drop trigger if exists set_provas_updated_at on public.provas;
create trigger set_provas_updated_at
before update on public.provas
for each row execute function public.set_updated_at();

alter table public.cursos enable row level security;
alter table public.vestibulares enable row level security;
alter table public.provas enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cursos'
      and policyname = 'Public can read published cursos'
  ) then
    create policy "Public can read published cursos"
    on public.cursos for select
    using (status = 'published');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'vestibulares'
      and policyname = 'Public can read published vestibulares'
  ) then
    create policy "Public can read published vestibulares"
    on public.vestibulares for select
    using (status = 'published');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'provas'
      and policyname = 'Public can read published provas'
  ) then
    create policy "Public can read published provas"
    on public.provas for select
    using (status = 'published');
  end if;
end;
$$;

create or replace function public.increment_prova_download_count(prova_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.provas
  set download_count = download_count + 1
  where id = prova_id
    and status = 'published';
end;
$$;

grant execute on function public.increment_prova_download_count(uuid) to anon, authenticated;

insert into public.cursos (
  id, nome, plataforma, area, gratuito, duracao, nivel, descricao, link, status
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Introdução à Programação',
    'Fundação Bradesco',
    'Tecnologia',
    true,
    '40 horas',
    'Iniciante',
    'Curso introdutório para aprender fundamentos de programação.',
    'https://www.ev.org.br',
    'published'
  ),
  (
    '11111111-1111-1111-1111-111111111112',
    'Libras Básico',
    'Escola Virtual Gov',
    'Acessibilidade',
    true,
    '60 horas',
    'Iniciante',
    'Curso gratuito de introdução à Língua Brasileira de Sinais.',
    'https://www.escolavirtual.gov.br',
    'published'
  )
on conflict (id) do update set
  nome = excluded.nome,
  plataforma = excluded.plataforma,
  area = excluded.area,
  gratuito = excluded.gratuito,
  duracao = excluded.duracao,
  nivel = excluded.nivel,
  descricao = excluded.descricao,
  link = excluded.link,
  status = excluded.status;

insert into public.vestibulares (
  id, nome, tipo, nivel, prazo, inscricoes_abertas, isencao_disponivel,
  acessibilidade, descricao, passos, documentos, datas, link_oficial, status
) values (
  '22222222-2222-2222-2222-222222222221',
  'ENEM - Exame Nacional do Ensino Médio',
  'Nacional',
  'Ensino Superior',
  'Consultar cronograma oficial do INEP',
  false,
  true,
  array['Prova em Braille', 'Tempo adicional', 'Ledores', 'Intérprete de Libras'],
  'O ENEM é uma das principais portas de entrada para o ensino superior no Brasil.',
  array[
    'Acesse o site oficial do INEP',
    'Entre com sua conta gov.br',
    'Preencha os dados de inscrição',
    'Solicite atendimento especializado, se necessário'
  ],
  array['CPF', 'Documento de identidade', 'Conta gov.br'],
  '[
    {"evento": "Inscrições", "data": "Consultar edital oficial"},
    {"evento": "Provas", "data": "Consultar cronograma oficial"}
  ]'::jsonb,
  'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem',
  'published'
)
on conflict (id) do update set
  nome = excluded.nome,
  tipo = excluded.tipo,
  nivel = excluded.nivel,
  prazo = excluded.prazo,
  inscricoes_abertas = excluded.inscricoes_abertas,
  isencao_disponivel = excluded.isencao_disponivel,
  acessibilidade = excluded.acessibilidade,
  descricao = excluded.descricao,
  passos = excluded.passos,
  documentos = excluded.documentos,
  datas = excluded.datas,
  link_oficial = excluded.link_oficial,
  status = excluded.status;

insert into public.provas (
  id, titulo, instituicao, ano, tipo, area, nivel, formato,
  url_arquivo, url_gabarito, url_oficial, gabarito, resolucao,
  numero_questoes, tags, status
) values (
  '33333333-3333-3333-3333-333333333331',
  'ENEM - Provas e Gabaritos',
  'INEP',
  2023,
  'Completa',
  null,
  'Ensino Médio',
  'pdf',
  null,
  null,
  'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
  true,
  false,
  180,
  array['enem', 'inep', 'provas', 'gabaritos'],
  'published'
)
on conflict (id) do update set
  titulo = excluded.titulo,
  instituicao = excluded.instituicao,
  ano = excluded.ano,
  tipo = excluded.tipo,
  area = excluded.area,
  nivel = excluded.nivel,
  formato = excluded.formato,
  url_arquivo = excluded.url_arquivo,
  url_gabarito = excluded.url_gabarito,
  url_oficial = excluded.url_oficial,
  gabarito = excluded.gabarito,
  resolucao = excluded.resolucao,
  numero_questoes = excluded.numero_questoes,
  tags = excluded.tags,
  status = excluded.status;
