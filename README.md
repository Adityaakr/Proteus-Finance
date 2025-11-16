# Proteus Finance 🏦

A next-generation decentralized finance (DeFi) super-app with AI-powered treasury management, autonomous agents, and cross-platform support. Built with React Native, Expo, Privy wallet integration, and smart contracts on BNB Smart Chain.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/Framework-React%20Native%20%7C%20Expo-61DAFB)
![Blockchain](https://img.shields.io/badge/Blockchain-BNB%20Smart%20Chain-F0B90B)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Overview

Proteus Finance is a comprehensive DeFi platform that combines traditional financial services with cutting-edge blockchain technology and AI-powered automation. Users can manage credit, earn yield, deploy autonomous treasury agents, and execute transactions seamlessly across web and mobile platforms.

## ✨ Key Features

### 💰 **Multi-Wallet Support**
- **Privy Integration**: Email-based authentication with embedded wallets
- **Cross-Platform**: Seamless wallet experience on web and mobile
- **Secure Storage**: Private keys stored securely on-device (mobile) or via Privy (web)
- **BNB Smart Chain**: Native support for BNB Testnet with mainnet-ready architecture

### 🤖 **AI Treasury Agents**
- **Autonomous Management**: Deploy AI agents to manage your treasury 24/7
- **Policy Enforcement**: x402 protocol integration for spend limits and risk controls
- **Smart Contracts**: On-chain agent wallets with reputation scoring
- **Micropayments**: Automated recurring payments and DeFi actions
- **Reputation System**: Agents earn trust scores based on successful actions

### 💸 **Credit System**
- **Dynamic Credit Scoring**: On-chain credit evaluation based on wallet history
- **Flexible Borrowing**: Borrow USDT against your credit limit
- **Risk-Based APR**: Interest rates from 8-18% based on risk profile
- **Real-Time Tracking**: Monitor credit utilization and payment history
- **Smart Repayment**: Easy repayment with automatic credit restoration

### 📈 **Earn & Invest**
- **Liquidity Pools**: Provide liquidity to BNB-USDT and other pools
- **Savings Vaults**: Earn passive yield on stablecoins (USDC, USDT, FDUSD)
- **Live Deposits**: Real on-chain transactions to deployed pool contracts
- **APY Tracking**: Monitor returns across all investment positions
- **Risk Indicators**: Clear risk levels for each investment option

### 🎨 **Beautiful UI/UX**
- **Binance Gold Theme**: Professional gradient design system
- **Bottom Sheet Modals**: Native mobile interactions
- **Responsive Charts**: Real-time cashflow and portfolio visualization
- **Quick Actions**: Send, Receive, Swap, and Quick Pay at your fingertips
- **Dark Mode**: Elegant dark theme optimized for crypto trading

## 🏗️ Architecture

### **Frontend**
```
├── App.tsx                          # Main app entry with Privy provider
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Dashboard with balance & quick actions
│   │   ├── CreditScreen.tsx         # Borrow/repay credit management
│   │   ├── AgentsScreen.tsx         # AI agent deployment & monitoring
│   │   ├── EarnScreen.tsx           # Liquidity pools & savings vaults
│   │   ├── SendScreen.tsx           # Send BNB/tokens modal
│   │   ├── FXPayScreen.tsx          # Quick payment interface
│   │   └── LandingScreen.tsx        # Onboarding splash screen
│   ├── components/
│   │   ├── Card.tsx                 # Reusable card component
│   │   ├── Button.tsx               # Button with variants
│   │   ├── Badge.tsx                # Status badges
│   │   ├── Sheet.tsx                # Bottom sheet modals
│   │   └── Input.tsx                # Form inputs
│   ├── services/
│   │   ├── walletService.ts         # Wallet management
│   │   ├── creditService.ts         # Credit scoring & borrowing
│   │   ├── agentWalletService.ts    # Agent contract interactions
│   │   ├── x402Service.ts           # x402 protocol integration
│   │   └── treasuryAgent.ts         # AI agent logic
│   └── theme/
│       └── colors.ts                # Design system tokens
```

### **Smart Contracts**
```
├── contracts/
│   └── AgentWallet.sol              # Treasury agent wallet contract
├── scripts/
│   └── deploy.js                    # Deployment scripts
└── hardhat.config.cjs               # Hardhat configuration
```

**Deployed Contracts (BNB Testnet):**
- **AgentWallet**: `0xF9c36b4fBA23F515b1ae844642F81DC0aDdf6AF6`
- **BNB-USDT Pool**: `0xF9c36b4fBA23F515b1ae844642F81DC0aDdf6AF6`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- MetaMask or Privy account for web

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Adityaakr/Proteus-Finance.git
cd Proteus-Finance
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Add your Privy App ID and other credentials
```

4. **Run the app**

**For Web:**
```bash
npm run web
```

**For Mobile (iOS):**
```bash
npm run ios
```

**For Mobile (Android):**
```bash
npm run android
```

**Development Server:**
```bash
npm start
# Then scan QR code with Expo Go app
```

## 📱 Platform Support

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Wallet Connect | ✅ Privy | ✅ Native | ✅ Native |
| Send/Receive | ✅ | ✅ | ✅ |
| Credit System | ✅ | ✅ | ✅ |
| AI Agents | ✅ | ✅ | ✅ |
| Earn Pools | ✅ | ✅ | ✅ |
| Charts | ✅ | ✅ | ✅ |

## 🔧 Technology Stack

### **Frontend**
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe JavaScript
- **Privy** - Embedded wallet authentication
- **ethers.js** - Ethereum library for blockchain interactions
- **react-native-chart-kit** - Data visualization

### **Blockchain**
- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **BNB Smart Chain** - Layer 1 blockchain (Testnet)
- **ethers.js** - Contract deployment and interaction

### **Design**
- **Ionicons** - Icon system
- **expo-linear-gradient** - Gradient backgrounds
- **Custom Design System** - Binance-inspired gold theme

## 🎯 Core Functionality

### **1. Wallet Management**
- Create wallet with email (Privy on web, native on mobile)
- View balance in BNB and USD
- Copy address and view on explorer
- Logout and session management

### **2. Credit Operations**
```typescript
// Calculate credit score
const score = await creditService.calculateCreditScore(walletAddress);

// Borrow USDT
const txHash = await creditService.borrow(walletAddress, amount, sendTransaction);

// Repay loan
await creditService.repay(walletAddress, amount, sendTransaction);
```

### **3. AI Agent Deployment**
```typescript
// Deploy agent wallet
const agentAddress = await agentWalletService.deployAgentWallet(
  userAddress,
  spendingCap
);

// Execute autonomous action
await agentWalletService.executeAction(agentAddress, target, value, data);
```

### **4. Earn & Invest**
```typescript
// Add liquidity to pool
const txHash = await sendTransaction({
  to: poolAddress,
  value: ethers.parseEther(amount).toString(),
  chainId: 97
});
```

## 🔐 Security

- **Private Key Storage**: Secure Keychain (iOS), Keystore (Android), Privy (Web)
- **Biometric Authentication**: Face ID / Touch ID support on mobile
- **Smart Contract Auditing**: Contracts follow OpenZeppelin standards
- **Spending Caps**: Agent wallets have configurable limits
- **Policy Enforcement**: x402 protocol for transaction validation

## 📊 Smart Contract Features

### **AgentWallet.sol**
- Receive and hold BNB
- Execute actions with spending cap enforcement
- Reputation scoring system (0-100)
- Credit allocation tracking
- Event emission for monitoring
- Owner-only administrative functions

## 🛣️ Roadmap

### **Phase 1: Foundation** ✅
- [x] Cross-platform app structure
- [x] Wallet integration (Privy + Native)
- [x] Home screen with quick actions
- [x] Navigation system

### **Phase 2: Core Features** ✅
- [x] Credit scoring and borrowing
- [x] AI agent deployment
- [x] Liquidity pool deposits
- [x] Smart contract deployment

### **Phase 3: Enhancement** 🚧
- [ ] Advanced charts and analytics
- [ ] Multi-token support (ERC-20)
- [ ] Agent strategy marketplace
- [ ] Social features and referrals

### **Phase 4: Mainnet** 🔜
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Fiat on/off ramps
- [ ] Mobile app store release

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Privy** - Embedded wallet infrastructure
- **BNB Chain** - Blockchain infrastructure
- **Expo** - Cross-platform development tools
- **OpenZeppelin** - Smart contract libraries

## 📞 Contact & Links

- **GitHub**: [@Adityaakr](https://github.com/Adityaakr)
- **Project**: [Proteus Finance](https://github.com/Adityaakr/Proteus-Finance)
- **BNB Testnet Explorer**: [BscScan Testnet](https://testnet.bscscan.com/)

## 🎬 Demo

Try the live demo: [Coming Soon]

---

**Built with ❤️ by the Proteus Finance Team**

*Empowering the future of decentralized finance with AI-powered automation*
