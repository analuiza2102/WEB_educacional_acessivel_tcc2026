-- Configuracao de autenticacao e autorizacao do painel gestor.
-- Execute este arquivo no SQL Editor do Supabase.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null default 'user',
  created_at timestamp with time zone default now()
);

alter table public.cursos
add column if not exists review_notes text;

alter table public.cursos
add column if not exists reviewed_by uuid references auth.users(id);

alter table public.cursos
add column if not exists reviewed_at timestamp with time zone;

-- Campos exibidos no painel e tambem usados pelos scrapers. As clausulas
-- "if not exists" mantem este script compativel com bases ja migradas.
alter table public.cursos
add column if not exists fonte text;

alter table public.cursos
add column if not exists last_scraped_at timestamp with time zone;

create or replace function public.is_gestor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('gestor', 'admin')
  );
$$;

-- A funcao e usada pelas policies e nao precisa ficar disponivel para visitantes.
revoke execute on function public.is_gestor_or_admin() from public;
grant execute on function public.is_gestor_or_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.cursos enable row level security;

-- Privilegios de tabela e RLS trabalham em conjunto. Somente contas autenticadas
-- recebem UPDATE; a policy abaixo ainda exige role gestor/admin para cada linha.
grant select on table public.profiles to authenticated;
revoke insert, update, delete on table public.profiles from anon, authenticated;

grant select on table public.cursos to anon, authenticated;
grant update on table public.cursos to authenticated;
revoke insert, delete on table public.cursos from anon, authenticated;
revoke update on table public.cursos from anon;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Gestores can read profiles" on public.profiles;
create policy "Gestores can read profiles"
on public.profiles
for select
using (public.is_gestor_or_admin());

drop policy if exists "Public can read published cursos" on public.cursos;
create policy "Public can read published cursos"
on public.cursos
for select
using (status = 'published');

drop policy if exists "Gestores can read all cursos" on public.cursos;
create policy "Gestores can read all cursos"
on public.cursos
for select
using (public.is_gestor_or_admin());

drop policy if exists "Gestores can update cursos" on public.cursos;
create policy "Gestores can update cursos"
on public.cursos
for update
using (public.is_gestor_or_admin())
with check (public.is_gestor_or_admin());

-- Nao ha policies de INSERT ou DELETE para anon/authenticated. Assim, o front
-- comum nao pode criar nem excluir cursos. Scrapers devem continuar usando a
-- service role somente em ambiente confiavel (script local ou GitHub Actions).

-- Como criar o primeiro gestor:
-- 1. Criar usuario em Authentication > Users no Supabase.
-- 2. Copiar o UUID do usuario.
-- 3. Rodar:
-- insert into public.profiles (id, nome, role)
-- values ('UUID_DO_USUARIO', 'Gestor Principal', 'gestor');
