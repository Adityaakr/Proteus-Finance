# WalletConnect Integration

## Overview
This app now uses **Reown AppKit (WalletConnect)** instead of Privy for wallet connectivity. This allows the app to work with **Expo Go** without requiring a custom development build.

## What Changed

### Replaced Privy with WalletConnect
- ✅ **Works with Expo Go** - No custom build needed
- ✅ **600+ wallets supported** - MetaMask, Trust Wallet, Rainbow, etc.
- ✅ **BNB Chain Testnet** configured
- ✅ **Same UI/UX** - Minimal changes to user experience

### Key Files

1. **`src/config/AppKitConfig.ts`** - WalletConnect configuration
   - Project ID: `0d660e330a27f1a95048653f5b3b022a`
   - Network: BNB Chain Testnet (Chain ID: 97)
   - Ethers adapter for EVM interactions

2. **`src/config/storage.ts`** - AsyncStorage implementation for persistence

3. **`AppWithWalletConnect.tsx`** - Main app with WalletConnect integration

4. **`babel.config.js`** - Required for Expo SDK 53+ compatibility

## How to Use

### On Mobile (Expo Go)

1. **Start the Expo server:**
   ```bash
   npx expo start
   ```

2. **Scan the QR code** with Expo Go app

3. **Connect your wallet:**
   - Tap "Connect Wallet" button
   - Choose from 600+ supported wallets
   - Approve the connection in your wallet app

### On Web

The web version uses a simplified preview mode (no real wallet connection).

## Supported Wallets

All wallets that support WalletConnect protocol work, including:
- MetaMask
- Trust Wallet
- Rainbow
- Coinbase Wallet
- Zerion
- And 600+ more!

## Network Configuration

**BNB Chain Testnet:**
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545
- Explorer: https://testnet.bscscan.com
- Native Token: tBNB (testnet BNB)

## Testing

1. **Get testnet BNB:**
   - Visit: https://testnet.bnbchain.org/faucet-smart
   - Enter your wallet address
   - Request testnet tokens

2. **Connect and test:**
   - Open app in Expo Go
   - Connect your wallet
   - Verify connection shows your address
   - Test navigation between screens

## Advantages Over Privy

| Feature | Privy | WalletConnect |
|---------|-------|---------------|
| Works with Expo Go | ❌ No | ✅ Yes |
| Custom build required | ✅ Yes | ❌ No |
| Number of wallets | Limited | 600+ |
| Development speed | Slow (build time) | Fast (instant) |
| User wallet choice | Limited | Any wallet |

## Next Steps

1. ✅ Test on Expo Go
2. ✅ Verify wallet connection
3. ✅ Test on both iOS and Android
4. Add smart contract interactions
5. Implement transaction signing
6. Add balance display

## Troubleshooting

### Modal doesn't open
- Make sure `<AppKit />` component is rendered
- Check that AppKitProvider wraps your app

### Connection fails
- Verify you have a wallet app installed
- Check network connectivity
- Ensure wallet supports WalletConnect v2

### Storage issues
- Clear AsyncStorage: `AsyncStorage.clear()`
- Restart Expo Go app

## Resources

- [Reown AppKit Docs](https://docs.reown.com/appkit/react-native/core/installation)
- [WalletConnect](https://walletconnect.com/)
- [BNB Chain Testnet](https://testnet.bscscan.com/)
