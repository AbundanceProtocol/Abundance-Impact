'use client'

import React, { useState, useContext } from 'react';
import { AccountContext } from '../../context';
import { FaExchangeAlt, FaPaperPlane, FaEye, FaHistory, FaCog } from 'react-icons/fa';
import { BsArrowLeftRight } from 'react-icons/bs';

export default function WalletActions() {
  const {
    walletConnected,
    walletAddress,
    walletChainId,
    walletProvider
  } = useContext(AccountContext);

  const [showActions, setShowActions] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  if (!walletConnected) {
    return null;
  }

  const switchNetwork = async (targetChainId) => {
    try {
      if (walletProvider === 'metamask' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const sendTransaction = async () => {
    if (!transactionAmount || !recipientAddress) {
      setTransactionError('Please fill in all fields');
      return;
    }

    setTransactionLoading(true);
    setTransactionError(null);

    try {
      const transactionParameters = {
        to: recipientAddress,
        from: walletAddress,
        value: '0x' + Number(transactionAmount).toString(16),
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setTransactionSuccess(true);
      setTransactionAmount('');
      setRecipientAddress('');
      
      setTimeout(() => setTransactionSuccess(false), 5000);
    } catch (error) {
      console.error('Transaction error:', error);
      setTransactionError(error.message);
    } finally {
      setTransactionLoading(false);
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
                onClick={() => switchNetwork('0x1')}
                className={`network-btn ${walletChainId === '0x1' ? 'active' : ''}`}
              >
                Ethereum
              </button>
              <button 
                onClick={() => switchNetwork('0xa')}
                className={`network-btn ${walletChainId === '0xa' ? 'active' : ''}`}
              >
                Optimism
              </button>
              <button 
                onClick={() => switchNetwork('0xa4b1')}
                className={`network-btn ${walletChainId === '0xa4b1' ? 'active' : ''}`}
              >
                Arbitrum
              </button>
              <button 
                onClick={() => switchNetwork('0x2105')}
                className={`network-btn ${walletChainId === '0x2105' ? 'active' : ''}`}
              >
                Base
              </button>
            </div>
          </div>

          {/* Send Transaction */}
          <div className="action-section">
            <h4>Send Transaction</h4>
            <div className="transaction-form">
              <input
                type="text"
                placeholder="Recipient Address (0x...)"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="transaction-input"
              />
              <input
                type="number"
                placeholder="Amount (ETH)"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                className="transaction-input"
                step="0.001"
                min="0"
              />
              <button 
                onClick={sendTransaction}
                disabled={transactionLoading || !transactionAmount || !recipientAddress}
                className="send-btn"
              >
                {transactionLoading ? 'Sending...' : <><FaPaperPlane size={14} /> Send</>}
              </button>
            </div>
            
            {transactionError && (
              <div className="transaction-error">
                {transactionError}
              </div>
            )}
            
            {transactionSuccess && (
              <div className="transaction-success">
                Transaction sent successfully!
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="action-section">
            <h4>Quick Actions</h4>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <FaEye size={16} />
                View on Explorer
              </button>
              <button className="quick-action-btn">
                <FaHistory size={16} />
                Transaction History
              </button>
              <button className="quick-action-btn">
                <BsArrowLeftRight size={16} />
                Bridge Assets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 