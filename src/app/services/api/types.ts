/**
 * API Types for EDUCA ACESSO
 * These types define the data structures used throughout the application
 * and provide a contract for future database integration
 */

export interface Vestibular {
  id: string;
  nome: string;
  tipo: string;
  nivel: string;
  prazo: string;
  inscricoesAbertas: boolean;
  isencaoDisponivel: boolean;
  acessibilidade: string[];
  descricao: string;
  passos: string[];
  documentos: string[];
  datas: { evento: string; data: string }[];
  linkOficial: string;
}

export interface Curso {
  id: string;
  nome: string;
  plataforma: string;
  area: string;
  gratuito: boolean;
  duracao: string;
  nivel: string;
  descricao: string;
  link: string;
}

export interface VestibularFilters {
  tipo?: string;
  nivel?: string;
  inscricoesAbertas?: boolean;
  isencaoDisponivel?: boolean;
}

export interface CursoFilters {
  area?: string;
  plataforma?: string;
  nivel?: string;
  gratuito?: boolean;
  searchTerm?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
