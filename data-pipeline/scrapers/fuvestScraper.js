import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_URL = 'https://www.fuvest.br/vestibular-da-usp/';
const TIME_ZONE = 'America/Sao_Paulo';
const EVENT_CORRECTIONS = JSON.parse(readFileSync(new URL('../corrections/fuvestEvents.json', import.meta.url), 'utf8'));
const MONTHS = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12
};

export function cleanText(text) {
  return String(text ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export function slugify(text) {
  return cleanText(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseMoneyBRL(text) {
  const match = cleanText(text).match(/R\$\s*([\d.]+)(?:,(\d{1,2}))?/i);
  if (!match) return null;
  return Number(match[1].replace(/\./g, '')) + Number((match[2] ?? '0').padEnd(2, '0')) / 100;
}

function zonedIso(year, month, day, hour = 12, minute = 0) {
  // Sem horário publicado: meio-dia civil de São Paulo. Evita inventar 00h e
  // mantém a data local ao serializar em timestamptz, inclusive em ranges.
  const candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 ||
      candidate.getUTCDate() !== day) return null;
  const zone = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, timeZoneName: 'shortOffset', year: 'numeric'
  }).formatToParts(candidate).find(part => part.type === 'timeZoneName')?.value ?? '';
  const offset = zone.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!offset) throw new Error('Não foi possível determinar o fuso America/Sao_Paulo');
  const minutes = (offset[1] === '+' ? 1 : -1) *
    (Number(offset[2]) * 60 + Number(offset[3] ?? 0));
  return new Date(candidate.getTime() - minutes * 60_000).toISOString();
}

function readDateParts(text, fallbackYear) {
  const value = slugify(text).replace(/-/g, ' ');
  const numeric = cleanText(text).match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (numeric) return [Number(numeric[3]), Number(numeric[2]), Number(numeric[1])];
  const named = value.match(/\b(\d{1,2})(?:o)?(?: de)? (janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?: de (\d{4}))?\b/);
  if (!named) return null;
  return [Number(named[3] ?? fallbackYear), MONTHS[named[2]], Number(named[1])];
}

export function parseBrazilianDate(text, fallbackYear) {
  const parts = readDateParts(text, fallbackYear);
  if (!parts || !Number.isInteger(parts[0])) return null;
  const time = cleanText(text).match(/\b(?:as|às|das|ate as|até as)\s*(\d{1,2})h(?:(\d{2}))?\b/i);
  return zonedIso(...parts, time ? Number(time[1]) : 12, time ? Number(time[2] ?? 0) : 0);
}

export function parseBrazilianDateRange(text, fallbackYear) {
  const value = cleanText(text);
  const numeric = [...value.matchAll(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g)];
  if (numeric.length >= 2) {
    const beforeFirst = value.slice(0, numeric[0].index);
    const between = value.slice(numeric[0].index + numeric[0][0].length, numeric[1].index);
    const firstTime = beforeFirst.match(/(\d{1,2})h(?:(\d{2}))?\s*de\s*$/i);
    const secondTime = between.match(/(\d{1,2})h(?:(\d{2}))?\s*de\s*$/i);
    const first = readDateParts(numeric[0][0]);
    const last = readDateParts(numeric[1][0]);
    return {
      inicio: zonedIso(...first, Number(firstTime?.[1] ?? 12), Number(firstTime?.[2] ?? 0)),
      fim: zonedIso(...last, Number(secondTime?.[1] ?? 12), Number(secondTime?.[2] ?? 0))
    };
  }
  const norm = slugify(value).replace(/-/g, ' ');
  const compact = norm.match(/\b(\d{1,2}) (?:e|a|ate) (\d{1,2}) de ([a-z]+) de (\d{4})\b/);
  if (compact && MONTHS[compact[3]]) {
    return {
      inicio: zonedIso(Number(compact[4]), MONTHS[compact[3]], Number(compact[1])),
      fim: zonedIso(Number(compact[4]), MONTHS[compact[3]], Number(compact[2]))
    };
  }
  const twoMonths = norm.match(/\b(\d{1,2}) de ([a-z]+) (?:a|ate) (\d{1,2}) de ([a-z]+) de (\d{4})\b/);
  if (twoMonths && MONTHS[twoMonths[2]] && MONTHS[twoMonths[4]]) {
    return {
      inicio: zonedIso(Number(twoMonths[5]), MONTHS[twoMonths[2]], Number(twoMonths[1])),
      fim: zonedIso(Number(twoMonths[5]), MONTHS[twoMonths[4]], Number(twoMonths[3]))
    };
  }
  const one = parseBrazilianDate(value, fallbackYear);
  return { inicio: one, fim: one };
}

