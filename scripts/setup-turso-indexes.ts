#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

async function setupIndexes() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    console.error('❌ TURSO_DATABASE_URL is not set');
    process.exit(1);
  }

  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  try {
    console.log('🔗 Connecting to Turso...');
    // Test connection
    await client.execute('SELECT 1');

    console.log('📊 Setting up indexes and FTS...');

    // Create indexes
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_restore_temp_created_at_desc
      ON restore_temp(created_at DESC);
    `);
    console.log('✅ Created created_at DESC index');

    // Create FTS virtual table
    await client.execute(`
      CREATE VIRTUAL TABLE IF NOT EXISTS restore_temp_fts
      USING fts5(recipient_name, content=restore_temp, content_rowid=rowid);
    `);
    console.log('✅ Created FTS table');

    // Populate FTS table with existing data
    await client.execute(`
      INSERT INTO restore_temp_fts(rowid, recipient_name)
      SELECT rowid, recipient_name FROM restore_temp;
    `);
    console.log('✅ Populated FTS table');

    // Create triggers for FTS maintenance
    await client.execute(`
      CREATE TRIGGER IF NOT EXISTS restore_temp_fts_insert AFTER INSERT ON restore_temp
      BEGIN
        INSERT INTO restore_temp_fts(rowid, recipient_name) VALUES (new.rowid, new.recipient_name);
      END;
    `);

    await client.execute(`
      CREATE TRIGGER IF NOT EXISTS restore_temp_fts_delete AFTER DELETE ON restore_temp
      BEGIN
        DELETE FROM restore_temp_fts WHERE rowid = old.rowid;
      END;
    `);

    await client.execute(`
      CREATE TRIGGER IF NOT EXISTS restore_temp_fts_update AFTER UPDATE ON restore_temp
      BEGIN
        UPDATE restore_temp_fts SET recipient_name = new.recipient_name WHERE rowid = new.rowid;
      END;
    `);
    console.log('✅ Created FTS triggers');

    console.log('🎉 All indexes and FTS setup complete!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupIndexes();