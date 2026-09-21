import { NextResponse } from 'next/server';
import { getTickets } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Pre-validate env vars so we get a clear error in logs / response
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      console.error('[tickets API] TURSO_DATABASE_URL is not defined');
      return NextResponse.json(
        { error: 'Database configuration error', details: 'TURSO_DATABASE_URL is not defined' },
        { status: 500 }
      );
    }

    if (url.startsWith('libsql://') && !authToken) {
      console.error('[tickets API] TURSO_AUTH_TOKEN is missing for remote database');
      return NextResponse.json(
        { error: 'Database configuration error', details: 'TURSO_AUTH_TOKEN is required for remote Turso databases' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const search = searchParams.get('search') || '';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : undefined;

    // Pass search directly to lib/db.ts - it handles FTS5 wildcard conversion
    const result = await getTickets(search, limit, page);

    const formatDate = (date: unknown): string => {
      if (!date) return '';

      if (date instanceof Date) {
        return isNaN(date.getTime()) ? '' : date.toISOString();
      }

      if (typeof date === 'number') {
        if (isNaN(date)) return '';
        const milliseconds = date < 1e10 ? date * 1000 : date;
        const parsedDate = new Date(milliseconds);
        return isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();
      }

      if (typeof date === 'string') {
        const trimmedDate = date.trim();
        if (!trimmedDate) return '';

        const numericDate = Number(trimmedDate);
        const parsedDate = Number.isNaN(numericDate)
          ? new Date(trimmedDate)
          : new Date(numericDate < 1e10 ? numericDate * 1000 : numericDate);
        return isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();
      }

      return '';
    };

    const formattedTickets = result.tickets
      .map((ticket) => ({
        ...ticket,
        _id: ticket.id,
        createdAt: formatDate(ticket.createdAt),
      }));

    const response = NextResponse.json({
      tickets: formattedTickets,
      pagination: result.pagination,
    });
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[tickets API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

