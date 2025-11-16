# 🔧 Deposit Troubleshooting Guide

## ✅ What Should Happen

When you click "Confirm Deposit":

1. **Console logs** appear showing:
   ```
   🔄 Starting deposit...
   ✅ Ethereum provider found
   ✅ Getting signer...
   ✅ Signer address: 0x...
   📤 Sending transaction...
   ```

2. **MetaMask popup** appears asking you to sign

3. **After signing:**
   ```
   ✅ Transaction sent! 0x...
   ⏳ Waiting for confirmation...
   ✅ Transaction confirmed!
   ```

4. **Success alert** shows with transaction hash

---

## 🐛 Common Issues

### Issue 1: "No Wallet Found"
**Cause:** MetaMask not installed or not connected

**Fix:**
1. Install MetaMask browser extension
2. Connect MetaMask to the site
3. Make sure you're on **BNB Testnet** (Chain ID: 97)

### Issue 2: Nothing happens when clicking "Confirm Deposit"
**Check console logs:**
```javascript
// Open browser console (F12)
// Look for these logs:
🔄 Starting deposit...
hasWindow: true
hasEthereum: true/false  // ← Should be true!
```

**If `hasEthereum: false`:**
- MetaMask is not installed
- Or MetaMask is not connected to the site

**Fix:**
1. Click MetaMask extension
2. Click "Connect" on the site
3. Try deposit again

### Issue 3: "User rejected transaction"
**Cause:** You clicked "Reject" in MetaMask popup

**Fix:**
- Click "Confirm Deposit" again
- When MetaMask popup appears, click "Confirm"

### Issue 4: "Insufficient funds"
**Cause:** Not enough BNB in your wallet

**Fix:**
1. Get testnet BNB from faucet: https://testnet.bnbchain.org/faucet-smart
2. Wait for BNB to arrive
3. Try deposit again

---

## 🔍 Debug Steps

### Step 1: Check Console
Open browser console (F12) and look for logs when you click "Confirm Deposit"

### Step 2: Check MetaMask
1. Is MetaMask installed?
2. Is it connected to the site?
3. Are you on BNB Testnet (Chain ID 97)?
4. Do you have BNB balance?

### Step 3: Check Network
Make sure MetaMask is on **BNB Smart Chain Testnet**:
- Network Name: BNB Smart Chain Testnet
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
- Chain ID: 97
- Currency Symbol: BNB
- Block Explorer: https://testnet.bscscan.com

### Step 4: Test Transaction
Try sending a small amount first:
- Enter: `0.001` BNB
- Click "Confirm Deposit"
- Check console logs
- Sign in MetaMask

---

## 📊 Expected Console Output

```
🔄 Starting deposit... {
  amount: "0.01",
  pool: "BNB-USDT Pool",
  address: "0xF9c36b4fBA23F515b1ae844642F81DC0aDdf6AF6",
  hasWindow: true,
  hasEthereum: true
}
✅ Ethereum provider found, creating provider...
✅ Getting signer...
✅ Signer address: 0x3a159d24634A180f3Ab9ff37868358C73226E672
📤 Sending transaction... {
  to: "0xF9c36b4fBA23F515b1ae844642F81DC0aDdf6AF6",
  value: "0.01 BNB"
}
✅ Transaction sent! 0x6d6547e3cd3ee1b11584098c8558d999365fd96f9b78d0b7d29c6e31fdf80a6b
⏳ Waiting for confirmation...
✅ Transaction confirmed!
```

---

## 🚀 Quick Test

1. **Open browser console** (F12)
2. **Go to Earn tab**
3. **Click "Add Liquidity"** on BNB-USDT Pool
4. **Enter `0.001`** BNB
5. **Click "Confirm Deposit"**
6. **Watch console** - you should see logs immediately
7. **MetaMask popup** should appear
8. **Click "Confirm"** in MetaMask
9. **Wait for success** alert

---

## 📝 Contract Details

**Deployed Contract:**
```
Address: 0xF9c36b4fBA23F515b1ae844642F81DC0aDdf6AF6
Network: BNB Smart Chain Testnet (Chain ID: 97)
View: https://testnet.bscscan.com/address/0xF9c36b4fBA23F515b1ae844642F81DC0aDdf6AF6
```

**All deposits go to this contract!**

---

## ✅ Success Checklist

- [ ] MetaMask installed
- [ ] MetaMask connected to site
- [ ] On BNB Testnet (Chain ID 97)
- [ ] Have testnet BNB balance
- [ ] Console shows logs when clicking deposit
- [ ] MetaMask popup appears
- [ ] Transaction confirmed
- [ ] Success alert appears
- [ ] Transaction visible on BNBScan

If all checked ✅ - **IT WORKS!** 🎉
