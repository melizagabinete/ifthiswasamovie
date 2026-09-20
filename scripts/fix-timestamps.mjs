#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

async function fixTimestamps() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not defined');
  }

  const client = createClient({ url, authToken });

  console.log('🔗 Connecting to Turso...');

  // Get all tickets with created_at
  const result = await client.execute('SELECT id, created_at FROM tickets');

  console.log(`📊 Found ${result.rows.length} tickets`);

  let fixedCount = 0;

  for (const row of result.rows) {
    const id = row.id;
    const createdAt = Number(row.created_at);

    // Check if it's 10 digits (seconds)
    if (createdAt < 10000000000) { // Less than 10^10 means 10 digits or less
      const fixedTimestamp = createdAt * 1000; // Convert seconds to milliseconds
      console.log(`🔧 Fixing ticket ${id}: ${createdAt} -> ${fixedTimestamp}`);

      await client.execute({
        sql: 'UPDATE tickets SET created_at = ? WHERE id = ?',
        args: [fixedTimestamp, id]
      });

      fixedCount++;
    }
  }

  console.log(`✅ Fixed ${fixedCount} tickets with incorrect timestamps`);
}

fixTimestamps().catch(console.error);