'use client'

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AccountContext } from '../../context';
import { FaWallet, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { SiWalletconnect } from 'react-icons/si';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';

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
    getTopCoins,
    getTopCoinsCelo,
    lastRpcCall, setLastRpcCall,
    isMiniApp
  } = useContext(AccountContext);

  const [copied, setCopied] = useState(false);
  const [ethProvider, setEthProvider] = useState(null);
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Debounced refresh function
  const debouncedRefresh = (address, forceRefresh = false) => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    
    if (timeSinceLastRefresh < 2000) { // 2 second cooldown
      console.log('⏳ Refresh cooldown active, please wait...');
      return;
    }
    
    if (topCoinsLoading) {
      console.log('⏳ Already loading, please wait...');
      return;
    }
    
    console.log('🔄 Refreshing top coins...', forceRefresh ? '(forced)' : '');
    setLastRefreshTime(now);
    setLastRpcCall(now); // Reset RPC call time
    
    // Determine which function to call based on current chain
    const isBaseChain = walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453;
    const isCeloChain = walletChainId === '0xa4ec' || walletChainId === '42220' || walletChainId === 42220;
    
    if (isBaseChain) {
      getTopCoins(address, forceRefresh);
    } else if (isCeloChain) {
      getTopCoinsCelo(address, forceRefresh);
    } else {
      console.warn('Unknown chain, cannot refresh top coins');
    }
  };

  // Wagmi hooks for wallet management
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
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
      // Clear top coins data when disconnecting to prevent stale data
      if (topCoins.length > 0) {
        console.log('🧹 Clearing top coins data on disconnect');
        setTopCoins([]);
      }
    }
  }, [isConnected, address, chainId, topCoins.length]);

  // Fetch top coins when connected to Base or Celo
  useEffect(() => {
    console.log('🔍 Top coins useEffect triggered:', {
      walletConnected,
      walletAddress,
      walletChainId,
      chainId,
      isConnected,
      address
    });
    
    // Check for supported chains: Base (0x2105/8453) or Celo (0xa4ec/42220)
    const isBaseChain = walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453;
    const isCeloChain = walletChainId === '0xa4ec' || walletChainId === '42220' || walletChainId === 42220;
    
    if (walletConnected && walletAddress && (isBaseChain || isCeloChain) && !topCoinsLoading) {
      console.log('✅ Wallet connected to supported chain, checking if we need to fetch top coins...');
      
      // Only fetch if we don't have data or if it's been more than 5 minutes
      const shouldFetch = topCoins.length === 0;
      
      if (shouldFetch) {
        console.log('🔄 No cached data, fetching top coins...');
        // Add a small delay to prevent rapid successive calls
        const timeoutId = setTimeout(() => {
          if (isBaseChain) {
            console.log('🌐 Fetching from Base chain...');
            getTopCoins(walletAddress);
          } else if (isCeloChain) {
            console.log('🌐 Fetching from Celo chain...');
            getTopCoinsCelo(walletAddress);
          }
        }, 500);
        
        return () => clearTimeout(timeoutId);
      } else {
        console.log('📦 Using existing top coins data, no need to fetch');
      }
    } else {
      console.log('❌ Not fetching top coins because:', {
        walletConnected,
        walletAddress: !!walletAddress,
        walletChainId,
        isBaseChain,
        isCeloChain,
        topCoinsLoading,
        hasExistingData: topCoins.length > 0,
        expectedChainIds: ['0x2105', '8453', 8453, '0xa4ec', '42220', 42220]
      });
    }
  }, [walletConnected, walletAddress, walletChainId, topCoinsLoading, topCoins.length]); // Removed getTopCoins and getTopCoinsCelo from dependencies

  // Auto-connect wallet when in Farcaster Mini App
  useEffect(() => {
    // Only auto-connect if:
    // 1. We're in a Mini App
    // 2. Wallet is not already connected
    // 3. Not currently loading
    // 4. No previous error (to prevent infinite retries)
    // 5. Haven't already attempted auto-connection
    if (isMiniApp && !walletConnected && !walletLoading && !walletError && !hasAttemptedAutoConnect) {
      console.log('Auto-connect triggered - isMiniApp:', isMiniApp, 'walletConnected:', walletConnected, 'walletLoading:', walletLoading, 'walletError:', walletError, 'hasAttemptedAutoConnect:', hasAttemptedAutoConnect);
      setHasAttemptedAutoConnect(true);
      autoConnectWallet();
    } else if (!isMiniApp) {
      // If not in Mini App, reset the flag so it can try again if environment changes
      setHasAttemptedAutoConnect(false);
    }
  }, [isMiniApp]); // Only depend on isMiniApp, not the other wallet states

  // Debug logging - only log when values actually change
  useEffect(() => {
    console.log('WalletConnect component mounted/updated:', {
      isMiniApp,
      walletConnected,
      walletAddress,
      walletChainId,
      walletProvider,
      walletError,
      walletLoading,
      isConnected,
      address,
      chainId,
      connectors: connectors?.map(c => ({ id: c.id, name: c.name, ready: c.ready }))
    });
  }, [isMiniApp, walletConnected, walletAddress, walletChainId, walletProvider, walletError, walletLoading, isConnected, address, chainId, connectors]);

  // Test connector import
  useEffect(() => {
    const testConnectorImport = async () => {
      try {
        console.log('Testing Farcaster connector import...');
        const { farcasterMiniApp } = await import('@farcaster/miniapp-wagmi-connector');
        console.log('✅ Farcaster connector import successful:', farcasterMiniApp);
        
        // Test creating a connector instance
        const testConnector = farcasterMiniApp();
        console.log('✅ Farcaster connector instance created:', testConnector);
      } catch (error) {
        console.error('❌ Farcaster connector import failed:', error);
      }
    };
    
    testConnectorImport();
  }, []);

  // Monitor connector changes
  useEffect(() => {
    console.log('Connectors changed:', connectors?.map(c => ({ id: c.id, name: c.name, ready: c.ready })));
    
    if (connectors && connectors.length > 0) {
      const farcasterConnector = connectors.find(connector => 
        connector.id === 'farcasterMiniApp' || 
        connector.name === 'Farcaster Mini App'
      );
      
      if (farcasterConnector) {
        console.log('✅ Farcaster connector found:', farcasterConnector);
      } else {
        console.log('❌ Farcaster connector not found. Available connectors:', connectors);
      }
    } else {
      console.log('❌ No connectors available');
    }
  }, [connectors]);

  // Environment detection
  const detectEnvironment = () => {
    const env = {
      isCloudflare: false,
      isNetlify: false,
      isVercel: false,
      isLocal: false,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      hasWindow: typeof window !== 'undefined',
      hasDocument: typeof document !== 'undefined'
    };

    if (typeof window !== 'undefined') {
      env.isCloudflare = window.location.hostname.includes('cloudflare') || 
                         window.location.hostname.includes('workers.dev') ||
                         window.location.hostname.includes('pages.dev');
      env.isNetlify = window.location.hostname.includes('netlify');
      env.isVercel = window.location.hostname.includes('vercel');
      env.isLocal = window.location.hostname.includes('localhost') || 
                    window.location.hostname.includes('127.0.0.1');
    }

    console.log('Environment detection:', env);
    return env;
  };

  // Reset function to clear all states and start fresh
  const handleReset = () => {
    setWalletError(null);
    setWalletLoading(false);
    setHasAttemptedAutoConnect(false);
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletChainId(null);
    setWalletProvider(null);
    setEthProvider(null);
  };

  // Manual retry function that clears error state
  const handleManualRetry = () => {
    setWalletError(null); // Clear the error state
    setWalletLoading(false); // Ensure loading is false
    setHasAttemptedAutoConnect(false); // Reset the auto-connect flag
    // Small delay to ensure state updates before retrying
    setTimeout(() => {
      autoConnectWallet();
    }, 100);
  };

  // Manual connect function using Wagmi
  const handleManualConnect = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);

      // Find the Farcaster Mini App connector
      const farcasterConnector = connectors.find(connector => 
        connector.id === 'farcasterMiniApp' || 
        connector.name === 'Farcaster Mini App'
      );

      if (!farcasterConnector) {
        throw new Error('Farcaster Mini App connector not found');
      }

      await connect({ connector: farcasterConnector });
      console.log('Manual connect successful');
      
    } catch (error) {
      console.error('Manual connect failed:', error);
      setWalletError(`Manual connect failed: ${error.message}`);
    } finally {
      setWalletLoading(false);
    }
  };

  // Add a fallback connection method
  const tryFallbackConnection = async () => {
    try {
      console.log('Trying fallback connection method...');
      
      // Check if we're in a Farcaster environment by looking for specific window properties
      if (typeof window !== 'undefined') {
        // Check for Farcaster-specific properties
        const hasFarcasterProps = window.location.href.includes('farcaster') || 
                                  window.location.href.includes('warpcast') ||
                                  window.navigator.userAgent.includes('Farcaster') ||
                                  window.navigator.userAgent.includes('Warpcast');
        
        console.log('Fallback check - hasFarcasterProps:', hasFarcasterProps);
        console.log('User agent:', window.navigator.userAgent);
        console.log('URL:', window.location.href);
        
        if (hasFarcasterProps) {
          // Try to detect if we have any wallet-like objects
          const hasWalletObjects = window.ethereum || 
                                  window.farcasterEthProvider || 
                                  window.farcaster ||
                                  window.warpcast;
          
          console.log('Fallback check - hasWalletObjects:', hasWalletObjects);
          
          if (hasWalletObjects) {
            setWalletError('Detected Farcaster environment but wallet connection failed. Please ensure you are using the latest Farcaster client version.');
          } else {
            setWalletError('Detected Farcaster environment but no wallet provider found. Please update your Farcaster client.');
          }
        } else {
          setWalletError('Not in a Farcaster environment. Please open this app in the Farcaster client.');
        }
      }
    } catch (error) {
      console.error('Fallback connection failed:', error);
      setWalletError(`Fallback connection failed: ${error.message}`);
    }
  };

  const autoConnectWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);

      console.log('Starting auto-connect process using Wagmi connector...');
      console.log('isMiniApp:', isMiniApp);
      console.log('Available connectors:', connectors);
      console.log('Connector details:', connectors?.map(c => ({
        id: c.id,
        name: c.name,
        ready: c.ready,
        type: c.type
      })));

      // Check if we're in a Mini App environment
      if (!isMiniApp) {
        throw new Error('Not in a Farcaster Mini App environment. Please open this app in the Farcaster client.');
      }

      // Find the Farcaster Mini App connector
      const farcasterConnector = connectors.find(connector => 
        connector.id === 'farcasterMiniApp' || 
        connector.name === 'Farcaster Mini App' ||
        connector.id === 'farcaster' ||
        connector.name === 'farcaster'
      );

      if (!farcasterConnector) {
        console.error('Available connectors:', connectors);
        console.error('Looking for connector with id: farcasterMiniApp, farcaster or name: Farcaster Mini App, farcaster');
        throw new Error('Farcaster Mini App connector not found. Please ensure the connector is properly configured.');
      }

      console.log('Found Farcaster connector:', farcasterConnector);

      // Use Wagmi's connect function with the Farcaster connector
      try {
        await connect({ connector: farcasterConnector });
        console.log('Wagmi connect initiated successfully');
        
        // The wallet state will be updated via the useEffect that syncs with Wagmi
        // No need to manually set states here
        
      } catch (connectError) {
        console.error('Wagmi connect failed:', connectError);
        throw new Error(`Failed to connect via Wagmi: ${connectError.message}`);
      }

    } catch (error) {
      console.error('Auto-connect failed:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to auto-connect wallet';
      
      if (error.message.includes('Not in a Farcaster Mini App')) {
        errorMessage = 'This app must be opened within the Farcaster client to access wallet features.';
      } else if (error.message.includes('Farcaster Mini App connector not found')) {
        errorMessage = 'Wallet connector not properly configured. Please refresh the page and try again.';
      } else if (error.message.includes('Failed to connect via Wagmi')) {
        errorMessage = 'Failed to connect to wallet. Please ensure you are using the latest Farcaster client.';
      }
      
      setWalletError(errorMessage);
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
      case '0xa4ec':
        return 'Celo';
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

  // Add a manual connection test
  const testConnectionStep = async (step) => {
    try {
      console.log(`Testing connection step: ${step}`);
      
      switch (step) {
        case 'wagmi-config':
          // Test if Wagmi is properly configured
          if (connectors && connectors.length > 0) {
            console.log('✅ Wagmi connectors available:', connectors.length);
            return { success: true, message: `${connectors.length} connectors available` };
          } else {
            throw new Error('No Wagmi connectors found');
          }
          
        case 'farcaster-connector':
          // Test if Farcaster connector is available
          const farcasterConnector = connectors.find(connector => 
            connector.id === 'farcasterMiniApp' || 
            connector.name === 'Farcaster Mini App'
          );
          if (farcasterConnector) {
            console.log('✅ Farcaster connector found:', farcasterConnector.name);
            return { success: true, message: 'Farcaster connector available' };
          } else {
            throw new Error('Farcaster connector not found');
          }
          
        case 'miniapp-environment':
          // Test if we're in a Mini App environment
          if (isMiniApp) {
            console.log('✅ Mini App environment detected');
            return { success: true, message: 'Mini App environment confirmed' };
          } else {
            throw new Error('Not in Mini App environment');
          }
          
        case 'wagmi-state':
          // Test if Wagmi state is working
          if (typeof isConnected !== 'undefined') {
            console.log('✅ Wagmi state accessible, isConnected:', isConnected);
            return { success: true, message: `Wagmi state: isConnected=${isConnected}` };
          } else {
            throw new Error('Wagmi state not accessible');
          }
          
        default:
          return { success: false, message: 'Unknown test step' };
      }
    } catch (error) {
      console.error(`❌ Test step ${step} failed:`, error);
      return { success: false, message: error.message };
    }
  };

  const runConnectionTests = async () => {
    console.log('Running connection tests...');
    const tests = ['wagmi-config', 'farcaster-connector', 'miniapp-environment', 'wagmi-state'];
    const results = [];
    
    for (const test of tests) {
      const result = await testConnectionStep(test);
      results.push({ step: test, ...result });
    }
    
    console.log('Connection test results:', results);
    
    // Find the first failing test
    const firstFailure = results.find(r => !r.success);
    if (firstFailure) {
      setWalletError(`Connection test failed at step '${firstFailure.step}': ${firstFailure.message}`);
    } else {
      setWalletError('All connection tests passed but wallet still not connected. This may be a timing issue or the user may need to manually approve the connection.');
    }
  };

  // Show loading state while auto-connecting
  if (walletLoading || isPending) {
    return (
      <div className="wallet-connect">
        <div className="farcaster-wallet-info">
          <div className="wallet-status">
            <FaWallet size={24} />
            <span>Connecting Wallet...</span>
          </div>
          <div className="wallet-note">
            <small>Connecting to your Farcaster wallet...</small>
          </div>
          <div className="debug-info" style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <div>isMiniApp: {String(isMiniApp)}</div>
            <div>walletConnected: {String(walletConnected)}</div>
            <div>walletLoading: {String(walletLoading)}</div>
            <div>isPending: {String(isPending)}</div>
            <div>walletError: {walletError || 'null'}</div>
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
            <div className="status-item">
              <span className="status-label">Environment:</span>
              <span className="status-value info">
                {isMiniApp ? 'Farcaster Mini App' : 'Regular Browser'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Debug Info:</span>
              <span className="status-value info">
                {typeof window !== 'undefined' ? 
                  `User Agent: ${window.navigator.userAgent.substring(0, 50)}...` : 
                  'Window not available'
                }
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={handleManualRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#114488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Manual Connect
            </button>
            <button 
              onClick={tryFallbackConnection}
              style={{
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Try Fallback
            </button>
            <button 
              onClick={runConnectionTests}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Run Tests
            </button>
            <button 
              onClick={() => detectEnvironment()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Check Environment
            </button>
            <button 
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Reset All
            </button>
          </div>
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
          
          {/* Debug info for chain ID */}
          <div style={{ 
            fontSize: '11px', 
            color: '#666', 
            backgroundColor: '#f8f9fa', 
            padding: '4px 8px', 
            borderRadius: '4px',
            margin: '5px 0',
            fontFamily: 'monospace'
          }}>
            Chain ID: {walletChainId} | Expected: 0x2105/8453 (Base) or 0xa4ec/42220 (Celo) | 
            Is Base: {(walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453) ? '✅' : '❌'} | 
            Is Celo: {(walletChainId === '0xa4ec' || walletChainId === '42220' || walletChainId === 42220) ? '✅' : '❌'}
          </div>
          
          {/* Manual test button */}
          <button 
            onClick={() => {
              console.log('🧪 Manual test button clicked');
              console.log('Current state:', { walletConnected, walletAddress, walletChainId, topCoins, topCoinsLoading });
              if (walletAddress) {
                console.log('Calling getTopCoins manually with force refresh...');
                debouncedRefresh(walletAddress, true);
              }
            }}
            disabled={topCoinsLoading || (Date.now() - lastRefreshTime) < 2000}
            style={{
              padding: '4px 8px',
              backgroundColor: topCoinsLoading || (Date.now() - lastRefreshTime) < 2000 ? '#6c757d' : '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: topCoinsLoading || (Date.now() - lastRefreshTime) < 2000 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              margin: '5px 0'
            }}
          >
            🧪 Test Get Top Coins
            {topCoinsLoading && ' (Loading...)'}
            {(Date.now() - lastRefreshTime) < 2000 && !topCoinsLoading && ' (Wait...)'}
          </button>
          
          {/* Show top coins when connected to Base or Celo */}
          {(() => {
            // Check for supported chains: Base (0x2105/8453) or Celo (0xa4ec/42220)
            const isBaseChain = walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453;
            const isCeloChain = walletChainId === '0xa4ec' || walletChainId === '42220' || walletChainId === 42220;
            
            console.log('🔍 Rendering top coins section:', {
              walletChainId,
              isBaseChain,
              isCeloChain,
              expectedChainIds: ['0x2105', '8453', 8453, '0xa4ec', '42220', 42220],
              topCoinsLength: topCoins.length,
              topCoinsLoading
            });
            
            return (isBaseChain || isCeloChain) && (
              <div className="top-coins-section">
                <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px', color: '#333' }}>
                  Top Coins by $ Value {isBaseChain ? '(Base)' : '(Celo)'}
                </h4>
                
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
                    Loading top coins...
                  </div>
                ) : topCoins.length > 0 ? (
                  <>
                    {/* Total Portfolio Value */}
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#e8f5e8',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      textAlign: 'center'
                    }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>Total Portfolio: </span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                        ${topCoins.reduce((sum, coin) => sum + parseFloat(coin.value), 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="top-coins-list">
                      {topCoins.slice(0, 5).map((coin, index) => (
                        <div key={coin.address} className="coin-item" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 8px',
                          margin: '2px 0',
                          backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          <span style={{ fontWeight: 'bold', color: '#333' }}>
                            {coin.symbol}
                          </span>
                          <span style={{ color: '#666' }}>
                            {coin.balance}
                          </span>
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                            ${coin.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#999', 
                      textAlign: 'center', 
                      marginTop: '8px',
                      fontStyle: 'italic'
                    }}>
                      Last updated: {new Date().toLocaleTimeString()}
                      {lastRefreshTime > 0 && (
                        <span style={{ display: 'block', marginTop: '2px' }}>
                          Last refresh: {new Date(lastRefreshTime).toLocaleTimeString()}
                        </span>
                      )}
                      <span style={{ display: 'block', marginTop: '2px', color: '#17a2b8' }}>
                        {(() => {
                          const now = Date.now();
                          const cacheAge = now - (lastRefreshTime || 0);
                          const cacheAgeMinutes = Math.round(cacheAge / (1000 * 60));
                          if (cacheAge < 5 * 60 * 1000) {
                            return `📦 Cached data (${cacheAgeMinutes} min old)`;
                          } else {
                            return '🔄 Fresh data';
                          }
                        })()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    No tokens found
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    onClick={() => debouncedRefresh(walletAddress, true)}
                    disabled={topCoinsLoading || (Date.now() - lastRefreshTime) < 2000}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: topCoinsLoading || (Date.now() - lastRefreshTime) < 2000 ? '#6c757d' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: topCoinsLoading || (Date.now() - lastRefreshTime) < 2000 ? 'not-allowed' : 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    {topCoinsLoading ? 'Loading...' : 
                     (Date.now() - lastRefreshTime) < 2000 ? 'Wait...' : 'Refresh'}
                  </button>
                  <button 
                    onClick={() => {
                      const isBaseChain = walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453;
                      const isCeloChain = walletChainId === '0xa4ec' || walletChainId === '42220' || walletChainId === 42220;
                      
                      if (isBaseChain) {
                        window.open(`https://basescan.org/address/${walletAddress}`, '_blank');
                      } else if (isCeloChain) {
                        window.open(`https://explorer.celo.org/address/${walletAddress}`, '_blank');
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    View on {(() => {
                      const isBaseChain = walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453;
                      const isCeloChain = walletChainId === '0xa4ec' || walletChainId === '42220' || walletChainId === 42220;
                      
                      if (isBaseChain) return 'BaseScan';
                      if (isCeloChain) return 'Celo Explorer';
                      return 'Explorer';
                    })()}
                  </button>
                </div>
              </div>
            );
          })()}
          
          {/* Debug fallback - show top coins section even when not on supported chains */}
          {(() => {
            const isBaseChain = walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453;
            const isCeloChain = walletChainId === '0xa4ec' || walletChainId === '42220' || walletChainId === 42220;
            
            if (!isBaseChain && !isCeloChain && walletConnected && walletAddress) {
              return (
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffeaa7',
                  borderRadius: '6px',
                  margin: '10px 0',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔍 Debug: Top Coins Section Hidden</div>
                  <div>Chain ID: <code>{walletChainId}</code></div>
                  <div>Expected: <code>0x2105</code> or <code>8453</code> (Base) | <code>0xa4ec</code> or <code>42220</code> (Celo)</div>
                  <div>Is Base: {isBaseChain ? '✅' : '❌'}</div>
                  <div>Is Celo: {isCeloChain ? '✅' : '❌'}</div>
                  <div>Top Coins Data: {topCoins.length > 0 ? `${topCoins.length} coins` : 'No coins'}</div>
                  <div>Loading: {topCoinsLoading ? 'Yes' : 'No'}</div>
                  <button 
                    onClick={() => {
                      console.log('🧪 Debug: Calling getTopCoins from fallback...');
                      // Try to call the appropriate function based on chain
                      if (isBaseChain) {
                        getTopCoins(walletAddress, true);
                      } else if (isCeloChain) {
                        getTopCoinsCelo(walletAddress, true);
                      } else {
                        // Try Base as fallback
                        getTopCoins(walletAddress, true);
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      marginTop: '5px'
                    }}
                  >
                    Force Fetch Top Coins
                  </button>
                </div>
              );
            }
            return null;
          })()}
          
          <div className="wallet-actions">
            <button 
              onClick={() => disconnect()}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no wallet connected and not in Mini App, show manual connection info
  if (!isMiniApp) {
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
          <div className="status-item">
            <span className="status-label">Debug State:</span>
            <span className="status-value info">
              isMiniApp: {String(isMiniApp)} | 
              walletConnected: {String(walletConnected)} | 
              walletLoading: {String(walletLoading)}
            </span>
          </div>
        </div>
        <div className="wallet-note">
          <small>Your wallet will be automatically connected when you perform blockchain actions in this Farcaster Mini App.</small>
          <br />
          <small style={{ color: '#666', marginTop: '5px' }}>
            <strong>Note:</strong> You may need to approve the wallet connection in your Farcaster client. 
            The Farcaster client hosting this app will handle getting you connected to your preferred crypto wallet.
          </small>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={runConnectionTests}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Test Connection
          </button>
          <button 
            onClick={handleManualConnect}
            style={{
              padding: '8px 16px',
              backgroundColor: '#114488',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Manual Connect
          </button>
          <button 
            onClick={() => detectEnvironment()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Check Environment
          </button>
          <button 
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
} 