# ✅ Capacitor Native App Setup Complete!

Your CoachConnect web app is now ready to be built as native iOS and Android apps!

## 📱 What's Been Configured

### Core Setup
- ✅ Capacitor 7.4+ installed and initialized
- ✅ iOS platform added (`ios/` folder)
- ✅ Android platform added (`android/` folder)
- ✅ App ID configured: `com.coachconnect.app`
- ✅ App Name: CoachConnect

### Mobile Plugins Integrated
- ✅ StatusBar - Native status bar styling (green: #26a641)
- ✅ SplashScreen - Launch screen with 2-second display
- ✅ Keyboard - Smart keyboard handling for forms

### Permissions Configured
- ✅ **iOS (Info.plist):**
  - Camera access (for profile photos)
  - Photo Library read (for profile selection)
  - Photo Library write (for saving)

- ✅ **Android (AndroidManifest.xml):**
  - Internet access
  - Camera access
  - Read/Write external storage (profile photos)
  - Media images access (Android 13+)

### Build Configuration
- ✅ Vite configured to output to `dist/public/`
- ✅ Capacitor synced successfully
- ✅ Web assets copied to both platforms
- ✅ Native projects contain your latest build

---

## 🚀 Next Steps to App Store/Play Store

### 1. Set Up Development Environment

**For iOS (requires Mac):**
```bash
# Install Xcode from Mac App Store
# Install CocoaPods
sudo gem install cocoapods

# Navigate to iOS folder and install pods
cd ios/App
pod install
```

**For Android:**
```bash
# Install Android Studio from https://developer.android.com/studio
# Open Android Studio and install SDK Platform 34+
```

### 2. Configure Backend URL

Your app needs to know where your backend is. Update `capacitor.config.ts`:

**Option A: Development (testing on physical device)**
```typescript
server: {
  url: 'https://[your-replit-username]-[your-repl-name].replit.dev',
  cleartext: true,
}
```

**Option B: Production (after publishing on Replit)**
```typescript
server: {
  url: 'https://your-published-app.replit.app',
  cleartext: false,
}
```

### 3. Build and Test

**iOS:**
```bash
# From project root
npm run build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select a simulator or connected device
# 2. Click Play button to build and run
# 3. Test all features
```

**Android:**
```bash
# From project root
npm run build
npx cap sync android
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync
# 2. Select emulator or connected device
# 3. Click Run button
# 4. Test all features
```

### 4. Prepare App Assets

You'll need proper icons and splash screens. Quick way:

```bash
# Install Capacitor assets generator
npm install @capacitor/assets --save-dev

# Place a 1024x1024 icon.png in the root
# Run generator
npx capacitor-assets generate
```

Or manually add icons to:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- `android/app/src/main/res/mipmap-*/`

### 5. Configure for Production

**iOS - Xcode Settings:**
1. Open `ios/App/App.xcworkspace` (not .xcodeproj!)
2. Select your Team (Apple Developer Account)
3. Verify Bundle Identifier: `com.coachconnect.app`
4. Set Deployment Target: iOS 13.0+
5. Configure signing certificates

**Android - build.gradle:**
1. Update version codes in `android/app/build.gradle`
2. Set targetSdkVersion to 34+
3. Configure signing keys for release builds

### 6. Publish Your Backend

**CRITICAL:** Before submitting to app stores, publish your Replit backend:

1. Click "Publish" button in Replit
2. Wait for deployment
3. Get your production URL (e.g., `https://your-app.replit.app`)
4. Update `capacitor.config.ts` with this URL
5. Rebuild: `npm run build && npx cap sync`

### 7. Submit to App Stores

**iOS - App Store:**
1. Create app listing in [App Store Connect](https://appstoreconnect.apple.com)
2. In Xcode: Product → Archive
3. Upload to App Store Connect
4. Fill out app information, screenshots, privacy policy
5. Submit for review (usually 1-3 days)

**Android - Google Play:**
1. Create app in [Google Play Console](https://play.google.com/console)
2. In Android Studio: Build → Generate Signed Bundle
3. Upload AAB file
4. Fill out store listing, screenshots, privacy policy
5. Submit for review (usually 1-3 days)

---

## 📋 App Store Requirements Checklist

### Before Submitting:
- [ ] Backend is published and accessible
- [ ] `capacitor.config.ts` points to production URL
- [ ] App builds successfully on iOS simulator
- [ ] App builds successfully on Android emulator
- [ ] All features work in native app
- [ ] Authentication (Replit Auth) works
- [ ] Profile uploads work
- [ ] Booking requests work
- [ ] App icons are high quality (no placeholders!)
- [ ] Splash screens look good
- [ ] Screenshots prepared (iPhone and iPad for iOS, Phone and Tablet for Android)
- [ ] Privacy Policy URL ready
- [ ] App description written
- [ ] Age rating determined

### Apple-Specific:
- [ ] Apple Developer Program ($99/year)
- [ ] App Store Connect listing created
- [ ] TestFlight testing completed
- [ ] Privacy nutrition labels filled out

### Google-Specific:
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Content rating questionnaire completed
- [ ] Target API level 34+
- [ ] Privacy policy hosted online

---

## 🛠️ Useful Commands

```bash
# Build web app
npm run build

# Sync to native platforms
npx cap sync

# Open in IDE
npx cap open ios
npx cap open android

# Update plugins
npm install @capacitor/core@latest @capacitor/cli@latest
npx cap sync
```

---

## 🔍 Testing Checklist

Before submitting, test these flows on real devices:

- [ ] App launches without crashes
- [ ] Landing page displays correctly
- [ ] Browse coaches (public, no login)
- [ ] Sign up with Replit Auth
- [ ] Complete onboarding (athlete or coach)
- [ ] Coach: View dashboard
- [ ] Coach: Edit profile
- [ ] Athlete: Browse coaches
- [ ] Athlete: Send booking request
- [ ] Coach: Receive and manage requests
- [ ] Dark mode toggle works
- [ ] All images load properly
- [ ] Forms submit successfully
- [ ] Logout works

---

## 📚 Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **iOS Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **Android Guidelines:** https://material.io/design
- **App Store Review:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policy:** https://play.google.com/about/developer-content-policy/

---

## 💡 Pro Tips

1. **Test on Real Devices:** Simulators don't catch everything
2. **Beta Testing:** Use TestFlight (iOS) and Internal Testing (Android) before public release
3. **Version Bumps:** Increment version for every update
4. **Backend First:** Publish backend before submitting app updates
5. **Privacy Policy:** Required for apps with authentication - you'll need to create one

---

## 🆘 Common Issues & Solutions

**"Cannot connect to server"**
- Check `capacitor.config.ts` server URL
- Ensure backend is published and accessible
- Check CORS settings on backend

**"App crashes on startup"**
- Check Xcode/Android Studio logs
- Verify all Capacitor plugins installed correctly
- Run `npx cap sync` again

**"CocoaPods not found" (iOS)**
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

**"Gradle build failed" (Android)**
- Update Android Studio
- Sync Gradle files
- Clear cache: Build → Clean Project

---

You're all set! The hardest part is done. Now it's just:
1. Test locally
2. Publish backend
3. Build for iOS/Android
4. Submit to stores

Good luck with your launch! 🎉📱
