import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const SUPABASE_URL = 'https://niebnbpcmnfqfyodkqvr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gdx1AatWLlJNUL8zFPL7FQ_rpmDvcVm';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'scholarhub_auth',
  },
});
