import { useContext, useCallback } from 'react';
import { AccountContext } from '../context';

export const useWallet = () => {
  const {
    walletConnected,
    walletAddress,
    walletChainId,
    walletProvider,
    walletError,
    walletLoading,
    setWalletConnected,
    setWalletAddress,
    setWalletChainId,
    setWalletProvider,
    setWalletError,
    setWalletLoading
  } = useContext(AccountContext);

  // Get the appropriate provider based on wallet type
  const getProvider = useCallback(() => {
    // First priority: Farcaster wallet provider
    if (typeof window !== 'undefined' && window.farcasterEthProvider) {
      console.log('Using Farcaster wallet provider');
      return window.farcasterEthProvider;
    }
    // Second priority: Explicitly set wallet provider
    if (walletProvider === 'farcaster' && typeof window !== 'undefined' && window.farcasterEthProvider) {
      console.log('Using explicitly set Farcaster wallet provider');
      return window.farcasterEthProvider;
    }
    // Fallback: Generic ethereum provider
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('Using generic ethereum provider');
      return window.ethereum;
    }
    console.log('No wallet provider available');
    return null;
  }, [walletProvider]);

  const connectWallet = useCallback(async (provider) => {
    setWalletLoading(true);
    setWalletError(null);

    try {
      let address, chainId;

      if (provider === 'metamask') {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
          chainId = await window.ethereum.request({ method: 'eth_chainId' });
        } else {
          throw new Error('MetaMask not installed');
        }
      } else if (provider === 'walletconnect') {
        // Simplified WalletConnect - can be enhanced later with proper WC implementation
        throw new Error('WalletConnect not configured. Please use MetaMask or Coinbase Wallet for now.');
      } else if (provider === 'coinbase') {
        if (typeof window !== 'undefined' && window.ethereum && window.ethereum.isCoinbaseWallet) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
          chainId = await window.ethereum.request({ method: 'eth_chainId' });
        } else {
          throw new Error('Coinbase Wallet not available');
        }
      }

      if (address && chainId) {
        setWalletAddress(address);
        setWalletChainId(chainId);
        setWalletProvider(provider);
        setWalletConnected(true);
        setWalletError(null);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  }, [setWalletLoading, setWalletError, setWalletAddress, setWalletChainId, setWalletProvider, setWalletConnected]);

  // Auto-detect and connect to Farcaster wallet when available
  const detectFarcasterWallet = useCallback(async () => {
    if (typeof window !== 'undefined' && window.farcasterEthProvider && !walletConnected) {
      console.log('Auto-detecting Farcaster wallet...');
      try {
        setWalletLoading(true);
        setWalletError(null);
        
        // Request accounts from Farcaster wallet
        const accounts = await window.farcasterEthProvider.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const chainId = await window.farcasterEthProvider.request({ method: 'eth_chainId' });
        
        if (address && chainId) {
          console.log('Farcaster wallet auto-connected:', { address, chainId });
          setWalletAddress(address);
          setWalletChainId(chainId);
          setWalletProvider('farcaster');
          setWalletConnected(true);
          setWalletError(null);
        }
      } catch (error) {
        console.error('Farcaster wallet auto-connection failed:', error);
        setWalletError(error.message);
      } finally {
        setWalletLoading(false);
      }
    }
  }, [walletConnected, setWalletLoading, setWalletError, setWalletAddress, setWalletChainId, setWalletProvider, setWalletConnected]);

  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletChainId(null);
    setWalletProvider(null);
    setWalletError(null);
    
    // Clear Farcaster provider from window
    if (typeof window !== 'undefined' && window.farcasterEthProvider) {
      delete window.farcasterEthProvider;
    }
  }, [setWalletConnected, setWalletAddress, setWalletChainId, setWalletProvider, setWalletError]);

  const switchNetwork = useCallback(async (targetChainId) => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      } else {
        throw new Error('No provider available');
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }, [getProvider]);

  const sendTransaction = useCallback(async (to, value, data = '0x') => {
    if (!walletConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }

      const transactionParameters = {
        to,
        from: walletAddress,
        value: '0x' + Number(value).toString(16),
        data,
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return txHash;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }, [walletConnected, walletAddress, getProvider]);

  const signMessage = useCallback(async (message) => {
    if (!walletConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }

      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      return signature;
    } catch (error) {
      console.error('Message signing error:', error);
      throw error;
    }
  }, [walletConnected, walletAddress, getProvider]);

  const getBalance = useCallback(async () => {
    if (!walletConnected || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }

      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
      });

      return balance;
    } catch (error) {
      console.error('Balance fetch error:', error);
      throw error;
    }
  }, [walletConnected, walletAddress, getProvider]);

  return {
    // State
    walletConnected,
    walletAddress,
    walletChainId,
    walletProvider,
    walletError,
    walletLoading,
    
    // Methods
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
    signMessage,
    getBalance,
    getProvider,
    detectFarcasterWallet,
    
    // Setters
    setWalletError,
    setWalletLoading
  };
}; 