import { load } from 'cheerio';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { determineSituacao } from './fuvestScraper.js';

const PAGE_URL = 'https://www.vunesp.com.br/VNSP2514';
const TIME_ZONE = 'America/Sao_Paulo';
const MONTHS = { janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };
const REQUIRED_EVENTS = ['inscricoes', 'isencao-taxa', 'reducao-taxa', 'primeira-fase',
  'segunda-fase-dia-1', 'segunda-fase-dia-2', 'resultado-final'];

const clean = value => String(value ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

export function isOfficialUnespUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      ['www.vunesp.com.br', 'documento.vunesp.com.br'].includes(url.hostname);
  } catch { return false; }
}

function absoluteUrl(value, base = PAGE_URL) {
  try { return new URL(value, base).href; } catch { return null; }
}

function civilIso(year, month, day, hour = 12, minute = 0) {
  const candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 ||
      candidate.getUTCDate() !== day || hour > 23 || minute > 59) return null;
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE,
    timeZoneName: 'shortOffset' }).formatToParts(candidate)
    .find(part => part.type === 'timeZoneName')?.value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!offset) throw new Error('[UNESP] Fuso de São Paulo indisponível');
  const offsetMinutes = (offset[1] === '+' ? 1 : -1) *
    (Number(offset[2]) * 60 + Number(offset[3] ?? 0));
  return new Date(candidate.getTime() - offsetMinutes * 60_000).toISOString();
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE,
    day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

function formatRange(start, end) {
  const first = formatDate(start);
  const last = formatDate(end);
  return first === last ? first : `${first} a ${last}`;
}

function localTime(iso, hour, minute) {
  const [day, month, year] = formatDate(iso).split('/').map(Number);
  return civilIso(year, month, day, hour, minute);
}

function openPeriod(start, end, now = new Date()) {
  return now >= new Date(start) && now <= new Date(end);
}

export function parseUnespPage(html) {
  const $ = load(html);
  const section = $('section.corner-ribbon-areaprojeto').first();
  const title = clean(section.find('.course-title').text());
  const year = Number(title.match(/Vestibular Unesp (20\d{2})/i)?.[1]);
  const code = clean(section.find('.ribbon').text());
  if (!year || !/^VNSP\d{4}$/i.test(code)) {
    throw new Error('[UNESP] Edição ou código não identificado na página oficial');
  }
  const start = clean(section.find('.apply.from').text());
  const end = clean(section.find('.apply.to').text());
  if (!/^\d{2}\/\d{2}$/.test(start) || !/^\d{2}\/\d{2}$/.test(end)) {
    throw new Error('[UNESP] Prazo de inscrição ausente na página oficial');
  }
  const description = clean(section.find('.course-description').text());
  const registrationUrl = absoluteUrl(section.find('a.apply-to-it').attr('href'));
  const docsTab = $(`a[data-controller="projeto"][data-tabname="documento"][data-sigla="${code}"]`).first();
  const docsUrl = absoluteUrl(`/${docsTab.attr('data-controller')}/${code}/${docsTab.attr('data-tabname')}/`,
    docsTab.attr('data-host'));
  if (!isOfficialUnespUrl(registrationUrl) || !isOfficialUnespUrl(docsUrl) ||
      new URL(docsUrl).hostname !== 'documento.vunesp.com.br') {
    throw new Error('[UNESP] URLs oficiais de inscrição/documentos não encontradas');
  }
  return { year, code, start, end, description, registrationUrl, docsUrl };
}

export function parseUnespDocuments(html, year) {
  const $ = load(html);
  const docs = new Map();
  $('tr').each((_, row) => {
    const a = $(row).find('a[href*="/documento/stream/"]').first();
    const title = clean(a.text());
    const url = absoluteUrl(a.attr('href'));
    if (title && isOfficialUnespUrl(url) &&
        new URL(url).hostname === 'documento.vunesp.com.br') docs.set(url, { title, url });
  });
  const result = [...docs.values()];
  const manual = result.find(doc => /Manual do Candidato/i.test(doc.title) &&
    new RegExp(`\\b${year}\\b`).test(doc.title));
  if (!manual) throw new Error(`[UNESP] Manual oficial da edição ${year} não encontrado`);
  return { docs: result, manual };
}

