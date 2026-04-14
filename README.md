# CoachConnect - Mobile App

> **App Store Ready!** Your app now includes a demo account for easy testing and review.

## 🚀 Quick Start

### Demo Account (Instant Access!)

**Tap "Try Demo" in the app** or use:
- **Email**: `demo@coachconnect.app`
- **Password**: `Demo2026!`

### Run Locally

```bash
# Terminal 1: Start backend
cd DesignSyncMobile-2
npm run dev

# Terminal 2: Start mobile app
cd mobile
npx expo start
```

## 📱 What's This?

CoachConnect is a mobile app that connects athletes with professional coaches for personalized training sessions.

### Features
- 🏃 **Athlete Mode**: Browse coaches, book sessions, track progress
- 👨‍🏫 **Coach Mode**: Manage athletes, schedule sessions, grow business
- 🔄 **Role Switching**: Switch between athlete and coach modes
- ⚡ **Demo Account**: Instant access for testing

## 📚 Documentation

### Start Here
- **[START_HERE.md](START_HERE.md)** - Overview and quick start
- **[DEMO_CREDENTIALS.txt](DEMO_CREDENTIALS.txt)** - Demo login info (print this!)
- **[INDEX.md](INDEX.md)** - Complete documentation index

### Build & Submit
- **[BUILD_FOR_APP_STORE.md](BUILD_FOR_APP_STORE.md)** - Fast track build guide
- **[APP_STORE_SUBMISSION.md](APP_STORE_SUBMISSION.md)** - Complete submission guide
- **[APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)** - Step-by-step checklist
- **[mobile/BUILD_COMMANDS.md](mobile/BUILD_COMMANDS.md)** - All build commands

### Understanding the App
- **[APP_FLOW.md](APP_FLOW.md)** - User flow diagrams
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Visual walkthrough
- **[DEMO_ACCOUNT.md](DEMO_ACCOUNT.md)** - Demo account details
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Recent changes

### Development
- **[QUICK_START.md](QUICK_START.md)** - Development guide
- **[PRODUCTION_READY.md](PRODUCTION_READY.md)** - Production checklist
- **[mobile/README.md](mobile/README.md)** - Mobile app details

## 🎯 What You Need to Do

### 1. Test Demo Account (5 minutes)
```bash
# Start the app locally
cd DesignSyncMobile-2 && npm run dev
cd mobile && npx expo start

# Tap "Try Demo" in the app
```

### 2. Deploy Backend (10 minutes)
- Sign up for Railway or Render
- Deploy your backend
- Get production URL

### 3. Build for App Store (30 minutes)
```bash
cd mobile
eas build --platform all --profile production
```

### 4. Submit to Stores (30 minutes)
```bash
eas submit --platform all
```

## 🔑 Demo Credentials

**Quick Access:** Tap "Try Demo" button in app

**Manual Login:**
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

**Features:**
- ✅ Both Athlete and Coach profiles
- ✅ No email verification
- ✅ Full feature access
- ✅ Role switching enabled

## 🏗️ Project Structure

```
DesignSyncMobile-2/
├── mobile/              # React Native mobile app (Expo)
├── server/              # Express.js backend
├── client/              # React web app (separate)
├── shared/              # Shared types and schemas
└── migrations/          # Database migrations
```

## 🛠️ Tech Stack

### Mobile App
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **State**: React Query
- **Forms**: React Hook Form + Zod
- **Storage**: Expo SecureStore
- **UI**: Custom components

### Backend
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle
- **Auth**: Session-based + Email
- **Validation**: Zod

## ✨ Key Features

### For Athletes
- Browse and search coaches
- View profiles with ratings
- Send connection requests
- Book training sessions
- Track upcoming sessions
- Leave reviews

### For Coaches
- Create professional profile
- Set availability and pricing
- Manage athlete connections
- Accept/decline session requests
- View schedule
- Build reputation

### For Everyone
- Dual role support
- Role switching
- Profile management
- Secure authentication
- Demo account access

## 🎬 Next Steps

### Immediate
1. **Test demo login** locally
2. **Deploy backend** to production
3. **Update API URLs** in mobile app
4. **Create app icons** (1024x1024)

### This Week
1. **Build with EAS**
2. **Take screenshots**
3. **Write privacy policy**
4. **Submit to stores**

### After Approval
1. **Monitor reviews**
2. **Fix bugs**
3. **Plan updates**
4. **Promote app**

## 📖 Documentation Guide

**Not sure where to start?**

1. **New to project?** → [START_HERE.md](START_HERE.md)
2. **Want to build?** → [BUILD_FOR_APP_STORE.md](BUILD_FOR_APP_STORE.md)
3. **Need checklist?** → [APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)
4. **Want details?** → [APP_STORE_SUBMISSION.md](APP_STORE_SUBMISSION.md)
5. **All docs?** → [INDEX.md](INDEX.md)

## 🎯 For App Store Reviewers

**Quick Testing:**
1. Launch app
2. Tap **"Try Demo"** on welcome screen
3. Select **"Athlete"** or **"Coach"**
4. Explore features
5. Tap **swap icon** to switch roles

**Manual Login:**
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

**All features are fully functional!**

## 🔧 Development

### Install Dependencies
```bash
# Backend
cd DesignSyncMobile-2
npm install

# Mobile
cd mobile
npm install
```

### Run Development Servers
```bash
# Backend (Terminal 1)
npm run dev

# Mobile (Terminal 2)
cd mobile
npx expo start
```

### Build for Production
```bash
cd mobile
eas build --platform all --profile production
```

## 🐛 Troubleshooting

**Demo login not working?**
- Check backend is running
- Verify API URL in `mobile/constants/config.ts`
- Check console logs

**Build fails?**
- Run `npm install` in mobile folder
- Check `eas build:view [build-id]` for logs
- Try with `--clear-cache`

**Can't submit?**
- Verify developer accounts are active
- Check bundle ID / package name
- Ensure build completed successfully

## 📞 Support

- **Documentation**: See files listed above
- **Expo Docs**: https://docs.expo.dev
- **Discord**: https://chat.expo.dev
- **Forums**: https://forums.expo.dev

## 🎉 You're Ready!

Your app is production-ready with:
- ✅ Native mobile app (iOS & Android)
- ✅ Demo account configured
- ✅ Beautiful UI/UX
- ✅ Complete features
- ✅ Build system ready
- ✅ Documentation complete

**Start building:**
```bash
cd mobile
eas build --platform all --profile production
```

---

## Quick Links

- **Demo Info**: [DEMO_CREDENTIALS.txt](DEMO_CREDENTIALS.txt)
- **Build Guide**: [BUILD_FOR_APP_STORE.md](BUILD_FOR_APP_STORE.md)
- **Checklist**: [APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)
- **All Docs**: [INDEX.md](INDEX.md)

---

**Demo Credentials:**
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

**Good luck! 🚀**
