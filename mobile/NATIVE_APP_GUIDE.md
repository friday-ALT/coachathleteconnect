# CoachConnect Native App - Testing Guide

## What's Been Built

I've created a **true React Native app** with native components and Expo Router for file-based routing. This is NOT a WebView wrapper - it's a real native iOS/Android app.

## Architecture

### Tech Stack
- **React Native** (v0.76.5)
- **Expo SDK 54** with Expo Router for navigation
- **TypeScript** for type safety
- **React Hook Form + Zod** for form validation
- **TanStack Query** for API state management
- **Expo Secure Store** for secure token storage
- **Axios** for API requests

### App Structure
```
mobile/
├── app/                      # Expo Router pages (file-based routing)
│   ├── _layout.tsx          # Root layout with QueryClient
│   ├── index.tsx            # Splash/redirect screen
│   ├── welcome.tsx          # Welcome screen (Instagram-style)
│   ├── dashboard.tsx        # Main dashboard (after onboarding)
│   └── auth/                # Authentication flow
│       ├── _layout.tsx      # Auth layout
│       ├── login.tsx        # Native login screen
│       ├── signup.tsx       # Native signup screen
│       ├── forgot-password.tsx
│       ├── role-selection.tsx
│       └── onboarding/
│           ├── athlete/
│           │   ├── step1.tsx
│           │   └── step2.tsx
│           └── coach/
│               ├── step1.tsx
│               └── step2.tsx
├── components/              # Reusable React Native components
├── lib/
│   └── api.ts              # Axios client + API helpers
├── constants/
│   ├── config.ts           # API URLs and endpoints
│   └── theme.ts            # Colors, spacing, typography
└── hooks/                   # Custom hooks
```

## How to Test on iOS Simulator

### Prerequisites
1. Xcode installed (with iOS Simulator)
2. Node.js 22.x (already installed: v22.22.0)
3. Backend server running on port 3000

### Step 1: Start Backend Server
```bash
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2
npm run dev
```

Wait for: `serving on port 3000`

### Step 2: Start Expo Development Server
In a new terminal:
```bash
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
npx expo start --port 8083
```

### Step 3: Open in iOS Simulator
Press `i` in the Expo terminal to launch the iOS Simulator, or scan the QR code with Expo Go on your physical device.

## Testing the App Flow

### 1. Welcome Screen
- Should see "CoachConnect" logo
- "Create Account" and "Log In" buttons
- Three feature highlights

### 2. Sign Up Flow
1. Tap "Create Account"
2. Fill in: First Name, Last Name, Email, Password
3. Submit → See "Check your email" confirmation
4. (In dev mode, verification link will be in server console)

### 3. Login Flow
1. Tap "Log In"
2. Enter email and password
3. If unverified, see verification prompt
4. If verified, proceed to role selection

### 4. Role Selection
- Choose "I'm an Athlete" or "I'm a Coach"
- Each leads to a 2-step onboarding flow

### 5. Athlete Onboarding
- **Step 1**: Phone number and age
- **Step 2**: City, state, and skill level (Beginner/Intermediate/Advanced)
- Submit → Dashboard

### 6. Coach Onboarding
- **Step 1**: Full name and phone number
- **Step 2**: City, state, experience (160 chars), and hourly rate
- Submit → Dashboard

### 7. Dashboard
- Welcome message
- Logout button in header
- Placeholder for future features

## Key Features

### Native UI Components
- Real React Native components (`View`, `Text`, `TextInput`, `TouchableOpacity`)
- Native keyboard handling and form inputs
- Native navigation animations via Expo Router
- Native gesture handling

### Instagram-Style Design
- Full-screen immersive flows
- Custom headers with back buttons
- Progress bars for multi-step processes
- Clean, minimal design with green accent color

### Secure Authentication
- Tokens stored in Expo Secure Store (encrypted)
- Automatic auth state management
- Protected routes via Expo Router

### Form Validation
- Real-time validation with Zod schemas
- User-friendly error messages
- Prevents invalid submissions

## API Integration

The app connects to your backend at:
```
http://100.65.129.201:3000
```

### Endpoints Used
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/user` - Get current user
- `POST /api/auth/forgot-password` - Reset password
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/profiles/athlete` - Create athlete profile
- `POST /api/profiles/coach` - Create coach profile

## Troubleshooting

### App won't load in simulator
- Check that backend is running on port 3000
- Verify IP address in `mobile/constants/config.ts` matches your local IP
- Try pressing `r` in Expo terminal to reload
- Try `Shift + i` to select iOS simulator

### "Network Error" when signing up/logging in
- Confirm backend is accessible at `http://100.65.129.201:3000`
- Check firewall settings
- Try updating IP address in `config.ts`

### Expo version warnings
- These are safe to ignore for development
- App uses SDK 54 compatible versions

### Build errors
- Clear Metro cache: `npx expo start --clear`
- Reinstall dependencies: `cd mobile && rm -rf node_modules && npm install`

## What's Next

This is a fully functional native app foundation! You can now:

1. **Test the complete auth flow** on your simulator or physical device
2. **Extend the Dashboard** with real features (bookings, messages, search)
3. **Add more screens** using Expo Router (just create files in `app/` folder)
4. **Customize styling** in `constants/theme.ts`
5. **Build for production** with `npx expo build:ios` or `npx expo build:android`

## Current Status

✅ Node.js 22 installed and active
✅ Expo Router configured for file-based navigation
✅ Native screens built for entire auth + onboarding flow
✅ API integration with secure token storage
✅ Form validation and error handling
✅ Backend server running on port 3000
✅ Expo dev server starting...

**The app is ready to test on your iOS Simulator!**
