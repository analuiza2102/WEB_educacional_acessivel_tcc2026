import * as cheerio from 'cheerio';
import { fileURLToPath } from 'node:url';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';

const BASE_URL = 'https://www.escolavirtual.gov.br';
const CATALOG_URL = `${BASE_URL}/catalogo`;
const SOURCE = 'scraper_escola_virtual_gov';
const PLATFORM = 'Escola Virtual do Governo';
const DEFAULT_AREA = 'A definir';
const DEFAULT_LEVEL = 'Não informado';
const MAX_FALLBACK_PAGES = 80;
const PAGE_DELAY_MS = 500;
const SUPABASE_READ_CHUNK_SIZE = 50;
const SUPABASE_WRITE_CHUNK_SIZE = 100;
const USER_AGENT = 'WebEducacionalAcessivelTCC2026/1.0 (scraper academico; contato via projeto TCC)';

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

function parseCargaHoraria(text) {
  const match = cleanText(text).match(/(?:carga\s*hor[aá]ria\s*:?\s*)?(\d+)\s*h?/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function toAbsoluteUrl(href, baseUrl = BASE_URL) {
  if (!href || href.startsWith('#') || /^javascript:/i.test(href)) return null;

  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function isValidCourseLink(link) {
  if (!link) return false;

  try {
    const url = new URL(link);
    return url.protocol.startsWith('http') && !/(login|entrar|ajuda|catalogo)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

async function fetchText(url, accept = 'text/html,application/xhtml+xml,text/csv') {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: accept
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function findCatalogCsvUrl(html) {
  const $ = cheerio.load(html);
  let csvUrl = null;

  $('a[href]').each((_, link) => {
    if (csvUrl) return;

    const text = cleanText($(link).text());
    const href = $(link).attr('href');

    if (/cat[aá]logo\s+em\s+csv/i.test(text) || /\.csv(?:$|\?)/i.test(href ?? '')) {
      csvUrl = toAbsoluteUrl(href, CATALOG_URL);
    }
  });

  return csvUrl;
}

async function fetchCatalogCsv() {
  try {
    console.log(`Fonte EV.G: ${CATALOG_URL}`);
    const html = await fetchText(CATALOG_URL);
    const csvUrl = findCatalogCsvUrl(html);

    if (!csvUrl) {
      console.warn('CSV oficial do catalogo nao foi identificado. Usando fallback HTML.');
      return null;
    }

    console.log(`CSV oficial encontrado: ${csvUrl}`);
    return fetchText(csvUrl, 'text/csv,text/plain,*/*');
  } catch (error) {
    console.warn(`Nao foi possivel baixar o CSV oficial: ${error.message}`);
    return null;
  }
}

function parseCsvLine(line, delimiter) {
  if (delimiter === '|') {
    return line.split('|').map(value => cleanText(value));
  }

  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map(value => cleanText(value));
}

function splitCsvRows(csvText) {
  const rows = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === '"' && next === '"') {
      current += '""';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (cleanText(current)) rows.push(current);
      current = '';
      if (char === '\r' && next === '\n') index += 1;
    } else {
      current += char;
    }
  }

  if (cleanText(current)) rows.push(current);
  return rows;
}

function detectDelimiter(headerLine) {
  const semicolonCount = (headerLine.match(/;/g) ?? []).length;
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  const pipeCount = (headerLine.match(/\|/g) ?? []).length;

  if (pipeCount > semicolonCount && pipeCount > commaCount) return '|';
  return semicolonCount > commaCount ? ';' : ',';
}

function normalizeHeader(header) {
  return slugify(header).replace(/-/g, '_');
}

function pickColumn(row, aliases) {
  for (const alias of aliases) {
    const value = row[alias];
    if (cleanText(value)) return cleanText(value);
  }

  return null;
}

function parseCoursesFromCsv(csvText) {
  const firstLine = csvText.split(/\r?\n/).find(line => cleanText(line)) ?? '';
  const delimiter = detectDelimiter(firstLine);
  const rows =
    delimiter === '|'
      ? csvText.split(/\r?\n/).filter(line => cleanText(line))
      : splitCsvRows(csvText);

  if (rows.length < 2) return [];

  const headers = parseCsvLine(rows[0], delimiter).map(normalizeHeader);

  return rows.slice(1).map(line => {
    const values = parseCsvLine(line, delimiter);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    const idCurso = pickColumn(row, ['id_curso', 'id', 'codigo', 'c_digo']);
    const nome = pickColumn(row, ['nome', 'titulo', 't_tulo', 'curso', 'nome_do_curso', 'nome_curso']);
    const descricao = pickColumn(row, ['descricao', 'descri_o', 'ementa', 'resumo', 'objetivo', 'apresentacao']);
    const duracao = pickColumn(row, ['carga_horaria', 'carga_hor_ria', 'duracao', 'dura_o']);
    const area = pickColumn(row, ['tema', 'area', 'rea', 'categoria', 'temas', 'eixos_tematicos']);
    const conteudista = pickColumn(row, ['conteudista', 'instituicao', 'institui_o', 'orgao', 'rgao']);
    const idioma = pickColumn(row, ['idioma', 'lingua', 'l_ngua']);
    const link =
      pickColumn(row, ['url', 'link', 'inscricao', 'inscri_o', 'detalhes', 'saiba_mais']) ||
      pickColumn(row, ['link_do_curso', 'url_do_curso']) ||
      (idCurso ? `/curso/${idCurso}` : null);

    return {
      nome,
      descricao,
      duracao: duracao && /^\d+$/.test(duracao) ? `${duracao}h` : duracao,
      area,
      conteudista,
      idioma,
      link: toAbsoluteUrl(link, BASE_URL)
    };
  });
}

function extractLabeledValue($, card, label) {
  const text = cleanText($(card).text());
  const regex = new RegExp(`${label}\\s*:?\\s*([^:]+?)(?:Carga\\s*Hor[aá]ria|Conteudista|\\d+[.,]\\d|Saiba\\s+mais|Inscrever-se|$)`, 'i');
  const match = text.match(regex);
  return match?.[1] ? cleanText(match[1]) : null;
}

function extractDescription($, card, nome) {
  const modalTitle = $(card).find('h4').filter((_, heading) => cleanText($(heading).text()) === nome).first();
  if (modalTitle.length) {
    const parts = [];
    let current = modalTitle.next();

    while (current.length && !/a|button/i.test(current.prop('tagName') ?? '')) {
      parts.push(current.text());
      current = current.next();
    }

    const description = cleanText(parts.join(' '));
    if (description) return description;
  }

  return cleanText($(card).find('p').first().text());
}

function extractCoursesFromHtml(html, pageUrl = CATALOG_URL) {
  const $ = cheerio.load(html);
  const courses = [];

  $('h3').each((_, heading) => {
    const $heading = $(heading);
    const nome = cleanText($heading.text());
    const $card = $heading.closest('article, li, section, .card, div');
    const titleHref = $heading.find('a[href]').first().attr('href') || $heading.closest('a[href]').attr('href');
    const actionHref = $card
      .find('a[href]')
      .filter((_, link) => /saiba\s+mais|inscrever-se/i.test(cleanText($(link).text())))
      .first()
      .attr('href');
    const link = toAbsoluteUrl(titleHref || actionHref, pageUrl);

    if (!nome || !isValidCourseLink(link)) return;

    const cardText = cleanText($card.text());
    const duracao = extractLabeledValue($, $card, 'Carga\\s*Hor[aá]ria') || cardText.match(/\d+\s*h/i)?.[0] || null;

    courses.push({
      nome,
      conteudista: extractLabeledValue($, $card, 'Conteudista'),
      duracao,
      carga_horaria_numero: parseCargaHoraria(duracao),
      descricao: extractDescription($, $card, nome),
      link,
      area: null,
      idioma: null
    });
  });

  return courses;
}

function getPaginationUrls(html) {
  const $ = cheerio.load(html);
  const urls = new Set([CATALOG_URL]);
  let maxPage = 1;

  $('a[href]').each((_, link) => {
    const label = cleanText($(link).text());
    const href = $(link).attr('href');
    const absoluteUrl = toAbsoluteUrl(href, CATALOG_URL);

    if (!absoluteUrl || !/^\d+$/.test(label)) return;
    if (!absoluteUrl.startsWith(CATALOG_URL)) return;
    maxPage = Math.max(maxPage, Number.parseInt(label, 10));
    urls.add(absoluteUrl);
  });

  if (maxPage > 1) {
    const secondPage = [...urls].find(url => {
      try {
        const parsedUrl = new URL(url);
        return [...parsedUrl.searchParams.values()].includes('2');
      } catch {
        return false;
      }
    });

    if (secondPage) {
      const pageTwoUrl = new URL(secondPage);
      const pageParam = [...pageTwoUrl.searchParams.entries()].find(([, value]) => value === '2')?.[0];

      if (pageParam) {
        for (let page = 2; page <= Math.min(maxPage, MAX_FALLBACK_PAGES); page += 1) {
          const pageUrl = new URL(secondPage);
          pageUrl.searchParams.set(pageParam, String(page));
          urls.add(pageUrl.toString());
        }
      }
    }
  }

  return [...urls];
}

async function scrapeCatalogPages() {
  const firstHtml = await fetchText(CATALOG_URL);
  const firstPageUrls = getPaginationUrls(firstHtml);
  const urlsToVisit = firstPageUrls.length > 1 ? firstPageUrls : [CATALOG_URL];
  const allCourses = [];
  const visitedUrls = new Set();

  for (let index = 0; index < urlsToVisit.length && index < MAX_FALLBACK_PAGES; index += 1) {
    const currentUrl = urlsToVisit[index];
    if (visitedUrls.has(currentUrl)) continue;
    visitedUrls.add(currentUrl);

    console.log(`Fallback HTML pagina ${index + 1}: ${currentUrl}`);
    const html = index === 0 ? firstHtml : await fetchText(currentUrl);
    allCourses.push(...extractCoursesFromHtml(html, currentUrl));

    for (const url of getPaginationUrls(html)) {
      if (!visitedUrls.has(url) && !urlsToVisit.includes(url) && urlsToVisit.length < MAX_FALLBACK_PAGES) {
        urlsToVisit.push(url);
      }
    }

    await delay(PAGE_DELAY_MS);
  }

  return allCourses;
}

function normalizeCourse(raw) {
  const nome = cleanText(raw.nome);
  const conteudista = cleanText(raw.conteudista) || null;
  const slug = slugify(`escola-virtual-gov-${nome}-${conteudista ?? ''}`);
  const duracao = cleanText(raw.duracao) || null;
  const link = toAbsoluteUrl(raw.link, BASE_URL);

  if (!nome || !slug || !isValidCourseLink(link)) return null;

  return {
    nome,
    slug,
    plataforma: PLATFORM,
    area: cleanText(raw.area) || DEFAULT_AREA,
    gratuito: true,
    duracao,
    carga_horaria_numero: raw.carga_horaria_numero ?? parseCargaHoraria(duracao),
    nivel: cleanText(raw.nivel) || DEFAULT_LEVEL,
    descricao: cleanText(raw.descricao),
    link,
    has_certificate: true,
    conteudista,
    idioma: cleanText(raw.idioma) || null,
    status: 'pending_review',
    fonte: SOURCE,
    last_scraped_at: new Date().toISOString(),
    link_status: 'unknown'
  };
}

async function getExistingStatusesBySlug(slugs) {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
  if (uniqueSlugs.length === 0) return new Map();

  const rows = [];

  for (const chunk of chunkArray(uniqueSlugs, SUPABASE_READ_CHUNK_SIZE)) {
    const { data, error } = await supabaseAdmin
      .from('cursos')
      .select('slug, status')
      .in('slug', chunk);

    if (error) {
      throw new Error(`Erro ao consultar cursos existentes: ${error.message}`);
    }

    rows.push(...(data ?? []));
  }

  return new Map(rows.map(row => [row.slug, row.status]));
}

async function saveCourses(courses) {
  const validCourses = courses.filter(Boolean);
  if (validCourses.length === 0) return [];

  const existingStatuses = await getExistingStatusesBySlug(validCourses.map(course => course.slug));
  let preservedPublishedOrArchived = 0;
  let existingCount = 0;
  let newCount = 0;

  const rowsToUpsert = validCourses.map(course => {
    const existingStatus = existingStatuses.get(course.slug);

    if (!existingStatus) {
      newCount += 1;
      return course;
    }

    existingCount += 1;
    if (existingStatus === 'published' || existingStatus === 'archived') {
      preservedPublishedOrArchived += 1;
    }

    return {
      ...course,
      status: existingStatus
    };
  });

  const savedRows = [];

  for (const chunk of chunkArray(rowsToUpsert, SUPABASE_WRITE_CHUNK_SIZE)) {
    const { data, error } = await supabaseAdmin
      .from('cursos')
      .upsert(chunk, { onConflict: 'slug' })
      .select();

    if (error) {
      throw new Error(`Erro ao salvar cursos EV.G no Supabase: ${error.message}`);
    }

    savedRows.push(...(data ?? []));
  }

  console.log(`Total recebido: ${courses.length}`);
  console.log(`Total valido: ${validCourses.length}`);
  console.log(`Cursos existentes: ${existingCount}`);
  console.log(`Cursos novos: ${newCount}`);
  console.log(`Status published/archived preservados: ${preservedPublishedOrArchived}`);
  console.log(`Cursos salvos: ${savedRows.length}`);

  return savedRows;
}

async function main() {
  const csvText = await fetchCatalogCsv();
  const usedCsv = Boolean(csvText);
  const rawCourses = usedCsv ? parseCoursesFromCsv(csvText) : await scrapeCatalogPages();
  const normalizedBySlug = new Map();

  for (const rawCourse of rawCourses) {
    const course = normalizeCourse(rawCourse);
    if (course) normalizedBySlug.set(course.slug, course);
  }

  const validCourses = [...normalizedBySlug.values()];

  console.log(`Modo usado: ${usedCsv ? 'CSV oficial' : 'fallback HTML'}`);
  console.log(`Cursos brutos encontrados: ${rawCourses.length}`);
  console.log(`Cursos normalizados: ${validCourses.length}`);
  console.log('Primeiros cursos extraidos para conferencia:');
  console.table(
    validCourses.slice(0, 3).map(course => ({
      nome: course.nome,
      conteudista: course.conteudista,
      duracao: course.duracao,
      area: course.area,
      link: course.link
    }))
  );

  if (validCourses.length === 0) {
    console.warn('Nenhum curso valido foi encontrado no catalogo EV.G.');
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
  parseCargaHoraria,
  findCatalogCsvUrl,
  fetchCatalogCsv,
  parseCoursesFromCsv,
  extractCoursesFromHtml,
  scrapeCatalogPages,
  normalizeCourse,
  getExistingStatusesBySlug,
  saveCourses,
  main
};
