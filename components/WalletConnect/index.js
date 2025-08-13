'use client'

import React, { useState, useEffect, useContext } from 'react';
import { AccountContext } from '../../context';
import { FaWallet, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { SiWalletconnect } from 'react-icons/si';
import { FaMeta, FaWallet } from 'react-icons/fa';

export default function WalletConnect() {
  const {
    walletConnected,
    walletAddress,
    walletChainId,
    walletProvider,
    walletError,
    walletLoading
  } = useContext(AccountContext);

  const [copied, setCopied] = useState(false);

  // Check if we're in a Farcaster Mini App environment
  const isFarcasterMiniApp = typeof window !== 'undefined' && 
    (window.location.hostname.includes('warpcast.com') || 
     window.location.hostname.includes('farcaster.xyz') ||
     window.navigator.userAgent.includes('Farcaster'));

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
        return <FaMeta size={20} />;
      case 'walletconnect':
        return <SiWalletconnect size={20} />;
      case 'coinbase':
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
      default:
        return 'Wallet';
    }
  };

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

  // If no wallet connected, show Farcaster Mini App info
  return (
    <div className="wallet-connect">
      <div className="farcaster-wallet-info">
        <div className="wallet-status">
          <FaWallet size={24} />
          <span>Wallet Status</span>
        </div>
        
        {isFarcasterMiniApp ? (
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
              <span className="status-value warning">Not yet connected</span>
            </div>
          </div>
        ) : (
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
        )}

        <div className="wallet-note">
          <small>
            {isFarcasterMiniApp 
              ? "Your wallet will be automatically connected when you perform blockchain actions in this Farcaster Mini App."
              : "Connect your wallet extension to interact with blockchain features."
            }
          </small>
        </div>
      </div>
    </div>
  );
} 