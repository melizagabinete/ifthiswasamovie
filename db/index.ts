import { createClient } from '@libsql/client/web';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

function getTursoClient() {
  try {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not defined');
    }

    // Remote Turso databases (libsql://) require an auth token
    if (url.startsWith('libsql://') && !authToken) {
      throw new Error('TURSO_AUTH_TOKEN is required for remote Turso databases');
    }

    return createClient({ url, authToken });
  } catch (error) {
    console.error('[db/index.ts] Failed to initialize Turso client:', error);
    throw error;
  }
}

let _db: LibSQLDatabase<typeof schema> | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getTursoClient(), { schema });
  }
  return _db;
}

export { getTursoClient };

// Re-export schema
export { schema };

