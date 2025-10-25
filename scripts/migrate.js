#!/usr/bin/env node

/**
 * Standalone database migration script
 * Run this once to create all database tables
 */

const { execSync } = require('child_process');

console.log('🔄 Starting database migration...');

try {
  // Run drizzle-kit push to create tables
  console.log('📦 Pushing schema to database...');
  execSync('pnpm drizzle-kit push', { stdio: 'inherit' });
  
  console.log('✅ Database migration completed successfully!');
  console.log('🚀 You can now start the application');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

