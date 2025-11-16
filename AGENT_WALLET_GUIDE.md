# 🏦 Agent Wallet Address - Implementation Guide

## 📍 **What is the Agent Wallet Address?**

The **Agent Wallet Address** is a deterministic smart contract wallet that:
- Holds borrowed credit from the user
- Executes autonomous DeFi actions
- Builds on-chain reputation
- Enforces spending policies
- Operates with signless transactions (for high reputation)

---

## 🔑 **Current Implementation**

### **1. Deterministic Address Generation**

```typescript
// Uses CREATE2 pattern for predictable addresses
const agentAddress = agentWalletService.generateAgentAddress(userAddress);

// Example:
// User: 0x742d...f3a8
// Agent: 0x8a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
```

**How it works:**
```typescript
generateAgentAddress(userAddress: string): string {
  // 1. Create salt from user address + version
  const salt = keccak256(encode([userAddress, 'FLEX_TREASURY_AGENT_V1']))
  
  // 2. Predict CREATE2 address
  const hash = keccak256(encode([userAddress, salt]))
  
  // 3. Return last 20 bytes as address
  return '0x' + hash.slice(-40)
}
```

**Benefits:**
- ✅ Same agent address every time for same user
- ✅ Can predict address before deployment
- ✅ User can verify their agent address
- ✅ No need to store mapping on-chain

---

## 🏗️ **What Should Be Added**

### **Phase 1: Off-Chain Agent (Current)**
```typescript
// Agent exists in app memory only
const agent = {
  address: '0x8a3f2b1c...',  // Deterministic
  userAddress: '0x742d...',   // Owner
  balance: 0,                 // BNB balance
  creditAllocated: 200,       // USDT credit
  creditUsed: 0,              // Spent so far
  spendingCap: 500,           // Max allowed
  reputation: 50,             // Score 0-100
  tier: 'BRONZE',             // Tier level
  deployed: false             // Not on-chain yet
}
```

### **Phase 2: Deploy Smart Contract (Next)**

#### **A. AgentWallet.sol Contract**
```solidity
contract AgentWallet {
    address public owner;           // User who owns this agent
    uint256 public spendingCap;     // Max spending limit
    uint256 public creditAllocated; // Credit from vault
    uint256 public creditUsed;      // Amount spent
    uint256 public reputation;      // On-chain reputation
    
    // Execute action with signature
    function executeAction(
        address target,
        bytes memory data,
        uint256 value,
        bytes memory signature
    ) external returns (bytes memory) {
        require(msg.sender == owner || verifySignature(signature));
        require(creditUsed + value <= spendingCap);
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success);
        
        creditUsed += value;
        return result;
    }
    
    // Execute without signature (high reputation only)
    function executeSignless(
        address target,
        bytes memory data,
        uint256 value,
        bytes memory oracleSignature
    ) external returns (bytes memory) {
        require(reputation >= 75, "Low reputation");
        require(verifyOracleSignature(oracleSignature));
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success);
        
        return result;
    }
}
```

#### **B. AgentWalletFactory.sol**
```solidity
contract AgentWalletFactory {
    mapping(address => address) public userToAgent;
    
    // Deploy agent using CREATE2 for deterministic address
    function deployAgent(
        address user,
        uint256 spendingCap
    ) external returns (address agent) {
        bytes32 salt = keccak256(abi.encode(user, "FLEX_TREASURY_AGENT_V1"));
        
        bytes memory bytecode = abi.encodePacked(
            type(AgentWallet).creationCode,
            abi.encode(user, spendingCap)
        );
        
        assembly {
            agent := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        require(agent != address(0), "Deploy failed");
        userToAgent[user] = agent;
        
        emit AgentDeployed(user, agent);
    }
    
    // Predict agent address before deployment
    function predictAgentAddress(address user) external view returns (address) {
        bytes32 salt = keccak256(abi.encode(user, "FLEX_TREASURY_AGENT_V1"));
        bytes32 hash = keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(type(AgentWallet).creationCode)
        ));
        return address(uint160(uint256(hash)));
    }
}
```

---

## 🔄 **Credit Transfer Flow**

### **Current Flow (Mock)**
```
User Borrows $200
     ↓
CreditVault records debt
     ↓
Agent gets $200 allocation (off-chain)
     ↓
Agent can spend up to $200
```

