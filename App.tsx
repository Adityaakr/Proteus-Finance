import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Modal, Alert, Linking, TextInput, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { ethers } from 'ethers';
import { walletService } from './src/services/walletService';
import { PremiumContentScreen } from './src/screens/PremiumContentScreen';

const isWeb = Platform.OS === 'web';

// Polyfill Buffer for web
if (isWeb && typeof global.Buffer === 'undefined') {
  const { Buffer } = require('buffer');
  global.Buffer = Buffer;
}

// Import Privy only for web
let PrivyProvider: any, usePrivy: any, useWallets: any, useLoginWithEmail: any, useCreateWallet: any, useSendTransaction: any;
if (isWeb) {
  try {
    const privy = require('@privy-io/react-auth');
    PrivyProvider = privy.PrivyProvider;
    usePrivy = privy.usePrivy;
    useWallets = privy.useWallets;
    useLoginWithEmail = privy.useLoginWithEmail;
    useCreateWallet = privy.useCreateWallet;
    useSendTransaction = privy.useSendTransaction;
    console.log('🔧 Privy hooks loaded:', { 
      hasProvider: !!PrivyProvider, 
      hasUsePrivy: !!usePrivy, 
      hasSendTransaction: !!useSendTransaction 
    });
  } catch (error) {
    console.error('❌ Failed to load Privy:', error);
  }
}
import { LandingScreen } from './src/screens/LandingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreditScreen } from './src/screens/CreditScreen';
import { AgentsScreen } from './src/screens/AgentsScreen';
import { EarnScreen } from './src/screens/EarnScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { SendScreen } from './src/screens/SendScreen';
import { FXPayScreen } from './src/screens/FXPayScreen';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from './src/theme/colors';

const privyAppId = Constants.expoConfig?.extra?.privyAppId || 'cmi0pw3ks00gyky0chb1o43ww';

