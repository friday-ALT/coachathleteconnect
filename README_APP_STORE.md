# CoachConnect - App Store Ready! 🚀

## What's New

Your app now includes a **demo account** feature for easy testing and App Store review!

### Demo Account Features

✅ **One-tap demo login** - "Try Demo" button on welcome screen
✅ **No email verification** - Instant access
✅ **Both roles included** - Athlete and Coach profiles pre-configured
✅ **Full feature access** - Test everything
✅ **Role switching** - Switch between modes seamlessly

## Demo Credentials

### Quick Access
Tap the **"Try Demo"** button on the welcome screen

### Manual Login
- **Email**: `demo@coachconnect.app`
- **Password**: `Demo2026!`

## How to Build for App Store

### Quick Start (5 steps)

1. **Deploy backend to production** (Railway, Render, etc.)
   ```bash
   # Get your production URL, e.g., https://your-app.railway.app
   ```

2. **Update API URL** in mobile app
   ```bash
   cd mobile
   # Edit app.json and eas.json with your production URL
   ```

3. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   eas login
   ```

4. **Build the app**
   ```bash
   cd mobile
   eas build --platform all --profile production
   ```

5. **Submit to stores**
   ```bash
   eas submit --platform all
   ```

## Documentation

- **📘 BUILD_FOR_APP_STORE.md** - Quick build guide
- **📗 APP_STORE_SUBMISSION.md** - Complete submission guide
- **📙 DEMO_ACCOUNT.md** - Demo account details
- **📄 DEMO_CREDENTIALS.txt** - Quick reference card
- **📕 APP_STORE_GUIDE.md** - Original guide (in mobile folder)

## Project Structure

```
DesignSyncMobile-2/
├── mobile/                    # React Native mobile app
│   ├── app/                  # Screens (Expo Router)
│   │   ├── auth/            # Authentication screens
│   │   │   └── login.tsx    # ✨ Now includes demo login button
│   │   ├── welcome.tsx      # ✨ Now includes "Try Demo" button
│   │   ├── (athlete)/       # Athlete mode screens
│   │   └── (coach)/         # Coach mode screens
│   ├── lib/api.ts           # ✨ Updated with demoLogin function
│   ├── app.json             # ✨ Updated for production
│   └── eas.json             # ✨ Updated with build config
├── server/                   # Express backend
│   ├── demoAuth.ts          # ✨ NEW: Demo credentials config
│   ├── emailAuth.ts         # ✨ Updated with demo login
│   └── demoSeed.ts          # ✨ Updated to seed demo user
└── Documentation files       # ✨ NEW: Comprehensive guides
```

## What Changed

### Backend Changes

1. **`server/demoAuth.ts`** (NEW)
   - Demo credentials configuration
   - Helper functions for demo login
   - Demo user and profile data

2. **`server/emailAuth.ts`** (UPDATED)
   - Added demo login support in `/api/auth/login`
   - New endpoint: `/api/auth/demo-login`
   - Auto-creates demo user on first login

3. **`server/demoSeed.ts`** (UPDATED)
   - Seeds main demo user with both profiles
   - Creates athlete and coach profiles for demo account
   - Sets up availability rules

### Mobile App Changes

1. **`mobile/app/welcome.tsx`** (UPDATED)
   - Added "Try Demo" button
   - One-tap demo access
   - Loading states

2. **`mobile/app/auth/login.tsx`** (UPDATED)
   - Added "Try Demo Account" button
   - Demo login mutation
   - Professional styling with divider

3. **`mobile/lib/api.ts`** (UPDATED)
   - Added `demoLogin()` function
   - Calls `/api/auth/demo-login` endpoint

4. **`mobile/app.json`** (UPDATED)
   - Added iOS permissions descriptions
   - Added Android permissions
   - Production-ready configuration
   - Added app description

5. **`mobile/eas.json`** (UPDATED)
   - Production build configuration
   - Environment variables setup
   - Submission configuration

## Testing the Demo Account

### Local Testing

1. **Start backend:**
   ```bash
   cd DesignSyncMobile-2
   npm run dev
   ```

2. **Start mobile app:**
   ```bash
   cd mobile
   npx expo start
   ```

3. **Test demo login:**
   - Tap "Try Demo" on welcome screen
   - Or login manually with credentials
   - Select Athlete or Coach role
   - Explore features
   - Switch roles using swap icon

### Production Testing

After deploying:

1. Update API URL in `mobile/app.json`
2. Rebuild the app
3. Test demo login with production backend
4. Verify all features work

## App Store Submission

### For iOS

1. **Build:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit:**
   ```bash
   eas submit --platform ios
   ```

3. **Configure in App Store Connect:**
   - Add screenshots
   - Add description
   - Add demo credentials in review notes
   - Submit for review

### For Android

1. **Build:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit:**
   ```bash
   eas submit --platform android
   ```

3. **Configure in Play Console:**
   - Add screenshots
   - Add description
   - Add demo credentials in testing instructions
   - Submit for review

## Demo Account Review Notes

Copy this into your App Store review notes:

```
DEMO ACCOUNT FOR REVIEW:

