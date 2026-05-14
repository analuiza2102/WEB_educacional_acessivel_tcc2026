# Data Pipeline

Este diretório reúne scripts locais de coleta e curadoria de dados para o projeto Web Educacional Acessível.

O primeiro scraper coleta cursos gratuitos da Escola Virtual Fundação Bradesco e salva os registros na tabela `cursos` do Supabase com `status = 'pending_review'`.

## Por Que Pending Review

O scraper não publica cursos automaticamente. Todo dado coletado entra como `pending_review` para permitir revisão humana no Supabase antes de aparecer no site.

Fluxo correto:

```text
scraper -> pending_review -> revisão humana -> published
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Use a `SUPABASE_SERVICE_ROLE_KEY` apenas em scripts locais dentro de `data-pipeline`. Nunca coloque essa chave no front-end, em arquivos Vite com prefixo `VITE_`, nem em código público do React.

Antes de rodar o scraper, execute no Supabase SQL Editor:

```sql
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
```

O mesmo SQL está em `data-pipeline/sql/alter_cursos_for_scraper.sql`.

## Como Rodar

```bash
node data-pipeline/scrapers/evBradescoScraper.js
```

O script mostra:

- quantidade de cursos encontrados;
- quantidade de cursos válidos;
- quantidade importada/atualizada;
- os 3 primeiros cursos extraídos para conferência.

## Scrapers Específicos

Não usamos scraper genérico universal. Cada site terá um scraper próprio, porque cada fonte tem HTML, paginação, filtros e regras diferentes.

O que deve ser compartilhado entre scrapers:

- conexão com Supabase;
- funções de normalização;
- logs;
- validação;
- formato final dos dados.

## Automações Futuras

- verificação de links quebrados;
- atualização de prazos vencidos;
- scrapers específicos para outros sites;
- importação de provas do INEP/Gov.br.
