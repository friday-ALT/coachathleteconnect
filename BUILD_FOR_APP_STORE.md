# Build for App Store - Quick Guide

## 🚀 Fast Track to App Store

### Prerequisites Checklist

- [ ] Apple Developer Account ($99/year) - https://developer.apple.com
- [ ] Google Play Developer Account ($25 one-time) - https://play.google.com/console
- [ ] Production backend deployed (Railway, Render, etc.)
- [ ] App icons ready (1024x1024 for iOS, 512x512 for Android)
- [ ] Privacy policy URL ready

### Step 1: Deploy Your Backend (5-10 minutes)

**Option A: Railway (Recommended)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `DesignSyncMobile-2`
6. Add environment variables:
   ```
   DATABASE_URL=your-database-url
   SESSION_SECRET=your-secret-key
   NODE_ENV=production
   ```
7. Deploy and copy your production URL

**Option B: Render**

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect repository
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Add environment variables
8. Deploy and copy URL

### Step 2: Update API URL in Mobile App (2 minutes)

```bash
cd mobile
```

Edit `app.json`:
```json
"extra": {
  "webUrl": "https://your-production-url.railway.app"
}
```

Edit `eas.json`:
```json
"production": {
  "env": {
    "WEB_URL": "https://your-production-url.railway.app"
  }
}
```

### Step 3: Install EAS CLI (1 minute)

```bash
npm install -g eas-cli
eas login
```

### Step 4: Configure EAS (2 minutes)

```bash
cd mobile
eas build:configure
```

This generates a project ID. Copy it to `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "paste-your-project-id-here"
  }
}
```

### Step 5: Build for Both Platforms (20-40 minutes)

```bash
# Build both iOS and Android
eas build --platform all --profile production
```

Or build separately:
```bash
# iOS only
eas build --platform ios --profile production

# Android only
eas build --platform android --profile production
```

Wait for builds to complete. You'll get download links for:
- iOS: `.ipa` file
- Android: `.aab` file

### Step 6: Submit to App Stores (10-15 minutes)

**Automatic submission (easiest):**
```bash
eas submit --platform all
```

**Or submit manually:**

**iOS:**
1. Download IPA from build
2. Open Transporter app (Mac)
3. Drag and drop IPA
4. Upload to App Store Connect

**Android:**
1. Download AAB from build
2. Go to Google Play Console
3. Upload to Production track

### Step 7: Configure Store Listings (30-60 minutes)

**iOS (App Store Connect):**

1. Go to https://appstoreconnect.apple.com
2. Create new app:
   - Name: CoachConnect
   - Bundle ID: com.coachconnect.app
   - Category: Health & Fitness
3. Add screenshots (minimum 3)
4. Add app description (see APP_STORE_SUBMISSION.md)
5. Add keywords
6. Add privacy policy URL
7. Add demo account in "App Review Information":
   ```
   Email: demo@coachconnect.app
   Password: Demo2026!
   
   Or tap "Try Demo" on welcome screen
   ```
8. Submit for review

**Android (Google Play Console):**

1. Go to https://play.google.com/console
2. Create new app:
   - Name: CoachConnect
   - Package: com.coachconnect.app
   - Category: Health & Fitness
3. Add screenshots (minimum 2)
4. Add feature graphic (1024x500)
5. Add app description
6. Complete content rating questionnaire
7. Add privacy policy URL
8. Add demo credentials in "App access" notes
9. Submit for review

### Step 8: Wait for Review (1-7 days)

- **iOS**: Usually 1-3 days
- **Android**: Usually 1-3 days

You'll receive email notifications about review status.

## 📱 Demo Account Info

**The app includes a "Try Demo" button for instant access!**

Manual login credentials:
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

Features:
- Both Athlete and Coach profiles
- No email verification needed
- Full feature access
- Role switching enabled

## 🎯 What Reviewers Will See

1. **Welcome Screen** with "Try Demo" button
2. **Role Selection** (Athlete or Coach)
3. **Athlete Mode:**
   - Browse coaches
   - View coach profiles
   - Send connection requests
   - Request sessions
4. **Coach Mode:**
   - Dashboard with stats
   - Manage requests
   - View schedule
   - Manage athletes

## ⚡ Quick Commands

```bash
# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform all

# Check build status
eas build:list

# Push OTA update (after initial release)
eas update --branch production --message "Bug fixes"

# View project info
eas project:info
```

## 🐛 Troubleshooting

**Build fails:**
```bash
# Check build logs
eas build:view [build-id]

# Clear cache and rebuild
eas build --platform ios --profile production --clear-cache
```

**Submission fails:**
- Verify Apple/Google account credentials
- Check bundle ID / package name matches
- Ensure build completed successfully

**App rejected:**
- Read rejection reason carefully
- Fix the issue
- Increment build number
- Rebuild and resubmit

## 📊 After Launch

### Monitor Performance
- Check App Store Connect / Play Console daily
- Review crash reports
- Read user reviews
- Monitor download numbers

### Respond to Reviews
- Thank positive reviews
- Address negative feedback
- Fix reported bugs quickly

### Release Updates
- Bug fixes: Use OTA updates (instant)
- New features: Build and submit new version
- Keep app updated regularly

## 💡 Pro Tips

1. **Test with TestFlight (iOS)** before public release:
   ```bash
   eas build --platform ios --profile production
   # Then distribute via TestFlight in App Store Connect
   ```

2. **Use Internal Testing (Android)** before public release:
   ```bash
   eas submit --platform android
   # Select "internal" track
   ```

3. **Staged Rollout**: Release to small percentage first
   - iOS: Phased Release in App Store Connect
   - Android: Staged rollout in Play Console

4. **Prepare for Rejection**: Have fixes ready for common issues

5. **Monitor First Week**: Be ready to push hotfixes quickly

## 📞 Support

- **Expo Documentation**: https://docs.expo.dev
- **Expo Discord**: https://chat.expo.dev
- **Demo Account Info**: See DEMO_ACCOUNT.md
- **Full Guide**: See APP_STORE_SUBMISSION.md

---

## ✅ You're Ready!

Your app is production-ready with:
- ✅ Demo account configured
- ✅ Both iOS and Android support
- ✅ Professional UI/UX
- ✅ Complete feature set
- ✅ Dual role support (Athlete & Coach)

**Next steps:**
1. Deploy backend to production
2. Update API URL in mobile app
3. Run `eas build --platform all --profile production`
4. Submit to both app stores
5. Wait for approval
6. Launch! 🎉

Good luck! 🚀
