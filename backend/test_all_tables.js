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

  console.log(`[AUDIT] Creating user ${email}...`);
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
    console.error('Sign up failed:', signUpRes.error);
    return;
  }

  const { user, session } = signUpRes.data;
  if (!session) {
    console.log('No session returned. Attempting login...');
    const signInRes = await supabase.auth.signInWithPassword({ email, password });
    if (signInRes.error) {
      console.error('Sign in failed:', signInRes.error);
      return;
    }
  }

  console.log('Authenticated! Testing table access...\n');

  const tables = ['profiles', 'courses', 'enrollments', 'users', 'lessons', 'assignments', 'submissions'];

  for (const table of tables) {
    const { data, error, status } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`Table '${table}' SELECT results:`);
      console.log(` - Status: ${status}`);
      console.log(` - Code: ${error.code}`);
      console.log(` - Message: ${error.message}`);
      console.log(` - Hint: ${error.hint}`);
    } else {
      console.log(`Table '${table}' SELECT succeeded!`);
      console.log(` - Status: ${status}`);
      console.log(` - Rows returned: ${data.length}`);
    }
    console.log('--------------------------------------------------');
  }
}

runAudit().catch(console.error);
