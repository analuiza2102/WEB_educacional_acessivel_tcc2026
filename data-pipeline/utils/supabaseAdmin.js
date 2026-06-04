import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Variavel SUPABASE_URL ausente. Configure no arquivo .env na raiz do projeto.');
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'Variavel SUPABASE_SERVICE_ROLE_KEY ausente. Configure apenas em script local dentro de data-pipeline.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