export function makeAbsoluteUrl(url, base = SOURCE_URL) {
  if (!url) return null;
  try {
    const result = new URL(url, base);
    return /^https?:$/.test(result.protocol) ? result.href : null;
  } catch {
    return null;
  }
}

export function isOfficialFuvestUrl(url) {
  try {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol) &&
      (parsed.hostname === 'fuvest.br' || parsed.hostname.endsWith('.fuvest.br'));
  } catch {
    return false;
  }
}

export function generateEventKey(titulo) {
  const text = cleanText(titulo)
    .replace(/\b1[ªºa]\s*fase\b/gi, 'primeira fase')
    .replace(/\b2[ªºa]\s*fase\b/gi, 'segunda fase')
    .replace(/\b1[ªºa]\s*chamada\b/gi, 'primeira chamada');
  return slugify(text);
}

function eventIdentity(title) {
  const text = slugify(title);
  if (/periodo-de-inscricao-para-o-vestibular/.test(text)) return ['inscricoes', 'Inscrições', 'inscricoes'];
  if (/periodo-para-pedido-de-reducao-da-taxa/.test(text)) return ['isencao-reducao', 'Isenção ou redução da taxa', 'isencao'];
  if (/periodo-para-pedido-de-recursos-especificos/.test(text)) return ['recursos-especificos', 'Pedido de recursos específicos', 'acessibilidade'];
  if (/^divulgacao-dos-locais-de-prova-da-1-fase/.test(text)) return ['locais-primeira-fase', title, 'calendario'];
  if (/^divulgacao-dos-locais-de-prova-da-2-fase/.test(text)) return ['convocacao-segunda-fase', title, 'calendario'];
  if (/^prova-da-1-fase/.test(text)) return ['primeira-fase', title, 'prova'];
  if (/^provas-da-2-fase/.test(text)) return ['segunda-fase', 'Segunda fase', 'prova'];
  if (/^divulgacao-da-1-chamada/.test(text)) return ['primeira-chamada', title, 'resultado'];
  const stableTitle = cleanText(title).replace(/^(Início|Fim) do período (de|para) /i, 'Período de ');
  const tipo = /^provas? (da|de)|^realiza[cç][aã]o da [12]ª fase/i.test(title)
    ? 'prova' : /chamada|resultado/i.test(title) ? 'resultado' : 'calendario';
  return [generateEventKey(stableTitle), stableTitle, tipo];
}

function parseCalendarTimestamp(raw) {
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, y, m, d, h, minute] = match;
  return zonedIso(Number(y), Number(m), Number(d), Number(h) === 0 ? 12 : Number(h), Number(minute));
}

