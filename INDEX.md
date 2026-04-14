# CoachConnect Documentation Index

## 🎯 Start Here

**New to this project?** → Read **[START_HERE.md](START_HERE.md)**

**Ready to build?** → Follow **[BUILD_FOR_APP_STORE.md](BUILD_FOR_APP_STORE.md)**

**Need demo credentials?** → Check **[DEMO_CREDENTIALS.txt](DEMO_CREDENTIALS.txt)**

## 📚 Documentation Overview

### Quick Reference (Read These First!)

| File | Purpose | Time to Read |
|------|---------|--------------|
| **[START_HERE.md](START_HERE.md)** | Overview and getting started | 5 min |
| **[DEMO_CREDENTIALS.txt](DEMO_CREDENTIALS.txt)** | Demo login credentials | 1 min |
| **[BUILD_FOR_APP_STORE.md](BUILD_FOR_APP_STORE.md)** | Fast track build guide | 10 min |
| **[APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)** | Step-by-step checklist | 15 min |

### Detailed Guides

| File | Purpose | Time to Read |
|------|---------|--------------|
| **[APP_STORE_SUBMISSION.md](APP_STORE_SUBMISSION.md)** | Complete submission guide | 30 min |
| **[DEMO_ACCOUNT.md](DEMO_ACCOUNT.md)** | Demo account details | 10 min |
| **[APP_FLOW.md](APP_FLOW.md)** | App flow and diagrams | 10 min |
| **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** | What changed in this update | 10 min |

### Technical Reference

| File | Purpose | Time to Read |
|------|---------|--------------|
| **[mobile/BUILD_COMMANDS.md](mobile/BUILD_COMMANDS.md)** | All build commands | 15 min |
| **[mobile/APP_STORE_GUIDE.md](mobile/APP_STORE_GUIDE.md)** | Original store guide | 20 min |
| **[PRODUCTION_READY.md](PRODUCTION_READY.md)** | Production checklist | 15 min |
| **[QUICK_START.md](QUICK_START.md)** | Development quick start | 10 min |

## 🎯 By Use Case

### "I want to test the demo account"
1. Read: **[DEMO_CREDENTIALS.txt](DEMO_CREDENTIALS.txt)**
2. Follow: **[QUICK_START.md](QUICK_START.md)** to run locally
3. Tap "Try Demo" in the app

### "I want to build for App Store"
1. Read: **[BUILD_FOR_APP_STORE.md](BUILD_FOR_APP_STORE.md)**
2. Use: **[APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)**
3. Reference: **[mobile/BUILD_COMMANDS.md](mobile/BUILD_COMMANDS.md)**

### "I want to submit to App Store"
1. Read: **[APP_STORE_SUBMISSION.md](APP_STORE_SUBMISSION.md)**
2. Use: **[APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)**
3. Copy demo credentials from: **[DEMO_CREDENTIALS.txt](DEMO_CREDENTIALS.txt)**

### "I want to understand what changed"
1. Read: **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)**
2. Review: **[APP_FLOW.md](APP_FLOW.md)**
3. Check: Modified files list below

### "I want to customize the demo account"
1. Edit: `server/demoAuth.ts`
2. Read: **[DEMO_ACCOUNT.md](DEMO_ACCOUNT.md)**
3. Test: Follow **[QUICK_START.md](QUICK_START.md)**

## 📁 Project Structure

```
DesignSyncMobile-2/
│
├── 📄 START_HERE.md                    ← Start here!
├── 📄 DEMO_CREDENTIALS.txt             ← Print this!
├── 📄 BUILD_FOR_APP_STORE.md          ← Build guide
├── 📄 APP_STORE_SUBMISSION.md         ← Submission guide
├── 📄 APP_STORE_CHECKLIST.md          ← Checklist
├── 📄 DEMO_ACCOUNT.md                 ← Demo info
├── 📄 APP_FLOW.md                     ← Flow diagrams
├── 📄 CHANGES_SUMMARY.md              ← What changed
├── 📄 INDEX.md                        ← This file
│
├── 📁 mobile/                          Mobile app
│   ├── 📄 BUILD_COMMANDS.md           ← Build commands
│   ├── 📄 APP_STORE_GUIDE.md          ← Store guide
│   ├── 📄 README.md                   ← Mobile readme
│   ├── app.json                       ← App config
│   ├── eas.json                       ← Build config
│   │
│   ├── 📁 app/                        Screens
│   │   ├── welcome.tsx                ← "Try Demo" button
│   │   ├── auth/
│   │   │   └── login.tsx              ← Demo login button
│   │   ├── (athlete)/                 Athlete screens
│   │   └── (coach)/                   Coach screens
│   │
│   └── 📁 lib/
│       └── api.ts                     ← Demo login API
│
├── 📁 server/                          Backend
│   ├── demoAuth.ts                    ← Demo credentials
│   ├── emailAuth.ts                   ← Demo login logic
│   └── demoSeed.ts                    ← Seed demo user
│
└── 📁 client/                          Web app (separate)
```

