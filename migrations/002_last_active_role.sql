-- Run once on Supabase/Postgres (or use: npm run db:push)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_role varchar;
