#!/usr/bin/env node

/**
 * Setup Verification Script
 * 
 * This script checks if your environment is properly configured
 * before you try to run the application.
 */

import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

console.log('\n🔍 Verifying CoachAthleteConnect Setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required environment variables
console.log('📋 Checking Environment Variables...');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'SESSION_SECRET',
];

const optionalVars = [
  'RESEND_API_KEY',
  'PORT',
  'NODE_ENV',
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`   ❌ ${varName} - MISSING (REQUIRED)`);
    hasErrors = true;
  } else if (process.env[varName].includes('YOUR_') || process.env[varName].includes('your-')) {
    console.log(`   ⚠️  ${varName} - Set but looks like a placeholder`);
    hasWarnings = true;
  } else {
    const preview = varName.includes('KEY') || varName.includes('URL') || varName.includes('SECRET')
      ? `${process.env[varName].substring(0, 20)}...`
      : process.env[varName];
    console.log(`   ✅ ${varName} - ${preview}`);
  }
});

console.log('\n📋 Checking Optional Variables...');
optionalVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`   ⚪ ${varName} - Not set (optional)`);
  } else {
    console.log(`   ✅ ${varName} - ${process.env[varName]}`);
  }
});

// Check Node.js version
console.log('\n📋 Checking Node.js Version...');
const nodeVersion = process.version;
const major = parseInt(nodeVersion.split('.')[0].substring(1));
if (major < 18) {
  console.log(`   ❌ Node.js ${nodeVersion} - Requires Node.js 18 or higher`);
  hasErrors = true;
} else {
  console.log(`   ✅ Node.js ${nodeVersion}`);
}

// Check if node_modules exists
console.log('\n📋 Checking Dependencies...');
try {
  require('../node_modules/dotenv/package.json');
  console.log('   ✅ Dependencies installed');
} catch {
  console.log('   ❌ Dependencies not installed - Run: npm install');
  hasErrors = true;
}

// Check if migrations directory exists
console.log('\n📋 Checking Project Structure...');
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const requiredPaths = [
  'server/db.ts',
  'server/routes.ts',
  'server/lib/supabase.ts',
  'client/src/lib/supabase.ts',
  'shared/schema.ts',
  'migrations/rls-policies.sql',
];

requiredPaths.forEach(path => {
  if (existsSync(join(projectRoot, path))) {
    console.log(`   ✅ ${path}`);
  } else {
    console.log(`   ❌ ${path} - Missing`);
    hasErrors = true;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ SETUP INCOMPLETE');
  console.log('\nPlease fix the errors above before running the application.');
  console.log('Refer to SUPABASE_SETUP.md for detailed instructions.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  SETUP INCOMPLETE (Warnings)');
  console.log('\nYou have placeholder values in your .env file.');
  console.log('Replace them with real credentials from your Supabase project.');
  console.log('Refer to SUPABASE_SETUP.md for instructions.\n');
  process.exit(1);
} else {
  console.log('✅ SETUP COMPLETE!');
  console.log('\nYour environment is properly configured.');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run db:push');
  console.log('  2. Apply RLS policies (see SUPABASE_SETUP.md)');
  console.log('  3. Run: npm run dev');
  console.log('  4. Visit: http://localhost:5000\n');
  process.exit(0);
}
