# App Store Submission Guide

## 📱 App Store (iOS)

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com

2. **Required Information**:
   - App name: CoachConnect
   - Primary category: Health & Fitness
   - Secondary category: Sports
   - Age rating: 4+
   - Privacy policy URL
   - Support URL/email

### Screenshots Required

**iPhone (6.7" Display) - Required**:
- 1290 x 2796 pixels
- Minimum 3 screenshots, maximum 10

**iPhone (6.5" Display)** - Recommended:
- 1242 x 2688 pixels

**iPad Pro (12.9" Display)** - Optional:
- 2048 x 2732 pixels

### App Icon

- 1024 x 1024 pixels
- No transparency
- No rounded corners (iOS adds them)
- PNG format

### Build Process

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Create production build
eas build --platform ios --profile production
```

### Submission Steps

1. **Create App in App Store Connect**:
   - Go to https://appstoreconnect.apple.com
   - Click "My Apps" → "+" → "New App"
   - Fill in app information
   - Bundle ID: `com.coachconnect.app`

2. **Upload Build**:
   - Download IPA from EAS build
   - Upload using Transporter app
   - Or submit directly with: `eas submit --platform ios`

3. **Fill App Information**:
   - App name and description
   - Keywords
   - Screenshots
   - Privacy policy
   - Support URL
   - Marketing URL (optional)

4. **Set Pricing and Availability**:
   - Choose free or paid
   - Select countries
   - Set release date

5. **Submit for Review**:
   - Complete all required fields
   - Answer questionnaire
   - Add notes for reviewer
   - Submit

### Review Time
- Average: 1-3 days
- Can take up to 2 weeks

---

## 🤖 Google Play Store (Android)

### Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console

2. **Required Information**:
   - App name: CoachConnect
   - Short description (80 chars)
   - Full description (4000 chars)
   - Category: Health & Fitness
   - Content rating
   - Privacy policy URL

### Screenshots Required

**Phone**:
- Minimum 2 screenshots
- JPEG or 24-bit PNG (no alpha)
- Min: 320px
- Max: 3840px
- Aspect ratio: 16:9 to 9:16

**Tablet** (Optional):
- 7-inch: 1024 x 600px
- 10-inch: 1280 x 800px

### Feature Graphic

- 1024 x 500 pixels
- JPEG or 24-bit PNG
- Required

### App Icon

- 512 x 512 pixels
- 32-bit PNG with alpha
- Required

### Build Process

```bash
# Create production build
eas build --platform android --profile production
```

### Submission Steps

1. **Create App in Play Console**:
   - Go to https://play.google.com/console
   - Click "Create app"
   - Fill in app details
   - Package name: `com.coachconnect.app`

2. **Upload Build**:
   - Download AAB from EAS build
   - Upload to "Production" track
   - Or submit directly with: `eas submit --platform android`

3. **Fill Store Listing**:
   - App name and description
   - Screenshots and graphics
   - Categorization
   - Contact details
   - Privacy policy

4. **Content Rating**:
   - Complete questionnaire
   - Select appropriate rating

5. **Set Pricing & Distribution**:
   - Choose free or paid
   - Select countries
   - Opt in to Google Play for Families (optional)

6. **Submit for Review**:
   - Complete all required sections
   - Submit for review

### Review Time
- Average: 1-3 days
- Can take up to 7 days

---

## 📝 Pre-Submission Checklist

### Both Platforms

- [ ] App works on both platforms without crashes
- [ ] All API endpoints are production-ready
- [ ] Environment variables configured for production
- [ ] Privacy policy created and hosted
- [ ] Support email/URL set up
- [ ] App tested on multiple devices
- [ ] All images optimized (compressed)
- [ ] App description written (compelling copy)
- [ ] Keywords researched and selected
- [ ] Age rating determined
- [ ] Content warnings reviewed
- [ ] Terms of service created (if applicable)

### iOS Specific

- [ ] App tested on latest iOS version
- [ ] App tested on different iPhone sizes
- [ ] iPad version tested (if supporting tablets)
- [ ] Push notifications configured (if using)
- [ ] In-app purchases set up (if applicable)
- [ ] Apple Developer account active

### Android Specific

- [ ] App tested on Android 8.0+ (API 26+)
- [ ] App tested on different screen sizes
- [ ] Tablet layout tested (if applicable)
- [ ] Google Play services configured
- [ ] Content rating questionnaire completed
- [ ] Google Play Developer account active

---

## 🎨 App Store Assets Needed

### App Description Template

**Short Description (iOS: Subtitle, Android: Short Description)**:
```
Connect with expert coaches for personalized training
```

**Full Description**:
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

### Keywords (iOS, 100 chars max)
```
coach,trainer,fitness,sports,training,athlete,workout,personal trainer,coaching,sports training
```

### Category & Sub-category

**iOS**:
- Primary: Health & Fitness
- Secondary: Sports

**Android**:
- Category: Health & Fitness
- Type: Application

---

## 🚀 Post-Launch

### Monitoring

1. **Download Expo Orbit** for easy build management
2. **Set up analytics** (Expo Analytics, Google Analytics, Mixpanel)
3. **Monitor crash reports** (Expo Application Services)
4. **Track user feedback** in store reviews
5. **Monitor app performance** metrics

### Updates

**Over-The-Air (OTA) Updates**:
```bash
# For minor updates (no native code changes)
eas update --branch production --message "Bug fixes and improvements"
```

**Full Builds**:
```bash
# For major updates with native changes
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Version Management

- **iOS**: Increment `buildNumber` in app.json
- **Android**: Increment `versionCode` in app.json
- **Both**: Update `version` string (1.0.0 → 1.0.1)

---

## 📞 Support & Resources

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **Apple Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/

---

## ⚠️ Common Rejection Reasons

### iOS

1. App crashes or has significant bugs
2. Incomplete information in App Store Connect
3. Missing privacy policy
4. Using private APIs
5. Inaccurate metadata or screenshots
6. Performance issues

### Android

1. App crashes on launch
2. Missing required permissions explanations
3. Privacy policy issues
4. Inappropriate content
5. Deceptive behavior
6. Broken functionality

---

## 💡 Tips for Success

1. **Test Thoroughly**: Test on multiple devices and OS versions
2. **High-Quality Assets**: Use professional screenshots and icons
3. **Clear Description**: Make your app's value proposition clear
4. **Respond to Reviews**: Engage with users in store reviews
5. **Regular Updates**: Release updates regularly to show active development
6. **App Store Optimization (ASO)**: Research keywords and optimize listing
7. **Prepare for Rejection**: Have a plan to address common issues quickly

Good luck with your app submission! 🎉
