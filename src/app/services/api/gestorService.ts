import { supabase } from '../supabaseClient';
import type { ApiResponse } from './types';

export type CursoStatus = 'pending_review' | 'published' | 'rejected' | 'archived';

export interface CursoGestor {
  id: string;
  nome: string;
  plataforma: string;
  area: string;
  gratuito: boolean;
  duracao: string;
  nivel: string;
  descricao: string;
  link: string;
  status: string;
  fonte: string;
  last_scraped_at: string | null;
  review_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type CursoUpdateInput = Partial<
  Pick<
    CursoGestor,
    'nome' | 'plataforma' | 'area' | 'duracao' | 'nivel' | 'descricao' | 'link' | 'review_notes'
  >
>;

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
  status: string | null;
  fonte: string | null;
  last_scraped_at: string | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const cursoFields = [
  'id',
  'nome',
  'plataforma',
  'area',
  'gratuito',
  'duracao',
  'nivel',
  'descricao',
  'link',
  'status',
  'fonte',
  'last_scraped_at',
  'review_notes',
  'reviewed_by',
  'reviewed_at',
  'created_at',
  'updated_at'
].join(', ');

function mapCurso(row: CursoRow): CursoGestor {
  return {
    id: row.id,
    nome: row.nome ?? '',
    plataforma: row.plataforma ?? '',
    area: row.area ?? '',
    gratuito: row.gratuito ?? false,
    duracao: row.duracao ?? '',
    nivel: row.nivel ?? '',
    descricao: row.descricao ?? '',
    link: row.link ?? '',
    status: row.status ?? '',
    fonte: row.fonte ?? '',
    last_scraped_at: row.last_scraped_at,
    review_notes: row.review_notes ?? '',
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getSupabaseClient() {
  if (!supabase) throw new Error('Supabase não configurado');
  return supabase;
}

class GestorService {
  async getPendingCursos(): Promise<ApiResponse<CursoGestor[]>> {
    return this.getCursosByStatus('pending_review');
  }

  async getCursosByStatus(status: string): Promise<ApiResponse<CursoGestor[]>> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('cursos')
        .select(cursoFields)
        .eq('status', status)
        .order('last_scraped_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: ((data ?? []) as CursoRow[]).map(mapCurso) };
    } catch (error) {
      return { data: [], error: errorMessage(error, 'Erro ao buscar cursos') };
    }
  }

  async approveCurso(id: string): Promise<ApiResponse<CursoGestor | null>> {
    return this.updateReviewStatus(id, 'published');
  }

  async rejectCurso(id: string, reviewNotes?: string): Promise<ApiResponse<CursoGestor | null>> {
    return this.updateReviewStatus(id, 'rejected', reviewNotes);
  }

  async archiveCurso(id: string): Promise<ApiResponse<CursoGestor | null>> {
    return this.updateReviewStatus(id, 'archived');
  }

  async updateCurso(
    id: string,
    updates: CursoUpdateInput
  ): Promise<ApiResponse<CursoGestor | null>> {
    try {
      const client = getSupabaseClient();
      const allowedKeys: (keyof CursoUpdateInput)[] = [
        'nome',
        'plataforma',
        'area',
        'duracao',
        'nivel',
        'descricao',
        'link',
        'review_notes'
      ];
      const safeUpdates = Object.fromEntries(
        allowedKeys
          .filter((key) => updates[key] !== undefined)
          .map((key) => [key, updates[key]])
      );

      const { data, error } = await client
        .from('cursos')
        .update({ ...safeUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(cursoFields)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Curso não encontrado ou atualização não autorizada');

      return { data: mapCurso(data as CursoRow) };
    } catch (error) {
      return { data: null, error: errorMessage(error, 'Erro ao atualizar curso') };
    }
  }

  private async updateReviewStatus(
    id: string,
    status: CursoStatus,
    reviewNotes?: string
  ): Promise<ApiResponse<CursoGestor | null>> {
    try {
      const client = getSupabaseClient();
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('Sessão inválida. Entre novamente para revisar o curso.');
      }

      const now = new Date().toISOString();
      const changes: Record<string, string | null> = {
        status,
        reviewed_by: userData.user.id,
        reviewed_at: now,
        updated_at: now
      };

      if (reviewNotes !== undefined) changes.review_notes = reviewNotes.trim() || null;

      const { data, error } = await client
        .from('cursos')
        .update(changes)
        .eq('id', id)
        .select(cursoFields)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Curso não encontrado ou ação não autorizada');

      return { data: mapCurso(data as CursoRow) };
    } catch (error) {
      return { data: null, error: errorMessage(error, 'Erro ao revisar curso') };
    }
  }
}

export const gestorService = new GestorService();
