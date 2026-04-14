# Deployment Guide - CoachAthleteConnect

This guide covers deploying your CoachAthleteConnect application to production.

## Deployment Options

### Option 1: Vercel (Recommended for Serverless)

Vercel is great for Node.js apps and offers a generous free tier.

#### Prerequisites
- Vercel account ([vercel.com](https://vercel.com))
- Supabase project (already set up)
- GitHub account (for Git integration)

#### Steps

1. **Prepare Your Project**
   ```bash
   # Make sure your code is committed to Git
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Other
     - **Root Directory**: `DesignSyncMobile-2` (if your repo has multiple folders)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist/public`
     - **Install Command**: `npm install`

3. **Set Environment Variables**
   In Vercel project settings > Environment Variables, add:
   - `DATABASE_URL`: Your Supabase connection string (use "Connection pooling" mode)
   - `SESSION_SECRET`: Generate with `openssl rand -base64 32`
   - `RESEND_API_KEY`: Your Resend API key
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Vercel sets this automatically, but include it)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

#### Vercel Configuration File

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "dist/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "dist/public/$1"
    }
  ]
}
```

### Option 2: Railway

Railway is excellent for full-stack apps with databases.

1. **Sign up** at [railway.app](https://railway.app)
2. **Create New Project** > "Deploy from GitHub repo"
3. **Select your repository**
4. **Add Environment Variables** (same as Vercel)
5. **Deploy** - Railway auto-detects Node.js and runs `npm start`

Railway will automatically:
- Set up HTTPS
- Provide a domain
- Handle scaling

### Option 3: Render

Render offers free tier hosting with some limitations.

1. **Sign up** at [render.com](https://render.com)
2. **New** > **Web Service**
3. **Connect your repository**
4. **Configure**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
5. **Add Environment Variables** (same as above)
6. **Deploy**

### Option 4: DigitalOcean App Platform

Good for production apps with predictable costs.

1. **Sign up** at [digitalocean.com](https://digitalocean.com)
2. **Create** > **Apps** > **GitHub**
3. **Select repository**
4. **Configure**:
   - Build: `npm run build`
   - Run: `npm start`
5. **Add Environment Variables**
6. **Deploy**

## Post-Deployment Checklist

- [ ] Verify database connection works
- [ ] Test user signup/login
- [ ] Test email functionality (password reset, verification)
- [ ] Check that file uploads work (avatars)
- [ ] Monitor Supabase dashboard for database usage
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (usually automatic)
- [ ] Set up monitoring/logging
- [ ] Configure backups in Supabase

## Environment Variables for Production

Make sure these are set in your hosting platform:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SESSION_SECRET=[GENERATE-A-SECURE-RANDOM-STRING]
RESEND_API_KEY=[YOUR-RESEND-API-KEY]
NODE_ENV=production
PORT=5000
```

## Database Migrations in Production

If you need to run migrations after deployment:

1. **Via Supabase Dashboard**:
   - Go to SQL Editor
   - Run your migration SQL

2. **Via CLI** (if you have database access):
   ```bash
   npm run db:push
   ```

## Monitoring & Maintenance

### Supabase Monitoring
- Check **Database** > **Usage** for storage/bandwidth
- Monitor **Logs** for errors
- Set up **Alerts** for database size

### Application Monitoring
- Use Vercel/Railway/Render's built-in logs
- Consider adding Sentry for error tracking
- Monitor API response times

## Scaling Considerations

### Database Scaling
- Supabase Free: 500 MB storage, 2 GB bandwidth
- Supabase Pro ($25/mo): 8 GB storage, 50 GB bandwidth
- Monitor usage and upgrade when needed

### Application Scaling
- Vercel: Auto-scales, free tier includes 100 GB bandwidth
- Railway: Pay-as-you-go, ~$5/month for small apps
- Render: Free tier limited, paid plans start at $7/month

## Cost Estimate

**Minimum (Free Tier)**:
- Supabase: Free
- Vercel: Free
- Resend: Free (3,000 emails/month)
- **Total: $0/month**

**Small Production**:
- Supabase Pro: $25/month
- Vercel Pro: $20/month (optional)
- Resend: Free
- **Total: ~$25-45/month**

## Troubleshooting Production Issues

### Database Connection Errors
- Check `DATABASE_URL` is correct
- Verify Supabase project is active
- Use "Connection pooling" mode for serverless

### Session Issues
- Ensure `SESSION_SECRET` is set and consistent
- Check cookie settings work with your domain
- Verify HTTPS is enabled (required for secure cookies)

### Build Failures
- Check build logs in your hosting platform
- Ensure all dependencies are in `package.json`
- Verify Node.js version matches (18+)

### File Upload Issues
- Check uploads directory exists
- Verify file size limits
- Consider using Supabase Storage for production (better than local files)

## Next Steps

1. Set up a custom domain
2. Configure email templates in Resend
3. Set up automated backups in Supabase
4. Add error tracking (Sentry)
5. Set up CI/CD for automatic deployments
6. Configure monitoring and alerts
