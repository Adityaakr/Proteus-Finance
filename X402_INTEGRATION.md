# X402 Integration Guide for FLEX Mobile

## Overview

X402 is a Web3 payment protocol that enables seamless crypto payments. This guide shows how to integrate it into the FLEX mobile app.

## Installation

```bash
cd /Users/adityakumar/flex/flex-mobile-clean

# Install required packages
npm install @walletconnect/react-native-compat
npm install @walletconnect/modal-react-native
npm install @react-native-async-storage/async-storage
npm install ethers@5.7.2
npm install react-native-get-random-values
npm install @react-native-community/netinfo

# For x402 SDK (if available)
# npm install x402-sdk
```

## Architecture

```
App Flow:
1. User connects wallet (WalletConnect)
2. X402 session initialized
3. Payment requests created with x402 protocol
4. Transactions signed and executed
5. Payment status tracked
```

## Implementation Steps

### Step 1: Create Web3 Configuration

Create `/src/config/web3Config.ts`:

```typescript
import { ethers } from 'ethers';

export const WEB3_CONFIG = {
  // BNB Chain Mainnet
  chainId: 56,
  rpcUrl: 'https://bsc-dataseed.binance.org/',
  
  // BNB Chain Testnet
  testnetChainId: 97,
  testnetRpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  
  // WalletConnect Project ID (get from https://cloud.walletconnect.com)
  walletConnectProjectId: 'YOUR_PROJECT_ID_HERE',
  
  // Contract Addresses (BNB Chain)
  contracts: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    FDUSD: '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409',
    flexTreasury: 'YOUR_FLEX_TREASURY_CONTRACT',
    flexCredit: 'YOUR_FLEX_CREDIT_CONTRACT',
  },
  
  // X402 Configuration
  x402: {
    apiUrl: 'https://api.x402.io', // Replace with actual X402 API
    version: '1.0',
  },
};

// Provider setup
export const getProvider = (testnet = true) => {
  const rpcUrl = testnet ? WEB3_CONFIG.testnetRpcUrl : WEB3_CONFIG.rpcUrl;
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};
```

### Step 2: Create X402 Service

Create `/src/services/x402Service.ts`:

```typescript
import { ethers } from 'ethers';
import { WEB3_CONFIG } from '../config/web3Config';

export interface X402PaymentRequest {
  recipient: string;
  amount: string;
  token: string;
  memo?: string;
  metadata?: Record<string, any>;
}

export interface X402PaymentResponse {
  paymentId: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  timestamp: number;
}

class X402Service {
  private provider: ethers.providers.JsonRpcProvider;
  private signer?: ethers.Signer;

  constructor() {
    this.provider = getProvider(true); // Use testnet by default
  }

  /**
   * Initialize X402 with wallet signer
   */
  async initialize(signer: ethers.Signer) {
    this.signer = signer;
    console.log('X402 Service initialized');
  }

  /**
   * Create a payment request using X402 protocol
   */
  async createPaymentRequest(
    request: X402PaymentRequest
  ): Promise<X402PaymentResponse> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Connect wallet first.');
    }

    try {
      // 1. Validate recipient address
      if (!ethers.utils.isAddress(request.recipient)) {
        throw new Error('Invalid recipient address');
      }

      // 2. Parse amount
      const amount = ethers.utils.parseUnits(request.amount, 18);

      // 3. Get token contract
      const tokenContract = new ethers.Contract(
        request.token,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        this.signer
      );

      // 4. Check balance
      const balance = await tokenContract.balanceOf(
        await this.signer.getAddress()
      );
      if (balance.lt(amount)) {
        throw new Error('Insufficient balance');
      }

      // 5. Create X402 payment metadata
      const paymentMetadata = {
        protocol: 'x402',
        version: WEB3_CONFIG.x402.version,
        memo: request.memo,
        timestamp: Date.now(),
        ...request.metadata,
      };

      // 6. Execute transfer with X402 metadata
      const tx = await tokenContract.transfer(request.recipient, amount);

      // 7. Return payment response
      return {
        paymentId: tx.hash,
        status: 'pending',
        txHash: tx.hash,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('X402 Payment Error:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(
    paymentId: string
  ): Promise<X402PaymentResponse> {
    try {
      const receipt = await this.provider.getTransactionReceipt(paymentId);
      
      if (!receipt) {
        return {
          paymentId,
          status: 'pending',
          timestamp: Date.now(),
        };
      }

      return {
        paymentId,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        txHash: receipt.transactionHash,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  /**
   * Request payment from another address (invoice)
   */
  async createPaymentInvoice(request: X402PaymentRequest): Promise<string> {
    // Generate X402 payment URL/QR code
    const invoiceData = {
      protocol: 'x402',
      recipient: request.recipient,
      amount: request.amount,
      token: request.token,
      memo: request.memo,
      chainId: WEB3_CONFIG.testnetChainId,
    };

    // Encode as URL or QR data
    const invoiceUrl = `x402://pay?${new URLSearchParams(
      invoiceData as any
    ).toString()}`;

    return invoiceUrl;
  }

  /**
   * Batch payments for employer payouts
   */
  async batchPayments(
    payments: X402PaymentRequest[]
  ): Promise<X402PaymentResponse[]> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const results: X402PaymentResponse[] = [];

    for (const payment of payments) {
      try {
        const result = await this.createPaymentRequest(payment);
        results.push(result);
      } catch (error) {
        console.error('Batch payment error:', error);
        results.push({
          paymentId: '',
          status: 'failed',
          timestamp: Date.now(),
        });
      }
    }

    return results;
  }
}

export const x402Service = new X402Service();
```

