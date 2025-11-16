# 🚀 Deploy AgentWallet Contract to BNB Testnet

## 📋 Prerequisites

1. **Node.js & npm** installed
2. **BNB Testnet wallet** with some tBNB for gas
3. **Private key** of deployer wallet

---

## 🔧 Setup

### Step 1: Install Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv
```

### Step 2: Configure Environment

Create `.env` file:

```bash
# Add your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: BscScan API key for verification
BSCSCAN_API_KEY=your_bscscan_api_key
```

⚠️ **IMPORTANT:** Never commit `.env` to git!

### Step 3: Get Testnet BNB

Get free tBNB from faucet:
- https://testnet.bnbchain.org/faucet-smart

---

## 🚀 Deploy Contract

### Option 1: Quick Deploy

```bash
npx hardhat run scripts/deployAgentWallet.js --network bnbTestnet
```

### Option 2: Deploy with Custom Parameters

Edit `scripts/deployAgentWallet.js`:

```javascript
// Change owner address
const ownerAddress = "0xYourWalletAddress";

// Change spending cap (in BNB)
const spendingCap = hre.ethers.utils.parseEther("5"); // 5 BNB
```

Then run:

```bash
npx hardhat run scripts/deployAgentWallet.js --network bnbTestnet
```

---

## 📊 Expected Output

```
🚀 Deploying AgentWallet contract to BNB Testnet...

Deploying with account: 0x742d...f3a8
Account balance: 100000000000000000 wei

Deployment parameters:
- Owner: 0x742d...f3a8
- Spending Cap: 1.0 BNB

✅ AgentWallet deployed to: 0x39785a6441ed33799cd160c4a4ccf0097f1fa301
🔗 View on BNBScan: https://testnet.bscscan.com/address/0x39785a6441ed33799cd160c4a4ccf0097f1fa301

💰 Sending 0.01 BNB to contract...
✅ Sent 0.01 BNB to contract
Tx Hash: 0x1a2b3c4d...
🔗 View tx: https://testnet.bscscan.com/tx/0x1a2b3c4d...

📊 Contract balance: 0.01 BNB

📈 Agent Stats:
- Balance: 0.01 BNB
- Credit Allocated: 0
- Credit Used: 0
- Spending Cap: 1.0 BNB
- Reputation: 50 /100
- Nonce: 0

✨ Deployment complete!

📝 Update your agentWalletService.ts with:
   return '0x39785a6441ed33799cd160c4a4ccf0097f1fa301';
```

---

## 🔄 Update Frontend

After deployment, update `src/services/agentWalletService.ts`:

```typescript
generateAgentAddress(userAddress: string): string {
  // Use deployed contract address
  return '0x39785a6441ed33799cd160c4a4ccf0097f1fa301';
}
```

---

## 💰 Deposit BNB to Contract

### Method 1: From Script

```javascript
const tx = await deployer.sendTransaction({
  to: agentWallet.address,
  value: ethers.utils.parseEther("0.1") // 0.1 BNB
});
await tx.wait();
```

### Method 2: From Wallet (MetaMask, etc.)

1. Send BNB to contract address: `0x39785a6441ed33799cd160c4a4ccf0097f1fa301`
2. Amount: Any amount you want
3. Network: **BNB Smart Chain Testnet**

### Method 3: Using Hardhat Console

```bash
npx hardhat console --network bnbTestnet
```

```javascript
const agentWallet = await ethers.getContractAt("AgentWallet", "0x39785a6441ed33799cd160c4a4ccf0097f1fa301");
const [signer] = await ethers.getSigners();

// Send 0.05 BNB
await signer.sendTransaction({
  to: agentWallet.address,
  value: ethers.utils.parseEther("0.05")
});

// Check balance
const balance = await agentWallet.getBalance();
console.log("Balance:", ethers.utils.formatEther(balance), "BNB");
```

---

## 🧪 Test Contract Functions

### Get Balance

```bash
npx hardhat console --network bnbTestnet
```

```javascript
const agentWallet = await ethers.getContractAt("AgentWallet", "0x39785a6441ed33799cd160c4a4ccf0097f1fa301");

// Get balance
const balance = await agentWallet.getBalance();
console.log("Balance:", ethers.utils.formatEther(balance), "BNB");

// Get stats
const stats = await agentWallet.getStats();
console.log("Stats:", stats);
```

### Execute Action

```javascript
// Execute a simple transfer
const tx = await agentWallet.executeAction(
  "0xRecipientAddress",
  ethers.utils.parseEther("0.001"), // 0.001 BNB
  "0x" // No data
);
await tx.wait();
console.log("Action executed!");
```

### Allocate Credit

```javascript
const tx = await agentWallet.allocateCredit(200); // $200
await tx.wait();
console.log("Credit allocated!");
```

---

## 🔍 Verify Contract on BscScan

```bash
npx hardhat verify --network bnbTestnet 0x39785a6441ed33799cd160c4a4ccf0097f1fa301 "0xOwnerAddress" "1000000000000000000"
```

---

## 📱 View on BNBScan

After deployment, view your contract:

**Contract Address:**
```
https://testnet.bscscan.com/address/0x39785a6441ed33799cd160c4a4ccf0097f1fa301
```

You can see:
- ✅ Contract balance
- ✅ All transactions
- ✅ Contract code (after verification)
- ✅ Events emitted
- ✅ Read/Write contract functions

---

## 🎯 Contract Features

### ✅ Implemented

1. **Receive BNB** - Contract can receive BNB deposits
2. **Get Balance** - Check contract balance
3. **Execute Actions** - Execute transactions with spending cap
4. **Reputation System** - Track and update reputation (0-100)
5. **Credit Management** - Allocate and track credit usage
6. **Spending Cap** - Enforce maximum spending limit
7. **Owner Controls** - Withdraw, update settings

### 🔐 Security Features

- Owner-only functions (withdraw, update settings)
- Spending cap enforcement
- Credit usage tracking
- Nonce for replay protection
- Event logging for all actions

---

## 🐛 Troubleshooting

### Error: "Insufficient funds for gas"

**Solution:** Get more tBNB from faucet:
```
https://testnet.bnbchain.org/faucet-smart
```

### Error: "Invalid private key"

**Solution:** Check `.env` file:
- Remove `0x` prefix from private key
- Ensure no extra spaces or quotes

### Error: "Network connection failed"

**Solution:** Try different RPC:
```javascript
url: "https://bsc-testnet.public.blastapi.io"
// or
url: "https://data-seed-prebsc-2-s1.binance.org:8545/"
```

---

## 📚 Contract ABI

The contract ABI is automatically generated in:
```
artifacts/contracts/AgentWallet.sol/AgentWallet.json
```

Use this ABI to interact with the contract from your frontend.

---

## 🎉 Success!

Your AgentWallet contract is now deployed and ready to:
- ✅ Receive BNB deposits
- ✅ Execute autonomous actions
- ✅ Track reputation on-chain
- ✅ Enforce spending policies
- ✅ Build credit history

**Next Steps:**
1. Send some tBNB to the contract
2. Update frontend with contract address
3. Test executing actions
4. Monitor on BNBScan!