export function extractManualText(buffer) {
  if (buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error('[UNESP] Manual não é PDF');
  const result = spawnSync('pdftotext', ['-layout', '-', '-'], {
    input: buffer, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024
  });
  if (result.error || result.status !== 0 || !result.stdout) {
    throw new Error(`[UNESP] Falha ao ler manual: ${result.error?.message ?? result.stderr ?? 'sem texto'}`);
  }
  return result.stdout;
}

function parseDatePrefix(line) {
  const value = clean(line).replace(/[–—]/g, '-');
  let match = value.match(/^(?:A partir de )?(\d{1,2})\.(\d{2})\s+a\s+(\d{1,2})\.(\d{2})\.(\d{4})\s*[-:]\s*(.+)$/i);
  if (match) return { start: civilIso(+match[5], +match[2], +match[1]),
    end: civilIso(+match[5], +match[4], +match[3]), description: match[6] };
  match = value.match(/^(?:A partir de )?(\d{1,2})(?:\s*(?:a|e)\s*(\d{1,2}))?\.(\d{2})\.(\d{4})\s*[-:]\s*(.+)$/i);
  if (!match) return null;
  return { start: civilIso(+match[4], +match[3], +match[1]),
    end: civilIso(+match[4], +match[3], +(match[2] ?? match[1])), description: match[5] };
}

function identity(section, description) {
  const d = description.toLowerCase();
  if (section === 'reducao') {
    if (/exclusivamente pela internet/.test(d)) return ['reducao-taxa', 'Pedido de redução da taxa', 'isencao'];
    if (/publica[cç][aã]o do resultado/.test(d)) return ['resultado-reducao', 'Resultado dos pedidos de redução', 'resultado'];
    if (/per[ií]odo de recurso/.test(d)) return ['recurso-reducao', 'Recurso da redução da taxa', 'calendario'];
  }
  if (section === 'isencao') {
    if (/exclusivamente pela internet/.test(d)) return ['isencao-taxa', 'Pedido de isenção da taxa', 'isencao'];
    if (/publica[cç][aã]o do resultado/.test(d)) return ['resultado-isencao', 'Resultado dos pedidos de isenção', 'resultado'];
    if (/per[ií]odo de recurso/.test(d)) return ['recurso-isencao', 'Recurso da isenção da taxa', 'calendario'];
  }
  if (section === 'primeira') {
    if (/locais de exame/.test(d)) return ['locais-primeira-fase', 'Locais da primeira fase', 'calendario'];
    if (/prova de conhecimentos gerais/.test(d)) return ['primeira-fase', 'Primeira fase', 'prova'];
    if (/convocados para a segunda fase/.test(d)) return ['convocacao-segunda-fase', 'Convocação para a segunda fase', 'resultado'];
  }
  if (section === 'habilidades') {
    if (/locais de exame/.test(d)) return ['locais-habilidades', 'Locais das provas de habilidades', 'calendario'];
    if (/instituto de artes/.test(d)) return ['habilidades-artes', 'Provas de habilidades: Instituto de Artes', 'prova'];
    if (/faculdade de arquitetura/.test(d)) return ['habilidades-bauru', 'Provas de habilidades: Bauru', 'prova'];
  }
  if (section === 'segunda') {
    if (/locais de exame/.test(d)) return ['locais-segunda-fase', 'Locais da segunda fase', 'calendario'];
    if (/ci[eê]ncias humanas/.test(d)) return ['segunda-fase-dia-1', 'Segunda fase: primeiro dia', 'prova'];
    if (/linguagens e reda[cç][aã]o/.test(d)) return ['segunda-fase-dia-2', 'Segunda fase: segundo dia', 'prova'];
  }
  if (section === 'resultados' && /lista geral de classifica[cç][aã]o/.test(d)) {
    return ['resultado-final', 'Resultado final', 'resultado'];
  }
  return null;
}

export function parseUnespCalendar(manualText, year, manualUrl) {
  const start = manualText.search(/(?:^|\f)Calend[aá]rio\s*\n/i);
  const end = manualText.search(/\n\s*CONVOCA[CÇ][AÃ]O E MATR[IÍ]CULA\b/i);
  if (start < 0 || end <= start) throw new Error('[UNESP] Calendário não encontrado no manual');
  const lines = manualText.slice(start, end).split(/\r?\n/);
  const events = [];
  let section = '';
  for (const line of lines) {
    const heading = clean(line).toUpperCase();
    if (/^SOLICITAÇÃO DE REDUÇÃO DE TAXA/.test(heading)) section = 'reducao';
    else if (/^SOLICITAÇÃO DE ISENÇÃO DE TAXA/.test(heading)) section = 'isencao';
    else if (/^PROVA DA 1ª FASE/.test(heading)) section = 'primeira';
    else if (/^PROVAS DE HABILIDADES/.test(heading)) section = 'habilidades';
    else if (/^PROVAS DA 2ª FASE/.test(heading)) section = 'segunda';
    else if (/^RESULTADOS$/.test(heading)) section = 'resultados';
    else if (/^INSCRIÇÕES PARA ALUNOS/.test(heading)) section = 'inscricoes';
    const date = parseDatePrefix(line);
    if (!date) continue;
    const id = identity(section, date.description);
    if (!id || !date.start || !date.end) continue;
    if (!formatDate(date.start).endsWith(String(year - 1)) &&
        !formatDate(date.start).endsWith(String(year))) {
      throw new Error('[UNESP] Ano inesperado no calendário');
    }
    const wholeDayPeriod = ['reducao-taxa', 'isencao-taxa', 'recurso-reducao', 'recurso-isencao'].includes(id[0]);
    events.push({ event_key: id[0], titulo: id[1], tipo: id[2],
      data_inicio: wholeDayPeriod ? localTime(date.start, 0, 0) : date.start,
      data_fim: wholeDayPeriod ? localTime(date.end, 23, 59) : date.end,
      descricao: clean(date.description),
      ordem: events.length + 1, fonte_url: manualUrl });
  }
  return events;
}

function parseManualRegistration(text) {
  const procedurePage = text.split('\f').find(page => /Procedimentos\s*\npara inscri[cç][aã]o/i.test(page));
  if (!procedurePage) throw new Error('[UNESP] Página de inscrições não encontrada no manual');
  const flattened = clean(procedurePage.split(/\r?\n/)
    .map(line => line.split(/\s{2,}/)[0]).join(' '));
  const match = flattened.match(/das\s+(\d{1,2})h(?:(\d{2}))?\s+de\s+(\d{1,2})\s+de\s+(\w+)\s+às\s+(\d{1,2})h(?:(\d{2}))?\s+de\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(20\d{2})/i);
  if (!match) throw new Error('[UNESP] Horário de inscrições não encontrado no manual');
  const startMonth = MONTHS[match[4].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()];
  const endMonth = MONTHS[match[8].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()];
  if (!startMonth || !endMonth) throw new Error('[UNESP] Mês desconhecido no manual');
  return { start: { year: +match[9], month: startMonth, day: +match[3], hour: +match[1], minute: +(match[2] ?? 0) },
    end: { year: +match[9], month: endMonth, day: +match[7], hour: +match[5], minute: +(match[6] ?? 0) } };
}

export function normalizeUnesp(pageHtml, docsHtml, manualText, now = new Date()) {
  const page = parseUnespPage(pageHtml);
  const { docs, manual } = parseUnespDocuments(docsHtml, page.year);
  const manualRegistration = parseManualRegistration(manualText);
  const pageStart = page.start.split('/').map(Number);
  const pageEnd = page.end.split('/').map(Number);
  if (manualRegistration.start.year !== page.year - 1 ||
      manualRegistration.start.day !== pageStart[0] || manualRegistration.start.month !== pageStart[1]) {
    throw new Error('[UNESP] Início das inscrições diverge do manual');
  }
  let endHour = manualRegistration.end.hour;
  let endMinute = manualRegistration.end.minute;
  const notice = page.description.match(/INSCRIÇÕES PRORROGADAS ATÉ AS\s*(\d{1,2})H(?:(\d{2}))?\s*DE\s*(\d{1,2})\/(\d{1,2})/i);
  if (notice && +notice[3] === pageEnd[0] && +notice[4] === pageEnd[1]) {
    endHour = +notice[1]; endMinute = +(notice[2] ?? 0);
  }
  if (manualRegistration.end.day !== pageEnd[0] || manualRegistration.end.month !== pageEnd[1]) {
    if (!notice || +notice[3] !== pageEnd[0] || +notice[4] !== pageEnd[1]) {
      throw new Error('[UNESP] Novo prazo sem aviso oficial correspondente; revisão necessária');
    }
  }
  const registrationStart = civilIso(...Object.values(manualRegistration.start));
  const registrationEnd = civilIso(manualRegistration.end.year, pageEnd[1], pageEnd[0], endHour, endMinute);
  if (!registrationStart || !registrationEnd || registrationEnd <= registrationStart) {
    throw new Error('[UNESP] Prazo de inscrição inválido');
  }
  const events = parseUnespCalendar(manualText, page.year, manual.url);
  events.unshift({ event_key: 'inscricoes', titulo: 'Inscrições', tipo: 'inscricoes',
    data_inicio: registrationStart, data_fim: registrationEnd, descricao: 'Prazo vigente na página da Vunesp',
    ordem: 0, fonte_url: PAGE_URL });
  const fee = clean(manualText).match(/taxa de inscri[cç][aã]o no valor de R\$\s*([\d.,]+)/i) ??
    clean(manualText).match(/A taxa de inscri[cç][aã]o.*?R\$\s*([\d.,]+)/i);
  const feeValue = fee ? Number(fee[1].replace(/\./g, '').replace(',', '.')) : null;
  const exemption = events.find(event => event.event_key === 'isencao-taxa');
  const edital = docs.find(doc => /^Resolu[cç][aã]o UNESP/i.test(doc.title));
  const vestibular = {
    nome: `UNESP ${page.year}`, slug: `unesp-${page.year}`, instituicao: 'Universidade Estadual Paulista (UNESP)',
    organizadora: 'Fundação Vunesp', edicao: String(page.year), ano: page.year,
    tipo: 'Vestibular', nivel: 'Graduação', descricao: page.description || null,
    inscricao_inicio: registrationStart, inscricao_fim: registrationEnd,
    prazo: formatRange(registrationStart, registrationEnd),
    datas: events.map(event => ({ evento: event.titulo, data: formatRange(event.data_inicio, event.data_fim) })),
    taxa_inscricao: feeValue, isencao_inicio: exemption?.data_inicio ?? null,
    isencao_fim: exemption?.data_fim ?? null,
    isencao_disponivel: exemption ? openPeriod(exemption.data_inicio, exemption.data_fim, now) : false,
    inscricoes_abertas: openPeriod(registrationStart, registrationEnd, now),
    acessibilidade: [], edital_url: edital?.url ?? null, manual_url: manual.url,
    guia_inclusao_url: null, inscricao_url: page.registrationUrl,
    documentos: docs.map(doc => doc.url), link_oficial: PAGE_URL,
    fonte: 'scraper_unesp', fonte_url: PAGE_URL, status: 'pending_review',
    last_scraped_at: now.toISOString()
  };
  vestibular.situacao = determineSituacao(vestibular, events, now);
  validateUnesp(vestibular, events, docs);
  return { vestibular, eventos: events, docs };
}

export function validateUnesp(vestibular, events, docs) {
  for (const field of ['nome', 'slug', 'ano', 'instituicao', 'manual_url', 'inscricao_inicio', 'inscricao_fim']) {
    if (!vestibular[field]) throw new Error(`[UNESP] Campo obrigatório ausente: ${field}`);
  }
  const keys = new Set(events.map(event => event.event_key));
  if (keys.size !== events.length) throw new Error('[UNESP] Eventos duplicados');
  for (const key of REQUIRED_EVENTS) if (!keys.has(key)) throw new Error(`[UNESP] Evento obrigatório ausente: ${key}`);
  for (const url of [vestibular.link_oficial, vestibular.inscricao_url, vestibular.manual_url,
    vestibular.edital_url, ...docs.map(doc => doc.url), ...events.map(event => event.fonte_url)].filter(Boolean)) {
    if (!isOfficialUnespUrl(url)) throw new Error(`[UNESP] URL não oficial: ${url}`);
  }
}

async function getText(url) {
  if (!isOfficialUnespUrl(url)) throw new Error(`[UNESP] URL não oficial: ${url}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EducaAcesso/1.0)' } });
  if (!response.ok) throw new Error(`[UNESP] HTTP ${response.status}: ${url}`);
  if (!isOfficialUnespUrl(response.url)) throw new Error(`[UNESP] Redirecionamento não oficial: ${response.url}`);
  return response.text();
}

async function getPdf(url) {
  if (!isOfficialUnespUrl(url)) throw new Error(`[UNESP] URL não oficial: ${url}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EducaAcesso/1.0)' } });
  if (!response.ok || !/application\/pdf/i.test(response.headers.get('content-type') ?? '')) {
    throw new Error(`[UNESP] Manual PDF indisponível: HTTP ${response.status}`);
  }
  if (!isOfficialUnespUrl(response.url)) throw new Error(`[UNESP] Redirecionamento não oficial: ${response.url}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function run({ dryRun = false } = {}) {
  const pageHtml = await getText(PAGE_URL);
  const page = parseUnespPage(pageHtml);
  const docsHtml = await getText(page.docsUrl);
  const { manual } = parseUnespDocuments(docsHtml, page.year);
  const manualText = extractManualText(await getPdf(manual.url));
  const { vestibular, eventos, docs } = normalizeUnesp(pageHtml, docsHtml, manualText);
  console.log(`[UNESP] ${vestibular.nome}: ${eventos.length} eventos, ${docs.length} documentos`);
  console.log(`[UNESP] Inscrições: ${vestibular.inscricao_inicio} -> ${vestibular.inscricao_fim}`);
  console.log(`[UNESP] Status inicial: ${vestibular.status}`);
  if (dryRun) { console.log('[UNESP] Dry run concluído; nada foi salvo'); return; }
  const { supabaseAdmin: client } = await import('../utils/supabaseAdmin.js');
  const { error: docsTableError } = await client.from('vestibular_documentos').select('id').limit(1);
  if (docsTableError) throw new Error('[UNESP] Tabela vestibular_documentos indisponível');
  const { data: existing, error: lookupError } = await client.from('vestibulares')
    .select('id, status').eq('slug', vestibular.slug).maybeSingle();
  if (lookupError) throw new Error(`[UNESP] Consulta falhou: ${lookupError.message}`);
  if (existing) vestibular.status = existing.status;
  const { data: saved, error: saveError } = await client.from('vestibulares')
    .upsert(vestibular, { onConflict: 'slug' }).select('id').single();
  if (saveError) throw new Error(`[UNESP] Falha ao salvar vestibular: ${saveError.message}`);
  const eventRows = eventos.map(event => ({ ...event, vestibular_id: saved.id }));
  const { error: eventsError } = await client.from('vestibular_eventos')
    .upsert(eventRows, { onConflict: 'vestibular_id,event_key' });
  if (eventsError) throw new Error(`[UNESP] Falha ao salvar eventos: ${eventsError.message}`);
  const documentRows = docs.map((doc, index) => ({ vestibular_id: saved.id,
    url: doc.url, titulo: doc.title, ordem: index }));
  const { error: documentsError } = await client.from('vestibular_documentos')
    .upsert(documentRows, { onConflict: 'vestibular_id,url' });
  if (documentsError) throw new Error(`[UNESP] Falha ao salvar documentos: ${documentsError.message}`);
  console.log(`[UNESP] Salvo com status ${vestibular.status}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run({ dryRun: process.argv.includes('--dry-run') }).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
