import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://niebnbpcmnfqfyodkqvr.supabase.co';
const supabaseAnonKey = 'sb_publishable_gdx1AatWLlJNUL8zFPL7FQ_rpmDvcVm';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function test() {
  const testId = `00000000-0000-0000-0000-${Math.random().toString(36).substring(2, 14).padEnd(12, '0')}`;
  console.log('Attempting direct insert into public.users table with ID:', testId);
  
  const { data, error } = await supabase.from('users').insert({
    id: testId,
    name: 'Direct Insert Test User',
    email: 'direct_insert@test.com',
    role: 'teacher',
    status: 'active'
  }).select();

  console.log('Result:', data);
  console.log('Error:', error);
}

test();
