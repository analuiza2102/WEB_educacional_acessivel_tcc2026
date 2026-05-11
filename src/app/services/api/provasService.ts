/**
 * Provas Service - Banco de Provas Anteriores
 *
 * Gerencia o banco de provas de vestibulares anteriores para estudo.
 *
 * ASPECTOS LEGAIS IMPORTANTES:
 * 1. Use apenas provas PÚBLICAS e de domínio público
 * 2. Respeite direitos autorais - muitas provas são protegidas
 * 3. Dê crédito apropriado à instituição organizadora
 * 4. Verifique se a instituição permite redistribuição
 * 5. ENEM e outros exames públicos geralmente permitem uso educacional
 *
 * FONTES CONFIÁVEIS E LEGAIS:
 * - INEP (ENEM): https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos
 * - FUVEST: https://www.fuvest.br/provas-anteriores/
 * - Sites oficiais das universidades (geralmente disponibilizam gratuitamente)
 */

export interface Prova {
  id: string;
  titulo: string;
  instituicao: string; // ENEM, FUVEST, UNICAMP, etc.
  ano: number;
  tipo: string; // '1ª Fase', '2ª Fase', 'Redação', 'Completa'
  area?: string; // 'Matemática', 'Linguagens', 'Ciências da Natureza', etc.
  nivel: string; // 'Ensino Médio', 'Ensino Superior'
  formato: 'pdf' | 'imagem';
  urlArquivo?: string; // URL do arquivo no Supabase Storage
  urlOficial?: string; // Link para download no site oficial
  gabarito: boolean; // Se inclui gabarito
  resolucao: boolean; // Se inclui resolução comentada
  numeroQuestoes: number;
  tags: string[]; // ['matemática', 'geometria', 'álgebra', etc.]
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

import { ApiResponse } from './types';

// Mock data para demonstração
const provasMock: Prova[] = [
  {
    id: '1',
    titulo: 'ENEM 2023 - Prova Completa',
    instituicao: 'ENEM',
    ano: 2023,
    tipo: 'Completa',
    nivel: 'Ensino Médio',
    formato: 'pdf',
    urlOficial: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
    gabarito: true,
    resolucao: false,
    numeroQuestoes: 180,
    tags: ['enem', '2023', 'completa'],
    downloadCount: 15420,
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2023-11-01T00:00:00Z'
  },
  {
    id: '2',
    titulo: 'ENEM 2023 - Matemática e suas Tecnologias',
    instituicao: 'ENEM',
    ano: 2023,
    tipo: 'Por Área',
    area: 'Matemática',
    nivel: 'Ensino Médio',
    formato: 'pdf',
    urlOficial: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
    gabarito: true,
    resolucao: true,
    numeroQuestoes: 45,
    tags: ['enem', '2023', 'matemática', 'resolução'],
    downloadCount: 8950,
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2023-11-01T00:00:00Z'
  },
  {
    id: '3',
    titulo: 'FUVEST 2024 - 1ª Fase',
    instituicao: 'FUVEST',
    ano: 2024,
    tipo: '1ª Fase',
    nivel: 'Ensino Superior',
    formato: 'pdf',
    urlOficial: 'https://www.fuvest.br/provas-anteriores/',
    gabarito: true,
    resolucao: false,
    numeroQuestoes: 90,
    tags: ['fuvest', '2024', '1ª fase', 'usp'],
    downloadCount: 6320,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    titulo: 'UNICAMP 2024 - 1ª Fase',
    instituicao: 'UNICAMP',
    ano: 2024,
    tipo: '1ª Fase',
    nivel: 'Ensino Superior',
    formato: 'pdf',
    urlOficial: 'https://www.comvest.unicamp.br/vestibular-unicamp-2024/',
    gabarito: true,
    resolucao: true,
    numeroQuestoes: 90,
    tags: ['unicamp', '2024', '1ª fase', 'resolução'],
    downloadCount: 5180,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '5',
    titulo: 'ENEM 2022 - Linguagens e Códigos',
    instituicao: 'ENEM',
    ano: 2022,
    tipo: 'Por Área',
    area: 'Linguagens',
    nivel: 'Ensino Médio',
    formato: 'pdf',
    urlOficial: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
    gabarito: true,
    resolucao: false,
    numeroQuestoes: 45,
    tags: ['enem', '2022', 'linguagens', 'português'],
    downloadCount: 4720,
    createdAt: '2022-11-01T00:00:00Z',
    updatedAt: '2022-11-01T00:00:00Z'
  },
  {
    id: '6',
    titulo: 'ENEM 2022 - Ciências da Natureza',
    instituicao: 'ENEM',
    ano: 2022,
    tipo: 'Por Área',
    area: 'Ciências da Natureza',
    nivel: 'Ensino Médio',
    formato: 'pdf',
    urlOficial: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
    gabarito: true,
    resolucao: true,
    numeroQuestoes: 45,
    tags: ['enem', '2022', 'ciências', 'física', 'química', 'biologia'],
    downloadCount: 5330,
    createdAt: '2022-11-01T00:00:00Z',
    updatedAt: '2022-11-01T00:00:00Z'
  }
];

class ProvasService {
  /**
   * Buscar todas as provas
   *
   * Future Supabase implementation:
   * const { data, error } = await supabase
   *   .from('provas')
   *   .select('*')
   *   .order('ano', { ascending: false })
   *   .order('downloadCount', { ascending: false });
   */
  async getAllProvas(): Promise<ApiResponse<Prova[]>> {
    try {
      await this.simulateDelay();
      return { data: provasMock };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar provas'
      };
    }
  }

