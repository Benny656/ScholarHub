import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key_here') {
  console.error("❌ Missing or invalid VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Please ensure they are set in your .env file.");
  process.exit(1);
}

// Initialize Supabase admin client using the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// The requested test accounts and their target roles/grades
const testAccounts = [
  {
    email: 'k12student@test.com',
    password: 'testpassword123',
    role: 'student',       // Maps to UserRow.role enum
    grade_level: 'k12',
    name: 'K12 Student'
  },
  {
    email: 'k12teacher@test.com',
    password: 'testpassword123',
    role: 'teacher',       // Maps to UserRow.role enum
    grade_level: 'k12',
    name: 'K12 Teacher'
  },
  {
    email: 'unistudent@test.com',
    password: 'testpassword123',
    role: 'student',       // Maps to UserRow.role enum
    grade_level: 'uni',
    name: 'Uni Student'
  }
];

async function createTestAccounts() {
  console.log("🚀 Starting test account creation...\n");

  for (const account of testAccounts) {
    console.log(`Processing: ${account.email}`);
    let userId;

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        name: account.name,
        role: account.role,
        grade_level: account.grade_level
      }
    });

    if (authError) {
      if (authError.message.includes("already registered") || authError.status === 422 || authError.code === 'email_exists') {
        console.log(`   ℹ️ User already exists in Auth. Finding their ID...`);
        // Find existing user by email
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
           console.error(`   ❌ Failed to fetch users:`, listError.message);
           continue;
        }
        const existingUser = usersData.users.find(u => u.email === account.email);
        if (existingUser) {
          userId = existingUser.id;
        } else {
          console.error(`   ❌ Could not resolve existing user ID.`);
          continue;
        }
      } else {
        console.error(`   ❌ Error creating auth user:`, authError.message);
        continue;
      }
    } else {
      console.log(`   ✅ Created auth user successfully.`);
      userId = authData.user.id;
    }

    if (!userId) continue;

    // 2. Upsert into public.users
    const userPayload = {
      id: userId,
      email: account.email,
      name: account.name,
      role: account.role,
      grade_level: account.grade_level
    };

    const { error: userError } = await supabase
      .from('users')
      .upsert(userPayload, { onConflict: 'id' });

    if (userError) {
      console.error(`   ❌ Error upserting into public.users:`, userError.message);
    } else {
      console.log(`   ✅ Upserted profile into public.users.`);
    }

    // 3. Upsert into public.profiles
    const profilePayload = {
      id: userId,
      email: account.email,
      full_name: account.name,
      role: account.role,
      grade_level: account.grade_level
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.error(`   ❌ Error upserting into public.profiles:`, profileError.message);
    } else {
      console.log(`   ✅ Upserted profile into public.profiles.`);
    }

    console.log(''); // Blank line for readability
  }

  console.log("🎉 Test account creation finished!");
}

createTestAccounts().catch(console.error);
