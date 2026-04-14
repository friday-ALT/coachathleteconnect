# How to Run CoachConnect Locally

## 🚨 Important: You Have 3 Options

### Option 1: Expo Go App (Easiest - Recommended for Testing)

**What is Expo Go?**
- Free app from the App Store
- Lets you test React Native apps instantly
- No build required!

**Steps:**

1. **Install Expo Go on your iPhone:**
   - Open App Store
   - Search "Expo Go"
   - Install the app

2. **Start the Expo server:**
   ```bash
   cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
   npx expo start
   ```

3. **Scan the QR code:**
   - Open Expo Go app on your phone
   - Tap "Scan QR Code"
   - Point camera at QR code in terminal
   - App will load on your phone!

4. **Test the demo:**
   - Tap "Try Demo" button
   - Explore the app!

### Option 2: iOS Simulator (Mac Only)

**Requirements:**
- Xcode installed
- iOS Simulator

**Steps:**

1. **Install Xcode** (if not installed):
   - Open App Store
   - Search "Xcode"
   - Install (this is large, ~15GB)

2. **Start Expo and open in simulator:**
   ```bash
   cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
   npx expo start
   ```
   
3. **Press `i` in the terminal** to open iOS simulator

4. **Test the demo:**
   - Tap "Try Demo" button
   - Explore the app!

### Option 3: Development Build (For Production Testing)

**When to use:**
- Testing production features
- Need native modules
- Preparing for App Store

**Steps:**

1. **Create development build:**
   ```bash
   cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
   eas build --profile development --platform ios
   ```

2. **Wait for build** (10-15 minutes)

3. **Install on device:**
   - Download IPA from EAS
   - Install via Xcode or TestFlight

## 🎯 Recommended: Use Expo Go

For quick testing of the demo account, **Option 1 (Expo Go)** is the fastest and easiest!

**Download Expo Go:**
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

## 🚀 Quick Start Commands

```bash
# Terminal 1: Backend (keep this running)
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2
npm run dev

# Terminal 2: Mobile App (keep this running)
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
npx expo start
```

Then:
- **With Expo Go**: Scan QR code with Expo Go app
- **With Simulator**: Press `i` for iOS or `a` for Android
- **With Device**: Install development build first

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Then restart
npx expo start
```

### "No development build installed"
- This means you need Option 1 (Expo Go) or Option 3 (Development Build)
- **Easiest**: Download Expo Go app and scan QR code

### "Can't connect to backend"
- Make sure backend is running on port 3000
- Check: http://localhost:3000
- Restart backend if needed

## 📱 Testing the Demo Account

Once the app loads:

1. **You'll see the Welcome Screen**
2. **Tap "Try Demo" button** (green border, flash icon)
3. **Select "Athlete" or "Coach"**
4. **Explore the app!**

**Demo Credentials** (if you need manual login):
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

## 🎯 For App Store Build (Not Local Testing)

When you're ready to build for the App Store:

```bash
# This creates a production build
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
eas build --platform all --profile production
```

This is different from local testing - it creates the actual app file (.ipa/.aab) for submission.

## 💡 Summary

**For local testing:**
- Use **Expo Go app** (easiest!)
- Or use **iOS Simulator** (if you have Xcode)

**For App Store:**
- Use **`eas build --profile production`**
- This creates the final app files

**Current error you had:**
- You tried to open in simulator without Expo Go or development build
- Solution: Install Expo Go app OR use iOS Simulator

## 📞 Need Help?

1. **Download Expo Go** - Easiest way to test
2. **Follow commands above** - Step by step
3. **Check documentation** - See START_HERE.md

---

**Quick Fix: Install Expo Go on your iPhone and scan the QR code!**

Download: https://apps.apple.com/app/expo-go/id982107779