### **Production Flow (Phase 2)**
```
User Borrows $200
     ↓
CreditVault.borrow(200)
     ↓
CreditVault.transferToAgent(agentAddress, 200)
     ↓
AgentWallet receives 200 USDT
     ↓
Agent executes DeFi actions autonomously
     ↓
ReputationOracle records success
     ↓
Reputation increases
```

---

## 📊 **Agent Wallet Features**

### **1. Spending Caps by Tier**
```typescript
BRONZE:   $500   (reputation 0-49)
SILVER:   $2,000 (reputation 50-74)
GOLD:     $5,000 (reputation 75-89)
PLATINUM: $10,000 (reputation 90-100)
```

### **2. Signless Transactions**
```typescript
// Only available for SILVER+ (reputation >= 50)
if (agent.reputation >= 50) {
  // Can execute without user signature
  // Oracle signs the transaction instead
  await agent.executeSignless(action, oracleSignature)
}
```

### **3. Reputation Building**
```typescript
// Reputation increases with:
- Successful actions (+5 per action)
- On-time repayments (+10)
- Consistent activity (+2 per week)
- High transaction volume (+1 per $100)

// Reputation decreases with:
- Failed actions (-10)
- Late repayments (-20)
- Policy violations (-15)
```

---

## 🚀 **Deployment Steps (Phase 2)**

### **Step 1: Deploy Contracts**
```bash
# Deploy AgentWalletFactory
npx hardhat run scripts/deployAgentFactory.ts --network bnbTestnet

# Get factory address
FACTORY_ADDRESS=0x...
```

### **Step 2: Update Service**
```typescript
// src/services/agentWalletService.ts
private agentWalletFactoryAddress = '0x...' // Add deployed address
```

### **Step 3: Deploy Agent for User**
```typescript
// When user first uses agent
const tx = await agentWalletService.deployAgentWallet(
  userAddress,
  spendingCap,
  privyClient
)

// Agent is now deployed on-chain!
agent.deployed = true
```

### **Step 4: Transfer Credit**
```typescript
// After borrowing credit
await agentWalletService.transferCreditToAgent(
  userAddress,
  agentAddress,
  amount,
  privyClient
)
```

---

## 🎯 **What to Add to Agent Address**

### **Immediate (Phase 1 - Current)**
- ✅ Deterministic address generation
- ✅ Agent wallet service
- ✅ Off-chain state management
- ✅ UI showing agent address

### **Next (Phase 2 - Week 3-4)**
- [ ] Deploy AgentWallet.sol
- [ ] Deploy AgentWalletFactory.sol
- [ ] Implement deployAgentWallet()
- [ ] Implement transferCreditToAgent()
- [ ] Add on-chain balance checking

### **Future (Phase 3 - Week 5-6)**
- [ ] Signless transaction support
- [ ] Oracle signature verification
- [ ] Reputation oracle integration
- [ ] Gas sponsorship for high-rep agents

---

## 📝 **Example Usage**

```typescript
// 1. Create agent wallet
const agent = await agentWalletService.createAgentWallet(
  userAddress,
  500,  // spending cap
  200   // credit allocated
)

console.log('Agent address:', agent.address)
// Output: 0x8a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a

// 2. Check if deployed
if (!agent.deployed) {
  // Deploy on-chain
  await agentWalletService.deployAgentWallet(
    userAddress,
    500,
    privyClient
  )
}

// 3. Transfer credit
await agentWalletService.transferCreditToAgent(
  userAddress,
  agent.address,
  200,
  privyClient
)

// 4. Agent executes action
await agent.executeAction({
  type: 'swap',
  amount: 50,
  token: 'USDT',
  target: 'PancakeSwap',
  category: 'defi'
})

// 5. Reputation increases
agent.reputation += 5
console.log('New reputation:', agent.reputation)
```

---

## 🔐 **Security Considerations**

1. **Address Verification**
   - Always verify agent address matches expected deterministic address
   - Check factory deployment before trusting agent

2. **Spending Limits**
   - Enforce spending cap on-chain
   - Cannot exceed allocated credit
   - Daily/category limits checked

3. **Signature Verification**
   - User signature required for normal actions
   - Oracle signature required for signless
   - Replay protection via nonce

4. **Reputation Gating**
   - Signless only for reputation >= 50
   - Higher caps for higher reputation
   - Automatic tier upgrades

---

## 📚 **References**

- [EIP-1014: CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- [Account Abstraction (ERC-4337)](https://eips.ethereum.org/EIPS/eip-4337)
- [x402 Protocol](https://facilitator.aeon.xyz)
- [Privy Embedded Wallets](https://docs.privy.io)
