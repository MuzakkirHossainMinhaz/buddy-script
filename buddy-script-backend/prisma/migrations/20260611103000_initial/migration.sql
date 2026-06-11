CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "PostPrivacy" AS ENUM ('public', 'private');
CREATE TYPE "LikeTargetType" AS ENUM ('post', 'comment', 'reply');

CREATE TABLE "users" (
  "id" BIGSERIAL PRIMARY KEY,
  "uuid" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "last_login_at" TIMESTAMP(3),
  "last_login_ip" TEXT,
  "login_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "posts" (
  "id" BIGSERIAL PRIMARY KEY,
  "uuid" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" BIGINT NOT NULL,
  "content" TEXT NOT NULL,
  "image_url" TEXT,
  "privacy_type" "PostPrivacy" NOT NULL DEFAULT 'public',
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "like_count" BIGINT NOT NULL DEFAULT 0,
  "comment_count" BIGINT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "comments" (
  "id" BIGSERIAL PRIMARY KEY,
  "uuid" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "post_id" BIGINT NOT NULL,
  "user_id" BIGINT NOT NULL,
  "content" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "like_count" BIGINT NOT NULL DEFAULT 0,
  "reply_count" BIGINT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "replies" (
  "id" BIGSERIAL PRIMARY KEY,
  "uuid" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "comment_id" BIGINT NOT NULL,
  "user_id" BIGINT NOT NULL,
  "parent_reply_id" BIGINT,
  "content" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "like_count" BIGINT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "likes" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_id" BIGINT NOT NULL,
  "target_type" "LikeTargetType" NOT NULL,
  "target_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_uuid_idx" ON "users"("uuid");
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

CREATE UNIQUE INDEX "posts_uuid_key" ON "posts"("uuid");
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");
CREATE INDEX "posts_privacy_type_is_deleted_created_at_id_idx" ON "posts"("privacy_type", "is_deleted", "created_at" DESC, "id" DESC);
CREATE INDEX "posts_user_id_is_deleted_created_at_id_idx" ON "posts"("user_id", "is_deleted", "created_at" DESC, "id" DESC);
CREATE INDEX "posts_created_at_id_idx" ON "posts"("created_at" DESC, "id" DESC);

CREATE UNIQUE INDEX "comments_uuid_key" ON "comments"("uuid");
CREATE INDEX "comments_post_id_is_deleted_created_at_id_idx" ON "comments"("post_id", "is_deleted", "created_at" DESC, "id" DESC);
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

CREATE UNIQUE INDEX "replies_uuid_key" ON "replies"("uuid");
CREATE INDEX "replies_comment_id_is_deleted_created_at_id_idx" ON "replies"("comment_id", "is_deleted", "created_at" ASC, "id" ASC);
CREATE INDEX "replies_user_id_idx" ON "replies"("user_id");
CREATE INDEX "replies_parent_reply_id_idx" ON "replies"("parent_reply_id");

CREATE UNIQUE INDEX "likes_user_id_target_type_target_id_key" ON "likes"("user_id", "target_type", "target_id");
CREATE INDEX "likes_target_type_target_id_created_at_id_idx" ON "likes"("target_type", "target_id", "created_at" DESC, "id" DESC);
CREATE INDEX "likes_user_id_idx" ON "likes"("user_id");

ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "replies" ADD CONSTRAINT "replies_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "replies" ADD CONSTRAINT "replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "replies" ADD CONSTRAINT "replies_parent_reply_id_fkey" FOREIGN KEY ("parent_reply_id") REFERENCES "replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