Quick Access:
Tap "Try Demo" button on the welcome screen for instant access.

Manual Login:
Email: demo@coachconnect.app
Password: Demo2026!

Testing Instructions:
1. Launch app and tap "Try Demo" on welcome screen
2. Select "Athlete" to test athlete features:
   - Browse coaches by location
   - View detailed coach profiles
   - Send connection requests
   - Request training sessions
   - View upcoming sessions
3. Tap the swap icon in the header to switch to "Coach" mode:
   - View dashboard with statistics
   - Manage connection requests
   - Accept/decline session requests
   - View and manage schedule
   - See connected athletes

The demo account has both Athlete and Coach profiles fully configured.
All features are functional and can be tested.
```

## Important Files

- **DEMO_CREDENTIALS.txt** - Quick reference card (print/save this!)
- **DEMO_ACCOUNT.md** - Detailed demo account documentation
- **BUILD_FOR_APP_STORE.md** - This file
- **APP_STORE_SUBMISSION.md** - Complete submission guide
- **server/demoAuth.ts** - Demo credentials (change before production if desired)

## Security Considerations

### Demo Account Security

The demo credentials are:
- Hardcoded in `server/demoAuth.ts`
- Stored in plain text (not hashed)
- Automatically created on first login
- Separate from regular user accounts

### Before Production

Consider:
1. **Changing demo password** - Edit `server/demoAuth.ts`
2. **Rate limiting** - Prevent demo account abuse
3. **Monitoring** - Track demo account usage
4. **Data cleanup** - Periodically reset demo account data

### Current Security Measures

- Demo account cannot be deleted by other users
- Demo account is marked with `authProvider: 'demo'`
- Demo user ID starts with `demo-` prefix
- Separate from regular authentication flow

## Customization

### Change Demo Credentials

Edit `server/demoAuth.ts`:

```typescript
export const DEMO_CREDENTIALS = {
  email: 'your-custom-email@example.com',
  password: 'YourCustomPassword123!',
  userId: 'demo-user-main',
};
```

### Customize Demo Profiles

Edit `server/demoAuth.ts`:
- Update `DEMO_ATHLETE_PROFILE` for athlete data
- Update `DEMO_COACH_PROFILE` for coach data

### Remove Demo Login (if not needed)

1. Remove "Try Demo" button from `mobile/app/welcome.tsx`
2. Remove demo button from `mobile/app/auth/login.tsx`
3. Keep backend demo login for App Store reviewers

## Next Steps

### Immediate (Before Submission)

1. [ ] Deploy backend to production
2. [ ] Update API URL in mobile app
3. [ ] Create app icons (1024x1024)
4. [ ] Take screenshots (3-5 per platform)
5. [ ] Write privacy policy
6. [ ] Test demo login on production

### App Store Submission

1. [ ] Build with EAS
2. [ ] Submit to App Store Connect
3. [ ] Submit to Google Play Console
4. [ ] Add demo credentials to review notes
5. [ ] Wait for approval

### Post-Launch

1. [ ] Monitor crash reports
2. [ ] Respond to user reviews
3. [ ] Plan feature updates
4. [ ] Marketing and promotion

## Support

- **Demo Issues**: Check DEMO_ACCOUNT.md
- **Build Issues**: Check BUILD_FOR_APP_STORE.md
- **Submission Issues**: Check APP_STORE_SUBMISSION.md
- **Expo Issues**: https://docs.expo.dev

## Success Checklist

- ✅ Demo account configured
- ✅ "Try Demo" buttons added
- ✅ Backend supports demo login
- ✅ Mobile app updated
- ✅ Production build config ready
- ✅ EAS configuration complete
- ✅ Documentation created

**You're ready to build and submit! 🎉**

---

## Quick Reference

**Demo Login:**
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

**Build Command:**
```bash
cd mobile && eas build --platform all --profile production
```

**Submit Command:**
```bash
cd mobile && eas submit --platform all
```

**Update Command (after launch):**
```bash
cd mobile && eas update --branch production --message "Updates"
```

---

Made with ❤️ - Your app is ready for the world!
