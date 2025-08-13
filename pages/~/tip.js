import { useRouter } from "next/router";
import { useRef, useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Head from "next/head";

import { IoIosRocket, IoMdTrophy, IoMdRefresh as Refresh } from "react-icons/io";
import { BsLightningChargeFill as Impact, BsPiggyBankFill, BsQuestionCircle, BsGiftFill, BsCurrencyExchange } from "react-icons/bs";
import { confirmUser, timePassed } from "../../utils/utils";
import Spinner from "../../components/Common/Spinner";
import ExpandImg from "../../components/Cast/ExpandImg";
import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";
import { AccountContext } from "../../context";
import qs from "querystring";
import Modal from "../../components/Layout/Modals/Modal";
import WalletConnect from "../../components/WalletConnect";
import WalletActions from "../../components/WalletActions";

const version = process.env.NEXT_PUBLIC_VERSION;

// Wagmi-based wallet component
function WagmiWalletStatus() {
  const [mounted, setMounted] = useState(false);
  const [wagmiStatus, setWagmiStatus] = useState({
    isConnected: false,
    address: null,
    chain: null,
    error: null
  });

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Test Wagmi integration
  useEffect(() => {
    if (!mounted) return;

    const testWagmi = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { useAccount } = await import('wagmi');
        const { config } = await import('../../config/wagmi');
        
        // Note: This is just a demo - in a real implementation, 
        // you'd use the hooks directly in a component wrapped with WagmiProvider
        setWagmiStatus({
          isConnected: false,
          address: null,
          chain: 'base',
          error: null,
          configLoaded: true
        });
      } catch (error) {
        console.error('Wagmi test failed:', error);
        setWagmiStatus({
          isConnected: false,
          address: null,
          chain: null,
          error: error.message,
          configLoaded: false
        });
      }
    };

    testWagmi();
  }, [mounted]);

  if (!mounted) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '1px solid #333', 
        borderRadius: '8px', 
        margin: '10px 0',
        backgroundColor: '#111'
      }}>
        <div style={{ color: '#888' }}>Loading Wagmi status...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #333', 
      borderRadius: '8px', 
      margin: '10px 0',
      backgroundColor: '#111'
    }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>⚡ Wagmi Configuration Status</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ color: '#888', fontSize: '14px' }}>Wagmi Config Status:</div>
        <div style={{ color: wagmiStatus.configLoaded ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
          {wagmiStatus.configLoaded ? '✅ Wagmi Config Loaded' : '❌ Wagmi Config Failed'}
        </div>
        
        {wagmiStatus.configLoaded && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#aaa' }}>
            <div>Chain: Base</div>
            <div>Connector: Farcaster MiniApp</div>
            <div>Transport: HTTP</div>
          </div>
        )}
        
        {wagmiStatus.error && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#f44336' }}>
            Error: {wagmiStatus.error}
          </div>
        )}
      </div>

      <div style={{ 
        padding: '10px', 
        borderRadius: '4px', 
        backgroundColor: wagmiStatus.configLoaded ? '#1a4d1a' : '#4d1a1a',
        border: `1px solid ${wagmiStatus.configLoaded ? '#4CAF50' : '#f44336'}`
      }}>
        <div style={{ 
          color: wagmiStatus.configLoaded ? '#4CAF50' : '#f44336',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {wagmiStatus.configLoaded 
            ? '🎯 Wagmi Ready for Integration!' 
            : '⚠️ Wagmi Configuration Issue'
          }
        </div>
        <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>
          {wagmiStatus.configLoaded 
            ? 'Wagmi config with Farcaster connector is loaded and ready to use'
            : 'There was an issue loading the Wagmi configuration'
          }
        </div>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
        Note: To fully activate Wagmi hooks, wrap your app with WagmiProvider and QueryClientProvider
      </div>
    </div>
  );
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
            ethAddress: context?.user?.verifiedAddresses?.ethAddresses?.[0] || 'None'
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
      case '0x1': return 'Ethereum';
      case '0xa': return 'Optimism';
      case '0xa4b1': return 'Arbitrum';
      case '0x2105': return 'Base';
      default: return `Chain ${chainId}`;
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #333', 
      borderRadius: '8px', 
      margin: '10px 0',
      backgroundColor: '#111'
    }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>🔗 Farcaster Wallet Integration Test</h3>
      
      {/* SDK Status */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ color: '#888', fontSize: '14px' }}>Farcaster Mini App Status:</div>
        <div style={{ color: isMiniApp ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
          {isMiniApp ? '✅ Inside Farcaster Mini App' : '❌ Not in Farcaster Mini App'}
        </div>
        
        {sdkTest && !sdkTest.error && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#aaa' }}>
            <div>User: {sdkTest.user} (FID: {sdkTest.fid})</div>
            <div>ETH Address: {sdkTest.ethAddress}</div>
          </div>
        )}
        
        {sdkTest?.error && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#f44336' }}>
            Error: {sdkTest.error}
          </div>
        )}
      </div>

      {/* Wallet Status */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ color: '#888', fontSize: '14px' }}>Wallet Connection Status:</div>
        <div style={{ color: walletConnected ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
          {walletConnected ? '✅ Wallet Connected' : '❌ Wallet Not Connected'}
        </div>
        
        {walletConnected && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#aaa' }}>
            <div>Provider: {walletProvider}</div>
            <div>Address: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</div>
            <div>Network: {getNetworkName(walletChainId)}</div>
          </div>
        )}
      </div>

      {/* Integration Status */}
      <div style={{ 
        padding: '10px', 
        borderRadius: '4px', 
        backgroundColor: isMiniApp && walletConnected ? '#1a4d1a' : '#4d1a1a',
        border: `1px solid ${isMiniApp && walletConnected ? '#4CAF50' : '#f44336'}`
      }}>
        <div style={{ 
          color: isMiniApp && walletConnected ? '#4CAF50' : '#f44336',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {isMiniApp && walletConnected 
            ? '🎉 Full Integration Working!' 
            : '⚠️ Integration Incomplete'
          }
        </div>
        <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>
          {isMiniApp && walletConnected 
            ? 'Context isMiniApp=true and wallet connected via sdk.wallet.getEthereumProvider()'
            : 'Either not in miniapp or wallet connection failed'
          }
        </div>
      </div>
    </div>
  );
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
    adminTest
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
                        <Spinner size={31} color={"#468"} />
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
                        <Spinner size={31} color={"#468"} />
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
                        <Spinner size={31} color={"#468"} />
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
                          Wallet Management
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
                Manage your wallet and perform blockchain actions
              </div>

              <div
                className="flex-row"
                style={{
                  color: "#59b",
                  width: "100%",
                  fontSize: isMobile ? "13px" : "15px",
                  padding: "10px 10px 15px 10px",
                  justifyContent: "center",
                  textAlign: "center"
                }}
              >
                In Farcaster Mini Apps, wallet connection is handled automatically
              </div>

              <div style={{ padding: "0 20px 20px 20px" }}>
                <WagmiWalletStatus />
              </div>

              <div style={{ padding: "0 20px 20px 20px" }}>
                <WalletDemo />
              </div>

              <div style={{ padding: "0 20px 20px 20px" }}>
                <WalletConnect />
              </div>

              <div style={{ padding: "0 20px 20px 20px" }}>
                <WalletActions />
              </div>
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
