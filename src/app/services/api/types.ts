/** Data used by the public vestibular pages. */
export interface DocumentoOficial {
  titulo: string;
  url: string;
}

export interface Vestibular {
  id: string;
  nome: string;
  tipo: string;
  nivel: string;
  prazo: string;
  inscricoesAbertas: boolean;
  inscricaoInicio: string | null;
  inscricaoFim: string | null;
  isencaoDisponivel: boolean;
  isencaoInicio: string | null;
  isencaoFim: string | null;
  taxaInscricao: number | null;
  acessibilidade: string[];
  descricao: string;
  passos: string[];
  documentos: string[];
  documentosOficiais: DocumentoOficial[];
  guiaInclusao: DocumentoOficial | null;
  datas: { evento: string; data: string }[];
  linkOficial: string;
  inscricaoUrl: string | null;
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
