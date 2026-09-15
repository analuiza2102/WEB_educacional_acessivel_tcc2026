import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export type ProfileRole = 'user' | 'gestor' | 'admin' | string;

export interface Profile {
  id: string;
  nome: string | null;
  role: ProfileRole;
  created_at: string | null;
}

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
  }

  return supabase;
}

function authError(message: string, error: unknown): Error {
  const detail = error instanceof Error ? error.message : '';
  return new Error(detail ? `${message}: ${detail}` : message);
}

class AuthService {
  async signIn(email: string, password: string): Promise<Session> {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      throw authError('Não foi possível entrar. Verifique o email e a senha', error);
    }

    return data.session;
  }

  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();

    if (error) {
      throw authError('Não foi possível sair', error);
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getSession();

    if (error) {
      throw authError('Não foi possível verificar a sessão', error);
    }

    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getUser();

    if (error) {
      throw authError('Não foi possível identificar o usuário', error);
    }

    return data.user;
  }

  async getCurrentProfile(): Promise<Profile | null> {
    const client = getSupabaseClient();
    const user = await this.getCurrentUser();

    if (!user) return null;

    const { data, error } = await client
      .from('profiles')
      .select('id, nome, role, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw authError('Não foi possível carregar o perfil de acesso', error);
    }

    return data as Profile | null;
  }

  async isGestorOrAdmin(): Promise<boolean> {
    const profile = await this.getCurrentProfile();
    return profile?.role === 'gestor' || profile?.role === 'admin';
  }
}

export const authService = new AuthService();
