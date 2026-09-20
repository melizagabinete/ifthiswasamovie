import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client/web';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface DbHealthResponse {
  timestamp: string;
  env: {
    hasTursoUrl: boolean;
    hasTursoToken: boolean;
    tursoUrlPrefix: string | null;
  };
  dbTest: {
    success: boolean;
    error: string | null;
    rowCount: number | null;
  };
}

export async function GET() {
  const diagnostics: DbHealthResponse = {
    timestamp: new Date().toISOString(),
    env: {
      hasTursoUrl: false,
      hasTursoToken: false,
      tursoUrlPrefix: null,
    },
    dbTest: {
      success: false,
      error: null,
      rowCount: null,
    },
  };

  try {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    diagnostics.env.hasTursoUrl = !!url;
    diagnostics.env.hasTursoToken = !!authToken;
    diagnostics.env.tursoUrlPrefix = url ? url.split('?')[0].slice(0, 30) + '...' : null;

    if (!url) {
      diagnostics.dbTest.error = 'TURSO_DATABASE_URL is not defined';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    if (url.startsWith('libsql://') && !authToken) {
      diagnostics.dbTest.error = 'TURSO_AUTH_TOKEN is required for remote Turso databases';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    const client = createClient({ url, authToken });
    const result = await client.execute('SELECT 1 as ping');
    await client.close();

    diagnostics.dbTest.success = true;
    diagnostics.dbTest.rowCount = result.rows.length;
  } catch (error) {
    diagnostics.dbTest.error = error instanceof Error ? error.message : String(error);
    console.error('[health/db] Database connection failed:', error);
    return NextResponse.json(diagnostics, { status: 500 });
  }

  return NextResponse.json(diagnostics);
}

