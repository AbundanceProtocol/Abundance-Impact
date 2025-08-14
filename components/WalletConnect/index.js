'use client'

import React, { useState, useEffect, useContext } from 'react';
import { AccountContext } from '../../context';
import { useAccount, useDisconnect } from 'wagmi';

export default function WalletConnect() {
  const {
    walletConnected, setWalletConnected,
    walletAddress, setWalletAddress,
    walletChainId, setWalletChainId,
    walletProvider, setWalletProvider,
    walletError, setWalletError,
    walletLoading, setWalletLoading,
    topCoins, setTopCoins,
    topCoinsLoading, setTopCoinsLoading,
    lastTopCoinsFetch, setLastTopCoinsFetch,
    topCoinsCache, setTopCoinsCache,
    getAllTokens,
    lastRpcCall, setLastRpcCall,
    isMiniApp
  } = useContext(AccountContext);

  const [selectedToken, setSelectedToken] = useState('default');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Helper functions for token display
  const getTokenColor = (symbol) => {
    const colors = {
      'ETH': '#627eea',
      'WETH': '#627eea',
      'USDC': '#2775ca',
      'CELO': '#35d07f',
      'DEGEN': '#ff6b35',
      'BETR': '#e91e63',
      'NOICE': '#9c27b0',
      'TIPN': '#ff9800',
      'OP': '#ff0420',
      'ARB': '#28a0f0'
    };
    return colors[symbol] || '#6c757d';
  };

  const getNetworkColor = (chainId) => {
    const colors = {
      '0x1': '#627eea',      // Ethereum
      '0xa': '#ff0420',      // Optimism
      '0xa4b1': '#28a0f0',  // Arbitrum
      '0x2105': '#0052ff',   // Base
      '0xa4ec': '#35d07f'   // Celo
    };
    return colors[chainId] || '#666';
  };

  const getNetworkExplorer = (chainId) => {
    const explorers = {
      '0x1': 'Etherscan',
      '0xa': 'Optimistic Etherscan',
      '0xa4b1': 'Arbiscan',
      '0x2105': 'BaseScan',
      '0xa4ec': 'Celo Explorer'
    };
    return explorers[chainId] || 'Explorer';
  };

  // Debounced refresh function
  const debouncedRefresh = (address, forceRefresh = false) => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;

    if (timeSinceLastRefresh < 2000) {
      return;
    }

    if (topCoinsLoading) {
      return;
    }

    setLastRefreshTime(now);
    getAllTokens(address, forceRefresh);
  };

  // Wagmi hooks for wallet management
  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();

  // Sync Wagmi state with local state
  useEffect(() => {
    if (isConnected && address && chainId) {
      setWalletConnected(true);
      setWalletAddress(address);
      setWalletChainId(chainId.toString());
      setWalletProvider('farcaster');
      setWalletError(null);
      setWalletLoading(false);
    } else if (!isConnected) {
      setWalletConnected(false);
      setWalletAddress(null);
      setWalletChainId(null);
      setWalletProvider(null);
      if (topCoins.length > 0) {
        setTopCoins([]);
      }
    }
  }, [isConnected, address, chainId, topCoins.length]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.custom-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Fetch all tokens when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress && !topCoinsLoading) {
      const shouldFetch = topCoins.length === 0;

      if (shouldFetch) {
        const timeoutId = setTimeout(() => {
          getAllTokens(walletAddress);
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [walletConnected, walletAddress, walletChainId, getAllTokens, topCoinsLoading, topCoins.length]);

  // Show loading state while auto-connecting
  if (walletLoading) {
    return null; // Don't show anything while loading
  }

  // Show error state if connection failed
  if (walletError) {
    return null; // Don't show error states
  }

  // If wallet is connected, show only the coin dropdown
  if (walletConnected && walletAddress) {
    return (
      <div className="wallet-connected">
        {/* Show all tokens from all networks */}
        {walletConnected && walletAddress && (
          <div className="all-tokens-section">
            {/* RPC Rate Limit Status */}
            {(() => {
              const now = Date.now();
              const timeSinceLastRpc = now - (lastRpcCall || 0);
              const isRateLimited = timeSinceLastRpc < 10000;
              
              if (isRateLimited) {
                return (
                  <div style={{
                    fontSize: '11px',
                    color: '#ff6b35',
                    backgroundColor: '#fff3cd',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    margin: '5px 0',
                    border: '1px solid #ffeaa7'
                  }}>
                    ⏳ RPC Rate Limit: {Math.ceil((10000 - timeSinceLastRpc) / 1000)}s remaining
                  </div>
                );
              }
              return null;
            })()}
            
            {topCoinsLoading ? (
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                Loading tokens...
              </div>
            ) : topCoins.length > 0 ? (
              <div>
                {/* Token Selection Dropdown */}
                <div style={{ marginBottom: '10px' }}>
                  {/* Custom Dropdown */}
                  <div style={{ position: 'relative' }} className="custom-dropdown">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '12px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '200px',
                        justifyContent: 'space-between'
                      }}
                    >
                      {(() => {
                        const token = selectedToken === 'default' 
                          ? topCoins.find(t => t.symbol === 'USDC' && t.networkKey === 'base')
                          : topCoins[selectedToken];
                          
                        if (token) {
                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {/* Token Icon */}
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  backgroundColor: getTokenColor(token.symbol),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  position: 'relative'
                                }}>
                                  {token.symbol.charAt(0)}
                                  
                                  {/* Network Icon Overlay */}
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '-1px',
                                    right: '-1px',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: getNetworkColor(token.chainId),
                                    border: '1px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '7px',
                                    fontWeight: 'bold',
                                    color: 'white'
                                  }}>
                                    {token.network.charAt(0)}
                                  </div>
                                </div>
                                <span>{token.symbol}</span>
                              </div>
                              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                ${parseFloat(token.value).toFixed(2)}
                              </span>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <span>Select a token</span>
                              <span style={{ color: '#999' }}>▼</span>
                            </>
                          );
                        }
                      })()}
                    </button>
                    
                    {/* Dropdown Options */}
                    {dropdownOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        {/* Default Option */}
                        <div
                          onClick={() => {
                            setSelectedToken('default');
                            setDropdownOpen(false);
                          }}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            backgroundColor: selectedToken === 'default' ? '#f8f9fa' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#2775ca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: 'white',
                            position: 'relative'
                          }}>
                            U
                            <div style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#0052ff',
                              border: '2px solid white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '8px',
                              fontWeight: 'bold',
                              color: 'white'
                            }}>
                              B
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>USDC</div>
                            <div style={{ fontSize: '11px', color: '#666' }}>Default selection</div>
                          </div>
                        </div>
                        
                        {/* Token Options - Only show tokens with > 0 balance */}
                        {topCoins
                          .filter(coin => parseFloat(coin.balance) > 0)
                          .map((coin, index) => (
                            <div
                              key={`${coin.networkKey}-${coin.symbol}-${index}`}
                              onClick={() => {
                                setSelectedToken(index);
                                setDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                backgroundColor: selectedToken === index ? '#f8f9fa' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {/* Token Icon */}
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: getTokenColor(coin.symbol),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: 'white',
                                position: 'relative'
                              }}>
                                {coin.symbol.charAt(0)}
                                
                                {/* Network Icon Overlay */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-2px',
                                  right: '-2px',
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: getNetworkColor(coin.chainId),
                                  border: '2px solid white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '8px',
                                  fontWeight: 'bold',
                                  color: 'white'
                                }}>
                                  {coin.network.charAt(0)}
                                </div>
                              </div>
                              
                              {/* Token Details */}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                  {coin.symbol}
                                </div>
                                <div style={{ fontSize: '11px', color: '#666' }}>
                                  {coin.balance} @ ${parseFloat(coin.price).toFixed(6)}
                                </div>
                              </div>
                              
                              {/* Total Value */}
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                color: '#28a745',
                                textAlign: 'right',
                                minWidth: '60px'
                              }}>
                                ${parseFloat(coin.value).toFixed(2)}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selected Token Display */}
                {(() => {
                  const token = selectedToken === 'default' 
                    ? topCoins.find(t => t.symbol === 'USDC' && t.networkKey === 'base')
                    : topCoins[selectedToken];
                    
                  if (!token) {
                    return (
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                          Default: USDC
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                          No USDC balance found on Base network
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div style={{
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}>
                      {/* Token Header with Icons */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '8px' 
                      }}>
                        {/* Token Icon */}
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: getTokenColor(token.symbol),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          position: 'relative'
                        }}>
                          {token.symbol.charAt(0)}
                          
                          {/* Network Icon Overlay */}
                          <div style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getNetworkColor(token.chainId),
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            color: 'white'
                          }}>
                            {token.network.charAt(0)}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                            {token.symbol}
                          </div>
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            {token.network} Network
                          </div>
                        </div>
                      </div>
                      
                      {/* Token Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                        <div>
                          <span style={{ color: '#666' }}>Balance:</span>
                          <br />
                          <span style={{ fontWeight: 'bold' }}>{token.balance}</span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>Price:</span>
                          <br />
                          <span style={{ fontWeight: 'bold' }}>${token.price}</span>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <span style={{ color: '#666' }}>Total Value:</span>
                          <br />
                          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#28a745' }}>
                            ${parseFloat(token.value).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Network Explorer Link */}
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => {
                            const explorerUrls = {
                              '0x2105': `https://basescan.org/address/${token.address}`,
                              '0xa4ec': `https://explorer.celo.org/address/${token.address}`,
                              '0xa': `https://optimistic.etherscan.io/address/${token.address}`,
                              '0xa4b1': `https://arbiscan.io/address/${token.address}`
                            };
                            const url = explorerUrls[token.chainId] || `https://etherscan.io/address/${token.address}`;
                            window.open(url, '_blank');
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            width: '100%'
                          }}
                        >
                          View on {getNetworkExplorer(token.chainId)}
                        </button>
                      </div>
                    </div>
                  );
                })()}
                
                {/* All Tokens Summary */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                    Total Portfolio Value: <strong>${topCoins.reduce((sum, coin) => sum + parseFloat(coin.value), 0).toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: '#999' }}>
                    Showing {topCoins.length} tokens across {new Set(topCoins.map(c => c.network)).size} networks
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => debouncedRefresh(walletAddress, true)}
                    disabled={topCoinsLoading || (Date.now() - lastRefreshTime) < 2000}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      opacity: (Date.now() - lastRefreshTime) < 2000 ? 0.6 : 1
                    }}
                  >
                    {topCoinsLoading ? 'Loading...' : 
                     (Date.now() - lastRefreshTime) < 2000 ? 'Wait...' : 'Refresh All'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                No tokens found. Connect to a supported network to view balances.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // If no wallet connected, show nothing
  return null;
} 