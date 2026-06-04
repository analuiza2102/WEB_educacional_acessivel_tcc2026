import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { cleanText, normalizeProva, slugify } from '../normalizers/enemProvaNormalizer.js';
import { preserveExistingStatus } from '../utils/preserveExistingStatus.js';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';
import { validateProva } from '../validators/validateProva.js';

const OFFICIAL_PAGE_URL =
  'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos';
const USER_AGENT = 'WebEducacionalAcessivelTCC/1.0 academic scraper';
const YEARS_TO_SCRAPE = [];
const DEBUG_SCREENSHOT_PATH = 'data-pipeline/debug/inep-enem-page.png';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isUsefulExamLink({ title, href }) {
  if (!href) return false;

  const normalizedTitle = slugify(title);
  const normalizedHref = href.toLowerCase();

  if (normalizedHref.includes('download.inep.gov.br')) return true;
  if (/\.(pdf|zip|txt)(\?|$)/i.test(normalizedHref)) return true;

  return /(prova|gabarito)/i.test(normalizedTitle);
}

function classifyLink(raw) {
  const normalized = slugify(`${raw.title} ${raw.href}`);

  return {
    isAnswerKey: normalized.includes('gabarito'),
    day:
      normalized.includes('primeiro-dia') || normalized.includes('dia-1') || normalized.includes('1-dia')
        ? 'dia1'
        : normalized.includes('segundo-dia') || normalized.includes('dia-2') || normalized.includes('2-dia')
          ? 'dia2'
          : 'geral',
    booklet:
      ['amarelo', 'azul', 'branco', 'rosa', 'cinza', 'verde'].find(color => normalized.includes(color)) ?? 'geral',
    accessibility:
      normalized.includes('libras')
        ? 'libras'
        : normalized.includes('braile') || normalized.includes('braille')
          ? 'braille'
          : normalized.includes('superampliada')
            ? 'superampliada'
            : normalized.includes('ampliada')
              ? 'ampliada'
              : 'padrao',
    application:
      normalized.includes('digital')
        ? 'digital'
        : normalized.includes('reaplicacao')
          ? 'reaplicacao'
          : normalized.includes('ppl')
            ? 'ppl'
            : 'regular'
  };
}

function createPairingKey(raw, classification) {
  return [
    raw.year,
    classification.application,
    classification.day,
    classification.booklet,
    classification.accessibility
  ].join('|');
}

function mergePair(prova, gabarito) {
  return {
    ...prova,
    url_gabarito: gabarito.url_arquivo,
    gabarito: true,
    tags: [...new Set([...(prova.tags ?? []), 'gabarito'])]
  };
}

function dedupeBySlug(rows) {
  const deduped = new Map();

  for (const row of rows) {
    if (!row?.slug) continue;
    deduped.set(row.slug, {
      ...deduped.get(row.slug),
      ...row
    });
  }

  return [...deduped.values()];
}

function pairNormalizedRows(rawLinks) {
  const provas = [];
  const gabaritos = [];

  for (const raw of rawLinks) {
    const classification = classifyLink(raw);
    const normalized = normalizeProva(raw);
    const entry = {
      raw,
      normalized,
      classification,
      key: createPairingKey(raw, classification)
    };

    if (classification.isAnswerKey) {
      gabaritos.push(entry);
    } else {
      provas.push(entry);
    }
  }

  const gabaritosByKey = new Map();

  for (const entry of gabaritos) {
    if (!gabaritosByKey.has(entry.key)) {
      gabaritosByKey.set(entry.key, []);
    }

    gabaritosByKey.get(entry.key).push(entry);
  }

  const pairedRows = [];
  const usedAnswerKeys = new Set();

  for (const prova of provas) {
    const exactMatches = gabaritosByKey.get(prova.key) ?? [];
    const unusedExact = exactMatches.find(candidate => !usedAnswerKeys.has(candidate.normalized.slug));

    if (unusedExact) {
      usedAnswerKeys.add(unusedExact.normalized.slug);
      pairedRows.push(mergePair(prova.normalized, unusedExact.normalized));
      continue;
    }

    const fallback = gabaritos.find(candidate => {
      if (usedAnswerKeys.has(candidate.normalized.slug)) return false;

      return (
        candidate.raw.year === prova.raw.year &&
        candidate.classification.application === prova.classification.application &&
        candidate.classification.day === prova.classification.day
      );
    });

    if (fallback) {
      usedAnswerKeys.add(fallback.normalized.slug);
      pairedRows.push(mergePair(prova.normalized, fallback.normalized));
      continue;
    }

    pairedRows.push(prova.normalized);
  }

  for (const gabarito of gabaritos) {
    if (usedAnswerKeys.has(gabarito.normalized.slug)) continue;

    pairedRows.push({
      ...gabarito.normalized,
      titulo: gabarito.normalized.titulo.includes('Gabarito')
        ? gabarito.normalized.titulo
        : `Gabarito ${gabarito.normalized.titulo}`,
      gabarito: true,
      url_arquivo: gabarito.normalized.url_arquivo,
      url_gabarito: gabarito.normalized.url_arquivo
    });
  }

  return dedupeBySlug(pairedRows).map(row => ({
    ...row,
    status: 'pending_review',
    fonte: 'scraper_inep_enem',
    last_scraped_at: new Date().toISOString()
  }));
}

async function getYearTabs(page) {
  return page.evaluate(() => {
    const candidates = [...document.querySelectorAll('button, a, [role="tab"], li, span')]
      .map(element => ({
        text: (element.textContent || '').trim(),
        tagName: element.tagName.toLowerCase(),
        ariaControls: element.getAttribute('aria-controls'),
        href: element.getAttribute('href'),
        id: element.id || null
      }))
      .filter(item => /^\d{4}$/.test(item.text));

    return [...new Map(candidates.map(item => [item.text, item])).values()].sort((a, b) => Number(b.text) - Number(a.text));
  });
}

async function activateYear(page, year) {
  const yearText = String(year);

  const clicked = await page.evaluate(targetYear => {
    const candidates = [...document.querySelectorAll('button, a, [role="tab"]')];

    for (const element of candidates) {
      const text = (element.textContent || '').trim();
      if (text !== targetYear) continue;

      element.scrollIntoView({ behavior: 'instant', block: 'center' });
      element.click();
      return true;
    }

    return false;
  }, yearText);

  if (!clicked) {
    throw new Error(`Nao foi possivel ativar a aba do ano ${year}.`);
  }

  await delay(800);
  await page.waitForFunction(
    targetYear => {
      const bodyText = document.body.innerText || '';
      const loadingCount = [...document.querySelectorAll('.tab-content')]
        .filter(node => (node.textContent || '').includes('Aguarde. Carregando'))
        .length;

      return bodyText.includes(targetYear) && loadingCount < 30;
    },
    yearText,
    { timeout: 10000 }
  ).catch(() => null);
}

function buildYearPageUrl(year) {
  return `${OFFICIAL_PAGE_URL}/${year}`;
}

