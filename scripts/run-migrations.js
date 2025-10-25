#!/usr/bin/env node

/**
 * Run database migrations by executing SQL files directly
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function runMigrations() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../drizzle/0000_lucky_loa.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📦 Running database migrations...');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Database migrations completed successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    // Check if tables already exist
    if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  Database tables already exist - skipping migration');
      await sql.end();
      process.exit(0);
    }
    
    console.error('❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runMigrations();

