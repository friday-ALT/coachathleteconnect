# Complete App Store Submission Guide

## Prerequisites

### 1. Apple Developer Account (iOS)
- Cost: $99/year
- Sign up: https://developer.apple.com
- Enrollment takes 1-2 business days

### 2. Google Play Developer Account (Android)
- Cost: $25 one-time fee
- Sign up: https://play.google.com/console
- Approval is usually instant

### 3. Production Backend
Before submitting, you need a production backend server:

**Recommended Options:**
- **Railway** (easiest): https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **AWS/DigitalOcean**: For more control

**Steps to deploy backend:**
1. Create account on chosen platform
2. Connect your GitHub repository
3. Set environment variables (DATABASE_URL, SESSION_SECRET, etc.)
4. Deploy the `DesignSyncMobile-2` folder
5. Note the production URL (e.g., `https://your-app.railway.app`)

## Step 1: Configure Production API URL

Update the API URL in your mobile app:

```bash
cd mobile
```

Edit `app.json`:
```json
"extra": {
  "webUrl": "https://your-production-api.railway.app"
}
```

Edit `eas.json`:
```json
"production": {
  "env": {
    "WEB_URL": "https://your-production-api.railway.app"
  }
}
```

## Step 2: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 3: Login to Expo

```bash
eas login
```

Create an Expo account if you don't have one.

## Step 4: Configure EAS Build

```bash
cd mobile
eas build:configure
```

This will:
- Create/update `eas.json`
- Link your project to Expo
- Generate a project ID

Update `app.json` with the project ID:
```json
"extra": {
  "eas": {
    "projectId": "your-generated-project-id"
  }
}
```

## Step 5: Create App Icons and Splash Screen

### App Icon Requirements

**iOS:**
- 1024 x 1024 pixels
- PNG format
- No transparency
- No rounded corners (iOS adds them automatically)

**Android:**
- 512 x 512 pixels (for Play Store)
- 1024 x 1024 pixels (for adaptive icon foreground)
- PNG format with transparency

### Create Icons

Place your icons in the `mobile/assets/` folder:
- `icon.png` - 1024x1024 (used for both platforms)
- `adaptive-icon.png` - 1024x1024 (Android adaptive icon)
- `splash.png` - 1284x2778 (splash screen)
- `favicon.png` - 48x48 (web favicon)

**Quick icon generation:**
```bash
# Use a tool like:
# - Figma (free)
# - Canva (free)
# - Adobe Illustrator
# - Online generators: makeappicon.com
```

## Step 6: Build for iOS

```bash
eas build --platform ios --profile production
```

This will:
1. Upload your code to Expo servers
2. Build the iOS app
3. Generate an IPA file
4. Provide a download link

**Build time:** 10-20 minutes

## Step 7: Build for Android

```bash
eas build --platform android --profile production
```

This will:
1. Upload your code to Expo servers
2. Build the Android app
3. Generate an AAB file
4. Provide a download link

**Build time:** 10-20 minutes

## Step 8: Submit to App Store (iOS)

### Option A: Automatic Submission (Recommended)

```bash
eas submit --platform ios
```

You'll be prompted for:
- Apple ID
- App-specific password (create at appleid.apple.com)
- App Store Connect app ID

### Option B: Manual Submission

1. Download the IPA from EAS build
2. Open **Transporter** app (Mac only)
3. Drag and drop the IPA file
4. Wait for upload to complete

### Configure App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: CoachConnect
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: `com.coachconnect.app`
   - **SKU**: `coachconnect-ios-001`
   - **User Access**: Full Access

4. **App Information:**
   - **Name**: CoachConnect
   - **Subtitle**: Connect with expert coaches
   - **Category**: Health & Fitness
   - **Secondary Category**: Sports

5. **Pricing and Availability:**
   - **Price**: Free
   - **Availability**: All countries

6. **App Privacy:**
   - Add privacy policy URL
   - Complete privacy questionnaire
   - Data types collected: Name, Email, Location

7. **Screenshots** (Required):
   - Take screenshots from iOS simulator
   - Minimum 3 screenshots per device size
   - 6.7" Display: 1290 x 2796 pixels
   - 6.5" Display: 1242 x 2688 pixels

