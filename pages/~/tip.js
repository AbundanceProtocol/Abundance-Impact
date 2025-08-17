import { useRouter } from "next/router";
import { useRef, useContext, useEffect, useState } from "react";
import { useAccount, useWriteContract, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import Link from "next/link";
import axios from "axios";

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
import { useWallet } from "../../hooks/useWallet";
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
        const { sdk } = await import('@farcaster/miniapp-sdk');
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

export default function Tip() {
  const router = useRouter();
  const { ecosystem, username, app, userFid, pass, id } = router.query;
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
    getAllTokens
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
  const [shareModal, setShareModal] = useState({ on: false, id: null, amount: 0, token: '', receivers: 0 });
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
  const [approveOnlyAmount, setApproveOnlyAmount] = useState(false); // when true, approve only needed amount
  
  // Collapsible state for Impact Filter
  const [isImpactFilterCollapsed, setIsImpactFilterCollapsed] = useState(true);
  
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
  
  // Function to update selected token from WalletConnect
  const updateSelectedToken = (token) => {
    console.log('updateSelectedToken called with:', token);
    // Only clear non-error status when token changes
    if (disperseStatus && disperseStatus !== '' && !disperseStatus.includes('Error') && !disperseStatus.includes('⚠️')) {
      setDisperseStatus('');
    }
    setSelectedToken(token);
  };
  
  // Function to update tip amount from WalletConnect slider
  const updateTipAmount = (amount) => {
    console.log('updateTipAmount called with:', amount);
    setTipAmount(amount);
    // Only clear non-error status when slider changes
    if (disperseStatus && disperseStatus !== '' && !disperseStatus.includes('Error') && !disperseStatus.includes('⚠️')) {
      setDisperseStatus('');
    }
  };

  // Ensure tipAmount is synchronized with WalletConnect on mount
  useEffect(() => {
    // Initialize tipAmount to 0 to match the slider
    updateTipAmount(0);
  }, []);

  // Check token approval when selected token changes
  useEffect(() => {
    if (selectedToken && wagmiConnected && wagmiAddress && !selectedToken?.isNative) {
      // Only check approval for non-native tokens
      // Add a small delay to ensure wallet is fully connected
      const timer = setTimeout(() => {
        checkTokenApproval(true);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [selectedToken, wagmiConnected, wagmiAddress]);

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

      // Create OnchainTip document via API, then show share modal
      (async () => {
        try {
          const tipPayload = {
            tipper_fid: userInfo?.fid,
            tipper_pfp: userInfo?.pfp,
            tipper_username: userInfo?.username,
            tip: [{
              currency: pendingTxTokenSymbol || selectedToken?.symbol || 'Token',
              amount: Number(pendingTxTotalAmountDecimal || 0),
              value: Number(pendingTxTotalAmountDecimal || 0) * Number(selectedToken?.price || 0)
            }],
            receiver: pendingTxReceivers || [],
            transaction_hash: hash,
          };
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
          const receiversCount = (pendingTxReceivers || []).length;
          setShareImageLoaded(false);
          setShareImageError(false);
          setShareModal({
            on: true,
            id: createdId.toString(),
            amount: Number(pendingTxTotalAmountDecimal || 0),
            token: pendingTxTokenSymbol || selectedToken?.symbol || 'Token',
            receivers: receiversCount
          });
        } catch (e) {
          console.warn('Failed to persist OnchainTip:', e);
        }
      })();

      // Remember last success hash to prevent duplicate modal
      setLastSuccessHash(hash);
      // clear pending kind
      setPendingTxKind(null);
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
        const { sdk } = await import("@farcaster/miniapp-sdk");

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
        if (!str.includes(creator.username)) {
          if (str === "") {
            return "@" + creator.username;
          }
          if (index === arr.length - 1 && index !== 0) {
            return str + " & @" + creator.username + " ";
          }
          return str + ", @" + creator.username;
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
          tip?.curators[0]?.username
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
      const url = `https://impact.abundance.id/~/tip/${shareModal?.id}`;
      const text = `I multi-tipped ${formatShareAmount(shareModal?.amount)} $${shareModal?.token} to ${shareModal?.receivers} creators with /impact!`;
      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(url);
      const shareLink = `https://farcaster.xyz/~/compose?text=${encodedText}&embeds[]=${[encodedUrl]}`;

      const { sdk } = await import('@farcaster/miniapp-sdk');
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
        const { sdk } = await import('@farcaster/miniapp-sdk');
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
        const sortedData = response?.data?.users.sort((a, b) => a.username.localeCompare(b.username));
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
  const checkTokenApproval = async (force = false) => {
    if (!selectedToken || !wagmiConnected || !wagmiAddress || selectedToken?.isNative) {
      return; // No approval needed for native tokens
    }

    try {
      // Rate limit: skip if last check was too recent or a check is in flight, unless forced
      const now = Date.now();
      if (!force) {
        if (approvalCheckInFlightRef.current) {
          return;
        }
        if (now - lastApprovalCheckRef.current < APPROVAL_CHECK_COOLDOWN_MS) {
          return;
        }
        approvalCheckInFlightRef.current = true;
        lastApprovalCheckRef.current = now;
      }

      const tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
      
      // Check current allowance using publicClient.readContract (read-only operation)
      const allowanceResult = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [wagmiAddress, '0xD152f549545093347A162Dce210e7293f1452150'],
      });
      
      // If allowance is very low, show approval message
      if (allowanceResult < parseUnits('0.01', selectedToken?.decimals || 18)) {
        setDisperseStatus(`⚠️ Token approval required. Please approve ${selectedToken?.symbol} spending first.`);
      } else {
        // Clear any approval-related status
        if (disperseStatus && disperseStatus.includes('Token approval required')) {
          setDisperseStatus('');
        }
      }
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
    if (!selectedToken || !wagmiConnected || !wagmiAddress) {
      setDisperseStatus('Wallet not connected or no token selected');
      return;
    }

    try {
      setIsDispersing(true);
      setDisperseStatus('Approving token spending...');
      
      const tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
      
      // Determine approval amount: full (max) by default, or only needed amount if user checked
      let approvalAmount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      if (approveOnlyAmount) {
        try {
          // Recompute EXACT total needed (sum of per-recipient minimum-adjusted amounts)
          const tokenDecimals = (() => {
            if (selectedToken?.decimals !== undefined) return selectedToken.decimals;
            const tokenDecimalMap = { ETH: 18, USDC: 6, WETH: 18, DEGEN: 18, BETR: 18, NOICE: 18, TIPN: 18 };
            return tokenDecimalMap[selectedToken?.symbol] || 18;
          })();

          const getMinimumAmount = (decimals) => {
            switch (decimals) {
              case 6: return 0.000001;
              case 18: return 0.000000000000000001;
              default: return Math.pow(10, -decimals);
            }
          };

          const validCreators = (creatorResults || []).filter(creator => Boolean(creator.wallet) && (creator.impact_sum ?? 0) >= 0.000001);
          const selfFidStr = (fid !== undefined && fid !== null) ? String(fid) : null;
          const filteredCreators = selfFidStr ? validCreators.filter(c => String(c.author_fid ?? '') !== selfFidStr) : validCreators;
          const totalImpactSum = filteredCreators.reduce((sum, c) => sum + (c.impact_sum || 0), 0);
          if (filteredCreators.length === 0 || totalImpactSum <= 0) {
            throw new Error('No valid recipients to compute approval amount');
          }

          let totalUnits = 0n;
          const minAmt = getMinimumAmount(tokenDecimals);
          const tipAmt = Number(tipAmount || 0);
          for (const c of filteredCreators) {
            const calculatedAmount = (tipAmt * (c.impact_sum || 0)) / totalImpactSum;
            const finalAmount = Math.max(calculatedAmount, minAmt);
            const formattedAmount = Number(finalAmount).toFixed(tokenDecimals);
            const units = parseUnits(formattedAmount, tokenDecimals);
            totalUnits += units;
          }

          approvalAmount = totalUnits;
        } catch (e) {
          console.warn('Falling back to max approval; failed to compute needed approval amount:', e);
        }
      }
      
      // mark pending kind as approval
      setPendingTxKind('approval');
      const result = await writeContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: ['0xD152f549545093347A162Dce210e7293f1452150', approvalAmount],
      });
      
      console.log('Token approval initiated:', result);
      setDisperseStatus('Token approval sent! Waiting for confirmation...');
      
    } catch (error) {
      console.error('Token approval error:', error);
      setDisperseStatus(`Approval failed: ${error.message}`);
      setIsDispersing(false);
    }
    
    // After approval, proactively re-check allowance (force), so Multi-Tip becomes available immediately
    setTimeout(() => {
      checkTokenApproval(true);
    }, 1000);
  };

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

      // Check Wagmi wallet connection (same as used for token balances)
      if (!wagmiConnected || !wagmiAddress) {
        setDisperseStatus('Wallet not connected. Please connect your wallet first.');
        setIsDispersing(false);
        return;
      }

      // Check if user is on Base network (only network with disperse contract deployed)
      if (wagmiChainId !== 8453) {
        const networkNames = {
          42220: 'Celo',
          10: 'Optimism', 
          42161: 'Arbitrum'
        };
        const currentNetworkName = networkNames[wagmiChainId] || `Network ${wagmiChainId}`;
        
        setDisperseStatus(`⚠️ Multi-Tip is only available on Base network. Please switch from ${currentNetworkName} to Base to use this feature.`);
        setIsDispersing(false);
        return;
      }
      
      console.log('Operating on Base network - multi-tip functionality enabled');
      
      // Now begin transaction preparation after passing network checks
      setIsDispersing(true);
      setDisperseStatus('Preparing transaction...');
      
      // Validate that the selected token is available on Base
      const tokenNetworkKey = selectedToken?.networkKey;
      if (tokenNetworkKey && tokenNetworkKey !== 'base') {
        setDisperseStatus(`⚠️ Token ${selectedToken?.symbol} is not available on Base network. Please select a Base token to multi-tip.`);
        setIsDispersing(false);
        return;
      }

      // We'll calculate total impact after filtering valid creators below

      // Get token decimals from the actual token object (same as used in wallet display)
      const getTokenDecimals = (token) => {
        // If the token object has decimals property, use it
        if (token?.decimals !== undefined) {
          return token.decimals;
        }
        
        // Use the same mapping as defined in context.js for Base network tokens
        const tokenDecimalMap = {
          'ETH': 18,
          'USDC': 6,
          'WETH': 18,
          'DEGEN': 18,
          'BETR': 18,
          'NOICE': 18,
          'TIPN': 18
        };
        
        const decimals = tokenDecimalMap[token?.symbol] || 18;
        console.log(`Token ${token?.symbol} mapped to ${decimals} decimals`);
        return decimals;
      };

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
      console.log('- Wallet address:', wagmiAddress);
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
            args: [wagmiAddress],
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
            args: [wagmiAddress, '0xD152f549545093347A162Dce210e7293f1452150'],
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
        console.log('🔍 Native token detected - no approval needed');
      }

      // Use Wagmi's writeContract hook (as recommended by Farcaster docs)
      console.log('🚀 Calling writeContract...');
      
      // Capture disperse metadata at the moment we send the tx
      setPendingTxKind('disperse');
      setPendingTxTokenSymbol(selectedToken?.symbol || 'Token');

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

  // Trigger search when userQuery changes
  useEffect(() => {
    // Always trigger search when filters change, regardless of ecosystem
    console.log('userQuery changed, triggering search:', userQuery);
    feedRouter();
  }, [userQuery]);

  // Feed router to trigger searches when filters change
  function feedRouter() {
    const { shuffle, time, tags, channels, curators, order, timeSort } = userQuery;
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

  return (
    <div className="flex-col" style={{ width: "auto", position: "relative" }} ref={ref1}>
      <Head>
        <meta
          name="fc:frame"
          content={`{"version":"next","imageUrl":"${baseURL}/api/frames/tip/onchain-tip-v1?${qs.stringify({ id: id || null })}","button":{"title":"Onchain Multi-Tip","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id/~/tip","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}`}
        />

        {/* Mini App specific metadata */}
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id/~/tip" />
      </Head>

      {/* Custom Share Modal */}
      {shareModal.on && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2147483647, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#021326', border: '1px solid #11447799', borderRadius: '14px', width: 'min(680px, 96vw)', maxWidth: '96vw', color: '#cde', boxShadow: '0 8px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #11447755', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#9df', textAlign: 'center' }}>Congrats! You multi-tipped {shareModal.receivers} creators & curators!</div>
              <button onClick={() => { setShareModal({ on: false, id: null, amount: 0, token: '', receivers: 0 }); setShareImageLoaded(false); setShareImageError(false); }} style={{ background: 'transparent', border: 'none', color: '#9df', cursor: 'pointer', fontSize: '20px' }}>×</button>
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
                <button onClick={shareOnchainTip} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #abc', background: '#113355', color: '#cde', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Share</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <div className="" style={{padding: '58px 0 0 0'}}>
      </div> */}

      {(!isLogged || (version == "1.0" && !adminTest) || version == "2.0" || adminTest) && (
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
              backgroundColor: isLogged ? "#002244" : "#333",
              borderRadius: "15px",
              border: isLogged ? "1px solid #11447799" : "1px solid #555",
              width: isMiniApp || isMobile ? "340px" : "100%",
              margin: isMiniApp || isMobile ? "0px auto 0 auto" : "0px auto 0 auto"
            }}
          >
            <div
              className="shadow flex-row"
              style={{
                backgroundColor: isLogged ? "#11448888" : "#444",
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
                backgroundColor: isLogged ? "#002244ff" : "#333",
                padding: "10px 18px 12px 18px",
                borderRadius: "0 0 15px 15px",
                color: isLogged ? "#ace" : "#ddd",
                fontSize: "12px",
                gap: "0.75rem",
                position: "relative"
              }}>

              <div style={{ padding: "0 20px 5px 20px" }}>
                <WalletConnect onTipAmountChange={updateTipAmount} onTokenChange={updateSelectedToken} />

                {/* Approval prompt shown immediately when approval is required (independent of creators list) */}
                {isLogged && wagmiConnected && selectedToken && disperseStatus && disperseStatus.includes('Token approval required') && (
                  <div style={{ marginTop: "15px" }}>
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#9df" }}>
                          <input
                            type="checkbox"
                            checked={approveOnlyAmount}
                            onChange={(e) => setApproveOnlyAmount(e.target.checked)}
                          />
                          Approve only the amount to be dispersed
                        </label>
                      </div>
                      <button
                        onClick={approveToken}
                        disabled={isPending || isConfirming}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: isPending || isConfirming ? "#555" : "#007bff",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: isPending || isConfirming ? "not-allowed" : "pointer"
                        }}
                      >
                        {isPending || isConfirming ? "Approving..." : `Approve ${selectedToken?.symbol || 'Token'} Multi-Tip`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Disperse Button - Underneath the WalletConnect container */}
                {isLogged && creatorResults.length > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    {!(disperseStatus && disperseStatus.includes('Token approval required')) && (
                      <button
                        onClick={() => {
                          console.log('🔍 Multi-Tip button clicked!');
                          console.log('🔍 disperseTokens function:', typeof disperseTokens);
                          console.log('🔍 About to call disperseTokens...');
                          disperseTokens();
                        }}
                        disabled={isPending || isConfirming || !wagmiConnected || !tipAmount || wagmiChainId !== 8453}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: isPending || isConfirming || !wagmiConnected || !tipAmount || wagmiChainId !== 8453 ? "#555" : "#007bff",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: isPending || isConfirming || !wagmiConnected || !tipAmount || wagmiChainId !== 8453 ? "not-allowed" : "pointer"
                        }}
                      >
                        {isPending 
                         ? "Preparing..." 
                         : isConfirming 
                         ? "Confirming..." 
                         : wagmiChainId !== 8453
                         ? "Multi-Tip (Base Only)"
                         : `Multi-Tip ${selectedToken?.symbol || 'Token'}`}
                      </button>
                    )}
              </div>
                )}
                

                
                {/* Disperse Status */}
                 {isLogged && disperseStatus && (
                   <div style={{ marginTop: "15px" }}>
                     <div style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        backgroundColor: (() => {
                          if (disperseStatus.includes("Error")) return "#1b2a4a";
                          if (disperseStatus.includes("Token approval required")) return "#0b2d5c";
                          return "#0f3b6d";
                        })(),
                        color: (() => {
                          if (disperseStatus.includes("Error")) return "#a8c7ff";
                          if (disperseStatus.includes("Token approval required")) return "#b4d4ff";
                          return "#cfe4ff";
                        })(),
                        fontSize: "11px",
                        textAlign: "center",
                        position: "relative",
                        border: "1px solid #194a7a"
                      }}>
                        {disperseStatus}
                        {(disperseStatus.includes("Error") || disperseStatus.includes("Token approval required")) && (
                          <button
                            onClick={() => setDisperseStatus('')}
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
              backgroundColor: isLogged ? "#002244" : "#333",
              borderRadius: "15px",
              border: isLogged ? "1px solid #11447799" : "1px solid #555",
              width: isMiniApp || isMobile ? "340px" : "100%",
              margin: isMiniApp || isMobile ? "20px auto 0 auto" : "0px auto 0 auto"
            }}
          >
            <div
              className="shadow flex-row"
              style={{
                backgroundColor: isLogged ? "#11448888" : "#444",
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
                backgroundColor: isLogged ? "#002244ff" : "#333",
                padding: "10px 18px 12px 18px",
                borderRadius: "0 0 15px 15px",
                color: isLogged ? "#ace" : "#ddd",
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
                    gap: isMobile ? '0.35rem' : '0.35rem', 
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
                    <div className='flex-row' style={{height: '42px', alignItems: 'center', justifyContent: 'center', padding: '28px 0'}}>
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
                    </div>

                    {/* CURATORS Filter */}
                    <div className='flex-row' style={{height: '42px', alignItems: 'center', justifyContent: 'center', padding: '28px 0'}}>
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
                    </div>
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
              backgroundColor: isLogged ? "#002244" : "#333",
              borderRadius: "15px",
              border: isLogged ? "1px solid #11447799" : "1px solid #555",
              width: isMiniApp || isMobile ? "340px" : "100%",
              margin: isMiniApp || isMobile ? "20px auto 0 auto" : "0px auto 0 auto"
            }}
          >
            <div
              className="shadow flex-row"
              style={{
                backgroundColor: isLogged ? "#11448888" : "#444",
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
                backgroundColor: isLogged ? "#002244ff" : "#333",
                padding: "10px 8px 12px 8px",
                borderRadius: "0 0 15px 15px",
                color: isLogged ? "#ace" : "#ddd",
                fontSize: "12px",
                gap: "0.75rem",
                position: "relative"
              }}>

                             {/* Filter Components */}


                 {/* Distribution Preview - Shows how much each author gets */}
                 {isLogged && creatorResults.length > 0 && (() => {
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
                         
                         console.log('Distribution Preview Debug:', {
                           tipAmount,
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
                         
                         return creatorResults
                           .filter(creator => creator.wallet && creator.wallet !== '')
                           .sort((a, b) => (b.impact_sum || 0) - (a.impact_sum || 0)) // Sort by impact_sum descending
                           .map((creator, index) => {
                             // Calculate proportional amount based on impact_sum
                             const proportion = creator.impact_sum / totalImpactSum;
                             const calculatedAmount = tipAmount > 0 ? parseFloat(tipAmount) * proportion : 0;
                             
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
                           });
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