#!/usr/bin/env node

/**
 * Automated Setup Script for CoachAthleteConnect
 * 
 * This script will guide you through the complete setup process.
 */

import 'dotenv/config';
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';

const require = createRequire(import.meta.url);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

console.clear();
console.log('\n' + '='.repeat(60));
console.log('🚀 CoachAthleteConnect - Automated Setup');
console.log('='.repeat(60) + '\n');

async function main() {
  console.log('This script will help you set up your application.\n');
  console.log('⚠️  IMPORTANT: You need a Supabase account first!\n');
  
  const hasSupabase = await ask('Do you have a Supabase account? (y/n): ');
  
  if (hasSupabase.toLowerCase() !== 'y') {
    console.log('\n📝 Please create a Supabase account first:');
    console.log('   1. Go to: https://supabase.com');
    console.log('   2. Click "Start your project"');
    console.log('   3. Sign up (free)');
    console.log('   4. Come back and run this script again\n');
    rl.close();
    process.exit(0);
  }

  const hasProject = await ask('\nDo you have a Supabase project created? (y/n): ');
  
  if (hasProject.toLowerCase() !== 'y') {
    console.log('\n📝 Please create a Supabase project:');
    console.log('   1. In Supabase Dashboard, click "New Project"');
    console.log('   2. Name it: coach-athlete-connect');
    console.log('   3. Set a strong database password (SAVE IT!)');
    console.log('   4. Choose your region');
    console.log('   5. Wait ~2 minutes for setup');
    console.log('   6. Come back and run this script again\n');
    rl.close();
    process.exit(0);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 Step 1: Supabase Credentials');
  console.log('='.repeat(60) + '\n');
  
  console.log('Go to your Supabase Dashboard > Settings > API\n');
  
  const supabaseUrl = await ask('Paste your Project URL: ');
  const anonKey = await ask('Paste your anon/public key: ');
  const serviceKey = await ask('Paste your service_role key: ');
  
  console.log('\nNow go to Settings > Database\n');
  const dbUrl = await ask('Paste your Connection String (pooling mode): ');
  
  console.log('\n' + '='.repeat(60));
  console.log('🔑 Step 2: Generate Session Secret');
  console.log('='.repeat(60) + '\n');
  
  let sessionSecret;
  try {
    sessionSecret = execSync('openssl rand -base64 32').toString().trim();
    console.log('✅ Generated session secret');
  } catch {
    sessionSecret = 'change-this-in-production-' + Date.now();
    console.log('⚠️  Using temporary session secret (openssl not found)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('💾 Step 3: Saving Configuration');
  console.log('='.repeat(60) + '\n');

  // Update .env file
  const envContent = `# ==================================
# SUPABASE CONFIGURATION
# ==================================
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}
DATABASE_URL=${dbUrl}

# ==================================
# APPLICATION CONFIGURATION
# ==================================
SESSION_SECRET=${sessionSecret}

# Optional: For sending emails (get from resend.com)
RESEND_API_KEY=

# Server config
PORT=5000
NODE_ENV=development
`;

  writeFileSync('.env', envContent);
  console.log('✅ Updated .env file with your credentials\n');

  console.log('\n' + '='.repeat(60));
  console.log('🔍 Step 4: Verifying Setup');
  console.log('='.repeat(60) + '\n');

  try {
    execSync('npm run verify', { stdio: 'inherit' });
  } catch (error) {
    console.log('\n⚠️  Verification had issues. Check the output above.\n');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🗄️  Step 5: Initialize Database');
  console.log('='.repeat(60) + '\n');

  const initDb = await ask('Run database migrations now? (y/n): ');
  
  if (initDb.toLowerCase() === 'y') {
    try {
      console.log('\nPushing schema to Supabase...\n');
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('\n✅ Database schema created!\n');
    } catch (error) {
      console.log('\n❌ Database migration failed. You may need to fix connection issues.\n');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔒 Step 6: Apply Security Policies (RLS)');
  console.log('='.repeat(60) + '\n');
  
  console.log('You need to apply RLS policies manually:');
  console.log('   1. Go to Supabase Dashboard > SQL Editor');
  console.log('   2. Click "New query"');
  console.log('   3. Open: migrations/rls-policies.sql');
  console.log('   4. Copy all contents and paste into SQL Editor');
  console.log('   5. Click "Run"');
  console.log('   6. You should see "Success. No rows returned"\n');

  console.log('\n' + '='.repeat(60));
  console.log('✅ SETUP COMPLETE!');
  console.log('='.repeat(60) + '\n');

  console.log('🎉 Your application is ready!\n');
  console.log('Next steps:');
  console.log('   1. Apply RLS policies (see step 6 above)');
  console.log('   2. Run: npm run dev');
  console.log('   3. Visit: http://localhost:5000');
  console.log('   4. Test the mobile app: cd mobile && npx expo start\n');

  console.log('📚 Documentation:');
  console.log('   - QUICK_START.md - Quick setup guide');
  console.log('   - SUPABASE_SETUP.md - Detailed Supabase setup');
  console.log('   - MIGRATION_STATUS.md - Track progress\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