8. **App Description:**
```
CoachConnect - Your Personal Training Companion

Find and connect with professional coaches in your area for personalized training sessions. Whether you're a beginner or advanced athlete, CoachConnect makes it easy to find the perfect coach for your goals.

KEY FEATURES:

For Athletes:
• Browse and search qualified coaches by location
• View detailed profiles with ratings and reviews
• Send connection requests to coaches
• Book and manage training sessions
• Track progress and upcoming sessions
• Leave reviews for coaches

For Coaches:
• Create a professional profile
• Set availability and pricing
• Manage athlete connections
• Schedule training sessions
• Build reputation with reviews
• Grow your coaching business

Download now and start your journey to better performance!
```

9. **Keywords:**
```
coach,trainer,fitness,sports,training,athlete,workout,personal trainer,coaching,sessions
```

10. **Support URL**: Your website or support email

11. **Marketing URL** (optional): Your website

12. **App Review Information:**
    - **Demo Account**:
      - Email: `demo@coachconnect.app`
      - Password: `Demo2026!`
    - **Notes**:
```
DEMO ACCOUNT:
The app includes a "Try Demo" button on the welcome screen for instant access.
Alternatively, login with:
Email: demo@coachconnect.app
Password: Demo2026!

The demo account has both Athlete and Coach profiles.
After logging in, select either role to explore features.
Switch between roles using the swap icon in the header.

TESTING:
1. Tap "Try Demo" on welcome screen
2. Select "Athlete" or "Coach" role
3. Explore app features
4. Use swap icon to switch roles
```

13. **Submit for Review**

## Step 9: Submit to Google Play Store (Android)

### Option A: Automatic Submission (Recommended)

```bash
eas submit --platform android
```

You'll be prompted for:
- Google Service Account JSON key
- Track (internal, alpha, beta, or production)

### Option B: Manual Submission

1. Download the AAB from EAS build
2. Go to https://play.google.com/console
3. Upload to desired track

### Configure Google Play Console

1. **Create App:**
   - Go to https://play.google.com/console
   - Click **"Create app"**
   - **App name**: CoachConnect
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free

2. **Store Listing:**
   - **Short description** (80 chars):
```
Connect with expert coaches for personalized training
```
   - **Full description** (4000 chars):
```
CoachConnect - Your Personal Training Companion

Find and connect with professional coaches in your area for personalized training sessions. Whether you're a beginner or advanced athlete, CoachConnect makes it easy to find the perfect coach for your goals.

KEY FEATURES:

For Athletes:
• Browse and search qualified coaches by location and expertise
• View detailed coach profiles with ratings and reviews
• Send connection requests to coaches
• Book and manage training sessions
• Track your progress and upcoming sessions
• Leave reviews for your coaches

For Coaches:
• Create a professional coach profile
• Set your availability and pricing
• Manage athlete connections and requests
• Schedule training sessions
• Build your reputation with reviews
• Grow your coaching business

WHY COACHCONNECT?

✓ Verified Coaches: All coaches are vetted for quality
✓ Secure Booking: Safe and reliable session booking
✓ Flexible Scheduling: Book sessions that fit your schedule
✓ Transparent Pricing: See coach rates upfront
✓ Community Reviews: Make informed decisions with real reviews

Whether you're looking to improve your fitness, master a sport, or advance your athletic career, CoachConnect is your gateway to expert coaching.

Download now and start your journey to better performance!
```

3. **Graphics:**
   - **App icon**: 512 x 512 pixels
   - **Feature graphic**: 1024 x 500 pixels (required)
   - **Screenshots**: Minimum 2, maximum 8
     - Phone: 16:9 to 9:16 aspect ratio
     - Tablet (optional): 7" and 10" sizes

4. **Categorization:**
   - **App category**: Health & Fitness
   - **Tags**: Sports, Training, Fitness

5. **Contact Details:**
   - **Email**: your-email@example.com
   - **Phone**: (optional)
   - **Website**: (optional)

6. **Privacy Policy:**
   - Add your privacy policy URL
   - Required for all apps

7. **App Access:**
   - Select **"All functionality is available without special access"**
   - Or provide demo credentials:
```
Demo account for testing:
Email: demo@coachconnect.app
Password: Demo2026!

Or tap "Try Demo" button on welcome screen for instant access.
```

8. **Content Rating:**
   - Complete the questionnaire
   - Expected rating: Everyone

9. **Target Audience:**
   - Select appropriate age groups
   - Suggested: 13+

10. **Submit for Review**

## Step 10: Take Screenshots

### iOS Screenshots

Use iOS Simulator:

```bash
# Start app in simulator
cd mobile
npx expo start --ios

# Take screenshots:
# Cmd + S in simulator
# Or use Xcode → Window → Devices and Simulators → Take Screenshot
```

**Required sizes:**
- 6.7" Display (iPhone 14 Pro Max): 1290 x 2796
- 6.5" Display (iPhone 11 Pro Max): 1242 x 2688
- 5.5" Display (iPhone 8 Plus): 1242 x 2208

**Recommended screens to capture:**
1. Welcome screen
2. Coach browse/search
3. Coach profile detail
4. Session booking
5. Dashboard/home screen

### Android Screenshots

Use Android Emulator:

```bash
# Start app in emulator
cd mobile
npx expo start --android

# Take screenshots:
# Use emulator controls or Ctrl+S
```

**Requirements:**
- Minimum 2 screenshots
- JPEG or 24-bit PNG
- 16:9 to 9:16 aspect ratio
- Recommended: 1080 x 1920 pixels

## Step 11: Create Privacy Policy

You need a privacy policy URL. Quick options:

1. **Free generators:**
   - https://www.privacypolicygenerator.info
   - https://www.freeprivacypolicy.com
   - https://app-privacy-policy-generator.firebaseapp.com

2. **Host it:**
   - GitHub Pages (free)
   - Your website
   - Google Docs (set to public)

**What to include:**
- What data you collect (name, email, location)
- How you use it (connecting athletes with coaches)
- How you protect it (secure storage, encryption)
- User rights (access, deletion, modification)
- Contact information

## Step 12: Monitor Review Status

### iOS Review
- **Average time**: 1-3 days
- **Status check**: App Store Connect → My Apps → Your App → App Store → iOS App
- **Notifications**: You'll receive email updates

### Android Review
- **Average time**: 1-3 days
- **Status check**: Google Play Console → Your App → Production
- **Notifications**: You'll receive email updates

## Common Rejection Reasons & Fixes

### iOS

**Issue**: App crashes on launch
- **Fix**: Test thoroughly on multiple iOS versions
- **Fix**: Check crash logs in App Store Connect

**Issue**: Incomplete information
- **Fix**: Fill all required fields in App Store Connect
- **Fix**: Provide demo account credentials

**Issue**: Missing privacy policy
- **Fix**: Add valid privacy policy URL

**Issue**: Misleading metadata
- **Fix**: Ensure screenshots match actual app
- **Fix**: Description accurately reflects features

### Android

**Issue**: App crashes
- **Fix**: Test on multiple Android versions (8.0+)
- **Fix**: Check Play Console crash reports

**Issue**: Missing permissions explanation
- **Fix**: Add permission descriptions in app.json

**Issue**: Privacy policy issues
- **Fix**: Ensure privacy policy is accessible
- **Fix**: Complete data safety section

## Post-Launch Updates

### Over-The-Air (OTA) Updates
For JavaScript/React Native changes only (no native code):

```bash
cd mobile
eas update --branch production --message "Bug fixes and improvements"
```

**Advantages:**
- Instant updates (no app store review)
- Users get updates automatically
- Perfect for bug fixes and minor improvements

**Limitations:**
- Cannot change native code
- Cannot add new native dependencies
- Cannot change app.json configuration

### Full App Updates
For native changes or major updates:

```bash
# Increment version numbers in app.json
# iOS: increment buildNumber
# Android: increment versionCode
# Both: increment version (e.g., 1.0.0 → 1.0.1)

# Build new version
eas build --platform all --profile production

# Submit to stores
eas submit --platform all
```

## Monitoring & Analytics

### 1. Expo Application Services
- View builds: https://expo.dev
- Monitor updates
- Check crash reports

### 2. App Store Connect (iOS)
- Download statistics
- Crash reports
- User reviews
- Revenue (if paid)

### 3. Google Play Console (Android)
- Install statistics
- Crash reports
- User reviews
- Pre-launch reports

### 4. Add Analytics (Optional)

Install analytics:
```bash
cd mobile
npx expo install expo-firebase-analytics
# or
npm install @react-native-firebase/analytics
```

Popular options:
- Google Analytics
- Mixpanel
- Amplitude
- Segment

## Optimization Tips

### 1. Reduce App Size
```bash
# Remove unused dependencies
npm prune

# Optimize images
# Use tools like TinyPNG or ImageOptim
```

