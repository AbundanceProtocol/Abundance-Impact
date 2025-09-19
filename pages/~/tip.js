'use client'
import { useRouter } from "next/router";
import { useRef, useContext, useEffect, useState } from "react";
import { useAccount, useWriteContract, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
// Legacy wallet imports
import { 
  legacyTokenUtils, 
  legacyDisperseUtils, 
  getLegacyAddress, 
  getLegacyProvider,
  isLegacyWalletConnected,
  waitForLegacyTransaction,
  parseTokenAmount
} from '../../utils/legacyWallet';
import { ethers } from 'ethers';
import Link from "next/link";
import axios from "axios";
import { useWallet } from '../../hooks/useWallet';
import { generateReferralTag, submitOnChainReferral, submitOffChainReferral, createReferralMessage, getReferralDataSuffix } from '../../utils/divvi';

// Disperse contract ABI - defined at module level to avoid initialization issues
const disperseABI = [
  {
    name: 'disperseToken',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'values', type: 'uint256[]' }
    ],
    outputs: []
  },
  {
    name: 'disperseEther',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'recipients', type: 'address[]' },
      { name: 'values', type: 'uint256[]' }
    ],
    outputs: []
  },
  // Add ERC20 approval function
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  // Add ERC20 allowance function
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  // Add ERC20 balanceOf function
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

// ERC20 token ABI for approval and balance checks
const erc20ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
];

import Head from "next/head";

import { IoIosRocket, IoMdTrophy, IoMdRefresh as Refresh, IoCloseCircle } from "react-icons/io";
import { BsLightningChargeFill as Impact, BsPiggyBankFill, BsQuestionCircle, BsGiftFill, BsCurrencyExchange, BsFillFunnelFill } from "react-icons/bs";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { IoShuffleOutline as ShuffleIcon } from "react-icons/io5";
import { PiClockClockwiseBold as ClockForward, PiClockCounterClockwiseBold as ClockBack } from "react-icons/pi";
import { FaAngleDown } from "react-icons/fa";
import { confirmUser, timePassed, getTimeRange } from "../../utils/utils";
import Spinner from "../../components/Common/Spinner";
import ExpandImg from "../../components/Cast/ExpandImg";
import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";

import { AccountContext } from "../../context";
import qs from "querystring";
import Modal from "../../components/Layout/Modals/Modal";
import WalletConnect from "../../components/WalletConnect";
import WalletActions from "../../components/WalletActions";

const version = process.env.NEXT_PUBLIC_VERSION;

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

// Wagmi Status Component
function WagmiStatus() {
  const { wagmiStatus } = useContext(AccountContext);

  if (!wagmiStatus) {
    return null;
  }

  return null; // Don't show anything
}

// Simple Wallet Demo Component
function WalletDemo() {
  const {
    walletConnected,
    walletAddress,
    walletChainId,
    walletProvider,
    isMiniApp
  } = useContext(AccountContext);
  
  const [sdkTest, setSdkTest] = useState(null);

  // Test Farcaster SDK integration
  useEffect(() => {
    const testSDK = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        const inMiniApp = await sdk.isInMiniApp();
        
        if (inMiniApp) {
          const context = await sdk.context;
          setSdkTest({
            user: context?.user?.username || 'Unknown',
            fid: context?.user?.fid || 'Unknown',
            ethAddress: context?.user?.custodyAddress || 'None',
            displayName: context?.user?.displayName || 'Unknown'
          });
        }
      } catch (error) {
        console.error('SDK test failed:', error);
        setSdkTest({ error: error.message });
      }
    };

    testSDK();
  }, []);

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

  return null; // Don't show anything
}

