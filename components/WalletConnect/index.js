'use client'

import React, { useState, useEffect, useContext, useRef } from 'react';
import { AccountContext } from '../../context';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import Spinner from '../Common/Spinner';
import { addFarcasterConnector } from '../../config/wagmi';
import { MdOutlineRefresh } from "react-icons/md";

export default function WalletConnect({ onTipAmountChange, onTokenChange }) {
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
  const [tipAmount, setTipAmount] = useState(0);
  
  // Call the callback when tipAmount changes
  useEffect(() => {
    if (onTipAmountChange) {
      onTipAmountChange(tipAmount);
    }
  }, [tipAmount, onTipAmountChange]);

  // Call the callback when selectedToken changes
  useEffect(() => {
    if (onTokenChange && selectedToken !== 'default') {
      onTokenChange(selectedToken);
    }
  }, [selectedToken, onTokenChange]);

  // Set default token and notify parent on mount (only once)
  const [hasSetDefault, setHasSetDefault] = useState(false);
  
  useEffect(() => {
    if (onTokenChange && topCoins.length > 0 && !hasSetDefault) {
      // Find USDC on Base as default, but only set it once
      const defaultToken = topCoins.find(t => t.symbol === 'USDC' && t.networkKey === 'base');
      if (defaultToken) {
        console.log('Setting default token:', defaultToken);
        setSelectedToken(defaultToken);
        onTokenChange(defaultToken);
        setHasSetDefault(true); // Mark that we've set the default
      }
    }
  }, [topCoins, onTokenChange, hasSetDefault]);

  // Helper function for dynamic decimal formatting
  const formatAmount = (amount, symbol) => {
    const numAmount = parseFloat(amount);
    
    if (symbol === 'ETH') {
      return numAmount.toFixed(4);
    } else if (numAmount >= 10) {
      return numAmount.toFixed(2);
    } else if (numAmount < 10) {
      return numAmount.toFixed(3);
    }
    return numAmount.toFixed(2);
  };

  // Helper functions for token display
  const getTokenImage = (symbol) => {
    const tokenImages = {
      'ETH': '/images/tokens/ethereum.png',
      'WETH': '/images/tokens/ethereum.png',
      'USDC': '/images/tokens/usdc.png',
      'USDT': '/images/tokens/usdt.jpeg',
      'CELO': '/images/tokens/celo.jpg',
      'DEGEN': '/images/tokens/degen.png',
      'BETR': '/images/tokens/betr.png', // Fallback to ethereum for now
      'NOICE': '/images/tokens/noice.jpg',
      'TIPN': '/images/tokens/tipn.png',
      'EGGS': '/images/tokens/eggs.png',
      'USDGLO': '/images/tokens/usdglo.png',
      'QR': '/images/tokens/qr.png',
      'OP': '/images/tokens/optimism.png', // Use optimism image for OP token
      'ARB': '/images/tokens/ethereum.png' // Fallback to ethereum for now
    };
    return tokenImages[symbol] || '/images/tokens/ethereum.png'; // Default fallback
  };

  const getNetworkImage = (chainId) => {
    const networkImages = {
      '0x1': '/images/tokens/ethereum.png',      // Ethereum
      '0xa': '/images/tokens/optimism.png',      // Optimism
      '0xa4b1': '/images/tokens/ethereum.png',  // Arbitrum (fallback to ethereum for now)
      '0x2105': '/images/tokens/base.png',      // Base
      '0xa4ec': '/images/tokens/celo.jpg'       // Celo
    };
    return networkImages[chainId] || '/images/tokens/ethereum.png'; // Default fallback
  };

  const getTokenColor = (symbol) => {
    const colors = {
      'ETH': '#627eea',
      'WETH': '#627eea',
      'USDC': '#2775ca',
      'USDT': '#26a17b',
      'CELO': '#35d07f',
      'DEGEN': '#ff6b35',
      'BETR': '#e91e63',
      'NOICE': '#9c27b0',
      'TIPN': '#ff9800',
      'EGGS': '#ccda6e',
      'USDGLO': '#133d39',
      'QR': '#ffffff',
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

  // Helper function to find token by symbol and network
  const findToken = (symbol, networkKey) => {
    return topCoins.find(t => t.symbol === symbol && t.networkKey === networkKey);
  };

  // Helper function to get selected token
  const getSelectedToken = () => {
    if (selectedToken === 'default') {
      // Find USDC on Base as default
      let token = findToken('USDC', 'base');
      if (!token) {
        // If no USDC on Base, use first available token
        token = topCoins.find(t => parseFloat(t.balance) > 0);
      }
      return token;
    } else {
      // selectedToken should be the actual token object
      // Verify it's a valid token object with required properties
      if (selectedToken && typeof selectedToken === 'object' && selectedToken.symbol && selectedToken.balance !== undefined) {
        return selectedToken;
      } else {
        // Fallback to default if selectedToken is invalid
        console.warn('Invalid selectedToken:', selectedToken);
        let token = findToken('USDC', 'base');
        if (!token) {
          token = topCoins.find(t => parseFloat(t.balance) > 0);
        }
        return token;
      }
    }
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
  const { connect, connectors } = useConnect();
  
  // Debug: Log current Wagmi state vs Legacy state
  console.log('🔍 WAGMI state:', { isConnected, address, chainId });
  console.log('🔍 LEGACY state:', { walletConnected, walletAddress, walletChainId });
  console.log('🔍 Available connectors:', connectors);

  // Initialize Farcaster connector once (guard with ref to prevent loops)
  // const didInitRef = useRef(false);
  // useEffect(() => {
  //   const initFarcasterConnector = async () => {
  //     if (didInitRef.current) return;
  //     didInitRef.current = true;
  //     try {
  //       const connector = await addFarcasterConnector();
  //       if (connector && !isConnected) {
  //         await connect({ connector });
  //       }
  //     } catch (error) {
  //       console.warn('Failed to initialize Farcaster connector:', error);
  //     }
  //   };

  //   if (typeof window !== 'undefined' && !isConnected) {
  //     initFarcasterConnector();
  //   }
  // }, [isConnected, connect]);

  // Farcaster Mini App wallet connection following official docs pattern
  const hasAttemptedConnectRef = useRef(false);
  useEffect(() => {
    const connectFarcasterWallet = async () => {
      // Only attempt connection once and when not already connected
      if (isConnected || hasAttemptedConnectRef.current) return;
      
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      // Handle Farcaster environments (including tunnel preview)
      const isTunnel = window.location.href.includes('tunnel') || window.location.href.includes('trycloudflare');
      const isFarcasterEnv = navigator.userAgent.includes('Farcaster');
      const isFarcasterContext = isFarcasterEnv || isTunnel;
      
      if (isFarcasterContext && !window.farcasterEthProvider) {
        console.log('🔄 In Farcaster context but farcasterEthProvider not ready - letting legacy detection handle it');
        console.log('🔍 Environment details:', {
          isTunnel,
          isFarcasterEnv,
          hasFarcasterEthProvider: !!window.farcasterEthProvider,
          hasEthereum: !!window.ethereum
        });
        return;
      }
      
      hasAttemptedConnectRef.current = true;
      
      try {
        console.log('🔍 Attempting to connect Farcaster wallet...');
        console.log('🔍 Window objects available:', {
          farcasterEthProvider: !!window.farcasterEthProvider,
          ethereum: !!window.ethereum,
          location: window.location.href,
          userAgent: navigator.userAgent,
          timing: new Date().toISOString()
        });
        console.log('🔍 Current connectors:', connectors.map(c => ({ id: c.id, name: c.name, type: c.type })));
        
        // Wait a bit for Farcaster provider to be available if not ready
        if (!window.farcasterEthProvider) {
          console.log('⏳ Farcaster provider not ready, waiting...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('🔍 After waiting - farcasterEthProvider available:', !!window.farcasterEthProvider);
        }
        
        // Check if Farcaster connector is already available in connectors
        const existingFarcasterConnector = connectors.find(
          connector => connector.id === 'com.farcaster.miniapp'
        );
        
        if (existingFarcasterConnector) {
          console.log('🔗 Found existing Farcaster connector, connecting...');
          await connect({ connector: existingFarcasterConnector });
          return;
        }
        
        // Get Farcaster connector dynamically
        console.log('🔄 Attempting to create Farcaster connector dynamically...');
        const farcasterConnector = await addFarcasterConnector();
        
        if (farcasterConnector && farcasterConnector.id && typeof farcasterConnector.connect === 'function') {
          console.log('🔗 Dynamically created Farcaster connector:', {
            id: farcasterConnector.id,
            name: farcasterConnector.name,
            type: farcasterConnector.type
          });
          await connect({ connector: farcasterConnector });
        } else {
          console.log('❌ Farcaster connector invalid:', {
            hasConnector: !!farcasterConnector,
            hasId: !!farcasterConnector?.id,
            hasConnect: typeof farcasterConnector?.connect === 'function',
            connector: farcasterConnector
          });
          console.log('ℹ️ Farcaster connector not available');
          console.log('🔄 Checking if already connected via existing connector...');
          
          // If Farcaster connector fails, fall back to legacy wallet detection
          console.log('🔄 Farcaster connector failed, falling back to legacy detection...');
          
          // The legacy detection in context.js should handle this
          // Don't try to connect with generic connectors as they may cause instability
        }
      } catch (error) {
        console.error('❌ Failed to connect Farcaster wallet:', error);
        console.error('Error details:', error.message, error.stack);
      }
    };

    connectFarcasterWallet();
  }, [isConnected, connect, connectors]);


  // Sync Wagmi state with local state (following docs pattern)
  useEffect(() => {
    console.log('🔄 Wagmi state changed:', { isConnected, address, chainId });
    
    if (isConnected && address && chainId) {
      console.log('✅ Wallet connected via Wagmi:', { address, chainId });
      console.log('📋 Connection details:');
      console.log('  - Address:', address);
      console.log('  - Chain ID:', chainId);
      console.log('  - Available connectors:', connectors.map(c => c.name));
      
      setWalletConnected(true);
      setWalletAddress(address);
      setWalletChainId(chainId.toString());
      setWalletProvider('wagmi'); // Set to wagmi to distinguish from legacy
      setWalletError(null);
      setWalletLoading(false);
    } else if (!isConnected) {
      console.log('❌ Wallet disconnected via Wagmi');
      console.log('🔍 Disconnect context:', {
        hasAttemptedConnect: hasAttemptedConnectRef.current,
        previouslyConnected: walletConnected,
        availableConnectors: connectors.length
      });
      
      // Avoid running disconnect sequence before we've attempted to connect
      // and don't disconnect legacy if it's working independently
      if (hasAttemptedConnectRef.current && walletConnected && walletProvider === 'wagmi') {
        console.log('🔄 Processing Wagmi disconnect...');
        setWalletConnected(false);
        setWalletAddress(null);
        setWalletChainId(null);
        setWalletProvider(null);
      } else if (hasAttemptedConnectRef.current && walletConnected && walletProvider !== 'wagmi') {
        console.log('⏸️ Skipping disconnect - legacy wallet still connected');
      } else if (hasAttemptedConnectRef.current && !walletConnected) {
        console.log('⏸️ Skipping disconnect - no wallet was connected');
      } else {
        console.log('⏸️ Skipping disconnect processing (not previously connected or no attempt made)');
      }
      // Keep topCoins to avoid UI flicker
    }
  }, [isConnected, address, chainId, connectors]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      setDropdownOpen((prev) => (prev && !event.target.closest('.custom-dropdown') ? false : prev));
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); 

  // Fetch all tokens when wallet is connected
  useEffect(() => {
    console.log('🔄 Token fetch effect triggered:', { walletConnected, walletAddress, topCoinsLoading, topCoinsLength: topCoins.length });
    
    if (walletConnected && walletAddress && !topCoinsLoading && topCoins.length === 0) {
      console.log('🚀 Will fetch tokens in 500ms for address:', walletAddress);
      const timeoutId = setTimeout(() => {
        console.log('🔄 Actually calling getAllTokens with address:', walletAddress);
        getAllTokens(walletAddress);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      console.log('⏸️ Skipping token fetch:', {
        walletConnected,
        hasWalletAddress: !!walletAddress,
        topCoinsLoading,
        topCoinsLength: topCoins.length
      });
    }
  }, [walletConnected, walletAddress, topCoinsLoading, topCoins.length, getAllTokens]);



  // Always show the component, but with different states
  return (
    <div className="wallet-connect">
      {/* Token Selection Dropdown - Always visible */}
      <div className="all-tokens-section">

            
            <div>
              {/* Token Selection Dropdown */}
                <div style={{ marginBottom: '10px' }}>
                                     {/* Custom Dropdown */}
                   <div style={{ position: 'relative' }} className="custom-dropdown">
                     <button
                       onClick={() => setDropdownOpen(!dropdownOpen)}
                       style={{
                         padding: '12px 12px',
                         borderRadius: '10px',
                         border: '1px solid #114477',
                         fontSize: '12px',
                         backgroundColor: '#001122',
                         color: '#ace',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px',
                         minWidth: '260px', // 30% wider (was 200px)
                         justifyContent: 'space-between',
                         outline: 'none'
                       }}
                     >
                      {(() => {
                        let token;
                        if (selectedToken === 'default') {
                          // Find USDC on Base as default
                          token = getSelectedToken();
                        } else {
                          // Use the selected token index
                          token = selectedToken;
                        }
                        
                        // Show loading state while tokens are loading (regardless of wallet state)
                        // Check if we're in tunnel environment
                        const isTunnel = typeof window !== 'undefined' && (window.location.href.includes('tunnel') || window.location.href.includes('trycloudflare'));
                        
                        if (topCoinsLoading) {
                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* USDC Icon */}
                                <div style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  backgroundColor: '#2775ca',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative'
                                }}>
                                  <img 
                                    src="/images/tokens/usdc.png" 
                                    alt="USDC" 
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      borderRadius: '50%'
                                    }} 
                                  />
                                  
                                  {/* Network Icon Overlay */}
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '-1px',
                                    right: '-1px',
                                    width: '19px', // 1px smaller (was 20px)
                                    height: '19px', // 1px smaller (was 20px)
                                    borderRadius: '50%',
                                    backgroundColor: '#0052ff',
                                    border: '2px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    zIndex: 9999,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                  }}>
                                    <img 
                                      src="/images/tokens/base.png" 
                                      alt="Base" 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        borderRadius: '50%'
                                      }} 
                                    />
                                  </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ace' }}>USDC</div>
                                  <div style={{ fontSize: '11px', color: '#bdf' }}>
                                    {isTunnel ? 'Farcaster Preview' : 'Base'}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#999' }}>
                                  {isTunnel ? 'N/A' : '--'}
                                </span>
                              </div>
                              {!isTunnel && <Spinner size={31} color={'#999'} />}
                            </>
                          );
                        }
                        
                        // Show tunnel mode message if no tokens and in tunnel
                        if (!token && isTunnel) {
                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  backgroundColor: '#555',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <span style={{ color: 'white', fontSize: '14px' }}>💻</span>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ace' }}>Farcaster Preview</div>
                                  <div style={{ fontSize: '11px', color: '#bdf' }}>Mini App Tunnel</div>
                                </div>
                              </div>
                              <span style={{ color: '#999', fontSize: '12px' }}>Preview mode</span>
                            </>
                          );
                        }
                        
                        if (token) {
                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Token Icon */}
                                <div style={{
                                  width: '34px', // 2px larger (was 32px)
                                  height: '34px', // 2px larger (was 32px)
                                  borderRadius: '50%',
                                  backgroundColor: getTokenColor(token.symbol),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  border: '2px solid #e0e0e0',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}>
                                  <img 
                                    src={getTokenImage(token.symbol)} 
                                    alt={token.symbol} 
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      borderRadius: '50%'
                                    }}
                                    onError={(e) => {
                                      // Fallback to text if image fails to load
                                      e.target.style.display = 'none';
                                      const fallback = document.createElement('div');
                                      fallback.textContent = token.symbol.charAt(0);
                                      fallback.style.cssText = `
                                        width: 100%; 
                                        height: 100%; 
                                        display: flex; 
                                        alignItems: center; 
                                        justifyContent: center; 
                                        fontSize: 15px; 
                                        fontWeight: bold; 
                                        color: white;
                                      `;
                                      e.target.parentNode.appendChild(fallback);
                                    }}
                                  />
                                  
                                  {/* Network Icon Overlay */}
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-2px',
                                    width: '18px', // 1px smaller (was 19px)
                                    height: '18px', // 1px smaller (was 19px)
                                    borderRadius: '50%',
                                    backgroundColor: getNetworkColor(token.chainId),
                                    border: '2px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    zIndex: 9999,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                  }}>
                                    <img 
                                      src={getNetworkImage(token.chainId)} 
                                      alt={token.network} 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        borderRadius: '50%'
                                      }}
                                      onError={(e) => {
                                        // Fallback to text if image fails to load
                                        e.target.style.display = 'none';
                                        const fallback = document.createElement('div');
                                        fallback.textContent = token.network.charAt(0);
                                        fallback.style.cssText = `
                                          width: 100%; 
                                          height: 100%; 
                                          display: flex; 
                                          alignItems: center; 
                                          justifyContent: center; 
                                          fontSize: 10px; 
                                          fontWeight: bold; 
                                          color: white;
                                        `;
                                        e.target.parentNode.appendChild(fallback);
                                      }}
                                    />
                                  </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ace' }}>{token.symbol}</div>
                                  <div style={{ fontSize: '11px', color: '#bdf' }}>{formatAmount(token.balance, token.symbol)}</div>
                                </div>
                              </div>
                                                                                                    <span style={{ 
                               color: '#9df', 
                               fontWeight: 'bold',
                               fontSize: '14px' }}>
                              ${(() => {
                                const calculated = parseFloat(token.balance) * parseFloat(token.price);
                                // For very small values, show more precision
                                if (calculated < 0.01) {
                                  return calculated.toFixed(6);
                                } else if (calculated < 1) {
                                  return calculated.toFixed(4);
                                } else {
                                  return calculated.toFixed(2);
                                }
                              })()}
                            </span>
                          </>
                        );
                      }
                    })()}
                    </button>

                                         {/* Refresh Button */}
                     <button
                       onClick={() => {
                         if (walletAddress) {
                           console.log('🔄 Manual refresh triggered for address:', walletAddress);
                           getAllTokens(walletAddress, true);
                         }
                       }}
                       disabled={topCoinsLoading || !walletAddress}
                       style={{
                         position: 'absolute',
                         right: '-30px',
                         top: '30px',
                         transform: 'translateY(-50%)',
                         padding: '6px',
                         borderRadius: '8px',
                         border: '1px solid #114477',
                         backgroundColor: '#001122',
                         color: '#ace',
                         cursor: topCoinsLoading || !walletAddress ? 'not-allowed' : 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         opacity: topCoinsLoading || !walletAddress ? 0.5 : 1,
                         transition: 'all 0.2s ease',
                         zIndex: 10
                       }}
                       title="Refresh token balances"
                     >
                       <MdOutlineRefresh 
                         size={12} 
                         style={{ 
                           animation: topCoinsLoading ? 'spin 1s linear infinite' : 'none' 
                         }} 
                       />
                     </button>

                    {/* Connection Test Buttons */}
                    {/* {!isConnected && !walletConnected && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}> */}
                        {/* <button
                          type="button"
                          onClick={async () => {
                            try {
                              console.log('🔄 Manual Wagmi connection attempt...');
                              const farcasterConnector = await addFarcasterConnector();
                              if (farcasterConnector && farcasterConnector.id) {
                                await connect({ connector: farcasterConnector });
                              } else if (connectors.length > 0) {
                                console.log('🔄 Trying first available connector:', connectors[0].name);
                                await connect({ connector: connectors[0] });
                              }
                            } catch (error) {
                              console.error('Manual Wagmi connection failed:', error);
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #007bff',
                            backgroundColor: '#007bff',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            width: '100%'
                          }}
                        >
                          Connect via Wagmi
                        </button> */}
                        
                        {/* <button
                          type="button"
                          onClick={async () => {
                            try {
                              console.log('🔄 Manual SDK connection attempt...');
                              
                              const { sdk } = await import('@farcaster/miniapp-sdk');
                              let provider = sdk.wallet.getEthereumProvider();
                              
                              console.log('🔍 Raw SDK provider:', provider, typeof provider);
                              
                              // Check if provider is a Promise and await it
                              if (provider && typeof provider.then === 'function') {
                                console.log('🔄 Provider is a Promise, awaiting...');
                                provider = await provider;
                                console.log('🔍 Awaited provider:', provider, typeof provider);
                              }
                              
                              if (provider) {
                                console.log('✅ SDK provider found:', {
                                  hasRequest: typeof provider.request === 'function',
                                  hasEnable: typeof provider.enable === 'function',
                                  hasSend: typeof provider.send === 'function',
                                  constructor: provider.constructor.name,
                                  provider: provider
                                });
                                
                                if (typeof provider.request === 'function') {
                                  const accounts = await provider.request({ method: 'eth_requestAccounts' });
                                  const chainId = await provider.request({ method: 'eth_chainId' });
                                  
                                  if (accounts.length > 0) {
                                    console.log('✅ SDK connection successful:', { address: accounts[0], chainId });
                                    setWalletAddress(accounts[0]);
                                    setWalletChainId(chainId);
                                    setWalletProvider('sdk');
                                    setWalletConnected(true);
                                    setWalletError(null);
                                  } else {
                                    console.log('❌ No accounts returned from SDK');
                                  }
                                } else {
                                  console.log('❌ SDK provider lacks request method');
                                }
                              } else {
                                console.log('❌ No SDK provider available');
                              }
                            } catch (error) {
                              console.error('Manual SDK connection failed:', error);
                              setWalletError(error.message);
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #8e44ad',
                            backgroundColor: '#8e44ad',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            width: '100%'
                          }}
                        >
                          Connect via SDK
                        </button> */}
                        
                        {/* <button
                          type="button"
                          onClick={async () => {
                            try {
                              console.log('🔄 Manual Legacy connection attempt...');
                              
                              if (window.ethereum) {
                                console.log('🔍 Attempting direct window.ethereum connection...');
                                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                                
                                if (accounts.length > 0) {
                                  console.log('✅ Manual connection successful:', { address: accounts[0], chainId });
                                  setWalletAddress(accounts[0]);
                                  setWalletChainId(chainId);
                                  setWalletProvider('manual');
                                  setWalletConnected(true);
                                  setWalletError(null);
                                } else {
                                  console.log('❌ No accounts returned');
                                }
                              } else {
                                console.log('❌ No window.ethereum available');
                              }
                            } catch (error) {
                              console.error('Manual Legacy connection failed:', error);
                              setWalletError(error.message);
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #28a745',
                            backgroundColor: '#28a745',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            width: '100%'
                          }}
                        >
                          Connect via Legacy
                        </button> */}
                        
                        {/* <button
                          type="button"
                          onClick={async () => {
                            try {
                              console.log('🔍 Debug: Inspecting window providers...');
                              
                              const ethereumKeys = Object.keys(window).filter(k => 
                                k.includes('ethereum') || k.includes('wallet') || k.includes('farcaster')
                              );
                              console.log('🔍 Ethereum/Wallet related window keys:', ethereumKeys);
                              
                              if (window.ethereum) {
                                console.log('🔍 window.ethereum details:', {
                                  isMetaMask: window.ethereum.isMetaMask,
                                  isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
                                  providers: window.ethereum.providers,
                                  selectedAddress: window.ethereum.selectedAddress,
                                  chainId: window.ethereum.chainId,
                                  networkVersion: window.ethereum.networkVersion,
                                  _events: Object.keys(window.ethereum._events || {}),
                                  _metamask: !!window.ethereum._metamask,
                                  _state: window.ethereum._state
                                });
                                
                                // Check if there are multiple providers
                                if (window.ethereum.providers && window.ethereum.providers.length > 0) {
                                  console.log('🔍 Multiple providers detected:', window.ethereum.providers.map(p => ({
                                    isMetaMask: p.isMetaMask,
                                    isCoinbaseWallet: p.isCoinbaseWallet,
                                    selectedAddress: p.selectedAddress
                                  })));
                                }
                              }
                              
                              // Try to trigger wallet selection
                              console.log('🔄 Attempting wallet selection trigger...');
                              if (window.ethereum && typeof window.ethereum.request === 'function') {
                                try {
                                  // This should trigger wallet selection popup
                                  const accounts = await window.ethereum.request({ 
                                    method: 'wallet_requestPermissions', 
                                    params: [{ eth_accounts: {} }] 
                                  });
                                  console.log('✅ Wallet permissions:', accounts);
                                } catch (permError) {
                                  console.log('⚠️ Wallet permission request failed, trying direct connection:', permError.message);
                                  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                                  console.log('✅ Direct connection result:', accounts);
                                }
                              }
                            } catch (error) {
                              console.error('Debug inspection failed:', error);
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #f39c12',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            width: '100%'
                          }}
                        >
                          Debug Providers
                        </button> */}
                      {/* </div>
                    )} */}
                  
                  {/* Tip Amount Slider - Show when tokens are loaded and not loading */}

                  {/* Dropdown Options */}
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '65px',
                      left: 0,
                      right: 0,
                      backgroundColor: '#00112233',
                      border: '1px solid #114477',
                      borderRadius: '12px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      zIndex: 9999,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)'
                    }}>
                        {/* Loading State */}
                        {walletConnected && topCoinsLoading ? (
                          <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#ace',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <Spinner size={31} color={'#ccc'} />
                            <span>Loading tokens...</span>
                          </div>
                        ) : topCoins.length === 0 ? (
                          <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#ccc'
                          }}>
                            No tokens available
                          </div>
                        ) : (
                          /* Token Options - Only show tokens with > 0 balance */
                          topCoins
                            .filter(coin => parseFloat(coin.balance) > 0)
                            .map((coin, index) => (
                            <div
                              key={`${coin.networkKey}-${coin.symbol}-${index}`}
                              onClick={() => {
                                console.log('User selected token:', coin);
                                setSelectedToken(coin); // Store the actual token object
                                setTipAmount(0); // Reset tip amount when selecting new token
                                setDropdownOpen(false);
                                
                                // Also call the callback to reset tip amount in parent
                                if (onTipAmountChange) {
                                  onTipAmountChange(0);
                                }
                                
                                // Notify parent of token change
                                if (onTokenChange) {
                                  onTokenChange(coin);
                                }
                              }}
                              style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #114477',
                                backgroundColor: (() => {
                                  if (selectedToken === 'default') {
                                    return coin.symbol === 'USDC' && coin.networkKey === 'base' ? '#11447799' : '#00112299';
                                  } else {
                                    return selectedToken && selectedToken.symbol === coin.symbol && selectedToken.networkKey === coin.networkKey ? '#11447799' : '#00112299';
                                  }
                                })(),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {/* Token Icon */}
                              <div style={{
                                width: '38px', // 2px larger (was 36px)
                                height: '38px', // 2px larger (was 36px)
                                borderRadius: '50%',
                                backgroundColor: getTokenColor(coin.symbol),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                border: '2px solid #e0e0e0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                              }}>
                                <img 
                                  src={getTokenImage(coin.symbol)} 
                                  alt={coin.symbol} 
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                  }}
                                  onError={(e) => {
                                    // Fallback to text if image fails to load
                                    e.target.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.textContent = coin.symbol.charAt(0);
                                    fallback.style.cssText = `
                                      width: 100%; 
                                      height: 100%; 
                                      display: flex; 
                                      alignItems: center; 
                                      justifyContent: center; 
                                      fontSize: 18px; 
                                      fontWeight: bold; 
                                      color: white;
                                    `;
                                    e.target.parentNode.appendChild(fallback);
                                  }}
                                />
                                
                                {/* Network Icon Overlay */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-1px',
                                  right: '-1px',
                                  width: '19px', // 1px smaller (was 20px)
                                  height: '19px', // 1px smaller (was 20px)
                                  borderRadius: '50%',
                                  backgroundColor: getNetworkColor(coin.chainId),
                                  border: '2px solid white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  zIndex: 9999,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                  <img 
                                    src={getNetworkImage(coin.chainId)} 
                                    alt={coin.network} 
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      borderRadius: '50%'
                                    }}
                                    onError={(e) => {
                                      // Fallback to text if image fails to load
                                      e.target.style.display = 'none';
                                      const fallback = document.createElement('div');
                                      fallback.textContent = coin.network.charAt(0);
                                      fallback.style.cssText = `
                                        width: 100%; 
                                        height: 100%; 
                                        display: flex; 
                                        alignItems: center; 
                                        justifyContent: center; 
                                        fontSize: 12px; 
                                        fontWeight: bold; 
                                        color: white;
                                      `;
                                      e.target.parentNode.appendChild(fallback);
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Token Details */}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ace' }}>
                                  {coin.symbol}
                                </div>
                                <div style={{ fontSize: '11px', color: '#ccc' }}>
                                  {formatAmount(coin.balance, coin.symbol)} @ ${parseFloat(coin.price).toFixed(6)}
                                </div>
                              </div>
                              
                              {/* Total Value */}
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                color: '#9df',
                                textAlign: 'right',
                                minWidth: '60px'
                              }}>
                                ${parseFloat(coin.value).toFixed(2)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                  {!topCoinsLoading && (() => {
                    const displayToken = selectedToken === 'default' ? getSelectedToken() : selectedToken;
                    if (!displayToken) return null;
                    
                    return (
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: '#00112299',
                        borderRadius: '10px',
                        border: '1px solid #114477'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#cde' }}>
                            Tip Amount
                          </span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                              {formatAmount(tipAmount, displayToken.symbol)} {displayToken.symbol}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9df' }}>
                              ${(parseFloat(tipAmount) * parseFloat(displayToken.price)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <input
                          type="range"
                          min="0"
                          max={parseFloat(displayToken.balance)}
                          step="0.000001"
                          value={tipAmount}
                          onChange={(e) => {
                            const newAmount = parseFloat(e.target.value);
                            setTipAmount(newAmount);
                            // Call the callback to update parent component
                            if (onTipAmountChange) {
                              onTipAmountChange(newAmount);
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: 'linear-gradient(to right, #007bff 0%, #007bff ' + (tipAmount / parseFloat(displayToken.balance) * 100) + '%, #688 ' + (tipAmount / parseFloat(displayToken.balance) * 100) + '%, #688 100%)',
                            outline: 'none',
                            cursor: 'pointer',
                            WebkitAppearance: 'none',
                            appearance: 'none',
                            border: '1px solid #357'
                          }}
                        />
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: '#666',
                          marginTop: '5px'
                        }}>
                          <span style={{ color: '#9df' }}>0</span>
                          <span style={{ color: '#9df' }}>{formatAmount(displayToken.balance, displayToken.symbol)} {displayToken.symbol}</span>
                        </div>
                      </div>
                    );
                  })()}


                  </div>
                </div>
              </div>
        </div>
      </div>
    );
  } 