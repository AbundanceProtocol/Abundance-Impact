'use client'

import React, { useState, useEffect, useContext } from 'react';
import { AccountContext } from '../../context';
import { FaWallet, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { SiWalletconnect } from 'react-icons/si';

export default function WalletConnect() {
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
    setWalletLoading,
    isMiniApp
  } = useContext(AccountContext);

  const [copied, setCopied] = useState(false);
  const [ethProvider, setEthProvider] = useState(null);

  // Auto-connect wallet when in Farcaster Mini App
  useEffect(() => {
    if (isMiniApp && !walletConnected && !walletLoading) {
      autoConnectWallet();
    }
  }, [isMiniApp, walletConnected, walletLoading]);

  const autoConnectWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);

      // Import the Farcaster Mini App SDK
      const { sdk } = await import('@farcaster/miniapp-sdk');
      
      // Check if we're in a Mini App
      const isInMiniApp = await sdk.isInMiniApp();
      
      if (isInMiniApp) {
        // Get the user context which includes wallet information
        const context = await sdk.context;
        
        if (context?.user?.custodyAddress) {
          const address = context.user.custodyAddress;
          
          // Get the Ethereum provider using the correct SDK method
          const provider = await sdk.wallet.getEthereumProvider();
          
          if (provider) {
            // Store the provider for later use
            setEthProvider(provider);
            
            // Set wallet connection state
            setWalletAddress(address);
            setWalletProvider('farcaster');
            setWalletConnected(true);
            
            // Get the actual chain ID from the provider
            try {
              const chainId = await provider.request({ method: 'eth_chainId' });
              setWalletChainId(chainId);
            } catch (chainError) {
              console.warn('Could not get chain ID, defaulting to Base:', chainError);
              setWalletChainId('0x2105'); // Default to Base
            }
            
            // Store provider in window for useWallet hook compatibility
            if (typeof window !== 'undefined') {
              window.farcasterEthProvider = provider;
            }
            
            console.log('Auto-connected to wallet:', address);
            console.log('Provider available:', !!provider);
          } else {
            setWalletError('Could not get Ethereum provider from Farcaster');
          }
        } else {
          setWalletError('No custody address found in user context');
        }
      } else {
        setWalletError('Not in a Farcaster Mini App environment');
      }
    } catch (error) {
      console.error('Auto-connect failed:', error);
      setWalletError(error.message || 'Failed to auto-connect wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum';
      case '0xa':
        return 'Optimism';
      case '0xa4b1':
        return 'Arbitrum';
      case '0x2105':
        return 'Base';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'metamask':
        return <FaWallet size={20} />;
      case 'walletconnect':
        return <SiWalletconnect size={20} />;
      case 'coinbase':
        return <FaWallet size={20} />;
      case 'farcaster':
        return <FaWallet size={20} />;
      default:
        return <FaWallet size={20} />;
    }
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'metamask':
        return 'MetaMask';
      case 'walletconnect':
        return 'WalletConnect';
      case 'coinbase':
        return 'Coinbase Wallet';
      case 'farcaster':
        return 'Farcaster Wallet';
      default:
        return 'Wallet';
    }
  };

  // Show loading state while auto-connecting
  if (walletLoading) {
    return (
      <div className="wallet-connect">
        <div className="farcaster-wallet-info">
          <div className="wallet-status">
            <FaWallet size={24} />
            <span>Connecting Wallet...</span>
          </div>
          <div className="wallet-note">
            <small>Automatically connecting to your Farcaster wallet...</small>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if connection failed
  if (walletError) {
    return (
      <div className="wallet-connect">
        <div className="farcaster-wallet-info">
          <div className="wallet-status">
            <FaWallet size={24} />
            <span>Connection Failed</span>
          </div>
          <div className="mini-app-status">
            <div className="status-item">
              <span className="status-label">Error:</span>
              <span className="status-value error">{walletError}</span>
            </div>
          </div>
          <button 
            onClick={autoConnectWallet}
            style={{
              padding: '8px 16px',
              backgroundColor: '#114488',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // If wallet is connected, show wallet info
  if (walletConnected && walletAddress) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-provider">
            {getProviderIcon(walletProvider)}
            <span>{getProviderName(walletProvider)}</span>
          </div>
          <div className="wallet-address">
            <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <button onClick={copyAddress} className="copy-btn">
              {copied ? 'Copied!' : <FaCopy size={14} />}
            </button>
          </div>
          <div className="wallet-network">
            {getNetworkName(walletChainId)}
          </div>
        </div>
      </div>
    );
  }

  // If no wallet connected and not in Mini App, show manual connection info
  if (!isFarcasterMiniApp) {
    return (
      <div className="wallet-connect">
        <div className="farcaster-wallet-info">
          <div className="wallet-status">
            <FaWallet size={24} />
            <span>Wallet Status</span>
          </div>
          <div className="regular-browser-status">
            <div className="status-item">
              <span className="status-label">Environment:</span>
              <span className="status-value info">Regular Browser</span>
            </div>
            <div className="status-item">
              <span className="status-label">Wallet Access:</span>
              <span className="status-value warning">Requires wallet extension</span>
            </div>
          </div>
          <div className="wallet-note">
            <small>Connect your wallet extension to interact with blockchain features.</small>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: show connection status
  return (
    <div className="wallet-connect">
      <div className="farcaster-wallet-info">
        <div className="wallet-status">
          <FaWallet size={24} />
          <span>Wallet Status</span>
        </div>
        <div className="mini-app-status">
          <div className="status-item">
            <span className="status-label">Environment:</span>
            <span className="status-value success">Farcaster Mini App</span>
          </div>
          <div className="status-item">
            <span className="status-label">Wallet Access:</span>
            <span className="status-value info">Available through Farcaster</span>
          </div>
          <div className="status-item">
            <span className="status-label">Connection:</span>
            <span className="status-value warning">Attempting to connect...</span>
          </div>
        </div>
        <div className="wallet-note">
          <small>Your wallet will be automatically connected when you perform blockchain actions in this Farcaster Mini App.</small>
        </div>
      </div>
    </div>
  );
} 