// Web-specific component with Privy hooks
function WebAppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showFXPayModal, setShowFXPayModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');
  const [walletCreationAttempted, setWalletCreationAttempted] = useState(false);

  // Privy hooks (web only)
  const { user, authenticated, ready, logout, login } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const { sendTransaction: privySendTransaction } = useSendTransaction();
  
  // Make sendTransaction available in scope
  const sendTransaction = privySendTransaction;

  // Debug: Log modal state
  useEffect(() => {
    console.log('📊 Modal State:', { showSendModal, hasWallet: !!walletAddress, hasSendTx: !!sendTransaction });
  }, [showSendModal, walletAddress, sendTransaction]);

  // Auto-create wallet if authenticated but no wallet (only once)
  useEffect(() => {
    if (authenticated && ready && (!wallets || wallets.length === 0) && createWallet && !walletCreationAttempted) {
      console.log('🔨 Creating wallet - user authenticated but no wallet');
      console.log('Ready:', ready, 'Authenticated:', authenticated, 'Wallets:', wallets);
      setWalletCreationAttempted(true);
      
      // Try to create with additional flag in case user already has one
      createWallet({ createAdditional: true })
        .then((wallet: any) => {
          console.log('✅ Wallet created:', wallet);
        })
        .catch((err: any) => {
          console.error('❌ Failed to create wallet:', err);
          // If it fails, the user might already have a wallet that's not showing up
          // This is a Privy SDK issue - wallets exist but useWallets() returns empty
          setWalletCreationAttempted(false);
        });
    }
  }, [authenticated, ready, wallets, createWallet, walletCreationAttempted]);

  // FORCE  // Update wallet address when Privy wallets change
  useEffect(() => {
    console.log('=== PRIVY WALLET CHECK ===');
    console.log('Authenticated:', authenticated);
    console.log('Wallets:', wallets);
    
    if (authenticated && wallets && wallets.length > 0) {
      const privyAddress = wallets[0].address;
      console.log('✅ Current Privy wallet:', privyAddress);
      
      // Check if we have a saved wallet in localStorage
      const savedWallet = localStorage.getItem('flex_wallet_address');
      
      // Look for the specific wallet in Privy's wallets
      const targetAddress = '0x9C6CCbC95c804C3FB0024e5f10e2e978855280B3';
      const targetWallet = wallets.find((w: any) => 
        w.address.toLowerCase() === targetAddress.toLowerCase()
      );
      
      console.log('🔍 All Privy wallet addresses:', wallets.map((w: any) => w.address));
      
      if (targetWallet) {
        console.log('✅ Found target wallet in Privy:', targetAddress);
        setWalletAddress(targetAddress);
        localStorage.setItem('flex_wallet_address', targetAddress);
      } else {
        console.log('⚠️ Target wallet NOT FOUND in Privy!');
        console.log('⚠️ Looking for:', targetAddress);
        console.log('⚠️ Available:', wallets.map((w: any) => w.address));
        alert(`⚠️ Wallet ${targetAddress} not found in your Privy account. Using ${privyAddress} instead.`);
        setWalletAddress(privyAddress);
        localStorage.setItem('flex_wallet_address', privyAddress);
      }
    } else {
      console.log('❌ No Privy wallet available');
      // Check if we have a saved wallet to use
      const savedWallet = localStorage.getItem('flex_wallet_address');
      if (savedWallet) {
        console.log('✅ Using saved wallet (not authenticated):', savedWallet);
        setWalletAddress(savedWallet);
      }
    }
  }, [wallets, authenticated]);

  // Debug: Log when authenticated changes
  useEffect(() => {
    console.log('=== USER INFO ===');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('Email:', user?.email?.address);
    console.log('Authenticated:', authenticated, 'Wallets:', wallets?.length || 0);
    if (wallets && wallets.length > 0) {
      console.log('Available wallets:', wallets.map((w: any) => w.address));
    }
  }, [authenticated, wallets, user]);

  // Function to fetch balance
  const fetchBalance = async () => {
    if (!walletAddress) return;
    
    console.log('🔄 Fetching balance for:', walletAddress);
    try {
      const response = await fetch('https://data-seed-prebsc-1-s1.binance.org:8545/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
          id: 1,
        }),
      });
      
      const data = await response.json();
      console.log('Balance response:', data);
      
      if (data.result) {
        const balanceWei = parseInt(data.result, 16);
        const balanceEth = (balanceWei / 1e18).toFixed(4);
        console.log('✅ Balance:', balanceEth, 'BNB');
        setBalance(balanceEth);
      }
    } catch (err) {
      console.error('❌ Failed to fetch balance:', err);
    }
  };

  // Function to send BNB using Privy
  const handleSendBNB = async (toAddress: string, amount: string) => {
    console.log('🔥 handleSendBNB called with:', { toAddress, amount, walletAddress, hasSendTransaction: !!sendTransaction });
    console.log('Available wallets:', wallets?.map((w: any) => w.address));
    
    if (!walletAddress) {
      alert('❌ Wallet not connected');
      return;
    }

    if (!sendTransaction) {
      alert('❌ Send function not available. Make sure you are logged in with Privy.');
      return;
    }

    console.log('🔍 sendTransaction type:', typeof sendTransaction);
    console.log('🔍 Available wallets:', wallets);
    console.log('🔍 Wallet address:', walletAddress);

    try {
      console.log('💸 Sending', amount, 'BNB to', toAddress);
      
      // Use ethers.parseEther like EarnScreen does
      const valueInWei = ethers.parseEther(amount).toString();
      console.log('Value in Wei:', valueInWei);
      
      // Call Privy's sendTransaction with proper format per docs
      // First param: transaction request
      // Second param: options with address
      const txRequest = {
        to: toAddress,
        value: valueInWei,
        chainId: 97,
      };
      
      // Specify the wallet address to use for signing
      const options = { address: walletAddress };
      console.log('📤 Calling Privy sendTransaction with:', txRequest, options);
      const result = await sendTransaction(txRequest, options);
      
      console.log('✅ Transaction result:', result);
      
      // Refresh balance after sending
      setTimeout(() => fetchBalance(), 2000);
      
      return result;
    } catch (error: any) {
      console.error('❌ Send failed:', error);
      alert(`❌ Failed to send: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  // Fetch balance when wallet address changes
  useEffect(() => {
    fetchBalance();
  }, [walletAddress]);

  return <AppContentUI 
    showLanding={showLanding}
    setShowLanding={setShowLanding}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    showWalletModal={showWalletModal}
    setShowWalletModal={setShowWalletModal}
    showSendModal={showSendModal}
    setShowSendModal={setShowSendModal}
    showFXPayModal={showFXPayModal}
    setShowFXPayModal={setShowFXPayModal}
    walletAddress={walletAddress}
    setWalletAddress={setWalletAddress}
    email={email}
    setEmail={setEmail}
    code={code}
    setCode={setCode}
    codeSent={codeSent}
    setCodeSent={setCodeSent}
    isCreatingWallet={isCreatingWallet}
    setIsCreatingWallet={setIsCreatingWallet}
    showWalletDropdown={showWalletDropdown}
    setShowWalletDropdown={setShowWalletDropdown}
    balance={balance}
    fetchBalance={fetchBalance}
    handleSendBNB={handleSendBNB}
    sendTransaction={sendTransaction}
    wallets={wallets}
    isWeb={true}
    privyHooks={{ authenticated, login, logout }}
  />;
}

// Mobile-specific component without Privy
function MobileAppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showFXPayModal, setShowFXPayModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');

  // Load mobile wallet
  useEffect(() => {
    walletService.getAddress().then(addr => {
      if (addr) setWalletAddress(addr);
    });
  }, []);

  return <AppContentUI 
    showLanding={showLanding}
    setShowLanding={setShowLanding}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    showWalletModal={showWalletModal}
    setShowWalletModal={setShowWalletModal}
    showSendModal={showSendModal}
    setShowSendModal={setShowSendModal}
    showFXPayModal={showFXPayModal}
    setShowFXPayModal={setShowFXPayModal}
    walletAddress={walletAddress}
    setWalletAddress={setWalletAddress}
    email={email}
    setEmail={setEmail}
    code={code}
    setCode={setCode}
    codeSent={codeSent}
    setCodeSent={setCodeSent}
    isCreatingWallet={isCreatingWallet}
    setIsCreatingWallet={setIsCreatingWallet}
    showWalletDropdown={showWalletDropdown}
    setShowWalletDropdown={setShowWalletDropdown}
    balance={balance}
    fetchBalance={null}
    handleSendBNB={null}
    isWeb={false}
    privyHooks={null}
  />;
}

// Shared UI component
function AppContentUI({ 
  showLanding, setShowLanding, activeTab, setActiveTab, 
  showWalletModal, setShowWalletModal, showSendModal, setShowSendModal, showFXPayModal, setShowFXPayModal,
  walletAddress, setWalletAddress, email, setEmail, code, setCode, codeSent, setCodeSent,
  isCreatingWallet, setIsCreatingWallet, showWalletDropdown, setShowWalletDropdown, balance, fetchBalance, handleSendBNB,
  sendTransaction,
  wallets,
  isWeb, privyHooks 
}: any) {
  const webViewRef = useRef<WebView>(null);

  const handleWalletMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);
      
      switch (data.type) {
        case 'WALLET_CREATED':
        case 'WALLET_LOADED':
        case 'WALLET_FOUND':
          setWalletAddress(data.address);
          setShowWalletModal(false);
          Alert.alert('Success!', `Wallet connected!\n${data.address.slice(0, 10)}...${data.address.slice(-8)}`);
          break;
        case 'WEBVIEW_READY':
          console.log('WebView is ready');
          break;
        case 'STORAGE_UPDATE':
          console.log('Storage updated:', data.key);
          break;
        case 'ERROR':
          console.error('WebView error:', data.message);
          Alert.alert('Error', data.message);
          break;
      }
    } catch (error) {
      console.error('Error parsing wallet message:', error);
    }
  };

  if (showLanding) {
    return <LandingScreen onLaunchApp={() => setShowLanding(false)} />;
  }

  const tabs = [
    { id: 'Home', icon: 'home' },
    { id: 'Credit', icon: 'card' },
    { id: 'Agents', icon: 'hardware-chip' },
    { id: 'Earn', icon: 'trending-up' },
    { id: 'More', icon: 'ellipsis-horizontal' },
  ];

  const renderScreen = () => {
    console.log('🎬 Rendering screen:', activeTab, 'hasSendTransaction:', !!sendTransaction, 'wallets:', wallets);
    switch (activeTab) {
      case 'Home': return <HomeScreen walletAddress={walletAddress} balance={balance} onSendClick={() => setShowSendModal(true)} onFXPayClick={() => setShowFXPayModal(true)} />;
      case 'Credit': return <CreditScreen walletAddress={walletAddress || undefined} sendTransaction={sendTransaction} />;
      case 'Agents': return <AgentsScreen walletAddress={walletAddress || undefined} />;
      case 'Earn': return <EarnScreen sendTransaction={sendTransaction || undefined} wallets={wallets} />;
      case 'More': return <MoreScreen walletAddress={walletAddress || undefined} />;
      default: return <HomeScreen walletAddress={walletAddress} balance={balance} onSendClick={() => setShowSendModal(true)} onFXPayClick={() => setShowFXPayModal(true)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <View>
            <Text style={styles.appName}>FLEX</Text>
            <Text style={styles.network}>BPN • BNB Chain</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.testnetBadge}>
            <Text style={styles.testnetText}>Testnet</Text>
          </View>
          {walletAddress ? (
            <View style={{ position: 'relative', zIndex: 9999 }}>
              <TouchableOpacity 
                style={styles.walletButton}
                onPress={() => setShowWalletDropdown(!showWalletDropdown)}
              >
                <Ionicons name="wallet" size={16} color={COLORS.success} />
                <Text style={styles.walletText}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Text>
                <Ionicons 
                  name={showWalletDropdown ? "chevron-up" : "chevron-down"} 
                  size={14} 
                  color={COLORS.textSecondary} 
                  style={{ marginLeft: 4 }} 
                />
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {showWalletDropdown && (
                <View style={styles.walletDropdown}>
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownTitle}>My Wallet</Text>
                    <TouchableOpacity onPress={() => setShowWalletDropdown(false)}>
                      <Ionicons name="close" size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.dropdownSection}>
                    <Text style={styles.dropdownLabel}>IDENTITY</Text>
                    <Text style={styles.identityText}>aditya.bnb</Text>
                  </View>

                  <View style={styles.dropdownSection}>
                    <Text style={styles.dropdownLabel}>ADDRESS</Text>
                    <View style={styles.addressContainer}>
                      <Text style={styles.addressTextSmall} numberOfLines={1} ellipsizeMode="middle">
                        {walletAddress}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.copyButtonLarge}
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          navigator.clipboard.writeText(walletAddress);
                          alert('✓ Address copied to clipboard!');
                        }
                      }}
                    >
                      <Ionicons name="copy-outline" size={16} color={COLORS.text} />
                      <Text style={styles.copyButtonText}>Copy Address</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dropdownSection}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.dropdownLabel}>BALANCE</Text>
                      {fetchBalance && (
                        <TouchableOpacity onPress={fetchBalance} style={styles.refreshIconButton}>
                          <Ionicons name="refresh" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.balanceText}>{balance} BNB</Text>
                    <Text style={styles.balanceUsd}>≈ ${(parseFloat(balance) * 600).toFixed(2)} USD</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={async () => {
                      console.log('🚪 Logout button clicked!');
                      console.log('isWeb:', isWeb, 'authenticated:', privyHooks?.authenticated);
                      
                      try {
                        if (privyHooks?.logout) {
                          console.log('Calling Privy logout...');
                          await privyHooks.logout();
                        }
                        console.log('Clearing localStorage...');
                        localStorage.clear();
                        setWalletAddress(null);
                        setShowWalletDropdown(false);
                        console.log('✅ Reloading page...');
                        window.location.reload();
                      } catch (error) {
                        console.error('❌ Logout error:', error);
                        // Force reload anyway
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                  >
                    <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <>
              {isWeb && privyHooks?.authenticated ? (
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={() => {
                    if (confirm('Logout and clear wallet?')) {
                      privyHooks.logout();
                      setWalletAddress(null);
                    }
                  }}
                >
                  <Ionicons name="log-out" size={16} color={COLORS.text} />
                  <Text style={styles.connectText}>Logout</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={() => {
                    if (isWeb && privyHooks?.login) {
                      privyHooks.login();
                    } else {
                      setShowWalletModal(true);
                    }
                  }}
                >
                  <Ionicons name="mail" size={16} color={COLORS.text} />
                  <Text style={styles.connectText}>{isWeb ? 'Login' : 'Connect'}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Smart Wallet Modal */}
      <Modal
        visible={showWalletModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Login to FLEX</Text>
            <TouchableOpacity onPress={() => setShowWalletModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          {isWeb ? (
            // Web: Use Privy's built-in modal (closes this modal and opens Privy's)
            <View style={styles.browserInstructions}>
              <Ionicons name="mail" size={64} color={COLORS.primary} />
              <Text style={styles.instructionsTitle}>Login with Privy</Text>
              <Text style={styles.instructionsText}>
                Click below to open Privy's secure login modal.{'\n\n'}
                Your wallet will be created automatically after login.
              </Text>

              <TouchableOpacity
                style={styles.openBrowserButton}
                onPress={() => {
                  setShowWalletModal(false);
                  privyHooks?.login();
                }}
              >
                <Ionicons name="shield-checkmark" size={20} color={COLORS.text} />
                <Text style={styles.openBrowserText}>Open Privy Login</Text>
              </TouchableOpacity>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                  <Text style={styles.featureText}>Secure email authentication</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="wallet" size={16} color={COLORS.primary} />
                  <Text style={styles.featureText}>Automatic wallet creation</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="flash" size={16} color={COLORS.primary} />
                  <Text style={styles.featureText}>Instant access to BNB</Text>
                </View>
              </View>
            </View>
          ) : (
            // Mobile: Simple Wallet
            <View style={styles.browserInstructions}>
              <Ionicons name="wallet" size={64} color={COLORS.primary} />
              <Text style={styles.instructionsTitle}>Create Wallet</Text>
              <Text style={styles.instructionsText}>
                Create your wallet instantly.{'\n\n'}
                Your private key is stored securely on your device.
              </Text>
              <TextInput
                style={styles.usernameInput}
                placeholder="Enter username"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.openBrowserButton}
                onPress={async () => {
                  if (!email) {
                    Alert.alert('Error', 'Please enter a username');
                    return;
                  }
                  try {
                    const address = await walletService.connect(email);
                    setWalletAddress(address);
                    setShowWalletModal(false);
                    Alert.alert('Wallet Created!', `Address: ${address.slice(0, 10)}...${address.slice(-8)}`);
                    setEmail('');
                  } catch (error: any) {
                    Alert.alert('Error', error.message);
                  }
                }}
              >
                <Ionicons name="shield-checkmark" size={20} color={COLORS.text} />
                <Text style={styles.openBrowserText}>Create Wallet</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Keep old code hidden for reference */}
          <View style={{ display: 'none' }}>
            {isWeb ? (
              <>
                <Ionicons name="globe" size={64} color={COLORS.primary} />
                <Text style={styles.instructionsTitle}>Connect MetaMask</Text>
                <Text style={styles.instructionsText}>
                  Connect your MetaMask wallet to use FLEX on BNB Testnet.{'\n\n'}
                  {!walletService.isMetaMaskAvailable() && 'Please install MetaMask extension first.'}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="wallet" size={64} color={COLORS.primary} />
                <Text style={styles.instructionsTitle}>Create Wallet</Text>
                <Text style={styles.instructionsText}>
                  Create your wallet instantly.{'\n\n'}
                  Your private key is stored securely on your device.
                </Text>
                <TextInput
                  style={styles.usernameInput}
                  placeholder="Enter username"
                  placeholderTextColor={COLORS.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}
            
            <TouchableOpacity
              style={[styles.openBrowserButton, (isWeb ? !walletService.isMetaMaskAvailable() : (!biometricAvailable || !username)) || isCreatingWallet ? styles.buttonDisabled : null]}
              disabled={(isWeb ? !walletService.isMetaMaskAvailable() : (!biometricAvailable || !username)) || isCreatingWallet}
              onPress={async () => {
                try {
                  setIsCreatingWallet(true);
                  const address = await walletService.connect(username);
                  setWalletAddress(address);
                  setShowWalletModal(false);
                  const platform = walletService.getPlatform();
                  const walletType = platform === 'web' ? 'MetaMask' : 'Wallet';
                  Alert.alert(
                    'Wallet Connected!',
                    `Your ${walletType} has been connected!\n\nAddress: ${address.slice(0, 10)}...${address.slice(-8)}\n\nYou can now use it to sign transactions on BNB Testnet.`
                  );
                  setUsername('');
                } catch (error) {
                  Alert.alert('Error', (error as Error).message);
                } finally {
                  setIsCreatingWallet(false);
                }
              }}
            >
              {isCreatingWallet ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.text} />
                  <Text style={styles.openBrowserText}>
                    {isWeb ? 'Connect MetaMask' : 'Create Secure Wallet'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>
                  {isWeb ? 'Your keys, your crypto' : 'Instant wallet creation'}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>
                  {isWeb ? 'BNB Testnet support' : 'Secure local storage'}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Sign transactions in-app</Text>
              </View>
            </View>
          </View>
          
          <WebView
            ref={webViewRef}
            source={{ uri: 'https://valium-alfred-movements-aid.trycloudflare.com' }}
            style={styles.webview}
            onMessage={handleWalletMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={`
              (function() {
                // Log all errors
                window.addEventListener('error', function(e) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ERROR',
                    message: e.message
                  }));
                });
                
                const extractAddress = (value) => {
                  if (!value || typeof value !== 'string') {
                    return null;
                  }
                  const trimmed = value.trim();
                  if (trimmed.startsWith('0x') && trimmed.length === 42) {
                    return trimmed;
                  }
                  try {
                    const parsed = JSON.parse(trimmed);
                    if (
                      parsed &&
                      typeof parsed === 'object' &&
                      parsed.account &&
                      typeof parsed.account === 'string' &&
                      parsed.account.startsWith('0x') &&
                      parsed.account.length === 42
                    ) {
                      return parsed.account;
                    }
                  } catch (err) {
                    // not valid JSON, ignore
                  }
                  return null;
                };
                
                // Monitor localStorage changes
                const originalSetItem = window.localStorage.setItem;
                window.localStorage.setItem = function(key, value) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'STORAGE_UPDATE',
                    key: key,
                    value: value
                  }));
                  
                  const address = extractAddress(value);
                  if (address) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'WALLET_CREATED',
                      address: address,
                      key: key
                    }));
                  }
                  
                  return originalSetItem.apply(this, arguments);
                };
                
                // Check for wallet in localStorage every 2 seconds
                setInterval(() => {
                  const keys = Object.keys(localStorage);
                  for (let key of keys) {
                    const value = localStorage.getItem(key);
                    const address = extractAddress(value);
                    if (address) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'WALLET_FOUND',
                        address: address,
                        key: key
                      }));
                    }
                  }
                }, 2000);
                
                // Send ready message
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'WEBVIEW_READY'
                }));
              })();
              true;
            `}
            onError={(error) => {
              console.error('WebView error:', error);
              Alert.alert(
                'Connection Error',
                'Could not load smart wallet. Please check your internet connection.'
              );
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Send Modal */}
      <Modal
        visible={showSendModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          console.log('🔙 Send modal closing');
          setShowSendModal(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          {walletAddress ? (
            <SendScreen
              walletAddress={walletAddress}
              onClose={() => {
                console.log('🔙 SendScreen close called');
                setShowSendModal(false);
              }}
              onSend={handleSendBNB}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: COLORS.text }}>No wallet connected</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* FX Pay Modal */}
      <Modal
        visible={showFXPayModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFXPayModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <FXPayScreen balance={balance} walletAddress={walletAddress || undefined} />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowFXPayModal(false)}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Floating Send Button */}
      {walletAddress && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            console.log('🚀 FAB clicked, opening send modal');
            setShowSendModal(true);
          }}
        >
          <Ionicons name="send" size={24} color={COLORS.text} />
        </TouchableOpacity>
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => setActiveTab(tab.id)}
            >
              <View style={[styles.tabIconContainer, isActive && styles.tabIconActive]}>
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={isActive ? COLORS.primary : COLORS.textSecondary}
                />
              </View>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// Wrap with PrivyProvider (web only)
export default function App() {
  console.log('🚀 App starting...', { isWeb, hasPrivyProvider: !!PrivyProvider });
  
  // Simple fallback for testing
  if (!isWeb) {
    return <MobileAppContent />;
  }
  
  if (!PrivyProvider) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }
  
  try {
    return (
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email'],
          appearance: {
            theme: 'dark',
            accentColor: '#FFD700',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
            requireUserPasswordOnCreate: false,
            noPromptOnSignature: false,
          },
          // Enable wallet recovery
          mfa: {
            noPromptOnMfaRequired: false,
          },
          supportedChains: [
            {
              id: 97,
              name: 'BNB Smart Chain Testnet',
              network: 'bsc-testnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'tBNB',
                decimals: 18,
              },
              rpcUrls: {
                default: {
                  http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                },
                public: {
                  http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                },
              },
              blockExplorers: {
                default: {
                  name: 'BscScan',
                  url: 'https://testnet.bscscan.com',
                },
              },
              testnet: true,
            },
          ],
          // Enable session storage to remember users
          legal: {
            termsAndConditionsUrl: '',
            privacyPolicyUrl: '',
          },
        }}
      >
        <WebAppContent />
      </PrivyProvider>
    );
  } catch (error) {
    console.error('❌ Error rendering Privy app:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 20, marginBottom: 20 }}>⚠️ Error</Text>
        <Text style={{ color: '#fff', textAlign: 'center', padding: 20 }}>
          Failed to load app. Check console for details.
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
    zIndex: 1000,
    position: 'relative',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  appName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  network: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    position: 'relative',
    zIndex: 10000,
  },
  testnetBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
  },
  testnetText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
  },
  walletText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  connectText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  placeholderText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  placeholderSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: `${COLORS.primary}10`,
  },
  tabText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  webview: {
    flex: 1,
  },
  tempWalletSection: {
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  tempTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tempSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  tempButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  tempButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  browserInstructions: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  instructionsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  openBrowserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  openBrowserText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  orText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginVertical: SPACING.md,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  pasteButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  usernameInput: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  featuresList: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  walletDropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 300,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dropdownSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  identityText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  addressContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  addressTextSmall: {
    fontSize: 11,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    marginRight: SPACING.sm,
  },
  balanceText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    margin: SPACING.sm,
    backgroundColor: `${COLORS.error}10`,
    borderRadius: BORDER_RADIUS.md,
  },
  logoutText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  copyButton: {
    padding: SPACING.xs,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  copyButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  copyButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  balanceUsd: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  refreshIconButton: {
    padding: SPACING.xs,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: BORDER_RADIUS.sm,
  },
  closeModalButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
