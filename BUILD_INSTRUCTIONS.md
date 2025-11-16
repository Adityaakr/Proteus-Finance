# Build Instructions for FLEX Mobile

## The Reality
Both **Privy** and **WalletConnect (Reown AppKit)** require **custom native builds** because they use native modules that aren't available in Expo Go.

## Solution: Build with EAS

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
# Email: 08quant@gmail.com
# Password: Aditipatel
```

### 3. Build for Android (APK)
```bash
eas build --platform android --profile preview
```

This will:
- Build a custom APK with WalletConnect
- Take ~10-15 minutes
- Give you a download link when done
- Install the APK on your phone

### 4. Build for iOS (TestFlight)
```bash
eas build --platform ios --profile preview
```

## Alternative: Web Version Only

If you want to test quickly without building, you can use the web version:

```bash
npx expo start --web
```

Then open http://localhost:8081 in your browser.

## Why Expo Go Doesn't Work

Expo Go is a **generic container** that includes common React Native modules. However:

- ❌ **Privy** uses custom native authentication modules
- ❌ **WalletConnect** uses custom crypto and networking modules
- ❌ Both require native code compilation

## What Works in Expo Go

Only pure JavaScript libraries work in Expo Go. For wallet functionality, you would need to use:
- Web3.js (JavaScript only, no UI)
- Manual wallet integration (very complex)

## Recommended Path Forward

**Build with EAS** - it's the only way to get proper wallet integration working on mobile.

The build will work on your physical device and include all the WalletConnect functionality.
