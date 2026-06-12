# Buddy Script: Architecture Decisions

These are the architecture decisions I made while building the Buddy Script assessment project. I kept this file focused on how the system works internally. Framework, deployment, and tooling choices are written separately in `PROJECT_DECISIONS.md`.

## Authentication

I used session-based authentication for this project. JWT would also work, but for this app I wanted logout and account lock behavior to take effect immediately. With server-side sessions, I can destroy a session on logout instead of waiting for a token to expire.

Sessions are stored in Redis instead of keeping them in process memory. That keeps the backend ready for more than one server instance and avoids losing all sessions when the app restarts.

The session cookie is configured with `httpOnly`, `sameSite: "strict"`, `secure` in production, and a seven-day max age. I also regenerate the session after login to reduce session fixation risk.

For passwords, I store only bcrypt hashes. The user table also tracks login attempts, lock time, last login time, and last login IP. This was added because even a small assessment app should not allow unlimited password guessing.

## Authorization and Visibility

The feed and interaction routes are protected with `requireAuth`. For updates and deletes, the service layer checks ownership before changing anything.

Post visibility is handled in one place through the visibility service:

- Public posts are visible to logged-in users.
- Private posts are visible only to the author.
- Deleted posts are hidden.

When a private post is requested by someone else, the API responds as if the post was not found. I chose this behavior so the API does not leak that a private post exists.

The same visibility check is reused before loading comments, replies, likes, and liker lists. That matters because a private post should not become visible indirectly through its comments or likes.

## Database Model

The database is relational by design. The core data is users, posts, comments, replies, and likes. These records have clear relationships, so I modeled them as separate tables instead of embedding large nested structures.

I used two identifiers for the main records:

- Internal `BIGSERIAL` ids for joins and indexes.
- Public UUIDs for API responses and route params.

The bigint ids are small and efficient for the database. The UUIDs are safer to expose because they do not reveal record count or make neighboring records easy to guess.

Posts, comments, and replies use soft delete flags. I chose soft delete because it keeps relations stable and avoids breaking counts or child records immediately after a delete action.

## Feed Query

The feed returns public, non-deleted posts ordered by newest first. I used cursor-style pagination instead of offset pagination because offset becomes slower as the table grows.

The ordering uses `created_at` and `id` together. That gives a stable order even when multiple posts are created close together.

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

In my early planning I considered database triggers for these counters. In the current implementation I update the counters inside application transactions. That keeps the logic easier to read during review while still keeping the write and counter update atomic.

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

I did not add partitioning, read replicas, sharding, or materialized feed views in this version. Those are valid future options, but they would be over-engineering for the assessment implementation.

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

I did not use PostgreSQL Row Level Security in this version. I considered it, but for this assessment I kept the visibility rules in the service layer because they are easier to follow in the codebase and easier to test directly.
