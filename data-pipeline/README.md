# Data Pipeline

This directory contains local scraping and curation scripts for the Web Educacional Acessivel project.

The first scraper collects free courses from Escola Virtual Fundacao Bradesco and saves them into the Supabase `cursos` table with `status = 'pending_review'`.

## Why Pending Review

The scraper never publishes courses automatically. Every collected record is saved as `pending_review` so a human can review it in Supabase before it appears on the site.

Correct flow:

```text
scraper -> pending_review -> human review -> published
```

## Configuration

Create a `.env` file in the project root:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Use `SUPABASE_SERVICE_ROLE_KEY` only in local scripts inside `data-pipeline`. Never place this key in the front-end, in Vite variables with the `VITE_` prefix, or in public React code.

Before running the scraper, execute this SQL in the Supabase SQL Editor:

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

The same SQL is available at `data-pipeline/sql/alter_cursos_for_scraper.sql`.

## How To Run

```bash
node data-pipeline/scrapers/evBradescoScraper.js
```

The script prints:

- number of courses found;
- number of valid courses;
- number of inserted or updated rows;
- the first 3 extracted courses for quick review.

## Automation With GitHub Actions

The workflow lives at `.github/workflows/ev-bradesco-scraper.yml`.

It runs:

- every Monday and Thursday at 11:00 UTC;
- manually from the Actions tab with `workflow_dispatch`.

It uses these GitHub Secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflow runs:

```bash
pnpm scrape:ev-bradesco
```

All imported courses must continue to enter as `pending_review`.

Never place `SUPABASE_SERVICE_ROLE_KEY` in the front-end.
Never commit `.env` or `.env.local`.

## Site-Specific Scrapers

We do not use a universal scraper. Each source should have its own scraper because each site has different HTML, pagination, filters, and rules.

What should be shared across scrapers:

- Supabase connection;
- normalization helpers;
- logs;
- validation;
- the final data format.

## Future Automation

- broken link checks;
- updates for expired deadlines;
- source-specific scrapers for other sites;
- importing exams from INEP and Gov.br.
