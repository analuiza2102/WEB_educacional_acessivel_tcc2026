import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Variável SUPABASE_URL ausente. Configure no arquivo .env da raiz do projeto.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Variável SUPABASE_SERVICE_ROLE_KEY ausente. Configure apenas no .env local, nunca no front-end.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
