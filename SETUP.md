# Setup Guide - CoachAthleteConnect

This guide will help you set up and run the CoachAthleteConnect application locally with Supabase.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works fine)
- Git (optional, for version control)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Choose a name, database password, and region
   - Wait for the project to be created (takes ~2 minutes)

2. **Get Your Database Connection String**
   - In your Supabase dashboard, go to **Settings** > **Database**
   - Scroll down to **Connection String**
   - Select **Connection pooling** mode (recommended for serverless)
   - Copy the connection string (it looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

3. **Set Up Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your values:
     - `DATABASE_URL`: Paste your Supabase connection string
     - `SESSION_SECRET`: Generate a random secret (run `openssl rand -base64 32`)
     - `RESEND_API_KEY`: Get from [resend.com](https://resend.com) (for email functionality)
     - `PORT`: Leave as `5000` or change if needed

## Step 3: Set Up the Database Schema

Run the database migrations to create all tables:

```bash
npm run db:push
```

This will create all the necessary tables in your Supabase database.

## Step 4: Run the Application

### Development Mode

```bash
npm run dev
```

The app will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Step 5: Verify Everything Works

1. Open `http://localhost:5000` in your browser
2. Try signing up as a new user
3. Complete the onboarding flow (choose Athlete or Coach)
4. Verify data appears in your Supabase dashboard under **Table Editor**

## Troubleshooting

### Database Connection Issues

- **Error: "DATABASE_URL must be set"**
  - Make sure you created a `.env` file with `DATABASE_URL`
  - Verify the connection string is correct (no extra spaces)

- **Error: "Connection refused"**
  - Check that your Supabase project is active
  - Verify the connection string includes the correct password
  - Try using "Direct connection" instead of "Connection pooling" in Supabase

### Session Store Issues

- If you see errors about the `sessions` table:
  - The `sessions` table should be created automatically by `connect-pg-simple`
  - If not, check your Supabase logs or try running `npm run db:push` again

### Port Already in Use

- Change the `PORT` in your `.env` file to a different number (e.g., `5001`)
- Or stop the process using port 5000

## Next Steps

- See `DEPLOYMENT.md` for instructions on deploying to production
- Check the Supabase dashboard to monitor your database usage
- Set up email templates in Resend for better email delivery

## Cost Considerations

Supabase Free Tier includes:
- 500 MB database storage
- 2 GB bandwidth
- Unlimited API requests
- Perfect for development and small projects

For production, consider upgrading to Pro ($25/month) for:
- 8 GB database storage
- 50 GB bandwidth
- Daily backups
- Better performance
