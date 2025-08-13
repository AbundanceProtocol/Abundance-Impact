'use client'

import React, { useState } from 'react';
import { useContext } from 'react';
import { AccountContext } from '../../context';
import { useWallet } from '../../hooks/useWallet';
import { FaExchangeAlt, FaPaperPlane, FaEye, FaHistory, FaCog } from 'react-icons/fa';
import { BsArrowLeftRight } from 'react-icons/bs';

export default function WalletActions() {
  const {
    walletConnected,
    walletAddress,
    walletChainId,
    walletProvider
  } = useContext(AccountContext);

  const { getProvider, switchNetwork, sendTransaction, signMessage, getBalance } = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showActions, setShowActions] = useState(false);

  if (!walletConnected) {
    return null;
  }

  const handleSwitchNetwork = async (targetChainId) => {
    try {
      setLoading(true);
      setResult('');
      await switchNetwork(targetChainId);
      setResult(`Switched to network ${getNetworkName(targetChainId)}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestTransaction = async () => {
    try {
      setLoading(true);
      setResult('');
      // Test transaction to self with 0 value
      const txHash = await sendTransaction(walletAddress, 0);
      setResult(`Transaction sent: ${txHash.slice(0, 20)}...`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignMessage = async () => {
    try {
      setLoading(true);
      setResult('');
      const message = 'Hello from Farcaster Mini App!';
      const signature = await signMessage(message);
      setResult(`Message signed: ${signature.slice(0, 20)}...`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetBalance = async () => {
    try {
      setLoading(true);
      setResult('');
      const balance = await getBalance();
      const ethBalance = parseInt(balance, 16) / 1e18;
      setResult(`Balance: ${ethBalance.toFixed(6)} ETH`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
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
      case '0xa4ec':
        return 'Celo';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getNetworkColor = (chainId) => {
    switch (chainId) {
      case '0x1':
        return '#627eea';
      case '0xa':
        return '#ff0420';
      case '0xa4b1':
        return '#28a0f0';
      case '0x2105':
        return '#0052ff';
      case '0xa4ec':
        return '#35d07f'; // Celo green color
      default:
        return '#666';
    }
  };

  return (
    <div className="wallet-actions">
      <div className="wallet-header">
        <div className="network-indicator" style={{ backgroundColor: getNetworkColor(walletChainId) }}>
          {getNetworkName(walletChainId)}
        </div>
        <div className="wallet-address-short">
          {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
        </div>
        <button 
          onClick={() => setShowActions(!showActions)}
          className="toggle-actions-btn"
        >
          <FaCog size={16} />
        </button>
      </div>

      {showActions && (
        <div className="actions-panel">
          {/* Network Switching */}
          <div className="action-section">
            <h4>Switch Network</h4>
            <div className="network-options">
              <button 
                onClick={() => handleSwitchNetwork('0x1')}
                className={`network-btn ${walletChainId === '0x1' ? 'active' : ''}`}
                disabled={loading || walletChainId === '0x1'}
              >
                Ethereum
              </button>
              <button 
                onClick={() => handleSwitchNetwork('0xa')}
                className={`network-btn ${walletChainId === '0xa' ? 'active' : ''}`}
                disabled={loading || walletChainId === '0xa'}
              >
                Optimism
              </button>
              <button 
                onClick={() => handleSwitchNetwork('0xa4b1')}
                className={`network-btn ${walletChainId === '0xa4b1' ? 'active' : ''}`}
                disabled={loading || walletChainId === '0xa4b1'}
              >
                Arbitrum
              </button>
              <button 
                onClick={() => handleSwitchNetwork('0x2105')}
                className={`network-btn ${walletChainId === '0x2105' ? 'active' : ''}`}
                disabled={loading || walletChainId === '0x2105'}
              >
                Base
              </button>
              <button 
                onClick={() => handleSwitchNetwork('0xa4ec')}
                className={`network-btn ${walletChainId === '0xa4ec' ? 'active' : ''}`}
                disabled={loading || walletChainId === '0xa4ec'}
              >
                Celo
              </button>
            </div>
          </div>

          {/* Wallet Actions */}
          <div className="action-section">
            <h4>Wallet Actions</h4>
            <div className="wallet-action-buttons">
              <button 
                onClick={handleGetBalance}
                className="action-btn"
                disabled={loading}
              >
                <FaEye size={14} />
                Get Balance
              </button>
              <button 
                onClick={handleSignMessage}
                className="action-btn"
                disabled={loading}
              >
                <FaCog size={14} />
                Sign Message
              </button>
              <button 
                onClick={handleTestTransaction}
                className="action-btn"
                disabled={loading}
              >
                <FaPaperPlane size={14} />
                Test Transaction
              </button>
            </div>
          </div>

          {/* Status Display */}
          {loading && (
            <div className="status-section">
              <div className="loading-message">
                Processing...
              </div>
            </div>
          )}
          
          {result && !loading && (
            <div className="status-section">
              <div className="result-message">
                {result}
              </div>
            </div>
          )}

          {/* Provider Info */}
          <div className="action-section">
            <h4>Provider Info</h4>
            <div className="provider-info">
              <div className="info-item">
                <span>Provider:</span>
                <span>{walletProvider}</span>
              </div>
              <div className="info-item">
                <span>Network:</span>
                <span>{getNetworkName(walletChainId)}</span>
              </div>
              <div className="info-item">
                <span>Address:</span>
                <span>{walletAddress?.slice(0, 10)}...{walletAddress?.slice(-6)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 