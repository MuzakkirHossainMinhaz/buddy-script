# Buddy Script: Project Decisions

This file contains the practical decisions I made while building the project. These are not all architecture decisions, but they explain why I chose certain tools and implementation paths.

## Use of AI Coding Assistants

I used Codex and Antigravity as coding assistants while working on this project. I used them to move faster on implementation, review ideas, generate or adjust boilerplate, and check parts of the code while I was building.

The project decisions, feature scope, and final review were still my responsibility. I treated the tools as assistants, not as replacements for understanding the code or making the tradeoffs.

## Stateless Image Uploads

I wanted the project to stay deployable on Vercel or a similar platform, so I avoided depending on permanent local file storage for images.

The backend accepts an uploaded image, validates it, sends it to external storage, deletes the temporary local file, and stores only the final image URL in the database.

That decision keeps the upload flow compatible with serverless-style deployment. Local disk is fine for temporary work during a request, but it should not be treated as permanent storage.

## Why Next.js

I used Next.js instead of plain React because this project is a social platform and may later need public pages such as profiles or individual posts. Those pages benefit from better routing, metadata, SEO, and share preview support.

Next.js also made the setup simpler:

- File-based routing, so I did not need `react-router-dom`.
- Built-in app structure for pages and layouts.
- Good environment variable and production build support.
- Easy deployment path with Vercel.

For the current assessment, the main feed is protected, so SEO is not the most important part yet. I still chose Next.js because it gives the project a better base if public-facing pages are added later.

## Why PostgreSQL Instead of MongoDB

I chose PostgreSQL because the app data is strongly relational.

A post belongs to a user. A comment belongs to a post. A reply belongs to a comment. A like belongs to a user and to one target. These relationships need constraints, indexes, and transactions.

PostgreSQL is a good fit here because it gives:

- Foreign keys for direct relationships.
- Unique constraints for duplicate-like prevention.
- Transactions for likes, comments, replies, and counter updates.
- Strong indexing for feed and interaction queries.

MongoDB could work for some feed systems, but for this assessment it would either duplicate data heavily or require more application-side consistency checks. SQL was the cleaner choice for the data shape I had.

## Why Express.js Instead of Nest.js

I used Express.js because the project scope was small enough that Nest.js would add more structure than I needed.

Express let me build the API quickly and keep the flow easy to review:

- Routes define endpoints.
- Controllers handle request and response.
- Services hold business logic.
- Middlewares handle auth, validation, uploads, logging, and rate limiting.
- Prisma handles database access.

Nest.js is useful for larger applications, especially when a team needs modules, dependency injection, decorators, and strict conventions. For this assessment, Express gave me enough structure without extra boilerplate.

## RTK Query for Frontend API State

I used RTK Query because the feed has many small server-backed states: current user, posts, comments, replies, likes, and liker lists.

RTK Query helped with request caching, loading states, and invalidating data after create/like/reply actions. Without it, I would have needed more manual state management inside the feed components.

## Scope Control

I intentionally kept the scope close to the assessment requirements. I did not build forgot password, email verification, friend requests, notification systems, or feed ranking.

The features I focused on were:

- Registration and login.
- Protected feed.
- Text and image posts.
- Public/private posts.
- Comments and replies.
- Like/unlike behavior.
- Showing who liked posts, comments, and replies.
- Basic security and validation.

That kept the project realistic for the assessment and avoided adding features that were not asked for.
