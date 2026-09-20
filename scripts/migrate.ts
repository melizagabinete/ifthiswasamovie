import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../db/schema';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not defined');
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log('Pushing schema to Turso...');
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user(id),
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user(id),
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      access_token_expires_at INTEGER,
      refresh_token_expires_at INTEGER,
      scope TEXT,
      id_token TEXT,
      password TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      movie_title TEXT NOT NULL,
      poster_url TEXT,
      recipient_name TEXT NOT NULL,
      message TEXT NOT NULL,
      seat_number TEXT NOT NULL,
      barcode_word TEXT NOT NULL,
      image_data TEXT NOT NULL DEFAULT '',
      created_at INTEGER
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      points INTEGER NOT NULL DEFAULT 1,
      submitted_by_id TEXT NOT NULL,
      submitted_by_name TEXT,
      submitted_at INTEGER,
      votes TEXT NOT NULL DEFAULT '[]'
    )
  `);

  console.log('Schema pushed successfully!');
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