async function collectLinksForYear(page, year) {
  const yearPageUrl = buildYearPageUrl(year);

  await page.goto(yearPageUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await delay(1200);

  return page.evaluate(
    ({ targetYear, officialPageUrl }) => {
      function clean(value) {
        return String(value || '')
          .replace(/[\r\n\t]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      function absolute(href) {
        if (!href) return null;

        try {
          return new URL(href, officialPageUrl).toString();
        } catch {
          return null;
        }
      }

      const container = document.querySelector('#parent-fieldname-text') || document.querySelector('#content-core');
      if (!container) return [];

      const sectionLabels = new WeakMap();
      let currentSection = '';
      let currentContext = '';

      for (const child of [...container.children]) {
        const tag = child.tagName.toLowerCase();
        const text = clean(child.textContent);

        if (!text) continue;

        if (/^h[1-6]$/.test(tag)) {
          currentSection = text;
          currentContext = '';
          continue;
        }

        if (tag === 'p') {
          currentContext = text;
          continue;
        }

        if (tag === 'ul' || tag === 'ol') {
          for (const link of child.querySelectorAll('a[href]')) {
            const linkText = clean(link.textContent || link.getAttribute('title') || '');
            const href = absolute(link.getAttribute('href'));
            if (!linkText || !href) continue;

            sectionLabels.set(link, [currentSection, currentContext].filter(Boolean).join(' - '));
          }
        }
      }

      return [...container.querySelectorAll('a[href]')].map(link => {
        const linkText = clean(link.textContent || link.getAttribute('title') || '');
        const contextText = sectionLabels.get(link) || '';

        return {
          title: [contextText, linkText].filter(Boolean).join(' - '),
          href: absolute(link.getAttribute('href')),
          year: Number(targetYear),
          officialPageUrl
        };
      });
    },
    { targetYear: String(year), officialPageUrl: yearPageUrl }
  );
}

async function saveProvas(rows) {
  if (rows.length === 0) return [];

  const { rows: rowsToUpsert, preservedCount, newCount } = await preserveExistingStatus('provas', rows);
  const { data, error } = await supabaseAdmin
    .from('provas')
    .upsert(rowsToUpsert, { onConflict: 'slug' })
    .select();

  if (error) {
    throw new Error(`Erro ao salvar provas no Supabase: ${error.message}`);
  }

  console.log(`Provas novas: ${newCount}`);
  console.log(`Provas com status preservado: ${preservedCount}`);
  return data ?? [];
}

async function scrapeInepEnemProvas() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();
  const processedYears = [];
  const rawLinks = [];

  try {
    await page.goto(OFFICIAL_PAGE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await delay(2500);

    const detectedYears = await getYearTabs(page);
    const availableYears = detectedYears.map(item => Number(item.text)).filter(Number.isFinite);
    const yearsToProcess =
      YEARS_TO_SCRAPE.length > 0
        ? YEARS_TO_SCRAPE.filter(year => availableYears.includes(year))
        : availableYears;

    console.log(`Quantidade de anos encontrados: ${availableYears.length}`);
    console.log(`Anos detectados: ${availableYears.join(', ')}`);

    for (const year of yearsToProcess) {
      console.log(`Processando ano ${year}...`);
      const yearLinks = await collectLinksForYear(page, year);
      const usefulLinks = yearLinks.filter(isUsefulExamLink);

      rawLinks.push(...usefulLinks);
      processedYears.push(year);
      console.log(`Links uteis encontrados no ano ${year}: ${usefulLinks.length}`);
      await delay(500);
    }

    if (rawLinks.length === 0) {
      await mkdir('data-pipeline/debug', { recursive: true });
      await page.screenshot({ path: DEBUG_SCREENSHOT_PATH, fullPage: true });
      throw new Error(
        'Nenhum link de prova/gabarito encontrado. A estrutura do Gov.br pode ter mudado ou o conteudo pode estar carregando por endpoint especifico.'
      );
    }

    const normalizedRows = pairNormalizedRows(rawLinks);
    const validations = normalizedRows.map(row => ({
      row,
      validation: validateProva(row)
    }));
    const validRows = validations.filter(item => item.validation.valid).map(item => item.row);
    const invalidRows = validations.filter(item => !item.validation.valid);

    return {
      availableYears,
      processedYears,
      rawLinks,
      normalizedRows,
      validRows,
      invalidRows
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  const result = await scrapeInepEnemProvas();

  console.log(`Anos processados: ${result.processedYears.join(', ')}`);
  console.log(`Quantidade de links brutos encontrados: ${result.rawLinks.length}`);
  console.log(`Quantidade de registros normalizados: ${result.normalizedRows.length}`);
  console.log(`Quantidade de registros validos: ${result.validRows.length}`);

  if (result.invalidRows.length > 0) {
    console.warn('Registros invalidos encontrados:');
    console.table(
      result.invalidRows.slice(0, 5).map(item => ({
        titulo: item.row.titulo,
        ano: item.row.ano,
        errors: item.validation.errors.join('; ')
      }))
    );
  }

  console.log('Primeiros 5 registros para conferencia:');
  console.table(
    result.validRows.slice(0, 5).map(row => ({
      titulo: row.titulo,
      ano: row.ano,
      area: row.area,
      url_arquivo: row.url_arquivo,
      url_gabarito: row.url_gabarito
    }))
  );

  const importedRows = await saveProvas(result.validRows);
  console.log(`Quantidade importada: ${importedRows.length}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

export { YEARS_TO_SCRAPE, scrapeInepEnemProvas, saveProvas, main };
