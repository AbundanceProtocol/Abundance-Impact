import { createContext, useState, useEffect } from "react";
import axios from "axios";
import useStore from "./utils/store";
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { cookieToInitialState, WagmiProvider } from 'wagmi';
import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, base } from '@reown/appkit/networks'
import { config as wagmiConfig } from './config/wagmi'

const queryClient = new QueryClient();
const projectId = process.env.NEXT_PUBLIC_WAGMI_KEY || 'default-project-id'

// Only warn in development
if (!process.env.NEXT_PUBLIC_WAGMI_KEY) {
  console.warn('NEXT_PUBLIC_WAGMI_KEY is not defined. Using default project ID.');
}

const networks = [mainnet, arbitrum, base]

let wagmiAdapter;
try {
  wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
      storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks,
  })
} catch (error) {
  console.warn('Failed to initialize WagmiAdapter:', error.message);
  // Create a minimal fallback adapter
  wagmiAdapter = null;
}



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
  const initEcosystems = [{
    channels: [],
    condition_channels: false,
    condition_curators_threshold: 1,
    condition_following_channel: false,
    condition_following_owner: false,
    condition_holding_erc20: false,
    condition_holding_nft: false,
    condition_points_threshold: 1,
    condition_powerbadge: false,
    createdAt: "2024-06-17T03:19:16.065Z",
    downvote_value: 1,
    ecosystem_moderators: [],
    ecosystem_name: 'Abundance',
    ecosystem_handle: 'abundance',
    ecosystem_points_name: '$IMPACT',
    ecosystem_rules: [`Can't do evil`],
    erc20s: [],
    fid: 3,
    nfts: [],
    owner_name: 'abundance',
    percent_tipped: 10,
    points_per_tip: 1,
    upvote_value: 1,
  }]
  const [ecoData, setEcoData] = useState(null)
  const [ecosystemsData, setEcosystemsData] = useState([])
  const initialEligibility = {
    badge: false,
    badgeReq: false,
    channelFollower: false,
    channelFollowerReq: false,
    ownerFollower: false,
    ownerFollowerReq: false,
    holdingNFT: false,
    holdingNFTReq: false,
    holdingERC20: false,
    holdingERC20Req: false,
    eligibility: false,
    hasWallet: false,
    hasWalletReq: false,
    mod: false,
    modReq: false,
  }
  const [eligibility, setEligibility] = useState(initialEligibility)
  const [userInfo, setUserInfo] = useState({pfp: null, username: null, display: null})

  const getUserProfile = async (fid) => {
    try {
      const response = await axios.get('/api/getUserProfile', {
        params: {
          fid: fid,
        }
      })
      if (response?.data?.userProfile[0]) {
        const user = response?.data?.userProfile[0]
        setUserProfile(user)
        store.setUserProfile(user)
        store.setUsernameFC(user.username)
        store.setSrcUrlFC(user.pfp_url)
        store.setUserDisplayNameFC(user.display_name)
        store.setUserActiveFC(user.active_status)
        store.setUserBioFC(user.profile.bio.text)
        store.setUserFollowersFC(user.follower_count)
        store.setUserFollowingFC(user.following_count)
        let verEthAddresses = []
        for (const address of user.verified_addresses.eth_addresses) 
          verEthAddresses.push(address)
        store.setUserEthVerAddresses(verEthAddresses)
        let verSolAddresses = []
        for (const address of user.verified_addresses.sol_addresses) 
          verSolAddresses.push(address)
        store.setUserSolVerAddresses(verSolAddresses)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  const getEcosystems = async (points) => {
    console.log('c1', points)
    try {
      const response = await axios.get('/api/ecosystem/getEcosystems')
      // console.log(response)
      if (response?.data?.ecosystems?.length > 0) {
        const ecosystems = response?.data?.ecosystems
        let ecoIndex = -1
        if (router.route == '/~/ecosystems/[ecosystem]') {
          ecoIndex = ecosystems.findIndex(eco => eco.ecosystem_handle == router.query?.ecosystem)
        } else {
          ecoIndex = ecosystems.findIndex(eco => eco.ecosystem_points_name == points)
        }
        
        if (ecoIndex !== -1) { 
          console.log('c2', ecosystems[ecoIndex], isLogged)
          setEcoData(ecosystems[ecoIndex])
          store.setPoints(ecosystems[ecoIndex].ecosystem_points_name)
          setPoints(ecosystems[ecoIndex].ecosystem_points_name)
        } else {
          console.log('c3', ecosystems[0])
          setEcoData(ecosystems[0])
          store.setPoints(ecosystems[0].ecosystem_points_name)
          setPoints(ecosystems[0].ecosystem_points_name)
        }
        setEcosystemsData(ecosystems)
      } else {
        console.log('c4', initEcosystems)
        setEcosystemsData(initEcosystems)
        setEcoData(initEcosystems[0])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setEcosystemsData(initEcosystems)
      setEcoData(initEcosystems[0])
    }
  }

  useEffect(() => {
    if (
      router.route !== "/~/ecosystems/[ecosystem]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/[eco]/[curators]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-basic" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v6" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v4" &&
      router.route !== "/~/ecosystems/[ecosystem]/rank-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/rewards-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/daily-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/curation-v1" &&
      router.route !== "/~/studio/multi-tip-compose"
    ) {
      console.log("c5 triggered []");
      console.log("c6", store.points, points);
      getEcosystems(store.points || points);
      console.log("c7", router);
    }
  }, [])

  useEffect(() => {
    console.log('c8 triggered [ecoData]')
    console.log('c9', isLogged, ecoData)
    const updateEcoData = () => {
      if (isLogged && ecoData) {
        setPopulate(populate+1)
        setPoints(ecoData?.ecosystem_points_name)
        if (router.route !== '/' && userBalances.impact == 0) {
          console.log('c10 points', store.fid, points)
          getRemainingBalances(fid || store.fid, ecoData?.ecosystem_points_name, store.signer_uuid)
        }
      }
    }

    if (
      router.route !== "/~/ecosystems/[ecosystem]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/[eco]/[curators]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-basic" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v6" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v4" &&
      router.route !== "/~/ecosystems/[ecosystem]/rank-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/rewards-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/daily-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/curation-v1" &&
      router.route !== "/~/studio/multi-tip-compose"
    ) {
      if (sched.ecoData) {
        updateEcoData();
        setSched((prev) => ({ ...prev, ecoData: false }));
      } else {
        const timeoutId = setTimeout(() => {
          updateEcoData();
          setSched((prev) => ({ ...prev, ecoData: false }));
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [ecoData, isLogged, sched.ecoData])

  useEffect(() => {
    console.log('c11 triggered [store.isAuth]')

    const updateLogin = () => {
      console.log('c12 store triggered', store.isAuth, miniApp)
      if (store.isAuth) {
        console.log('c12-6')
        setIsLogged(true);
        setFid(fid || store.fid)
        getUserProfile(fid || store.fid)
        setShowLogin(false)
      } else {
        if (router.route !== '/~/curator/[fid]') {
          console.log('c12-2', isLogged)
          setIsLogged(false);
          setFid(null)
          setUserBalances({impact: 0, qdau: 0})
          setUserProfile(null)
        }

        if (router.route !== '/' && router.route !== '/~/curator/[fid]') {
          console.log('c13-1')
          LoginPopup()
        }
      }
    }

    console.log('c13-2', router.route, router.route !== "/~/ecosystems/[ecosystem]/tip-basic")
    if (
      router.route !== "/~/ecosystems/[ecosystem]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/[eco]/[curators]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-basic" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v6" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v4" &&
      router.route !== "/~/ecosystems/[ecosystem]/rank-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/rewards-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/daily-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/curation-v1" &&
      router.route !== "/~/studio/multi-tip-compose" &&
      !miniApp
    ) {
      if (sched.login) {
        updateLogin();
        setSched((prev) => ({ ...prev, login: false }));
      } else {
        const timeoutId = setTimeout(() => {
          updateLogin();
          setSched((prev) => ({ ...prev, login: false }));
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }

  }, [store.isAuth, sched.login]);

  const getRemainingBalances = async (fid, points, uuid, referrer) => {
    try {
      const response = await axios.get('/api/ecosystem/getBalances', {
        params: { fid, points } })
      if (response?.data?.user) {
        console.log('c13', response?.data?.user)
        const remainingImpact = response?.data?.user?.remaining_i_allowance || 0
        const remainingQuality = response?.data?.user?.remaining_q_allowance || 0
        setUserBalances(prev => ({
          ...prev,
          impact: remainingImpact,
          qdau: remainingQuality
        }))
        setEligibility(initialEligibility)
      } else {
        console.log('c13-7')
        setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
        checkEcoEligibility(fid, points, uuid, referrer)
      }
    } catch (error) {
      console.error('Error, getRemainingBalances failed:', error)
      checkEcoEligibility(fid, points, uuid, referrer)
      setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
    }
  }

  const checkEcoEligibility = async (fid, points, uuid, referrer) => {
    console.log('c14', fid, points, prevPoints)
    if (!fid) {
      LoginPopup()
    } else if (points !== prevPoints) {
      setPrevPoints(points)
      try {
        const response = await axios.get('/api/ecosystem/checkUserEligibility', {
          params: { fid, points, uuid, referrer } })
        // console.log(response)
        if (response?.data?.eligibilityData) {
          let eligibilityData = response?.data?.eligibilityData
          setEligibility(eligibilityData)
        } else {
          setEligibility(initialEligibility)
        }
        if (response?.data?.createUser) {
          let userData = response.data?.createUser
          setUserBalances(prev => ({
            ...prev,
            impact: userData.remaining_i_allowance,
            qdau: userData.remaining_q_allowance
          }))
          console.log('userBalance', userData.remaining_i_allowance)

        } else {
          setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
          console.log('userBalance 0')
        }
      } catch (error) {
        console.error('Error, checkEcoEligibility failed:', error)
        setEligibility(initialEligibility)
        setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
        console.log('userBalance 1')
      }
    }
  }

  const LoginPopup = async () => { setShowLogin(true) }

  const LogoutPopup = async () => { setShowLogout(true) }

  const handleEcoChange = (event) => {
    const system = ecosystemsData.find(eco => eco.ecosystem_points_name == event.target.value)
    console.log('c15', event.target.value)
    store.setEcosystemData(system)
    setEcoData(system);
    setPrevPoints(null)
    // if (router.route == '/~/ecosystems/[ecosystem]' && router.asPath !== `/~/ecosystems/${system.ecosystem_handle}`) {
      router.push(`/~/ecosystems/${system.ecosystem_handle}`)
    // }
  };

  const changeEco = (system) => {
    console.log('c16 system', system)
    store.setEcosystemData(system)
    setEcoData(system);
  };

  // Get user's top coins by $ value from Base chain
  const getTopCoins = async (address, forceRefresh = false) => {
    if (!address) return;
    
    // Check cache first (5 minute cache)
    const cacheKey = address.toLowerCase();
    const now = Date.now();
    const cacheAge = now - (lastTopCoinsFetch || 0);
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes
    
    if (!forceRefresh && cacheValid && topCoinsCache[cacheKey] && topCoinsCache[cacheKey].length > 0) {
      console.log('📦 Using cached top coins data (age:', Math.round(cacheAge / 1000), 'seconds)');
      setTopCoins(topCoinsCache[cacheKey]);
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (topCoinsLoading) {
      console.log('⏳ Already loading top coins, skipping...');
      return;
    }
    
    // RPC rate limiting - prevent calls within 10 seconds of each other
    const timeSinceLastRpc = now - (lastRpcCall || 0);
    if (timeSinceLastRpc < 10000) { // 10 seconds
      console.log('⏳ RPC rate limit active, please wait...', Math.ceil((10000 - timeSinceLastRpc) / 1000), 'seconds remaining');
      return;
    }
    
    try {
      setTopCoinsLoading(true);
      setLastRpcCall(now); // Mark this as the last RPC call
      console.log('Fetching top coins for address:', address);
      
      // Base chain RPC URL
      const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
      
      // Common token addresses on Base
      const commonTokens = [
        { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
        { symbol: 'DEGEN', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', decimals: 18 },
        { symbol: 'BETR', address: '0x1F32b1c2345538c0c6f582fCB0223cA264d87105', decimals: 18 },
        { symbol: 'NOICE', address: '0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69', decimals: 18 },
        { symbol: 'TIPN', address: '0x5ba8d32579a4497c12d327289a103c3ad5b64eb1', decimals: 18 }
      ];

      // Get token prices from CoinGecko API (free tier) first
      let tokenPrices = {};
      try {
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use a more comprehensive price fetch for Base tokens
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,degen,betr,noice,tipn&vs_currencies=usd');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          tokenPrices = {
            'WETH': priceData.ethereum?.usd || 3000,
            'USDC': priceData['usd-coin']?.usd || 1,
            'DEGEN': priceData.degen?.usd || 0.0001, // Use actual DEGEN price or fallback
            'BETR': priceData.betr?.usd || 0.01,
            'NOICE': priceData.noice?.usd || 0.01,
            'TIPN': priceData.tipn?.usd || 0.01
          };
        } else if (priceResponse.status === 429) {
          console.warn('CoinGecko rate limit hit, using fallback prices');
          throw new Error('Rate limit exceeded');
        }
      } catch (error) {
        console.warn('Failed to fetch token prices, using fallback prices:', error);
        // Fallback prices with more accurate DEGEN price
        tokenPrices = {
          'WETH': 3000, 'USDC': 1, 'DEGEN': 0.0001, 'BETR': 0.01, 'NOICE': 0.01, 'TIPN': 0.01
        };
      }

      const tokenBalances = [];
      
      // Get native ETH balance first
      try {
        const ethBalanceResponse = await fetch(baseRpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
          })
        });
        
        const ethBalanceData = await ethBalanceResponse.json();
        if (ethBalanceData.result && ethBalanceData.result !== '0x') {
          const ethBalance = parseInt(ethBalanceData.result, 16) / Math.pow(10, 18);
          if (ethBalance > 0) { // Only show if > 0 ETH
            const ethPrice = tokenPrices['WETH'] || 3000;
            const ethValue = ethBalance * ethPrice;
            
            tokenBalances.push({
              symbol: 'ETH',
              address: '0x0000000000000000000000000000000000000000',
              balance: ethBalance.toFixed(4),
              price: ethPrice,
              value: ethValue.toFixed(2),
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
      
      // Get token balances with rate limiting
      for (const token of commonTokens) {
        try {
          // Add longer delay between requests to prevent overwhelming the RPC
          await new Promise(resolve => setTimeout(resolve, 200)); // Increased from 50ms to 200ms
          
          const balanceResponse = await fetch(baseRpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: token.address,
                data: `0x70a08231${address.slice(2).padStart(64, '0')}` // balanceOf(address)
              }, 'latest'],
              id: 1
            })
          });
          
          if (!balanceResponse.ok) {
            if (balanceResponse.status === 429) {
              console.warn(`Rate limit hit for ${token.symbol}, skipping remaining tokens`);
              break; // Stop processing more tokens if we hit rate limit
            }
            console.warn(`Failed to fetch ${token.symbol} balance: HTTP ${balanceResponse.status}`);
            continue;
          }
          
          const balanceData = await balanceResponse.json();
          
          if (balanceData.error) {
            console.warn(`RPC error fetching ${token.symbol} balance:`, balanceData.error);
            continue;
          }
          
          if (balanceData.result && balanceData.result !== '0x') {
            const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
            
            // Only include tokens with balance > 0
            if (balance > 0) {
              const price = tokenPrices[token.symbol] || 1;
              const value = balance * price;
              
              tokenBalances.push({
                symbol: token.symbol,
                address: token.address,
                balance: balance.toFixed(4),
                price: price,
                value: value.toFixed(2),
                network: 'Base',
                networkKey: 'base',
                chainId: '0x2105'
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          // Continue with other tokens instead of failing completely
        }
      }
      
      // Sort by $ value (highest first)
      const sortedTokens = tokenBalances.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      
      console.log('Top coins by value:', sortedTokens);
      
      // Update state and cache
      setTopCoins(sortedTokens);
      setTopCoinsCache(prev => ({ ...prev, [cacheKey]: sortedTokens }));
      setLastTopCoinsFetch(now);
      
    } catch (error) {
      console.error('Error fetching top coins:', error);
      // Don't clear existing data on error to prevent flashing
      if (topCoins.length === 0) {
        setTopCoins([]);
      }
    } finally {
      setTopCoinsLoading(false);
    }
  };

  // Get user's top coins by $ value from Celo chain
  const getTopCoinsCelo = async (address, forceRefresh = false) => {
    if (!address) return;
    
    // Check cache first (5 minute cache)
    const cacheKey = `celo_${address.toLowerCase()}`;
    const now = Date.now();
    const cacheAge = now - (lastTopCoinsFetch || 0);
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes
    
    if (!forceRefresh && cacheValid && topCoinsCache[cacheKey] && topCoinsCache[cacheKey].length > 0) {
      console.log('📦 Using cached Celo top coins data (age:', Math.round(cacheAge / 1000), 'seconds)');
      setTopCoins(topCoinsCache[cacheKey]);
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (topCoinsLoading) {
      console.log('⏳ Already loading top coins, skipping...');
      return;
    }
    
    // RPC rate limiting - prevent calls within 10 seconds of each other
    const timeSinceLastRpc = now - (lastRpcCall || 0);
    if (timeSinceLastRpc < 10000) { // 10 seconds
      console.log('⏳ RPC rate limit active, please wait...', Math.ceil((10000 - timeSinceLastRpc) / 1000), 'seconds remaining');
      return;
    }
    
    try {
      setTopCoinsLoading(true);
      setLastRpcCall(now); // Mark this as the last RPC call
      console.log('Fetching Celo top coins for address:', address);
      
      // Celo chain RPC URL
      const celoRpcUrl = process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org';
      
      // Common token addresses on Celo
      const celoTokens = [
        { symbol: 'CELO', address: '0x471EcE3750Da237f93B8E339c536989b8978a438', decimals: 18 },
        { symbol: 'USDC', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals: 6 },
        { symbol: 'WETH', address: '0x122013fd7dF1C6F636a5bb8f03108E876548b455', decimals: 18 }
      ];

      // Get token prices from CoinGecko API (free tier) first
      let tokenPrices = {};
      try {
        // Add delay to respect rate limits
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

      const tokenBalances = [];
      
      // Get native CELO balance
      try {
        const celoBalanceResponse = await fetch(celoRpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
          })
        });
        
        const celoBalanceData = await celoBalanceResponse.json();
        if (celoBalanceData.result && celoBalanceData.result !== '0x') {
          const celoBalance = parseInt(celoBalanceData.result, 16) / Math.pow(10, 18);
          if (celoBalance > 0) { // Only show if > 0 CELO
            const celoPrice = tokenPrices['CELO'] || 0.5;
            const celoValue = celoBalance * celoPrice;
            
            tokenBalances.push({
              symbol: 'CELO',
              address: '0x0000000000000000000000000000000000000000',
              balance: celoBalance.toFixed(4),
              price: celoPrice,
              value: celoValue.toFixed(2),
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
      
      // Get Celo token balances
      for (const token of celoTokens) {
        try {
          await new Promise(resolve => setTimeout(resolve, 50));
          
          const balanceResponse = await fetch(celoRpcUrl, {
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
          
          if (!balanceResponse.ok) continue;
          
          const balanceData = await balanceResponse.json();
          if (balanceData.error) continue;
          
          if (balanceData.result && balanceData.result !== '0x') {
            const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
            
            // Only include tokens with balance > 0
            if (balance > 0) {
              const price = tokenPrices[token.symbol] || 1;
              const value = balance * price;
              
              tokenBalances.push({
                symbol: token.symbol,
                address: token.address,
                balance: balance.toFixed(4),
                price: price,
                value: value.toFixed(2),
                network: 'Celo',
                networkKey: 'celo',
                chainId: '0xa4ec'
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching Celo ${token.symbol} balance:`, error);
        }
      }
      
      const sortedTokens = tokenBalances.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      console.log('Celo top coins by value:', sortedTokens);
      
      setTopCoins(sortedTokens);
      setTopCoinsCache(prev => ({ ...prev, [cacheKey]: sortedTokens }));
      setLastTopCoinsFetch(now);
      
    } catch (error) {
      console.error('Error fetching Celo top coins:', error);
      if (topCoins.length === 0) {
        setTopCoins([]);
      }
    } finally {
      setTopCoinsLoading(false);
    }
  };

  // Get all tokens from all supported networks
  const getAllTokens = async (address, forceRefresh = false) => {
    if (!address) return [];
    
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
    
    // RPC rate limiting - prevent calls within 10 seconds of each other
    const timeSinceLastRpc = now - (lastRpcCall || 0);
    if (timeSinceLastRpc < 10000) { // 10 seconds
      console.log('⏳ RPC rate limit active, please wait...', Math.ceil((10000 - timeSinceLastRpc) / 1000), 'seconds remaining');
      return topCoins || [];
    }
    
    try {
      setTopCoinsLoading(true);
      setLastRpcCall(now);
      console.log('Fetching all tokens for address:', address);
      
      // Define all supported networks and their tokens
      const networkTokens = {
        base: {
          name: 'Base',
          rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
          chainId: '0x2105',
          tokens: [
            { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
            { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
            { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
            { symbol: 'DEGEN', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', decimals: 18 },
            { symbol: 'BETR', address: '0x763F4B31C8c86C56C802eB0fB3edd4C9d19e0eA8', decimals: 18 },
            { symbol: 'NOICE', address: '0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69', decimals: 18 },
            { symbol: 'TIPN', address: '0x5ba8d32579a4497c12d327289a103c3ad5b64eb1', decimals: 18 }
          ]
        },
        celo: {
          name: 'Celo',
          rpcUrl: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
          chainId: '0xa4ec',
          tokens: [
            { symbol: 'CELO', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
            { symbol: 'USDC', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals: 6 },
            { symbol: 'WETH', address: '0x122013fd7dF1C6F636a5bb8f03108E876548b455', decimals: 18 }
          ]
        },
        optimism: {
          name: 'Optimism',
          rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
          chainId: '0xa',
          tokens: [
            { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
            { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
            { symbol: 'USDC', address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6 },
            { symbol: 'OP', address: '0x4200000000000000000000000000000000000042', decimals: 18 }
          ]
        },
        arbitrum: {
          name: 'Arbitrum',
          rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
          chainId: '0xa4b1',
          tokens: [
            { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
            { symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18 },
            { symbol: 'ARB', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18 }
          ]
        }
      };
      
      // Get token prices from CoinGecko API
      let tokenPrices = {};
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,degen,betr,noice,tipn,celo,optimism,arbitrum&vs_currencies=usd');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          tokenPrices = {
            'ETH': priceData.ethereum?.usd || 3000,
            'WETH': priceData.ethereum?.usd || 3000,
            'USDC': priceData['usd-coin']?.usd || 1,
            'CELO': priceData.celo?.usd || 0.5,
            'DEGEN': priceData.degen?.usd || 0.0001,
            'BETR': priceData.betr?.usd || 0.01,
            'NOICE': priceData.noice?.usd || 0.01,
            'TIPN': priceData.tipn?.usd || 0.01,
            'OP': priceData.optimism?.usd || 2.5,
            'ARB': priceData.arbitrum?.usd || 1.5
          };
        } else if (priceResponse.status === 429) {
          console.warn('CoinGecko rate limit hit, using fallback prices');
          throw new Error('Rate limit exceeded');
        }
      } catch (error) {
        console.warn('Failed to fetch token prices, using fallback prices:', error);
        // Fallback prices
        tokenPrices = {
          'ETH': 3000, 'WETH': 3000, 'USDC': 1, 'CELO': 0.5, 'DEGEN': 0.0001, 
          'BETR': 0.01, 'NOICE': 0.01, 'TIPN': 0.01, 'OP': 2.5, 'ARB': 1.5
        };
      }
      
      const allTokenBalances = [];
      
      // Fetch balances for each network
      for (const [networkKey, network] of Object.entries(networkTokens)) {
        try {
          console.log(`Fetching ${network.name} tokens...`);
          console.log(`📋 ${network.name} token list:`, network.tokens.map(t => `${t.symbol} (${t.address})`));
          
          // Get native token balance
          if (network.tokens.find(t => t.isNative)) {
            try {
              const nativeToken = network.tokens.find(t => t.isNative);
              const balanceResponse = await fetch(network.rpcUrl, {
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
                const balance = parseInt(balanceData.result, 16) / Math.pow(10, nativeToken.decimals);
                if (balance > 0.000001) {
                  const price = tokenPrices[nativeToken.symbol] || 1;
                  const value = balance * price;
                  
                  // Debug logging for native tokens
                  console.log(`✅ ${nativeToken.symbol} on ${network.name} (native):`, {
                    balance: balance.toFixed(8),
                    price: price,
                    value: value.toFixed(6),
                    finalValue: value.toFixed(2)
                  });
                  
                  allTokenBalances.push({
                    symbol: nativeToken.symbol,
                    address: nativeToken.address,
                    balance: balance.toFixed(4),
                    price: price,
                    value: value.toFixed(2),
                    network: network.name,
                    networkKey: networkKey,
                    chainId: network.chainId,
                    isNative: true
                  });
                } else {
                  console.log(`❌ ${nativeToken.symbol} on ${network.name} (native) balance too low:`, balance);
                }
              }
            } catch (error) {
              console.error(`Error fetching ${network.name} native balance:`, error);
            }
          }
          
          // Get ERC20 token balances
          for (const token of network.tokens.filter(t => !t.isNative)) {
            try {
              await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
              
              const balanceResponse = await fetch(network.rpcUrl, {
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
              
              if (!balanceResponse.ok) {
                if (balanceResponse.status === 429) {
                  console.warn(`Rate limit hit for ${network.name} ${token.symbol}, skipping remaining tokens`);
                  break;
                }
                continue;
              }
              
              const balanceData = await balanceResponse.json();
              if (balanceData.error) continue;
              
              // Debug: Show RPC response for DEGEN
              if (token.symbol === 'DEGEN') {
                console.log('🔍 DEGEN RPC Response:', {
                  response: balanceData,
                  hasResult: !!balanceData.result,
                  resultValue: balanceData.result,
                  isZero: balanceData.result === '0x',
                  network: network.name,
                  address: token.address
                });
              }
              
              if (balanceData.result && balanceData.result !== '0x') {
                const balance = parseInt(balanceData.result, 16) / Math.pow(10, token.decimals);
                
                // Debug logging for DEGEN
                if (token.symbol === 'DEGEN') {
                  console.log('🔍 DEGEN Debug:', {
                    rawResult: balanceData.result,
                    parsedBalance: balance,
                    decimals: token.decimals,
                    address: token.address,
                    network: network.name
                  });
                }
                
                if (balance > 0.000001) {
                  const price = tokenPrices[token.symbol] || 1;
                  const value = balance * price;
                  
                  // Debug logging for DEGEN value calculation
                  if (token.symbol === 'DEGEN') {
                    console.log('💰 DEGEN Value Calculation:', {
                      balance,
                      price,
                      calculatedValue: value,
                      finalValue: value.toFixed(2)
                    });
                  }
                  
                  // Debug logging for all tokens
                  console.log(`✅ ${token.symbol} on ${network.name}:`, {
                    balance: balance.toFixed(8),
                    price: price,
                    value: value.toFixed(6),
                    finalValue: value.toFixed(2)
                  });
                  
                  allTokenBalances.push({
                    symbol: token.symbol,
                    address: token.address,
                    balance: balance.toFixed(4),
                    price: price,
                    value: value.toFixed(2),
                    network: network.name,
                    networkKey: networkKey,
                    chainId: network.chainId,
                    isNative: false
                  });
                } else {
                  console.log(`❌ ${token.symbol} on ${network.name} balance too low:`, balance);
                }
              } else if (token.symbol === 'DEGEN') {
                console.log('❌ DEGEN balance result is invalid:', balanceData.result);
              }
            } catch (error) {
              console.error(`Error fetching ${network.name} ${token.symbol} balance:`, error);
            }
          }
          
        } catch (error) {
          console.error(`Error processing ${network.name}:`, error);
        }
      }
      
      // Sort by $ value (highest first)
      const sortedTokens = allTokenBalances.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      
      console.log('All tokens by value:', sortedTokens);
      
      // Debug: Check if DEGEN is in the results
      const degenToken = sortedTokens.find(t => t.symbol === 'DEGEN');
      if (degenToken) {
        console.log('✅ DEGEN found in results:', degenToken);
      } else {
        console.log('❌ DEGEN NOT found in results. All tokens:', sortedTokens.map(t => `${t.symbol}: ${t.balance} @ $${t.price} = $${t.value}`));
      }
      
      // Debug: Show all tokens processed
      console.log('🔍 All tokens processed:', {
        totalTokens: allTokenBalances.length,
        tokensByNetwork: Object.fromEntries(
          Object.entries(networkTokens).map(([key, network]) => [
            key, 
            network.tokens.map(t => t.symbol)
          ])
        ),
        finalResults: sortedTokens.map(t => ({
          symbol: t.symbol,
          network: t.network,
          balance: t.balance,
          price: t.price,
          value: t.value
        }))
      });
      
      setTopCoins(sortedTokens);
      setTopCoinsCache(prev => ({ ...prev, [cacheKey]: sortedTokens }));
      setLastTopCoinsFetch(now);
      
      return sortedTokens;
      
    } catch (error) {
      console.error('Error fetching all tokens:', error);
      return topCoins || [];
    } finally {
      setTopCoinsLoading(false);
    }
  };

  const initialState = cookieToInitialState(wagmiConfig, cookies);

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
    prevPoints, setPrevPoints,
    showActions, setShowActions,
    userProfile, setUserProfile,
    populate, setPopulate,
    isMiniApp, setIsMiniApp,
    userInfo, setUserInfo,
    panelOpen, setPanelOpen,
    panelTarget, setPanelTarget,
    adminTest, setAdminTest,
    navMenu, setNavMenu,
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
    lastRpcCall, setLastRpcCall
  };

  return (
    <AccountContext.Provider value={contextValue}>
      <WagmiProvider config={wagmiConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </AccountContext.Provider>
  );
};