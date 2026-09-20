#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

async function checkSchema() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    console.error('❌ TURSO_DATABASE_URL is not set');
    process.exit(1);
  }

  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  try {
    console.log('🔗 Connecting to Turso...\n');

    // List all tables
    console.log('📋 Available tables:');
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);
    
    tables.rows.forEach((row) => {
      console.log(`  - ${row.name}`);
    });

    // Check restore_temp table structure
    console.log('\n🔍 restore_temp table schema:');
    try {
      const schema = await client.execute('PRAGMA table_info(restore_temp);');
      if (schema.rows.length === 0) {
        console.log('  ❌ Table does not exist!');
      } else {
        schema.rows.forEach((row) => {
          console.log(`  - ${row.name}: ${row.type}`);
        });
      }
    } catch (err) {
      console.log('  ❌ Error getting table schema:', err);
    }

    // Check row count
    console.log('\n📊 Row counts:');
    try {
      const count = await client.execute('SELECT COUNT(*) as count FROM restore_temp;');
      console.log(`  - restore_temp: ${count.rows[0]?.count ?? 'N/A'} rows`);
    } catch (err) {
      console.log(`  - restore_temp: Error (${err instanceof Error ? err.message : 'unknown error'})`);
    }

  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

checkSchema();
