/**
 * Types for Web Scraping and Data Collection
 *
 * These types define the structure for automated data collection
 * from official sources (ENEM, SISU, PROUNI, FUVEST, etc.)
 */

export interface ScraperSource {
  id: string;
  nome: string;
  url: string;
  tipo: 'vestibular' | 'curso' | 'prova';
  ultimaAtualizacao?: string;
  ativo: boolean;
}

export interface ScrapedVestibularData {
  fonte: string;
  nome: string;
  tipo: string;
  nivel: string;
  datas: {
    inscricoesInicio?: string;
    inscricoesFim?: string;
    prova1?: string;
    prova2?: string;
    resultado?: string;
    isencaoInicio?: string;
    isencaoFim?: string;
  };
  taxaInscricao?: number;
  isencaoDisponivel: boolean;
  linkOficial: string;
  linkEdital?: string;
  coletadoEm: string;
}

export interface ScrapingResult<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  timestamp: string;
}

export interface ScrapingConfig {
  intervaloMinutos: number;
  fontes: ScraperSource[];
  notificarErros: boolean;
  salvarHistorico: boolean;
}
