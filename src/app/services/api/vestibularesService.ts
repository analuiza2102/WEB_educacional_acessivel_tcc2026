/**
 * Vestibulares Service
 *
 * This service provides an abstraction layer for fetching vestibular data.
 * Currently uses mock data, but can be easily replaced with Supabase calls.
 *
 * Future Supabase Integration:
 * - Replace mock data imports with Supabase client
 * - Use supabase.from('vestibulares').select()
 * - Add proper error handling and loading states
 */

import { vestibulares } from '../../data/mockData';
import { Vestibular, VestibularFilters, ApiResponse } from './types';

class VestibularesService {
  /**
   * Fetch all vestibulares
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('vestibulares')
   *   .select('*')
   *   .order('nome');
   */
  async getAllVestibulares(): Promise<ApiResponse<Vestibular[]>> {
    try {
      // Simulate async API call
      await this.simulateDelay();
      return { data: vestibulares };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar vestibulares'
      };
    }
  }

  /**
   * Fetch vestibular by ID
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('vestibulares')
   *   .select('*')
   *   .eq('id', id)
   *   .single();
   */
  async getVestibularById(id: string): Promise<ApiResponse<Vestibular | null>> {
    try {
      await this.simulateDelay();
      const vestibular = vestibulares.find(v => v.id === id);
      return { data: vestibular || null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar vestibular'
      };
    }
  }

  /**
   * Filter vestibulares based on criteria
   *
   * Future Supabase implementation:
   * let query = supabase.from('vestibulares').select('*');
   * if (filters.tipo) query = query.eq('tipo', filters.tipo);
   * if (filters.inscricoesAbertas) query = query.eq('inscricoesAbertas', true);
   * const { data, error } = await query;
   */
  async filterVestibulares(filters: VestibularFilters): Promise<ApiResponse<Vestibular[]>> {
    try {
      await this.simulateDelay();

      let filtered = [...vestibulares];

      if (filters.tipo) {
        filtered = filtered.filter(v => v.tipo === filters.tipo);
      }

      if (filters.nivel) {
        filtered = filtered.filter(v => v.nivel === filters.nivel);
      }

      if (filters.inscricoesAbertas !== undefined) {
        filtered = filtered.filter(v => v.inscricoesAbertas === filters.inscricoesAbertas);
      }

      if (filters.isencaoDisponivel !== undefined) {
        filtered = filtered.filter(v => v.isencaoDisponivel === filters.isencaoDisponivel);
      }

      return { data: filtered };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao filtrar vestibulares'
      };
    }
  }

  /**
   * Search vestibulares by name
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('vestibulares')
   *   .select('*')
   *   .ilike('nome', `%${searchTerm}%`);
   */
  async searchVestibulares(searchTerm: string): Promise<ApiResponse<Vestibular[]>> {
    try {
      await this.simulateDelay();

      const filtered = vestibulares.filter(v =>
        v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return { data: filtered };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar vestibulares'
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
export const vestibularesService = new VestibularesService();