### 2. Improve Performance
- Test on older devices
- Profile with React DevTools
- Optimize images and assets
- Use lazy loading where appropriate

### 3. App Store Optimization (ASO)

**Keywords research:**
- Use App Store Connect search suggestions
- Check competitor apps
- Use tools like App Annie or Sensor Tower

**Screenshots:**
- Show key features
- Use captions to explain features
- Make them visually appealing
- Test different variations

**Description:**
- Front-load important keywords
- Clear value proposition
- Use bullet points
- Include social proof (if available)

## Testing Checklist

Before submitting:

- [ ] Test on multiple iOS versions (iOS 14, 15, 16, 17)
- [ ] Test on multiple Android versions (Android 8, 9, 10, 11, 12, 13)
- [ ] Test on different screen sizes
- [ ] Test on physical devices (not just simulators)
- [ ] Test all user flows (signup, login, browse, book, etc.)
- [ ] Test demo account login
- [ ] Test role switching
- [ ] Verify all API calls work with production backend
- [ ] Check app doesn't crash
- [ ] Test offline behavior
- [ ] Verify push notifications (if implemented)
- [ ] Test deep linking (if implemented)
- [ ] Check memory usage
- [ ] Test battery impact

## Build Commands Reference

```bash
# Development build (for testing)
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview build (internal testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production build (for app stores)
eas build --platform ios --profile production
eas build --platform android --profile production

# Build both platforms at once
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
eas submit --platform all

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

## Environment Variables

For production builds, set environment variables in `eas.json`:

```json
"production": {
  "env": {
    "WEB_URL": "https://your-api.com",
    "SENTRY_DSN": "your-sentry-dsn",
    "ANALYTICS_KEY": "your-analytics-key"
  }
}
```

## Troubleshooting

### Build Fails

**Check build logs:**
```bash
eas build:view [build-id]
```

**Common issues:**
- Missing dependencies: Run `npm install`
- Incorrect configuration: Check `app.json` and `eas.json`
- Native module issues: May need custom dev client

### Submission Fails

**iOS:**
- Check Apple Developer account is active
- Verify bundle identifier matches
- Ensure all required fields are filled
- Check for missing icons or screenshots

**Android:**
- Verify package name matches
- Check Google Play account is active
- Complete all required sections
- Ensure content rating is complete

### App Rejected

**Read rejection reason carefully**
- Fix the specific issue mentioned
- Update app and resubmit
- Respond to reviewer notes if needed

**Common fixes:**
- Add missing privacy policy
- Update screenshots to match app
- Fix crashes or bugs
- Clarify app functionality
- Add demo account credentials

## Demo Account for Reviewers

Always include this in your review notes:

```
DEMO ACCOUNT FOR TESTING:

Quick Access:
- Tap "Try Demo" button on welcome screen

Or login manually:
- Email: demo@coachconnect.app
- Password: Demo2026!

The demo account has both Athlete and Coach profiles configured.

TESTING STEPS:
1. Launch app and tap "Try Demo"
2. Select "Athlete" to test athlete features:
   - Browse coaches
   - View coach profiles
   - Send connection requests
   - Request training sessions
3. Tap swap icon in header to switch to "Coach" mode:
   - View dashboard
   - Manage connection requests
   - Accept/decline session requests
   - View schedule

All features are fully functional.
```

## Launch Day Checklist

- [ ] Backend deployed to production
- [ ] API URL updated in mobile app
- [ ] Production builds created
- [ ] Apps submitted to both stores
- [ ] Privacy policy published
- [ ] Support email set up
- [ ] Social media accounts created (optional)
- [ ] Landing page ready (optional)
- [ ] Press kit prepared (optional)
- [ ] Analytics configured
- [ ] Crash reporting set up
- [ ] Monitoring dashboard ready

## Post-Launch

### Week 1
- Monitor crash reports daily
- Respond to user reviews
- Fix critical bugs immediately
- Release hotfix if needed

### Week 2-4
- Analyze user behavior
- Gather feedback
- Plan next features
- Optimize based on metrics

### Ongoing
- Regular updates (monthly or bi-weekly)
- Engage with users
- Monitor competitors
- Improve based on feedback

## Resources

- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **Apple Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/

## Need Help?

- **Expo Forums**: https://forums.expo.dev
- **Expo Discord**: https://chat.expo.dev
- **Stack Overflow**: Tag with `expo` and `react-native`

---

**You're ready to launch! 🚀**

Good luck with your app submission!