export default function Tip({ curatorId }) {
  const router = useRouter();
  const { ecosystem, username, app, userFid, pass } = router.query;
  const {
    LoginPopup,
    isLogged,
    showLogin,
    setShowLogin,
    setPoints,
    setIsLogged,
    setFid,
    miniApp,
    setMiniApp,
    fid,
    ecoData,
    isMiniApp,
    setIsMiniApp,
    userBalances,
    setUserBalances,
    adminTest,
    walletConnected,
    walletAddress,
    walletChainId,
    walletProvider,
    userInfo,
    setUserInfo,
    getAllTokens,
    setWalletChainId
  } = useContext(AccountContext);
  
  // Use the existing wallet hook for transactions
  const { sendTransaction, getProvider } = useWallet();
  
  // Use Wagmi hooks for proper Farcaster Mini App wallet integration
  const { address: wagmiAddress, isConnected: wagmiConnected, chainId: wagmiChainId } = useAccount();
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const ref1 = useRef(null);
  // RPC rate limiting for read calls to avoid 429 from public endpoints
  const approvalCheckInFlightRef = useRef(false);
  const lastApprovalCheckRef = useRef(0);
  const APPROVAL_CHECK_COOLDOWN_MS = 10000; // 10s
  const [textMax, setTextMax] = useState("430px");
  const [screenWidth, setScreenWidth] = useState(undefined);
  const [screenHeight, setScreenHeight] = useState(undefined);
  const [feedMax, setFeedMax] = useState("620px");
  const { isMobile } = useMatchBreakpoints();

  const [showPopup, setShowPopup] = useState({ open: false, url: null });

  const [creatorRewards, setCreatorRewards] = useState(null);
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [dailyRewards, setDailyRewards] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [totalClaims, setTotalClaims] = useState(0);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const initChannels = [" ", "impact"];
  const [modal, setModal] = useState({ on: false, success: false, text: "" });
  
  // Custom Share Modal state
  const [shareModal, setShareModal] = useState({ on: false, id: null, amount: 0, token: '', receivers: 0, fundPercent: 0 });
  const [shareImageLoaded, setShareImageLoaded] = useState(false);
  const [shareImageError, setShareImageError] = useState(false);
  
  // Filter state variables
  const [timeframe, setTimeframe] = useState('7d');
  const [sortBy, setSortBy] = useState('down');
  const [channelOptions, setChannelOptions] = useState(initChannels);
  const [selectedChannel, setSelectedChannel] = useState(' ');
  
  // Combined query state for filters
  const initialQuery = {shuffle: false, time: '7d', tags: [], channels: [], curators: null, order: -1, timeSort: null};
  const [userQuery, setUserQuery] = useState(initialQuery);
  
  // Search results state
  const [creatorResults, setCreatorResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Curators search state
  const [curatorSearchInput, setCuratorSearchInput] = useState("");
  const [curatorData, setCuratorData] = useState([]);
  const [curatorsLength, setCuratorsLength] = useState(0);
  const [curatorList, setCuratorList] = useState([]);
  
  // Disperse functionality state
  const [tipAmount, setTipAmount] = useState(0);
  const [isDispersing, setIsDispersing] = useState(false);
  const [disperseStatus, setDisperseStatus] = useState("");
  const [lastSuccessHash, setLastSuccessHash] = useState(null);
  const [pendingTxTokenSymbol, setPendingTxTokenSymbol] = useState(null);
  const [pendingTxTokenDecimals, setPendingTxTokenDecimals] = useState(null);
  const [pendingTxReceivers, setPendingTxReceivers] = useState([]);
  const [pendingTxTotalAmountDecimal, setPendingTxTotalAmountDecimal] = useState(0);
  const [pendingTxKind, setPendingTxKind] = useState(null); // 'approval' | 'disperse' | null
  const [pendingTxReferralTag, setPendingTxReferralTag] = useState(null); // Divvi referral tag
  const [approveOnlyAmount, setApproveOnlyAmount] = useState(false); // when true, approve only needed amount
  const [needsApproval, setNeedsApproval] = useState(false); // track if token approval is needed
  
  // Local cache for token approvals to reduce external API calls
  const [tokenApprovals, setTokenApprovals] = useState({}); // { [tokenAddress]: { approved: boolean, amount: string, lastChecked: number } }
  const [fundPercent, setFundPercent] = useState(10);
  
  // Collapsible state for Impact Filter
  const [isImpactFilterCollapsed, setIsImpactFilterCollapsed] = useState(true);
  
  // Network switching state
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [networkSwitchError, setNetworkSwitchError] = useState(null);
  
  // Token selection from WalletConnect - Set USDC as default
  const [selectedToken, setSelectedToken] = useState({
    symbol: 'USDC',
    networkKey: 'base',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  });
  
  // Debug: Log when selectedToken changes
  useEffect(() => {
    console.log('selectedToken changed to:', selectedToken);
  }, [selectedToken]);
  


  // Helper function to get token decimals - accessible to all functions
  const getTokenDecimals = (token) => {
    // If the token object has decimals property, use it
    if (token?.decimals !== undefined) {
      return token.decimals;
    }
    
    const tokenDecimalMap = {
      'ETH': 18,           // Not on Base
      'USDC': 6,           // Available on Base
      'USDT': 6,           // Available on Base
      'WETH': 18,          // Not on Base
      'DEGEN': 18,         // Available on Base
      'BETR': 18,          // Available on Base
      'NOICE': 18,         // Available on Base
      'TIPN': 18,          // Available on Base
      'EGGS': 18,          // Available on Base
      'USDGLO': 18,        // Available on Base
      'QR': 18,            // Available on Base
      'CELO': 18,          // Not on Base
    };
    
    const decimals = tokenDecimalMap[token?.symbol] || 18;
    console.log(`Token ${token?.symbol} mapped to ${decimals} decimals`);
    return decimals;
  };

  // Helper function to map walletChainId to network name for OnchainTip
  const getNetworkName = (chainId) => {
    const networkMap = {
      '0x2105': 'base',     // Base
      '0xa4ec': 'celo',     // Celo
      '0x1': 'ethereum',    // Ethereum
      '0xa': 'optimism',    // Optimism
      '0xa4b1': 'arbitrum', // Arbitrum
      '0x89': 'polygon'     // Polygon
    };
    
    const networkName = networkMap[chainId] || 'unknown';
    console.log(`Chain ID ${chainId} mapped to network: ${networkName}`);
    return networkName;
  };

  // Network mapping for token networks to chain IDs
  const getChainIdForNetwork = (networkKey) => {
    const networkMap = {
      'base': '0x2105',      // Base
      'celo': '0xa4ec',      // Celo
      'ethereum': '0x1',     // Ethereum
      'optimism': '0xa',     // Optimism
      'arbitrum': '0xa4b1',  // Arbitrum
      'polygon': '0x89'      // Polygon
    };
    return networkMap[networkKey?.toLowerCase()];
  };

  // Function to check if network switching is needed and prompt user
  const checkAndSwitchNetwork = async (token, autoSwitch = true) => {
    if (!token || !walletConnected || !walletChainId) {
      console.log('🔍 Network check skipped - missing prerequisites');
      return false;
    }

    const requiredChainId = getChainIdForNetwork(token.networkKey);
    
    if (!requiredChainId) {
      console.log('🔍 Unknown network for token:', token.networkKey);
      return false;
    }

    console.log('🔍 Network check:', {
      currentChain: walletChainId,
      requiredChain: requiredChainId,
      tokenNetwork: token.networkKey,
      tokenSymbol: token.symbol
    });

    const networkNames = {
      '0x1': 'Ethereum',
      '0xa': 'Optimism', 
      '0xa4b1': 'Arbitrum',
      '0x2105': 'Base',
      '0xa4ec': 'Celo',
      '0x89': 'Polygon'
    };

    // Check if current network matches token's network
    if (walletChainId !== requiredChainId) {
      const currentNetworkName = networkNames[walletChainId] || `Chain ${walletChainId}`;
      const requiredNetworkName = networkNames[requiredChainId] || `Chain ${requiredChainId}`;

      console.log(`🔄 Network mismatch: Current=${currentNetworkName}, Required=${requiredNetworkName}`);
      
      // Clear any previous network switch errors
      setNetworkSwitchError(null);
      
      if (!autoSwitch) {
        // Just set status without attempting to switch
        setDisperseStatus(`🔄 ${token.symbol} requires ${requiredNetworkName} network. Current: ${currentNetworkName}`);
        return false;
      }
      
      // Set status to inform user about network switching
      setDisperseStatus(`🔄 Switching to ${requiredNetworkName} network for ${token.symbol}...`);
      setIsSwitchingNetwork(true);
      
      // Try to switch network automatically
      try {
        console.log(`🔄 Attempting to switch to ${requiredNetworkName}...`);
        
        // Get the provider for network switching
        const provider = walletProvider || (typeof window !== 'undefined' && window.ethereum);
        
        if (provider && provider.request) {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: requiredChainId }],
          });
          
          console.log(`✅ Successfully switched to ${requiredNetworkName}`);
          setDisperseStatus(`✅ Switched to ${requiredNetworkName} network for ${token.symbol}`);
          
          // The wallet chain ID should be updated automatically via the chainChanged event listener
          // But we'll also update it explicitly to ensure immediate UI update
          setWalletChainId(requiredChainId);
          
          setIsSwitchingNetwork(false);
          return true;
          
        } else {
          console.log('❌ No provider available for network switching');
          const errorMsg = `Please manually switch to ${requiredNetworkName} network to use ${token.symbol}`;
          setDisperseStatus(`⚠️ ${errorMsg}`);
          setNetworkSwitchError(errorMsg);
          setIsSwitchingNetwork(false);
          return false;
        }
        
      } catch (error) {
        console.error('Network switching failed:', error);
        setIsSwitchingNetwork(false);
        
        // Handle specific error cases
        let errorMsg;
        if (error.code === 4902) {
          // Network not added to wallet
          errorMsg = `${requiredNetworkName} network not found in wallet. Please add it manually.`;
        } else if (error.code === 4001) {
          // User rejected the request
          errorMsg = `Network switch cancelled. Please manually switch to ${requiredNetworkName} to use ${token.symbol}`;
        } else {
          errorMsg = `Failed to switch networks. Please manually switch to ${requiredNetworkName} to use ${token.symbol}`;
        }
        
        setDisperseStatus(`⚠️ ${errorMsg}`);
        setNetworkSwitchError(errorMsg);
        return false;
      }
    } else {
      console.log(`✅ Already on correct network (${networkNames[requiredChainId] || requiredChainId}) for ${token.symbol}`);
      // Clear any network-related status messages if we're on the correct network
      if (disperseStatus && disperseStatus.includes('network')) {
        setDisperseStatus('');
      }
      setNetworkSwitchError(null);
      return true;
    }
  };

  // Function to update selected token from WalletConnect
  const updateSelectedToken = (token) => {
    console.log('updateSelectedToken called with:', token);
    console.log('🔍 Current selectedToken:', selectedToken?.symbol, 'New token:', token?.symbol);
    
    // Only process if token actually changed
    const tokenChanged = !selectedToken || 
                        selectedToken.symbol !== token?.symbol || 
                        selectedToken.networkKey !== token?.networkKey;
    
    if (tokenChanged) {
      console.log('🔍 Token actually changed, checking network compatibility and approval status');
      
      // Check if token's network matches current wallet network
      checkAndSwitchNetwork(token);
      
      // Check cached approval status for the new token
      if (token && !token.isNative && tipAmount > 0) {
        const tokenAddress = token?.address || token?.contractAddress;
        const approvalStatus = getCachedApprovalStatus(tokenAddress, tipAmount);
        
        if (approvalStatus.needsApproval) {
          console.log('🔍 Cached check: New token needs approval');
          setNeedsApproval(true);
          
          if (approvalStatus.cachedData) {
            const currentAllowance = ethers.utils.formatUnits(approvalStatus.cachedData.amount, getTokenDecimals(token));
            const shortfall = tipAmount - parseFloat(currentAllowance);
            setDisperseStatus(`⚠️ Token approval required for ${token?.symbol}.`);
          } else {
            setDisperseStatus(`⚠️ Token approval required for ${token?.symbol}.`);
          }
        } else {
          console.log('🔍 Cached check: New token is approved');
          setNeedsApproval(false);
          setDisperseStatus(`✅ ${token?.symbol} is approved for multi-tip!`);
        }
      } else if (token?.isNative) {
        console.log('🔍 Native token selected, no approval needed');
        setNeedsApproval(false);
        setDisperseStatus(`✅ ${token?.symbol} is a native token. Ready to multi-tip!`);
      } else {
        console.log('🔍 No tip amount set, clearing approval status');
        setNeedsApproval(false);
        setDisperseStatus('');
      }
      
      // Only clear non-error status when token changes
      if (disperseStatus && disperseStatus !== '' && !disperseStatus.includes('Error') && !disperseStatus.includes('⚠️')) {
        setDisperseStatus('');
      }
    } else {
      console.log('🔍 Token unchanged, keeping current approval status');
    }
    
    setSelectedToken(token);
  };
  
  // Function to update tip amount from WalletConnect slider
  const updateTipAmount = (amount) => {
    setTipAmount(amount);
    
    // Check if approval is needed when tip amount changes using cached data
    if (selectedToken && !selectedToken.isNative && amount > 0) {
      const tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
      const approvalStatus = getCachedApprovalStatus(tokenAddress, amount);
      
      if (approvalStatus.needsApproval) {
        console.log('🔍 Cached check: Token needs approval for new tip amount');
        setNeedsApproval(true);
        
        if (approvalStatus.cachedData) {
          const currentAllowance = ethers.utils.formatUnits(approvalStatus.cachedData.amount, getTokenDecimals(selectedToken));
          const shortfall = amount - parseFloat(currentAllowance);
          setDisperseStatus(`⚠️ Token approval required for ${selectedToken?.symbol}.`);
        } else {
          setDisperseStatus(`⚠️ Token approval required for ${selectedToken?.symbol}.`);
        }
      } else {
        console.log('🔍 Cached check: Token approved for new tip amount');
        setNeedsApproval(false);
        setDisperseStatus(`✅ ${selectedToken?.symbol} is approved for multi-tip!`);
      }
    }
  };

  // Ensure tipAmount is synchronized with WalletConnect on mount
  useEffect(() => {
    // Initialize tipAmount to 0 to match the slider
    updateTipAmount(0);
  }, []);



  // Check token approval when selected token changes (but not when tipAmount changes to avoid conflicts)
  useEffect(() => {
    if (selectedToken && !selectedToken.isNative && tipAmount > 0) {
      checkTokenApproval(); // Removed force: true to respect rate limiting
    }
  }, [selectedToken, walletConnected]);

  // Check network compatibility when wallet chain changes
  useEffect(() => {
    if (selectedToken && walletConnected && walletChainId) {
      console.log('🔍 Wallet chain changed, checking network compatibility');
      
      // Check without auto-switching when chain changes
      checkAndSwitchNetwork(selectedToken, false);
    }
  }, [walletChainId, selectedToken, walletConnected]);

  // Check all token approvals when wallet connects
  useEffect(() => {
    if (walletConnected && walletAddress) {
      console.log('🔍 Wallet connected, checking all token approvals');
      checkAllTokenApprovals();
    } else if (!walletConnected) {
      // Clear network-related states when wallet disconnects
      console.log('🔍 Wallet disconnected, clearing network states');
      setNetworkSwitchError(null);
      setIsSwitchingNetwork(false);
      if (disperseStatus && (disperseStatus.includes('network') || disperseStatus.includes('Network'))) {
        setDisperseStatus('');
      }
    }
  }, [walletConnected, walletAddress]);

  // Amount format helper for share text
  const formatShareAmount = (n) => {
    if (n > 10) return Math.round(n).toString();
    if (n >= 1) return Number(n).toFixed(2);
    return Number(n).toFixed(4);
  };

  // Monitor transaction status using Wagmi hooks
  useEffect(() => {
    if (isConfirming) {
      setDisperseStatus('Transaction confirming...');
    } else if (isConfirmed && hash && hash !== lastSuccessHash) {
      // Only react to success of disperse, not approval
      if (pendingTxKind !== 'disperse') {
        setLastSuccessHash(hash);
        return;
      }
      setDisperseStatus(`Transaction confirmed! Hash: ${hash}`);
      setIsDispersing(false);
      
      // Refresh token balances/prices after success
      try {
        if (walletConnected && walletAddress) {
          getAllTokens(walletAddress, true);
        }
      } catch (e) {
        console.warn('Failed to refresh tokens after disperse:', e);
      }

      // Submit Divvi referral tracking
      (async () => {
        try {
          if (pendingTxReferralTag) {
            console.log('Divvi: Submitting referral for confirmed transaction');
            
            // Submit on-chain referral to Divvi
            const referralSuccess = await submitOnChainReferral(hash, walletChainId);
            
            if (referralSuccess) {
              console.log('Divvi: Referral submitted successfully');
            } else {
              console.warn('Divvi: Failed to submit referral');
            }
          }
        } catch (error) {
          console.error('Divvi: Error submitting referral:', error);
        }
      })();

      // Create OnchainTip document via API, then show share modal
      (async () => {
        try {
          // Filter out fund address from receivers for OnchainTip
          const fundAddress = '0x5D7694C48E1de1f04aDd4E9Fdc9a48f9b8a6f51f';
          const filteredReceivers = (pendingTxReceivers || []).filter(receiver => 
            receiver.address !== fundAddress
          );
          
          const tipPayload = {
            tipper_fid: userInfo?.fid,
            tipper_pfp: userInfo?.pfp,
            tipper_username: userInfo?.username,
            fund: fundPercent, // Add fund percentage to OnchainTip
            network: getNetworkName(walletChainId), // Add network field based on current chain
            tip: [{
              currency: pendingTxTokenSymbol || selectedToken?.symbol || 'Token',
              amount: Number(pendingTxTotalAmountDecimal || 0),
              value: Number(pendingTxTotalAmountDecimal || 0) * Number(selectedToken?.price || 0)
            }],
            receiver: filteredReceivers,
            transaction_hash: hash,
          };
          
          console.log('📝 First OnchainTip payload:', {
            ...tipPayload,
            receiver: `${filteredReceivers.length} recipients`
          });
          console.log('🔍 First fund field debug:', {
            fundPercent: fundPercent,
            fundType: typeof fundPercent,
            fundValue: tipPayload.fund
          });
          console.log('🌐 Network field debug:', {
            walletChainId: walletChainId,
            networkName: getNetworkName(walletChainId),
            networkInPayload: tipPayload.network
          });
          const res = await fetch('/api/onchain-tip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tipPayload),
          });
          let created = null;
          if (res.ok) {
            created = await res.json().catch(() => ({}));
          } else {
            console.warn('OnchainTip API returned non-200:', res.status, await res.text());
          }
          // Extract ID from response ({ success, id }) or fallback shapes
          let createdId = null;
          try {
            const maybe = created?.id || created?._id || created?.data?._id || null;
            createdId = maybe ? (typeof maybe === 'string' ? maybe : maybe.toString()) : null;
          } catch (_) {
            createdId = null;
          }
          const receiversCount = filteredReceivers.length;
          setShareImageLoaded(false);
          setShareImageError(false);
          setShareModal({
            on: true,
            id: createdId.toString(),
            amount: Number(pendingTxTotalAmountDecimal || 0),
            token: pendingTxTokenSymbol || selectedToken?.symbol || 'Token',
            receivers: receiversCount,
            fundPercent: fundPercent
          });
        } catch (e) {
          console.warn('Failed to persist OnchainTip:', e);
        }
      })();

      // Remember last success hash to prevent duplicate modal
      setLastSuccessHash(hash);
      // clear pending kind
      setPendingTxKind(null);
      // clear pending referral tag
      setPendingTxReferralTag(null);
    } else if (writeError) {
      let errorMessage = 'Transaction failed';
      if (writeError.message.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (writeError.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (writeError.message) {
        errorMessage = `Error: ${writeError.message}`;
      }
      setDisperseStatus(errorMessage);
      setIsDispersing(false);
    }
  }, [isConfirming, isConfirmed, hash, writeError, walletConnected, walletAddress, getAllTokens, lastSuccessHash, pendingTxTokenSymbol, pendingTxKind]);

  useEffect(() => {
    if (fid) {
      getCreatorRewards(fid);
      getDailyRewards(fid);
      getTotalClaims(fid);
    }
  }, [fid]);

  useEffect(() => {
    if (userBalances.impact == 0) {
      (async () => {
        const { sdk } = await import('@farcaster/miniapp-sdk')

        const isMiniApp = await sdk.isInMiniApp();
        setIsMiniApp(isMiniApp);
        console.log("isMiniApp1", isMiniApp);

        const userProfile = await sdk.context;

        console.log(userProfile?.user?.fid);

        const checkUserProfile = async fid => {
          try {
            const res = await fetch(`/api/user/validateUser?fid=${fid}`);
            const data = await res.json();
            return data.valid;
          } catch (error) {
            return null;
          }
        };

        const isValidUser = await checkUserProfile(userProfile?.user?.fid);
        console.log(`User is valid: ${isValidUser}`);
        console.log(isValidUser);
        if (isValidUser && isMiniApp) {
          setIsLogged(true);
          setFid(Number(userProfile?.user?.fid));
          setUserInfo({
            pfp: userProfile?.user?.pfpUrl || null,
            username: userProfile?.user?.username || null,
            display: userProfile?.user?.displayName || null
          });
        }

        sdk.actions.ready();

        if (isValidUser && !(userBalances?.impact > 0)) {
          const { impact, qdau } = await getUserBalance(userProfile?.user?.fid);
          console.log("userBalance", impact);
          setUserBalances(prev => ({ ...prev, impact, qdau }));
        }
      })();
    }
  }, []);

  const getUserBalance = async (fid) => {
    try {
      const res = await fetch(`/api/user/getUserBalance?fid=${fid}`);
      const data = await res.json();
      console.log('data', data)
      return {impact: data?.impact || 0, qdau: data?.qdau || 0};
    } catch (error) {
      console.error('Error getting user balance:', error);
      return {impact: 0, qdau: 0};
    }
  };

  async function getCreatorRewards(fid) {
    try {
      const response = await axios.get("/api/fund/getCreatorRewards", {
        params: { fid }
      });
      if (response?.data?.data) {
        setCreatorRewards(response?.data?.data);
        console.log("getCreatorRewards", response?.data?.data);
      } else {
        setCreatorRewards(null);
      }
      setCreatorLoading(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      setCreatorLoading(false);
    }
  }

  async function getTotalClaims(fid) {
    try {
      const response = await axios.get("/api/fund/getTotalClaims", {
        params: { fid }
      });
      console.log("getTotalClaims1", response);
      if (response?.data?.data) {
        setTotalClaims(response?.data?.data);
        console.log("getTotalClaims2", response?.data?.data);
      } else {
        setTotalClaims(0);
      }
      setClaimsLoading(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      setClaimsLoading(false);
    }
  }

  async function getDailyRewards(fid) {
    try {
      const response = await axios.get("/api/fund/getDailyRewards", {
        params: { fid }
      });
      if (response?.data?.data) {
        setDailyRewards(response?.data?.data);
        console.log("getDailyRewards", response?.data?.data);
      } else {
        setDailyRewards(null);
      }
      setDailyLoading(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      setDailyLoading(false);
    }
  }

  useEffect(() => {
    console.log(
      "app01",
      app,
      userFid,
      !isLogged,
      pass !== "",
      !isLogged && app && app == "mini" && userFid && pass !== ""
    );
    if (!isLogged && app && app == "mini" && userFid && pass !== "" && !miniApp) {
      console.log("set mini app");
      setMiniApp(true);
    }
  }, [userFid, pass, app]);

  useEffect(() => {
    if (miniApp) {
      const confirmed = confirmUser(userFid, pass);
      console.log("confirmed", confirmed);
      if (confirmed) {
        console.log("isLogged-1");
        setIsLogged(true);
        setFid(Number(userFid));
        console.log("app03", isLogged, confirmed);
      }
    }
  }, [miniApp]);

  useEffect(() => {
    console.log("app02", isLogged);
  }, [isLogged]);

  async function claimReward(event, reward) {
    event.preventDefault();
    setDailyLoading(true);

    try {
      const response = await axios.post("/api/fund/postReward", { id: reward._id });

      console.log("response", response);

      if (response?.data) {
        // setDailyRewards(response?.data?.claimed);
        await getDailyRewards(reward.fid);
        setClaimsLoading(true);
        await getTotalClaims(reward.fid);
        setClaimsLoading(false);
      }
      setDailyLoading(false);
    } catch (error) {
      console.error("Error claiming reward:", error);
      setDailyLoading(false);
    }

    // let shareUrl = `https://impact.abundance.id/~/ecosystems/abundance/daily-v1?${qs.stringify({
    //   id: reward?._id
    // })}`;
    // let shareText = `I just claimed ${reward?.degen_total} $degen in Impact Rewards for contributing to /impact (frame by @abundance)\n\n/impact gives out daily rewards to those who curate, auto-fund or invite contributors to use Impact Alpha. Check your reward here 👇`;

    // let encodedShareText = encodeURIComponent(shareText);
    // let encodedShareUrl = encodeURIComponent(shareUrl);
    // let shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`;

    // if (!miniApp) {
    //   window.open(shareLink, "_blank");
    // } else if (miniApp) {
    //   window.parent.postMessage(
    //     {
    //       type: "createCast",
    //       data: {
    //         cast: {
    //           text: shareText,
    //           embeds: [shareUrl]
    //         }
    //       }
    //     },
    //     "*"
    //   );
    // }
  }

  {
    /* KEEP */
  }
  function shareFrame(event, tip) {
    let tippedCreators = "";
    if (tip?.showcase?.length > 0) {
      tippedCreators = tip.showcase.reduce((str, creator, index, arr) => {
        // Add null check for creator and username
        if (!creator || !creator.username || !str.includes(creator?.username)) {
          if (str === "") {
            return "@" + (creator?.username || 'unknown');
          }
          if (index === arr.length - 1 && index !== 0) {
            return str + " & @" + (creator?.username || 'unknown') + " ";
          }
          return str + ", @" + (creator?.username || 'unknown');
        }
        return str;
      }, "");
    }
    event.preventDefault();
    let shareUrl = `https://impact.abundance.id/~/ecosystems/${tip?.handle}/tip-share-${
      tip?.showcase?.length > 0 ? "v3" : "v2"
    }?${qs.stringify({
      id: tip?._id
    })}`;
    let shareText = "";

    if (tip?.curators && tip?.curators[0]?.fid == fid) {
      shareText = `I multi-tipped ${
        tippedCreators !== "" ? tippedCreators : "creators & builders "
      } thru /impact by @abundance.\n\nSupport my nominees here:`;
    } else if (tip?.curators?.length > 0) {
      // const curatorName = await getCurator(curators, points)

      if (tip?.curators[0]?.fid !== fid) {
        shareText = `I multi-tipped ${
          tippedCreators !== "" ? tippedCreators : "creators & builders "
        }thru /impact by @abundance.\n\nThese creators were curated by @${
          tip?.curators?.[0]?.username || 'unknown'
        }. Support their nominees here:`;
      } else {
        shareText = `I multi-tipped ${
          tippedCreators !== "" ? tippedCreators : "creators & builders "
        } thru /impact by @abundance. Try it out here:`;
      }
    } else {
      shareText = `I multi-tipped ${
        tippedCreators !== "" ? tippedCreators : "creators & builders "
      } thru /impact by @abundance. Try it out here:`;
    }

    let encodedShareText = encodeURIComponent(shareText);
    let encodedShareUrl = encodeURIComponent(shareUrl);
    let shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`;

    if (!miniApp) {
      window.open(shareLink, "_blank");
    } else if (miniApp) {
      window.parent.postMessage(
        {
          type: "createCast",
          data: {
            cast: {
              text: shareText,
              embeds: [shareUrl]
            }
          }
        },
        "*"
      );
    }
  }

  // Share handler for OnchainTip
  const shareOnchainTip = async () => {
    try {
      const url = `https://impact.abundance.id/~/multi-tip/${shareModal?.id || null}`;
      const text = `I multi-tipped ${formatShareAmount(shareModal?.amount)} $${shareModal?.token} to ${shareModal?.receivers} creators with /impact!`;
      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(url);
      const shareLink = `https://farcaster.xyz/~/compose?text=${encodedText}&embeds[]=${[encodedUrl]}`;
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const inMiniApp = await sdk.isInMiniApp();
      if (!inMiniApp) {
        window.open(shareLink, '_blank');
        return;
      }
      await sdk.actions.composeCast({ text, embeds: [url], close: false });
    } catch (e) {
      console.warn('Share failed:', e);
    }
  };

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`430px`);
        setFeedMax("620px");
      } else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`390px`);
        setFeedMax("580px");
      } else {
        setTextMax(`${screenWidth - 190}px`);
        setFeedMax(`${screenWidth}px`);
      }
    } else {
      setTextMax(`100%`);
      setFeedMax(`100%`);
    }
  }, [screenWidth]);

  // Ensure Mini App SDK is ready regardless of other flows
  useEffect(() => {
    (async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        // Best-effort ready; ignore errors if not in mini app
        await sdk.actions.ready();
      } catch (_) {}
    })();
  }, []);

  function closeImagePopup() {
    setShowPopup({ open: false, url: null });
  }
  function closeImagePopup() {
    setShowPopup({ open: false, url: null });
  }

  useEffect(() => {
    // Example usage:
    // executeWithDelay(() => {
    //   console.log('This function is executed after a 2 second delay');
    // });

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  // Filter functions
  function updateTime(time) {
    console.log('updateTime called with:', time);
    // Only clear non-error status when filter changes
    if (disperseStatus && disperseStatus !== '' && !disperseStatus.includes('Error') && !disperseStatus.includes('⚠️')) {
      setDisperseStatus('');
    }
    setTimeframe(time);
    setUserQuery({
      ...userQuery,
      time: time
    });
  }

  function updateOrder(order) {
    console.log('updateOrder called with:', order);
    // Only clear non-error status when filter changes
    if (disperseStatus && disperseStatus !== '' && !disperseStatus.includes('Error') && !disperseStatus.includes('⚠️')) {
      setDisperseStatus('');
    }
    setSortBy(order);
    if (order == 'up') {
      setUserQuery({
        ...userQuery,
        order: 1, shuffle: false, timeSort: null
      });
    } else if (order == 'down') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: false, timeSort: null
      });
    } else if (order == 'shuffle') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: true, timeSort: null
      });
    } else if (order == 'clock-forward') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: false, timeSort: -1
      });
    } else if (order == 'clock-back') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: false, timeSort: 1
      });
    }
  }

  const updateChannel = (event) => {
    console.log('updateChannel called with:', event.target.value);
    // Only clear non-error status when filter changes
    if (disperseStatus && disperseStatus !== '' && !disperseStatus.includes('Error') && !disperseStatus.includes('⚠️')) {
      setDisperseStatus('');
    }
    setSelectedChannel(event.target.value);
    let channelUpdate = [];
    if (event.target.value !== ' ') {
      channelUpdate = event.target.value;
    }
    setUserQuery({
      ...userQuery,
      channels: channelUpdate
    });
  };

  async function getChannels(points) {
    try {
      const channelData = await axios.get('/api/curation/getChannelNames', { params: { points } });
      if (channelData) {
        const ecoChannels = channelData?.data?.channels;
        console.log('channels', ecoChannels);

        const updatedChannels = [
          ' ',
          ...ecoChannels
        ];
        setChannelOptions(updatedChannels);
      }
    } catch (error) {
      console.error('Error updating channels:', error);
    }
  }

  // Load channels on component mount
  useEffect(() => {
    getChannels('$IMPACT');
  }, []);

  // Curators search functions
  async function updateCurators(text, more) {
    // Only clear non-error status when curator search changes
    if (disperseStatus && disperseStatus !== '' && !disperseStatus.includes('Error') && !disperseStatus.includes('⚠️')) {
      setDisperseStatus('');
    }
    setCuratorData([]);
    setCuratorsLength(0);
    if (text?.length > 0) {
      try {
        const response = await axios.get("/api/curation/getCurators", {
          params: { name: text, more }
        });
        const sortedData = response?.data?.users.sort((a, b) => (a?.username || '').localeCompare(b?.username || ''));
        setCuratorData(sortedData);
        setCuratorsLength(response?.data?.length);
        console.log("curator response", response?.data?.users);
      } catch (error) {
        console.error("Error searching curators:", error);
        setCuratorData([]);
        setCuratorsLength(0);
      }
    } else {
      setCuratorData([]);
      setCuratorsLength(0);
    }
  }

  async function getCuratorInput(text, more) {
    console.log('curator search:', text);
    setCuratorSearchInput(text);
    if (text.length > 0) {
      updateCurators(text, more);
    } else {
      setCuratorData([]);
      setCuratorsLength(0);
    }
  }

  async function updateCuratorSchedule(curator) {
    setCuratorData([]);
    setCuratorsLength(0);
    setCuratorSearchInput("");
    
    // Update userQuery with selected curator
    const curatorFid = curator?.fid;
    if (curatorFid) {
      // Check if curator is already selected
      const isAlreadySelected = curatorList.some(existing => existing.fid === curatorFid);
      
      if (!isAlreadySelected) {
        // Add new curator to the list
        const updatedCuratorList = [...curatorList, curator];
        setCuratorList(updatedCuratorList);
        
        // Update userQuery with array of curator FIDs
        const curatorFids = updatedCuratorList.map(c => c.fid);
        setUserQuery({
          ...userQuery,
          curators: curatorFids
        });
      }
    }
  }
  
  


  
  
  
  // Function to check if token approval is needed
  const checkTokenApproval = async () => {
    console.log('🔍 checkTokenApproval called');
    console.log('🔍 Current state:', {
      selectedToken: selectedToken?.symbol,
      walletConnected,
      walletAddress,
      isNative: selectedToken?.isNative,
      currentNeedsApproval: needsApproval
    });
    
    if (!selectedToken || !walletConnected || !walletAddress || selectedToken?.isNative) {
      console.log('🔍 checkTokenApproval early return:', {
        reason: !selectedToken ? 'no token' : !walletConnected ? 'not connected' : !walletAddress ? 'no address' : 'native token'
      });
      return; // No approval needed for native tokens
    }

    const tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
    
    // First check local cache
    const cachedApproval = tokenApprovals[tokenAddress];
    if (cachedApproval && (Date.now() - cachedApproval.lastChecked) < 300000) { // 5 minute cache
      console.log('🔍 Using cached approval data (avoiding external API call):', cachedApproval);
      
      // Convert tipAmount to the same format as allowance for comparison
      const tipAmountInWei = parseUnits(tipAmount.toString(), selectedToken?.decimals || 18);
      const isApprovedForAmount = cachedApproval.approved && 
        BigInt(cachedApproval.amount) >= tipAmountInWei;
      
      if (isApprovedForAmount) {
        console.log('🔍 Cached check: Token approved for this tip amount');
        setDisperseStatus(`✅ ${selectedToken?.symbol} is approved for ${tipAmount} ${selectedToken?.symbol}. Ready to multi-tip!`);
        setNeedsApproval(false);
      } else {
        const currentAllowance = ethers.utils.formatUnits(cachedApproval.amount, selectedToken?.decimals || 18);
        const shortfall = tipAmount - parseFloat(currentAllowance);
        console.log('🔍 Cached check: Token needs approval for this tip amount');
        setDisperseStatus(`⚠️ Token approval required. Current allowance: ${currentAllowance} ${selectedToken?.symbol}, but you want to tip: ${tipAmount} ${selectedToken?.symbol}. You need to approve ${shortfall.toFixed(6)} more ${selectedToken?.symbol}.`);
        setNeedsApproval(true);
      }
      return;
    }

    console.log('🔍 Cache miss or expired, making external API call to check approval');
    
    try {
      // Rate limit: skip if last check was too recent or a check is in flight, unless forced
      const now = Date.now();
      if (now - lastApprovalCheckRef.current < APPROVAL_CHECK_COOLDOWN_MS) {
        return;
      }
      approvalCheckInFlightRef.current = true;
      lastApprovalCheckRef.current = now;
      
      console.log('🔍 About to check allowance for:', {
        tokenAddress,
        owner: walletAddress,
        spender: '0xD152f549545093347A162Dce210e7293f1452150',
        tokenSymbol: selectedToken?.symbol
      });
      
      // Check current allowance using publicClient.readContract (read-only operation)
      const allowanceResult = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [walletAddress, '0xD152f549545093347A162Dce210e7293f1452150'],
      });
      
      // Convert tipAmount to the same format as allowance for comparison
      const tipAmountInWei = parseUnits(tipAmount.toString(), selectedToken?.decimals || 18);
      
      console.log('🔍 External API allowance check result:', {
        allowance: allowanceResult.toString(),
        tipAmount: tipAmount,
        tipAmountInWei: tipAmountInWei.toString(),
        decimals: selectedToken?.decimals || 18,
        needsApproval: allowanceResult < tipAmountInWei
      });
      
      // Check if allowance covers the actual tip amount
      if (allowanceResult < tipAmountInWei) {
        const currentAllowance = ethers.utils.formatUnits(allowanceResult, selectedToken?.decimals || 18);
        const shortfall = tipAmount - parseFloat(currentAllowance);
        console.log('🔍 Setting needsApproval to TRUE - allowance insufficient for tip amount');
        setDisperseStatus(`⚠️ Token approval required. Current allowance: ${currentAllowance} ${selectedToken?.symbol}, but you want to tip: ${tipAmount} ${selectedToken?.symbol}. You need to approve ${shortfall.toFixed(6)} more ${selectedToken?.symbol}.`);
        setNeedsApproval(true);
        console.log('🔍 On-chain check: Token needs approval for this tip amount');
      } else {
        // Token is approved for this tip amount
        console.log('🔍 Setting needsApproval to FALSE - allowance sufficient for tip amount');
        setDisperseStatus(`✅ ${selectedToken?.symbol} is approved for ${tipAmount} ${selectedToken?.symbol}. Ready to multi-tip!`);
        setNeedsApproval(false);
        console.log('🔍 On-chain check: Token is approved for this tip amount');
      }

      // Update local cache with fresh data
      setTokenApprovals(prev => ({
        ...prev,
        [tokenAddress]: {
          approved: allowanceResult >= tipAmountInWei,
          amount: allowanceResult.toString(),
          lastChecked: Date.now()
        }
      }));
      
      console.log('🔍 Updated local cache with fresh approval data');
      
    } catch (error) {
      console.error('Error checking token approval:', error);
      // If RPC 429, extend cooldown to back off
      const message = error?.message || '';
      if (message.includes('429') || message.toLowerCase().includes('too many requests')) {
        lastApprovalCheckRef.current = Date.now();
      }
    } finally {
      approvalCheckInFlightRef.current = false;
    }
  };

  // Function to approve token spending for the disperse contract
  const approveToken = async () => {
    if (!selectedToken || !walletConnected || !walletAddress) {
      setDisperseStatus('Wallet not connected or no token selected');
      return;
    }

    try {
      setIsDispersing(true);
      setDisperseStatus('Approving token...');
      
      const tokenAddress = selectedToken.address;
      const approvalAmount = ethers.parseUnits('999999', selectedToken.decimals);
      
      console.log('🚀 Approving token:', {
        token: selectedToken.symbol,
        address: tokenAddress,
        amount: approvalAmount.toString(),
        spender: '0xD152f549545093347A162Dce210e7293f1452150'
      });

      // Encode the approve function call data
      const iface = new ethers.utils.Interface([
        'function approve(address spender, uint256 amount) returns (bool)'
      ]);
      
      const data = iface.encodeFunctionData('approve', [
        '0xD152f549545093347A162Dce210e7293f1452150',
        approvalAmount
      ]);

      // Send transaction using the working wallet connection
      const tx = await sendTransaction(tokenAddress, '0', data);

      console.log('🚀 Approval transaction sent:', tx);
      setDisperseStatus(`Approval transaction sent! Hash: ${tx}`);

      // Note: Transaction is sent, but we can't wait for confirmation in this environment
      // The user will need to check their wallet or blockchain explorer for confirmation
      console.log('🚀 Approval transaction hash:', tx);
      
      setDisperseStatus('Token approved successfully! You can now tip.');
      
      // Update approval status
      setNeedsApproval(false);
      
      // Update local cache with the new approval data
      setTokenApprovals(prev => ({
        ...prev,
        [tokenAddress]: {
          approved: true,
          amount: approvalAmount.toString(),
          lastChecked: Date.now()
        }
      }));
      
      // Store approval in localStorage for future reference
      const approvalKey = `token_approved_${tokenAddress}_${walletAddress}`;
      localStorage.setItem(approvalKey, 'true');
      
      // Reset dispersing state
      setIsDispersing(false);
      
    } catch (error) {
      console.error('❌ Token approval failed:', error);
      setDisperseStatus(`Approval failed: ${error.message}`);
      setIsDispersing(false);
    }
  };

  // ORIGINAL WAGMI DISPERSE FUNCTION (COMMENTED OUT - USING LEGACY VERSION BELOW)
  // Disperse function using proper Wagmi hooks as per Farcaster documentation
  const disperseTokens = async () => {
    console.log('🚀 disperseTokens function started - Entry point');
    
    try {
      console.log('🚀 Inside try block - Starting disperse');
      console.log('🔍 Available functions:', { parseUnits: typeof parseUnits, writeContract: typeof writeContract });
      
      console.log('🚀 Basic setup completed - USING WAGMI HOOKS');

      // Validate inputs
      if (!tipAmount || tipAmount <= 0) {
        setDisperseStatus('Please enter a valid tip amount');
        setIsDispersing(false);
        return;
      }

      if (!selectedToken) {
        setDisperseStatus('Please select a token');
        setIsDispersing(false);
        return;
      }

      if (!creatorResults || creatorResults.length === 0) {
        setDisperseStatus('No creators found to tip');
        setIsDispersing(false);
        return;
      }

      // Check wallet connection (using legacy wallet state)
      if (!walletConnected || !walletAddress) {
        setDisperseStatus('Wallet not connected. Please connect your wallet first.');
        setIsDispersing(false);
        return;
      }

      // Check if user is on a supported network (Base, Celo, or Arbitrum with disperse contract deployed)
      const supportedNetworks = {
        '0x2105': 'Base',
        '0xa4ec': 'Celo',  // Celo chain ID in hex (42220)
        '0xa4b1': 'Arbitrum'  // Arbitrum chain ID in hex (42161)
      };
      
      if (!supportedNetworks[walletChainId]) {
        const networkNames = {
          '0x1': 'Ethereum Mainnet',
          '0xa': 'Optimism', 
          '0x2105': 'Base',
          '0xa4ec': 'Celo',
          '0xa4b1': 'Arbitrum'
        };
        const currentNetworkName = networkNames[walletChainId] || `Network ${walletChainId}`;
        
        setDisperseStatus(`⚠️ Multi-Tip is only available on Base, Celo, or Arbitrum networks. Please switch from ${currentNetworkName} to Base, Celo, or Arbitrum to use this feature.`);
        setIsDispersing(false);
        return;
      }
      
      const currentNetworkName = supportedNetworks[walletChainId];
      console.log(`Operating on ${currentNetworkName} network - multi-tip functionality enabled`);
      
      // Now begin transaction preparation after passing network checks
      setIsDispersing(true);
      setDisperseStatus('Preparing transaction...');
      
      // Validate that the selected token is available on the current network
      const tokenNetworkKey = selectedToken?.networkKey;
      const currentNetworkKey = currentNetworkName.toLowerCase();
      
      if (tokenNetworkKey && tokenNetworkKey !== currentNetworkKey) {
        setDisperseStatus(`⚠️ Token ${selectedToken?.symbol} is not available on ${currentNetworkName} network. Please select a ${currentNetworkName} token to multi-tip.`);
        setIsDispersing(false);
        return;
      }

      // We'll calculate total impact after filtering valid creators below

      const tokenDecimals = getTokenDecimals(selectedToken);
      console.log(`Using ${tokenDecimals} decimals for ${selectedToken?.symbol}`);

      // Calculate minimum amount helper function - declare first to avoid hoisting issues
      const getMinimumAmount = (decimals) => {
        switch(decimals) {
          case 6:  return 0.000001;  // 1 micro unit (USDC)
          case 18: return 0.000000000000000001; // 1 wei (ETH, most tokens)
          default: return Math.pow(10, -decimals);
        }
      };

      console.log('🔍 Starting recipient processing...');
      
      // Filter valid creators first
      const validCreators = creatorResults.filter(creator => {
        const hasWallet = Boolean(creator.wallet);
        const hasImpact = creator.impact_sum >= 0.000001;
        console.log(`Creator ${creator.author_username}: wallet=${hasWallet}, impact=${hasImpact}`);
        return hasWallet && hasImpact;
      });

      console.log(`Found ${validCreators.length} valid creators from ${creatorResults.length} total`);

      // Exclude self if author's fid equals the current user's fid
      const selfFidStr = (fid !== undefined && fid !== null) ? String(fid) : null;
      const filteredCreators = selfFidStr
        ? validCreators.filter(c => String(c.author_fid ?? '') !== selfFidStr)
        : validCreators;
      if (selfFidStr) {
        console.log(`Self-exclusion applied (fid=${selfFidStr}). Remaining creators: ${filteredCreators.length}`);
      }

      // Calculate amounts for each creator based on impact_sum after filtering
      const totalImpactSum = filteredCreators.reduce((sum, creator) => sum + (creator.impact_sum || 0), 0);
      if (filteredCreators.length === 0 || totalImpactSum <= 0) {
        setDisperseStatus('No valid recipients found');
        setIsDispersing(false);
        return;
      }

      // Process each creator into recipient format
      const recipients = [];
      for (let i = 0; i < filteredCreators.length; i++) {
        const creator = filteredCreators[i];
        console.log(`Processing creator ${i + 1}/${filteredCreators.length}: ${creator.author_username}`);
        
        try {
          const calculatedAmount = (tipAmount * creator.impact_sum) / totalImpactSum;
          const minimumAmount = getMinimumAmount(tokenDecimals);
          const finalAmount = Math.max(calculatedAmount, minimumAmount);
          const formattedAmount = finalAmount.toFixed(tokenDecimals);
          
          console.log(`Amount calculation: ${calculatedAmount} -> ${finalAmount} -> ${formattedAmount}`);
          
          const parsedAmount = parseUnits(formattedAmount, tokenDecimals);
          console.log(`Parsed amount type: ${typeof parsedAmount}, value: ${parsedAmount.toString()}`);
          
          const recipient = {
            address: creator.wallet,
            amount: parsedAmount,
            impact_sum: creator.impact_sum,
            calculatedAmount: finalAmount,
            formattedAmount: formattedAmount
          };
          
          recipients.push(recipient);
          console.log(`✅ Added recipient: ${creator.wallet} = ${formattedAmount} ${selectedToken?.symbol}`);
          
        } catch (parseError) {
          console.error(`❌ Error processing creator ${creator.author_username}:`, parseError);
          throw new Error(`Failed to process recipient: ${parseError.message}`);
        }
      }

      if (recipients.length === 0) {
        setDisperseStatus('No valid recipients found');
        setIsDispersing(false);
        return;
      }

      console.log('📋 Transaction details:');
      console.log('- Token:', selectedToken?.symbol, 'at', selectedToken?.address);
      console.log('- Token decimals:', tokenDecimals);
      console.log('- Recipients:', recipients.length);
      console.log('- Total amount:', tipAmount);
      console.log('- Recipients data:', recipients.map(r => ({
        address: r.address,
        amount: r.amount.toString(),
        formattedAmount: r.formattedAmount,
        calculatedAmount: r.calculatedAmount,
        impact_sum: r.impact_sum
      })));

      setDisperseStatus(`Dispersing ${selectedToken?.symbol} to ${recipients.length} recipients...`);

      // Capture data needed for OnchainTip creation
      setPendingTxTokenDecimals(tokenDecimals);
      setPendingTxReceivers(filteredCreators.map((c) => ({
        fid: c.author_fid,
        pfp: c.author_pfp || c.pfp || '',
        username: c.author_username || c.username || '',
        amount: Number(((tipAmount * c.impact_sum) / totalImpactSum).toFixed(tokenDecimals))
      })));
      setPendingTxTotalAmountDecimal(Number(tipAmount));

      // Get the correct token address
      let tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
      
      // Handle native tokens (ETH, CELO) - they use zero address in the disperse contract
      const isNativeToken = selectedToken?.isNative || 
        tokenAddress === '0x0000000000000000000000000000000000000000' ||
        ['ETH', 'CELO'].includes(selectedToken?.symbol);
      
      if (isNativeToken) {
        tokenAddress = '0x0000000000000000000000000000000000000000';
        console.log(`Using native token (${selectedToken?.symbol}) with zero address`);
      }
      
      // Validate token address
      if (!tokenAddress || tokenAddress.length !== 42) {
        throw new Error(`Invalid token address: ${tokenAddress}`);
      }
      
      console.log('Final transaction parameters:');
      console.log('- Contract:', '0xD152f549545093347A162Dce210e7293f1452150');
      console.log('- Token address:', tokenAddress);
      console.log('- Is native token:', isNativeToken);
      console.log('- Recipients:', recipients.map(r => r.address));
      console.log('- Amounts:', recipients.map(r => r.amount.toString()));
      
      // Additional debugging - check for common issues
      console.log('🔍 Debugging potential issues:');
      console.log('- Total recipients:', recipients.length);
      console.log('- Sum of amounts:', recipients.reduce((sum, r) => {
        console.log(`Adding: ${typeof sum} + ${typeof r.amount}`);
        return sum + r.amount;
      }, 0n).toString());
      console.log('- Wallet address:', walletAddress);
      console.log('- Selected token object:', selectedToken);
      
      // Check if any amounts are zero and filter them out
      const validRecipients = recipients.filter(r => r.amount > 0n);
      const zeroAmounts = recipients.filter(r => r.amount === 0n);
      
      if (zeroAmounts.length > 0) {
        console.log(`⚠️ Filtered out ${zeroAmounts.length} recipients with zero amounts`);
        console.log('Zero amount recipients:', zeroAmounts.map(r => r.address));
      }
      
      if (validRecipients.length === 0) {
        throw new Error('No recipients with valid amounts found');
      }
      
      console.log(`✅ Using ${validRecipients.length} recipients with valid amounts`);
      
      // Check for duplicate recipients
      const addresses = recipients.map(r => r.address.toLowerCase());
      const duplicates = addresses.filter((addr, index) => addresses.indexOf(addr) !== index);
      if (duplicates.length > 0) {
        console.log('⚠️ Found duplicate recipients:', duplicates);
      }
      
      // Calculate total amount needed (using valid recipients only)
      const totalAmount = validRecipients.reduce((sum, r) => {
        if (typeof sum !== 'bigint' || typeof r.amount !== 'bigint') {
          console.error(`Type mismatch in totalAmount reduce: sum=${typeof sum}, r.amount=${typeof r.amount}`);
          console.error(`Values: sum=${sum}, r.amount=${r.amount}`);
        }
        return sum + r.amount;
      }, 0n);
      console.log('- Total amount to disperse:', totalAmount.toString());
      console.log('- Total amount in token units:', (Number(totalAmount) / Math.pow(10, tokenDecimals)).toFixed(tokenDecimals));
      
      // For ERC-20 tokens, we need to check allowance and balance
      if (!isNativeToken) {
        console.log('🔍 ERC-20 token detected - checking allowance and balance...');
        
        // Check token balance first (tiny delay to stagger RPC calls)
        try {
          await new Promise(r => setTimeout(r, 150));
          const balanceResult = await publicClient.readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: 'balanceOf',
            args: [walletAddress],
          });
          
          if (balanceResult < totalAmount) {
            throw new Error(`Insufficient token balance. You have ${balanceResult.toString()} but need ${totalAmount.toString()}`);
          }
          
          console.log(`✅ Token balance sufficient: ${balanceResult.toString()}`);
        } catch (balanceError) {
          console.error('Error checking token balance:', balanceError);
          setDisperseStatus(`Error checking token balance: ${balanceError.message}`);
          setIsDispersing(false);
          return;
        }
        
        // Check allowance (tiny delay to stagger RPC calls)
        try {
          await new Promise(r => setTimeout(r, 150));
          const allowanceResult = await publicClient.readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: 'allowance',
            args: [walletAddress, '0xD152f549545093347A162Dce210e7293f1452150'],
          });
          
          if (allowanceResult < totalAmount) {
            console.log(`⚠️ Insufficient allowance: ${allowanceResult.toString()} < ${totalAmount.toString()}`);
            setDisperseStatus(`⚠️ Token approval required. Please approve ${selectedToken?.symbol} spending for the disperse contract first.`);
            setIsDispersing(false);
            return;
          }
          
          console.log(`✅ Token allowance sufficient: ${allowanceResult.toString()}`);
        } catch (allowanceError) {
          console.error('Error checking token allowance:', allowanceError);
          setDisperseStatus(`Error checking token allowance: ${allowanceError.message}`);
          setIsDispersing(false);
          return;
        }
        
        setDisperseStatus(`✅ ${selectedToken?.symbol} approved and ready to disperse`);
      } else {
        console.log('🔍 Native token detected - checking ETH balance...');
        
        // For ETH, check native balance
        if (selectedToken?.symbol === 'ETH') {
          try {
            const ethBalance = await publicClient.getBalance({ address: walletAddress });
            if (ethBalance < totalAmount) {
              throw new Error(`Insufficient ETH balance. You have ${(Number(ethBalance) / Math.pow(10, 18)).toFixed(6)} ETH but need ${(Number(totalAmount) / Math.pow(10, 18)).toFixed(6)} ETH`);
            }
            console.log(`✅ ETH balance sufficient: ${(Number(ethBalance) / Math.pow(10, 18)).toFixed(6)} ETH`);
            setDisperseStatus(`✅ ETH balance sufficient and ready to disperse`);
          } catch (balanceError) {
            console.error('Error checking ETH balance:', balanceError);
            setDisperseStatus(`Error checking ETH balance: ${balanceError.message}`);
            setIsDispersing(false);
            return;
          }
        } else {
          console.log('🔍 Other native token detected - no approval needed');
        }
      }

      // Use Wagmi's writeContract hook (as recommended by Farcaster docs)
      console.log('🚀 Calling writeContract...');
      
      // Generate Divvi referral tag for on-chain tracking
      const referralTag = generateReferralTag(walletAddress);
      console.log('Divvi: Referral tag generated:', referralTag);
      
      // Capture disperse metadata at the moment we send the tx
      setPendingTxKind('disperse');
      setPendingTxTokenSymbol(selectedToken?.symbol || 'Token');
      
      // Store referral data for later submission
      setPendingTxReferralTag(referralTag);
      
      // Use disperseEther for ETH, disperseToken for other tokens
      if (isNativeToken && selectedToken?.symbol === 'ETH') {
        console.log('🚀 Using disperseEther for ETH transaction');
        const result = await writeContract({
          address: '0xD152f549545093347A162Dce210e7293f1452150', // Disperse contract
          abi: disperseABI,
          functionName: 'disperseEther',
          args: [
            validRecipients.map(r => r.address), // recipient addresses
            validRecipients.map(r => r.amount) // amounts in token units
          ],
          value: totalAmount, // ETH value to send
        });
        console.log('✅ ETH transaction initiated via disperseEther');
        console.log('Transaction result:', result);
      } else {
        console.log('🚀 Using disperseToken for ERC-20 transaction');
        const result = await writeContract({
          address: '0xD152f549545093347A162Dce210e7293f1452150', // Disperse contract
          abi: disperseABI,
          functionName: 'disperseToken',
          args: [
            tokenAddress, // token address (zero address for native tokens)
            validRecipients.map(r => r.address), // recipient addresses
            validRecipients.map(r => r.amount) // amounts in token units
          ],
        });
        console.log('✅ ERC-20 transaction initiated via disperseToken');
        console.log('Transaction result:', result);
      }

      console.log('✅ Transaction initiated via Wagmi writeContract');
      console.log('Transaction result:', result);
      setDisperseStatus('Transaction sent! Waiting for confirmation...');
      
      // Don't set isDispersing to false here - let the useEffect handle it
      
    } catch (error) {
      console.error('Multi-Tip error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      });
      
      let errorMessage = 'Transaction failed';
      if (error.message.includes('User rejected') || error.message.includes('User denied')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transaction reverted - check token approval and balance';
      } else if (error.message.includes('Insufficient token balance')) {
        errorMessage = error.message;
      } else if (error.message.includes('Token approval required')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setDisperseStatus(errorMessage);
      setIsDispersing(false); // Only set to false on actual error
    }
  };

  // LEGACY DISPERSE FUNCTION - Using window.farcasterEthProvider directly
  const disperseTokensLegacy = async () => {
    console.log('🚀 disperseTokensLegacy function started - Using legacy wallet');
    
    try {
      // Basic validation
      console.log('🔍 Checking tipAmount validation...');
      if (!tipAmount || tipAmount <= 0) {
        console.log('❌ Tip amount validation failed');
        setDisperseStatus('Please enter a valid tip amount');
        setIsDispersing(false);
        return;
      }
      console.log('✅ Tip amount validation passed');

      console.log('🔍 Checking selectedToken validation...');
      if (!selectedToken) {
        console.log('❌ Selected token validation failed');
        setDisperseStatus('Please select a token');
        setIsDispersing(false);
        return;
      }
      console.log('✅ Selected token validation passed');

      console.log('🔍 Checking creatorResults validation...');
      if (!creatorResults || creatorResults.length === 0) {
        console.log('❌ Creator results validation failed');
        setDisperseStatus('No creators found to tip');
        setIsDispersing(false);
        return;
      }
      console.log('✅ Creator results validation passed');

      // Check legacy wallet connection
      console.log('🔍 Checking legacy wallet connection...');
      const isConnected = await isLegacyWalletConnected();
      console.log('🔍 Wallet connection result:', isConnected);
      if (!isConnected) {
        console.log('❌ Wallet connection validation failed');
        setDisperseStatus('Wallet not connected. Please connect your wallet first.');
        setIsDispersing(false);
        return;
      }
      console.log('✅ Wallet connection validation passed');

      // Get legacy wallet address
      const legacyAddress = await getLegacyAddress();
      console.log('🔍 Legacy wallet address:', legacyAddress);

      // Check if user is on a supported network (Base, Celo, or Arbitrum with disperse contract deployed)
      console.log('🔍 Checking network support...');
      const supportedNetworks = {
        '0x2105': 'Base',
        '0xa4ec': 'Celo',  // Celo chain ID in hex (42220)
        '0xa4b1': 'Arbitrum'  // Arbitrum chain ID in hex (42161)
      };
      
      console.log('🔍 Wallet chain ID:', walletChainId);
      console.log('🔍 Supported networks:', supportedNetworks);
      
      if (!supportedNetworks[walletChainId]) {
        console.log('❌ Network validation failed - unsupported network');
        setDisperseStatus(`⚠️ Multi-Tip is only available on Base, Celo, or Arbitrum networks. Please switch to Base, Celo, or Arbitrum to use this feature.`);
        setIsDispersing(false);
        return;
      }
      console.log('✅ Network validation passed');
      
      const currentNetworkName = supportedNetworks[walletChainId];
      console.log(`Operating on ${currentNetworkName} network - multi-tip functionality enabled`);
      
      console.log('🔍 About to start validation checks...');
      console.log('🔍 tipAmount:', tipAmount);
      console.log('🔍 selectedToken:', selectedToken);
      console.log('🔍 creatorResults length:', creatorResults?.length);
      
      setIsDispersing(true);
      setDisperseStatus('Preparing transaction...');
      
      console.log('🔍 Validation checks starting...');
      
      // Validate that the selected token is available on the current network
      console.log('🔍 About to check token network compatibility...');
      const tokenNetworkKey = selectedToken?.networkKey;
      const currentNetworkKey = currentNetworkName.toLowerCase();
      console.log('🔍 Token network key:', tokenNetworkKey);
      console.log('🔍 Current network key:', currentNetworkKey);
      
      if (tokenNetworkKey && tokenNetworkKey !== currentNetworkKey) {
        console.log('❌ Token network validation failed - token not available on current network');
        setDisperseStatus(`⚠️ Token ${selectedToken?.symbol} is not available on ${currentNetworkName} network. Please select a ${currentNetworkName} token to multi-tip.`);
        setIsDispersing(false);
        return;
      }
      console.log('✅ Token network validation passed');

      console.log('🔍 About to get token decimals...');
      const tokenDecimals = getTokenDecimals(selectedToken);
      console.log(`🔍 Token decimals for ${selectedToken?.symbol}:`, tokenDecimals);
      console.log('✅ Token decimals retrieved successfully');

      // Calculate distributions based on total impact sum
      console.log('🔍 About to process creator results...');
      console.log('🔍 Creator results sample:', creatorResults.slice(0, 3).map(c => ({
        username: c.username,
        impact: c.impact,
        impactType: typeof c.impact,
        hasAddress: !!c.address,
        allKeys: Object.keys(c)
      })));
      console.log('✅ Creator results sample processed');
      
      // Log full first creator to see structure
      console.log('🔍 First creator full object:', creatorResults[0]);
      
      // Calculate amounts for each creator
      console.log('🔍 Address field check:', creatorResults.slice(0, 3).map(c => ({
        username: c.author_username,
        hasAddress: !!c.address,
        hasWallet: !!c.wallet,
        address: c.address,
        wallet: c.wallet,
        author_fid: c.author_fid
      })));
      
      // Exclude self if author's fid equals the current user's fid
      const selfFidStr = (fid !== undefined && fid !== null) ? String(fid) : null;
      console.log('🔍 Self-exclusion check:', {
        userFid: selfFidStr,
        totalCreators: creatorResults.length
      });
      
      const filteredCreators = selfFidStr
        ? creatorResults.filter(creator => {
            const creatorFidStr = String(creator.author_fid ?? '');
            const isNotSelf = creatorFidStr !== selfFidStr;
            if (!isNotSelf) {
              console.log(`🚫 Excluding self: ${creator.author_username} (fid: ${creatorFidStr})`);
            }
            return isNotSelf;
          })
        : creatorResults;
        
      console.log(`✅ After self-exclusion: ${filteredCreators.length} creators (removed ${creatorResults.length - filteredCreators.length})`);
      
      // Recalculate total impact sum using filtered creators (after self-exclusion)
      const totalImpactSum = filteredCreators.reduce((sum, creator) => {
        const impact = Number(creator.impact_sum) || Number(creator.impact) || 0;
        return sum + impact;
      }, 0);
      console.log('🔍 Total impact sum (after self-exclusion):', totalImpactSum);
      console.log('🔍 Impact will be redistributed among remaining creators');

      if (totalImpactSum === 0) {
        setDisperseStatus('No valid creators with impact found after filtering');
        setIsDispersing(false);
        return;
      }
      
      // Calculate fund distribution based on fundPercent
      const fundAddress = '0x5D7694C48E1de1f04aDd4E9Fdc9a48f9b8a6f51f';
      const fundAmount = fundPercent > 0 ? parseTokenAmount((tipAmount * fundPercent / 100).toFixed(tokenDecimals), tokenDecimals) : ethers.BigNumber.from(0);
      const remainingAmount = fundPercent > 0 ? tipAmount - (tipAmount * fundPercent / 100) : tipAmount;
      
      console.log(`💰 Fund distribution: ${fundPercent}% = ${ethers.utils.formatUnits(fundAmount, tokenDecimals)} ${selectedToken?.symbol || 'tokens'}`);
      console.log(`💸 Remaining for creators: ${ethers.utils.formatUnits(parseTokenAmount(remainingAmount.toFixed(tokenDecimals), tokenDecimals), tokenDecimals)} ${selectedToken?.symbol || 'tokens'}`);
      
      const validRecipients = filteredCreators
        .filter(creator => {
          const impact = Number(creator.impact_sum) || Number(creator.impact) || 0;
          const address = creator.address || creator.wallet;
          return impact > 0 && address;
        })
        .map(creator => {
          const impact = Number(creator.impact_sum) || Number(creator.impact) || 0;
          const percentage = impact / totalImpactSum;
          // Use remaining amount for creator distribution
          const amount = parseTokenAmount((remainingAmount * percentage).toFixed(tokenDecimals), tokenDecimals);
          const address = creator.address || creator.wallet;
          return {
            address: address,
            amount: amount,
            impact: impact,
            percentage: percentage
          };
        })
        .filter(r => r.amount.gt(0)); // Remove zero amounts
      
      // Add fund address to recipients if fundPercent > 0
      if (fundPercent > 0 && fundAmount.gt(0)) {
        validRecipients.push({
          address: fundAddress,
          amount: fundAmount,
          impact: 0,
          percentage: fundPercent / 100
        });
        console.log(`✅ Added fund address ${fundAddress} with amount ${ethers.utils.formatUnits(fundAmount, tokenDecimals)} ${selectedToken?.symbol || 'tokens'}`);
      }

      if (validRecipients.length === 0) {
        setDisperseStatus('No valid recipients found');
        setIsDispersing(false);
        return;
      }

      console.log(`📊 Distribution preview:`, validRecipients.map(r => ({
        address: r.address,
        amount: r.amount.toString(),
        impact: r.impact,
        isFund: r.address === fundAddress
      })));
      
      // Log fund allocation details
      if (fundPercent > 0) {
        console.log(`💰 Fund allocation: ${fundPercent}% (${ethers.utils.formatUnits(fundAmount, tokenDecimals)} ${selectedToken?.symbol || 'tokens'}) → ${fundAddress}`);
        console.log(`💸 Creator allocation: ${100 - fundPercent}% (${ethers.utils.formatUnits(parseTokenAmount(remainingAmount.toFixed(tokenDecimals), tokenDecimals), tokenDecimals)} ${selectedToken?.symbol || 'tokens'})`);
      }

      const totalAmount = validRecipients.reduce((sum, r) => sum.add(r.amount), ethers.BigNumber.from(0));
      const tokenAddress = selectedToken?.address || ethers.constants.AddressZero;
      
      // Handle native tokens (ETH, CELO) - they use zero address in the disperse contract
      const isNativeToken = selectedToken?.isNative || 
        tokenAddress === ethers.constants.AddressZero ||
        ['ETH', 'CELO'].includes(selectedToken?.symbol);
      
      // Calculate total amount in decimal format (needed for OnchainTip and balance check)
      const totalAmountFloat = parseFloat(ethers.utils.formatUnits(totalAmount, tokenDecimals));

      console.log('🔍 Transaction details:');
      console.log('- Token address:', tokenAddress);
      console.log('- Is native token:', isNativeToken);
      console.log('- Recipients:', validRecipients.length);
      console.log('- Fund percent:', fundPercent + '%');
      console.log('- Fund amount:', fundAmount.toString());
      console.log('- Creator total amount:', totalAmount.toString());
      console.log('- Total amount (decimal):', totalAmountFloat);
      console.log('- Wallet address:', legacyAddress);

      // For non-native tokens, check balance and allowance
      if (!isNativeToken) {
        console.log('🔍 Checking token balance...');
        console.log('🔍 About to check balance for non-native token:', selectedToken?.symbol);
        
        // Use the balance we already have from selectedToken data instead of querying the contract
        // This avoids the eth_call issue with Farcaster provider
        const tokenBalance = parseFloat(selectedToken.balance || 0);
        
        // Calculate total amount needed including fund distribution
        const totalAmountWithFund = fundPercent > 0 ? tipAmount : totalAmountFloat;
        
        console.log(`🔍 Balance check: have ${tokenBalance} ${selectedToken.symbol}, need ${totalAmountWithFund} (including ${fundPercent}% fund)`);
        
        if (tokenBalance < totalAmountWithFund) {
          console.log(`⚠️ Insufficient balance: ${tokenBalance} < ${totalAmountWithFund}`);
          setDisperseStatus(`Insufficient ${selectedToken?.symbol} balance. You have ${tokenBalance} but need ${totalAmountWithFund.toFixed(6)} (including ${fundPercent}% fund)`);
          setIsDispersing(false);
          return;
        }
        
        console.log(`✅ Token balance sufficient (${tokenBalance} >= ${totalAmountWithFund})`);
        
        // Skip allowance check due to Farcaster provider limitations
        // If approval is needed, the transaction will fail with a clear error message
        console.log('ℹ️ Skipping allowance check due to provider limitations');
        setDisperseStatus(`✅ ${selectedToken?.symbol} balance sufficient. Proceeding with transaction...`);
      } else {
        console.log('🔍 Native token detected - checking ETH balance...');
        console.log('🔍 About to check balance for native token:', selectedToken?.symbol);
        
        // For ETH, check native balance
        if (selectedToken?.symbol === 'ETH') {
          try {
            const legacyProvider = await getLegacyProvider();
            const ethBalance = await legacyProvider.getBalance(legacyAddress);
            
            // Calculate total amount needed including fund distribution
            const totalAmountWithFund = fundPercent > 0 ? parseTokenAmount(tipAmount.toFixed(tokenDecimals), tokenDecimals) : totalAmount;
            
            if (ethBalance.lt(totalAmountWithFund)) {
              throw new Error(`Insufficient ETH balance. You have ${ethers.utils.formatEther(ethBalance)} ETH but need ${ethers.utils.formatEther(totalAmountWithFund)} ETH (including ${fundPercent}% fund)`);
            }
            console.log(`✅ ETH balance sufficient: ${ethers.utils.formatEther(ethBalance)} ETH`);
            setDisperseStatus(`✅ ETH balance sufficient and ready to disperse`);
          } catch (balanceError) {
            console.error('Error checking ETH balance:', balanceError);
            setDisperseStatus(`Error checking ETH balance: ${balanceError.message}`);
            setIsDispersing(false);
            return;
          }
        } else {
          console.log('🔍 Other native token detected - no approval needed');
        }
      }

      // Execute the disperse transaction
      console.log('🚀 Calling legacy disperseToken...');
      console.log('🔍 About to call legacyDisperseUtils.disperseToken with:', {
        tokenAddress,
        recipients: validRecipients.length,
        isNativeToken,
        selectedTokenSymbol: selectedToken?.symbol
      });
      
      // Check if legacyDisperseUtils is available
      if (!legacyDisperseUtils) {
        console.error('❌ legacyDisperseUtils is not available');
        setDisperseStatus('Disperse utilities not available');
        setIsDispersing(false);
        return;
      }
      
      console.log('✅ legacyDisperseUtils is available');
      
      // Generate Divvi referral tag for legacy transaction
      const referralTag = generateReferralTag(legacyAddress);
      console.log('Divvi: Referral tag generated for legacy transaction:', referralTag);
      
      setPendingTxKind('disperse');
      setPendingTxTokenSymbol(selectedToken?.symbol || 'Token');
      setPendingTxReferralTag(referralTag);
      
      // Use disperseEther for ETH, disperseToken for other tokens
      let tx;
      try {
        if (isNativeToken && selectedToken?.symbol === 'ETH') {
          console.log('🚀 Using legacy disperseEther for ETH transaction');
          console.log('🔍 ETH recipients:', validRecipients.map(r => ({ address: r.address, amount: r.amount.toString() })));
          tx = await legacyDisperseUtils.disperseEther(
            validRecipients.map(r => r.address),
            validRecipients.map(r => r.amount)
          );
        } else {
          console.log('🚀 Using legacy disperseToken for ERC-20 transaction');
          console.log('🔍 ERC-20 details:', {
            tokenAddress,
            recipients: validRecipients.map(r => ({ address: r.address, amount: r.amount.toString() }))
          });
          tx = await legacyDisperseUtils.disperseToken(
            tokenAddress,
            validRecipients.map(r => r.address),
            validRecipients.map(r => r.amount)
          );
        }
        console.log('✅ Transaction call completed successfully');
      } catch (txError) {
        console.error('❌ Error calling disperse function:', txError);
        setDisperseStatus(`Transaction failed: ${txError.message}`);
        setIsDispersing(false);
        return;
      }

      console.log('✅ Transaction initiated via legacy wallet');
      console.log('Transaction hash:', tx.hash);
      setDisperseStatus('Transaction sent! Waiting for confirmation...');
      
      // Wait for confirmation
      const receipt = await waitForLegacyTransaction(tx);
      console.log('✅ Transaction confirmed:', receipt.transactionHash);
      setDisperseStatus('Transaction confirmed! Multi-tip successful 🎉');
      
      // Re-check approval status since transaction succeeded
      if (selectedToken && !selectedToken.isNative) {
        checkTokenApproval();
        console.log('🔍 Re-checking approval after successful disperse');
      }
      
      // Create OnchainTip document via API
      try {
        console.log('📝 Creating OnchainTip document...');
        
        // Prepare receiver data for OnchainTip document (exclude fund address)
        const fundAddress = '0x5D7694C48E1de1f04aDd4E9Fdc9a48f9b8a6f51f';
        const receivers = validRecipients
          .filter(recipient => recipient.address !== fundAddress) // Exclude fund address from receivers
          .map(recipient => {
            // Find the creator data to get fid, pfp, username
            const creator = filteredCreators.find(c => 
              (c.address || c.wallet) === recipient.address
            );
            
            return {
              fid: creator?.author_fid || null,
              pfp: creator?.author_pfp || null,
              username: creator?.author_username || 'Unknown',
              amount: parseFloat(ethers.utils.formatUnits(recipient.amount, tokenDecimals))
            };
          });
        
        const tipPayload = {
          tipper_fid: Number(fid) || Number(userInfo?.fid) || null,
          tipper_pfp: userInfo?.pfp || null,
          tipper_username: userInfo?.username || null,
          fund: fundPercent, // Add fund percentage to OnchainTip
          network: getNetworkName(walletChainId), // Add network field based on current chain
          tip: [{
            currency: selectedToken?.symbol || 'Token',
            amount: Number(totalAmountFloat) || 0,
            value: Number(totalAmountFloat) * Number(selectedToken?.price || 0) || 0
          }],
          receiver: receivers,
          transaction_hash: tx.hash || receipt.transactionHash || 'unknown',
        };
        
        console.log('📝 OnchainTip payload:', {
          ...tipPayload,
          receiver: `${receivers.length} recipients`
        });
        console.log('🔍 Fund field debug:', {
          fundPercent: fundPercent,
          fundType: typeof fundPercent,
          fundValue: tipPayload.fund
        });
        console.log('🌐 Network field debug:', {
          walletChainId: walletChainId,
          networkName: getNetworkName(walletChainId),
          networkInPayload: tipPayload.network
        });
        
        const res = await fetch('/api/onchain-tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tipPayload),
        });
        
        if (res.ok) {
          const created = await res.json();
          console.log('✅ OnchainTip document created:', created.id);
          
          // Show share modal with created OnchainTip ID
          console.log('🎉 Showing share modal...');
          setShareModal({
            on: true,
            id: created.id,
            amount: totalAmountFloat,
            token: selectedToken?.symbol || 'Token',
            receivers: receivers.length,
            fundPercent: fundPercent
          });
        } else {
          console.warn('⚠️ OnchainTip API returned non-200:', res.status, await res.text());
          
          // Still show share modal even if OnchainTip creation failed, but without image
          setShareModal({
            on: true,
            id: null,
            amount: totalAmountFloat,
            token: selectedToken?.symbol || 'Token',
            receivers: receivers.length,
            fundPercent: fundPercent
          });
        }
      } catch (onchainTipError) {
        console.error('❌ Failed to create OnchainTip document:', onchainTipError);
        
        // Still show share modal even if entire OnchainTip process failed
        setShareModal({
          on: true,
          id: null,
          amount: totalAmountFloat,
          token: selectedToken?.symbol || 'Token',
          receivers: validRecipients.filter(r => r.address !== fundAddress).length,
          fundPercent: fundPercent
        });
      }
      
      // Submit Divvi referral tracking for legacy transaction
      try {
        if (pendingTxReferralTag) {
          console.log('Divvi: Submitting referral for confirmed legacy transaction');
          
          // Submit on-chain referral to Divvi
          const referralSuccess = await submitOnChainReferral(
            tx.hash || receipt.transactionHash, 
            walletChainId
          );
          
          if (referralSuccess) {
            console.log('Divvi: Legacy transaction referral submitted successfully');
          } else {
            console.warn('Divvi: Failed to submit legacy transaction referral');
          }
          
          // Clear the referral tag
          setPendingTxReferralTag(null);
        }
      } catch (referralError) {
        console.error('Divvi: Error submitting legacy transaction referral:', referralError);
      }
      
      // Refresh token balances after success
      try {
        if (walletConnected && walletAddress) {
          getAllTokens(walletAddress, true);
        }
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh tokens after disperse:', refreshError);
      }
      
      setIsDispersing(false);
      
    } catch (error) {
      console.error('Legacy Multi-Tip error:', error);
      
      let errorMessage = 'Transaction failed';
      let isApprovalError = false;
      
      if (error.message.includes('User rejected') || error.message.includes('User denied')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message.includes('execution reverted')) {
        // Check if this is an approval-related error
        if (selectedToken && !selectedToken.isNative && 
            (error.message.includes('allowance') || 
             error.message.includes('transfer amount exceeds allowance') ||
             error.message.includes('ERC20: insufficient allowance'))) {
          errorMessage = `Token approval required. Please approve ${selectedToken.symbol} spending first.`;
          isApprovalError = true;
        } else {
          errorMessage = 'Transaction reverted - check token approval and balance';
        }
      } else if (error.message.includes('Insufficient token balance')) {
        errorMessage = error.message;
      } else if (error.message.includes('Token approval required')) {
        errorMessage = error.message;
        isApprovalError = true;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      // If this was an approval error, re-check approval status
      if (isApprovalError && selectedToken && !selectedToken.isNative) {
        checkTokenApproval();
        console.log('🔍 Re-checking approval due to transaction failure');
      }
      
      setDisperseStatus(errorMessage);
      setIsDispersing(false);
    }
  };

  // LEGACY APPROVE FUNCTION - Using window.farcasterEthProvider directly
  const approveTokenLegacy = async () => {
    const isConnected = await isLegacyWalletConnected();
    if (!selectedToken || !isConnected) {
      setDisperseStatus('Wallet not connected or no token selected');
      return;
    }

    if (selectedToken?.isNative) {
      setDisperseStatus('Native tokens do not require approval');
      return;
    }

    try {
      setIsDispersing(true);
      setDisperseStatus('Requesting token approval...');

      const legacyAddress = await getLegacyAddress();
      const tokenAddress = selectedToken?.address;
      const spenderAddress = '0xD152f549545093347A162Dce210e7293f1452150'; // Disperse contract
      
      // Determine approval amount based on user preference
      let approvalAmount;
      if (approveOnlyAmount) {
        console.log('🔍 Calculating exact amount needed for approval...');
        
        // Calculate exact amount needed for the current disperse
        if (creatorResults && creatorResults.length > 0 && tipAmount > 0) {
          const tokenDecimals = getTokenDecimals(selectedToken);
          
          // Filter creators (same logic as disperseTokensLegacy)
          const selfFidStr = (fid !== undefined && fid !== null) ? String(fid) : null;
          const filteredCreators = selfFidStr
            ? creatorResults.filter(creator => {
                const creatorFidStr = String(creator.author_fid ?? '');
                return creatorFidStr !== selfFidStr;
              })
            : creatorResults;
          
          // Calculate total impact sum (same as disperseTokensLegacy)
          const totalImpactSum = filteredCreators.reduce((sum, creator) => {
            const impact = Number(creator.impact_sum) || Number(creator.impact) || 0;
            return sum + impact;
          }, 0);
          
          if (totalImpactSum > 0) {
            const exactAmount = parseTokenAmount(tipAmount.toString(), tokenDecimals);
            approvalAmount = exactAmount;
            console.log(`💡 Approving exact amount: ${ethers.utils.formatUnits(exactAmount, tokenDecimals)} ${selectedToken.symbol}`);
          } else {
            console.log('⚠️ Could not calculate exact amount, using unlimited approval');
            approvalAmount = ethers.constants.MaxUint256;
          }
        } else {
          console.log('⚠️ No tip data available, using unlimited approval');
          approvalAmount = ethers.constants.MaxUint256;
        }
      } else {
        console.log('💡 Using unlimited approval (MaxUint256)');
        approvalAmount = ethers.constants.MaxUint256;
      }
      
      console.log('🔍 Legacy approval details:');
      console.log('- Token:', tokenAddress);
      console.log('- Spender:', spenderAddress);
      console.log('- Amount:', approvalAmount.toString());

      setPendingTxKind('approval');
      const tx = await legacyTokenUtils.approve(tokenAddress, spenderAddress, approvalAmount);
      
      console.log('✅ Approval transaction sent:', tx.hash);
      setDisperseStatus('Approval transaction sent! Waiting for confirmation...');
      
      const receipt = await waitForLegacyTransaction(tx);
      console.log('✅ Approval confirmed:', receipt.transactionHash);
      setDisperseStatus('Token approval confirmed! You can now multi-tip.');
      setIsDispersing(false);
      
      // Update status after approval and mark token as approved
      setTimeout(() => {
        setDisperseStatus(`✅ ${selectedToken.symbol} approved! Ready to multi-tip.`);
        setNeedsApproval(false);
        
        // Update local cache with the new approval data
        const tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
        setTokenApprovals(prev => ({
          ...prev,
          [tokenAddress]: {
            approved: true,
            amount: approvalAmount.toString(),
            lastChecked: Date.now()
          }
        }));
        
        // Re-check approval status to update UI
        checkTokenApproval();
      }, 1000);
      
    } catch (error) {
      console.error('Legacy token approval error:', error);
      setDisperseStatus(`Approval failed: ${error.message}`);
      setIsDispersing(false);
    }
  };





  // Trigger search when userQuery changes
  useEffect(() => {
    // Always trigger search when filters change, regardless of ecosystem
    console.log('userQuery changed, triggering search:', userQuery);
    feedRouter();
  }, [userQuery]);

  // Feed router to trigger searches when filters change
  function feedRouter() {
    let { shuffle, time, tags, channels, curators, order, timeSort } = userQuery;

    if (curatorId) {
      curators = [Number(curatorId)];
    }

    // Use a default ecosystem if none is provided, or you can modify this based on your needs
    const searchEcosystem = ecosystem || 'abundance'; // Default to 'abundance' ecosystem
    console.log('get user executed', shuffle, time, tags, channels, searchEcosystem, curators, order);
    getUserSearch(time, tags, channels, curators, null, shuffle, order, searchEcosystem, timeSort);
  }

  async function getUserSearch(getTime, tags, channel, curators, text, shuffle, order, ecosystem, timeSort) {
    console.log('getUserSearch called with params:', { getTime, tags, channel, curators, text, shuffle, order, ecosystem, timeSort });
    const time = getTimeRange(getTime);

    console.log('Processed time:', time);
    
    setSearchLoading(true);
    
    try {
      // Call the API to get filtered creators
      const response = await axios.get('/api/curation/getImpactSearch', {
        params: { time, tags, channel, curators, text, shuffle, ecosystem, order, timeSort }
      });
      
      if (response?.data?.casts) {
        console.log('response', response.data);
        setCreatorResults(response.data.combinedImpact);
        console.log('Creator search results:', response.data.combinedImpact);
      } else {
        setCreatorResults([]);
      }
    } catch (error) {
      console.error('Error searching creators:', error);
      setCreatorResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  // Function to check all token approvals and cache them locally
  const checkAllTokenApprovals = async () => {
    if (!walletConnected || !walletAddress) {
      console.log('🔍 checkAllTokenApprovals: Wallet not connected');
      return;
    }

    console.log('🔍 checkAllTokenApprovals: Checking all token approvals');
    
    try {
      // Get all available tokens from context
      const allTokens = getAllTokens ? await getAllTokens(walletAddress, false) : [];
      
      if (!allTokens || allTokens.length === 0) {
        console.log('🔍 checkAllTokenApprovals: No tokens available');
        return;
      }

      const newApprovals = {};
      
      // Check each non-native token
      for (const token of allTokens) {
        if (token.isNative) {
          newApprovals[token.address] = { approved: true, amount: '0', lastChecked: Date.now() };
          continue;
        }

        try {
          console.log(`🔍 Checking approval for ${token.symbol} (${token.address})`);
          
          const allowanceResult = await publicClient.readContract({
            address: token.address,
            abi: erc20ABI,
            functionName: 'allowance',
            args: [walletAddress, '0xD152f549545093347A162Dce210e7293f1452150'],
          });

          const isApproved = allowanceResult > parseUnits('0.01', getTokenDecimals(token));
          
          newApprovals[token.address] = {
            approved: isApproved,
            amount: allowanceResult.toString(),
            lastChecked: Date.now()
          };

          console.log(`🔍 ${token.symbol} approval status:`, {
            approved: isApproved,
            amount: allowanceResult.toString(),
            decimals: getTokenDecimals(token)
          });

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.warn(`🔍 Failed to check approval for ${token.symbol}:`, error);
          // Mark as unknown status
          newApprovals[token.address] = { approved: false, amount: '0', lastChecked: Date.now() };
        }
      }

      setTokenApprovals(newApprovals);
      console.log('🔍 All token approvals cached:', newApprovals);
      
    } catch (error) {
      console.error('🔍 Error checking all token approvals:', error);
    }
  };

  // Function to refresh approval cache for a specific token
  const refreshTokenApproval = async (tokenAddress) => {
    if (!walletConnected || !walletAddress || !tokenAddress) {
      console.log('🔍 refreshTokenApproval: Missing required parameters');
      return;
    }

    try {
      console.log(`🔍 Refreshing approval for token: ${tokenAddress}`);
      
      const allowanceResult = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [walletAddress, '0xD152f549545093347A162Dce210e7293f1452150'],
      });

      // Update local cache with fresh data
      setTokenApprovals(prev => ({
        ...prev,
        [tokenAddress]: {
          approved: allowanceResult > parseUnits('0.01', 18), // Default to 18 decimals
          amount: allowanceResult.toString(),
          lastChecked: Date.now()
        }
      }));

      console.log(`🔍 Token approval refreshed:`, {
        address: tokenAddress,
        allowance: allowanceResult.toString(),
        approved: allowanceResult > parseUnits('0.01', 18)
      });
      
    } catch (error) {
      console.error(`🔍 Error refreshing token approval for ${tokenAddress}:`, error);
    }
  };

  // Helper function to get cached approval status for a token and tip amount
  const getCachedApprovalStatus = (tokenAddress, tipAmount) => {
    if (!tokenAddress || !tipAmount || tipAmount <= 0) {
      return { needsApproval: false, reason: 'Invalid parameters' };
    }

    const cachedApproval = tokenApprovals[tokenAddress];
    if (!cachedApproval) {
      return { needsApproval: true, reason: 'No cached data' };
    }

    // Check if cache is still valid (5 minutes)
    if (Date.now() - cachedApproval.lastChecked > 300000) {
      return { needsApproval: true, reason: 'Cache expired' };
    }

    // Convert tipAmount to wei for comparison
    const token = selectedToken;
    const decimals = getTokenDecimals(token);
    const tipAmountInWei = parseUnits(tipAmount.toString(), decimals);
    
    const isApproved = cachedApproval.approved && 
      BigInt(cachedApproval.amount) >= tipAmountInWei;

    return {
      needsApproval: !isApproved,
      reason: isApproved ? 'Sufficient allowance' : 'Insufficient allowance',
      cachedData: cachedApproval,
      tipAmountInWei: tipAmountInWei.toString()
    };
  };

  // Function to manually refresh approval for the currently selected token
  const refreshCurrentTokenApproval = async () => {
    if (!selectedToken || selectedToken.isNative) {
      console.log('🔍 refreshCurrentTokenApproval: No token selected or native token');
      return;
    }

    const tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
    console.log(`🔍 Manually refreshing approval for ${selectedToken.symbol}`);
    
    try {
      setDisperseStatus('Refreshing approval status...');
      
      const allowanceResult = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [walletAddress, '0xD152f549545093347A162Dce210e7293f1452150'],
      });

      // Convert tipAmount to wei for comparison
      const tipAmountInWei = parseUnits(tipAmount.toString(), getTokenDecimals(selectedToken));
      const isApproved = allowanceResult >= tipAmountInWei;

      // Update local cache with fresh data
      setTokenApprovals(prev => ({
        ...prev,
        [tokenAddress]: {
          approved: isApproved,
          amount: allowanceResult.toString(),
          lastChecked: Date.now()
        }
      }));

      // Update UI state
      setNeedsApproval(!isApproved);
      
      if (isApproved) {
        setDisperseStatus(`✅ ${selectedToken.symbol} is approved for ${tipAmount} ${selectedToken.symbol}. Ready to multi-tip!`);
      } else {
        const currentAllowance = ethers.utils.formatUnits(allowanceResult, getTokenDecimals(selectedToken));
        const shortfall = tipAmount - parseFloat(currentAllowance);
        setDisperseStatus(`⚠️ Token approval required. Current allowance: ${currentAllowance} ${selectedToken.symbol}, but you want to tip: ${tipAmount} ${selectedToken.symbol}. You need to approve ${shortfall.toFixed(6)} more ${selectedToken.symbol}.`);
      }

      console.log(`🔍 Approval status refreshed for ${selectedToken.symbol}:`, {
        approved: isApproved,
        allowance: allowanceResult.toString(),
        tipAmount: tipAmount,
        tipAmountInWei: tipAmountInWei.toString()
      });
      
    } catch (error) {
      console.error(`🔍 Error refreshing approval for ${selectedToken.symbol}:`, error);
      setDisperseStatus(`Error refreshing approval status: ${error.message}`);
    }
  };

  // Function to clear the approval cache
  const clearApprovalCache = () => {
    console.log('🔍 Clearing approval cache');
    setTokenApprovals({});
    setDisperseStatus('Approval cache cleared. Please refresh to check current status.');
    // Force re-check of approval status
    if (selectedToken && !selectedToken.isNative && tipAmount > 0) {
      setNeedsApproval(true);
    }
  };

  return (
    <div className="flex-col" style={{ width: "auto", position: "relative" }} ref={ref1}>
      <Head>
        <meta
          name="fc:frame"
          content='{"version":"next","imageUrl":"https://impact.abundance.id/images/icon-02.png","button":{"title":"Impact Multi-Tip","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id/~/tip","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}'
        />

        {/* Mini App specific metadata */}
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id/~/tip" />
      </Head>





      {/* <Head>
        <meta
          name="fc:frame"
          content={`{"version":"next","imageUrl":"${baseURL}/api/frames/tip/onchain-tip-v1","button":{"title":"Onchain Multi-Tip","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id/~/tip","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}`}
        />

        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id/~/tip" />
      </Head> */}

      {/* Custom Share Modal */}
      {shareModal.on && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2147483647, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#021326', border: '1px solid #11447799', borderRadius: '14px', width: 'min(680px, 96vw)', maxWidth: '96vw', color: '#cde', boxShadow: '0 8px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #11447755', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ fontSize: '18px', fontWeight: 700, color: '#9df', textAlign: 'center' }}>
                  Congrats! You multi-tipped {shareModal.receivers} creators on Farcaster!
                </div>
              <button onClick={() => { setShareModal({ on: false, id: null, amount: 0, token: '', receivers: 0, fundPercent: 0 }); setShareImageLoaded(false); setShareImageError(false); }} style={{ background: 'transparent', border: 'none', color: '#9df', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '305px', height: '205px', borderRadius: '10px', border: '2px solid #abc', background: '#082039' }}>
                {!shareImageLoaded && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner size={28} color={'#9df'} />
                      </div>
                    )}
                {shareModal.id && !shareImageError && (
                  <img
                    src={`${baseURL}/api/frames/tip/onchain-tip-v1?${qs.stringify({ id: shareModal.id })}`}
                    alt="Onchain Tip"
                    onLoad={() => setShareImageLoaded(true)}
                    onError={() => { setShareImageError(true); setShareImageLoaded(true); }}
                    style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
                    </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button 
                  onClick={shareOnchainTip} 
                  disabled={!shareImageLoaded}
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #abc', 
                    background: shareImageLoaded ? '#113355' : '#334455', 
                    color: shareImageLoaded ? '#cde' : '#999', 
                    cursor: shareImageLoaded ? 'pointer' : 'not-allowed', 
                    fontSize: '14px', 
                    fontWeight: 600,
                    opacity: shareImageLoaded ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {shareImageLoaded ? 'Share' : 'Loading...'}
                </button>
                  </div>
                    </div>
                        </div>
                      </div>
                    )}

      {/* <div className="" style={{padding: '58px 0 0 0'}}>
      </div> */}

      {(!curatorId && (!isLogged || (version == "1.0" && !adminTest) || version == "2.0" || adminTest)) && (
        <div
          id="log in"
                    style={{
            padding: isMobile ? (version == "1.0" && !adminTest ? "58px 0 20px 0" : "48px 0 20px 0") : "58px 0 60px 0",
            width: feedMax,
            fontSize: "0px"
          }}
        >
          &nnsp;
          </div>
        )}

      {/* <img
        src={`${baseURL}/api/frames/tip/onchain-tip-v1?${qs.stringify({ id: '68a13ca236c2006e443623bd' })}`}
        alt="Onchain Tip"
        style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
      /> */}


      {/* Wallet Integration Section */}
      {(version == '1.0' || version == '2.0' || adminTest) && (<div style={{ padding: "20px 4px 0px 4px", width: feedMax }}>
        <div className="flex-col" style={{ backgroundColor: "" }}>
          <div
            className="shadow flex-col"
            style={{
              backgroundColor: "#002244",
              borderRadius: "15px",
              border: "1px solid #11447799",
              width: isMiniApp || isMobile ? "340px" : "100%",
              margin: "0px auto 0 auto"
            }}
          >
            <div
              className="shadow flex-row"
              style={{
                backgroundColor: "#11448888",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                borderRadius: "15px",
                margin: "0 0 10px 0",
                gap: "1rem"
              }}
            >
              <div
                className="flex-row"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  padding: "0px 0 0 4px",
                  margin: "0 0 0px 0"
                }}
              >
                <BsCurrencyExchange style={{ fill: "#cde" }} size={20} />
                <div>
                  <div
                    style={{
                      border: "0px solid #777",
                      padding: "2px",
                      borderRadius: "10px",
                      backgroundColor: "",
                      maxWidth: "fit-content",
                      cursor: "pointer",
                      color: "#cde"
                    }}
                  >
                    <div className="top-layer flex-row">
                      <div
                        className="flex-row"
                        style={{
                          padding: "4px 0 4px 10px",
                          marginBottom: "0px",
                          flexWrap: "wrap",
                          justifyContent: "flex-start",
                          gap: "0.00rem",
                          width: "",
                          alignItems: "center"
                        }}
                      >
                        <div
                          style={{
                            fontSize: isMobile ? "18px" : "22px",
                            fontWeight: "600",
                            color: "",
                            padding: "0px 3px"
                          }}
                        >
                          Select Token
                        </div>
                        

                        
                        {/* Amount Input */}

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <ToggleSwitch target={'autoFund'} /> */}
            </div>

            <div
              className="flex-col"
              style={{
                backgroundColor: "#002244ff",
                padding: "10px 18px 12px 18px",
                borderRadius: "0 0 15px 15px",
                color: "#ace",
                fontSize: "12px",
                gap: "0.75rem",
                position: "relative"
              }}>

              <div style={{ padding: "0 20px 5px 20px" }}>
                <WalletConnect onTipAmountChange={updateTipAmount} onTokenChange={updateSelectedToken} />

                {/* Token Action Buttons - Show either Approve OR Multi-Tip, never both */}
                {creatorResults.length > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    {/* Debug info for cached approval status */}
                    {/* {selectedToken && !selectedToken.isNative && (
                      <div style={{ 
                        marginBottom: "10px", 
                        padding: "8px", 
                        backgroundColor: "#0f1a2a", 
                        borderRadius: "6px", 
                        fontSize: "10px",
                        color: "#9df"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div><strong>Cache Status:</strong></div>
                          <button
                            onClick={clearApprovalCache}
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid #ff6b6b",
                              backgroundColor: "transparent",
                              color: "#ff6b6b",
                              fontSize: "8px",
                              cursor: "pointer"
                            }}
                          >
                            Clear Cache
                          </button>
                        </div>
                        <div>Token: {selectedToken.symbol}</div>
                        <div>Address: {selectedToken.address?.slice(0, 8)}...{selectedToken.address?.slice(-6)}</div>
                        {tokenApprovals[selectedToken.address] ? (
                          <>
                            <div>Approved: {tokenApprovals[selectedToken.address].approved ? '✅ Yes' : '❌ No'}</div>
                            <div>Allowance: {ethers.utils.formatUnits(tokenApprovals[selectedToken.address].amount, getTokenDecimals(selectedToken))} {selectedToken.symbol}</div>
                            <div>Last Checked: {new Date(tokenApprovals[selectedToken.address].lastChecked).toLocaleTimeString()}</div>
                          </>
                        ) : (
                          <div>No cached data</div>
                        )}
                      </div>
                    )} */}
                    
                    {console.log('🔍 Button rendering debug:', {
                      isLogged,
                      creatorResultsLength: creatorResults?.length,
                      needsApproval,
                      selectedToken: selectedToken?.symbol,
                      tipAmount
                    })}
                    {/* Show Approve button ONLY when approval is needed */}
                    {needsApproval && (
                      <div style={{ marginBottom: "10px" }}>
                        {/* Refresh button for approval status */}
                        {/* <div style={{ marginBottom: "8px" }}>
                          <button
                            onClick={refreshCurrentTokenApproval}
                            disabled={isDispersing}
                            style={{
                              width: "100%",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid #007bff",
                              backgroundColor: "transparent",
                              color: "#007bff",
                              fontSize: "10px",
                              fontWeight: "500",
                              cursor: isDispersing ? "not-allowed" : "pointer"
                            }}
                          >
                            🔄 Refresh Approval Status
                          </button>
                        </div> */}
                        
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#9df" }}>
                            <input
                              type="checkbox"
                              checked={approveOnlyAmount}
                              onChange={(e) => setApproveOnlyAmount(e.target.checked)}
                            />
                            Approve only amount to be multi-tipped
                          </label>
                        </div>
                        <button
                          onClick={approveTokenLegacy}
                          disabled={isDispersing}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: isDispersing ? "#555" : "#007bff",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: isDispersing ? "not-allowed" : "pointer"
                          }}
                        >
                          {isDispersing ? "Approving..." : `Approve ${selectedToken?.symbol || 'Token'}`}
                        </button>
                      </div>
                    )}
                    
                    {/* Show Multi-Tip button ONLY when approval is NOT needed */}
                    {!needsApproval && (
                      <div>
                        {/* Refresh button for approval status */}
                        {/* <div style={{ marginBottom: "8px" }}>
                          <button
                            onClick={refreshCurrentTokenApproval}
                            disabled={isDispersing}
                            style={{
                              width: "100%",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid #28a745",
                              backgroundColor: "transparent",
                              color: "#28a745",
                              fontSize: "10px",
                              fontWeight: "500",
                              cursor: isDispersing ? "not-allowed" : "pointer"
                            }}
                          >
                            🔄 Refresh Approval Status
                          </button>
                        </div> */}
                        
                        <button
                          onClick={async () => {
                            console.log('🔍 Multi-Tip button clicked!');
                            console.log('🔍 Button state debug:', {
                              isDispersing,
                              walletConnected,
                              tipAmount,
                              walletChainId,
                              selectedToken: selectedToken?.symbol,
                                chainCheck: !['0x2105', '0xa4ec', '0xa4b1'].includes(walletChainId), // Base, Celo, or Arbitrum
                            shouldBeDisabled: isDispersing || !walletConnected || !tipAmount || !['0x2105', '0xa4ec', '0xa4b1'].includes(walletChainId)
                            });
                            
                            // Check network compatibility before proceeding
                            if (selectedToken) {
                              const networkCompatible = await checkAndSwitchNetwork(selectedToken, true);
                              if (!networkCompatible) {
                                console.log('🔍 Network switch failed or cancelled, aborting multi-tip');
                                return;
                              }
                            }
                            
                            console.log('🔍 disperseTokens function:', typeof disperseTokens);
                            console.log('🔍 About to call disperseTokens...');
                            disperseTokensLegacy();
                          }}
                          disabled={isDispersing || !walletConnected || !tipAmount || isSwitchingNetwork || !['0x2105', '0xa4ec', '0xa4b1'].includes(walletChainId)}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: (() => {
                              if (isPending || isConfirming || !walletConnected || !tipAmount || isSwitchingNetwork) return "#555";
                              if (networkSwitchError) return "#ff9500"; // Orange for network mismatch
                              return "#007bff"; // Blue for ready
                            })(),
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: isPending || isConfirming || !walletConnected || !tipAmount || isSwitchingNetwork ? "not-allowed" : "pointer"
                          }}
                        >
                          {isPending 
                           ? "Preparing..." 
                           : isConfirming 
                           ? "Confirming..." 
                           : isSwitchingNetwork
                           ? "Switching Network..."
                           : networkSwitchError
                             ? `Switch Network & Multi-Tip`
                             : `Multi-Tip ${selectedToken?.symbol || 'Token'}`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                

                
                                 {/* Network Switch Button - Show when there's a network mismatch */}
                 {selectedToken && networkSwitchError && (
                   <div style={{ marginTop: "15px" }}>
                     <button
                       onClick={() => {
                         console.log('🔄 Manual network switch triggered');
                         checkAndSwitchNetwork(selectedToken, true);
                       }}
                       disabled={isSwitchingNetwork}
                       style={{
                         width: "100%",
                         padding: "10px 16px",
                         borderRadius: "8px",
                         border: "none",
                         backgroundColor: isSwitchingNetwork ? "#555" : "#ff9500",
                         color: "#fff",
                         fontSize: "12px",
                         fontWeight: "600",
                         cursor: isSwitchingNetwork ? "not-allowed" : "pointer",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         gap: "8px"
                       }}
                     >
                       {isSwitchingNetwork ? (
                         <>
                           <Spinner size={16} color={'#fff'} />
                           Switching Network...
                         </>
                       ) : (
                         `🔄 Switch to ${(() => {
                           const requiredChainId = getChainIdForNetwork(selectedToken.networkKey);
                           const networkNames = {
                             '0x1': 'Ethereum',
                             '0xa': 'Optimism', 
                             '0xa4b1': 'Arbitrum',
                             '0x2105': 'Base',
                             '0xa4ec': 'Celo',
                             '0x89': 'Polygon'
                           };
                           return networkNames[requiredChainId] || selectedToken.networkKey;
                         })()}`
                       )}
                     </button>
                   </div>
                 )}

                 {/* Disperse Status */}
                 {disperseStatus && (
                   <div style={{ marginTop: "15px" }}>
                     <div style={{
                       padding: "8px 12px",
                       borderRadius: "4px",
                        backgroundColor: (() => {
                          if (disperseStatus.includes("Error")) return "#1b2a4a";
                          if (disperseStatus.includes("⚠️") || disperseStatus.includes("Token approval required")) return "#0b2d5c";
                          if (disperseStatus.includes("🔄") && disperseStatus.includes("network")) return "#0b2d5c";
                          return "#0f3b6d";
                        })(),
                        color: (() => {
                          if (disperseStatus.includes("Error")) return "#a8c7ff";
                          if (disperseStatus.includes("⚠️") || disperseStatus.includes("Token approval required")) return "#b4d4ff";
                          if (disperseStatus.includes("🔄") && disperseStatus.includes("network")) return "#b4d4ff";
                          return "#cfe4ff";
                        })(),
                       fontSize: "11px",
                       textAlign: "center",
                        position: "relative",
                        border: "1px solid #194a7a"
                     }}>
                       {isSwitchingNetwork && disperseStatus.includes("Switching") ? (
                         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                           <Spinner size={12} color={'#b4d4ff'} />
                           {disperseStatus}
                         </div>
                       ) : (
                         disperseStatus
                       )}
                        {(disperseStatus.includes("Error") || disperseStatus.includes("⚠️") || disperseStatus.includes("Token approval required") || (disperseStatus.includes("🔄") && disperseStatus.includes("network"))) && !isSwitchingNetwork && (
                         <button
                           onClick={() => {
                             setDisperseStatus('');
                             setNetworkSwitchError(null);
                           }}
                           style={{
                             position: "absolute",
                             top: "4px",
                             right: "8px",
                             background: "none",
                             border: "none",
                              color: "#b4d4ff",
                             cursor: "pointer",
                             fontSize: "14px",
                             fontWeight: "bold"
                           }}
                           title="Clear status"
                         >
                           ×
                         </button>
                       )}
                     </div>
                   </div>
                 )}

                 
          </div>

            </div>
          </div>






          <div
            className="shadow flex-col"
            style={{
              backgroundColor: "#002244",
              borderRadius: "15px",
              border: "1px solid #11447799",
              width: isMiniApp || isMobile ? "340px" : "100%",
              margin: "20px auto 0 auto"
            }}
          >
            <div
              className="shadow flex-row"
              style={{
                backgroundColor: "#11448888",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                borderRadius: "15px",
                margin: isImpactFilterCollapsed ? "0 0 0 0" : "0 0 10px 0",
                gap: "1rem",
                position: "relative"
              }}
            >
              <div
                className="flex-row"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  padding: "0px 0 0 4px",
                  margin: "0 0 0px 0"
                }}
              >
                <BsFillFunnelFill style={{ fill: "#cde" }} size={20} />
                <div>
                  <div
                    style={{
                      border: "0px solid #777",
                      padding: "2px",
                      borderRadius: "10px",
                      backgroundColor: "",
                      maxWidth: "fit-content",
                      cursor: "pointer",
                      color: "#cde"
                    }}
                  >
                    <div className="top-layer flex-row">
                      <div
                        className="flex-row"
                        style={{
                          padding: "4px 0 4px 10px",
                          marginBottom: "0px",
                          flexWrap: "wrap",
                          justifyContent: "flex-start",
                          gap: "0.00rem",
                          width: "",
                          alignItems: "center"
                        }}
                      >
                        <div
                          style={{
                            fontSize: isMobile ? "18px" : "22px",
                            fontWeight: "600",
                            color: "",
                            padding: "0px 3px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer"
                          }}
                          onClick={() => setIsImpactFilterCollapsed(!isImpactFilterCollapsed)}
                        >
                          <span>Impact Filter</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chevron positioned 10px from the right edge of the container */}
              <FaAngleDown 
                size={26} 
                style={{
                  transform: isImpactFilterCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.2s ease',
                  color: '#cde',
                  cursor: "pointer",
                  marginRight: "10px"
                }}
                onClick={() => setIsImpactFilterCollapsed(!isImpactFilterCollapsed)}
              />
            </div>

            {!isImpactFilterCollapsed && (<div
              className="flex-col"
              style={{
                backgroundColor: "#002244ff",
                padding: "10px 18px 12px 18px",
                borderRadius: "0 0 15px 15px",
                color: "#ace",
                fontSize: "12px",
                gap: "0.75rem",
                position: "relative"
              }}>

                {/* Filter Components */}
                {!isImpactFilterCollapsed && (
                  <div className={'flex-row'} style={{
                    justifyContent: 'center', 
                    marginTop: '5px', 
                    marginBottom: '0px', 
                    gap: '0.35rem', 
                    flexWrap: 'wrap',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}>
                    
                    {/* SORT Filter */}
                    {/* <div className='flex-row' style={{height: '42px', alignItems: 'center', justifyContent: 'center', padding: '28px 0'}}>
                      <div className='flex-row' style={{padding: '6px 11px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '28px', alignItems: 'center', gap: '0.35rem'}}>
                        <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '13px' : '14px'}}>SORT</div>

                        <div className={sortBy == 'down' ? 'filter-item-on' : 'filter-item'} style={{padding: '3px 8px 0px 8px'}} onClick={() => {updateOrder('down')}}><BiSortDown size={17} /></div>
                        <div className={sortBy == 'up' ? 'filter-item-on' : 'filter-item'} style={{padding: '3px 8px 0px 8px'}} onClick={() => {updateOrder('up')}}><BiSortUp size={17} /></div>
                        <div className={sortBy == 'shuffle' ? 'filter-item-on' : 'filter-item'} style={{padding: '3px 8px 0px 8px'}} onClick={() => {updateOrder('shuffle')}}><ShuffleIcon size={17} /></div>
                        <div className={sortBy == 'clock-forward' ? 'filter-item-on' : 'filter-item'} style={{padding: '3px 8px 0px 8px'}} onClick={() => {updateOrder('clock-forward')}}><ClockForward size={17} /></div>
                        <div className={sortBy == 'clock-back' ? 'filter-item-on' : 'filter-item'} style={{padding: '3px 8px 0px 8px'}} onClick={() => {updateOrder('clock-back')}}><ClockBack size={17} /></div>
                      </div>
                    </div> */}


                    {/* FUND Filter */}
                    <div className='flex-row' style={{height: '42px', alignItems: 'center', justifyContent: 'center', padding: '28px 0'}}>
                      <div className='flex-row' style={{padding: '6px 11px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '28px', alignItems: 'center', gap: '0.35rem'}}>
                        <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '13px' : '14px'}}>FUND</div>

                        <div className={fundPercent == 0 ? 'filter-item-on' : 'filter-item'} onClick={() => {setFundPercent(0)}} style={{fontSize: isMobile ? '13px' : '14px'}}>0%</div>
                        <div className={fundPercent == 10 ? 'filter-item-on' : 'filter-item'} onClick={() => {setFundPercent(10)}} style={{fontSize: isMobile ? '13px' : '14px'}}>10%</div>
                        <div className={fundPercent == 20 ? 'filter-item-on' : 'filter-item'} onClick={() => {setFundPercent(20)}} style={{fontSize: isMobile ? '13px' : '14px'}}>20%</div>
                        <div className={fundPercent == 30 ? 'filter-item-on' : 'filter-item'} onClick={() => {setFundPercent(30)}} style={{fontSize: isMobile ? '13px' : '14px'}}>30%</div>
                      </div>
                    </div>





                    {/* TIME Filter */}
                    <div className='flex-row' style={{height: '42px', alignItems: 'center', justifyContent: 'center', padding: '28px 0'}}>
                      <div className='flex-row' style={{padding: '6px 11px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '28px', alignItems: 'center', gap: '0.35rem'}}>
                        <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '13px' : '14px'}}>TIME</div>

                        <div className={timeframe == '24h' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('24h')}} style={{fontSize: isMobile ? '13px' : '14px'}}>24hr</div>
                        <div className={timeframe == '3d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('3d')}} style={{fontSize: isMobile ? '13px' : '14px'}}>3d</div>
                        <div className={timeframe == '7d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('7d')}} style={{fontSize: isMobile ? '13px' : '14px'}}>7d</div>
                        <div className={timeframe == '14d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('14d')}} style={{fontSize: isMobile ? '13px' : '14px'}}>14d</div>
                        <div className={timeframe == '30d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('30d')}} style={{fontSize: isMobile ? '13px' : '14px'}}>30d</div>
                        {/* <div className={timeframe == 'all' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('all')}} style={{fontSize: isMobile ? '13px' : '14px'}}>all</div> */}
                      </div>
                    </div>

                    {/* CHANNEL Filter */}
                    {!curatorId && (<div className='flex-row' style={{height: '42px', alignItems: 'center', justifyContent: 'center', padding: '28px 0'}}>
                      <div className='flex-row' style={{padding: '6px 11px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '28px', alignItems: 'center', gap: '0.35rem'}}>
                        <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '13px' : '14px'}}>CHANNEL</div>

                        <select value={selectedChannel} onChange={updateChannel} style={{backgroundColor: '#adf', borderRadius: '6px', padding: isMobile ? '2px 6px' : '2px', fontSize: isMobile ? '14px' : '17px', width: '100%', fontWeight: '600'}}>
                          {channelOptions.map((channel) => (
                            <option key={channel} value={channel}>
                              {(channel !== ' ') ? '/' + channel : channel}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>)}

                    {/* CURATORS Filter */}
                    {!curatorId && (<div className='flex-row' style={{height: '42px', alignItems: 'center', justifyContent: 'center', padding: '28px 0'}}>
                      <div className='flex-row' style={{padding: '6px 11px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '28px', alignItems: 'center', gap: '0.35rem'}}>
                        <div className='filter-desc' style={{fontSize: isMobile ? '13px' : '14px'}}>CURATORS</div>

                        <input
                          type="text"
                          value={curatorSearchInput}
                          onChange={e => getCuratorInput(e.target.value, null)}
                          style={{
                            backgroundColor: "#adf",
                            borderRadius: "6px",
                            padding: isMobile ? "2px 6px" : "2px 6px",
                            fontSize: isMobile ? "14px" : "17px",
                            width: "150px",
                            fontWeight: "600",
                            margin: "0 0 0 4px"
                          }}
                          placeholder="search curators"
                        />
                      </div>
                    </div>)}
                  </div>
                )}


                {/* Curators Search Results */}
                {!isImpactFilterCollapsed && curatorData?.length > 0 && (
                  <div style={{ padding: "0px 0 0 0" }}>
                    <div style={{textAlign: 'center', color: '#ace', fontSize: '14px', fontWeight: '600', marginBottom: '5px'}}>
                      Found {curatorsLength} curators
                    </div>
                    <div className="flex-row" style={{
                      width: "100%",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      color: "#024",
                      fontWeight: "600",
                      fontSize: "12px"}}>
                      {curatorData?.map((curator, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.25rem",
                            border: "0px solid #eeeeeeaa",
                            width: "auto",
                            margin: "7px 5px"
                          }}
                          onClick={() => updateCuratorSchedule(curator)}>
                          <div
                            className="cast-act-lt"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              borderRadius: "88px",
                              padding: "3px 10px 3px 3px",
                              width: "auto",
                              margin: "0 5px 0 0"
                            }}
                          >
                          {curator?.pfp && (
                            <img
                              src={curator?.pfp}
                              width={24}
                              height={24}
                              style={{
                                borderRadius: "80px",
                                border: "1px solid #eee",
                                backgroundColor: "#8363ca"
                              }}
                            />
                          )}
                          <div style={{ 
                            display: "flex", 
                            textAlign: "center", 
                            fontSize: "15px", 
                            margin: "0",
                            color: "#024",
                            fontWeight: "600"
                          }}>
                            {curator ? `@${curator?.username}` : " curator not found"}
                          </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Curators Display */}
                 {!isImpactFilterCollapsed && curatorList?.length > 0 && (
                   <div style={{ padding: "10px 0 0 0" }}>
                     <div style={{textAlign: 'center', color: '#ace', fontSize: '14px', fontWeight: '600', marginBottom: '5px'}}>
                       Selected Curators:
                     </div>
                     <div className="flex-row" style={{
                      width: "100%",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      color: "#024",
                      fontWeight: "600",
                      fontSize: "12px"}}>
                       {curatorList?.map((curator, index) => (
                         <div
                           key={index}
                           style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.25rem",
                            border: "0px solid #eeeeeeaa",
                            width: "auto",
                            margin: "7px 5px"
                           }}
                         >
                          <div
                            className="cast-act-lt"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              borderRadius: "88px",
                              padding: "3px 10px 3px 3px",
                              width: "auto",
                              margin: "0 5px 0 0"
                            }}
                          >
                            {curator?.pfp && (
                              <img
                                src={curator?.pfp}
                                width={24}
                                height={24}
                                style={{
                                  borderRadius: "80px",
                                  border: "1px solid #eee",
                                  backgroundColor: "#8363ca"
                                }}
                              />
                            )}
                            <div style={{ 
                              display: "flex",
                              textAlign: "center",
                              fontSize: "15px",
                              margin: "0",
                              padding: curator?.pfp ? "0" : "0 0 0 5px"
                            }}>
                              {curator ? `@${curator?.username}` : " curator not found"}
                            </div>

                            <div
                              style={{
                                position: "relative",
                                cursor: "pointer",
                                backgroundColor: "#a00",
                                borderRadius: "50%",
                                padding: '1px 4px 2px 4px',
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                color: "white",
                                fontWeight: "bold"
                              }}
                              onClick={() => {
                                // Remove specific curator from the list
                                const updatedCuratorList = curatorList.filter(c => c.fid !== curator.fid);
                                setCuratorList(updatedCuratorList);
                                
                                // Update userQuery with remaining curator FIDs
                                if (updatedCuratorList.length > 0) {
                                  const curatorFids = updatedCuratorList.map(c => c.fid);
                                  setUserQuery({
                                    ...userQuery,
                                    curators: curatorFids
                                  });
                                } else {
                                  setUserQuery({
                                    ...userQuery,
                                    curators: null
                                  });
                                }
                              }}
                            >
                              ×
                            </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}


            </div>)}
          </div>







          <div
            className="shadow flex-col"
            style={{
              backgroundColor: "#002244",
              borderRadius: "15px",
              border: "1px solid #11447799",
              width: isMiniApp || isMobile ? "340px" : "100%",
              margin: "20px auto 0 auto"
            }}
          >
            <div
              className="shadow flex-row"
              style={{
                backgroundColor: "#11448888",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                borderRadius: "15px",
                margin: "0 0 10px 0",
                gap: "1rem"
              }}
            >
              <div
                className="flex-row"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  padding: "0px 0 0 4px",
                  margin: "0 0 0px 0"
                }}
              >
                <BsCurrencyExchange style={{ fill: "#cde" }} size={20} />
                <div>
                  <div
                    style={{
                      border: "0px solid #777",
                      padding: "2px",
                      borderRadius: "10px",
                      backgroundColor: "",
                      maxWidth: "fit-content",
                      cursor: "pointer",
                      color: "#cde"
                    }}
                  >
                    <div className="top-layer flex-row">
                      <div
                        className="flex-row"
                        style={{
                          padding: "4px 0 4px 10px",
                          marginBottom: "0px",
                          flexWrap: "wrap",
                          justifyContent: "flex-start",
                          gap: "0.00rem",
                          width: "",
                          alignItems: "center"
                        }}
                      >
                        <div
                          style={{
                            fontSize: isMobile ? "18px" : "22px",
                            fontWeight: "600",
                            color: "",
                            padding: "0px 3px"
                          }}
                        >
                          Tip Distribution
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex-col"
              style={{
                backgroundColor: "#002244ff",
                padding: "10px 8px 12px 8px",
                borderRadius: "0 0 15px 15px",
                color: "#ace",
                fontSize: "12px",
                gap: "0.75rem",
                position: "relative"
              }}>
              {/* Loading Spinner for Tip Distribution */}
              {searchLoading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }}>
                  <Spinner size={24} color={'#9df'} />
                </div>
              )}
                             {/* Filter Components */}


                 {/* Distribution Preview - Shows how much each author gets */}
                 {creatorResults.length > 0 && (() => {
                   console.log('Distribution Preview Container - selectedToken:', selectedToken);
                   return (
                     <div style={{ 
                       padding: "5px 0 0 0", 
                      //  backgroundColor: "#001122", 
                       borderRadius: "10px", 
                      //  border: "1px solid #114477",
                       margin: "5px 0"
                     }}>

                     
                     <div style={{
                       maxHeight: "340px",
                       overflowY: "auto",
                       padding: "0"
                     }}>
                       {(() => {
                         // Calculate total impact sum for normalization
                         const totalImpactSum = creatorResults.reduce((sum, creator) => sum + (creator.impact_sum || 0), 0);
                         
                         // Calculate fund distribution
                         const fundAmount = fundPercent > 0 ? parseFloat(tipAmount) * fundPercent / 100 : 0;
                         const remainingAmount = tipAmount - fundAmount;
                         
                         console.log('Distribution Preview Debug:', {
                           tipAmount,
                           fundPercent,
                           fundAmount,
                           remainingAmount,
                           totalImpactSum,
                           creatorResults: creatorResults.length,
                           hasWallet: creatorResults.filter(c => c.wallet && c.wallet !== '').length
                         });
                         
                         // Show all creators even when tip amount is 0
                         if (totalImpactSum <= 0) {
                           return (
                             <div style={{ 
                               textAlign: 'center', 
                               color: '#999', 
                               fontSize: '12px',
                               fontStyle: 'italic',
                               padding: "20px"
                             }}>
                               No impact data available for distribution
                             </div>
                           );
                         }
                         
                         console.log('About to render creators with selectedToken:', selectedToken?.symbol || 'None');
                         
                         // Show fund allocation if fundPercent > 0
                         const fundDisplay = fundPercent > 0 ? (
                           <>
                             <div style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               padding: "8px 12px",
                               marginBottom: "8px",
                               backgroundColor: "#001122",
                               borderRadius: "12px",
                               border: "1px solid #114477",
                               borderColor: "#357"
                             }}>
                               <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                 {/* <div style={{
                                   width: "20px",
                                   height: "20px",
                                   borderRadius: "3px",
                                   backgroundColor: "#357",
                                   color: "#fff",
                                   fontSize: "10px",
                                   fontWeight: "bold",
                                   display: "flex",
                                   alignItems: "center",
                                   justifyContent: "center",
                                   flexShrink: 0
                                 }}>
                                   🏦
                                 </div> */}
                                 <span style={{ 
                                   color: "#9df", 
                                   fontSize: "14px", 
                                   fontWeight: "500" 
                                 }}>
                                   Fund Allocation ({fundPercent}%)
                                 </span>
                               </div>
                               <div style={{ 
                                 color: "#9df", 
                                 fontSize: "14px", 
                                 fontWeight: "600" 
                               }}>
                                 {fundAmount.toFixed(4)} {selectedToken?.symbol || 'Unknown'}
                               </div>
                             </div>
                             
                             {/* Fund allocation summary */}
                             {/* <div style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               padding: "6px 12px",
                               marginBottom: "8px",
                               backgroundColor: "#001122",
                               borderRadius: "8px",
                               border: "1px solid #334455",
                               fontSize: "11px",
                               color: "#999"
                             }}>
                               <span>Total: {tipAmount} {selectedToken?.symbol || 'Unknown'}</span>
                               <span>Fund: {fundAmount.toFixed(4)} ({fundPercent}%)</span>
                               <span>Creators: {remainingAmount.toFixed(4)} ({100 - fundPercent}%)</span>
                             </div> */}
                           </>
                         ) : null;
                         
                         return (
                           <>
                             {fundDisplay}
                             {creatorResults
                               .filter(creator => creator.wallet && creator.wallet !== '')
                               .sort((a, b) => (b.impact_sum || 0) - (a.impact_sum || 0)) // Sort by impact_sum descending
                               .map((creator, index) => {
                             // Calculate proportional amount based on impact_sum (using remaining amount after fund allocation)
                             const proportion = creator.impact_sum / totalImpactSum;
                             const calculatedAmount = remainingAmount > 0 ? remainingAmount * proportion : 0;
                             
                             return (
                               <div key={index} style={{
                                 display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                                 padding: "8px 12px",
                                 marginBottom: "8px",
                                 backgroundColor: "#001122",
                                 borderRadius: "12px",
                                 border: "1px solid #114477"
                               }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                   {/* Rank indicator */}
                                   <div style={{
                                     width: "20px",
                                     height: "20px",
                                     borderRadius: "3px",
                                    //  backgroundColor: "#114477",
                                     color: "#fff",
                                     fontSize: "10px",
                                     fontWeight: "bold",
                                     display: "flex",
                                     alignItems: "center",
                                     justifyContent: "center",
                                     flexShrink: 0
                                   }}>
                                     {index + 1}
                                   </div>
                                   
                                   {creator.author_pfp && (
                                     <img
                                       src={creator.author_pfp}
                                       width={24}
                                       height={24}
                                       style={{
                                         borderRadius: "50%",
                                         border: "1px solid #114477"
                                       }}
                                     />
                                   )}
                                   <span style={{ 
                                     color: "#ace", 
                                     fontSize: "14px", 
                                     fontWeight: "500" 
                                   }}>
                                     {creator.author_username || creator.author_fid || "Unknown"}
                                   </span>
                                 </div>
                                 <div style={{ 
                                   color: "#9df", 
                                   fontSize: "14px", 
                                   fontWeight: "600" 
                                 }}>
                                   {(() => {
                                     const amount = calculatedAmount;
                                     if (amount >= 1) {
                                       return amount.toFixed(2);
                                     } else {
                                       return amount.toFixed(4);
                                     }
                                   })()} {selectedToken?.symbol || 'Unknown'}
                                 </div>
                               </div>
                             );
                           })}
                         </>
                       );
                     })()}
                       {creatorResults.filter(c => c.wallet && c.wallet !== '').length === 0 && (
                         <div style={{ 
                           textAlign: 'center', 
                           color: '#999', 
                           fontSize: '12px',
                           fontStyle: 'italic'
                         }}>
                           No valid wallet addresses found
                         </div>
                       )}
                     </div>
                   </div>
                     );
                   })()}

                 {/* Found Creators Count - At Bottom */}
                 {creatorResults.length > 0 && (
                   <div style={{ padding: "0px 0 0 0", textAlign: 'center' }}>
                     <div style={{color: '#ace', fontSize: '14px', fontWeight: '600'}}>
                       Found {creatorResults.length} creators
                     </div>
                     <div style={{color: '#999', fontSize: '12px', textAlign: 'center', marginTop: '10px'}}>
                       Creator results will be displayed here
                     </div>
                   </div>
                 )}

            </div>
          </div>
        </div>
      </div>)}

      <div style={{ padding: "0 0 80px 0" }}>&nbsp;</div>

      <ExpandImg {...{ show: showPopup.open, closeImagePopup, embed: { showPopup }, screenWidth, screenHeight }} />
      <Modal modal={modal} />
    </div>
  );
}