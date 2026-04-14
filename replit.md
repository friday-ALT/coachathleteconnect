# Soccer Coach Platform

## Overview

A two-sided marketplace connecting young athletes/parents with soccer coaches. The platform serves two distinct user types with separate workflows:

**For Athletes:**
1. Browse coaches publicly (no signup required) at `/browse`
2. Filter by location, skill level, group size, and pricing
3. Sign up and **connect with coaches** before requesting sessions
4. Select specific date and time slots (30-minute intervals) when requesting
5. Track sent requests and their status
6. Leave reviews for coaches after accepted sessions

**For Coaches:**
1. Create a coach profile with experience, pricing, and availability
2. Manage incoming connection requests (accept/decline athletes)
3. Receive training requests from connected athletes
4. Accept or decline session requests via dashboard
5. Build reputation through athlete reviews

**Core Features:**
- Dual-role system (Athlete and Coach profiles)
- **Connection System**: Athletes must connect with coaches before requesting sessions
  - Connection statuses: PENDING, ACCEPTED, DECLINED, BLOCKED
  - Athletes send connection requests with optional message
  - Coaches can accept or decline connection requests
- Public coach browsing (no authentication required)
- Private request management (authentication required)
- **Time Slot Selection**: Athletes select specific date (next 7 days) and time slot (30-min intervals)
- Time slot request workflow with status tracking (PENDING, ACCEPTED, DECLINED)
- Review and rating system
- Authentication via dual system (Email/Password + Replit Auth)
- Mobile-first responsive design with hamburger menu
- **Native Mobile Apps**: Expo-based iOS and Android apps using WebView wrapper

**Role-Based Routing with Locked Dashboards:**
- After login, users are redirected to the landing page (/) where they choose their role
- Landing page shows different buttons for authenticated vs unauthenticated users:
  - Unauthenticated: "I'm an Athlete" / "I'm a Coach" → signup
  - Authenticated with profile: "Enter as Athlete" / "Enter as Coach" → enter role
  - Authenticated without profile: "Set Up Profile" → onboarding
- Role-specific routes use `/athlete/*` and `/coach/*` prefixes
- Route guards (AthleteRouteGuard, CoachRouteGuard) protect role-specific routes:
  - Unauthenticated → redirect to `/login?role=X`
  - No active role → redirect to `/` (landing page)
  - Missing profile → redirect to `/onboarding?role=X`
  - Wrong role active → redirect to `/` (landing page)
- **Landing Page Lock**: Users with an active role cannot access the landing page (/)
  - Automatically redirected to their role-specific dashboard
  - CoachConnect logo links to dashboard when in active role
- Exit Role button redirects to landing page (/) for role switching
- Legacy routes (/dashboard, /profile, /requests) redirect to role-specific equivalents

## Mobile App

**Location**: `/mobile` directory

**Technology**: Expo with React Native WebView

The mobile app wraps the existing web application in a native container for iOS and Android app stores. It loads the published web app via WebView, providing a native app experience while maintaining a single codebase for the web interface.

**Key Files:**
- `mobile/App.tsx`: Main React Native component with WebView
- `mobile/app.json`: Expo configuration (app name, icons, bundle IDs)
- `mobile/eas.json`: Build configuration for iOS and Android
- `mobile/README.md`: Detailed setup and deployment instructions

**Deployment Process:**
1. Web app is published on Replit
2. Mobile app configured with published web URL
3. Built using Expo Application Services (EAS)
4. Submitted to Apple App Store and Google Play Store

**Benefits:**
- Single codebase for web UI
- Native app distribution via app stores
- Automatic updates when web app changes
- Native app experience (icons, splash screen, etc.)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18 with TypeScript using Vite as the build tool

**Routing:** Wouter (lightweight client-side routing)

**State Management:** 
- TanStack Query (React Query) for server state and caching
- React hooks for local component state
- No global state management library needed due to server-centric data flow

