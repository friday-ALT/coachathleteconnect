# CoachConnect Mobile App - Build Guide

Your web app has been configured for native iOS and Android deployment using Capacitor!

## ✅ What's Been Set Up

1. **Capacitor Installed** - Native mobile framework
2. **iOS Platform Added** - Ready for App Store
3. **Android Platform Added** - Ready for Google Play
4. **Mobile Plugins** - StatusBar, SplashScreen, Keyboard
5. **Configuration** - App ID: `com.coachconnect.app`

---

## 📱 Building for iOS (Mac Required)

### Prerequisites:
- Mac computer with Xcode installed
- Apple Developer Account ($99/year)
- CocoaPods (`sudo gem install cocoapods`)

### Steps:

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync to iOS:**
   ```bash
   npx cap sync ios
   ```

3. **Open in Xcode:**
   ```bash
   npx cap open ios
   ```

4. **In Xcode:**
   - Select your Development Team (Apple Developer Account)
   - Update Bundle Identifier if needed: `com.coachconnect.app`
   - Set Deployment Target: iOS 13.0+
   - Configure App Icons & Launch Screen
   - Build and run on simulator or device

5. **For App Store:**
   - Archive the app (Product → Archive)
   - Upload to App Store Connect
   - Submit for review

---

## 🤖 Building for Android

### Prerequisites:
- Android Studio installed
- Java JDK 17+
- Google Play Developer Account ($25 one-time)

### Steps:

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync to Android:**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

4. **In Android Studio:**
   - Let Gradle sync complete
   - Update package name if needed: `com.coachconnect.app`
   - Configure app icons (res/mipmap)
   - Build and run on emulator or device

5. **For Google Play:**
   - Generate signed APK/AAB (Build → Generate Signed Bundle)
   - Upload to Google Play Console
   - Submit for review

---

## 🔧 Important Configuration

### Backend URL Configuration

Your app needs to connect to your backend. Update `capacitor.config.ts`:

**For Development (testing on device):**
```typescript
server: {
  url: 'https://your-replit-app.replit.dev',
  cleartext: true,
}
```

**For Production (after publishing):**
```typescript
server: {
  url: 'https://your-custom-domain.com',
  cleartext: false,
}
```

### App Icons & Splash Screens

You'll need to add:
- **iOS**: Add icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- **Android**: Add icons in `android/app/src/main/res/mipmap-*/`
- **Splash Screens**: Use `@capacitor/assets` to generate all sizes

Quick way to generate:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --iconBackgroundColor '#26a641' --splashBackgroundColor '#26a641'
```

---

## 🚀 Publishing Checklist

### Before Submitting:

- [ ] Test on real iOS device
- [ ] Test on real Android device  
- [ ] Configure backend URL for production
- [ ] Add proper app icons (all sizes)
- [ ] Add splash screens
- [ ] Set proper app version numbers
- [ ] Configure app permissions in Info.plist (iOS) and AndroidManifest.xml
- [ ] Test authentication flow
- [ ] Test all features work offline/online
- [ ] Screenshots for App Store/Play Store
- [ ] App description and marketing materials

### iOS Specific:
- [ ] Privacy policy URL
- [ ] App Store Connect listing
- [ ] TestFlight testing
- [ ] App Review submission

### Android Specific:
- [ ] Privacy policy URL
- [ ] Google Play Console listing
- [ ] Internal testing track
- [ ] Production release

---

## 📝 App Store Requirements

### Both Platforms Need:
- Privacy Policy (required for login/data collection)
- App Description
- Screenshots (multiple sizes)
- App Category
- Age Rating
- Support URL/Email

### iOS Specific Requirements:
- Apple Developer Program membership
- App uses standard Replit Auth (should be approved)
- Explain why you need:
  - Camera (if you add profile photos via camera)
  - Photo Library
  - Location (if you add location features)

### Android Specific Requirements:
- Google Play Developer account
- Content rating questionnaire
- Target API Level 34+ (latest Android)

---

## 🔄 Update Process

When you make changes to your web app:

1. Build the web app: `npm run build`
2. Sync changes: `npx cap sync`
3. Test in Xcode/Android Studio
4. Submit update to stores

---

## 🆘 Common Issues

**"Module not found"**
- Run `npm install` to ensure all packages are installed
- Run `npx cap sync` to update native projects

**"Unable to connect to backend"**
- Check `server.url` in `capacitor.config.ts`
- Ensure backend is published and accessible
- Check CORS settings on backend

**"App crashes on launch"**
- Check Xcode/Android Studio console for errors
- Verify all Capacitor plugins are properly installed
- Run `npx cap sync` again

---

## 💡 Next Steps

1. **Test Locally First**
   - Build and test on iOS simulator
   - Build and test on Android emulator
   - Fix any issues

2. **Publish Backend**
   - Deploy your Replit backend
   - Get production URL
   - Update `capacitor.config.ts`

3. **Prepare Assets**
   - Create app icon (1024x1024px)
   - Generate all required sizes
   - Create splash screen

4. **Submit to Stores**
   - Follow iOS checklist above
   - Follow Android checklist above
   - Wait for approval (1-7 days typically)

---

## 📞 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

---

Good luck with your app launch! 🚀
