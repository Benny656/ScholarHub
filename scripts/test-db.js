import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const content = readFileSync('.env', 'utf-8');
const env = {};
for (const line of content.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
  env[key] = value;
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: nData, error: nError } = await supabase.from('notifications').select('*').limit(1);
  console.log('notifications check:', { count: nData?.length, error: nError?.message });

  const { data: aData, error: aError } = await supabase.from('announcements').select('*').limit(1);
  console.log('announcements check:', { count: aData?.length, error: aError?.message });

  const { data: sgData, error: sgError } = await supabase.from('study_groups').select('*').limit(1);
  console.log('study_groups check:', { count: sgData?.length, error: sgError?.message });
}
test();
