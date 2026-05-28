# Animipro — Mobile App Guide

## Current Status: PWA (Progressive Web App) ✅

Your app is now a **fully installable PWA**. Users can install it directly from the browser:

- **Android**: Chrome shows an "Install" banner automatically → installs to home screen with full-screen mode
- **iOS**: Safari → Share → "Add to Home Screen" → launches like a native app
- **Desktop**: Chrome/Edge show install button in the address bar

### What the PWA gives you:
- ✅ Home screen icon with your Animipro branding
- ✅ Full-screen mode (no browser chrome)
- ✅ Offline caching (pages load even without internet)
- ✅ Fast launch (service worker pre-caches assets)
- ✅ iOS safe-area support (notch, home indicator)
- ✅ Smart install prompt (guides users to install)

---

## Phase 2: App Store / Play Store with Capacitor

When you're ready to publish to the **Apple App Store** and **Google Play Store**, follow these steps to wrap your PWA in a native shell using [Capacitor](https://capacitorjs.com/).

### Prerequisites

- **macOS** with Xcode 15+ (for iOS builds)
- **Android Studio** (for Android builds)
- **Node.js 18+**
- **CocoaPods** (`sudo gem install cocoapods`)

### Step 1: Install Capacitor

```bash
cd saas-platform-build
npm install @capacitor/core @capacitor/cli
npx cap init "Animipro" "io.animapro.app" --web-dir=out
```

### Step 2: Configure Static Export

Update `next.config.js` to enable static export for Capacitor:

```js
const nextConfig = {
  // ... existing config
  output: 'export',  // generates static HTML in /out
  images: {
    unoptimized: true,  // required for static export
  },
}
```

Then build:

```bash
npm run build
```

This creates the `/out` directory that Capacitor will use.

### Step 3: Add Native Platforms

```bash
# iOS
npx cap add ios

# Android
npx cap add android
```

### Step 4: Configure App Metadata

Edit `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.animapro.app',
  appName: 'Animipro',
  webDir: 'out',
  server: {
    // For development, point to your dev server:
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f1729',
  },
  android: {
    backgroundColor: '#0f1729',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f1729',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0f1729',
    },
  },
};

export default config;
```

### Step 5: Sync & Open in IDE

```bash
# Build the web app
npm run build

# Copy web assets to native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio (Android)
npx cap open android
```

### Step 6: Add Native Plugins (Optional)

```bash
# Push notifications
npm install @capacitor/push-notifications
npx cap sync

# Status bar control
npm install @capacitor/status-bar
npx cap sync

# Splash screen
npm install @capacitor/splash-screen
npx cap sync

# App badge (notification count)
npm install @capacitor/badge
npx cap sync

# Haptic feedback
npm install @capacitor/haptics
npx cap sync
```

### Step 7: App Icons & Splash Screens

Use the Capacitor assets tool:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0f1729' --splashBackgroundColor '#0f1729'
```

Place your source icon at `assets/icon-only.png` (1024×1024) and splash at `assets/splash.png` (2732×2732).

### Step 8: Build for Store

**iOS:**
1. Open `ios/App/App.xcworkspace` in Xcode
2. Set your Team & Bundle Identifier
3. Product → Archive → Distribute to App Store Connect

**Android:**
1. Open `android/` in Android Studio
2. Build → Generate Signed Bundle/APK
3. Upload to Google Play Console

---

## Development Workflow

```bash
# 1. Make changes to your Next.js code
# 2. Build
npm run build

# 3. Sync to native projects
npx cap sync

# 4. Run on device/simulator
npx cap run ios
npx cap run android

# OR for live reload during development:
npx cap run ios --livereload --external
```

---

## Recommended App Store Metadata

**App Name:** Animipro — Resort Animation Manager
**Category:** Business / Productivity
**Subtitle:** Hotel animation team management
**Keywords:** hotel animation, resort management, Egypt, TripAdvisor, scheduling, team management, Sharm El Sheikh, Hurghada

**Description:**
> Animipro is the #1 management platform built for Egyptian resort hotel animation teams. Schedule your teams, track TripAdvisor scores, manage performance — across all your properties. Used by 150+ hotels in Sharm El Sheikh, Hurghada, Marsa Alam, Dahab, El Gouna, and more.

---

## Cost Summary

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Google Play Developer Account | $25 one-time |
| Capacitor (open source) | Free |
| Total first year | ~$124 |
