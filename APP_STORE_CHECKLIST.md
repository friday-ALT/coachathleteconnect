# App Store Submission Checklist

## 📋 Pre-Submission Checklist

### Backend Setup
- [ ] Backend deployed to production (Railway, Render, AWS, etc.)
- [ ] Production URL obtained (e.g., https://your-app.railway.app)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Demo account tested on production
- [ ] API endpoints tested and working
- [ ] SSL/HTTPS enabled
- [ ] CORS configured correctly

### Mobile App Configuration
- [ ] API URL updated in `mobile/app.json`
- [ ] API URL updated in `mobile/eas.json`
- [ ] App version set correctly (1.0.0)
- [ ] Bundle identifier set: `com.coachconnect.app`
- [ ] Package name set: `com.coachconnect.app`
- [ ] App name confirmed: CoachConnect
- [ ] App icon created (1024x1024)
- [ ] Splash screen created
- [ ] Demo login tested locally

### Developer Accounts
- [ ] Apple Developer Account active ($99/year)
- [ ] Google Play Developer Account active ($25 one-time)
- [ ] Payment methods added to both accounts
- [ ] Tax forms completed (if required)

### Legal & Privacy
- [ ] Privacy policy written
- [ ] Privacy policy hosted (URL accessible)
- [ ] Terms of service written (optional but recommended)
- [ ] Support email set up
- [ ] Support URL or contact page created

### App Assets

#### iOS Assets
- [ ] App icon: 1024 x 1024 pixels, PNG, no transparency
- [ ] Screenshots: Minimum 3 per device size
  - [ ] 6.7" Display (iPhone 14 Pro Max): 1290 x 2796
  - [ ] 6.5" Display (iPhone 11 Pro Max): 1242 x 2688
  - [ ] 5.5" Display (iPhone 8 Plus): 1242 x 2208 (optional)
- [ ] iPad screenshots (if supporting tablets)

#### Android Assets
- [ ] App icon: 512 x 512 pixels, PNG
- [ ] Adaptive icon: 1024 x 1024 pixels, PNG with transparency
- [ ] Feature graphic: 1024 x 500 pixels, JPEG or PNG
- [ ] Screenshots: Minimum 2, maximum 8
  - [ ] Phone: 1080 x 1920 pixels (or similar 16:9)
  - [ ] Tablet screenshots (optional)

### App Store Listing Content

#### iOS App Store Connect
- [ ] App name: CoachConnect
- [ ] Subtitle: Connect with expert coaches
- [ ] Description written (see APP_STORE_SUBMISSION.md)
- [ ] Keywords selected (100 chars max)
- [ ] Primary category: Health & Fitness
- [ ] Secondary category: Sports
- [ ] Age rating: 4+
- [ ] Copyright: Your name or company
- [ ] Demo account credentials added to review notes

#### Google Play Console
- [ ] App name: CoachConnect
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Category: Health & Fitness
- [ ] Content rating questionnaire completed
- [ ] Target age group selected
- [ ] Demo account credentials added to testing instructions

## 🔨 Build Process

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```
- [ ] EAS CLI installed
- [ ] Logged into Expo account

### Step 2: Configure Build
```bash
cd mobile
eas build:configure
```
- [ ] EAS configured
- [ ] Project ID generated and added to app.json

### Step 3: Build iOS
```bash
eas build --platform ios --profile production
```
- [ ] iOS build started
- [ ] iOS build completed successfully
- [ ] IPA file downloaded

### Step 4: Build Android
```bash
eas build --platform android --profile production
```
- [ ] Android build started
- [ ] Android build completed successfully
- [ ] AAB file downloaded

## 📤 Submission Process

### iOS Submission

#### App Store Connect Setup
- [ ] Logged into https://appstoreconnect.apple.com
- [ ] Created new app
- [ ] Bundle ID matches: com.coachconnect.app
- [ ] App information filled
- [ ] Screenshots uploaded
- [ ] Description added
- [ ] Keywords added
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Demo credentials added to review notes:
```
Email: demo@coachconnect.app
Password: Demo2026!
Or tap "Try Demo" on welcome screen
```

#### Build Upload
- [ ] IPA uploaded via Transporter app
- [ ] Or submitted via: `eas submit --platform ios`
- [ ] Build processing completed
- [ ] Build selected in App Store Connect

#### Final Review
- [ ] All required fields completed
- [ ] Age rating set
- [ ] Pricing set to Free
- [ ] Countries selected
- [ ] Review notes added
- [ ] Submitted for review

### Android Submission

#### Google Play Console Setup
- [ ] Logged into https://play.google.com/console
- [ ] Created new app
- [ ] Package name matches: com.coachconnect.app
- [ ] Store listing completed
- [ ] Graphics uploaded
- [ ] Screenshots uploaded
- [ ] Content rating completed
- [ ] Privacy policy URL added
- [ ] Demo credentials added to app access notes

#### Build Upload
- [ ] AAB uploaded to Production track
- [ ] Or submitted via: `eas submit --platform android`
- [ ] Build processing completed

#### Final Review
- [ ] All required sections completed
- [ ] Pricing set to Free
- [ ] Countries selected
- [ ] App access information provided
- [ ] Submitted for review

## 🧪 Testing Checklist

### Before Building
- [ ] App runs without crashes on iOS simulator
- [ ] App runs without crashes on Android emulator
- [ ] Demo login works from welcome screen
- [ ] Demo login works from login screen
- [ ] Can select Athlete role
- [ ] Can select Coach role
- [ ] Can switch between roles
- [ ] All screens load correctly
- [ ] Navigation works properly
- [ ] API calls succeed
- [ ] Images load correctly
- [ ] Forms validate properly

### After Building
- [ ] Test production build on physical iOS device
- [ ] Test production build on physical Android device
- [ ] Verify demo login works with production backend
- [ ] Test all critical user flows
- [ ] Check app performance
- [ ] Verify no crashes or errors

## 📱 Demo Account Testing

### Athlete Mode Testing
- [ ] Browse coaches screen loads
- [ ] Can search for coaches
- [ ] Can view coach profile
- [ ] Can send connection request
- [ ] Can request training session
- [ ] Can view sessions list
- [ ] Can view profile
- [ ] Can edit profile

### Coach Mode Testing
- [ ] Dashboard loads with stats
- [ ] Can view connection requests
- [ ] Can accept/decline requests
- [ ] Can view session requests
- [ ] Can accept/decline sessions
- [ ] Can view schedule
- [ ] Can view profile
- [ ] Can edit profile

### Role Switching
- [ ] Can switch from Athlete to Coach
- [ ] Can switch from Coach to Athlete
- [ ] Data persists after switching
- [ ] Correct screens shown for each role

## 📊 Post-Submission

### Monitoring
- [ ] Set up crash reporting (Expo, Sentry)
- [ ] Configure analytics (optional)
- [ ] Monitor App Store Connect
- [ ] Monitor Google Play Console
- [ ] Check for reviewer questions

### After Approval
- [ ] App appears in App Store
- [ ] App appears in Google Play
- [ ] Test download and installation
- [ ] Share with beta testers
- [ ] Announce launch
- [ ] Monitor reviews
- [ ] Respond to user feedback

## 🚨 Common Issues & Solutions

### Build Fails
- **Issue**: Missing dependencies
  - **Fix**: Run `npm install` in mobile folder
- **Issue**: Invalid configuration
  - **Fix**: Check app.json and eas.json syntax
- **Issue**: Network timeout
  - **Fix**: Retry build with `--clear-cache`

### Submission Fails
- **Issue**: Invalid credentials
  - **Fix**: Verify Apple ID / Google account
- **Issue**: Bundle ID mismatch
  - **Fix**: Ensure bundle ID matches in all configs
- **Issue**: Missing build
  - **Fix**: Ensure build completed successfully

### App Rejected
- **Issue**: Crashes on launch
  - **Fix**: Test thoroughly before resubmitting
- **Issue**: Missing demo account
  - **Fix**: Add credentials to review notes
- **Issue**: Incomplete information
  - **Fix**: Fill all required fields
- **Issue**: Privacy policy issues
  - **Fix**: Ensure policy is accessible and complete

## 📞 Getting Help

### Documentation
- **BUILD_FOR_APP_STORE.md** - Quick build guide
- **APP_STORE_SUBMISSION.md** - Detailed submission guide
- **DEMO_ACCOUNT.md** - Demo account information

### External Resources
- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console

### Community Support
- **Expo Forums**: https://forums.expo.dev
- **Expo Discord**: https://chat.expo.dev
- **Stack Overflow**: Tag with `expo` and `react-native`

## 🎯 Success Metrics

### Week 1
- [ ] No critical crashes
- [ ] Positive review ratio > 70%
- [ ] Demo account working for all users

### Month 1
- [ ] User retention > 40%
- [ ] Average session length > 5 minutes
- [ ] Feature adoption tracking

## 🎉 You're Ready!

All tasks completed:
- ✅ Demo account configured
- ✅ Mobile app updated
- ✅ Backend updated
- ✅ Build configuration ready
- ✅ Documentation complete

**Next action:** Deploy your backend and start building!

```bash
# Quick start
cd mobile
eas build --platform all --profile production
```

Good luck with your submission! 🚀