  /**
   * Buscar prova por ID
   */
  async getProvaById(id: string): Promise<ApiResponse<Prova | null>> {
    try {
      await this.simulateDelay();
      const prova = provasMock.find(p => p.id === id);
      return { data: prova || null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar prova'
      };
    }
  }

  /**
   * Filtrar provas
   *
   * Future Supabase implementation:
   * let query = supabase.from('provas').select('*');
   * if (filters.instituicao) query = query.eq('instituicao', filters.instituicao);
   * if (filters.ano) query = query.eq('ano', filters.ano);
   * if (filters.anoMin) query = query.gte('ano', filters.anoMin);
   * if (filters.anoMax) query = query.lte('ano', filters.anoMax);
   * if (filters.comGabarito) query = query.eq('gabarito', true);
   */
  async filterProvas(filters: ProvaFilters): Promise<ApiResponse<Prova[]>> {
    try {
      await this.simulateDelay();

      let filtered = [...provasMock];

      if (filters.instituicao) {
        filtered = filtered.filter(p => p.instituicao === filters.instituicao);
      }

      if (filters.ano) {
        filtered = filtered.filter(p => p.ano === filters.ano);
      }

      if (filters.anoMin) {
        filtered = filtered.filter(p => p.ano >= filters.anoMin);
      }

      if (filters.anoMax) {
        filtered = filtered.filter(p => p.ano <= filters.anoMax);
      }

      if (filters.area) {
        filtered = filtered.filter(p => p.area === filters.area);
      }

      if (filters.tipo) {
        filtered = filtered.filter(p => p.tipo === filters.tipo);
      }

      if (filters.comGabarito !== undefined) {
        filtered = filtered.filter(p => p.gabarito === filters.comGabarito);
      }

      if (filters.comResolucao !== undefined) {
        filtered = filtered.filter(p => p.resolucao === filters.comResolucao);
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
          p.titulo.toLowerCase().includes(searchLower) ||
          p.instituicao.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return { data: filtered };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao filtrar provas'
      };
    }
  }

  /**
   * Obter instituições únicas
   */
  async getInstituicoes(): Promise<ApiResponse<string[]>> {
    try {
      await this.simulateDelay();
      const instituicoes = [...new Set(provasMock.map(p => p.instituicao))].sort();
      return { data: instituicoes };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar instituições'
      };
    }
  }

  /**
   * Obter anos disponíveis
   */
  async getAnosDisponiveis(): Promise<ApiResponse<number[]>> {
    try {
      await this.simulateDelay();
      const anos = [...new Set(provasMock.map(p => p.ano))].sort((a, b) => b - a);
      return { data: anos };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro ao buscar anos'
      };
    }
  }

  /**
   * Incrementar contador de downloads
   *
   * Future Supabase implementation:
   * await supabase.rpc('increment_download_count', { prova_id: id });
   */
  async incrementDownloadCount(id: string): Promise<boolean> {
    try {
      await this.simulateDelay();
      const prova = provasMock.find(p => p.id === id);
      if (prova) {
        prova.downloadCount++;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao incrementar downloads:', error);
      return false;
    }
  }

  /**
   * Upload de nova prova (ADMIN apenas)
   *
   * Future Supabase implementation:
   * 1. Upload do arquivo para Supabase Storage:
   *    const { data, error } = await supabase.storage
   *      .from('provas')
   *      .upload(`${instituicao}/${ano}/${filename}`, file);
   *
   * 2. Inserir metadata no banco:
   *    await supabase.from('provas').insert({...metadata, urlArquivo: data.path});
   */
  async uploadProva(upload: ProvaUpload): Promise<ApiResponse<Prova>> {
    try {
      await this.simulateDelay();

      // TODO: Implementar upload real para Supabase Storage
      // TODO: Validar arquivo (tipo, tamanho)
      // TODO: Escanear por malware
      // TODO: Verificar direitos autorais

      const novaProva: Prova = {
        id: Math.random().toString(36).substr(2, 9),
        titulo: upload.titulo,
        instituicao: upload.instituicao,
        ano: upload.ano,
        tipo: upload.tipo,
        area: upload.area,
        nivel: 'Ensino Médio',
        formato: 'pdf',
        gabarito: upload.gabarito,
        resolucao: upload.resolucao,
        numeroQuestoes: 0,
        tags: upload.tags,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { data: novaProva };
    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload'
      };
    }
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Export singleton instance
export const provasService = new ProvasService();
