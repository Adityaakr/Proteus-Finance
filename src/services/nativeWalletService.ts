/**
 * Native Biometric Wallet Service
 * 
 * Secure wallet with biometric authentication using device's secure enclave.
 * Private keys never leave the device and are protected by Face ID/Touch ID.
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import { Wallet, providers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_KEY_PREFIX = 'wallet_';
const ADDRESS_KEY = 'wallet_address';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545';

export class NativeWalletService {
  private biometrics: ReactNativeBiometrics;
  private provider: providers.JsonRpcProvider;

  constructor() {
    this.biometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
    this.provider = new providers.JsonRpcProvider(RPC_URL);
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const { available, biometryType } = await this.biometrics.isSensorAvailable();
      return available && (biometryType === BiometryTypes.FaceID || biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.Biometrics);
    } catch (error) {
      console.error('Biometric check failed:', error);
      return false;
    }
  }

  /**
   * Create a new wallet with biometric protection
   */
  async createWallet(username: string): Promise<string> {
    try {
      // Check biometric availability
      const available = await this.isBiometricAvailable();
      if (!available) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Generate new wallet
      const wallet = Wallet.createRandom();
      
      // Store private key with biometric protection
      await Keychain.setGenericPassword(
        `${WALLET_KEY_PREFIX}${username}`,
        wallet.privateKey,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          service: `flex_wallet_${username}`,
        }
      );

      // Store address for quick access (not sensitive)
      await AsyncStorage.setItem(ADDRESS_KEY, wallet.address);
      await AsyncStorage.setItem('wallet_username', username);

      return wallet.address;
    } catch (error) {
      console.error('Wallet creation failed:', error);
      throw new Error('Failed to create wallet: ' + (error as Error).message);
    }
  }

  /**
   * Get stored wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ADDRESS_KEY);
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Sign a transaction with biometric authentication
   */
  async signTransaction(transaction: {
    to: string;
    value: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
  }): Promise<string> {
    try {
      // Prompt for biometric authentication
      const { success } = await this.biometrics.simplePrompt({
        promptMessage: 'Authenticate to sign transaction',
        cancelButtonText: 'Cancel',
      });

      if (!success) {
        throw new Error('Biometric authentication failed');
      }

      // Get username
      const username = await AsyncStorage.getItem('wallet_username');
      if (!username) {
        throw new Error('No wallet found');
      }

      // Retrieve private key from secure storage
      const credentials = await Keychain.getGenericPassword({
        service: `flex_wallet_${username}`,
      });

      if (!credentials) {
        throw new Error('Failed to retrieve wallet credentials');
      }

      // Create wallet instance
      const wallet = new Wallet(credentials.password, this.provider);

      // Prepare transaction
      const tx = {
        to: transaction.to,
        value: transaction.value,
        data: transaction.data || '0x',
        gasLimit: transaction.gasLimit || '21000',
        gasPrice: transaction.gasPrice || await this.provider.getGasPrice(),
      };

      // Sign transaction
      const signedTx = await wallet.signTransaction(tx);
      
      return signedTx;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw new Error('Failed to sign transaction: ' + (error as Error).message);
    }
  }

  /**
   * Send a signed transaction
   */
  async sendTransaction(signedTx: string): Promise<string> {
    try {
      const tx = await this.provider.sendTransaction(signedTx);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Transaction send failed:', error);
      throw new Error('Failed to send transaction: ' + (error as Error).message);
    }
  }

  /**
   * Sign a message with biometric authentication
   */
  async signMessage(message: string): Promise<string> {
    try {
      // Prompt for biometric authentication
      const { success } = await this.biometrics.simplePrompt({
        promptMessage: 'Authenticate to sign message',
        cancelButtonText: 'Cancel',
      });

      if (!success) {
        throw new Error('Biometric authentication failed');
      }

      // Get username
      const username = await AsyncStorage.getItem('wallet_username');
      if (!username) {
        throw new Error('No wallet found');
      }

      // Retrieve private key
      const credentials = await Keychain.getGenericPassword({
        service: `flex_wallet_${username}`,
      });

      if (!credentials) {
        throw new Error('Failed to retrieve wallet credentials');
      }

      // Create wallet and sign message
      const wallet = new Wallet(credentials.password);
      const signature = await wallet.signMessage(message);
      
      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw new Error('Failed to sign message: ' + (error as Error).message);
    }
  }

  /**
   * Delete wallet (for testing/logout)
   */
  async deleteWallet(): Promise<void> {
    try {
      const username = await AsyncStorage.getItem('wallet_username');
      if (username) {
        await Keychain.resetGenericPassword({
          service: `flex_wallet_${username}`,
        });
      }
      await AsyncStorage.removeItem(ADDRESS_KEY);
      await AsyncStorage.removeItem('wallet_username');
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      throw new Error('Failed to delete wallet');
    }
  }
}

// Export singleton instance
export const nativeWalletService = new NativeWalletService();
