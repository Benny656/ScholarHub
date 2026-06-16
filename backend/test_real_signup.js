import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://niebnbpcmnfqfyodkqvr.supabase.co';
const supabaseAnonKey = 'sb_publishable_gdx1AatWLlJNUL8zFPL7FQ_rpmDvcVm';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function runAudit() {
  const email = `testuser_${Math.random().toString(36).substring(2, 10)}@example.com`;
  const password = 'TestPassword123!';
  const name = 'Test User';
  const role = 'student';

  console.log(`[AUDIT] Step 1: Attempting auth.signUp for email: ${email}`);
  
  const signUpRes = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: role,
        grade_level: 'college',
      }
    }
  });

  if (signUpRes.error) {
    console.error('[AUDIT] auth.signUp failed:', signUpRes.error);
    return;
  }

  const { user, session } = signUpRes.data;
  console.log('[AUDIT] auth.signUp succeeded!');
  console.log(' - User ID:', user?.id);
  console.log(' - Email confirmed:', user?.email_confirmed_at);
  console.log(' - Session returned:', session ? 'YES' : 'NO');

  if (!session) {
    console.log('[AUDIT] No session returned (email confirmation required). Cannot proceed with authenticated client testing. Attempting to sign in directly (if auto-confirmed)...');
    const signInRes = await supabase.auth.signInWithPassword({ email, password });
    if (signInRes.error) {
      console.error('[AUDIT] auth.signInWithPassword failed:', signInRes.error);
      return;
    }
    console.log('[AUDIT] Signed in successfully after signup.');
  }

  // We are now authenticated. Let's test the profiles table security configuration.
  console.log(`\n[AUDIT] Step 2: Querying public.profiles table (SELECT) for user ID: ${user.id}`);
  const selectRes = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (selectRes.error) {
    console.error('[AUDIT] SELECT profiles failed:', selectRes.error);
  } else {
    console.log('[AUDIT] SELECT profiles succeeded! Data:', selectRes.data);
  }

  console.log(`\n[AUDIT] Step 3: Attempting insertion (INSERT/UPSERT) into public.profiles table`);
  const insertPayload = {
    id: user.id,
    email: user.email,
    full_name: name,
    role: role,
    grade_level: 'college',
    updated_at: new Date().toISOString(),
  };

  const insertRes = await supabase
    .from('profiles')
    .insert(insertPayload)
    .select()
    .single();

  if (insertRes.error) {
    console.error('[AUDIT] INSERT profiles failed:', insertRes.error);
  } else {
    console.log('[AUDIT] INSERT profiles succeeded! Data:', insertRes.data);
  }

  console.log(`\n[AUDIT] Step 4: Querying public.users table (SELECT) to see if database triggers populated it`);
  const selectUserRes = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (selectUserRes.error) {
    console.error('[AUDIT] SELECT users failed:', selectUserRes.error);
  } else {
    console.log('[AUDIT] SELECT users succeeded! Data:', selectUserRes.data);
  }
}

runAudit().catch(console.error);
