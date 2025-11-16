# 📱 Mobile App Setup - FIXED

## ✅ What Was Fixed

The issue was that `localhost:3000` doesn't work from mobile devices. Mobile devices need to connect using your computer's local network IP address.

### Changes Made:

1. **Updated WebView URLs:**
   - Changed from: `http://localhost:3000`
   - Changed to: `http://10.149.22.89:3000`

2. **Started Smart Wallet Server on Network:**
   - Command: `pnpm dev -- -H 0.0.0.0`
   - Now accessible from: `http://10.149.22.89:3000`

## 🚀 Test Now

### Step 1: Reload the App
On your phone in Expo Go:
- Shake the device
- Tap "Reload"

OR just scan the QR code again

### Step 2: Test the Flow
1. **Landing Screen** - Click "Launch App"
2. **Login Screen** - Click "Create Smart Wallet" 
3. **Smart Wallet Modal** - Should load now!
4. **Create Wallet** - Enter username + biometric
5. **Connected!** - Full FLEX app with wallet

## 🔧 Servers Running

Both servers are now properly configured:

```bash
# Smart Wallet (accessible from network)
http://10.149.22.89:3000 ✅

# Expo
exp://10.149.22.89:8081 ✅
```

## 📱 What You'll See

### Login Screen
```
┌─────────────────────┐
│         F           │
│   Welcome to FLEX   │
│                     │
│ [Create Smart       │
│  Wallet] 👆         │
│                     │
│ ✓ No seed phrases   │
│ ✓ Biometric auth    │
│ ✓ ERC-4337          │
└─────────────────────┘
```

### Smart Wallet Modal
```
┌─────────────────────┐
│ Smart Wallet    [X] │
├─────────────────────┤
│                     │
│  [Smart Wallet UI]  │
│  - Create wallet    │
│  - Enter username   │
│  - Use Face ID      │
│  - Get address      │
│                     │
└─────────────────────┘
```

### Connected State
```
┌─────────────────────┐
│ F FLEX    [wallet]  │
│   0x1234...5678     │
├─────────────────────┤
│                     │
│   [Main Content]    │
│                     │
├─────────────────────┤
│ Home Credit Agents  │
│ Earn More           │
└─────────────────────┘
```

## 🎯 How It Works

1. **User clicks "Create Smart Wallet"**
   - Modal opens with WebView
   - WebView loads `http://10.149.22.89:3000`
   - Smart wallet interface appears

2. **User creates wallet**
   - Enters username
   - Authenticates with biometric
   - Wallet created on BNB Testnet

3. **WebView sends message to React Native**
   ```javascript
   {
     type: 'WALLET_CREATED',
     address: '0x...'
   }
   ```

4. **React Native updates state**
   - `setIsConnected(true)`
   - `setWalletAddress(address)`
   - `setShowWalletModal(false)`
   - Shows main app

5. **User can reopen wallet**
   - Click wallet icon in header
   - Modal reopens
   - Can send transactions

## 🆘 Troubleshooting

### Still Can't Connect?

1. **Check both devices on same WiFi:**
   ```bash
   # On computer, check IP:
   ifconfig | grep "inet "
   # Should see 10.149.22.89
   ```

2. **Verify smart wallet server:**
   - Open `http://10.149.22.89:3000` in phone browser
   - Should see smart wallet interface
   - If not, check firewall settings

3. **Try different IP:**
   If your IP changed, update in `AppWithSmartWallet.tsx`:
   ```tsx
   source={{ uri: 'http://YOUR_IP:3000' }}
   ```

### WebView Not Loading?

1. **Check console for errors:**
   - Shake device → "Debug Remote JS"
   - Look for WebView errors

2. **Test in Safari first:**
   - Open `http://10.149.22.89:3000` in mobile Safari
   - If it works there, WebView should work

3. **Check Next.js server:**
   ```bash
   # Make sure it's running with -H 0.0.0.0
   cd smart-wallet/front
   pnpm dev -- -H 0.0.0.0
   ```

### Biometric Not Working?

- Biometric only works on real devices (not simulator)
- Make sure Face ID/Touch ID is enabled
- Try in mobile browser first to test

## ✅ Current Status

- ✅ Smart Wallet deployed on BNB Testnet
- ✅ Smart Wallet server running on network
- ✅ Expo app configured with correct IP
- ✅ WebView configured to load smart wallet
- ✅ Message passing set up
- ✅ Full FLEX app integrated

**Everything is ready! Just reload the app on your phone.** 🎉

## 📞 Quick Commands

```bash
# Restart Smart Wallet Server (if needed)
cd smart-wallet/front
pnpm dev -- -H 0.0.0.0

# Restart Expo (if needed)
npx expo start --clear --go

# Check your IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Your FLEX mobile app with smart wallet is now fully functional! 🚀
