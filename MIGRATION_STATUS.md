# 📊 Migration Status: Replit → Cursor + Supabase

This document tracks the migration progress from the Replit AI-generated codebase to a production-ready Cursor + Supabase application.

**Last Updated**: February 3, 2026

---

## ✅ Phase 1: Setup & Configuration (COMPLETE)

### ✅ Environment Setup
- [x] Install `dotenv` for environment variable management
- [x] Create `.env` file with proper structure
- [x] Update `.env.example` with Supabase variables
- [x] Add environment variable validation

### ✅ Supabase Integration
- [x] Install Supabase dependencies (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Create server-side Supabase client (`server/lib/supabase.ts`)
- [x] Create client-side Supabase client (`client/src/lib/supabase.ts`)
- [x] Add Supabase config endpoint (`/api/config/supabase`)
- [x] Create type definitions placeholder (`shared/supabase-types.ts`)

### ✅ Documentation
- [x] Create comprehensive **SUPABASE_SETUP.md** guide
- [x] Create RLS policies SQL file (`migrations/rls-policies.sql`)
- [x] Update main README.md with new setup flow
- [x] Document all environment variables

---

## 🔄 Phase 2: Database Migration (IN PROGRESS)

### ✅ Schema Analysis
- [x] Audit existing Drizzle schema (`shared/schema.ts`)
- [x] Document all tables and relationships
- [x] Identify required indexes and constraints

### ⏳ Next Steps
- [ ] Test Supabase connection with real credentials
- [ ] Run `npm run db:push` to create tables in Supabase
- [ ] Verify all tables created correctly
- [ ] Apply RLS policies from `migrations/rls-policies.sql`
- [ ] Test RLS policies with sample data
- [ ] Create database seeding script for development

### Database Tables (from schema.ts)
- `users` - User accounts
- `athlete_profiles` - Athlete-specific data
- `coach_profiles` - Coach-specific data
- `connections` - Athlete-Coach relationships
- `time_slot_requests` - Session booking requests
- `reviews` - Coach reviews and ratings
- `coach_availability_rules` - Recurring weekly availability
- `coach_availability_exceptions` - Date-specific availability changes
- `booked_sessions` - Confirmed training sessions
- `coach_schedule_templates` - Weekly training schedule templates
- `coach_schedule_template_items` - Individual scheduled sessions
- `training_session_requests` - Training session requests
- `sessions` - Express session storage (for authentication)

---

## 🔄 Phase 3: Authentication Migration (PENDING)

### Current State
The app currently uses:
- **Passport.js** with `passport-local` strategy
- **bcryptjs** for password hashing
- **express-session** with PostgreSQL store
- Custom email verification flow
- Dual auth system (Replit Auth + Email Auth)

### 🎯 Migration Plan: Supabase Auth

#### Option A: Full Supabase Auth (RECOMMENDED)
Replace Passport.js completely with Supabase Auth.

**Benefits:**
- Built-in email verification
- Password reset flows
- Social auth (Google, GitHub, etc.)
- MFA support
- Better security (server-side sessions)
- Automatic JWT management

**Changes Required:**
- [ ] Replace `/api/auth/signup` with Supabase Auth signup
- [ ] Replace `/api/auth/login` with Supabase Auth login
- [ ] Replace `/api/auth/logout` with Supabase Auth signout
- [ ] Update `useAuth` hook to use Supabase session
- [ ] Replace session middleware with Supabase auth middleware
- [ ] Update RLS policies to use `auth.uid()`
- [ ] Migrate existing users (if any)

#### Option B: Hybrid Approach (CURRENT)
Keep Passport.js for now, use Supabase only for database.

**Status:**
- ✅ Keeping current auth flow functional
- ⏳ Will migrate to Supabase Auth in future iteration

---

## 🔄 Phase 4: Storage Setup (PENDING)

### Current State
- Using **Multer** for file uploads
- Files stored in local `uploads/` directory
- Avatar uploads to `uploads/avatars/`

### 🎯 Migration Plan: Supabase Storage

- [ ] Create `avatars` bucket in Supabase Storage
- [ ] Set up storage RLS policies
- [ ] Replace Multer with Supabase Storage client
- [ ] Update avatar upload endpoint
- [ ] Migrate existing uploaded files (if any)
- [ ] Update avatar URL references in database
- [ ] Remove local `uploads/` directory from deployment

---

## 🔄 Phase 5: Code Cleanup & Optimization (PENDING)

### Dead Code to Remove
- [ ] Remove Replit-specific code (`server/replitAuth.ts`)
- [ ] Remove Replit environment checks
- [ ] Remove Replit Vite plugins (keep for dev, remove for production)
- [ ] Clean up unused dependencies

### Optimization Tasks
- [ ] Run `npm audit fix` to resolve security vulnerabilities
- [ ] Remove unused imports across codebase
- [ ] Optimize bundle size (analyze with `vite build --analyze`)
- [ ] Add error boundaries to React components
- [ ] Implement proper loading states
- [ ] Add request debouncing/throttling where needed
- [ ] Optimize database queries (add indexes)
- [ ] Implement caching strategy (React Query + Supabase)

### Type Safety
- [ ] Generate TypeScript types from Supabase schema
- [ ] Fix any `any` types in codebase
- [ ] Add proper error typing
- [ ] Validate API responses with Zod schemas

---

## 🔄 Phase 6: Testing & Validation (PENDING)

### Runtime Testing
- [ ] Test user signup flow
- [ ] Test user login flow
- [ ] Test password reset flow
- [ ] Test athlete profile creation
- [ ] Test coach profile creation
- [ ] Test role switching
- [ ] Test connection requests
- [ ] Test session booking
- [ ] Test review system
- [ ] Test file uploads

### Security Testing
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Validate rate limiting on auth endpoints
- [ ] Check CORS configuration
- [ ] Verify session security (httpOnly, secure, sameSite)
- [ ] Test password strength requirements

### Performance Testing
- [ ] Measure page load times
- [ ] Test with large datasets
- [ ] Check database query performance
- [ ] Verify caching effectiveness
- [ ] Test concurrent user sessions

---

## 📝 Phase 7: Documentation & Deployment (PENDING)

### Documentation
- [ ] Update README.md with final setup instructions
- [ ] Create API documentation
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Add code comments for complex logic
- [ ] Create developer onboarding guide

### Deployment Preparation
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Set up Supabase production project
- [ ] Configure CI/CD pipeline
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics
- [ ] Set up automated backups
- [ ] Create deployment checklist

### Production Deployment
- [ ] Deploy to production (Vercel/Railway/Fly.io)
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Enable production monitoring
- [ ] Set up automated health checks

---

## 🚨 Known Issues & Blockers

### Critical (Must Fix Before Running)
1. ✅ **FIXED**: Missing `dotenv` - Installed
2. ⚠️ **BLOCKER**: Need actual Supabase credentials to test
3. ⚠️ **BLOCKER**: Database not initialized (need to run migrations)

### Medium Priority
1. Dual auth system (Replit + Email) adds complexity
2. No automated tests
3. Security vulnerabilities in dependencies (9 found)
4. Missing error boundaries in React components
5. No request rate limiting

### Low Priority (Polish)
1. Replit-specific code can be cleaned up
2. Some unused dependencies can be removed
3. Bundle size could be optimized
4. Missing loading skeletons on some pages

---

## 📋 Next Immediate Steps (In Order)

1. **User Action Required**: Set up Supabase project and get credentials
   - Follow **SUPABASE_SETUP.md** guide
   - Update `.env` file with real credentials

2. **Test Database Connection**:
   ```bash
   npm run dev
   ```
   Verify no connection errors

3. **Initialize Database**:
   ```bash
   npm run db:push
   ```
   This creates all tables in Supabase

4. **Apply RLS Policies**:
   - Open Supabase SQL Editor
   - Run SQL from `migrations/rls-policies.sql`

5. **Test App Locally**:
   - Create test user account
   - Test authentication flow
   - Test profile creation
   - Test core features

6. **Fix Any Runtime Errors**:
   - Monitor browser console
   - Check server logs
   - Fix issues as they arise

---

## 📈 Progress Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Setup & Configuration | ✅ Complete | 100% |
| Database Migration | 🔄 In Progress | 30% |
| Auth Migration | ⏳ Pending | 0% |
| Storage Setup | ⏳ Pending | 0% |
| Code Cleanup | ⏳ Pending | 0% |
| Testing | ⏳ Pending | 0% |
| Documentation | 🔄 In Progress | 40% |
| Deployment | ⏳ Pending | 0% |

**Overall Progress: ~21%**

---

## 🎯 Definition of Done

The migration will be considered complete when:

- ✅ App runs locally without errors
- ✅ All features work with Supabase backend
- ✅ Authentication is secure and functional
- ✅ File uploads work via Supabase Storage
- ✅ RLS policies protect all data appropriately
- ✅ No security vulnerabilities
- ✅ Documentation is complete and accurate
- ✅ App is deployed to production
- ✅ All core features tested and working

---

## 💡 Recommendations

1. **Start Small**: Get the database and auth working first before tackling storage and optimization
2. **Test Continuously**: Test each feature as you implement it
3. **Security First**: Don't skip RLS policies - they're critical for data security
4. **Use Transactions**: For operations that modify multiple tables
5. **Monitor Logs**: Keep an eye on both server and browser console logs
6. **Incremental Commits**: Make small, focused commits for each change

---

## 📞 Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vite Docs](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

**Questions or Issues?** Check the troubleshooting section in SUPABASE_SETUP.md first!
