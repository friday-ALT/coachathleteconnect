# 🚀 Quick Start Guide - CoachConnect

## You're All Set! Here's How to Run Your App

### Option 1: Run on iOS Simulator (Mac Only)

```bash
# Terminal 1: Start backend
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2
npm run dev

# Terminal 2: Start mobile app
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
npx expo start --ios
```

### Option 2: Run on Physical Device with Expo Go

```bash
# Terminal 1: Start backend  
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2
npm run dev

# Terminal 2: Start mobile app
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
npx expo start
# Scan QR code with your phone's camera
```

### Option 3: Run on Android Emulator

```bash
# Terminal 1: Start backend
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2
npm run dev

# Terminal 2: Start mobile app
cd /Users/ethanpage/Documents/CoachAthleteConnect/DesignSyncMobile-2/mobile
npx expo start --android
```

## 🎯 What You Can Do Now

### Test the Complete Flow

1. **Sign Up**
   - Open the app → Click "Create Account"
   - Enter email/password → Sign up
   - Check email for verification link

2. **Choose Your Role**
   - Select "Athlete" or "Coach"
   - Complete onboarding steps

3. **As an Athlete**:
   - Browse coaches in the "Browse" tab
   - Tap a coach to view their profile
   - Send connection request
   - Once accepted, request a session
   - View sessions in "Sessions" tab

4. **As a Coach**:
   - View dashboard with stats
   - Check "Requests" for connection/session requests
   - Accept or decline requests
   - View connected athletes
   - Manage your schedule

5. **Switch Roles**:
   - Tap the swap icon in the header
   - Switch between athlete and coach mode seamlessly

## 📱 App Features

### ✅ Fully Implemented

- **Authentication**: Signup, login, email verification, password reset
- **Dual Roles**: Both athlete and coach profiles
- **Coach Discovery**: Search, filter, and browse coaches
- **Connections**: Send and manage connection requests
- **Session Booking**: Request and manage training sessions
- **Reviews**: Rating system (backend ready, UI integrated)
- **Profile Management**: Edit profiles for both roles
- **Role Switching**: Seamless mode switching

### 🎨 Design

- Native React Native (not WebView)
- Instagram-style UI
- Bottom tab navigation
- Smooth animations
- Professional color scheme
- Responsive on all screen sizes

## 🗂 Project Structure

```
DesignSyncMobile-2/
├── server/              # Express backend
│   ├── index.ts        # Server entry
│   └── routes.ts       # API endpoints
├── client/             # Web frontend (React)
├── mobile/             # Mobile app (React Native)
│   ├── app/           # Screens (Expo Router)
│   │   ├── (athlete)/ # Athlete mode tabs
│   │   ├── (coach)/   # Coach mode tabs
│   │   ├── auth/      # Auth screens
│   │   └── coach/     # Coach detail view
│   ├── components/    # Reusable components
│   ├── constants/     # Theme & config
│   ├── hooks/         # Custom hooks
│   ├── lib/           # API client
│   └── types/         # TypeScript types
├── migrations/        # Database migrations
└── shared/            # Shared types/schemas
```

## 🔧 Important Files

### Backend Configuration
- **`.env`**: Database credentials, port, secrets
- **`server/routes.ts`**: All API endpoints
- **`migrations/`**: Database schema

### Mobile App
- **`mobile/constants/config.ts`**: API URL configuration
- **`mobile/app.json`**: Expo configuration
- **`mobile/package.json`**: Dependencies
- **`mobile/README.md`**: Detailed mobile guide

## 📖 Documentation

- **`PRODUCTION_READY.md`**: Complete feature list and deployment guide
- **`APP_STORE_GUIDE.md`**: Step-by-step App Store submission
- **`mobile/README.md`**: Mobile development guide
- **`NATIVE_APP_GUIDE.md`**: Architecture overview

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

### Mobile App Issues

```bash
# Clear cache and restart
cd mobile
npx expo start --clear
```

### Database Issues

```bash
# Rerun migrations
npm run db:push
```

### Node Version Issues

```bash
# Check Node version (need 22.x)
node --version

# If wrong version, use nvm
nvm use 22
```

## 🚀 Next Steps

### For Development

1. **Test thoroughly** on iOS and Android
2. **Customize branding** (colors, app name, icons)
3. **Add features** as needed
4. **Test with real users**

### For Production

1. **Deploy backend** to production server
2. **Update API URL** in `mobile/constants/config.ts`
3. **Generate app icons** (1024x1024 for iOS, 512x512 for Android)
4. **Take screenshots** for app stores
5. **Write privacy policy**
6. **Build with EAS**: `eas build --platform all`
7. **Submit to stores**

See `APP_STORE_GUIDE.md` for detailed submission instructions.

## 💡 Tips

- **Use Expo Go** for quick testing during development
- **Test on real devices** to catch device-specific issues
- **Check API responses** using the web app or Postman
- **Monitor console logs** for errors
- **Keep backend running** when testing mobile app

## 🎉 You Did It!

Your app is **complete and production-ready**!

**What's included:**
- ✅ Full-featured native mobile app
- ✅ Express backend with Supabase
- ✅ Database with proper schemas
- ✅ Authentication system
- ✅ Dual role support
- ✅ All major features
- ✅ Professional UI/UX
- ✅ Complete documentation

**What's next:**
1. Test it out!
2. Customize if needed
3. Deploy to production
4. Submit to App Store/Play Store
5. Launch! 🚀

---

**Need Help?**
- Check the documentation files
- Review error messages in console
- Restart servers if things get stuck
- Clear Expo cache: `npx expo start --clear`

**Ready to Launch?**
- See `APP_STORE_GUIDE.md` for submission
- See `PRODUCTION_READY.md` for deployment checklist

---

Made with ❤️ - Your app is ready for the world!
