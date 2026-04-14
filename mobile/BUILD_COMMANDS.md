# Build Commands Quick Reference

## 🚀 Essential Commands

### First Time Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS for your project
eas build:configure
```

### Build for Production
```bash
# Build for both iOS and Android
eas build --platform all --profile production

# Build iOS only
eas build --platform ios --profile production

# Build Android only
eas build --platform android --profile production

# Build with cache cleared (if issues)
eas build --platform all --profile production --clear-cache
```

### Submit to App Stores
```bash
# Submit to both stores
eas submit --platform all

# Submit iOS only
eas submit --platform ios

# Submit Android only
eas submit --platform android
```

### Check Build Status
```bash
# List all builds
eas build:list

# View specific build details
eas build:view [build-id]

# View latest build
eas build:view

# Cancel a running build
eas build:cancel [build-id]
```

### Development Builds
```bash
# Preview build (for internal testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Development build (with dev client)
eas build --platform ios --profile development
eas build --platform android --profile development
```

### Updates (After Initial Release)
```bash
# Push OTA update (JavaScript changes only)
eas update --branch production --message "Bug fixes and improvements"

# Check update status
eas update:list

# View update details
eas update:view [update-id]
```

### Project Management
```bash
# View project information
eas project:info

# View credentials
eas credentials

# Configure credentials
eas credentials:configure
```

## 🧪 Testing Commands

### Local Testing
```bash
# Start Expo dev server
npx expo start

# Start on iOS simulator
npx expo start --ios

# Start on Android emulator
npx expo start --android

# Start with cache cleared
npx expo start --clear

# Start in production mode
npx expo start --no-dev --minify
```

### TestFlight (iOS Beta Testing)
```bash
# Build for TestFlight
eas build --platform ios --profile production

# Then distribute via App Store Connect:
# 1. Go to App Store Connect
# 2. Select your app
# 3. Go to TestFlight tab
# 4. Add build to testing group
# 5. Invite testers
```

### Internal Testing (Android)
```bash
# Submit to internal track
eas submit --platform android

# In Google Play Console:
# 1. Select "Internal testing" track
# 2. Create release
# 3. Add testers
# 4. Publish
```

## 🔧 Configuration Commands

### Update App Version
```bash
# Edit app.json manually, then:
# iOS: increment "buildNumber"
# Android: increment "versionCode"
# Both: increment "version" (e.g., 1.0.0 → 1.0.1)
```

### Environment Variables
```bash
# Set environment variables in eas.json:
# "production": {
#   "env": {
#     "WEB_URL": "https://your-api.com"
#   }
# }
```

### Clean & Rebuild
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start --clear

# Clear EAS build cache
eas build --platform all --profile production --clear-cache
```

## 📊 Monitoring Commands

### Logs & Debugging
```bash
# View build logs
eas build:view [build-id]

# View update logs
eas update:view [update-id]

# View project logs
eas project:logs
```

### Analytics
```bash
# View build analytics
eas build:list --limit 20

# View update analytics
eas update:list --limit 20
```

## 🐛 Troubleshooting Commands

### Build Issues
```bash
# Check build status
eas build:list

# View detailed build logs
eas build:view [build-id]

# Retry failed build
eas build --platform [ios|android] --profile production

# Clear cache and rebuild
eas build --platform all --profile production --clear-cache
```

### Submission Issues
```bash
# Check submission status
eas submit:list

# Resubmit
eas submit --platform [ios|android]
```

### Update Issues
```bash
# Check update status
eas update:list

# Rollback to previous update
eas update:rollback

# Delete update
eas update:delete [update-id]
```

## 📱 Device Testing

### iOS
```bash
# Install on connected iOS device
npx expo run:ios --device

# Install specific build on device
# Download IPA from EAS, then use Xcode or Apple Configurator
```

### Android
```bash
# Install on connected Android device
npx expo run:android --device

# Install APK directly
adb install path/to/app.apk
```

## 🔐 Credentials Management

### iOS Credentials
```bash
# View iOS credentials
eas credentials --platform ios

# Configure iOS credentials
eas credentials:configure --platform ios

# Generate new push notification key
eas credentials --platform ios --generate-push-key
```

### Android Credentials
```bash
# View Android credentials
eas credentials --platform android

# Configure Android credentials
eas credentials:configure --platform android

# Generate new keystore
eas credentials --platform android --generate-keystore
```

## 📦 Build Profiles

### Available Profiles (from eas.json)

**development:**
- Development client enabled
- Internal distribution
- For testing native modules

**preview:**
- Internal distribution
- iOS simulator support
- For internal testing

**production:**
- Production-ready build
- For App Store submission
- Optimized and minified

## 🎯 Common Workflows

### Initial App Store Submission
```bash
# 1. Configure
eas build:configure

# 2. Build
eas build --platform all --profile production

# 3. Submit
eas submit --platform all

# 4. Configure store listings in web consoles
```

### App Update (JavaScript Only)
```bash
# For minor updates without native changes
eas update --branch production --message "Bug fixes"
```

### App Update (With Native Changes)
```bash
# 1. Update version in app.json
# 2. Build new version
eas build --platform all --profile production

# 3. Submit new version
eas submit --platform all
```

### Beta Testing
```bash
# 1. Build preview version
eas build --platform all --profile preview

# 2. Distribute via TestFlight (iOS) or Internal Testing (Android)
```

## 📋 Pre-Build Checklist

Before running `eas build`:

- [ ] Backend deployed to production
- [ ] Production URL updated in app.json
- [ ] Production URL updated in eas.json
- [ ] App version incremented (if update)
- [ ] All dependencies installed (`npm install`)
- [ ] App tested locally
- [ ] No console errors
- [ ] Demo login tested

## 🎉 Success Commands

After successful submission:

```bash
# Check app status
eas build:list
eas submit:list

# Monitor updates
eas update:list

# View project info
eas project:info
```

## 💡 Pro Tips

1. **Build both platforms at once** to save time:
   ```bash
   eas build --platform all --profile production
   ```

2. **Use preview builds** for testing before production:
   ```bash
   eas build --platform all --profile preview
   ```

3. **Check build logs** if build fails:
   ```bash
   eas build:view [build-id]
   ```

4. **Use OTA updates** for quick fixes after launch:
   ```bash
   eas update --branch production --message "Hotfix"
   ```

5. **Test on real devices** before submitting:
   - iOS: Use TestFlight
   - Android: Use Internal Testing

## 🆘 Emergency Commands

### Cancel Build
```bash
eas build:cancel [build-id]
```

### Rollback Update
```bash
eas update:rollback
```

### Clear All Caches
```bash
# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo start --clear

# Clear EAS build cache
eas build --platform all --profile production --clear-cache
```

## 📞 Get Help

- **Expo Docs**: https://docs.expo.dev
- **EAS Docs**: https://docs.expo.dev/eas/
- **Discord**: https://chat.expo.dev
- **Forums**: https://forums.expo.dev

---

## Quick Reference Card

**Build:**
```bash
cd mobile && eas build --platform all --profile production
```

**Submit:**
```bash
cd mobile && eas submit --platform all
```

**Update:**
```bash
cd mobile && eas update --branch production --message "Updates"
```

**Status:**
```bash
eas build:list
```

---

**Demo Credentials:**
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

---

**You're ready! 🚀**
