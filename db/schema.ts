import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Better Auth tables
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// App tables
export const tickets = sqliteTable('restore_temp', {
  id: text('id').primaryKey(),
  movieTitle: text('movie_title').notNull(),
  posterUrl: text('poster_url'),
  recipientName: text('recipient_name').notNull(),
  message: text('message').notNull(),
  seatNumber: text('seat_number').notNull(),
  barcodeWord: text('barcode_word').notNull(),
  imageData: text('image_data').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  points: integer('points').notNull().default(1),
  submittedById: text('submitted_by_id').notNull(),
  submittedByName: text('submitted_by_name'),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }),
  votes: text('votes').notNull().default('[]'),
});

// Inferred types for use in application code
export type SelectUser = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;
export type SelectSession = typeof session.$inferSelect;
export type SelectAccount = typeof account.$inferSelect;
export type SelectVerification = typeof verification.$inferSelect;
export type SelectTicket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