**UI Component Library:** shadcn/ui with Radix UI primitives
- Design system approach with Tailwind CSS for styling
- Custom theme system with light/dark mode support
- Material Design principles for mobile-first experience
- Color palette centered around soccer green (#26a641) for primary actions

**Key Design Decisions:**
- Mobile-first approach with responsive breakpoints
- Card-based layouts for coach listings and requests
- Modal dialogs for actions (requesting time slots, leaving reviews)
- Public browse page for coaches (unauthenticated access)
- Role-based dashboard with automatic detection (athlete vs coach)
- Two-sided marketplace clearly explained on landing page

### Backend Architecture

**Runtime:** Node.js with Express.js

**API Pattern:** RESTful API with JSON payloads
- Route handlers organized in `server/routes.ts`
- Storage abstraction layer in `server/storage.ts`
- All API routes prefixed with `/api`

**Authentication (Dual System):**

The platform supports two authentication methods that work simultaneously:

**1. Email/Password Authentication:**
- Custom signup with email verification (24-hour token expiration)
- Password hashing with bcryptjs (10 rounds)
- Login with email/password after email verification
- Password reset flow (1-hour token expiration)
- Email delivery via Resend API
- Routes in `server/emailAuth.ts`:
  - POST `/api/auth/signup` - Create account, send verification email
  - GET `/api/auth/verify-email?token=xxx` - Verify email address
  - POST `/api/auth/login` - Login with email/password
  - POST `/api/auth/forgot-password` - Request password reset
  - POST `/api/auth/reset-password` - Reset password with token
  - POST `/api/auth/resend-verification` - Resend verification email
- Frontend pages: `/signup`, `/login`, `/forgot-password`, `/reset-password`

**2. Replit Auth (OpenID Connect):**
- OAuth-based authentication via Replit's OIDC provider
- Passport.js integration with openid-client
- Discovery endpoint at `https://replit.com/oidc`
- Routes: `/api/login`, `/api/callback`, `/api/logout`

**Session Compatibility:**
- Both auth methods share the same session store
- Email auth injects `req.user.claims` format for route compatibility
- All authenticated routes use `req.user.claims.sub` for user ID
- Phone number captured during onboarding (stored in user table)

**Session Management:**
- Express session with connect-pg-simple
- Sessions stored in PostgreSQL `sessions` table
- 7-day session TTL with httpOnly, secure cookies

**File Upload Handling:**
- Multer middleware for avatar uploads
- Local file storage in `uploads/avatars` directory
- 5MB file size limit, image types only (jpeg, jpg, png, gif)
- Files served statically via `/uploads` route

**Data Access:**
- Storage interface pattern for data operations
- All database queries abstracted through IStorage interface
- Supports swapping implementations without changing route handlers

### Database Architecture

**ORM:** Drizzle ORM with PostgreSQL dialect

**Database Provider:** Neon serverless PostgreSQL (via `@neondatabase/serverless`)
- WebSocket-based connection pooling
- Configured via `DATABASE_URL` environment variable

**Schema Design:**

**Users Table:**
- Stores user data from both auth methods (id, email, name, profile image)
- Email auth fields: passwordHash, emailVerified, emailVerificationToken, emailVerificationExpires
- Password reset fields: passwordResetToken, passwordResetExpires
- Phone number field for platform-specific requirements
- Primary key is user ID (varchar) - UUID for email auth, Replit ID for Replit Auth

**Athlete Profiles:**
- One-to-one relationship with users (userId foreign key with cascade delete)
- Stores: age, skill level (enum: Beginner/Intermediate/Advanced), location (city/state)
- Unique constraint on userId ensures one athlete profile per user

**Coach Profiles:**
- One-to-one relationship with users (userId foreign key with cascade delete)
- Stores: name, location, experience description, price per hour (in cents), rating metrics
- Avatar URL for profile pictures
- Rating calculated as average (ratingAvg) with count (ratingCount)
- Unique constraint on userId

**Connections (connections):**
- Links athletes to coaches (required before requesting sessions)
- Status enum: PENDING, ACCEPTED, DECLINED, BLOCKED
- Optional message field for athlete's introduction
- Foreign keys: athleteId and coachId (both reference users.id)
- Athletes can only send session requests to coaches with ACCEPTED connections

**Time Slot Requests:**
- Many-to-one relationships with both athletes and coaches
- Stores: group size, desired position, optional note, requestedDate, requestedStartTime
- Status enum: PENDING, ACCEPTED, DECLINED
- Foreign keys: athleteId, coachId, connectionId (links to connection)

**Reviews:**
- Many-to-one relationships with athletes and coaches
- Stores: rating (1-5 integer), optional comment
- Foreign keys: athleteId and coachId
- Created timestamp for chronological ordering

**Coach Availability Rules (coach_availability_rules):**
- Stores recurring weekly availability schedules
- Fields: dayOfWeek (0-6), startTime, endTime, isActive flag
- Foreign key: coachId (references users.id)
- Coaches can set multiple time blocks per day

**Coach Availability Exceptions (coach_availability_exceptions):**
- Stores date-specific overrides (blocks or additions)
- Fields: date, optional startTime/endTime, exceptionType (BLOCK/ADD)
- BLOCK: Remove availability (vacation, day off)
- ADD: Add extra availability not in regular schedule
- Full-day exceptions have null times

**Booked Sessions (booked_sessions):**
- Stores scheduled training sessions
- Fields: coachId, athleteId, startAt, endAt, status, optional requestId
- Status enum: SCHEDULED, COMPLETED, CANCELLED
- Links to time slot requests when applicable

**Indexes:**
- Session expiration index for cleanup queries
- Additional indexes recommended: userId on profiles, status on requests, coachId on reviews

**Data Integrity:**
- Cascade deletes on user removal
- Enum constraints for skill levels and request statuses
- Unique constraints prevent duplicate profiles

### External Dependencies

**Authentication Service:**
- Replit Auth (OpenID Connect provider)
- Configuration via environment variables: `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET`
- Discovery endpoint at `https://replit.com/oidc`

**Email Service:**
- Resend API for transactional emails
- Configuration via `RESEND_API_KEY` environment variable
- Email templates in `server/email.ts`
- Used for: email verification, password reset

**Database:**
- Neon PostgreSQL (serverless)
- Connection string in `DATABASE_URL` environment variable
- Required for both application data and session storage

**UI Component Libraries:**
- shadcn/ui component collection (locally installed, not external service)
- Radix UI primitives for accessible components
- Lucide React for icons

**Fonts:**
- Google Fonts: Inter (primary), JetBrains Mono (monospace for data)
- Loaded via CDN in HTML head

**Development Tools:**
- Replit-specific: Cartographer, Dev Banner, Runtime Error Modal (Vite plugins)
- Only active in development mode within Replit environment

**Build Dependencies:**
- Vite for frontend bundling
- esbuild for server-side bundling
- TypeScript compiler for type checking
- Drizzle Kit for database migrations

**Session Store:**
- connect-pg-simple (PostgreSQL session storage)
- Requires `sessions` table in database

**File Upload:**
- Multer (server-side multipart/form-data handling)
- No external storage service; uses local filesystem

**Third-Party Integrations (Planned but not implemented):**
- Payment processing (price fields present but no integration)
- Google AdSense (placeholder support via environment variable)