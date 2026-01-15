#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get password from environment or ask
const password = process.env.DB_PASSWORD;

if (!password) {
  console.error('❌ Database password not provided');
  console.error('Set it with: export DB_PASSWORD="your_password"');
  console.error('Then run: node scripts/migrate.js');
  process.exit(1);
}

async function main() {
  console.log('🚀 Running Year Planning Module Migration...\n');

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
    const migrationPath = path.join(__dirname, '../supabase/migrations/006_add_year_planning.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Executing migration SQL...\n');

    await client.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!\n');

    // Verify tables
    console.log('📊 Checking created tables...');
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'planning_%'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name}`);
      });
    } else {
      console.log('  ⚠️  No tables found');
    }

    // Verify RLS
    console.log('\n🔒 Checking RLS policies...');
    const policiesResult = await client.query(`
      SELECT COUNT(*) as count FROM pg_policies
      WHERE tablename LIKE 'planning_%';
    `);

    const policyCount = policiesResult.rows[0]?.count || 0;
    console.log(`  ✓ ${policyCount} policies created\n`);

    // Verify indexes
    console.log('⚡ Checking performance indexes...');
    const indexesResult = await client.query(`
      SELECT COUNT(*) as count FROM pg_indexes
      WHERE tablename LIKE 'planning_%';
    `);

    const indexCount = indexesResult.rows[0]?.count || 0;
    console.log(`  ✓ ${indexCount} indexes created\n`);

    console.log('🎉 Year Planning Module is ready!\n');
    console.log('Next steps:');
    console.log('  1. npm run dev');
    console.log('  2. Visit http://localhost:3000/planning/admin');
    console.log('  3. Create a planning group');
    console.log('  4. Share the link!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Check:');
      console.error('   - Database password is correct');
      console.error('   - Supabase project is running');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Password authentication failed.');
      console.error('   - Double-check your database password');
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
