/**
 * Cursos Service
 *
 * This service provides an abstraction layer for fetching curso data.
 * Currently uses mock data, but can be easily replaced with Supabase calls.
 *
 * Future Supabase Integration:
 * - Replace mock data imports with Supabase client
 * - Use supabase.from('cursos').select()
 * - Add proper error handling and loading states
 */

import { cursos } from '../../data/mockData';
import { Curso, CursoFilters, ApiResponse } from './types';

class CursosService {
  /**
   * Fetch all cursos
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('cursos')
   *   .select('*')
   *   .order('nome');
   */
  async getAllCursos(): Promise<ApiResponse<Curso[]>> {
    try {
      // Simulate async API call
      await this.simulateDelay();
      return { data: cursos };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar cursos'
      };
    }
  }

  /**
   * Fetch curso by ID
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('cursos')
   *   .select('*')
   *   .eq('id', id)
   *   .single();
   */
  async getCursoById(id: string): Promise<ApiResponse<Curso | null>> {
    try {
      await this.simulateDelay();
      const curso = cursos.find(c => c.id === id);
      return { data: curso || null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar curso'
      };
    }
  }

  /**
   * Filter cursos based on criteria
   *
   * Future Supabase implementation:
   * let query = supabase.from('cursos').select('*');
   * if (filters.area) query = query.eq('area', filters.area);
   * if (filters.gratuito !== undefined) query = query.eq('gratuito', filters.gratuito);
   * if (filters.searchTerm) query = query.ilike('nome', `%${filters.searchTerm}%`);
   * const { data, error } = await query;
   */
  async filterCursos(filters: CursoFilters): Promise<ApiResponse<Curso[]>> {
    try {
      await this.simulateDelay();

      let filtered = [...cursos];

      if (filters.area) {
        filtered = filtered.filter(c => c.area === filters.area);
      }

      if (filters.plataforma) {
        filtered = filtered.filter(c => c.plataforma === filters.plataforma);
      }

      if (filters.nivel) {
        filtered = filtered.filter(c => c.nivel === filters.nivel);
      }

      if (filters.gratuito !== undefined) {
        filtered = filtered.filter(c => c.gratuito === filters.gratuito);
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(c =>
          c.nome.toLowerCase().includes(searchLower) ||
          c.descricao.toLowerCase().includes(searchLower) ||
          c.plataforma.toLowerCase().includes(searchLower)
        );
      }

      return { data: filtered };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao filtrar cursos'
      };
    }
  }

  /**
   * Get unique areas from cursos
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('cursos')
   *   .select('area')
   *   .order('area');
   * return [...new Set(data.map(c => c.area))];
   */
  async getAreas(): Promise<ApiResponse<string[]>> {
    try {
      await this.simulateDelay();
      const areas = [...new Set(cursos.map(c => c.area))].sort();
      return { data: areas };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar áreas'
      };
    }
  }

  /**
   * Get unique plataformas from cursos
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('cursos')
   *   .select('plataforma')
   *   .order('plataforma');
   * return [...new Set(data.map(c => c.plataforma))];
   */
  async getPlataformas(): Promise<ApiResponse<string[]>> {
    try {
      await this.simulateDelay();
      const plataformas = [...new Set(cursos.map(c => c.plataforma))].sort();
      return { data: plataformas };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar plataformas'
      };
    }
  }

  /**
   * Simulate network delay for development
   * Remove this in production with real API
   */
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Export singleton instance
export const cursosService = new CursosService();
