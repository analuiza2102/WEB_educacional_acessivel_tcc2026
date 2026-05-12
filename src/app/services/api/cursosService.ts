import { supabase } from '../supabaseClient';
import { Curso, CursoFilters, ApiResponse } from './types';

type CursoRow = {
  id: string;
  nome: string | null;
  plataforma: string | null;
  area: string | null;
  gratuito: boolean | null;
  duracao: string | null;
  nivel: string | null;
  descricao: string | null;
  link: string | null;
};

function mapCurso(row: CursoRow): Curso {
  return {
    id: row.id,
    nome: row.nome ?? '',
    plataforma: row.plataforma ?? '',
    area: row.area ?? '',
    gratuito: row.gratuito ?? false,
    duracao: row.duracao ?? '',
    nivel: row.nivel ?? '',
    descricao: row.descricao ?? '',
    link: row.link ?? ''
  };
}

class CursosService {
  async getAllCursos(): Promise<ApiResponse<Curso[]>> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase não configurado' };
      }

      const { data, error } = await supabase
        .from('cursos')
        .select('id, nome, plataforma, area, gratuito, duracao, nivel, descricao, link')
        .eq('status', 'published')
        .order('nome');

      if (error) throw error;

      return { data: (data ?? []).map(mapCurso) };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar cursos'
      };
    }
  }

  async getCursoById(id: string): Promise<ApiResponse<Curso | null>> {
    try {
      if (!supabase) {
        return { data: null, error: 'Supabase não configurado' };
      }

      const { data, error } = await supabase
        .from('cursos')
        .select('id, nome, plataforma, area, gratuito, duracao, nivel, descricao, link')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      return { data: data ? mapCurso(data) : null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar curso'
      };
    }
  }

  async filterCursos(filters: CursoFilters): Promise<ApiResponse<Curso[]>> {
    try {
      if (!supabase) {
        return { data: [], error: 'Supabase não configurado' };
      }

      let query = supabase
        .from('cursos')
        .select('id, nome, plataforma, area, gratuito, duracao, nivel, descricao, link')
        .eq('status', 'published');

      if (filters.area) query = query.eq('area', filters.area);
      if (filters.plataforma) query = query.eq('plataforma', filters.plataforma);
      if (filters.nivel) query = query.eq('nivel', filters.nivel);
      if (filters.gratuito !== undefined) query = query.eq('gratuito', filters.gratuito);
      if (filters.searchTerm) {
        const term = filters.searchTerm.replace(/[%_]/g, '\\$&');
        query = query.or(`nome.ilike.%${term}%,descricao.ilike.%${term}%,plataforma.ilike.%${term}%`);
      }

      const { data, error } = await query.order('nome');

      if (error) throw error;

      return { data: (data ?? []).map(mapCurso) };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao filtrar cursos'
      };
    }
  }

  async getAreas(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await this.getAllCursos();
      if (error) return { data: [], error };

      const areas = [...new Set(data.map(curso => curso.area).filter(Boolean))].sort();
      return { data: areas };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar áreas'
      };
    }
  }

  async getPlataformas(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await this.getAllCursos();
      if (error) return { data: [], error };

      const plataformas = [...new Set(data.map(curso => curso.plataforma).filter(Boolean))].sort();
      return { data: plataformas };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar plataformas'
      };
    }
  }
}

export const cursosService = new CursosService();
