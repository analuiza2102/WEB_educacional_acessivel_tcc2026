import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const localEnvPath = resolve(projectRoot, '.env.local');
config({ path: existsSync(localEnvPath) ? localEnvPath : resolve(projectRoot, '.env'), quiet: true });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Variavel SUPABASE_URL ausente. Configure no arquivo .env.local ou .env na raiz do projeto.');
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
