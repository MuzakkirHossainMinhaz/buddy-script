# BuddyScript Backend

Express, TypeScript, Prisma, PostgreSQL, and Redis backend for the BuddyScript social feed assignment.

## Features

- Session-based authentication with HTTP-only cookies and Redis session storage
- Registration with first name, last name, email, and password
- Protected post, comment, reply, like, and unlike mutations
- Public/private posts
- Cursor-paginated feed, comments, replies, and liker lists
- Local image uploads for posts under `src/uploads`
- Zod request validation, Helmet, CORS, rate limiting, and request logging

## Tech Stack

- Node.js 20+
- Express 5
- TypeScript
- Prisma 7 with `@prisma/adapter-pg`
- PostgreSQL
- Redis
- Multer for local multipart image uploads

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

The API starts on `http://localhost:5000` by default.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | API port, default `5000` |
| `DATABASE_URL` | Yes in production | PostgreSQL connection string |
| `REDIS_URL` | Yes in production | Redis connection string |
| `SESSION_SECRET` | Yes in production | Session signing secret |
| `SESSION_NAME` | No | Cookie name |
| `SESSION_COOKIE_SAME_SITE` | No | Cookie SameSite value, defaults to `none` in production |
| `SESSION_COOKIE_DOMAIN` | No | Parent domain for sharing cookies across subdomains, for example `.example.com` |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `TRUST_PROXY` | No | Set to `true` or a hop count only when behind a trusted proxy |
| `BCRYPT_ROUNDS` | No | Password hash cost, default `12` |
| `LOG_LEVEL` | No | Winston log level |

In production the app refuses to start if `DATABASE_URL`, `REDIS_URL`, or `SESSION_SECRET` is missing.

## Image Uploads

Create posts with JSON or `multipart/form-data`.

For image upload, send:

- `content`: post text
- `privacyType`: `public` or `private`
- `image`: JPEG, PNG, WEBP, or GIF file up to 5 MB

Uploaded files are stored in:

```text
src/uploads
```

They are served from:

```text
/uploads/<filename>
```

The folder is kept in git, but uploaded files are ignored.

## Pagination

List endpoints use cursor pagination.

Query params:

- `limit`: max `100`
- `sort`: `newest` or `oldest` where supported
- `cursor`: value returned from the previous response

Response metadata:

```json
{
  "limit": 20,
  "nextCursor": "cursor-value-or-null",
  "hasNext": true
}
```

## API Summary

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Register and start a session |
| `POST` | `/api/auth/login` | No | Login and regenerate session |
| `POST` | `/api/auth/logout` | Yes | Destroy session |
| `GET` | `/api/auth/me` | Yes | Current user |

### Posts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/posts` | Optional | Public feed |
| `GET` | `/api/posts/me` | Yes | Current user's public and private posts |
| `POST` | `/api/posts` | Yes | Create post with optional local image upload |
| `GET` | `/api/posts/:postId` | Optional | Read visible post |
| `PUT` | `/api/posts/:postId` | Yes | Update own post |
| `DELETE` | `/api/posts/:postId` | Yes | Soft-delete own post |
| `POST` | `/api/posts/:postId/like` | Yes | Like visible post |
| `DELETE` | `/api/posts/:postId/like` | Yes | Unlike visible post |
| `GET` | `/api/posts/:postId/likes` | Optional | Liker list for visible post |

### Comments

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/posts/:postId/comments` | Optional | Comments for visible post |
| `POST` | `/api/posts/:postId/comments` | Yes | Create comment on visible post |
| `PUT` | `/api/comments/:commentId` | Yes | Update own visible comment |
| `DELETE` | `/api/comments/:commentId` | Yes | Soft-delete own visible comment |
| `POST` | `/api/comments/:commentId/like` | Yes | Like visible comment |
| `DELETE` | `/api/comments/:commentId/like` | Yes | Unlike visible comment |
| `GET` | `/api/comments/:commentId/likes` | Optional | Liker list for visible comment |

### Replies

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/comments/:commentId/replies` | Optional | Replies for visible comment |
| `POST` | `/api/comments/:commentId/replies` | Yes | Create reply on visible comment |
| `PUT` | `/api/replies/:replyId` | Yes | Update own visible reply |
| `DELETE` | `/api/replies/:replyId` | Yes | Soft-delete own visible reply |
| `POST` | `/api/replies/:replyId/like` | Yes | Like visible reply |
| `DELETE` | `/api/replies/:replyId/like` | Yes | Unlike visible reply |
| `GET` | `/api/replies/:replyId/likes` | Optional | Liker list for visible reply |

## Privacy Rules

Public posts are visible to everyone.

Private posts are visible only to the post author. Comments, replies, likes, and liker lists inherit the parent post's visibility.

Nested replies must belong to the same comment as their parent reply.

## Database

The schema is in `prisma/schema.prisma`, with an initial migration in `prisma/migrations`.

Important modeling choices:

- `PostPrivacy` enum: `public`, `private`
- `LikeTargetType` enum: `post`, `comment`, `reply`
- Redis stores sessions; there is no SQL session table
- Feed-style reads are indexed for cursor pagination

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start compiled server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run Node tests through `tsx` |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:generate` | Generate Prisma client |

## Verification

```bash
npm run typecheck
npm test
npm run build
```
