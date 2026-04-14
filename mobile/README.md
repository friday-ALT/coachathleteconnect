# CoachConnect Mobile App

A fully-featured React Native mobile application for connecting athletes with coaches, built with Expo and TypeScript.

## 📱 Features

### For Athletes
- **Browse Coaches**: Search and filter coaches by name, location, and skill level
- **Coach Profiles**: View detailed coach profiles with ratings, experience, and pricing
- **Connection Requests**: Send and manage connection requests with coaches
- **Session Booking**: Request training sessions with accepted coaches
- **Session Management**: View and manage upcoming, pending, and declined sessions
- **Profile Management**: Manage athlete profile with skill level, location, and contact info

### For Coaches
- **Dashboard**: Overview of athletes, requests, and upcoming sessions
- **Request Management**: Accept or decline connection and session requests from athletes
- **Schedule Management**: View and manage training schedule
- **Profile Management**: Manage coach profile with experience, pricing, and availability
- **Athlete Connections**: View and manage connected athletes

### Dual Role Support
- Users can have both athlete and coach profiles
- Easy mode switching between athlete and coach roles
- Role-specific navigation and features

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI**: Custom components with React Native primitives
- **Icons**: Expo Vector Icons (Ionicons)
- **Secure Storage**: Expo SecureStore
- **API Client**: Axios

## 📋 Prerequisites

- Node.js 22.x or higher
- npm or yarn
- Expo Go app (for testing on physical device)
- iOS Simulator (Mac only) or Android Emulator

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

Update `mobile/constants/config.ts` with your backend API URL:

```typescript
export const API_URL = 'http://YOUR_IP_ADDRESS:3000';
```

For local development:
- iOS Simulator: Use `http://localhost:3000`
- Android Emulator: Use `http://10.0.2.2:3000`
- Physical Device: Use your computer's local IP address (e.g., `http://192.168.1.100:3000`)

### 3. Start the Development Server

```bash
npx expo start
```

This will start the Metro bundler and show a QR code.

### 4. Run on Device/Simulator

- **iOS Simulator** (Mac only): Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## 📂 Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (athlete)/         # Athlete-specific tabs
│   │   ├── home.tsx       # Athlete dashboard
│   │   ├── browse.tsx     # Browse coaches
│   │   ├── sessions.tsx   # Session management
│   │   └── profile.tsx    # Athlete profile
│   ├── (coach)/           # Coach-specific tabs
│   │   ├── home.tsx       # Coach dashboard
│   │   ├── schedule.tsx   # Schedule management
│   │   ├── requests.tsx   # Request management
│   │   └── profile.tsx    # Coach profile
│   ├── auth/              # Authentication flows
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   ├── role-selection.tsx
│   │   └── onboarding/    # Role-specific onboarding
│   ├── coach/             # Coach detail views
│   │   └── [id].tsx       # Coach profile detail
│   ├── index.tsx          # App entry point
│   ├── welcome.tsx        # Welcome screen
│   ├── role-select.tsx    # Role selection screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   └── ui/               # UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Avatar.tsx
│       └── Badge.tsx
├── constants/            # App constants
│   ├── theme.ts         # Design system
│   └── config.ts        # API configuration
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   └── useRole.ts       # Role management hook
├── lib/                 # Libraries and utilities
│   └── api.ts          # API client
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   └── format.ts       # Formatting helpers
└── app.json            # Expo configuration
```

## 🎨 Design System

The app uses a consistent design system defined in `constants/theme.ts`:

- **Colors**: Primary, secondary, text, background, surface, borders
- **Spacing**: xs, sm, md, lg, xl, xxl
- **Typography**: Font sizes from xs to 3xl
- **Border Radius**: sm, md, lg, xl, xxl, full

## 🔐 Authentication

- Email/password authentication
- JWT token stored in Expo SecureStore
- Automatic token refresh
- Protected routes with role-based access

## 📱 Navigation

File-based routing with Expo Router:

```
/ (index)
├── /welcome
├── /auth/login
├── /auth/signup
├── /role-select
├── /(athlete)
│   ├── /home
│   ├── /browse
│   ├── /sessions
│   └── /profile
└── /(coach)
    ├── /home
    ├── /schedule
    ├── /requests
    └── /profile
```

## 🧪 Testing

### Test on iOS Simulator (Mac only)

```bash
npx expo start --ios
```

### Test on Android Emulator

```bash
npx expo start --android
```

### Test on Physical Device

1. Install Expo Go from App Store/Play Store
2. Run `npx expo start`
3. Scan the QR code with your phone's camera (iOS) or Expo Go app (Android)

## 📦 Building for Production

### iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android
```

### App Store Submission

1. **iOS**:
   - Create an Apple Developer account ($99/year)
   - Run `eas build --platform ios`
   - Download the `.ipa` file
   - Upload to App Store Connect via Transporter
   - Fill out App Store listing information
   - Submit for review

2. **Android**:
   - Create a Google Play Developer account ($25 one-time)
   - Run `eas build --platform android`
   - Download the `.aab` file
   - Upload to Google Play Console
   - Fill out Play Store listing information
   - Submit for review

## 🔧 Configuration

### Environment Variables

Configure backend URL in `constants/config.ts`:

```typescript
export const API_URL = 'YOUR_BACKEND_URL';
```

### App Configuration

Update `app.json` for:
- App name and version
- Bundle identifiers
- Icons and splash screens
- Permissions
- Build configuration

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **Node modules issues**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS Simulator not starting**:
   - Make sure Xcode is installed
   - Run `xcode-select --install`
   - Restart Expo Dev Client

4. **Android Emulator not starting**:
   - Make sure Android Studio is installed
   - Set up AVD (Android Virtual Device)
   - Set ANDROID_HOME environment variable

## 📝 Development Workflow

1. Make changes to source files
2. Expo will automatically reload the app
3. Test on device/simulator
4. Commit changes to git
5. Build and deploy when ready

## 🚢 Deployment

### Development Builds

```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Builds

```bash
# Create production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

### OTA Updates (Over-The-Air)

```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

## 📄 License

All rights reserved.

## 👥 Support

For support, please contact [your email or support channel].
