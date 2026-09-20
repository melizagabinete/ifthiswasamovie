# Turso Migration TODO

- [x] Remove edge runtime from MongoDB routes (done earlier)
- [ ] Install dependencies (@libsql/client, drizzle-orm, drizzle-kit)
- [ ] Create drizzle.config.ts
- [ ] Create db/schema.ts (users, sessions, accounts, verifications, tickets, posts)
- [ ] Create db/index.ts (Turso client)
- [ ] Update lib/auth.ts (drizzleAdapter instead of mongodbAdapter)
- [ ] Rewrite app/api/ticket/route.ts (Drizzle insert)
- [ ] Rewrite app/api/tickets/route.ts (Drizzle select with pagination)
- [ ] Rewrite lib/actions.ts (Drizzle queries, remove ObjectId)
- [ ] Rewrite lib/posts.ts (Drizzle queries)
- [ ] Update lib/connection-status.ts (Turso health check)
- [ ] Create scripts/migrate.ts (push schema to Turso)
- [ ] Create scripts/migrate-mongodb-to-turso.ts (export MongoDB → import Turso)
- [ ] Update next.config.ts (remove serverExternalPackages: ['mongodb'])
- [ ] Add runtime = 'edge' back to API routes for Cloudflare
- [ ] Test build

