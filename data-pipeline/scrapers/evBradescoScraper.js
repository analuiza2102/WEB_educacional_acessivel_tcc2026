import * as cheerio from 'cheerio';
import { fileURLToPath } from 'node:url';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';

const BASE_URL = 'https://www.ev.org.br';
const START_URL = `${BASE_URL}/cursos`;
const SOURCE = 'scraper_ev_bradesco';
const PLATFORM = 'Escola Virtual Fundação Bradesco';
const DEFAULT_AREA = 'A definir';
const MAX_PAGES = 30;

function cleanText(text) {
  return String(text ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return cleanText(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toAbsoluteUrl(href) {
  if (!href || href.startsWith('#')) return null;

  try {
    return new URL(href, BASE_URL).toString();
  } catch {
    return null;
  }
}

function isTrustedCourseLink(link) {
  if (!link) return false;

  try {
    const url = new URL(link);
    return url.hostname === 'www.ev.org.br' && url.pathname.startsWith('/cursos/');
  } catch {
    return false;
  }
}

function extractDuration(text) {
  const match = cleanText(text).match(/Duração\s*([0-9]+h)/i);
  return match?.[1] ?? null;
}

function extractLevel(text) {
  const match = cleanText(text).match(/Nível\s*([A-Za-zÀ-ÿ\s]+?)(?:Favoritar|Duração|$)/i);
  return match?.[1] ? cleanText(match[1]) : null;
}

function cleanDescription(text) {
  return cleanText(text)
    .replace(/Duração\s*[0-9]+h/gi, '')
    .replace(/Nível\s*[A-Za-zÀ-ÿ\s]+/gi, '')
    .replace(/Favoritar/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectAreaFromStructure() {
  return DEFAULT_AREA;
}

function extractCourseFromCard($, article, scrapedAt) {
  const $article = $(article);
  const nome = cleanText($article.find('h3').first().text());
  const descriptionText = cleanText($article.find('.m-card_desc').first().text());
  const fullText = cleanText($article.text());
  const durationText =
    cleanText(
      $article
        .find('.m-card_info')
        .filter((_, info) => /Duração/i.test($(info).text()))
        .first()
        .find('strong')
        .text()
    ) || extractDuration(fullText);
  const levelText =
    cleanText(
      $article
        .find('.m-card_info')
        .filter((_, info) => /Nível/i.test($(info).text()))
        .first()
        .find('strong')
        .text()
    ) || extractLevel(fullText);
  const href =
    $article.find('a.m-card_link').first().attr('href') ||
    $article.find('h3').closest('a').attr('href') ||
    $article.find('a[href*="/cursos/"]').first().attr('href');
  const link = toAbsoluteUrl(href);
  const slug = slugify(nome);

  if (!nome || !slug || !isTrustedCourseLink(link)) return null;

  return {
    nome,
    slug,
    plataforma: PLATFORM,
    area: detectAreaFromStructure($article),
    gratuito: true,
    duracao: durationText,
    nivel: levelText,
    descricao: cleanDescription(descriptionText || fullText),
    link,
    status: 'pending_review',
    fonte: SOURCE,
    last_scraped_at: scrapedAt
  };
}

function extractCourseFromHeading($, heading, scrapedAt) {
  const $heading = $(heading);
  const nome = cleanText($heading.text());
  const slug = slugify(nome);
  const $container = $heading.closest('article, li, section, div');
  const href =
    $heading.closest('a').attr('href') ||
    $heading.find('a').first().attr('href') ||
    $container.find('a[href*="/cursos/"]').first().attr('href');
  const link = toAbsoluteUrl(href);

  if (!nome || !slug || !isTrustedCourseLink(link)) return null;

  const nearbyTextParts = [];
  let current = $heading.next();

  while (current.length && !/^h[1-6]$/i.test(current.prop('tagName') ?? '')) {
    nearbyTextParts.push(current.text());
    current = current.next();
  }

  const nearbyText = cleanText(nearbyTextParts.join(' ') || $container.text());

  return {
    nome,
    slug,
    plataforma: PLATFORM,
    area: detectAreaFromStructure($container),
    gratuito: true,
    duracao: extractDuration(nearbyText),
    nivel: extractLevel(nearbyText),
    descricao: cleanDescription(nearbyText.replace(nome, '')),
    link,
    status: 'pending_review',
    fonte: SOURCE,
    last_scraped_at: scrapedAt
  };
}

function extractCourseData($) {
  const scrapedAt = new Date().toISOString();
  const courses = [];

  $('article.m-card').each((_, article) => {
    const course = extractCourseFromCard($, article, scrapedAt);
    if (course) courses.push(course);
  });

  if (courses.length === 0) {
    $('h3').each((_, heading) => {
      const course = extractCourseFromHeading($, heading, scrapedAt);
      if (course) courses.push(course);
    });
  }

  return courses;
}

function getNextPageUrl($, currentUrl) {
  const nextHref = $('a')
    .filter((_, link) => /Próxima página|Próxima|Avançar/i.test(cleanText($(link).text())))
    .first()
    .attr('href');

  if (!nextHref) return null;

  const nextUrl = toAbsoluteUrl(nextHref);
  if (!nextUrl || nextUrl === currentUrl) return null;

  return nextUrl;
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WebEducacionalAcessivelTCC2026/1.0 (scraper academico; contato via projeto TCC)',
      Accept: 'text/html,application/xhtml+xml'
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function scrapeEvBradescoCourses() {
  const allCourses = [];
  const visitedUrls = new Set();
  let currentUrl = START_URL;

  for (let page = 1; currentUrl && page <= MAX_PAGES; page += 1) {
    if (visitedUrls.has(currentUrl)) break;
    visitedUrls.add(currentUrl);

    console.log(`Buscando página ${page}: ${currentUrl}`);
    const html = await fetchPage(currentUrl);
    const $ = cheerio.load(html);
    const pageCourses = extractCourseData($);
    allCourses.push(...pageCourses);

    currentUrl = getNextPageUrl($, currentUrl);
  }

  const deduped = new Map();

  for (const course of allCourses) {
    if (!course.nome || !course.slug || !isTrustedCourseLink(course.link)) continue;
    deduped.set(course.slug, {
      ...course,
      gratuito: true,
      status: 'pending_review'
    });
  }

  return {
    found: allCourses.length,
    validCourses: [...deduped.values()]
  };
}

async function saveCourses(courses) {
  if (courses.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('cursos')
    .upsert(courses, { onConflict: 'slug' })
    .select();

  if (error) {
    throw new Error(`Erro ao salvar cursos no Supabase: ${error.message}`);
  }

  return data ?? [];
}

async function main() {
  const { found, validCourses } = await scrapeEvBradescoCourses();

  console.log(`Cursos encontrados: ${found}`);
  console.log(`Cursos válidos: ${validCourses.length}`);
  console.log('Primeiros cursos extraídos para conferência:');
  console.table(
    validCourses.slice(0, 3).map(course => ({
      nome: course.nome,
      duracao: course.duracao,
      nivel: course.nivel,
      area: course.area,
      link: course.link
    }))
  );

  if (validCourses.length === 0) {
    console.warn(
      'Nenhum curso válido foi encontrado. A página pode depender de JavaScript ou os seletores podem ter mudado. Uma versão futura pode usar Playwright, se necessário.'
    );
    return;
  }

  const imported = await saveCourses(validCourses);
  console.log(`Cursos importados/atualizados: ${imported.length}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

export {
  cleanText,
  slugify,
  extractCourseData,
  scrapeEvBradescoCourses,
  saveCourses,
  main
};
