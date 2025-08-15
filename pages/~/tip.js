import { useRouter } from "next/router";
import { useRef, useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
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
    setUserInfo
  } = useContext(AccountContext);
  const ref1 = useRef(null);
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
  
  // Filter state variables
  const [timeframe, setTimeframe] = useState('3d');
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
    setSelectedToken(token);
  };
  
  // Function to update tip amount from WalletConnect slider
  const updateTipAmount = (amount) => {
    console.log('updateTipAmount called with:', amount);
    setTipAmount(amount);
  };

  // Ensure tipAmount is synchronized with WalletConnect on mount
  useEffect(() => {
    // Initialize tipAmount to 0 to match the slider
    updateTipAmount(0);
  }, []);

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
    setTimeframe(time);
    setUserQuery({
      ...userQuery,
      time: time
    });
  }

  function updateOrder(order) {
    console.log('updateOrder called with:', order);
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
  
  // Disperse tokens among creators based on impact_sum
  const disperseTokens = async () => {
    if (!creatorResults.length || !walletConnected) {
      setDisperseStatus("Please ensure wallet is connected and creators are loaded");
      return;
    }
    
    // Validate tipAmount
    if (!tipAmount || tipAmount <= 0) {
      setDisperseStatus("Please set a valid tip amount greater than 0");
      return;
    }
    
    // Check if tipAmount is reasonable (less than 1 million to avoid overflow)
    if (tipAmount > 1000000) {
      setDisperseStatus("Tip amount too large. Please use a smaller amount.");
      return;
    }
    

    
    // Calculate total impact sum for normalization
    const totalImpactSum = creatorResults.reduce((sum, creator) => sum + (creator.impact_sum || 0), 0);
    
    console.log('=== DISPERSE CALCULATION DEBUG ===');
    console.log('tipAmount:', tipAmount, 'type:', typeof tipAmount);
    console.log('selectedToken:', selectedToken);
    console.log('creatorResults:', creatorResults);
    console.log('totalImpactSum:', totalImpactSum);
    
    // Check if all impact_sum values are the same
    const uniqueImpactSums = [...new Set(creatorResults.map(c => c.impact_sum))];
    console.log('Unique impact_sum values:', uniqueImpactSums);
    if (uniqueImpactSums.length === 1) {
      console.warn('⚠️ All creators have the same impact_sum value! This will result in equal distribution.');
    }
    
    // Log the addresses and amounts that will receive tokens
    const recipients = creatorResults
      .filter(creator => creator.wallet && creator.wallet !== '')
      .map(creator => {
        // Calculate proportional amount based on impact_sum
        const proportion = creator.impact_sum / totalImpactSum;
        const calculatedAmount = parseFloat(tipAmount) * proportion;
        
        // Use a completely different approach to avoid overflow
        const tokenDecimals = selectedToken?.symbol === 'USDC' ? 6 : 18;
        
        // Calculate amount in smallest units using a safer method
        let amountInSmallestUnit;
        try {
          // For very small amounts, use a different approach
          if (calculatedAmount < 0.000001) {
            amountInSmallestUnit = '0';
          } else {
            // Use exponential notation to avoid large numbers
            const amountInScientific = calculatedAmount.toExponential(tokenDecimals);
            const [coefficient, exponent] = amountInScientific.split('e');
            
            // Convert to smallest unit by adjusting the exponent
            const adjustedExponent = parseInt(exponent) + tokenDecimals;
            
            if (adjustedExponent >= 0) {
              // Move decimal point right by adjustedExponent places
              const coefficientNum = parseFloat(coefficient);
              const multiplier = Math.pow(10, adjustedExponent);
              
              // Check if this will create a safe number
              if (multiplier <= Number.MAX_SAFE_INTEGER && coefficientNum * multiplier <= Number.MAX_SAFE_INTEGER) {
                amountInSmallestUnit = Math.floor(coefficientNum * multiplier).toString();
              } else {
                // Fallback: use string manipulation for very large numbers
                const calculatedAmountStr = calculatedAmount.toFixed(tokenDecimals);
                const [wholePart, decimalPart = ''] = calculatedAmountStr.split('.');
                const paddedDecimal = (decimalPart + '0'.repeat(tokenDecimals)).slice(0, tokenDecimals);
                amountInSmallestUnit = (wholePart + paddedDecimal).replace(/^0+/, '') || '0';
              }
            } else {
              amountInSmallestUnit = '0';
            }
          }
          
        } catch (error) {
          console.warn(`Failed to calculate amount for ${creator.wallet}, using fallback:`, error);
          amountInSmallestUnit = '0';
        }
        
        // Additional safety check - ensure the amount is a reasonable string length
        if (amountInSmallestUnit.length > 20) {
          console.warn(`Amount string too long for ${creator.wallet}, truncating:`, amountInSmallestUnit);
          amountInSmallestUnit = amountInSmallestUnit.slice(0, 20);
        }
        
        // Debug logging
        console.log(`Creator ${creator.wallet}: impact_sum=${creator.impact_sum}, proportion=${proportion}, calculatedAmount=${calculatedAmount}, amountInSmallestUnit=${amountInSmallestUnit}`);
        console.log(`  - impact_sum type: ${typeof creator.impact_sum}, value: ${creator.impact_sum}`);
        console.log(`  - proportion type: ${typeof proportion}, value: ${proportion}`);
        console.log(`  - calculatedAmount type: ${typeof calculatedAmount}, value: ${calculatedAmount}`);
        console.log(`  - amountInSmallestUnit type: ${typeof amountInSmallestUnit}, value: ${amountInSmallestUnit}`);
        
        return {
          address: creator.wallet,
          amount: amountInSmallestUnit
        };
      });
    
            console.log(`Disperse Preview: ${tipAmount} ${selectedToken?.symbol || 'Unknown'} distributed proportionally to ${recipients.length} addresses:`, recipients);
    
    setIsDispersing(true);
    setDisperseStatus("Preparing disperse transaction...");
    
    try {
      // Calculate total impact sum for normalization
      const totalImpactSum = creatorResults.reduce((sum, creator) => sum + (creator.impact_sum || 0), 0);
      
      if (totalImpactSum === 0) {
        setDisperseStatus("No impact data available for distribution");
        setIsDispersing(false);
        return;
      }

      if (recipients.length === 0) {
        setDisperseStatus("No valid recipients found");
        setIsDispersing(false);
        return;
      }
      
      setDisperseStatus(`Dispersing to ${recipients.length} recipients...`);
      
      // Import ethers for contract interaction - ensure we get v5
      let ethers;
      try {
        // Try multiple import methods to ensure we get the right version
        const ethersModule = await import('ethers');
        if (ethersModule.ethers) {
          ethers = ethersModule.ethers;
        } else if (ethersModule.default) {
          ethers = ethersModule.default;
        } else {
          ethers = ethersModule;
        }
        
        // Verify we have the Interface constructor
        if (!ethers.utils?.Interface && !ethers.Interface) {
          throw new Error('Interface constructor not found in ethers module');
        }
        
        console.log('Successfully imported ethers:', {
          hasUtils: !!ethers.utils,
          hasInterface: !!ethers.Interface,
          hasUtilsInterface: !!ethers.utils?.Interface
        });
        
      } catch (error) {
        console.error('Failed to import ethers:', error);
        setDisperseStatus('Error: Failed to load ethers library');
        setIsDispersing(false);
        return;
      }
      
      // Disperse contract ABI - just the disperseToken function
      const disperseABI = [
        "function disperseToken(address token, address[] recipients, uint256[] values) external"
      ];
      
      const disperseContractAddress = "0xD152f549545093347A162Dce210e7293f1452150";
      
      // Debug ethers version and Interface availability
      console.log('ethers object:', ethers);
      console.log('ethers.utils:', ethers.utils);
      console.log('ethers.Interface:', ethers.Interface);
      
      // Test if we can create a simple interface
      try {
        const testInterface = new (ethers.utils?.Interface || ethers.Interface)(['function test()']);
        console.log('✅ Interface creation test successful');
      } catch (error) {
        console.error('❌ Interface creation test failed:', error);
        setDisperseStatus('Error: Interface creation failed');
        setIsDispersing(false);
        return;
      }
      
      let disperseInterface;
      try {
        if (ethers.utils && ethers.utils.Interface) {
          disperseInterface = new ethers.utils.Interface(disperseABI);
        } else if (ethers.Interface) {
          disperseInterface = new ethers.Interface(disperseABI);
        } else {
          throw new Error('Interface constructor not found in ethers');
        }
      } catch (error) {
        console.error('Failed to create Interface:', error);
        setDisperseStatus('Error: Failed to create contract interface');
        setIsDispersing(false);
        return;
      }
      
      // Validate amounts before encoding
      const validRecipients = recipients.filter(r => {
        const amount = parseFloat(r.amount);
        if (isNaN(amount) || amount <= 0) {
          console.warn(`Invalid amount for ${r.address}: ${r.amount}`);
          return false;
        }
        
        // Check if amount is within safe range (much more reasonable limit)
        if (amount > 1000000000000000) { // 1 quadrillion as a reasonable upper limit
          console.warn(`Amount too large for ${r.address}: ${r.amount}, using fallback`);
          // Use a fallback amount that's safe
          r.amount = '1000000'; // 1 token unit as fallback
        }
        
        // Additional check for extremely long strings
        if (r.amount.length > 20) {
          console.warn(`Amount string too long for ${r.address}, truncating`);
          r.amount = r.amount.slice(0, 20);
        }
        
        return true;
      });
      
      if (validRecipients.length === 0) {
        setDisperseStatus("No valid amounts found for distribution");
        setIsDispersing(false);
        return;
      }
      
      console.log('Valid recipients for disperse:', validRecipients);
      console.log('Amount analysis:', validRecipients.map(r => ({
        address: r.address.slice(0, 10) + '...',
        amount: r.amount,
        amountAsNumber: parseFloat(r.amount),
        isLarge: parseFloat(r.amount) > 1000000000000000
      })));
      
      // Prepare disperseToken parameters
      const tokenAddress = selectedToken?.address || selectedToken?.contractAddress;
      const recipientAddresses = validRecipients.map(r => r.address);
      const recipientAmounts = validRecipients.map(r => r.amount);
      
      // Update status to show disperse is ready
      setDisperseStatus(`Ready to disperse ${tipAmount} ${selectedToken?.symbol || 'Token'} to ${recipientAddresses.length} addresses`);
      
      // Encode function data for disperseToken
      const functionData = disperseInterface.encodeFunctionData("disperseToken", [
        tokenAddress,
        recipientAddresses,
        recipientAmounts
      ]);
      
      // Check if user is on Base network (handle both decimal and hex chain IDs)
      const isBaseNetwork = walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453;
      
      if (!isBaseNetwork) {
        console.log('Current network:', walletChainId);
        console.log('Required network: 0x2105 (Base) or 8453 (Base)');
        throw new Error(`Please switch to Base network to use this feature. Current network: ${walletChainId || 'Unknown'}`);
      }
      
      // Debug wallet provider information
      console.log('Wallet Provider Debug Info:', {
        walletProvider: walletProvider,
        walletConnected: walletConnected,
        walletAddress: walletAddress,
        walletChainId: walletChainId,
        hasRequest: walletProvider && typeof walletProvider.request === 'function',
        hasSend: walletProvider && typeof walletProvider.send === 'function',
        hasSendAsync: walletProvider && typeof walletProvider.sendAsync === 'function',
        windowEthereum: !!window.ethereum,
        hasWindowEthereumRequest: window.ethereum && typeof window.ethereum.request === 'function'
      });
      
      // Check if wallet is properly connected
      if (!walletConnected || !walletAddress) {
        console.error('Wallet connection check failed:', {
          walletConnected,
          walletAddress: walletAddress ? 'Present' : 'Missing'
        });
        
        // Try to get wallet address from any available provider
        let detectedAddress = null;
        let detectedChainId = null;
        
        // Check if we're in a Farcaster environment
        if (typeof window !== 'undefined' && window.farcasterEthProvider) {
          console.log('🔄 Farcaster wallet detected but not connected. Attempting auto-connection...');
          try {
            // Try to auto-connect to Farcaster wallet
            const accounts = await window.farcasterEthProvider.request({ method: 'eth_requestAccounts' });
            detectedAddress = accounts[0];
            detectedChainId = await window.farcasterEthProvider.request({ method: 'eth_chainId' });
            
            if (detectedAddress && detectedChainId) {
              console.log('✅ Farcaster wallet auto-connected:', { address: detectedAddress, chainId: detectedChainId });
              // Update the context state
              setWalletAddress(detectedAddress);
              setWalletChainId(detectedChainId);
              setWalletProvider('farcaster');
              setWalletConnected(true);
            }
          } catch (autoConnectError) {
            console.error('❌ Farcaster wallet auto-connection failed:', autoConnectError);
          }
        }
        
        // If Farcaster failed, try MetaMask
        if (!detectedAddress && typeof window !== 'undefined' && window.ethereum) {
          console.log('🔄 MetaMask detected but not connected. Attempting auto-connection...');
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            detectedAddress = accounts[0];
            detectedChainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (detectedAddress && detectedChainId) {
              console.log('✅ MetaMask auto-connected:', { address: detectedAddress, chainId: detectedChainId });
              // Update the context state
              setWalletAddress(detectedAddress);
              setWalletChainId(detectedChainId);
              setWalletProvider('metamask');
              setWalletConnected(true);
            }
          } catch (metamaskError) {
            console.error('❌ MetaMask auto-connection failed:', metamaskError);
          }
        }
        
        // If still no address, throw error
        if (!detectedAddress) {
          throw new Error('No wallet could be auto-connected. Please ensure your wallet is connected and try again.');
        }
      }
      
      // Additional check: If we're using Farcaster wallet, verify it supports transactions
      if (walletProvider === 'farcaster' && window.farcasterEthProvider) {
        console.log('🔍 Checking Farcaster wallet transaction support...');
        const farcasterMethods = Object.getOwnPropertyNames(window.farcasterEthProvider);
        const farcasterPrototypeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(window.farcasterEthProvider));
        console.log('Farcaster wallet methods:', farcasterMethods);
        console.log('Farcaster wallet prototype methods:', farcasterPrototypeMethods);
        
        // Check if any transaction-related methods exist
        const hasTransactionMethod = farcasterMethods.some(method => 
          method.toLowerCase().includes('transaction') || 
          method.toLowerCase().includes('send') ||
          method.toLowerCase().includes('request')
        );
        
        if (!hasTransactionMethod) {
          console.warn('⚠️ Farcaster wallet may not support transactions. Available methods:', farcasterMethods);
        }
      }
      
      // Log the actual wallet provider object for debugging
      console.log('Full wallet provider object:', walletProvider);
      console.log('Wallet provider type:', typeof walletProvider);
      console.log('Wallet provider constructor:', walletProvider.constructor?.name);
      
      // Enhanced wallet detection - try to find any available wallet provider
      let availableWalletProvider = null;
      let availableWalletAddress = null;
      
      console.log('🔍 Wallet Detection Debug:');
      console.log('- walletProvider type:', typeof walletProvider, 'value:', walletProvider);
      console.log('- window.farcasterEthProvider:', !!window.farcasterEthProvider);
      console.log('- window.ethereum:', !!window.ethereum);
      
      // Check for Farcaster wallet first
      if (typeof window !== 'undefined' && window.farcasterEthProvider) {
        console.log('🎯 Farcaster wallet detected in window object');
        console.log('🔍 Farcaster wallet object:', window.farcasterEthProvider);
        console.log('🔍 Farcaster wallet methods:', Object.getOwnPropertyNames(window.farcasterEthProvider));
        availableWalletProvider = window.farcasterEthProvider;
        availableWalletAddress = walletAddress || detectedAddress; // Use existing or detected address
      }
      // Check for MetaMask/window.ethereum
      else if (typeof window !== 'undefined' && window.ethereum) {
        console.log('🔗 MetaMask/window.ethereum detected');
        console.log('🔍 MetaMask wallet object:', window.ethereum);
        console.log('🔍 MetaMask wallet methods:', Object.getOwnPropertyNames(window.ethereum));
        availableWalletProvider = window.ethereum;
        availableWalletAddress = walletAddress || detectedAddress; // Use existing or detected address
      }
      // Check for context wallet provider - but only if it's actually an object
      else if (walletProvider && typeof walletProvider === 'object' && walletProvider !== null) {
        console.log('📱 Context wallet provider detected (object)');
        console.log('🔍 Context wallet object:', walletProvider);
        console.log('🔍 Context wallet methods:', Object.getOwnPropertyNames(walletProvider));
        availableWalletProvider = walletProvider;
        availableWalletAddress = walletAddress || detectedAddress;
      }
      // If walletProvider is just a string identifier, try to find the actual provider
      else if (walletProvider && typeof walletProvider === 'string') {
        console.log('📱 Context wallet provider is string identifier:', walletProvider);
        
        // Try to find the actual provider based on the identifier
        if (walletProvider === 'farcaster' && window.farcasterEthProvider) {
          console.log('🎯 Found Farcaster provider from identifier');
          availableWalletProvider = window.farcasterEthProvider;
          availableWalletAddress = walletAddress || detectedAddress;
        } else if (walletProvider === 'metamask' && window.ethereum) {
          console.log('🔗 Found MetaMask provider from identifier');
          availableWalletProvider = window.ethereum;
          availableWalletAddress = walletAddress || detectedAddress;
        } else {
          console.log('⚠️ String identifier found but no matching provider available');
        }
      }
      
      if (!availableWalletProvider) {
        console.error('🚨 No wallet provider found in detection logic');
        console.error('Debug info:');
        console.error('- window.farcasterEthProvider:', !!window.farcasterEthProvider);
        console.error('- window.ethereum:', !!window.ethereum);
        console.error('- walletProvider:', !!walletProvider);
        console.error('- walletProvider type:', typeof walletProvider);
        throw new Error('No wallet provider found. Please ensure you have a wallet installed and connected.');
      }
      
      // Log what we actually detected
      console.log('🔍 Detected Provider Analysis:');
      console.log('- Provider type:', typeof availableWalletProvider);
      console.log('- Provider constructor:', availableWalletProvider?.constructor?.name);
      console.log('- Provider methods:', Object.getOwnPropertyNames(availableWalletProvider));
      console.log('- Provider prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(availableWalletProvider) || {}));
      
      // Transaction method check removed to avoid duplicate variable declaration
      
      console.log('✅ Using wallet provider:', availableWalletProvider);
      console.log('✅ Using wallet address:', availableWalletAddress);
      console.log('🔍 availableWalletProvider type:', typeof availableWalletProvider);
      console.log('🔍 availableWalletProvider constructor:', availableWalletProvider?.constructor?.name);
      console.log('🔍 availableWalletProvider methods:', Object.getOwnPropertyNames(availableWalletProvider || {}));
      
      // Transaction method check is now done in the detection logic above
      
      // Send transaction using multiple wallet interaction methods
      let tx;
      try {
        // Method 1: Try the detected wallet provider first
        if (availableWalletProvider) {
          console.log('🎯 Using detected wallet provider:', availableWalletProvider);
          
          // Check what methods are available on the wallet provider
          const walletMethods = Object.getOwnPropertyNames(availableWalletProvider);
          const walletPrototypeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(availableWalletProvider));
          console.log('Wallet provider available methods:', walletMethods);
          console.log('Wallet provider prototype methods:', walletPrototypeMethods);
          
          // Find the best transaction method for the wallet provider
          let walletTxMethod = null;
          let walletTxParams = null;
          
          // Look for transaction-related methods in order of preference
          if (typeof availableWalletProvider.sendTransaction === 'function') {
            walletTxMethod = 'sendTransaction';
            walletTxParams = {
              to: disperseContractAddress,
              data: functionData,
              from: availableWalletAddress,
              value: '0x0',
              chainId: '0x2105'
            };
          } else if (typeof availableWalletProvider.send === 'function') {
            walletTxMethod = 'send';
            walletTxParams = ['eth_sendTransaction', [{
              to: disperseContractAddress,
              data: functionData,
              from: availableWalletAddress,
              value: '0x0',
              chainId: '0x2105'
            }]];
          } else if (typeof availableWalletProvider.request === 'function') {
            walletTxMethod = 'request';
            walletTxParams = {
              method: 'eth_sendTransaction',
              params: [{
                to: disperseContractAddress,
                data: functionData,
                from: availableWalletAddress,
                value: '0x0',
                chainId: '0x2105'
              }]
            };
          } else if (typeof availableWalletProvider.sendAsync === 'function') {
            walletTxMethod = 'sendAsync';
            walletTxParams = {
              method: 'eth_sendTransaction',
              params: [{
                to: disperseContractAddress,
                data: functionData,
                from: availableWalletAddress,
                value: '0x0',
                chainId: '0x2105'
              }],
              from: availableWalletAddress,
              id: Date.now()
            };
          }
          
          if (walletTxMethod) {
            console.log(`🎯 Wallet provider using method: ${walletTxMethod}`);
            try {
              if (walletTxMethod === 'sendTransaction') {
                tx = await availableWalletProvider.sendTransaction(walletTxParams);
              } else if (walletTxMethod === 'send') {
                tx = await availableWalletProvider.send(...walletTxParams);
              } else if (walletTxMethod === 'request') {
                tx = await availableWalletProvider.request(walletTxParams);
              } else if (walletTxMethod === 'sendAsync') {
                tx = await new Promise((resolve, reject) => {
                  availableWalletProvider.sendAsync(walletTxParams, (error, response) => {
                    if (error) reject(error);
                    else resolve(response.result);
                  });
                });
              }
            } catch (walletError) {
              console.error('❌ All wallet provider methods failed:', walletError);
              console.log('🔄 Falling back to other wallet methods...');
              // Continue to next method instead of throwing
            }
          } else {
            console.log('⚠️ No transaction methods found on wallet provider, trying other methods...');
          }
        }
                // Method 2: Try walletProvider.request (MetaMask style) - ONLY if availableWalletProvider failed
        if (!tx && availableWalletProvider !== walletProvider && walletProvider && typeof walletProvider.request === 'function') {
          console.log('🔄 Fallback: Using walletProvider.request method');
          try {
            tx = await walletProvider.request({
              method: 'eth_sendTransaction',
              params: [{
                to: disperseContractAddress,
                data: functionData,
                from: walletAddress,
                value: '0x0', // No ETH sent, only tokens
                chainId: '0x2105'
              }]
            });
          } catch (error) {
            console.log('❌ walletProvider.request failed:', error.message);
          }
        }
        // Method 3: Try window.ethereum (fallback for MetaMask) - ONLY if availableWalletProvider failed
        if (!tx && availableWalletProvider !== window.ethereum && window.ethereum && typeof window.ethereum.request === 'function') {
          console.log('🔄 Fallback: Using window.ethereum.request method');
          try {
            tx = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [{
                to: disperseContractAddress,
                data: functionData,
                from: walletAddress,
                value: '0x0',
                chainId: '0x2105'
              }]
            });
          } catch (error) {
            console.log('❌ window.ethereum.request failed:', error.message);
          }
        }
        // Method 4: Try walletProvider.send (WalletConnect style) - ONLY if availableWalletProvider failed
        if (!tx && availableWalletProvider !== walletProvider && walletProvider && typeof walletProvider.send === 'function') {
          console.log('🔄 Fallback: Using walletProvider.send method');
          try {
            tx = await walletProvider.send('eth_sendTransaction', [{
              to: disperseContractAddress,
              data: functionData,
              from: walletAddress,
              value: '0x0',
              chainId: '0x2105'
            }]);
          } catch (error) {
            console.log('❌ walletProvider.send failed:', error.message);
          }
        }
        // Method 5: Try walletProvider.sendAsync (legacy) - ONLY if availableWalletProvider failed
        if (!tx && availableWalletProvider !== walletProvider && walletProvider && typeof walletProvider.sendAsync === 'function') {
          console.log('🔄 Fallback: Using walletProvider.sendAsync method');
          try {
            tx = await new Promise((resolve, reject) => {
              walletProvider.sendAsync({
                method: 'eth_sendTransaction',
                params: [{
                  to: disperseContractAddress,
                  data: functionData,
                  from: walletAddress,
                  value: '0x0',
                  chainId: '0x2105'
                }],
                from: walletAddress,
                id: Date.now()
              }, (error, response) => {
                if (error) reject(error);
                else resolve(response.result);
              });
            });
          } catch (error) {
            console.log('❌ walletProvider.sendAsync failed:', error.message);
          }
        }
        // Method 6: Try to detect any available wallet provider
        if (!tx) {
          console.log('🚨 No standard methods found, trying to detect available wallet...');
          
          // Try to find any available wallet provider
          let availableProvider = null;
          
          // Check if we have any provider-like object
          if (walletProvider) {
            console.log('walletProvider object keys:', Object.keys(walletProvider));
            console.log('walletProvider prototype:', Object.getPrototypeOf(walletProvider));
            
            // Try to find any method that might work
            for (const key in walletProvider) {
              if (typeof walletProvider[key] === 'function') {
                console.log(`Found method: ${key}`);
                if (key.toLowerCase().includes('request') || key.toLowerCase().includes('send') || key.toLowerCase().includes('transaction')) {
                  availableProvider = { method: key, provider: walletProvider };
                  break;
                }
              }
            }
          }
          
          if (availableProvider) {
            console.log(`🔄 Trying custom method: ${availableProvider.method}`);
            try {
              if (availableProvider.method === 'request') {
                tx = await availableProvider.provider.request({
                  method: 'eth_sendTransaction',
                  params: [{
                    to: disperseContractAddress,
                    data: functionData,
                    from: walletAddress,
                    value: '0x0',
                    chainId: '0x2105'
                  }]
                });
              } else if (availableProvider.method === 'sendTransaction') {
                tx = await availableProvider.provider.sendTransaction({
                  to: disperseContractAddress,
                  data: functionData,
                  from: walletAddress,
                  value: '0x0',
                  chainId: '0x2105'
                });
              } else {
                tx = await availableProvider.provider[availableProvider.method]('eth_sendTransaction', [{
                  to: disperseContractAddress,
                  data: functionData,
                  from: walletAddress,
                  value: '0x0',
                  chainId: '0x2105'
                }]);
              }
            } catch (customError) {
              console.log(`❌ Custom method ${availableProvider.method} failed:`, customError.message);
              // Don't throw here, let it continue to the final check
            }
          }
          
          // If we still don't have a transaction, log detailed debug info
          if (!tx) {
            console.error('🚨 All wallet methods failed. Debug info:');
            console.error('- availableWalletProvider:', availableWalletProvider);
            console.error('- walletProvider:', walletProvider);
            console.error('- window.ethereum:', !!window.ethereum);
            console.error('- window.farcasterEthProvider:', !!window.farcasterEthProvider);
            console.error('- availableProvider found:', !!availableProvider);
          }
        }
        
        // Check if we successfully got a transaction
        if (!tx) {
          throw new Error('No wallet method was able to send the transaction. Please check your wallet connection and try again.');
        }
        
        console.log('Transaction sent successfully:', tx);
        setDisperseStatus(`Transaction sent! Hash: ${tx}`);
        
      } catch (txError) {
        console.error('Transaction failed:', txError);
        throw new Error(`Transaction failed: ${txError.message}`);
      }
      
    } catch (error) {
      console.error('Disperse error:', error);
      setDisperseStatus(`Error: ${error.message}`);
    } finally {
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
          content='{"version":"next","imageUrl":"https://impact.abundance.id/images/icon-02.png","button":{"title":"Check Rewards","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id/~/rewards","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}'
        />

        {/* Mini App specific metadata */}
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id/~/rewards" />
      </Head>

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

      {/* AUTO FUND */}

      {1 == 2 && (<div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>
        {((version == "1.0" && !adminTest) || version == "2.0" || adminTest) && (
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
                            Tip
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex-row"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                  ></div>
                </div>

                {/* <ToggleSwitch target={'autoFund'} /> */}
              </div>

              <div
                className="flex-col"
                style={{
                  backgroundColor: isLogged ? "#002244ff" : "#333",
                  padding: "0px 18px 12px 18px",
                  borderRadius: "0 0 15px 15px",
                  color: isLogged ? "#ace" : "#ddd",
                  fontSize: "12px",
                  gap: "0.75rem",
                  position: "relative"
                }}
              >
                <div
                  className="flex-row"
                  style={{
                    color: "#9df",
                    width: "100%",
                    fontSize: isMobile ? "15px" : "17px",
                    padding: "10px 10px 15px 10px",
                    justifyContent: "center",
                    userSelect: "none"
                  }}
                >
                  Check your Impact Rewards
                </div>

                <div
                  className="flex-col"
                  style={{
                    fontSize: "13px",
                    justifyContent: isMobile ? "center" : "center",
                    alignItems: "center",
                    gap: "1.75rem",
                    margin: "0px 0 20px 0",
                    flexWrap: "wrap",
                    width: "100%",
                    padding: "0 18px 10px 18px"
                  }}
                >
                  {/* DAILY REWARDS */}

                  <div
                    className={`flex-col btn-select blu-drk shadow`}
                    style={{
                      minWidth: isMobile ? "135px" : "130px",
                      color: "#cde",
                      height: "120px",
                      width: "100%",
                      cursor: "default"
                    }}
                  >
                    <div
                      className="flex-row"
                      style={{ justifyContent: "center", alignItems: "center", gap: "0.75rem" }}
                    >
                      <div style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 5px 0", color: "#44aaff" }}>
                        Daily Rewards
                      </div>
                    </div>

                    {dailyLoading ? (
                      <div
                        className="flex-col"
                        style={{
                          height: "100%",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "center",
                          padding: "0 20px"
                        }}
                      >
                        <Spinner size={28} color={"#468"} />
                      </div>
                    ) : (
                      <div
                        className="flex-col"
                        style={{ justifyContent: "center", alignItems: "center", gap: "0.25rem", padding: "8px" }}
                      >
                        <div
                          className="flex-row"
                          style={{ justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                        >
                          <div style={{ fontSize: "21px", fontWeight: "700" }}>
                            {dailyRewards?.degen_total > 0 ? Math.floor(dailyRewards?.degen_total || 0) : "--"}
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "400", color: "#8cf" }}>$DEGEN</div>
                        </div>
                      </div>
                    )}

                    <div className="flex-row" style={{ alignContent: "center", alignItems: "center", gap: "0.25rem" }}>
                      <div
                        className={`flex-row ${
                          dailyLoading
                            ? "btn-off"
                            : dailyRewards?.degen_total > 0 && dailyRewards?.claimed == false
                            ? "btn-act"
                            : dailyRewards?.degen_total > 0 && dailyRewards?.claimed == true
                            ? "btn-on"
                            : "btn-off"
                        }`}
                        style={{
                          borderRadius: "8px",
                          padding: "2px 5px",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.25rem",
                          margin: "5px 0 2px 0",
                          cursor:
                            dailyRewards?.degen_total > 0 && dailyRewards?.claimed == false ? "pointer" : "default"
                        }}
                        onClick={event => {
                          if (dailyRewards?.degen_total > 0 && dailyRewards?.claimed == false) {
                            claimReward(event, dailyRewards);
                          } else if (!isLogged) {
                            LoginPopup();
                          }
                        }}
                      >
                        <p
                          style={{
                            padding: "0 2px",
                            fontSize: "15px",
                            fontWeight: "500",
                            textWrap: "nowrap"
                          }}
                        >
                          {dailyLoading
                            ? "Loading..."
                            : dailyRewards?.degen_total > 0 && dailyRewards?.claimed == false
                            ? "Claim"
                            : dailyRewards?.degen_total > 0 && dailyRewards?.claimed == true
                            ? "Claimed"
                            : "Check Score"}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "0px 5px",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "4px 0 -2px 0",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          getDailyRewards(fid);
                          getTotalClaims(fid);
                        }}
                      >
                        <Refresh className="" color={"#0077bf"} size={20} />
                      </div>
                    </div>
                  </div>

                  {/* CREATOR FUND */}

                  <div
                    className={`flex-col btn-select blu-drk shadow`}
                    style={{
                      minWidth: isMobile ? "135px" : "130px",
                      color: "#cde",
                      height: "120px",
                      width: "100%",
                      cursor: "default"
                    }}
                  >
                    <div
                      className="flex-row"
                      style={{ justifyContent: "center", alignItems: "center", gap: "0.75rem" }}
                    >
                      <div style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 5px 0", color: "#44aaff" }}>
                        Creator Fund
                      </div>
                    </div>
                    {creatorLoading ? (
                      <div
                        className="flex-row"
                        style={{
                          height: "100%",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "center",
                          padding: "0 20px"
                        }}
                      >
                        <Spinner size={28} color={"#468"} />
                      </div>
                    ) : (
                      <div
                        className="flex-col"
                        style={{ justifyContent: "center", alignItems: "center", gap: "0.25rem" }}
                      >
                        {/* <Impact size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 100 ? '#147' : '#5af'} /> */}
                        <div
                          className="flex-row"
                          style={{ justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                        >
                          <div style={{ fontSize: "16px", fontWeight: "700" }}>
                            {creatorRewards?.degen > 0 ? Math.floor(creatorRewards?.degen).toLocaleString() || 0 : "--"}
                          </div>
                          <div style={{ fontSize: "9px", fontWeight: "400", color: "#8cf" }}>$DEGEN</div>
                        </div>

                        <div
                          className="flex-row"
                          style={{ justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                        ></div>
                      </div>
                    )}
                    <div
                      className={`flex-row ${
                        creatorLoading
                          ? "btn-off"
                          : (creatorRewards?.degen > 0 || creatorRewards?.ham > 0) && creatorRewards?.wallet
                          ? "btn-on"
                          : "btn-off"
                      }`}
                      style={{
                        borderRadius: "8px",
                        padding: "2px 5px",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.25rem",
                        margin: "5px 0 2px 0",
                        cursor: "default"
                      }}
                    >
                      <p
                        style={{
                          padding: "0 2px",
                          fontSize: "15px",
                          fontWeight: "500",
                          textWrap: "nowrap"
                        }}
                      >
                        {creatorLoading
                          ? "Loading..."
                          : (creatorRewards?.degen > 0 || creatorRewards?.ham > 0) && creatorRewards?.wallet
                          ? "S7 Airdropped"
                          : (creatorRewards?.degen > 0 || creatorRewards?.ham > 0) && creatorRewards?.wallet == null
                          ? "Missing wallet"
                          : "No rewards"}
                      </p>{" "}
                      {/* update season 5/15 */}
                    </div>
                  </div>

                  {/* CLAIMED (S7) */}

                  <div
                    className={`flex-col btn-select blu-drk shadow`}
                    style={{
                      minWidth: isMobile ? "135px" : "130px",
                      color: "#cde",
                      height: "120px",
                      width: "100%",
                      cursor: "default"
                    }}
                  >
                    <div
                      className="flex-row"
                      style={{ justifyContent: "center", alignItems: "center", gap: "0.75rem" }}
                    >
                      <div style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 5px 0", color: "#44aaff" }}>
                        Claimed (S8)
                      </div>{" "}
                      {/* update season 5/15 */}
                    </div>
                    {claimsLoading ? (
                      <div
                        className="flex-row"
                        style={{
                          height: "100%",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "center",
                          padding: "0 20px"
                        }}
                      >
                        <Spinner size={28} color={"#468"} />
                      </div>
                    ) : (
                      <div
                        className="flex-col"
                        style={{ justifyContent: "center", alignItems: "center", gap: "0.25rem", padding: "0px" }}
                      >
                        <div
                          className="flex-row"
                          style={{ justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                        >
                          <div style={{ fontSize: "21px", fontWeight: "700" }}>
                            {totalClaims > 0 ? Math.floor(totalClaims || 0) : "--"}
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "400", color: "#8cf" }}>$DEGEN</div>
                        </div>
                      </div>
                    )}
                    <div className="flex-row" style={{ alignContent: "center", alignItems: "center", gap: "0.25rem" }}>
                      <div
                        className={`flex-row ${claimsLoading ? "btn-off" : totalClaims > 0 ? "btn-on" : "btn-off"}`}
                        style={{
                          borderRadius: "8px",
                          padding: "2px 5px",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.25rem",
                          margin: "5px 0 2px 0",
                          cursor: "default"
                        }}
                      >
                        <p
                          style={{
                            padding: "0 2px",
                            fontSize: "15px",
                            fontWeight: "500",
                            textWrap: "nowrap"
                          }}
                        >
                          {claimsLoading ? "Loading..." : totalClaims > 0 ? "Claimed" : "Check Score"}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "0px 5px",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "4px 0 -2px 0",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          getDailyRewards(fid);
                          getTotalClaims(fid);
                        }}
                      >
                        <Refresh className="" color={"#0077bf"} size={20} />
                      </div>
                    </div>
                  </div>

                  {/* </div> */}

                  <div
                    className="flex-row"
                    style={{
                      color: "#9df",
                      width: "100%",
                      textAlign: "center",
                      fontSize: isMobile ? "12px" : "14px",
                      padding: "10px 10px 0px 10px",
                      justifyContent: "center"
                    }}
                  >
                    Note: Daily Rewards accumulate for up to 4 days. Rewards expire after 4 days if unclaimed - they are
                    then moved to the Creator Fund
                  </div>
                  <div
                    className="flex-row"
                    style={{
                      color: "#9df",
                      width: "100%",
                      textAlign: "center",
                      fontSize: isMobile ? "12px" : "14px",
                      padding: "0px 10px 0px 10px",
                      justifyContent: "center"
                    }}
                  >
                    Daily Rewards are accumulated throughout the Season. They are then airdropped to your wallet after
                    Claim Day.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>)}

















      {/* Wallet Integration Section */}
      {(version == '2.0' || adminTest) && (<div style={{ padding: "20px 4px 0px 4px", width: feedMax }}>
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
                
                {/* Disperse Parameters Preview - Shows what will be sent before clicking */}
                {/* {isLogged && creatorResults.length > 0 && tipAmount > 0 && (
                  <div style={{ 
                    marginTop: "15px", 
                    padding: "12px", 
                    backgroundColor: "#001122", 
                    borderRadius: "8px", 
                    border: "1px solid #114477" 
                  }}>
                    <div style={{ 
                      fontSize: "11px", 
                      color: "#ace", 
                      fontWeight: "600", 
                      marginBottom: "8px" 
                    }}>
                      Disperse Parameters Preview:
                    </div>
                    {(() => {
                      const totalImpactSum = creatorResults.reduce((sum, creator) => sum + (creator.impact_sum || 0), 0);
                      const validRecipients = creatorResults
                        .filter(creator => creator.wallet && creator.wallet !== '')
                        .map(creator => {
                          const proportion = creator.impact_sum / totalImpactSum;
                          const calculatedAmount = parseFloat(tipAmount) * proportion;
                          const tokenDecimals = selectedToken?.symbol === 'USDC' ? 6 : 18;
                          // Use a safer calculation method to avoid overflow
                          const amountInSmallestUnit = (calculatedAmount * Math.pow(10, tokenDecimals)).toFixed(0);
                          
                          return {
                            address: creator.wallet,
                            amount: amountInSmallestUnit,
                            proportion: proportion,
                            calculatedAmount: calculatedAmount
                          };
                        });
                      
                      return (
                        <div style={{ fontSize: "10px", color: "#999" }}>
                          <div>Token: {selectedToken?.symbol || 'Unknown'}</div>
                          <div>Token Address: {selectedToken?.address?.slice(0, 10)}...{selectedToken?.address?.slice(-8)}</div>
                          <div>Recipients: {validRecipients.length}</div>
                          <div>Total Amount: {tipAmount} {selectedToken?.symbol}</div>
                          <div style={{ marginTop: "8px", fontSize: "9px", color: "#666" }}>
                            {validRecipients.slice(0, 3).map((r, i) => (
                              <div key={i}>
                                {r.address.slice(0, 8)}...{r.address.slice(-6)}: {r.calculatedAmount.toFixed(4)} {selectedToken?.symbol}
                              </div>
                            ))}
                            {validRecipients.length > 3 && <div>... and {validRecipients.length - 3} more</div>}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )} */}

                {/* Disperse Button - Underneath the WalletConnect container */}
                {isLogged && creatorResults.length > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    {/* Wallet Status Indicator */}
                    {/* {walletProvider === 'farcaster' && (
                      <div style={{
                        padding: "8px 12px",
                        marginBottom: "10px",
                        backgroundColor: "#114477",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#ace",
                        textAlign: "center",
                        border: "1px solid #225588"
                      }}>
                        🎯 Using Farcaster Wallet
                      </div>
                    )} */}
                    
                    <button
                      onClick={disperseTokens}
                      disabled={isDispersing || !walletConnected || !tipAmount}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: isDispersing || !walletConnected || !tipAmount ? "#555" : "#114477",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: isDispersing || !walletConnected || !tipAmount ? "not-allowed" : "pointer"
                      }}
                    >
                      {isDispersing ? "Dispersing..." : `Disperse ${selectedToken?.symbol || 'Token'}`}
                    </button>
                    
                    {/* Network Status Info */}
                    {/* {walletConnected && (
                      <div style={{ 
                        marginTop: "8px", 
                        padding: "6px 10px", 
                        backgroundColor: "#001122", 
                        borderRadius: "6px", 
                        border: "1px solid #114477",
                        fontSize: "10px",
                        color: "#999"
                      }}>
                        Network: {walletChainId === '0x2105' || walletChainId === '8453' || walletChainId === 8453 ? 
                                  '✅ Base Network' : 
                                  `❌ ${walletChainId === '0x1' ? 'Ethereum Mainnet' : 
                                        walletChainId === '0x89' ? 'Polygon' : 
                                        walletChainId === '0xa' ? 'Optimism' : 
                                        walletChainId === '0xa4b1' ? 'Arbitrum' : 
                                        `Network ${walletChainId || 'Unknown'}`}`}
                      </div>
                    )} */}
                  </div>
                )}
                

                
                {/* Disperse Status */}
                {isLogged && disperseStatus && (
                  <div style={{ marginTop: "15px" }}>
                    <div style={{
                      padding: "8px 12px",
                      borderRadius: "4px",
                      backgroundColor: disperseStatus.includes("Error") ? "#442222" : "#224422",
                      color: disperseStatus.includes("Error") ? "#ffaaaa" : "#aaffaa",
                      fontSize: "11px",
                        textAlign: "center"
                    }}>
                      {disperseStatus}
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

                {/* Search Results Display */}
                {/* <div style={{ padding: "0px 0 0 0" }}>
                  {searchLoading ? (
                    <div className="flex-row" style={{justifyContent: 'center', padding: '0px'}}>
                      <Spinner size={31} color={'#999'} />
                    </div>
                  ) : creatorResults.length > 0 ? (
                    <div className="flex-col" style={{gap: '10px'}}> */}
                      {/* TODO: Display creator results here */}
                    {/* </div>
                  ) : (
                    <div style={{textAlign: 'center', color: '#999', fontSize: '12px'}}>
                      No creators found with current filters
                    </div>
                  )}
                </div> */}

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



                 {/* Found Creators Count - At Bottom */}
                 {/* {creatorResults.length > 0 && (
                   <div style={{ padding: "20px 0 0 0", textAlign: 'center' }}>
                     <div style={{color: '#ace', fontSize: '14px', fontWeight: '600'}}>
                       Found {creatorResults.length} creators
                     </div>
                     <div style={{color: '#999', fontSize: '12px', textAlign: 'center', marginTop: '10px'}}>
                       Creator results will be displayed here
                     </div>
                   </div>
                 )} */}

               {/* <div style={{ padding: "0 20px 5px 20px" }}>
                 <WalletConnect />
               </div> */}

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
                     {/* <div style={{
                       textAlign: 'center', 
                       color: '#ace', 
                       fontSize: '16px', 
                       fontWeight: '600',
                       marginBottom: '15px',
                       padding: "0 20px"
                     }}>
                       Distribution Preview: Proportional to impact_sum ({selectedToken?.symbol || 'No Token Selected'})
                     </div> */}
                     
                     {/* Debug Info */}
                     {/* <div style={{
                       padding: "10px 20px",
                       backgroundColor: "#002244",
                       margin: "0 20px 15px 20px",
                       borderRadius: "5px",
                       fontSize: "11px",
                       color: "#999"
                     }}>
                       Debug: tipAmount = {tipAmount}, creatorResults.length = {creatorResults.length}, selectedToken = {selectedToken?.symbol || 'None'}, Network = {selectedToken?.networkKey || 'None'}
                     </div> */}
                     
                     {/* Token Display Test */}
                     {/* <div style={{
                       padding: "5px 20px",
                       backgroundColor: "#003366",
                       margin: "0 20px 10px 20px",
                       borderRadius: "5px",
                       fontSize: "14px",
                       color: "#9df",
                       textAlign: "center"
                     }}>
                       CURRENT TOKEN: {selectedToken?.symbol || 'None'} | NETWORK: {selectedToken?.networkKey || 'None'} | ADDRESS: {selectedToken?.address || selectedToken?.contractAddress || 'None'}
                     </div> */}
                     
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

               {/* <div style={{ padding: "0 20px 5px 20px" }}>
                 <WalletConnect />
               </div> */}

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
