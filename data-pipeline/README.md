# Data Pipeline

This directory contains local scraping and curation scripts for the Web Educacional Acessivel project.

The pipeline currently includes:

- a scraper for free courses from Escola Virtual Fundacao Bradesco into `public.cursos`;
- a scraper for ENEM exams and answer keys from INEP Gov.br into `public.provas`.

## Why Pending Review

No scraper publishes content automatically.

Correct flow:

```text
scraper -> pending_review -> human review -> published
```

Every imported row must stay as `pending_review` until someone reviews it in Supabase.

If a row already exists in the database, the scraper preserves the current `status` instead of forcing it back to `pending_review`. Only brand-new rows enter as `pending_review`.

## Configuration

Create a `.env` file in the project root:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Use `SUPABASE_SERVICE_ROLE_KEY` only in local scripts inside `data-pipeline`. Never place this key in the front-end, in `VITE_` variables, or in public React code.

## SQL Before Running

For `public.cursos`:

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

For `public.provas`:

```sql
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
```

The same SQL files are available in:

- `data-pipeline/sql/alter_cursos_for_scraper.sql`
- `data-pipeline/sql/alter_provas_for_scraper.sql`

## Scraper INEP ENEM Provas e Gabaritos

Objective:
collect official ENEM exam and answer-key links from the INEP Gov.br page and save them into `public.provas`.

Official source:
[Provas e Gabaritos do ENEM](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos)

Why Playwright:
the page loads the year tabs with JavaScript, and the initial HTML contains placeholders like `Aguarde. Carregando conteudo da aba...`.

Rules:

- saves every row as `pending_review`;
- never publishes automatically;
- does not download PDFs;
- stores only official links;
- tries to pair `prova` and `gabarito` by year, dia, cor/caderno and keywords when possible.

Install Playwright if needed:

```bash
npm.cmd install playwright
npx playwright install chromium
```

If Windows PowerShell blocks scripts:

```bash
npm.cmd install playwright
npx.cmd playwright install chromium
```

Run:

```bash
node data-pipeline/scrapers/inepEnemProvasScraper.js
```

The scraper logs:

- quantidade de anos encontrados;
- anos processados;
- quantidade de links brutos encontrados;
- quantidade de registros normalizados;
- quantidade de registros validos;
- quantidade importada;
- os 5 primeiros registros para conferencia.

If no useful links are found, the scraper throws a clear error and stores a debug screenshot at `data-pipeline/debug/inep-enem-page.png`.

## Existing Bradesco Scraper

Run:

```bash
node data-pipeline/scrapers/evBradescoScraper.js
```

## Automation

The current GitHub Actions workflow in `.github/workflows/ev-bradesco-scraper.yml` runs only the Bradesco scraper.

Never commit `.env` or `.env.local`.
