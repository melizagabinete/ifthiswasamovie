#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client/web';

async function analyzeQueries() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    console.error('❌ TURSO_DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('🔍 Analyzing restore_temp index usage...\n');

  try {
    const client = createClient({ 
      url: tursoUrl, 
      authToken: tursoToken 
    });

    // Test table exists
    const tableCheck = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='restore_temp'");
    if (tableCheck.rows.length === 0) {
      console.log('❌ restore_temp table not found');
      process.exit(1);
    }

    // Table size
    const countResult = await client.execute('SELECT COUNT(*) as total FROM restore_temp');
    const totalRows = Number(countResult.rows[0]?.total || 0);
    console.log(`📊 Table size: ${totalRows.toLocaleString()} rows`);

    // List indexes
    const indexes = await client.execute(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='index' AND tbl_name='restore_temp'
    `);
    console.log('\\n📋 Current indexes:');
    indexes.rows.forEach((idx: any, i: number) => {
      console.log(`  ${i+1}. ${idx.name}`);
      console.log(`     ${idx.sql}`);
    });

    // Test queries (no trailing ; for EXPLAIN)
    const testQueries = [
      {
        name: 'No WHERE (recent tickets)',
        sql: 'SELECT * FROM restore_temp ORDER BY created_at DESC LIMIT 21'
      },
      {
        name: 'Search with LIKE (current - problematic)',
        sql: "SELECT * FROM restore_temp WHERE recipient_name LIKE '%Alice%' ORDER BY created_at DESC LIMIT 21"
      },
      {
        name: 'FTS prefix search (proposed)',
        sql: "SELECT t.* FROM restore_temp t JOIN restore_temp_fts f ON t.rowid = f.rowid WHERE f.recipient_name MATCH 'Alice*' ORDER BY t.created_at DESC LIMIT 21"
      },
      {
        name: 'FTS any position',
        sql: "SELECT t.* FROM restore_temp t JOIN restore_temp_fts f ON t.rowid = f.rowid WHERE f.recipient_name MATCH '*Alice*' ORDER BY t.created_at DESC LIMIT 21"
      }
    ];

    console.log('\\n🔎 QUERY PLANS:\\n');
    for (const {name, sql} of testQueries) {
      console.log(`=== ${name} ===`);
      const explainSql = `EXPLAIN QUERY PLAN ${sql}`;
      const explain = await client.execute(explainSql);
      explain.rows.forEach((row: any) => console.log(`  ${row.detail}`));
      console.log('');
      
      const planText = explain.rows.map((r: any) => r.detail).join(' ');
      if (planText.toLowerCase().includes('scan table')) {
        console.log('  ❌ Full table scan');
      } else if (planText.toLowerCase().includes('index')) {
        console.log('  ✅ Uses index');
      } else {
        console.log('  ⚠️  Check plan manually');
      }
      console.log('');
    }

    console.log('✅ Analysis complete!');
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

analyzeQueries();

