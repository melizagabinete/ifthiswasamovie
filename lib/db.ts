/**
 * Database utilities using Turso (libsql) + Drizzle ORM
 * Edge-compatible — works on Cloudflare Workers/Vercel Edge
 */

import { getDb, getTursoClient } from "@/db";
import { tickets, posts, type SelectPost, type SelectTicket } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

// Types derived from DB schema for return values
export interface PaginatedTicketsResult {
  tickets: SelectTicket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// FTS raw row type (snake_case from DB query)
export interface FtsTicketRow {
  id: string;
  movie_title: string;
  poster_url: string | null;
  recipient_name: string;
  message: string;
  seat_number: string;
  barcode_word: string;
  image_data: string;
  created_at: string | number;
}

export interface PostWithParsedVotes extends Omit<SelectPost, 'votes'> {
  votes: string[];
}

export interface PaginatedPostsResult {
  posts: PostWithParsedVotes[];
  // pagination: {
  //   currentPage: number;
  //   totalPages: number;
  //   totalCount: number;
  //   hasNextPage: boolean;
  //   hasPrevPage: boolean;
  // };
}

// Ticket helpers
export async function createTicket(data: {
  movieTitle: string;
  posterUrl?: string;
  recipientName: string;
  message: string;
  seatNumber: string;
  barcodeWord: string;
  imageData?: string;
}) {
  const id = crypto.randomUUID();
  await getDb().insert(tickets).values({
    id,
    movieTitle: data.movieTitle,
    posterUrl: data.posterUrl || null,
    recipientName: data.recipientName,
    message: data.message,
    seatNumber: data.seatNumber,
    barcodeWord: data.barcodeWord,
    imageData: data.imageData || "",
    createdAt: new Date(),
  });
  return id;
}

export async function getTickets(
  search?: string,
  limit?: number,
  page: number = 1
): Promise<PaginatedTicketsResult> {
  try {
    const effectiveLimit = limit ?? 25;
    const effectivePage = Math.max(1, page);
    const offset = (effectivePage - 1) * effectiveLimit;
    const db = getDb();

    let results: SelectTicket[];
    let totalCount = 0;

    if (search && search.trim()) {
      const searchTerm = search.trim() + '*';
      const client = getTursoClient();
      const countResult = await client.execute({
        sql: `
          SELECT COUNT(*) as count FROM restore_temp t
          JOIN restore_temp_fts f ON t.rowid = f.rowid
          WHERE f.recipient_name MATCH ?
        `,
        args: [searchTerm],
      });
      const countRow = countResult.rows[0] as { count?: number | string } | undefined;
      totalCount = Number(countRow?.count ?? 0);

      const ftsResult = await client.execute({
        sql: `
          SELECT t.* FROM restore_temp t
          JOIN restore_temp_fts f ON t.rowid = f.rowid
          WHERE f.recipient_name MATCH ?
          ORDER BY t.created_at DESC
          LIMIT ? OFFSET ?
        `,
        args: [searchTerm, effectiveLimit, offset],
      });
      results = (ftsResult.rows as unknown as FtsTicketRow[]).map((row: FtsTicketRow): SelectTicket => ({
        id: row.id,
        movieTitle: row.movie_title,
        posterUrl: row.poster_url || null,
        recipientName: row.recipient_name,
        message: row.message,
        seatNumber: row.seat_number,
        barcodeWord: row.barcode_word,
        imageData: row.image_data || '',
        createdAt: typeof row.created_at === 'number' ? new Date(row.created_at * 1000) : new Date(row.created_at),
      }));
    } else {
      const [countResult] = await db.select({ count: count() }).from(tickets);
      totalCount = Number(countResult?.count ?? 0);

      results = await db
        .select()
        .from(tickets)
        .orderBy(desc(tickets.createdAt))
        .limit(effectiveLimit)
        .offset(offset);
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / effectiveLimit));

    return {
      tickets: results,
      pagination: {
        currentPage: effectivePage,
        totalPages,
        totalCount,
        hasNextPage: effectivePage < totalPages,
        hasPrevPage: effectivePage > 1,
      },
    };
  } catch (error) {
    console.error('[lib/db.ts getTickets] Query failed:', error);
    throw new Error(
      error instanceof Error ? `getTickets failed: ${error.message}` : 'getTickets failed: unknown error'
    );
  }
}

// Post helpers
export async function createPost(data: {
  title: string;
  url: string;
  submittedById: string;
  submittedByName?: string | null;
}) {
  const id = crypto.randomUUID();
  await getDb().insert(posts).values({
    id,
    title: data.title,
    url: data.url,
    submittedById: data.submittedById,
    submittedByName: data.submittedByName,
    submittedAt: new Date(),
    points: 1,
    votes: JSON.stringify([data.submittedById]),
  });
  return id;
}

export async function getPostByUrl(url: string) {
  const [result] = await getDb().select().from(posts).where(eq(posts.url, url));
  return result || null;
}

export async function getPostById(id: string) {
  const [result] = await getDb().select().from(posts).where(eq(posts.id, id));
  return result || null;
}

export async function updatePostVotes(id: string, points: number, votes: string[]) {
  await getDb()
    .update(posts)
    .set({ points, votes: JSON.stringify(votes) })
    .where(eq(posts.id, id));
}

export async function getPosts(
  // page: number = 1,
  // limit: number = 10
): Promise<PaginatedPostsResult> {
  // const offset = (page - 1) * limit;

  // Removed count query for performance
  // const total = 0;

  const results = await getDb()
    .select()
    .from(posts)
    .orderBy(desc(posts.points), desc(posts.submittedAt));
    // .limit(limit)
    // .offset(offset);

  return {
    posts: results.map((p) => ({
      ...p,
      votes: JSON.parse(p.votes) as string[],
    })),
    // pagination: {
    //   currentPage: page,
    //   totalPages: Math.ceil(total / limit),
    //   totalCount: total,
    //   hasNextPage: page < Math.ceil(total / limit),
    //   hasPrevPage: page > 1,
    // },
  };
}

