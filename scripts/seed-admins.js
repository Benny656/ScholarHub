/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║              SCHOLARHUB — ADMIN SEED SCRIPT                        ║
 * ║  Creates 4 permanent admin accounts using the Supabase Admin API.  ║
 * ║  Safe to run multiple times — skips already-existing accounts.     ║
 * ║  Requires: SUPABASE_SERVICE_ROLE_KEY in environment or .env.local  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Usage:
 *   npm run seed:admins
 *
 * Or directly:
 *   node scripts/seed-admins.js
 *
 * Environment variables needed (in .env.local or shell):
 *   SUPABASE_URL              — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (Settings > API)
 *
 * ⚠️  SECURITY NOTE:
 *   The service role key has FULL database access and bypasses RLS.
 *   NEVER commit it to git. NEVER expose it to the browser.
 *   Use it only in server-side scripts, CI/CD, or Supabase edge functions.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Resolve __dirname in ESM ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ─── Load .env.local (or .env) manually — avoids dotenv dependency ───────────
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const path = resolve(projectRoot, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
      console.log(`✓ Loaded environment from ${file}`);
      break;
    }
  }
}

loadEnv();

// ─── Configuration ────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://niebnbpcmnfqfyodkqvr.supabase.co';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.               ║');
  console.error('║                                                              ║');
  console.error('║  How to get it:                                              ║');
  console.error('║  1. Go to your Supabase dashboard                            ║');
  console.error('║  2. Project Settings → API                                   ║');
  console.error('║  3. Copy the "service_role" key (secret)                     ║');
  console.error('║  4. Add it to .env.local:                                    ║');
  console.error('║     SUPABASE_SERVICE_ROLE_KEY=your_key_here                  ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('');
  process.exit(1);
}

// ─── Supabase Admin Client ─────────────────────────────────────────────────────
// Uses service role key — bypasses RLS and email confirmation
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ─── Admin Accounts to Seed ────────────────────────────────────────────────────
// ⚠️  DEVELOPMENT/DEMO CONFIGURATION — Permanent admin seeds for ScholarHub
// These accounts are intentionally hard-coded for the initial platform setup.
// Change passwords and update this list before moving to production.
const ADMIN_ACCOUNTS = [
  {
    email: 'bennymanuel2020@gmail.com',
    name: 'Benny Manuel',
    password: 'Admin@123',
  },
  {
    email: 'jerlinsubhiksha@gmail.com',
    name: 'Jerlin Subhiksha',
    password: 'Admin@123',
  },
  {
    email: 'deepsiseropa@gmail.com',
    name: 'Deep Siseropa',
    password: 'Admin@123',
  },
  {
    email: 'fredricknewbegin@gmail.com',
    name: 'Fredrick Newbegin',
    password: 'Admin@123',
  },
];

// ─── Seed Function ─────────────────────────────────────────────────────────────
async function seedAdmin(account) {
  const { email, name, password } = account;

  console.log(`\n  Processing: ${name} <${email}>`);

  // Step 1: Check if user already exists in public.users
  const { data: existingProfile } = await adminClient
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile) {
    // User exists — ensure they have admin role
    if (existingProfile.role !== 'admin') {
      const { error: updateError } = await adminClient
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existingProfile.id);

      if (updateError) {
        console.error(`  ✗ Failed to update role for ${email}:`, updateError.message);
      } else {
        console.log(`  ↑ Upgraded ${name} to admin role (was: ${existingProfile.role})`);
      }
    } else {
      console.log(`  ✓ Already exists as admin — skipping`);
    }
    return { status: 'skipped', email };
  }

  // Step 2: Create auth user via Admin API
  // email_confirm: true bypasses email verification — user can log in immediately
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // Verified immediately — no confirmation email needed
    user_metadata: {
      name,
      role: 'admin',
      user_type: 'college',
    },
  });

  if (authError) {
    // If user already exists in auth but not in public.users, handle gracefully
    if (authError.message?.includes('already been registered') || authError.status === 422) {
      console.log(`  ⚠  Auth user exists but profile missing — will sync profile`);

      // Fetch auth user to get UUID
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const authUser = listData?.users?.find(u => u.email === email);

      if (!authUser) {
        console.error(`  ✗ Could not find auth user for ${email}`);
        return { status: 'error', email };
      }

      // Upsert the public.users profile
      const { error: upsertError } = await adminClient.from('users').upsert({
        id: authUser.id,
        name,
        email,
        role: 'admin',
        avatar_url: null,
        xp: 0,
        level: 1,
        streak: 0,
        last_login: new Date().toISOString().split('T')[0],
        user_type: 'college',
        status: 'active',
      }, { onConflict: 'id' });

      if (upsertError) {
        console.error(`  ✗ Profile upsert failed:`, upsertError.message);
        return { status: 'error', email };
      }

      console.log(`  ✓ Profile synced for existing auth user`);
      return { status: 'synced', email };
    }

    console.error(`  ✗ Auth creation failed:`, authError.message);
    return { status: 'error', email };
  }

  const userId = authData.user.id;

  // Step 3: The handle_new_user trigger will auto-create the public.users row.
  // However, we explicitly upsert to guarantee role = 'admin' regardless of
  // trigger metadata parsing — belt-and-suspenders approach.
  const { error: profileError } = await adminClient.from('users').upsert({
    id: userId,
    name,
    email,
    role: 'admin',
    avatar_url: null,
    xp: 0,
    level: 1,
    streak: 0,
    last_login: new Date().toISOString().split('T')[0],
    user_type: 'college',
    status: 'active',
  }, { onConflict: 'id' });

  if (profileError) {
    console.error(`  ✗ Profile upsert failed (auth user was created):`, profileError.message);
    return { status: 'partial', email };
  }

  console.log(`  ✓ Created successfully (auth + profile)`);
  return { status: 'created', email };
}

// ─── Main Entry ───────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         ScholarHub — Admin Account Seeder                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Target:  ${SUPABASE_URL}`);
  console.log(`  Seeding: ${ADMIN_ACCOUNTS.length} admin accounts`);
  console.log('');

  const results = [];

  for (const account of ADMIN_ACCOUNTS) {
    const result = await seedAdmin(account);
    results.push(result);
  }

  // ─── Summary ────────────────────────────────────────────────────────
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('  SUMMARY');
  console.log('──────────────────────────────────────────────────────────────');

  const created  = results.filter(r => r.status === 'created');
  const skipped  = results.filter(r => r.status === 'skipped');
  const upgraded = results.filter(r => r.status === 'synced');
  const errors   = results.filter(r => r.status === 'error' || r.status === 'partial');

  if (created.length)  console.log(`  ✓ Created  : ${created.map(r => r.email).join(', ')}`);
  if (skipped.length)  console.log(`  ✓ Skipped  : ${skipped.map(r => r.email).join(', ')}`);
  if (upgraded.length) console.log(`  ↑ Synced   : ${upgraded.map(r => r.email).join(', ')}`);
  if (errors.length)   console.log(`  ✗ Errors   : ${errors.map(r => r.email).join(', ')}`);

  console.log('');

  if (errors.length === 0) {
    console.log('  ✅ All admin accounts are ready. They can log in immediately.');
  } else {
    console.log('  ⚠  Some accounts had errors. Check output above for details.');
    process.exit(1);
  }

  console.log('');
  console.log('  Login credentials:');
  for (const acc of ADMIN_ACCOUNTS) {
    console.log(`    ${acc.email}  /  ${acc.password}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('\n  Fatal error:', err.message || err);
  process.exit(1);
});
