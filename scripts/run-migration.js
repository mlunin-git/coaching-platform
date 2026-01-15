#!/usr/bin/env node

/**
 * Year Planning Module Migration Script
 * Run with: node scripts/run-migration.js
 *
 * This script requires your Supabase database password.
 * Get it from: https://supabase.com/dashboard → Settings → Database
 * Look for the password in the "Connection string" or "URI" section
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Try to use pg if available
let Client;
try {
  const pg = require('pg');
  Client = pg.Client;
} catch (err) {
  console.error('❌ postgres (pg) package not found.');
  console.error('Install it with: npm install pg');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log('🚀 Year Planning Module - Database Migration Script\n');

  // Get database password
  const password = await question(
    '📝 Enter your Supabase database password: '
  );

  if (!password.trim()) {
    console.error('❌ Password is required');
    process.exit(1);
  }

  const client = new Client({
    host: 'db.aqcanwccrodchljmwsjf.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password.trim(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('\n🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/006_add_year_planning.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Running migration...\n');

    // Execute migration
    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'planning_%'
      ORDER BY table_name;
    `);

    console.log('📊 Tables created:');
    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name}`);
      });
    } else {
      console.log('  ⚠️  No tables found. Migration may have failed.');
    }

    // Verify RLS policies
    const policiesResult = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.applicable_roles
      WHERE grantee LIKE 'planning_%';
    `);

    console.log(`\n🔒 RLS policies: ${policiesResult.rows[0]?.count || '0'} applied`);
    console.log('\n🎉 Year Planning Module is ready!\n');

    console.log('Next steps:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Go to http://localhost:3000/planning/admin');
    console.log('3. Create a planning group');
    console.log('4. Share the link with others!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Make sure:');
      console.error('   - Database host is correct');
      console.error('   - Password is correct');
      console.error('   - Supabase project is active');
    }
    process.exit(1);
  } finally {
    await client.end();
    rl.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  rl.close();
  process.exit(1);
});
