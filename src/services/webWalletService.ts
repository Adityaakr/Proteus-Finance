/**
 * Web Wallet Service - Uses MetaMask and WalletConnect
 * Works on Web only
 */

import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WebWalletService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask
   */
  async connectMetaMask(): Promise<string> {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Get address
      const address = await this.signer.getAddress();

      // Switch to BNB Testnet if not already
      await this.switchToBNBTestnet();

      return address;
    } catch (error: any) {
      console.error('MetaMask connection failed:', error);
      throw new Error(error.message || 'Failed to connect MetaMask');
    }
  }

  /**
   * Switch to BNB Testnet
   */
  async switchToBNBTestnet(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }], // 97 in hex = BNB Testnet
      });
    } catch (switchError: any) {
      // Chain not added yet, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x61',
                chainName: 'BNB Smart Chain Testnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'tBNB',
                  decimals: 18,
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                blockExplorerUrls: ['https://testnet.bscscan.com/'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add BNB Testnet to MetaMask');
        }
      }
    }
  }

  /**
   * Get current connected address
   */
  async getAddress(): Promise<string | null> {
    try {
      if (!this.signer) {
        return null;
      }
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get address:', error);
      return null;
    }
  }

  /**
   * Get balance
   */
  async getBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Sign and send transaction
   */
  async sendTransaction(to: string, value: string): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(value),
      });

      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      throw new Error(error.message || 'Transaction failed');
    }
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }
      return await this.signer.signMessage(message);
    } catch (error: any) {
      console.error('Message signing failed:', error);
      throw new Error(error.message || 'Failed to sign message');
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  /**
   * Listen for account changes
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  /**
   * Listen for chain changes
   */
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

// Export singleton
export const webWalletService = new WebWalletService();
