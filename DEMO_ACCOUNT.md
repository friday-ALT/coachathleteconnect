# Demo Account Information

## Demo Login Credentials

For testing and App Store review purposes, use these credentials:

- **Email**: `demo@coachconnect.app`
- **Password**: `Demo2026!`

## Quick Demo Access

The app includes a **"Try Demo"** button on the welcome screen and a **"Try Demo Account"** button on the login screen for instant access without entering credentials.

## Demo Account Features

The demo account has:

- ✅ **Both Athlete and Coach profiles** - Test all features
- ✅ **Pre-configured profiles** - Ready to explore immediately
- ✅ **No email verification required** - Instant access
- ✅ **Full feature access** - Browse coaches, send requests, manage sessions
- ✅ **Role switching** - Switch between athlete and coach modes

## For App Store Reviewers

### Testing the App

1. **Launch the app**
2. **Tap "Try Demo"** on the welcome screen (or login with credentials above)
3. **Select a role** (Athlete or Coach) to explore features
4. **Switch roles** using the swap icon in the header to test both modes

### Athlete Mode Features

- Browse and search for coaches
- View coach profiles with ratings and reviews
- Send connection requests to coaches
- Request training sessions
- View upcoming sessions
- Leave reviews for coaches

### Coach Mode Features

- View dashboard with stats
- Manage connection requests from athletes
- Accept or decline session requests
- View connected athletes
- Manage schedule and availability
- View athlete profiles

## Security Notes

- Demo credentials are hardcoded in the backend
- Demo account is automatically created on first login
- Demo user cannot be deleted or modified by other users
- Change these credentials before deploying to production if desired

## For Production Deployment

Before deploying to production:

1. **Update API URL** in `mobile/app.json` and `eas.json`
2. **Consider changing demo credentials** in `server/demoAuth.ts` for security
3. **Deploy backend** to a production server (Railway, Render, AWS, etc.)
4. **Update environment variables** for production
5. **Test demo login** on production environment

## App Store Review Notes

Include these notes when submitting to App Store:

```
DEMO ACCOUNT FOR REVIEW:

The app includes a "Try Demo" button on the welcome screen for instant access.
Alternatively, you can login with:
- Email: demo@coachconnect.app
- Password: Demo2026!

The demo account has both Athlete and Coach profiles configured.
After logging in, select either role to explore the app's features.
You can switch between roles using the swap icon in the header.

TESTING INSTRUCTIONS:
1. Tap "Try Demo" on welcome screen
2. Select "Athlete" or "Coach" role
3. Explore the app features
4. Use the swap icon to switch roles and test both modes

All features are fully functional with the demo account.
```

## Troubleshooting

If demo login doesn't work:

1. **Check backend is running** - The API server must be accessible
2. **Verify API URL** - Check `mobile/constants/config.ts`
3. **Check network connection** - Ensure device/simulator can reach the API
4. **Review backend logs** - Look for "Demo login detected" message
5. **Try manual login** - Use the credentials directly on the login screen

## Technical Details

- Demo user ID: `demo-user-main`
- Auth provider: `demo`
- Email verified: `true` (bypasses verification)
- Profiles: Both athlete and coach profiles are pre-created
- Location: Blacksburg, VA (same as demo coach Mathias Yohannes)
