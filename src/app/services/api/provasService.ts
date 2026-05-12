import { supabase } from '../supabaseClient';
import { ApiResponse } from './types';

export interface Prova {
  id: string;
  titulo: string;
  instituicao: string;
  ano: number;
  tipo: string;
  area?: string;
  nivel: string;
  formato: 'pdf' | 'imagem';
  urlArquivo?: string;
  urlGabarito?: string;
  urlOficial?: string;
  gabarito: boolean;
  resolucao: boolean;
  numeroQuestoes: number;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProvaFilters {
  instituicao?: string;
  ano?: number;
  anoMin?: number;
  anoMax?: number;
  area?: string;
  tipo?: string;
  comGabarito?: boolean;
  comResolucao?: boolean;
  searchTerm?: string;
}

export interface ProvaUpload {
  titulo: string;
  instituicao: string;
  ano: number;
  tipo: string;
  area?: string;
  arquivo: File;
  gabarito: boolean;
  resolucao: boolean;
  tags: string[];
}

type ProvaRow = {
  id: string;
  titulo: string | null;
  instituicao: string | null;
  ano: number | null;
  tipo: string | null;
  area: string | null;
  nivel: string | null;
  formato: 'pdf' | 'imagem' | null;
  url_arquivo: string | null;
  url_gabarito: string | null;
  url_oficial: string | null;
  gabarito: boolean | null;
  resolucao: boolean | null;
  numero_questoes: number | null;
  tags: string[] | null;
  download_count: number | null;
  created_at: string | null;
  updated_at: string | null;
};

const provaSelect =
  'id, titulo, instituicao, ano, tipo, area, nivel, formato, url_arquivo, url_gabarito, url_oficial, gabarito, resolucao, numero_questoes, tags, download_count, created_at, updated_at';

function mapProva(row: ProvaRow): Prova {
  return {
    id: row.id,
    titulo: row.titulo ?? '',
    instituicao: row.instituicao ?? '',
    ano: row.ano ?? 0,
    tipo: row.tipo ?? '',
    area: row.area ?? undefined,
    nivel: row.nivel ?? '',
    formato: row.formato ?? 'pdf',
    urlArquivo: row.url_arquivo ?? undefined,
    urlGabarito: row.url_gabarito ?? undefined,
    urlOficial: row.url_oficial ?? undefined,
    gabarito: row.gabarito ?? false,
    resolucao: row.resolucao ?? false,
    numeroQuestoes: row.numero_questoes ?? 0,
    tags: row.tags ?? [],
    downloadCount: row.download_count ?? 0,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? ''
  };
}

class ProvasService {
  async getAllProvas(): Promise<ApiResponse<Prova[]>> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase não configurado' };
      }

      const { data, error } = await supabase
        .from('provas')
        .select(provaSelect)
        .eq('status', 'published')
        .order('ano', { ascending: false })
        .order('download_count', { ascending: false });

      if (error) throw error;

      return { data: (data ?? []).map(mapProva) };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar provas'
      };
    }
  }

  async getProvaById(id: string): Promise<ApiResponse<Prova | null>> {
    try {
      if (!supabase) {
        return { data: null, error: 'Supabase não configurado' };
      }

      const { data, error } = await supabase
        .from('provas')
        .select(provaSelect)
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      return { data: data ? mapProva(data) : null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar prova'
      };
    }
  }

  async filterProvas(filters: ProvaFilters): Promise<ApiResponse<Prova[]>> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase não configurado' };
      }

      let query = supabase
        .from('provas')
        .select(provaSelect)
        .eq('status', 'published');

      if (filters.instituicao) query = query.eq('instituicao', filters.instituicao);
      if (filters.ano) query = query.eq('ano', filters.ano);
      if (filters.anoMin) query = query.gte('ano', filters.anoMin);
      if (filters.anoMax) query = query.lte('ano', filters.anoMax);
      if (filters.area) query = query.eq('area', filters.area);
      if (filters.tipo) query = query.eq('tipo', filters.tipo);
      if (filters.comGabarito !== undefined) query = query.eq('gabarito', filters.comGabarito);
      if (filters.comResolucao !== undefined) query = query.eq('resolucao', filters.comResolucao);
      if (filters.searchTerm) {
        const term = filters.searchTerm.replace(/[%_]/g, '\\$&');
        query = query.or(`titulo.ilike.%${term}%,instituicao.ilike.%${term}%`);
      }

      const { data, error } = await query
        .order('ano', { ascending: false })
        .order('download_count', { ascending: false });

      if (error) throw error;

      return { data: (data ?? []).map(mapProva) };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao filtrar provas'
      };
    }
  }

  async getInstituicoes(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await this.getAllProvas();
      if (error) return { data: [], error };

      const instituicoes = [...new Set(data.map(prova => prova.instituicao).filter(Boolean))].sort();
      return { data: instituicoes };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar instituições'
      };
    }
  }

  async getAnosDisponiveis(): Promise<ApiResponse<number[]>> {
    try {
      const { data, error } = await this.getAllProvas();
      if (error) return { data: [], error };

      const anos = [...new Set(data.map(prova => prova.ano).filter(Boolean))].sort((a, b) => b - a);
      return { data: anos };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar anos'
      };
    }
  }

  async incrementDownloadCount(id: string): Promise<boolean> {
    try {
      if (!supabase) return false;

      const { error } = await supabase.rpc('increment_prova_download_count', {
        prova_id: id
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao incrementar downloads:', error);
      return false;
    }
  }

  async uploadProva(_upload: ProvaUpload): Promise<ApiResponse<Prova>> {
    return {
      data: null as unknown as Prova,
      error: 'Upload de provas deve ser feito pelo painel do Supabase nesta versão'
    };
  }
}

export const provasService = new ProvasService();
