import { supabase } from '../supabaseClient';
import { ApiResponse, DocumentoOficial, Vestibular, VestibularFilters } from './types';

const BASE_COLUMNS = 'id, nome, tipo, nivel, instituicao, descricao, prazo, inscricoes_abertas, inscricao_inicio, inscricao_fim, isencao_disponivel, isencao_inicio, isencao_fim, taxa_inscricao, acessibilidade, passos, documentos, datas, link_oficial, inscricao_url, guia_inclusao_url';
const DETAIL_COLUMNS = `${BASE_COLUMNS}, vestibular_eventos(event_key, titulo, data_inicio, data_fim, ordem), vestibular_documentos(titulo, url, ordem)`;
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric'
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});

type EventoRow = {
  event_key: string;
  titulo: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  ordem: number | null;
};

type DocumentoRow = {
  titulo: string | null;
  url: string | null;
  ordem: number | null;
};

type VestibularRow = {
  id: string;
  nome: string | null;
  tipo: string | null;
  nivel: string | null;
  instituicao: string | null;
  descricao: string | null;
  prazo: string | null;
  inscricoes_abertas: boolean | null;
  inscricao_inicio: string | null;
  inscricao_fim: string | null;
  isencao_disponivel: boolean | null;
  isencao_inicio: string | null;
  isencao_fim: string | null;
  taxa_inscricao: number | string | null;
  acessibilidade: string[] | null;
  passos: string[] | null;
  documentos: string[] | null;
  datas: { evento: string; data: string }[] | null;
  link_oficial: string | null;
  inscricao_url: string | null;
  guia_inclusao_url: string | null;
  vestibular_eventos?: EventoRow[] | null;
  vestibular_documentos?: DocumentoRow[] | null;
};

function isWebUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

function formatRange(start: string | null, end: string | null): string {
  const first = formatDate(start);
  const last = formatDate(end);
  if (!first) return last;
  return !last || first === last ? first : `${first} a ${last}`;
}

function formatRegistrationPeriod(start: string | null, end: string | null): string {
  const range = formatRange(start, end);
  if (!range || !end) return range;
  const date = new Date(end);
  if (Number.isNaN(date.getTime())) return range;
  const time = timeFormatter.format(date).replace(/:00$/, 'h').replace(':', 'h');
  return `${range}, até ${time} (horário de Brasília)`;
}

function periodIsOpen(start: string | null, end: string | null, fallback: boolean | null): boolean {
  if (!start || !end) return fallback ?? false;
  const from = Date.parse(start);
  const to = Date.parse(end);
  return Number.isFinite(from) && Number.isFinite(to) && from <= Date.now() && Date.now() <= to;
}

function titleFromUrl(url: string): string {
  try {
    const filename = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'Documento oficial');
    return filename.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim() || 'Documento oficial';
  } catch {
    return 'Documento oficial';
  }
}

