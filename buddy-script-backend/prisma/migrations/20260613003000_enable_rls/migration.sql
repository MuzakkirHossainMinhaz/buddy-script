-- Enable Row Level Security for all application tables.
--
-- The application currently authorizes users in the Express API and accesses
-- Postgres through Prisma with a trusted server-side connection. These RLS
-- settings protect the exposed Supabase public schema from direct anon or
-- authenticated client access unless explicit policies are added later.

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "replies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "users" FROM anon, authenticated;
REVOKE ALL ON TABLE "posts" FROM anon, authenticated;
REVOKE ALL ON TABLE "comments" FROM anon, authenticated;
REVOKE ALL ON TABLE "replies" FROM anon, authenticated;
REVOKE ALL ON TABLE "likes" FROM anon, authenticated;

REVOKE ALL ON SEQUENCE "users_id_seq" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "posts_id_seq" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "comments_id_seq" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "replies_id_seq" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "likes_id_seq" FROM anon, authenticated;