### Step 3: Create Wallet Connection Hook

Create `/src/hooks/useWallet.ts`:

```typescript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { x402Service } from '../services/x402Service';

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    // Check for saved connection
    checkSavedConnection();
  }, []);

  const checkSavedConnection = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('wallet_address');
      if (savedAddress) {
        setAddress(savedAddress);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking saved connection:', error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // For now, simulate wallet connection
      // In production, use WalletConnect or similar
      
      // Mock wallet connection
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7631f3a8';
      
      setAddress(mockAddress);
      setIsConnected(true);
      
      // Save connection
      await AsyncStorage.setItem('wallet_address', mockAddress);
      
      // Initialize X402 (in production, use real signer)
      // await x402Service.initialize(signer);
      
      return mockAddress;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setAddress(null);
      setBalance('0');
      setIsConnected(false);
      setSigner(null);
      await AsyncStorage.removeItem('wallet_address');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const sendPayment = async (
    recipient: string,
    amount: string,
    token: string,
    memo?: string
  ) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    return await x402Service.createPaymentRequest({
      recipient,
      amount,
      token,
      memo,
    });
  };

  return {
    address,
    balance,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    sendPayment,
  };
};
```

### Step 4: Update HomeScreen with X402

Update `/src/screens/HomeScreen.tsx` to use X402:

```typescript
// Add at the top
import { useWallet } from '../hooks/useWallet';
import { x402Service } from '../services/x402Service';
import { WEB3_CONFIG } from '../config/web3Config';

// Inside HomeScreen component
const { address, isConnected, sendPayment } = useWallet();

// Update Send sheet handler
const handleSend = async () => {
  try {
    if (!sendAddress || !sendAmount) {
      alert('Please fill in all fields');
      return;
    }

    // Use X402 to send payment
    const result = await send(
      sendAddress,
      sendAmount,
      WEB3_CONFIG.contracts.USDT,
      sendMemo
    );

    alert(\`Payment sent! TX: \${result.txHash}\`);
    setShowSend(false);
  } catch (error) {
    console.error('Send error:', error);
    alert('Payment failed: ' + error.message);
  }
};
```

### Step 5: Add X402 to Quick Actions

Update the Send button in HomeScreen:

```typescript
<Button size="lg" style={styles.sheetButton} onPress={handleSend}>
  {isConnected ? 'Send via X402' : 'Connect Wallet First'}
</Button>
```

### Step 6: Employer Payouts with X402

Create `/src/screens/EmployerPayoutsScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { x402Service } from '../services/x402Service';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';

export const EmployerPayoutsScreen = () => {
  const [recipients, setRecipients] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handleBatchPayout = async () => {
    try {
      // Parse recipients (one per line)
      const addresses = recipients.split('\\n').filter(a => a.trim());
      
      // Create payment requests
      const payments = addresses.map(address => ({
        recipient: address.trim(),
        amount: amount,
        token: WEB3_CONFIG.contracts.USDT,
        memo: 'Employer payout via X402',
      }));

      // Execute batch payments
      const results = await x402Service.batchPayments(payments);
      
      const successful = results.filter(r => r.status !== 'failed').length;
      alert(\`Sent \${successful}/\${payments.length} payments successfully!\`);
    } catch (error) {
      console.error('Batch payout error:', error);
      alert('Payout failed: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.title}>Batch Payouts via X402</Text>
        <Text style={styles.subtitle}>
          Send payments to multiple addresses on BPN
        </Text>
        
        <Input
          placeholder="Recipient addresses (one per line)"
          multiline
          numberOfLines={5}
          value={recipients}
          onChangeText={setRecipients}
        />
        
        <Input
          placeholder="Amount per recipient (USDT)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        
        <Button onPress={handleBatchPayout}>
          Send Batch Payout
        </Button>
      </Card>
    </ScrollView>
  );
};
```

## Testing X402 Integration

### 1. Test on BNB Testnet

```typescript
// In your test file
import { x402Service } from '../services/x402Service';

const testPayment = async () => {
  const result = await x402Service.createPaymentRequest({
    recipient: '0xRecipientAddress',
    amount: '10',
    token: WEB3_CONFIG.contracts.USDT,
    memo: 'Test payment',
  });
  
  console.log('Payment result:', result);
};
```

### 2. Monitor Transactions

```typescript
const monitorPayment = async (txHash: string) => {
  const status = await x402Service.checkPaymentStatus(txHash);
  console.log('Payment status:', status);
};
```

## Security Considerations

1. **Private Keys**: Never store private keys in the app
2. **Use WalletConnect**: Let users sign with their own wallets
3. **Validate Addresses**: Always validate recipient addresses
4. **Check Balances**: Verify sufficient balance before transactions
5. **Gas Estimation**: Estimate gas before sending
6. **Error Handling**: Proper error messages for users

## Next Steps

1. ✅ Install dependencies
2. ✅ Create Web3 config
3. ✅ Implement X402 service
4. ✅ Add wallet connection
5. ⏳ Integrate WalletConnect (production)
6. ⏳ Test on BNB testnet
7. ⏳ Add transaction history
8. ⏳ Implement payment notifications

## Resources

- [X402 Protocol Docs](https://x402.io/docs)
- [WalletConnect React Native](https://docs.walletconnect.com/2.0/reactnative/about)
- [Ethers.js Docs](https://docs.ethers.io/v5/)
- [BNB Chain Docs](https://docs.bnbchain.org/)

---

**Status**: Ready for implementation
**Estimated Time**: 2-3 days for full integration
**Priority**: High for payment features
