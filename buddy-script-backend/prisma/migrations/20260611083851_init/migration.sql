-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "replies" ALTER COLUMN "uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "uuid" DROP DEFAULT;
