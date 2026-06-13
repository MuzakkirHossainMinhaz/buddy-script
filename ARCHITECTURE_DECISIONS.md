# Buddy Script: Architecture Decisions

These are the main architecture decisions I made while building the Buddy Script assessment project. I kept this file focused on how the system works internally. Framework, deployment, and tooling choices are written separately in `PROJECT_DECISIONS.md`.

## Authentication

I used session-based authentication for this project. JWT would also work, but for this app I wanted logout and account lock behavior to take effect immediately. With server-side sessions, I can destroy a session on logout instead of waiting for a token to expire.

Sessions are stored in Redis instead of process memory. That keeps the backend ready for more than one server instance and avoids losing all sessions when the app restarts.

The session cookie is configured with `httpOnly`, `sameSite: "strict"`, `secure` in production, and a seven-day max age. I also regenerate the session after login to reduce session fixation risk.

For passwords, I store only bcrypt hashes. The user table also tracks login attempts, lock time, last login time, and last login IP. I added this because even a small assessment app should not allow unlimited password guessing.

## Authorization and Visibility

The feed and interaction routes are protected with `requireAuth`. For updates and deletes, the service layer checks ownership before changing anything.

Post visibility is handled in one place through the visibility service:

- Public posts are visible to logged-in users.
- Private posts are visible only to the author.
- Deleted posts are hidden.

When a private post is requested by someone else, the API responds as if the post was not found. I chose this behavior so the API does not leak that a private post exists.

The same visibility check is reused before loading comments, replies, likes, and liker lists. That matters because a private post should not become visible indirectly through comments or likes.

## Database Model

The database is relational by design. The core data is users, posts, comments, replies, and likes. These records have clear relationships, so I modeled them as separate tables instead of embedding large nested structures.

I used two identifiers for the main records:

- Internal `BIGSERIAL` ids for joins and indexes.
- Public UUIDs for API responses and route params.

The bigint ids are small and efficient for the database. The UUIDs are safer to expose because they do not reveal record count or make neighboring records easy to guess.

Posts, comments, and replies use soft delete flags. I chose soft delete because it keeps relations stable and avoids breaking counts or child records immediately after a delete action.

## Feed Query

The feed returns public, non-deleted posts ordered by newest first. I used cursor-style pagination instead of offset pagination because offset becomes slower as the table grows.

The ordering uses `created_at` and `id` together. That gives a stable order even when multiple posts are created close together. Feed cursors are encoded from the same `(created_at, id)` pair instead of relying only on public UUIDs. The API still accepts the older UUID cursor format so existing clients do not break.

The public feed base query is cached in Redis for a short TTL. The cached value intentionally excludes user-specific state. After loading the cached page, the service performs a batched like lookup for the current user and attaches `isLikedByMe`. This keeps feed reads cheaper without leaking one user's interaction state to another user.

Post create, update, and delete operations invalidate the public feed cache by bumping a Redis namespace version. Feed cache keys include that version, so invalidation is O(1) and does not need to scan or delete every `feed:public:*` key during write-heavy periods.

The public feed, my-posts list, comments list, and replies list all use keyset cursors based on `(created_at, id)`. The API still accepts older UUID cursors as a compatibility fallback, but new cursors are index-aligned and stable at large table sizes.

## Likes

I used one `likes` table for posts, comments, and replies. The table stores:

- `user_id`
- `target_type`
- `target_id`
- `created_at`

This keeps the like/unlike logic in one place instead of repeating the same behavior across three separate tables.

The tradeoff is that `target_id` cannot have a normal foreign key to all three target tables at the same time. I handled that in the service layer by resolving and validating the target before creating a like.

The unique constraint on `(user_id, target_type, target_id)` prevents duplicate likes from the same user.

## Counters

I store counts directly on the parent records:

- Post like count.
- Post comment count.
- Comment like count.
- Comment reply count.
- Reply like count.

I made this decision because the feed is read-heavy. Showing a feed should not run count queries across large comment or like tables for every item.

In my early planning I considered database triggers for these counters. In the default implementation, I update the counters inside application transactions. That keeps the logic easy to read while keeping the write and counter update atomic.

For high-volume interaction workloads, the backend also supports a buffered counter mode with `COUNTER_WRITE_MODE=buffered`. In that mode, like/unlike requests write durable `counter_deltas` instead of updating the same hot parent row for every interaction. A production worker can batch those deltas back into the parent count columns. This is useful for viral posts where direct counter writes can become a lock-contention bottleneck.

The app also writes durable `outbox_events` for posts, comments, replies, and likes. This table is the handoff point for asynchronous side effects such as fanout feeds, notifications, analytics, search indexing, and cache warming.

## Comments and Replies

Comments belong to posts. Replies belong to comments and may also point to a parent reply.

The schema supports nested replies through `parent_reply_id`, but I limited the actual reply depth in the service. Unlimited nesting looks flexible on paper, but it can create slow queries and a messy UI. A practical depth limit is better for this feed.

When comments and replies are created or deleted, their parent counters are updated in the same transaction.

## Indexes

I added indexes around the queries the app actually uses:

- Feed lookup by privacy, deleted state, created time, and id.
- User's own posts by user id, deleted state, created time, and id.
- Comments by post id and created time.
- Replies by comment id and created time.
- Likes by target type, target id, created time, and id.
- Unique likes by user, target type, and target id.

I did not physically partition or shard the tables in this version because that requires real production data-volume decisions and operational ownership. The schema is still prepared for larger tables through bigint ids, keyset query patterns, composite indexes, optional read-replica usage, outbox-driven fanout, and buffered counters. If a deployment grows beyond what single Postgres plus replicas can handle, the natural next step would be range/hash partitioning for posts/interactions and a materialized feed table maintained from the outbox.

The database client is configured with a bounded pool size so serverless deployments do not open too many PostgreSQL connections. The app can also use an optional `DATABASE_READ_URL` for read-heavy paths such as the public feed when a read replica or pooled read endpoint is available.

For CDN/API edge caching, the API keeps feed results user-neutral in Redis and attaches user-specific like state after loading the cached page. That separation is intentional: it allows feed pages to be cached more aggressively without leaking one user's interaction state to another user. A production CDN can safely cache anonymous/public variants once public unauthenticated feed routes are introduced; authenticated feeds should continue to vary by cookie/session.

## Security

The security work is mostly practical rather than complicated:

- Passwords are hashed with bcrypt.
- Login attempts are limited at the account level.
- API and auth routes are rate limited.
- Sessions are stored in Redis.
- Cookies use safer defaults.
- Helmet is enabled for common security headers.
- CORS is restricted to configured origins.
- Request bodies and query params are validated with Zod.
- User-generated text is sanitized before saving.
- Image uploads are limited by size and MIME type.
- PostgreSQL Row Level Security is enabled on the application tables.

RLS is used as a database-level safety layer, especially because the production database is hosted on Supabase where the `public` schema can be exposed through Supabase APIs. The migration enables RLS on `users`, `posts`, `comments`, `replies`, and `likes`, then revokes table and sequence access from Supabase's `anon` and `authenticated` Postgres roles.

I intentionally did not write per-user RLS policies with `auth.uid()`. This application uses custom Express sessions and Prisma, not Supabase Auth, so Supabase JWT claims are not the source of truth for the current user. The detailed visibility rules still live in the service layer where they can use the app's session user id directly. RLS is there for defense in depth: direct browser access through Supabase roles should not be able to read or mutate the app tables, while the trusted backend connection continues to enforce the application rules.
