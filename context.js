import { createContext, useState, useEffect } from "react";
import axios from "axios";
import useStore from "./utils/store";
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config as wagmiConfig } from './config/wagmi'

const queryClient = new QueryClient();



export const AccountContext = createContext(null)

export const AccountProvider = ({ children, initialAccount, ref1, cookies }) => {
  const store = useStore()
  const [showActions, setShowActions] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [miniApp, setMiniApp] = useState(false)
  const [autotipping, setAutotipping] = useState([])
  const [populate, setPopulate] = useState(0)
  const [userProfile, setUserProfile] = useState(null)
  const [showLogout, setShowLogout] = useState(false)
  const [userBalances, setUserBalances] = useState({impact: 0, qdau: 0})
  const [points, setPoints] = useState('$IMPACT')
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [prevPoints, setPrevPoints] = useState(null)
  const [isLogged, setIsLogged] = useState(false)
  const [fid, setFid] = useState(null)
  const [sched, setSched] = useState({ecoData: false, login: false})
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTarget, setPanelTarget] = useState(null);
  const [adminTest, setAdminTest] = useState(false)
  const [navMenu, setNavMenu] = useState(null)
  
  // Wallet integration state
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [walletChainId, setWalletChainId] = useState(null)
  const [walletProvider, setWalletProvider] = useState(null)
  const [walletError, setWalletError] = useState(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [topCoins, setTopCoins] = useState([])
  const [topCoinsLoading, setTopCoinsLoading] = useState(false)
  const [lastTopCoinsFetch, setLastTopCoinsFetch] = useState(0)
  const [topCoinsCache, setTopCoinsCache] = useState({})
  const [lastRpcCall, setLastRpcCall] = useState(0) // Track last RPC call time
  
  const router = useRouter()
  
  // Auto-detect Farcaster wallet when available (legacy method - keeping for fallback)
  // Only run on specific pages that need wallet functionality
  useEffect(() => {
    // Skip legacy detection if we're using Wagmi
    if (typeof window !== 'undefined' && window.wagmi) {
      console.log('🔄 Wagmi detected, skipping legacy wallet detection');
      return;
    }
    
    // Only run wallet detection on pages that need it
    const walletPages = [
      '/~/tip',
      '/~/tip/',
      '/~/multi-tip',
      '/~/ecosystems',
      '/~/curator',
      '/~/earn',
      '/~/earn/'
    ];
    
    const currentPath = router?.asPath || router?.pathname || '';
    const needsWallet = walletPages.some(page => currentPath.includes(page));
    
    if (!needsWallet) {
      console.log('🔄 Skipping wallet detection - not on a wallet-required page:', currentPath);
      return;
    }
    
    console.log('🔄 Running wallet detection for page:', currentPath);
    
    const detectFarcasterWallet = async () => {
      if (typeof window !== 'undefined' && !walletConnected) {
        console.log('🔄 Auto-detecting Farcaster wallet in context (legacy method)...');
        try {
          setWalletLoading(true);
          setWalletError(null);
          
          // Try to detect if Farcaster wallet is available using proper SDK
          try {
            const { sdk } = await import('@farcaster/miniapp-sdk');
            let provider = sdk.wallet.getEthereumProvider();
            
            console.log('🔍 Raw SDK provider:', provider, typeof provider);
            
            // Check if provider is a Promise and await it
            if (provider && typeof provider.then === 'function') {
              console.log('🔄 Provider is a Promise, awaiting...');
              provider = await provider;
              console.log('🔍 Awaited provider:', provider, typeof provider);
            }
            
            if (provider && provider.request) {
              console.log('✅ Farcaster wallet provider detected');
              
              // Test the provider by getting accounts
              try {
                const accounts = await provider.request({ method: 'eth_accounts' });
                console.log('🔍 Provider accounts:', accounts);
                
                if (accounts && accounts.length > 0) {
                  const address = accounts[0];
                  console.log('✅ Wallet connected with address:', address);
                  
                  setWalletConnected(true);
                  setWalletAddress(address);
                  setWalletProvider(provider);
                  
                  // Get chain ID
                  try {
                    const chainId = await provider.request({ method: 'eth_chainId' });
                    console.log('🔍 Chain ID:', chainId);
                    setWalletChainId(chainId);
                  } catch (chainError) {
                    console.warn('Could not get chain ID:', chainError);
                    setWalletChainId('0x2105'); // Default to Base
                  }
                  
                  // Set up event listeners
                  provider.on('accountsChanged', (accounts) => {
                    console.log('🔄 Accounts changed:', accounts);
                    if (accounts.length === 0) {
                      setWalletConnected(false);
                      setWalletAddress(null);
                    } else {
                      setWalletAddress(accounts[0]);
                    }
                  });
                  
                  provider.on('chainChanged', (chainId) => {
                    console.log('🔄 Chain changed:', chainId);
                    setWalletChainId(chainId);
                  });
                  
                  provider.on('disconnect', () => {
                    console.log('🔄 Wallet disconnected');
                    setWalletConnected(false);
                    setWalletAddress(null);
                    setWalletProvider(null);
                    setWalletChainId(null);
                  });
                  
                } else {
                  console.log('ℹ️ No accounts found, wallet not connected');
                }
              } catch (accountsError) {
                console.warn('Could not get accounts:', accountsError);
              }
            } else {
              console.log('ℹ️ No Farcaster wallet provider found');
            }
          } catch (sdkError) {
            console.log('ℹ️ Farcaster SDK not available:', sdkError.message);
          }
          
        } catch (error) {
          console.error('❌ Error detecting Farcaster wallet:', error);
          setWalletError(error.message);
        } finally {
          setWalletLoading(false);
        }
      }
    };
    
    // Run detection after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(detectFarcasterWallet, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [router?.asPath, router?.pathname, walletConnected]);
  
  // Wagmi status tracking
  const [wagmiStatus, setWagmiStatus] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWagmiStatus(window.wagmi ? 'available' : 'unavailable');
    }
  }, []);
  
  // Ecosystem data state
  const [ecoData, setEcoData] = useState(null);
  const [ecosystemsData, setEcosystemsData] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  // Login popup component
  const LoginPopup = () => {
    if (!showLogin) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#021326',
          border: '1px solid #11447799',
          borderRadius: '15px',
          padding: '20px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#cde', marginBottom: '20px' }}>Connect Wallet</h3>
          <p style={{ color: '#9df', marginBottom: '20px' }}>
            Please connect your Farcaster wallet to continue.
          </p>
          <button
            onClick={() => setShowLogin(false)}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  // Logout popup component
  const LogoutPopup = () => {
    if (!showLogout) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#021326',
          border: '1px solid #11447799',
          borderRadius: '15px',
          padding: '20px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#cde', marginBottom: '20px' }}>Logout</h3>
          <p style={{ color: '#9df', marginBottom: '20px' }}>
            Are you sure you want to logout?
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setIsLogged(false);
                setFid(null);
                setUserInfo(null);
                setUserBalances({impact: 0, qdau: 0});
                setShowLogout(false);
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
            <button
              onClick={() => setShowLogout(false)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Handle ecosystem change
  const handleEcoChange = (newEco) => {
    console.log('🔄 Ecosystem changed to:', newEco);
    setEcoData(newEco);
  };
  
  // Check ecosystem eligibility
  const checkEcoEligibility = async (ecoId) => {
    try {
      const response = await axios.get(`/api/ecosystem/checkEligibility?ecoId=${ecoId}`);
      setEligibility(response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking ecosystem eligibility:', error);
      return null;
    }
  };
  
  // Change ecosystem
  const changeEco = async (ecoId) => {
    try {
      const response = await axios.get(`/api/ecosystem/getEcoData?ecoId=${ecoId}`);
      setEcoData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error changing ecosystem:', error);
      return null;
    }
  };
  
  // Get ecosystems
  const getEcosystems = async () => {
    try {
      const response = await axios.get('/api/ecosystem/getEcosystems');
      setEcosystemsData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting ecosystems:', error);
      return [];
    }
  };
  
  // Get remaining balances
  const getRemainingBalances = async (ecoId) => {
    try {
      const response = await axios.get(`/api/ecosystem/getRemainingBalances?ecoId=${ecoId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting remaining balances:', error);
      return null;
    }
  };
  
  // Get top coins for Base network
  const getTopCoins = async (address, forceRefresh = false) => {
    console.log('🔍 getTopCoins called with:', { address, forceRefresh });
    
    if (!address) {
      console.log('❌ No address provided to getTopCoins');
      return [];
    }
    
    // Check cache first (5 minute cache)
    const cacheKey = `base_${address.toLowerCase()}`;
    const now = Date.now();
    const cacheAge = now - (lastTopCoinsFetch || 0);
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes
    
    if (!forceRefresh && cacheValid && topCoinsCache[cacheKey] && topCoinsCache[cacheKey].length > 0) {
      console.log('📦 Using cached Base tokens data (age:', Math.round(cacheAge / 1000), 'seconds)');
      return topCoinsCache[cacheKey];
    }
    
    // Prevent multiple simultaneous calls
    if (topCoinsLoading) {
      console.log('⏳ Already loading tokens, skipping...');
      return topCoins || [];
    }
    
    try {
      setTopCoinsLoading(true);
      console.log('🚀 Fetching Base tokens for address:', address);
      
      // Define Base network tokens
      const baseTokens = [
        { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
        { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
        { symbol: 'USDT', address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', decimals: 6 },
        { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
        { symbol: 'DEGEN', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', decimals: 18 },
        { symbol: 'BETR', address: '0xaD4Dc4712523B0180da5139Ad11C3FDDc6d7Cf06', decimals: 18 },
        { symbol: 'NOICE', address: '0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69', decimals: 18 },
        { symbol: 'TIPN', address: '0x5ba8d32579a4497c12d327289a103c3ad5b64eb1', decimals: 18 },
        { symbol: 'EGGS', address: '0x712f43b21cf3e1b189c27678c0f551c08c01d150', decimals: 18 },
        { symbol: 'USDGLO', address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
        { symbol: 'QR', address: '0x2b5050f01d64fbb3e4ac44dc07f0732bfb5ecadf', decimals: 18 }
      ];
      
      // Get token prices from CoinGecko API
      let tokenPrices = {};
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,tether,degen-token,betr,noice,tipn,eggs,usdglo&vs_currencies=usd');
        console.log('💰 CoinGecko API response status:', priceResponse.status);
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          console.log('💰 CoinGecko price data:', priceData);
          console.log('💰 QR price from CoinGecko:', priceData.qr?.usd); // Will be undefined now
          
          tokenPrices = {
            'ETH': priceData.ethereum?.usd || 3000,
            'WETH': priceData.ethereum?.usd || 3000,
            'USDC': priceData['usd-coin']?.usd || 1,
            'USDT': priceData.tether?.usd || 1,
            'DEGEN': priceData['degen-token']?.usd || 0.004144,
            'BETR': priceData.betr?.usd || 0.01,
            'NOICE': priceData.noice?.usd || 0.0003,
            'TIPN': priceData.tipn?.usd || 0.0008,
            'EGGS': priceData.eggs?.usd || 0.03,
            'USDGLO': priceData.usdglo?.usd || 1.00,
            'QR': priceData.qr?.usd || 0.000036 // Fallback price for QR
          };
          console.log('💰 Final token prices:', tokenPrices);
        } else if (priceResponse.status === 429) {
          console.warn('CoinGecko rate limit hit, using fallback prices');
          throw new Error('Rate limit exceeded');
        }
      } catch (error) {
        console.warn('Failed to fetch token prices, using fallback prices:', error);
        // Fallback prices
        tokenPrices = {
          'ETH': 3000, 'WETH': 3000, 'USDC': 1, 'USDT': 1, 'DEGEN': 0.004144, 
          'BETR': 0.01, 'NOICE': 0.0003, 'TIPN': 0.0008, 'EGGS': 0.03, 'USDGLO': 1.00, 'QR': 0.000036
        };
      }
      
      const allTokenBalances = [];
      const rpcUrl = 'https://mainnet.base.org';
      
      // Get native ETH balance
      try {
        const balanceResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
          })
        });
        
        const balanceData = await balanceResponse.json();
        if (balanceData.result && balanceData.result !== '0x') {
          const balance = parseInt(balanceData.result, 16) / Math.pow(10, 18);
          if (balance > 0.000001) {
            const price = tokenPrices['ETH'] || 3000;
            const value = balance * price;
            
            allTokenBalances.push({
              symbol: 'ETH',
              address: '0x0000000000000000000000000000000000000000',
              balance: balance.toFixed(4),
              price: price,
              value: value.toFixed(2),
              network: 'Base',
              networkKey: 'base',
              chainId: '0x2105',
              isNative: true
            });
          }
        }
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
      }
      
      // Get ERC20 token balances
      for (const token of baseTokens.filter(t => !t.isNative)) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
          
          const balanceResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: token.address,
                data: `0x70a08231${address.slice(2).padStart(64, '0')}`
              }, 'latest'],
              id: 1
            })
          });
          
          const balanceData = await balanceResponse.json();
          if (balanceData.error) continue;
          
          if (balanceData.result && balanceData.result !== '0x') {
            const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
            if (balance > 0.000001) {
              const price = tokenPrices[token.symbol] || 1;
              const value = balance * price;
              
              allTokenBalances.push({
                symbol: token.symbol,
                address: token.address,
                balance: balance.toFixed(4),
                price: price,
                value: value.toFixed(2),
                network: 'Base',
                networkKey: 'base',
                chainId: '0x2105',
                isNative: false
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
        }
      }
      
      // Filter out tokens with value under $0.50
      const filteredTokens = allTokenBalances.filter(token => {
        const value = parseFloat(token.value);
        return value >= 0.50;
      });
      
      // Sort by $ value (highest first)
      const sortedTokens = filteredTokens.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      
      console.log('Base tokens by value:', sortedTokens);
      
      setTopCoins(sortedTokens);
      setTopCoinsCache(prev => ({ ...prev, [cacheKey]: sortedTokens }));
      setLastTopCoinsFetch(now);
      
      return sortedTokens;
      
    } catch (error) {
      console.error('Error fetching Base tokens:', error);
      return topCoins || [];
    } finally {
      setTopCoinsLoading(false);
    }
  };
  
  // Get top coins for Celo network
  const getTopCoinsCelo = async (address, forceRefresh = false) => {
    console.log('🔍 getTopCoinsCelo called with:', { address, forceRefresh });
    
    if (!address) {
      console.log('❌ No address provided to getTopCoinsCelo');
      return [];
    }
    
    // Check cache first (5 minute cache)
    const cacheKey = `celo_${address.toLowerCase()}`;
    const now = Date.now();
    const cacheAge = now - (lastTopCoinsFetch || 0);
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes
    
    if (!forceRefresh && cacheValid && topCoinsCache[cacheKey] && topCoinsCache[cacheKey].length > 0) {
      console.log('📦 Using cached Celo tokens data (age:', Math.round(cacheAge / 1000), 'seconds)');
      return topCoinsCache[cacheKey];
    }
    
    // Prevent multiple simultaneous calls
    if (topCoinsLoading) {
      console.log('⏳ Already loading tokens, skipping...');
      return topCoins || [];
    }
    
    try {
      setTopCoinsLoading(true);
      console.log('🚀 Fetching Celo tokens for address:', address);
      
      // Define Celo network tokens
      const celoTokens = [
        { symbol: 'CELO', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
        { symbol: 'USDC', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals: 6 },
        { symbol: 'WETH', address: '0x122013fd7dF1C6F636a5bb8f03108E876548b455', decimals: 18 }
      ];
      
      // Get token prices from CoinGecko API
      let tokenPrices = {};
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=celo,usd-coin,ethereum&vs_currencies=usd');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          
          tokenPrices = {
            'CELO': priceData.celo?.usd || 0.5,
            'USDC': priceData['usd-coin']?.usd || 1,
            'WETH': priceData.ethereum?.usd || 3000
          };
        } else if (priceResponse.status === 429) {
          console.warn('CoinGecko rate limit hit, using fallback prices');
          throw new Error('Rate limit exceeded');
        }
      } catch (error) {
        console.warn('Failed to fetch token prices, using fallback prices:', error);
        // Fallback prices
        tokenPrices = {
          'CELO': 0.5, 'USDC': 1, 'WETH': 3000
        };
      }
      
      const allTokenBalances = [];
      const rpcUrl = 'https://forno.celo.org';
      
      // Get native CELO balance
      try {
        const balanceResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
          })
        });
        
        const balanceData = await balanceResponse.json();
        if (balanceData.result && balanceData.result !== '0x') {
          const balance = parseInt(balanceData.result, 16) / Math.pow(10, 18);
          if (balance > 0.000001) {
            const price = tokenPrices['CELO'] || 0.5;
            const value = balance * price;
            
            allTokenBalances.push({
              symbol: 'CELO',
              address: '0x0000000000000000000000000000000000000000',
              balance: balance.toFixed(4),
              price: price,
              value: value.toFixed(2),
              network: 'Celo',
              networkKey: 'celo',
              chainId: '0xa4ec',
              isNative: true
            });
          }
        }
      } catch (error) {
        console.error('Error fetching CELO balance:', error);
      }
      
      // Get ERC20 token balances
      for (const token of celoTokens.filter(t => !t.isNative)) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
          
          const balanceResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: token.address,
                data: `0x70a08231${address.slice(2).padStart(64, '0')}`
              }, 'latest'],
              id: 1
            })
          });
          
          const balanceData = await balanceResponse.json();
          if (balanceData.error) continue;
          
          if (balanceData.result && balanceData.result !== '0x') {
            const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
            if (balance > 0.000001) {
              const price = tokenPrices[token.symbol] || 1;
              const value = balance * price;
              
              allTokenBalances.push({
                symbol: token.symbol,
                address: token.address,
                balance: balance.toFixed(4),
                price: price,
                value: value.toFixed(2),
                network: 'Celo',
                networkKey: 'celo',
                chainId: '0xa4ec',
                isNative: false
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
        }
      }
      
      // Filter out tokens with value under $0.50
      const filteredTokens = allTokenBalances.filter(token => {
        const value = parseFloat(token.value);
        return value >= 0.50;
      });
      
      // Sort by $ value (highest first)
      const sortedTokens = filteredTokens.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      
      console.log('Celo tokens by value:', sortedTokens);
      
      setTopCoins(sortedTokens);
      setTopCoinsCache(prev => ({ ...prev, [cacheKey]: sortedTokens }));
      setLastTopCoinsFetch(now);
      
      return sortedTokens;
      
    } catch (error) {
      console.error('Error fetching Celo tokens:', error);
      return topCoins || [];
    } finally {
      setTopCoinsLoading(false);
    }
  };

  // Fetch additional important tokens that might not be in API
  const fetchAdditionalTokens = async (address) => {
    console.log('🔄 Fetching additional important tokens for address:', address);
    
    const additionalTokens = [];
    
    // Focus on Base network tokens first (most important)
    const baseTokens = [
      { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true, network: 'Base', networkKey: 'base', chainId: '0x2105' },
      { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, network: 'Base', networkKey: 'base', chainId: '0x2105' },
      { symbol: 'USDT', address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', decimals: 6, network: 'Base', networkKey: 'base', chainId: '0x2105' },
      { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, network: 'Base', networkKey: 'base', chainId: '0x2105' }
    ];
    
    // Celo network tokens 
    const celoTokens = [
      { symbol: 'CELO', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true, network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' },
      { symbol: 'USDC', address: '0xceba60280fb0ecd9a5a2348c5a3b8f397cc1b1d4', decimals: 6, network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' },
    ];
    
    // All tokens to check (focus on Base and Celo for now)
    const allTokensToCheck = [...baseTokens, ...celoTokens];
    
    // RPC URLs for different networks
    const rpcUrls = {
      'base': 'https://mainnet.base.org',
      'celo': 'https://forno.celo.org'
    };
    
    // Process tokens by network
    for (const token of allTokensToCheck) {
      try {
        const rpcUrl = rpcUrls[token.networkKey];
        if (!rpcUrl) {
          console.log(`⚠️ No RPC URL for network: ${token.networkKey}`);
          continue;
        }
        
        console.log(`🔄 Fetching ${token.symbol} on ${token.network} (${token.networkKey})...`);
        
        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
        
        if (token.isNative) {
          // Get native token balance
          const balanceResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [address, 'latest'],
              id: 1
            })
          });
          
          const balanceData = await balanceResponse.json();
          if (balanceData.result && balanceData.result !== '0x') {
            const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
            if (balance > 0.000001) {
              const price = token.symbol === 'CELO' ? 0.5 : 3000; // CELO vs ETH price
              const value = balance * price;
              
              if (value >= 0.50) { // Only add if value >= $0.50
                const newToken = {
                  symbol: token.symbol,
                  address: token.address,
                  balance: balance.toFixed(4),
                  price: price,
                  value: value.toFixed(2),
                  network: token.network,
                  networkKey: token.networkKey,
                  chainId: token.chainId,
                  isNative: true,
                  decimals: token.decimals,
                  logo: token.symbol === 'CELO' ? '/images/tokens/celo.jpg' : '/images/tokens/ethereum.png'
                };
                additionalTokens.push(newToken);
                console.log(`✅ Added native token: ${token.symbol} - Balance: ${balance.toFixed(4)}, Value: $${value.toFixed(2)}, Network: ${token.network}`);
              } else {
                console.log(`⚠️ ${token.symbol} value too low: $${value.toFixed(2)} (balance: ${balance.toFixed(4)})`);
              }
            }
          }
        } else {
          // Get ERC20 token balance
          const balanceResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: token.address,
                data: `0x70a08231${address.slice(2).padStart(64, '0')}`
              }, 'latest'],
              id: 1
            })
          });
          
          const balanceData = await balanceResponse.json();
          if (balanceData.result && balanceData.result !== '0x') {
            const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
            if (balance > 0.000001) {
              const price = token.symbol === 'USDC' || token.symbol === 'USDT' ? 1 : 3000; // Default prices
              const value = balance * price;
              
              if (value >= 0.50) { // Only add if value >= $0.50
                const newToken = {
                  symbol: token.symbol,
                  address: token.address,
                  balance: balance.toFixed(4),
                  price: price,
                  value: value.toFixed(2),
                  network: token.network,
                  networkKey: token.networkKey,
                  chainId: token.chainId,
                  isNative: false,
                  decimals: token.decimals,
                  logo: token.symbol === 'USDC' ? '/images/tokens/usdc.png' : 
                        token.symbol === 'USDT' ? '/images/tokens/usdt.jpeg' :
                        token.symbol === 'WETH' ? '/images/tokens/ethereum.png' : '/images/tokens/ethereum.png'
                };
                additionalTokens.push(newToken);
                console.log(`✅ Added ERC20 token: ${token.symbol} - Balance: ${balance.toFixed(4)}, Value: $${value.toFixed(2)}, Network: ${token.network}`);
              } else {
                console.log(`⚠️ ${token.symbol} value too low: $${value.toFixed(2)} (balance: ${balance.toFixed(4)})`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching ${token.symbol} balance from ${token.network}:`, error);
      }
    }
    
    console.log('🔄 Additional tokens fetched:', additionalTokens);
    console.log('🔄 Total additional tokens count:', additionalTokens.length);
    return additionalTokens;
  };

  const getAllTokens = async (address, forceRefresh = false) => {
    console.log('🔍 getAllTokens called with:', { address, forceRefresh });
    
    if (!address) {
      console.log('❌ No address provided to getAllTokens');
      return [];
    }
    
    // Check cache first (5 minute cache)
    const cacheKey = `all_${address.toLowerCase()}`;
    const now = Date.now();
    const cacheAge = now - (lastTopCoinsFetch || 0);
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes
    
    if (!forceRefresh && cacheValid && topCoinsCache[cacheKey] && topCoinsCache[cacheKey].length > 0) {
      console.log('📦 Using cached all tokens data (age:', Math.round(cacheAge / 1000), 'seconds)');
      return topCoinsCache[cacheKey];
    }
    
    // Prevent multiple simultaneous calls
    if (topCoinsLoading) {
      console.log('⏳ Already loading tokens, skipping...');
      return topCoins || [];
    }
    
    try {
      setTopCoinsLoading(true);
      console.log('🚀 Fetching tokens from API for address:', address);
      
      const response = await fetch(`/api/wallet/tokens?address=${address}`);
      
      if (!response.ok) {
        throw new Error(`Proxy API error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Proxy API response:', data);
      
      if (!data.success || !data.tokens) {
        throw new Error('Invalid API response');
      }
      
      // Transform data to app's format
      const transformedTokens = data.tokens.map(token => {
        // Calculate price per token (worth / balance)
        const price = token.balance > 0 ? parseFloat(token.worth) / parseFloat(token.balance) : 0;
        
        // Determine if it's a native token (ETH)
        const isNative = token.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || 
                        token.symbol === 'ETH';
        
        // Determine network key based on chainId - handle both string and number
        let networkKey = 'base'; // default
        const chainIdNum = parseInt(token.chainId);
        console.log('🔍 Token chainId:', token.chainId, 'parsed:', chainIdNum);
        
        switch (chainIdNum) {
          case 8453:
            networkKey = 'base';
            break;
          case 1:
            networkKey = 'ethereum';
            break;
          case 42220:
            networkKey = 'celo';
            break;
          case 10:
            networkKey = 'optimism';
            break;
          case 42161:
            networkKey = 'arbitrum';
            break;
          case 137:
            networkKey = 'polygon';
            break;
          default:
            networkKey = 'base'; // fallback
        }
        
        console.log('🔍 Mapped networkKey:', networkKey, 'for chainId:', token.chainId);
        
        return {
          symbol: token.symbol.toUpperCase(),
          address: token.address,
          balance: token.balance.toString(),
          price: price,
          value: parseFloat(token.worth).toFixed(2),
          network: token.chainName, // Use actual chain name from API
          networkKey: networkKey,
          chainId: token.chainId.toString(),
          isNative: isNative,
          decimals: token.decimals,
          logo: token.logo,
          safe: token.safe
        };
      }).filter(token => {
        // Filter out tokens with value under $0.50
        const value = parseFloat(token.value);
        return value >= 0.50;
      });
      
      // Fetch additional important tokens that might not be in API
      console.log('🔄 Fetching additional tokens...');
      const additionalTokens = await fetchAdditionalTokens(address);
      
      // Combine fetched tokens with additional tokens
      const allTokens = [...transformedTokens, ...additionalTokens];
      console.log('🔍 Combined tokens count:', allTokens.length);
      console.log('🔍 Fetched tokens:', transformedTokens.length, 'Additional tokens:', additionalTokens.length);
      
      // Remove duplicates based on address
      const uniqueTokens = allTokens.reduce((acc, token) => {
        const existing = acc.find(t => t.address.toLowerCase() === token.address.toLowerCase());
        if (!existing) {
          acc.push(token);
        } else if (parseFloat(token.value) > parseFloat(existing.value)) {
          // Keep the token with higher value
          const index = acc.indexOf(existing);
          acc[index] = token;
        }
        return acc;
      }, []);
      
      console.log('🔍 Unique tokens after deduplication:', uniqueTokens.length);
      
      // Sort by $ value (highest first)
      const sortedTokens = uniqueTokens.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      
      console.log('🎯 All tokens:', sortedTokens);
      
      // Debug each token's network info
      sortedTokens.forEach((token, index) => {
        console.log(`🔍 Token ${index + 1}: ${token.symbol} - Network: ${token.network}, NetworkKey: ${token.networkKey}, ChainId: ${token.chainId}`);
      });
      
      // Debug: Check for specific tokens
      const qrToken = sortedTokens.find(t => t.symbol === 'QR');
      const eggsToken = sortedTokens.find(t => t.symbol === 'EGGS');
      const usdgloToken = sortedTokens.find(t => t.symbol === 'USDGLO');
      
      if (qrToken) {
        console.log('✅ QR token found:', qrToken);
      }
      if (eggsToken) {
        console.log('✅ EGGS token found:', eggsToken);
      }
      if (usdgloToken) {
        console.log('✅ USDGLO token found:', usdgloToken);
      }
      
      // Update state
      setTopCoins(sortedTokens);
      setTopCoinsCache(prev => ({ ...prev, [cacheKey]: sortedTokens }));
      setLastTopCoinsFetch(now);
      
      return sortedTokens;
      
    } catch (error) {
      console.error('❌ Proxy API error:', error);
      console.log('🔄 Falling back to RPC system...');
      
      // Fallback to RPC system if proxy API fails
      return await getAllTokensRPC(address, forceRefresh);
      
    } finally {
      setTopCoinsLoading(false);
    }
  };

  // Fallback RPC-based token fetching (keep as backup)
  const getAllTokensRPC = async (address, forceRefresh = false) => {
    console.log('🔄 Using RPC fallback for address:', address);
    
    try {
      setTopCoinsLoading(true);
      
      // Simplified RPC fetching for Base network only
      const baseTokens = [
        { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
        { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
        { symbol: 'USDT', address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', decimals: 6 },
        { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
        { symbol: 'DEGEN', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', decimals: 18 },
        { symbol: 'BETR', address: '0xaD4Dc4712523B0180da5139Ad11C3FDDc6d7Cf06', decimals: 18 },
        { symbol: 'NOICE', address: '0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69', decimals: 18 },
        { symbol: 'TIPN', address: '0x5ba8d32579a4497c12d327289a103c3ad5b64eb1', decimals: 18 },
        { symbol: 'EGGS', address: '0x712f43b21cf3e1b189c27678c0f551c08c01d150', decimals: 18 },
        { symbol: 'USDGLO', address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
        { symbol: 'QR', address: '0x2b5050f01d64fbb3e4ac44dc07f0732bfb5ecadf', decimals: 18 }
      ];
      
      const rpcUrl = 'https://mainnet.base.org';
      const allTokenBalances = [];
      
      // Get native ETH balance
      try {
        const balanceResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
          })
        });
        
        const balanceData = await balanceResponse.json();
        if (balanceData.result && balanceData.result !== '0x') {
          const balance = parseInt(balanceData.result, 16) / Math.pow(10, 18);
          if (balance > 0.000001) {
            allTokenBalances.push({
              symbol: 'ETH',
              address: '0x0000000000000000000000000000000000000000',
              balance: balance.toFixed(4),
              price: 3000, // Fallback price
              value: (balance * 3000).toFixed(2),
              network: 'Base',
              networkKey: 'base',
              chainId: '0x2105',
              isNative: true
            });
          }
        }
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
      }
      
      // Get ERC20 token balances (simplified - just a few key tokens)
      const keyTokens = baseTokens.filter(t => !t.isNative).slice(0, 5); // Limit to 5 tokens to avoid rate limits
      
      for (const token of keyTokens) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
          
          const balanceResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: token.address,
                data: `0x70a08231${address.slice(2).padStart(64, '0')}`
              }, 'latest'],
              id: 1
            })
          });
          
          const balanceData = await balanceResponse.json();
          if (balanceData.result && balanceData.result !== '0x') {
            const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
            if (balance > 0.000001) {
              const price = 1; // Fallback price
              allTokenBalances.push({
                symbol: token.symbol,
                address: token.address,
                balance: balance.toFixed(4),
                price: price,
                value: (balance * price).toFixed(2),
                network: 'Base',
                networkKey: 'base',
                chainId: '0x2105',
                isNative: false
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
        }
      }
      
      // Filter out tokens with value under $0.50
      const filteredTokens = allTokenBalances.filter(token => {
        const value = parseFloat(token.value);
        return value >= 0.50;
      });
      
      const sortedTokens = filteredTokens.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      console.log('🔄 RPC fallback results:', sortedTokens);
      
      return sortedTokens;
      
    } catch (error) {
      console.error('Error in RPC fallback:', error);
      return [];
    } finally {
      setTopCoinsLoading(false);
    }
  };

  const contextValue = {
    ...initialAccount,
    ref1,
    handleEcoChange,
    checkEcoEligibility,
    LoginPopup,
    LogoutPopup,
    changeEco,
    getEcosystems,
    getRemainingBalances,
    getTopCoins,
    getTopCoinsCelo,
    getAllTokens,
    miniApp, setMiniApp,
    isMiniApp, setIsMiniApp,
    fid, setFid,
    points, setPoints,
    ecoData, setEcoData,
    ecosystemsData, setEcosystemsData,
    autotipping, setAutotipping,
    isLogged, setIsLogged,
    userBalances, setUserBalances,
    eligibility, setEligibility,
    showLogout, setShowLogout,
    showLogin, setShowLogin,
    showActions, setShowActions,
    populate, setPopulate,
    userProfile, setUserProfile,
    prevPoints, setPrevPoints,
    sched, setSched,
    panelOpen, setPanelOpen,
    panelTarget, setPanelTarget,
    adminTest, setAdminTest,
    navMenu, setNavMenu,
    // Wallet integration
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
    lastRpcCall, setLastRpcCall,
    wagmiStatus, setWagmiStatus,
    userInfo, setUserInfo
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <AccountContext.Provider value={contextValue}>
          {children}
        </AccountContext.Provider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
