'use client'

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AccountContext } from '../../context';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import Spinner from '../Common/Spinner';
import { addFarcasterConnector } from '../../config/wagmi';

export default function WalletConnect({ onTipAmountChange, onTokenChange }) {
  const {
    walletConnected, setWalletConnected,
    setWalletAddress, setWalletChainId,
    setWalletProvider, setWalletError,
    setWalletLoading,
    topCoins, setTopCoins,
    topCoinsLoading,
    getAllTokens,
  } = useContext(AccountContext);

  const [selectedToken, setSelectedToken] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [hasSetDefault, setHasSetDefault] = useState(false);

  // Wagmi hooks
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  /** Helpers **/
  const formatAmount = (amount, symbol) => {
    const num = parseFloat(amount || 0);
    if (symbol === 'ETH') return num.toFixed(4);
    if (num >= 10) return num.toFixed(2);
    if (num < 10) return num.toFixed(3);
    return num.toFixed(2);
  };

  const tokenImages = {
    ETH: '/images/tokens/ethereum.png',
    WETH: '/images/tokens/ethereum.png',
    USDC: '/images/tokens/usdc.png',
    CELO: '/images/tokens/celo.jpg',
    DEGEN: '/images/tokens/degen.png',
    BETR: '/images/tokens/ethereum.png',
    NOICE: '/images/tokens/noice.jpg',
    TIPN: '/images/tokens/tipn.png',
    OP: '/images/tokens/optimism.png',
    ARB: '/images/tokens/ethereum.png',
  };

  const networkImages = {
    '0x1': '/images/tokens/ethereum.png',
    '0xa': '/images/tokens/optimism.png',
    '0xa4b1': '/images/tokens/ethereum.png',
    '0x2105': '/images/tokens/base.png',
    '0xa4ec': '/images/tokens/celo.jpg',
  };

  const tokenColors = {
    ETH: '#627eea',
    WETH: '#627eea',
    USDC: '#2775ca',
    CELO: '#35d07f',
    DEGEN: '#ff6b35',
    BETR: '#e91e63',
    NOICE: '#9c27b0',
    TIPN: '#ff9800',
    OP: '#ff0420',
    ARB: '#28a0f0',
  };

  const networkColors = {
    '0x1': '#627eea',
    '0xa': '#ff0420',
    '0xa4b1': '#28a0f0',
    '0x2105': '#0052ff',
    '0xa4ec': '#35d07f',
  };

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setTipAmount(0);
    setDropdownOpen(false);
    onTipAmountChange?.(0);
    onTokenChange?.(token);
  };

  /** Effects **/

  // Default token selection (only once)
  useEffect(() => {
    if (!hasSetDefault && topCoins.length > 0) {
      const defaultToken =
        topCoins.find(t => t.symbol === 'USDC' && t.networkKey === 'base') ||
        topCoins.find(t => parseFloat(t.balance) > 0) ||
        topCoins[0];

      if (defaultToken) {
        setSelectedToken(defaultToken);
        onTokenChange?.(defaultToken);
        setHasSetDefault(true);
      }
    }
  }, [topCoins, hasSetDefault, onTokenChange]);

  // Sync wagmi -> local state
  useEffect(() => {
    if (isConnected && address && chainId) {
      setWalletConnected(true);
      setWalletAddress(address);
      setWalletChainId(chainId.toString());
      setWalletProvider('farcaster');
      setWalletError(null);
      setWalletLoading(false);
    } else {
      setWalletConnected(false);
      setWalletAddress(null);
      setWalletChainId(null);
      setWalletProvider(null);
      if (topCoins.length > 0) setTopCoins([]);
    }
  }, [isConnected, address, chainId]);

  // Initialize Farcaster connector once
  useEffect(() => {
    const initConnector = async () => {
      try {
        const connector = await addFarcasterConnector();
        if (connector && !isConnected) {
          await connect({ connector });
        }
      } catch (err) {
        console.warn('Farcaster connector error:', err);
      }
    };
    if (typeof window !== 'undefined' && !isConnected) initConnector();
  }, [isConnected, connect]);

  // Fetch tokens on connect
  useEffect(() => {
    if (walletConnected && address && !topCoinsLoading && topCoins.length === 0) {
      const timeout = setTimeout(() => getAllTokens(address), 500);
      return () => clearTimeout(timeout);
    }
  }, [walletConnected, address, topCoinsLoading, topCoins.length, getAllTokens]);

  /** Render **/

  if (!selectedToken) {
    return null; // don’t render until default token is set
  }

  return (
    <div className="wallet-connect">
      <div className="all-tokens-section">
        {/* Token Selection */}
        <div style={{ marginBottom: '10px', position: 'relative' }} className="custom-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #114477',
              fontSize: '12px',
              backgroundColor: '#001122',
              color: '#ace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '260px',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: tokenColors[selectedToken.symbol] || '#666',
                position: 'relative',
                border: '2px solid #e0e0e0',
              }}>
                <img src={tokenImages[selectedToken.symbol] || tokenImages['ETH']}
                     alt={selectedToken.symbol}
                     style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: networkColors[selectedToken.chainId] || '#666',
                  border: '2px solid white',
                  overflow: 'hidden',
                }}>
                  <img src={networkImages[selectedToken.chainId] || tokenImages['ETH']}
                       alt={selectedToken.network}
                       style={{ width: '100%', height: '100%' }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ace' }}>{selectedToken.symbol}</div>
                <div style={{ fontSize: '11px', color: '#bdf' }}>
                  {formatAmount(selectedToken.balance, selectedToken.symbol)}
                </div>
              </div>
            </div>
            <span style={{ color: '#9df', fontWeight: 'bold' }}>
              ${(parseFloat(selectedToken.balance) * parseFloat(selectedToken.price)).toFixed(2)}
            </span>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '65px',
              left: 0,
              right: 0,
              backgroundColor: '#001122dd',
              border: '1px solid #114477',
              borderRadius: '12px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 9999,
            }}>
              {walletConnected && topCoinsLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#ace' }}>
                  <Spinner size={31} color="#ccc" />
                  <span>Loading tokens...</span>
                </div>
              ) : (
                topCoins.filter(c => parseFloat(c.balance) > 0).map((coin, idx) => (
                  <div key={idx}
                       onClick={() => handleTokenSelect(coin)}
                       style={{
                         padding: '10px',
                         cursor: 'pointer',
                         backgroundColor:
                           selectedToken.symbol === coin.symbol && selectedToken.networkKey === coin.networkKey
                             ? '#11447799'
                             : '#00112299',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px',
                       }}>
                    <img src={tokenImages[coin.symbol] || tokenImages['ETH']}
                         alt={coin.symbol}
                         style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ace' }}>{coin.symbol}</div>
                      <div style={{ fontSize: '11px', color: '#ccc' }}>
                        {formatAmount(coin.balance, coin.symbol)} @ ${parseFloat(coin.price).toFixed(4)}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#9df' }}>
                      ${parseFloat(coin.value).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Tip Slider */}
        {selectedToken && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#00112299',
            borderRadius: '10px',
            border: '1px solid #114477',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#cde' }}>Tip Amount</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                  {formatAmount(tipAmount, selectedToken.symbol)} {selectedToken.symbol}
                </div>
                <div style={{ fontSize: '11px', color: '#9df' }}>
                  ${(parseFloat(tipAmount) * parseFloat(selectedToken.price)).toFixed(2)}
                </div>
              </div>
            </div>

            <input type="range"
                   min="0"
                   max={parseFloat(selectedToken.balance)}
                   step="0.000001"
                   value={tipAmount}
                   onChange={(e) => {
                     const newAmt = parseFloat(e.target.value);
                     setTipAmount(newAmt);
                     onTipAmountChange?.(newAmt);
                   }}
                   style={{
                     width: '100%',
                     height: '8px',
                     borderRadius: '4px',
                     background: `linear-gradient(to right, #007bff 0%, #007bff ${(tipAmount / selectedToken.balance) * 100}%, #688 ${(tipAmount / selectedToken.balance) * 100}%, #688 100%)`,
                     border: '1px solid #357',
                   }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '5px' }}>
              <span style={{ color: '#9df' }}>0</span>
              <span style={{ color: '#9df' }}>
                {formatAmount(selectedToken.balance, selectedToken.symbol)} {selectedToken.symbol}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
