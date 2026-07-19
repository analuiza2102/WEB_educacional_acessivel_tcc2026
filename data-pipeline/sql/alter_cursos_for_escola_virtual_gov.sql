alter table public.cursos
add column if not exists slug text unique;

alter table public.cursos
add column if not exists fonte text;

alter table public.cursos
add column if not exists last_scraped_at timestamp with time zone;

alter table public.cursos
add column if not exists link_status text default 'unknown';

alter table public.cursos
add column if not exists last_checked_at timestamp with time zone;

alter table public.cursos
add column if not exists has_certificate boolean;

alter table public.cursos
add column if not exists conteudista text;

alter table public.cursos
add column if not exists idioma text;

alter table public.cursos
add column if not exists carga_horaria_numero integer;
