import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('❌ TURSO_DATABASE_URL is not defined');
    console.log('   Make sure you have a .env.local file with TURSO_DATABASE_URL set.');
    process.exit(1);
  }

  console.log('🔌 Connecting to Turso...');
  console.log(`   URL: ${url}`);

  try {
    const client = createClient({ url, authToken });

    // Test basic connectivity
    const pingResult = await client.execute('SELECT 1 as ping');
    console.log('✅ Connection successful:', pingResult.rows[0]);

    // List all tables
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    console.log(`\n📋 Tables found (${tablesResult.rows.length}):`);
    if (tablesResult.rows.length === 0) {
      console.log('   (none — run pnpm db:migrate to create tables)');
    } else {
      for (const row of tablesResult.rows) {
        console.log(`   • ${row.name}`);
      }
    }

    // Check for expected app tables
    const expectedTables = ['user', 'session', 'account', 'verification', 'tickets', 'posts'];
    const foundTables = tablesResult.rows.map((r) => r.name as string);
    const missingTables = expectedTables.filter((t) => !foundTables.includes(t));

    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing expected tables: ${missingTables.join(', ')}`);
      console.log('   Run: pnpm db:migrate');
    } else {
      console.log('\n✅ All expected tables are present!');
    }

    await client.close();
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