## 🎯 Quick Actions

### Test Demo Login Locally
```bash
# Terminal 1
cd DesignSyncMobile-2
npm run dev

# Terminal 2
cd mobile
npx expo start
```
Then tap "Try Demo" in the app.

### Build for App Store
```bash
cd mobile
eas build --platform all --profile production
```

### Submit to Stores
```bash
cd mobile
eas submit --platform all
```

### Push Update (After Launch)
```bash
cd mobile
eas update --branch production --message "Bug fixes"
```

## 🔑 Demo Credentials

**Email:** `demo@coachconnect.app`
**Password:** `Demo2026!`

**Or tap "Try Demo" button in the app!**

## ✅ What's Ready

- ✅ Demo account configured
- ✅ "Try Demo" buttons added
- ✅ Backend supports demo login
- ✅ Mobile app updated
- ✅ Production build config
- ✅ EAS configuration
- ✅ Complete documentation

## 📋 Recommended Reading Order

### For First-Time Users
1. **[START_HERE.md](START_HERE.md)** - Overview
2. **[DEMO_CREDENTIALS.txt](DEMO_CREDENTIALS.txt)** - Credentials
3. **[QUICK_START.md](QUICK_START.md)** - Run locally
4. Test the demo account

### For App Store Submission
1. **[BUILD_FOR_APP_STORE.md](BUILD_FOR_APP_STORE.md)** - Build guide
2. **[APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)** - Checklist
3. **[mobile/BUILD_COMMANDS.md](mobile/BUILD_COMMANDS.md)** - Commands
4. **[APP_STORE_SUBMISSION.md](APP_STORE_SUBMISSION.md)** - Details

### For Understanding Changes
1. **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - What changed
2. **[APP_FLOW.md](APP_FLOW.md)** - Flow diagrams
3. **[DEMO_ACCOUNT.md](DEMO_ACCOUNT.md)** - Demo details

## 🎓 Learning Path

### Beginner
1. Read START_HERE.md
2. Test demo locally
3. Explore the app
4. Read QUICK_START.md

### Intermediate
1. Deploy backend to production
2. Update API URLs
3. Build with EAS
4. Test production build

### Advanced
1. Submit to App Store
2. Configure store listings
3. Monitor analytics
4. Plan updates

## 🔍 Find What You Need

### By Topic

**Demo Account:**
- DEMO_CREDENTIALS.txt
- DEMO_ACCOUNT.md
- CHANGES_SUMMARY.md

**Building:**
- BUILD_FOR_APP_STORE.md
- mobile/BUILD_COMMANDS.md
- APP_STORE_CHECKLIST.md

**Submission:**
- APP_STORE_SUBMISSION.md
- APP_STORE_CHECKLIST.md
- mobile/APP_STORE_GUIDE.md

**Development:**
- QUICK_START.md
- mobile/README.md
- PRODUCTION_READY.md

**Understanding:**
- START_HERE.md
- APP_FLOW.md
- CHANGES_SUMMARY.md

## 🎯 Common Questions

**Q: How do I test the demo account?**
A: Read DEMO_CREDENTIALS.txt, then follow QUICK_START.md

**Q: How do I build for App Store?**
A: Follow BUILD_FOR_APP_STORE.md step by step

**Q: What are the demo credentials?**
A: Email: demo@coachconnect.app, Password: Demo2026!

**Q: How do I submit to App Store?**
A: Follow APP_STORE_SUBMISSION.md and use APP_STORE_CHECKLIST.md

**Q: Can I change the demo password?**
A: Yes! Edit server/demoAuth.ts

**Q: How do I update the app after launch?**
A: Use `eas update` for JS changes, or rebuild for native changes

## 📞 Support

### Documentation
All guides are in this folder - check the list above!

### External Resources
- **Expo**: https://docs.expo.dev
- **EAS**: https://docs.expo.dev/eas/
- **App Store**: https://appstoreconnect.apple.com
- **Play Store**: https://play.google.com/console

### Community
- **Discord**: https://chat.expo.dev
- **Forums**: https://forums.expo.dev
- **Stack Overflow**: Tag `expo`

## 🎉 You're Ready!

Everything is configured and documented.

**Next step:** Choose your path above and start building!

---

**Quick Start:**
```bash
cd mobile
eas build --platform all --profile production
```

**Demo Credentials:**
- Email: `demo@coachconnect.app`
- Password: `Demo2026!`

**Good luck! 🚀**
