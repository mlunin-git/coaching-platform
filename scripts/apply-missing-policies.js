#!/usr/bin/env node

/**
 * Apply missing RLS policies for planning module coaches
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get password from environment
const password = process.env.DB_PASSWORD;

if (!password) {
  console.error('❌ Database password not provided');
  console.error('Set it with: export DB_PASSWORD="your_password"');
  console.error('Then run: node scripts/apply-missing-policies.js');
  process.exit(1);
}

async function main() {
  console.log('🔐 Applying missing RLS policies...\n');

  const client = new Client({
    host: 'db.aqcanwccrodchljmwsjf.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/007_add_missing_rls_policies.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Executing RLS policies SQL...\n');
    await client.query(migrationSQL);

    console.log('✅ RLS policies applied successfully!\n');

    // Verify policies
    console.log('📋 Checking created policies...');
    const policiesResult = await client.query(`
      SELECT policyname, tablename FROM pg_policies
      WHERE tablename LIKE 'planning_%'
      ORDER BY tablename, policyname;
    `);

    if (policiesResult.rows.length > 0) {
      const policyCount = {};
      policiesResult.rows.forEach(row => {
        if (!policyCount[row.tablename]) {
          policyCount[row.tablename] = 0;
        }
        policyCount[row.tablename]++;
      });

      Object.entries(policyCount).forEach(([table, count]) => {
        console.log(`  ✓ ${table}: ${count} policies`);
      });
    }

    console.log('\n🎉 All missing RLS policies have been added!\n');
    console.log('Now coaches can:');
    console.log('  1. View participants in their planning groups');
    console.log('  2. View ideas and events in their groups');
    console.log('  3. Manage group participants (add/delete)\n');

  } catch (error) {
    console.error('\n❌ Error applying policies:');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
