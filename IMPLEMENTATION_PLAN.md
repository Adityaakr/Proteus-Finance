# FLEX Mobile App - Implementation Plan

## Objective
Create a high-quality React Native mobile app that perfectly replicates the FLEX web app's UI/UX, features, and design quality.

## Design System (from Web App)

### Colors
- **Primary**: `#F0B90B` (Binance Gold)
- **Background**: `#FFFFFF` (Light mode), `#1a1a1a` (Dark cards)
- **Text**: `#111827` (Primary), `#6B7280` (Secondary)
- **Accent**: Gold gradients for charts and highlights
- **Success**: `#10B981`
- **Error**: `#EF4444`

### Typography
- **Headings**: Bold, tracking-tight
- **Body**: Regular, 14-16px
- **Small**: 12px for labels

### Components Style
- **Cards**: Rounded corners (12-20px), subtle shadows, border
- **Buttons**: Primary (gold), Outline, Ghost variants
- **Badges**: Small pills with background colors
- **Sheets**: Bottom sheets for modals (90vh height, rounded top)

## Features to Implement

### 1. Home Screen ✅
- Dark balance card with gold accent badge
- Total balance display (large, bold)
- Available/Locked breakdown
- 4 Quick actions (Send, Receive, Swap, Quick Pay) with bottom sheets
- Cashflow chart with 3 gold gradient areas
- 3 Highlight cards (Credit, Agents, Savings)
- Recent activity list with transaction icons

### 2. Credit Screen ✅
- Credit limit card with APR
- Progress bar showing utilization
- Borrow/Repay buttons with bottom sheets
- Slider for amount selection
- Transaction history
- "How it works" explanation card

### 3. Agents Screen ✅
- Agent list with budget/spent info
- Create agent button with multi-step sheet
- Spending progress bars
- Agent status badges

### 4. Earn Screen ✅
- Tab switcher (Savings/Invest)
- Vault cards with APY
- Pool cards with metrics
- Deposit/Withdraw actions

### 5. More Screen ✅
- Profile card with wallet address
- Settings list
- Credit history
- Disconnect wallet button

### Navigation
- Bottom tab bar (mobile)
- Icons from lucide-react equivalent
- Active state highlighting
- Header with FLEX logo + wallet connect

## Technical Stack

```
- React Native (Expo)
- TypeScript
- expo-linear-gradient (for gold gradients)
- react-native-svg (for icons)
- react-native-chart-kit (for cashflow chart)
- Custom UI components matching web design
```

## File Structure

```
/flex-mobile-clean
├── App.tsx (main entry with navigation)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── CreditScreen.tsx
│   │   ├── AgentsScreen.tsx
│   │   ├── EarnScreen.tsx
│   │   └── MoreScreen.tsx
│   ├── components/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Sheet.tsx (bottom modal)
│   │   ├── Progress.tsx
│   │   └── Input.tsx
│   ├── theme/
│   │   └── colors.ts
│   └── types/
│       └── index.ts
```

## Implementation Steps

1. ✅ Install dependencies
2. ⏳ Create theme system
3. ⏳ Build UI components
4. ⏳ Implement Home screen (most complex)
5. ⏳ Implement other screens
6. ⏳ Add navigation
7. ⏳ Polish and test

## Key Differences from Basic Version

- **Professional design**: Gold gradients, dark cards, proper spacing
- **Bottom sheets**: For all actions (not simple modals)
- **Charts**: Actual cashflow visualization
- **Icons**: Proper lucide-react style icons
- **Animations**: Smooth transitions
- **Typography**: Matching web app exactly
- **Colors**: Binance-style gold theme

This will be a production-quality mobile app! 🚀
