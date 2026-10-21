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
- `data-pipeline/sql/alter_cursos_for_escola_virtual_gov.sql`
- `data-pipeline/sql/alter_provas_for_scraper.sql`

For FUVEST, execute `data-pipeline/sql/alter_vestibulares_for_scrapers.sql`
and then `data-pipeline/sql/vestibular_documentos.sql` in the Supabase SQL Editor
before running the current scraper.

## Scraper FUVEST

Fonte oficial: https://www.fuvest.br/vestibular-da-usp/

Comando:

```bash
pnpm scrape:fuvest
```

O coletor usa somente URLs oficiais da FUVEST, identifica a edição automaticamente,
salva seus dados em `public.vestibulares`, o cronograma estruturado em
`public.vestibular_eventos` e os títulos e URLs das publicações em
`public.vestibular_documentos`. O `slug` da edição e a combinação
`vestibular_id, event_key` permitem executar o scraper novamente sem duplicar
registros. Novos vestibulares entram como `pending_review`; decisões editoriais
existentes, inclusive `published` e `archived`, são preservadas.

PDFs não são baixados nem analisados: seus títulos e URLs oficiais são armazenados.
As publicações são lidas somente da seção da edição correspondente.
O calendário da página é lido do HTML com `fetch` e `cheerio`; quando não há
eventos estruturados, o scraper interrompe antes de gravar dados incompletos.
Correções anunciadas oficialmente, mas ainda ausentes no calendário estruturado,
ficam em `data-pipeline/corrections/fuvestEvents.json`, com a fonte e a data antiga
esperada. Se a FUVEST mudar a data para um terceiro valor, a coleta interrompe
para revisão, sem sobrescrever o evento com uma correção vencida.

Teste local sem gravar no banco:

```bash
node data-pipeline/tests/fuvestScraper.test.js
```
As variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` devem estar no
ambiente ou no `.env` local da raiz. A chave de serviço nunca deve ir para o
frontend.

Datas sem horário explícito são registradas como 12h em
`America/Sao_Paulo`; horários publicados pela FUVEST são mantidos nesse fuso.

## Scraper UNESP

Fonte oficial da edição: https://www.vunesp.com.br/VNSP2514. A aba pública
"Editais e Documentos" é carregada de `documento.vunesp.com.br`. O scraper
identifica o Manual do Candidato da edição, extrai o calendário do PDF com
`pdftotext` (Poppler) e salva títulos e URLs dos documentos oficiais.

```bash
node data-pipeline/tests/unespScraper.test.js
pnpm scrape:unesp --dry-run  # lê as fontes oficiais sem escrever no banco
pnpm scrape:unesp            # grava no Supabase
```

Use as mesmas migrações SQL e variáveis de ambiente descritas para a FUVEST.
A página atual da Vunesp prevalece para o prazo de inscrições; se ela divergir
do manual, é obrigatório haver um aviso de prorrogação com data e horário
compatíveis. Outras divergências interrompem a coleta antes da gravação.
O registro entra como `pending_review`; um status editorial existente é
preservado. O `slug`, a chave dos eventos e a URL dos documentos evitam
registros duplicados em novas execuções. A isenção integral é tratada como
encerrada após o prazo, enquanto a redução de 75% para estudantes elegíveis
permanece apenas na descrição oficial da página. Datas do calendário sem
horário explícito são registradas ao meio-dia de São Paulo para apresentação;
períodos de pedido de isenção/redução cobrem o dia civil completo.

## Scraper Escola Virtual de Governo

Objective:
collect free courses from [Escola Virtual de Governo](https://www.escolavirtual.gov.br/catalogo) and save them into `public.cursos`.

The scraper tries to use the official catalog CSV first. If the CSV is unavailable or cannot be identified, it falls back to reading the catalog HTML pages with `fetch` and `cheerio`.

Rules:

- saves new courses as `pending_review`;
- never publishes automatically;
- preserves existing `published`, `archived` and `pending_review` statuses;
- uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in local Node.js scripts;
- never uses the service role key in the front-end.

Run:

```bash
pnpm scrape:escola-virtual-gov
```

Required environment variables:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

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

The Escola Virtual de Governo scraper workflow lives at `.github/workflows/escola-virtual-gov-scraper.yml`.

It runs:

- manually with `workflow_dispatch`;
- every Tuesday and Friday at 11:00 UTC.

It uses these GitHub Secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflow runs:

```bash
pnpm install --frozen-lockfile
pnpm scrape:escola-virtual-gov
```

The INEP ENEM scraper workflow lives at `.github/workflows/inep-enem-scraper.yml`.

It runs:

- manually with `workflow_dispatch`;
- every Wednesday at 12:00 UTC.

It uses these GitHub Secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflow runs:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm scrape:inep-enem
```

The FUVEST scraper workflow lives at `.github/workflows/fuvest-scraper.yml`.
It runs manually with `workflow_dispatch` and daily at 11:17 UTC. It uses
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as GitHub Secrets, checks the
FUVEST parser, then runs `pnpm scrape:fuvest`. The two FUVEST SQL migrations
above must already be applied. Scheduled runs start only after the workflow
is on the repository's default branch; a feature branch can be run manually
for testing once GitHub recognizes the workflow.

The UNESP scraper workflow lives at `.github/workflows/unesp-scraper.yml`.
It runs manually with `workflow_dispatch` and daily at 12:41 UTC, installs
Poppler, tests the parser, then runs `pnpm scrape:unesp`. It needs the same
two GitHub Secrets and the vestibular SQL migrations above. Its schedule
starts after the workflow reaches the default branch.

Never commit `.env` or `.env.local`.
