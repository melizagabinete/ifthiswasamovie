/**
 * Migration script: MongoDB -> Turso
 * 
 * Run this AFTER running migrate.ts to create the tables.
 * Requires MONGODB_URI and Turso env vars to be set in .env.local
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { createClient } from '@libsql/client';

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB || 'better-auth';
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set. Make sure .env.local contains MONGODB_URI.');
    process.exit(1);
  }
  if (!tursoUrl) {
    console.error('❌ TURSO_DATABASE_URL is not set. Make sure .env.local contains TURSO_DATABASE_URL.');
    process.exit(1);
  }

  // Connect to MongoDB
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const mongoDb = mongoClient.db(mongoDbName);
  console.log('✅ Connected to MongoDB');

  // Connect to Turso
  const tursoClient = createClient({ url: tursoUrl, authToken: tursoToken });
  console.log('✅ Connected to Turso');

  // Check if tickets table already has data
  const ticketsCheck = await tursoClient.execute({ sql: 'SELECT COUNT(*) as count FROM tickets', args: [] });
  const existingTickets = Number(ticketsCheck.rows[0]?.count ?? 0);
  if (existingTickets > 0) {
    console.log(`⚠️  Tickets table already has ${existingTickets} rows. Skipping ticket migration to avoid duplicates.`);
  } else {
    // Migrate tickets
    const ticketsCollection = mongoDb.collection('tickets');
    const tickets = await ticketsCollection.find({}).toArray();
    console.log(`📦 Found ${tickets.length} tickets to migrate`);

    if (tickets.length > 0) {
      for (const ticket of tickets) {
        await tursoClient.execute({
          sql: `
            INSERT INTO tickets (id, movie_title, poster_url, recipient_name, message, seat_number, barcode_word, image_data, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            ticket._id.toString(),
            ticket.movieTitle || '',
            ticket.posterUrl || null,
            ticket.recipientName || '',
            ticket.message || '',
            ticket.seatNumber || '',
            ticket.barcodeWord || '',
            ticket.imageData || '',
            ticket.createdAt instanceof Date ? ticket.createdAt.getTime() : Date.now(),
          ],
        });
      }
      console.log(`✅ Migrated ${tickets.length} tickets`);
    } else {
      console.log('ℹ️  No tickets found in MongoDB');
    }
  }

  // Check if posts table already has data
  const postsCheck = await tursoClient.execute({ sql: 'SELECT COUNT(*) as count FROM posts', args: [] });
  const existingPosts = Number(postsCheck.rows[0]?.count ?? 0);
  if (existingPosts > 0) {
    console.log(`⚠️  Posts table already has ${existingPosts} rows. Skipping post migration to avoid duplicates.`);
  } else {
    // Migrate posts
    const postsCollection = mongoDb.collection('posts');
    const posts = await postsCollection.find({}).toArray();
    console.log(`📦 Found ${posts.length} posts to migrate`);

    if (posts.length > 0) {
      for (const post of posts) {
        await tursoClient.execute({
          sql: `
            INSERT INTO posts (id, title, url, points, submitted_by_id, submitted_by_name, submitted_at, votes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            post._id.toString(),
            post.title || '',
            post.url || '',
            post.points || 1,
            post.submittedById || '',
            post.submittedByName || null,
            post.submittedAt instanceof Date ? post.submittedAt.getTime() : Date.now(),
            JSON.stringify(post.votes || []),
          ],
        });
      }
      console.log(`✅ Migrated ${posts.length} posts`);
    } else {
      console.log('ℹ️  No posts found in MongoDB');
    }
  }

  // Note: Better Auth tables (user, session, account, verification) are NOT migrated
  // Users will need to re-register/sign in after the switch. This is expected for auth tables.

  await mongoClient.close();
  await tursoClient.close();
  console.log('🎉 Migration complete!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

