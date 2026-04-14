# 🚀 Supabase Setup Guide

This guide will walk you through setting up Supabase for the CoachAthleteConnect application.

## Table of Contents
1. [Create Supabase Project](#1-create-supabase-project)
2. [Get Your Credentials](#2-get-your-credentials)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Set Up Database Schema](#4-set-up-database-schema)
5. [Enable Row Level Security (RLS)](#5-enable-row-level-security-rls)
6. [Set Up Storage Buckets](#6-set-up-storage-buckets)
7. [Test Your Setup](#7-test-your-setup)

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (or create an account)
4. Click **"New project"**
5. Fill in:
   - **Name**: `coach-athlete-connect` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
6. Click **"Create new project"**
7. Wait ~2 minutes for project to initialize

---

## 2. Get Your Credentials

### A. Get API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see three important values:

   **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   ```
   Copy this → You'll use it as SUPABASE_URL
   ```

   **anon/public key** (starts with `eyJ...`)
   ```
   Copy this → You'll use it as SUPABASE_ANON_KEY
   ```

   **service_role key** (starts with `eyJ...`)
   ```
   Copy this → You'll use it as SUPABASE_SERVICE_ROLE_KEY
   ⚠️ NEVER expose this in client code or commit to git!
   ```

### B. Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **Connection pooling** tab
4. Copy the **Connection string** (mode: Session)
5. Replace `[YOUR-PASSWORD]` with your database password from step 1

Example format:
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 3. Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder values:

```bash
# ==================================
# SUPABASE CONFIGURATION
# ==================================

# From Supabase Dashboard > Settings > API
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# From Supabase Dashboard > Settings > Database
DATABASE_URL=postgresql://postgres.xxxxx:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# ==================================
# APPLICATION CONFIGURATION
# ==================================

# Generate a secure session secret (run: openssl rand -base64 32)
SESSION_SECRET=<generate-a-random-32-character-string>

# Optional: For sending emails (get from resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Server config
PORT=5000
NODE_ENV=development
```

3. Generate a secure session secret:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as `SESSION_SECRET`

---

## 4. Set Up Database Schema

### Option A: Using Drizzle Push (Recommended for Development)

This will automatically create all tables based on your schema:

```bash
npm run db:push
```

You should see output like:
```
✓ Pushing schema changes to database...
✓ Done! Database schema is up to date.
```

### Option B: Manual Setup via SQL Editor

If you prefer to run SQL manually:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Copy and paste the SQL from `migrations/schema.sql` (we'll generate this next)
4. Click **"Run"**

To generate the SQL file:
```bash
npm run db:generate
```

---

## 5. Enable Row Level Security (RLS)

Row Level Security ensures users can only access their own data. We need to enable RLS and create policies for each table.

### A. Enable RLS on All Tables

Run this SQL in Supabase SQL Editor (**SQL Editor** → **New query**):

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booked_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_schedule_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_session_requests ENABLE ROW LEVEL SECURITY;
```

### B. Create RLS Policies

**⚠️ IMPORTANT**: See `migrations/rls-policies.sql` for complete RLS policies.

For now, here are the essential policies to get started:

```sql
-- Users: Can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Users: Can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id);

-- Athlete Profiles: Can read their own profile
CREATE POLICY "Athletes can read own profile"
ON athlete_profiles FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Athlete Profiles: Can create their own profile
CREATE POLICY "Athletes can create own profile"
ON athlete_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Athlete Profiles: Can update their own profile
CREATE POLICY "Athletes can update own profile"
ON athlete_profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- Coach Profiles: Anyone can read (for browsing)
CREATE POLICY "Anyone can read coach profiles"
ON coach_profiles FOR SELECT
TO authenticated
USING (true);

-- Coach Profiles: Coaches can create their own profile
CREATE POLICY "Coaches can create own profile"
ON coach_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Coach Profiles: Coaches can update their own profile
CREATE POLICY "Coaches can update own profile"
ON coach_profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- Add more policies as needed (see migrations/rls-policies.sql)
```

**📝 Note**: We'll create a complete RLS policy file in the migrations folder.

---

## 6. Set Up Storage Buckets

Storage buckets are used for file uploads (avatars, images, etc.).

### Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Create the following buckets:

#### Bucket 1: `avatars`
- **Name**: `avatars`
- **Public**: ✅ Yes (make public)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

#### Bucket 2: `uploads` (if needed)
- **Name**: `uploads`
- **Public**: ❌ No (private)
- **File size limit**: 10 MB

### Set Storage Policies

For the `avatars` bucket:

```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to read avatars (public)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 7. Test Your Setup

### A. Test Database Connection

Run the development server:

```bash
npm run dev
```

You should see:
```
serving on port 5000
```

If you see database connection errors, check:
- DATABASE_URL is correct
- Your IP is allowed in Supabase (Settings → Database → Connection pooling)
- Password is correct in connection string

### B. Test Supabase Client

Open http://localhost:5000 in your browser.

Check the browser console (F12) for any errors related to Supabase.

### C. Test Database Schema

Go to Supabase Dashboard → **Table Editor**

You should see all tables created:
- ✅ users
- ✅ athlete_profiles
- ✅ coach_profiles
- ✅ connections
- ✅ reviews
- ✅ time_slot_requests
- ✅ booked_sessions
- ✅ coach_availability_rules
- ✅ coach_availability_exceptions
- ✅ coach_schedule_templates
- ✅ coach_schedule_template_items
- ✅ training_session_requests
- ✅ sessions (for express-session)

---

## 🎉 You're Done!

Your Supabase setup is complete. You can now:

1. **Start developing**: `npm run dev`
2. **Create test accounts**: Visit http://localhost:5000/signup
3. **Browse database**: Use Supabase Table Editor
4. **Monitor logs**: Check Supabase Logs section

---

## Troubleshooting

### "Failed to connect to database"
- Check DATABASE_URL in `.env`
- Verify your IP is allowed in Supabase settings
- Ensure password is correct (no special URL encoding needed with pooler)

### "Missing SUPABASE_URL" or similar errors
- Make sure all environment variables are set in `.env`
- Restart the dev server after changing `.env`

### RLS Policy Errors
- Check that RLS is enabled on all tables
- Verify policies are created correctly
- Check auth.uid() matches your user IDs

### Storage Upload Fails
- Verify bucket exists and is public/private as intended
- Check storage policies are created
- Verify file size is within limits

---

## Next Steps

1. **Read**: [README.md](./README.md) for general app documentation
2. **Migrate Auth**: See [AUTH_MIGRATION.md](./AUTH_MIGRATION.md) for migrating to Supabase Auth
3. **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