function extractCalendar($) {
  const calendar = $('[data-elemento="calendario"]').first();
  if (!calendar.length) {
    console.warn('[FUVEST] Calendário estruturado ausente no HTML; fetch + cheerio não bastaram para o cronograma.');
    return [];
  }
  const entries = Object.entries(calendar.attr() ?? {})
    .filter(([key]) => /^data-elemento-\d+$/.test(key))
    .sort(([a], [b]) => Number(a.slice(14)) - Number(b.slice(14)));
  const byKey = new Map();
  for (const [key, value] of entries) {
    const [stamp, rawTitle] = value.split('|');
    const title = cleanText(rawTitle);
    const starts = stamp.match(/^(\d{14})/);
    if (!starts || !title) continue;
    const start = parseCalendarTimestamp(starts[1]);
    const second = stamp.slice(14).match(/^(\d{14})/);
    const end = second ? parseCalendarTimestamp(second[1]) : start;
    if (!start || !end) continue;
    const [eventKey, displayTitle, tipo] = eventIdentity(title);
    const previous = byKey.get(eventKey);
    const first = previous?.data_inicio;
    const firstDate = /^(Fim)\b/i.test(title) && first ? first : start;
    const lastDate = /^(Início)\b/i.test(title) && previous?.data_fim ? previous.data_fim : end;
    byKey.set(eventKey, {
      event_key: eventKey, tipo, titulo: displayTitle,
      data_inicio: first ? (first < firstDate ? first : firstDate) : firstDate,
      data_fim: previous?.data_fim && previous.data_fim > lastDate ? previous.data_fim : lastDate,
      descricao: previous?.descricao
        ? previous.descricao.includes(title) ? previous.descricao : `${previous.descricao}; ${title}`
        : title,
      ordem: previous?.ordem ?? Number(key.slice(14)),
      fonte_url: SOURCE_URL
    });
  }
  return [...byKey.values()].sort((a, b) => a.ordem - b.ordem);
}

export function applyEventCorrections(year, events) {
  for (const correction of EVENT_CORRECTIONS.filter(item => item.ano === year)) {
    if (!isOfficialFuvestUrl(correction.source_url) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(correction.expected_date) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(correction.corrected_date)) {
      throw new Error(`[FUVEST] Correção inválida para ${correction.event_key}`);
    }
    const event = events.find(item => item.event_key === correction.event_key);
    if (!event?.data_inicio) throw new Error(`[FUVEST] Evento da correção não encontrado: ${correction.event_key}`);
    const scrapedDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date(event.data_inicio));
    if (scrapedDate === correction.corrected_date) continue;
    if (scrapedDate !== correction.expected_date) {
      throw new Error(`[FUVEST] Data de ${correction.event_key} mudou para ${scrapedDate}; revise a correção oficial antes de salvar.`);
    }
    const [y, m, d] = correction.corrected_date.split('-').map(Number);
    const corrected = zonedIso(y, m, d, correction.hour ?? 12, correction.minute ?? 0);
    if (!corrected) throw new Error(`[FUVEST] Data inválida na correção de ${correction.event_key}`);
    event.data_inicio = corrected;
    event.data_fim = corrected;
    event.fonte_url = correction.source_url;
    event.descricao = `${event.descricao ?? event.titulo}; data corrigida conforme comunicado oficial`;
  }
  return events;
}

