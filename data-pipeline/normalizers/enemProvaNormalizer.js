function cleanText(text) {
  return String(text ?? '')
    .replace(/[\r\n]+/g, ' ')
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

function inferAreaFromTitle(title) {
  const normalized = slugify(title);

  if (normalized.includes('linguagens') || normalized.includes('humanas')) {
    return 'Linguagens e Ciencias Humanas';
  }

  if (
    normalized.includes('matematica') ||
    normalized.includes('natureza') ||
    normalized.includes('ciencias-da-natureza')
  ) {
    return 'Matematica e Ciencias da Natureza';
  }

  if (normalized.includes('redacao')) {
    return 'Redacao';
  }

  if (normalized.includes('libras')) {
    return 'Acessibilidade - Libras';
  }

  if (normalized.includes('braile') || normalized.includes('braille')) {
    return 'Acessibilidade - Braille';
  }

  if (normalized.includes('ampliada') || normalized.includes('superampliada')) {
    return 'Acessibilidade - Fonte ampliada';
  }

  return 'ENEM';
}

function inferNumeroQuestoes(title) {
  const normalized = slugify(title);

  if (
    normalized.includes('prova-completa') ||
    normalized.includes('caderno-completo') ||
    normalized.includes('provas-reaplicacao')
  ) {
    return 180;
  }

  if (
    normalized.includes('primeiro-dia') ||
    normalized.includes('1-dia') ||
    normalized.includes('dia-1') ||
    normalized.includes('segundo-dia') ||
    normalized.includes('2-dia') ||
    normalized.includes('dia-2')
  ) {
    return 90;
  }

  return 0;
}

function buildTags({ title, year, area, isAnswerKey }) {
  const baseTags = ['enem', String(year), slugify(area).replace(/-/g, '_')];

  baseTags.push(isAnswerKey ? 'gabarito' : 'prova');

  const normalizedTitle = slugify(title);

  if (normalizedTitle.includes('digital')) baseTags.push('digital');
  if (normalizedTitle.includes('reaplicacao')) baseTags.push('reaplicacao');
  if (normalizedTitle.includes('ppl')) baseTags.push('ppl');
  if (normalizedTitle.includes('libras')) baseTags.push('libras');
  if (normalizedTitle.includes('braile') || normalizedTitle.includes('braille')) baseTags.push('braille');
  if (normalizedTitle.includes('ampliada') || normalizedTitle.includes('superampliada')) {
    baseTags.push('fonte_ampliada');
  }

  return [...new Set(baseTags)];
}

function inferFormatoFromHref(href) {
  const normalizedHref = cleanText(href).toLowerCase();

  if (normalizedHref.endsWith('.zip')) return 'zip';
  if (normalizedHref.endsWith('.txt')) return 'txt';

  return 'pdf';
}

function normalizeProva(raw) {
  const title = cleanText(raw?.title);
  const href = cleanText(raw?.href);
  const year = Number(raw?.year);
  const officialPageUrl = cleanText(raw?.officialPageUrl);
  const normalizedTitle = slugify(title);
  const isAnswerKey = normalizedTitle.includes('gabarito');
  const area = inferAreaFromTitle(title);

  return {
    titulo: title,
    slug: slugify(`${year}-${title}`),
    instituicao: 'INEP',
    ano: Number.isFinite(year) ? year : null,
    tipo: 'ENEM',
    area,
    nivel: 'Ensino Medio',
    formato: inferFormatoFromHref(href),
    url_arquivo: href || null,
    url_gabarito: isAnswerKey ? href || null : null,
    url_oficial: officialPageUrl || null,
    gabarito: isAnswerKey,
    resolucao: false,
    numero_questoes: inferNumeroQuestoes(title),
    tags: buildTags({ title, year, area, isAnswerKey }),
    download_count: 0,
    status: 'pending_review',
    fonte: 'scraper_inep_enem',
    last_scraped_at: new Date().toISOString()
  };
}

export {
  cleanText,
  slugify,
  inferAreaFromTitle,
  inferNumeroQuestoes,
  inferFormatoFromHref,
  normalizeProva
};
