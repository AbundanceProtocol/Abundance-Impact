'use client'

import React, { useState, useEffect, useContext } from 'react';
import { AccountContext } from '../../context';
import { FaWallet, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { SiWalletconnect } from 'react-icons/si';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';

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
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);

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
    }
  }, [isConnected, address, chainId]);

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