function extractDocuments($, year) {
  const publications = $('.elementor-toggle-item').filter((_, el) => {
    const heading = cleanText($(el).find('.elementor-tab-title').first().text());
    return new RegExp(`\\bFUVEST\\s+${year}\\b`, 'i').test(heading);
  }).first();
  if (!publications.length) throw new Error(`[FUVEST] Publicações da edição ${year} não encontradas; nada será salvo.`);
  const docs = [];
  for (const a of publications.find('.elementor-tab-content a[href]').toArray()) {
    const title = cleanText($(a).text());
    const url = makeAbsoluteUrl($(a).attr('href'));
    if (!title || !url || !isOfficialFuvestUrl(url) || !/\.pdf(?:$|[?#])/i.test(url)) continue;
    docs.push({ title, url });
  }
  const unique = new Map();
  for (const doc of docs) {
    if (!unique.has(doc.url)) unique.set(doc.url, doc);
  }
  if (!unique.size) throw new Error(`[FUVEST] Nenhum PDF oficial encontrado para ${year}; nada será salvo.`);
  return [...unique.values()];
}

function findDocument(docs, pattern) {
  return docs.find(doc => pattern.test(doc.title))?.url ?? null;
}

function sectionNextText($, pattern) {
  const heading = $('h2').filter((_, el) => pattern.test(cleanText($(el).text()))).first();
  return cleanText(heading.parent().parent().next().text());
}

export function determineSituacao(vestibular, eventos, now = new Date()) {
  const current = now.getTime();
  const inRange = (start, end) => start && end && current >= Date.parse(start) && current <= Date.parse(end);
  if (inRange(vestibular.isencao_inicio, vestibular.isencao_fim)) return 'isencao_aberta';
  if (inRange(vestibular.inscricao_inicio, vestibular.inscricao_fim)) return 'inscricoes_abertas';
  const proofs = eventos.filter(event => event.tipo === 'prova' && event.data_inicio);
  const firstProof = proofs.map(event => Date.parse(event.data_inicio)).sort((a, b) => a - b)[0];
  const lastProof = Math.max(...proofs.map(event => Date.parse(event.data_fim ?? event.data_inicio)));
  if (vestibular.inscricao_fim && current > Date.parse(vestibular.inscricao_fim) &&
      firstProof && current < firstProof) return 'inscricoes_encerradas';
  // Considera a janela de provas da primeira à última aplicação. A margem final
  // cobre o dia civil quando o calendário informa somente uma data.
  if (firstProof && Number.isFinite(lastProof) &&
      current >= firstProof && current <= lastProof + 12 * 60 * 60_000) return 'provas';
  if (Number.isFinite(lastProof) && current > lastProof &&
      eventos.some(event => event.tipo === 'resultado' && event.data_inicio && Date.parse(event.data_inicio) > current)) return 'resultado';
  const knownDates = [vestibular.isencao_inicio, vestibular.inscricao_inicio,
    ...eventos.map(event => event.data_inicio)].filter(Boolean).map(Date.parse);
  if (!knownDates.length || current < Math.min(...knownDates)) return 'previsto';
  if (firstProof && current > lastProof) return 'encerrado';
  return 'previsto';
}

function periodIsOpen(start, end, now = new Date()) {
  if (!start || !end) return false;
  const from = Date.parse(start);
  const to = Date.parse(end);
  return Number.isFinite(from) && Number.isFinite(to) &&
    now.getTime() >= from && now.getTime() <= to;
}

function formatLegacyDate(iso) {
  if (!iso) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(iso));
}

function formatLegacyRange(start, end) {
  const first = formatLegacyDate(start);
  const last = formatLegacyDate(end);
  if (!first) return '';
  return !last || first === last ? first : `${first} a ${last}`;
}

export function normalizeFuvest(html) {
  const $ = load(html);
  const title = cleanText($('title').first().text());
  const yearMatch = title.match(/Vestibular da USP\s*[–-]\s*(20\d{2})/i) ??
    cleanText($('h2').filter((_, el) => /CALEND.RIO DO VESTIBULAR/i.test($(el).text())).first().text())
      .match(/(20\d{2})/);
  if (!yearMatch) throw new Error('[FUVEST] Ano da edição não detectado na página principal; nada será salvo.');
  const ano = Number(yearMatch[1]);
  const nome = `FUVEST ${ano}`;
  const inscricaoText = cleanText($('p').filter((_, el) => /Período:\s*das\s*\d+h de \d{2}\/\d{2}\/\d{4}/i.test($(el).text())).first().text());
  const isencaoText = sectionNextText($, /ISENÇÃO DE TAXA OU REDUÇÃO/i);
  const taxaText = sectionNextText($, /TAXA DE INSCRIÇÃO/i);
  const inscricao = parseBrazilianDateRange(inscricaoText, ano - 1);
  const isencao = parseBrazilianDateRange(isencaoText, ano - 1);
  const eventos = applyEventCorrections(ano, extractCalendar($));
  if (!eventos.length) throw new Error('[FUVEST] Nenhum evento estruturado encontrado; nada será salvo.');
  const docs = extractDocuments($, ano);
  const registration = $('a[href]').filter((_, el) => /FAÇA AQUI A SUA INSCRIÇÃO/i.test($(el).text())).first().attr('href');
  const inscricaoUrl = makeAbsoluteUrl(registration);
  // A descrição da página pode conter trechos dinâmicos fragmentados no HTML.
  // Preferimos null a salvar uma frase truncada como se fosse conteúdo completo.
  const descricao = null;
  const acessibilidade = [];
  const vestibular = {
    nome, slug: `fuvest-${ano}`, instituicao: 'Universidade de São Paulo (USP)',
    organizadora: 'FUVEST', edicao: String(ano), ano, tipo: 'Vestibular', nivel: 'Graduação',
    descricao, inscricao_inicio: inscricao.inicio, inscricao_fim: inscricao.fim,
    prazo: formatLegacyRange(inscricao.inicio, inscricao.fim),
    datas: eventos.map(evento => ({
      evento: evento.titulo, data: formatLegacyRange(evento.data_inicio, evento.data_fim)
    })),
    taxa_inscricao: parseMoneyBRL(taxaText),
    isencao_disponivel: periodIsOpen(isencao.inicio, isencao.fim),
    isencao_inicio: isencao.inicio, isencao_fim: isencao.fim,
    acessibilidade, edital_url: findDocument(docs, /Resolução|Edital/i),
    manual_url: findDocument(docs, /Guia de Jornada|Manual/i),
    guia_inclusao_url: findDocument(docs, /Guia de Inclusão/i),
    inscricao_url: isOfficialFuvestUrl(inscricaoUrl) ? inscricaoUrl : null,
    documentos: docs.map(doc => doc.url),
    link_oficial: SOURCE_URL, fonte: 'scraper_fuvest', fonte_url: SOURCE_URL,
    status: 'pending_review', last_scraped_at: new Date().toISOString()
  };
  vestibular.inscricoes_abertas = periodIsOpen(inscricao.inicio, inscricao.fim);
  vestibular.situacao = determineSituacao(vestibular, eventos);
  return { vestibular, eventos, docs };
}

export function validateFuvest(vestibular, eventos) {
  for (const field of ['nome', 'slug', 'ano', 'instituicao', 'fonte_url']) {
    if (!vestibular[field]) throw new Error(`[FUVEST] Campo obrigatório ausente: ${field}`);
  }
  if (vestibular.slug !== `fuvest-${vestibular.ano}`) throw new Error('[FUVEST] Slug inconsistente com o ano');
  for (const url of [vestibular.fonte_url, vestibular.link_oficial, vestibular.inscricao_url,
    vestibular.edital_url, vestibular.manual_url, vestibular.guia_inclusao_url, ...vestibular.documentos].filter(Boolean)) {
    if (!isOfficialFuvestUrl(url)) throw new Error(`[FUVEST] URL não oficial: ${url}`);
  }
  const keys = new Set();
  for (const event of eventos) {
    if (!event.event_key || !event.titulo) throw new Error('[FUVEST] Evento sem chave ou título');
    if (keys.has(event.event_key)) throw new Error(`[FUVEST] Evento duplicado: ${event.event_key}`);
    if (!isOfficialFuvestUrl(event.fonte_url)) throw new Error('[FUVEST] Fonte de evento não oficial');
    keys.add(event.event_key);
  }
}

async function admin() {
  const { supabaseAdmin } = await import('../utils/supabaseAdmin.js');
  return supabaseAdmin;
}

export async function getExistingVestibular(slug) {
  const client = await admin();
  const { data, error } = await client.from('vestibulares').select('id, slug, status').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`[FUVEST] Falha ao consultar vestibular: ${error.message}`);
  return data;
}

export async function saveVestibular(vestibular) {
  const client = await admin();
  const { data, error } = await client.from('vestibulares').upsert(vestibular, { onConflict: 'slug' }).select('id, slug, status').single();
  if (error) throw new Error(`[FUVEST] Falha ao salvar vestibular: ${error.message}`);
  return data;
}

export async function saveVestibularEventos(vestibularId, eventos) {
  if (!eventos.length) return 0;
  const client = await admin();
  const rows = eventos.map(event => ({ ...event, vestibular_id: vestibularId }));
  const { error } = await client.from('vestibular_eventos').upsert(rows, {
    onConflict: 'vestibular_id,event_key'
  });
  if (error) throw new Error(`[FUVEST] Falha ao salvar eventos: ${error.message}`);
  return rows.length;
}

export async function saveVestibularDocumentos(vestibularId, documentos) {
  if (!documentos.length) return 0;
  const client = await admin();
  const rows = documentos.map((doc, index) => ({
    vestibular_id: vestibularId, url: doc.url, titulo: doc.title, ordem: index
  }));
  const { error } = await client.from('vestibular_documentos').upsert(rows, {
    onConflict: 'vestibular_id,url'
  });
  if (error) throw new Error(`[FUVEST] Falha ao salvar documentos: ${error.message}`);
  return rows.length;
}

export async function run() {
  console.log('[FUVEST] Iniciando scraper');
  console.log(`[FUVEST] Fonte: ${SOURCE_URL}`);
  const response = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EducaAcesso/1.0)' } });
  if (!response.ok) throw new Error(`[FUVEST] Falha HTTP ${response.status} ao carregar página`);
  const html = await response.text();
  console.log('[FUVEST] Página carregada');
  const { vestibular, eventos, docs } = normalizeFuvest(html);
  validateFuvest(vestibular, eventos);
  const client = await admin();
  const { error: documentsTableError } = await client.from('vestibular_documentos').select('id').limit(1);
  if (documentsTableError) {
    throw new Error('[FUVEST] Tabela vestibular_documentos indisponível. Aplique data-pipeline/sql/vestibular_documentos.sql antes de executar o scraper.');
  }
  console.log(`[FUVEST] Edição detectada: ${vestibular.nome}`);
  console.log(`[FUVEST] Ano detectado: ${vestibular.ano}`);
  console.log(`[FUVEST] Taxa detectada: ${vestibular.taxa_inscricao ?? 'indisponível'}`);
  console.log(`[FUVEST] Inscrições: ${vestibular.inscricao_inicio ?? 'indisponível'} -> ${vestibular.inscricao_fim ?? 'indisponível'}`);
  console.log(`[FUVEST] Isenção: ${vestibular.isencao_inicio ?? 'indisponível'} -> ${vestibular.isencao_fim ?? 'indisponível'}`);
  console.log(`[FUVEST] Documentos encontrados: ${docs.length}`);
  console.log(`[FUVEST] Eventos encontrados: ${eventos.length}`);
  eventos.slice(0, 7).forEach(event => console.log(`[FUVEST] Evento: ${event.titulo} - ${event.data_inicio} -> ${event.data_fim}`));
  const existing = await getExistingVestibular(vestibular.slug);
  console.log(`[FUVEST] Registro existente: ${existing ? 'sim' : 'não'}`);
  // Nenhuma decisão editorial humana é sobrescrita, inclusive rejected.
  if (existing) vestibular.status = existing.status;
  console.log(`[FUVEST] Status preservado: ${vestibular.status}`);
  const saved = await saveVestibular(vestibular);
  console.log('[FUVEST] Vestibular salvo');
  const count = await saveVestibularEventos(saved.id, eventos);
  console.log(`[FUVEST] Eventos atualizados: ${count}`);
  const documentsCount = await saveVestibularDocumentos(saved.id, docs);
  console.log(`[FUVEST] Documentos atualizados: ${documentsCount}`);
  console.log('[FUVEST] Finalizado');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