function mapVestibular(row: VestibularRow): Vestibular {
  const legacyDocuments = Array.isArray(row.documentos) ? row.documentos.filter((item): item is string => typeof item === 'string') : [];
  const structuredDocuments: DocumentoOficial[] = (row.vestibular_documentos ?? [])
    .filter((doc): doc is DocumentoRow & { url: string } => Boolean(doc.url && isWebUrl(doc.url)))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    .map(doc => ({ titulo: doc.titulo?.trim() || titleFromUrl(doc.url), url: doc.url }));
  const officialDocuments = structuredDocuments.length > 0 ? structuredDocuments : legacyDocuments
    .filter(isWebUrl)
    .map(url => ({ titulo: titleFromUrl(url), url }));
  const guideUrl = row.guia_inclusao_url && isWebUrl(row.guia_inclusao_url) ? row.guia_inclusao_url : null;
  const guide = officialDocuments.find(doc => doc.url === guideUrl || /guia de inclus[aã]o/i.test(doc.titulo)) ??
    (guideUrl ? { titulo: 'Guia de Inclusão', url: guideUrl } : null);
  const events = (row.vestibular_eventos ?? [])
    .filter(event => event.titulo && event.data_inicio)
    .sort((a, b) => {
      const aDate = Date.parse(a.data_inicio!);
      const bDate = Date.parse(b.data_inicio!);
      return (aDate - bDate) || (a.ordem ?? 0) - (b.ordem ?? 0);
    })
    .map(event => ({ evento: event.titulo!, data: formatRange(event.data_inicio, event.data_fim) }));
  const institution = row.instituicao?.trim();
  const registrationPeriod = formatRegistrationPeriod(row.inscricao_inicio, row.inscricao_fim);
  const fee = row.taxa_inscricao === null ? null : Number(row.taxa_inscricao);

  return {
    id: row.id,
    nome: row.nome ?? '',
    tipo: row.tipo ?? '',
    nivel: row.nivel ?? '',
    descricao: row.descricao?.trim() || (institution ? `Processo seletivo da ${institution}.` : ''),
    prazo: registrationPeriod || row.prazo || '',
    inscricoesAbertas: periodIsOpen(row.inscricao_inicio, row.inscricao_fim, row.inscricoes_abertas),
    inscricaoInicio: row.inscricao_inicio,
    inscricaoFim: row.inscricao_fim,
    isencaoDisponivel: periodIsOpen(row.isencao_inicio, row.isencao_fim, null),
    isencaoInicio: row.isencao_inicio,
    isencaoFim: row.isencao_fim,
    taxaInscricao: fee !== null && Number.isFinite(fee) ? fee : null,
    acessibilidade: Array.isArray(row.acessibilidade) ? row.acessibilidade : [],
    passos: Array.isArray(row.passos) ? row.passos : [],
    documentos: legacyDocuments.filter(item => !isWebUrl(item)),
    documentosOficiais: officialDocuments.filter(doc => doc.url !== guide?.url),
    guiaInclusao: guide,
    datas: events.length > 0 ? events : (Array.isArray(row.datas) ? row.datas : []),
    linkOficial: row.link_oficial && isWebUrl(row.link_oficial) ? row.link_oficial : '',
    inscricaoUrl: row.inscricao_url && isWebUrl(row.inscricao_url) ? row.inscricao_url : null
  };
}

class VestibularesService {
  async getAllVestibulares(): Promise<ApiResponse<Vestibular[]>> {
    try {
      if (!supabase) return { data: [], error: 'Supabase não configurado' };
      const { data, error } = await supabase.from('vestibulares')
        .select(BASE_COLUMNS).eq('status', 'published').order('nome');
      if (error) throw error;
      return { data: (data ?? []).map(row => mapVestibular(row as VestibularRow)) };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Erro ao buscar vestibulares' };
    }
  }

  async getVestibularById(id: string): Promise<ApiResponse<Vestibular | null>> {
    try {
      if (!supabase) return { data: null, error: 'Supabase não configurado' };
      const { data, error } = await supabase.from('vestibulares')
        .select(DETAIL_COLUMNS).eq('id', id).eq('status', 'published').maybeSingle();
      if (error) throw error;
      return { data: data ? mapVestibular(data as VestibularRow) : null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Erro ao buscar vestibular' };
    }
  }

  async filterVestibulares(filters: VestibularFilters): Promise<ApiResponse<Vestibular[]>> {
    try {
      if (!supabase) return { data: [], error: 'Supabase não configurado' };
      let query = supabase.from('vestibulares').select(BASE_COLUMNS).eq('status', 'published');
      if (filters.tipo) query = query.eq('tipo', filters.tipo);
      if (filters.nivel) query = query.eq('nivel', filters.nivel);
      const { data, error } = await query.order('nome');
      if (error) throw error;
      const mapped = (data ?? []).map(row => mapVestibular(row as VestibularRow));
      return { data: mapped.filter(item =>
        (filters.inscricoesAbertas === undefined || item.inscricoesAbertas === filters.inscricoesAbertas) &&
        (filters.isencaoDisponivel === undefined || item.isencaoDisponivel === filters.isencaoDisponivel)) };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Erro ao filtrar vestibulares' };
    }
  }

  async searchVestibulares(searchTerm: string): Promise<ApiResponse<Vestibular[]>> {
    try {
      if (!supabase) return { data: [], error: 'Supabase não configurado' };
      const term = searchTerm.replace(/[%_]/g, '\\$&');
      const { data, error } = await supabase.from('vestibulares')
        .select(BASE_COLUMNS).eq('status', 'published')
        .or(`nome.ilike.%${term}%,descricao.ilike.%${term}%`).order('nome');
      if (error) throw error;
      return { data: (data ?? []).map(row => mapVestibular(row as VestibularRow)) };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Erro ao buscar vestibulares' };
    }
  }
}

export const vestibularesService = new VestibularesService();
