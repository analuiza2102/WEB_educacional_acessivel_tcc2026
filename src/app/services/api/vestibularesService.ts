import { supabase } from '../supabaseClient';
import { Vestibular, VestibularFilters, ApiResponse } from './types';

type VestibularRow = {
  id: string;
  nome: string | null;
  tipo: string | null;
  nivel: string | null;
  prazo: string | null;
  inscricoes_abertas: boolean | null;
  isencao_disponivel: boolean | null;
  acessibilidade: string[] | null;
  descricao: string | null;
  passos: string[] | null;
  documentos: string[] | null;
  datas: { evento: string; data: string }[] | null;
  link_oficial: string | null;
};

function mapVestibular(row: VestibularRow): Vestibular {
  return {
    id: row.id,
    nome: row.nome ?? '',
    tipo: row.tipo ?? '',
    nivel: row.nivel ?? '',
    prazo: row.prazo ?? '',
    inscricoesAbertas: row.inscricoes_abertas ?? false,
    isencaoDisponivel: row.isencao_disponivel ?? false,
    acessibilidade: row.acessibilidade ?? [],
    descricao: row.descricao ?? '',
    passos: row.passos ?? [],
    documentos: row.documentos ?? [],
    datas: Array.isArray(row.datas) ? row.datas : [],
    linkOficial: row.link_oficial ?? ''
  };
}

class VestibularesService {
  async getAllVestibulares(): Promise<ApiResponse<Vestibular[]>> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase não configurado' };
      }

      const { data, error } = await supabase
        .from('vestibulares')
        .select('id, nome, tipo, nivel, prazo, inscricoes_abertas, isencao_disponivel, acessibilidade, descricao, passos, documentos, datas, link_oficial')
        .eq('status', 'published')
        .order('nome');

      if (error) throw error;

      return { data: (data ?? []).map(mapVestibular) };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar vestibulares'
      };
    }
  }

  async getVestibularById(id: string): Promise<ApiResponse<Vestibular | null>> {
    try {
      if (!supabase) {
        return { data: null, error: 'Supabase não configurado' };
      }

      const { data, error } = await supabase
        .from('vestibulares')
        .select('id, nome, tipo, nivel, prazo, inscricoes_abertas, isencao_disponivel, acessibilidade, descricao, passos, documentos, datas, link_oficial')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      return { data: data ? mapVestibular(data) : null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar vestibular'
      };
    }
  }

  async filterVestibulares(filters: VestibularFilters): Promise<ApiResponse<Vestibular[]>> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase não configurado' };
      }

      let query = supabase
        .from('vestibulares')
        .select('id, nome, tipo, nivel, prazo, inscricoes_abertas, isencao_disponivel, acessibilidade, descricao, passos, documentos, datas, link_oficial')
        .eq('status', 'published');

      if (filters.tipo) query = query.eq('tipo', filters.tipo);
      if (filters.nivel) query = query.eq('nivel', filters.nivel);
      if (filters.inscricoesAbertas !== undefined) {
        query = query.eq('inscricoes_abertas', filters.inscricoesAbertas);
      }
      if (filters.isencaoDisponivel !== undefined) {
        query = query.eq('isencao_disponivel', filters.isencaoDisponivel);
      }

      const { data, error } = await query.order('nome');

      if (error) throw error;

      return { data: (data ?? []).map(mapVestibular) };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao filtrar vestibulares'
      };
    }
  }

  async searchVestibulares(searchTerm: string): Promise<ApiResponse<Vestibular[]>> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase não configurado' };
      }

      const term = searchTerm.replace(/[%_]/g, '\\$&');
      const { data, error } = await supabase
        .from('vestibulares')
        .select('id, nome, tipo, nivel, prazo, inscricoes_abertas, isencao_disponivel, acessibilidade, descricao, passos, documentos, datas, link_oficial')
        .eq('status', 'published')
        .or(`nome.ilike.%${term}%,descricao.ilike.%${term}%`)
        .order('nome');

      if (error) throw error;

      return { data: (data ?? []).map(mapVestibular) };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar vestibulares'
      };
    }
  }
}

export const vestibularesService = new VestibularesService();
