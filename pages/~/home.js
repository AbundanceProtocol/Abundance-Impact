'use client'
import Head from "next/head";
import Link from "next/link";
import React, { useContext, useState, useRef, useEffect } from "react";
import { AccountContext } from "../../context";
import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
// import Item from '../../components/Ecosystem/ItemWrap/Item';
// import Description from '../../components/Ecosystem/Description';
// import ItemWrap from '../../components/Ecosystem/ItemWrap';
import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";
import {
  FaPowerOff,
  FaLock,
  FaUsers,
  FaUser,
  FaGlobe,
  FaPlus,
  FaRegStar,
  FaCoins,
  FaAngleDown,
  FaShareAlt as Share,
  FaStar
} from "react-icons/fa";
import { IoMdRefresh as Refresh } from "react-icons/io";

// import { GiRibbonMedal as Medal } from "react-icons/gi";
// import { IoMdTrophy } from "react-icons/io";
// import { IoInformationCircleOutline as Info, IoLogIn } from "react-icons/io5";
// import { PiSquaresFourLight as Actions, PiBankFill } from "react-icons/pi";
// import { Logo } from './assets';
import useStore from "../../utils/store";
import ProfilePage from "./studio";
import axios from "axios";
import MiniAppAuthButton from "../../components/MiniAppAuthButton";
import {
  BsKey,
  BsLock,
  BsLockFill,
  BsXCircle,
  BsPerson,
  BsPersonFill,
  BsShieldCheck,
  BsShieldFillCheck,
  BsPiggyBank,
  BsPiggyBankFill,
  BsStar,
  BsStarFill,
  BsQuestionCircle,
  BsGift,
  BsGiftFill,
  BsPencilFill,
  BsInfoCircle,
  BsBellSlash,
  BsBell,
  BsRocketTakeoffFill,
  BsGearFill,
  BsCurrencyExchange,
  BsQuestionCircleFill,
  BsInfoCircleFill,
  BsShareFill,
  BsBarChartFill,
  BsSuitHeartFill
} from "react-icons/bs";

import Spinner from "../../components/Common/Spinner";
import NeynarSigninButton from "../../components/Layout/Modals/Signin";
import Settings from "./settings";
import { formatNum } from "../../utils/utils";
// import LoginButton from '../../components/Layout/Modals/FrontSignin';

const version = process.env.NEXT_PUBLIC_VERSION;

export default function Homepage({ test }) {
  const ref2 = useRef(null);
  const [ref, inView] = useInView();
  const {
    LoginPopup,
    checkEcoEligibility,
    ecoData,
    points,
    setPoints,
    isLogged,
    setShowLogin,
    setIsLogged,
    fid,
    setFid,
    getRemainingBalances,
    isMiniApp,
    userBalances,
    setIsMiniApp,
    LogoutPopup,
    userInfo,
    setUserInfo,
    setPanelOpen,
    setPanelTarget,
    adminTest,
    setAdminTest,
    setUserBalances,
    isOn,
    setIsOn,
    setNewUser,
    setIsSignedIn
  } = useContext(AccountContext);
  const [screenWidth, setScreenWidth] = useState(undefined);
  const [screenHeight, setScreenHeight] = useState(undefined);
  const [textMax, setTextMax] = useState("562px");
  const [feedMax, setFeedMax] = useState("620px");
  // const [showPopup, setShowPopup] = useState({open: false, url: null})
  const [tippingStreak, setTippingStreak] = useState({ streakData: Array(7).fill({ hasTip: false }), currentStreak: 0 });
  const [curationStreak, setCurationStreak] = useState({ streakData: Array(7).fill({ hasImpact: false }), currentStreak: 0 });
  const [tippingCeloStreak, setTippingCeloStreak] = useState({ streakData: Array(7).fill({ hasTip: false }), currentStreak: 0 });

  const [streaksLoading, setStreaksLoading] = useState(true);
  const router = useRouter();
  const { eco, referrer, autoFund } = router.query;
  const { isMobile } = useMatchBreakpoints();
  // const [display, setDisplay] = useState({personal: false, ecosystem: false})
  const store = useStore();

  const [fundLoading, setFundLoading] = useState(true);
  // const [isOn, setIsOn] = useState({ boost: false, validate: false, autoFund: false, notifs: false });
  // const [expand, setExpand] = useState({boost: false, validate: false, autoFund: false});
  const [loading, setLoading] = useState({ boost: false, validate: false, autoFund: false });

  const [showLoginNotice, setShowLoginNotice] = useState(!isLogged);
  const [notifStatus, setNotifStatus] = useState({ app: false, notifs: false });

  const [creatorRewards, setCreatorRewards] = useState(null);
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [dailyRewards, setDailyRewards] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [totalClaims, setTotalClaims] = useState(0);
  const [claimsLoading, setClaimsLoading] = useState(true);
  useEffect(() => {
    if (!isLogged) {
      setShowLoginNotice(true);
    } else {
      setTimeout(() => setShowLoginNotice(false), 500);
    }
  }, [isLogged]);

  const openSwipeable = target => {
    setPanelTarget(target);
    setPanelOpen(true);
  };

  const handleSignIn = async loginData => {
    console.log("isLogged-3");
    setFid(loginData.fid);
    setIsLogged(true);
    setShowLogin(false);
  };

  useEffect(() => {
    if (fid && isLogged) {
      getCreatorRewards(fid);
      getDailyRewards(fid);
      getTotalClaims(fid);
      getStreakData(fid);
    } else if (!isLogged) {
      // Reset streaks when user logs out
      setTippingStreak({ streakData: Array(7).fill({ hasTip: false }), currentStreak: 0 });
      setCurationStreak({ streakData: Array(7).fill({ hasImpact: false }), currentStreak: 0 });
      setStreaksLoading(false);
    }
  }, [fid, isLogged]);

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
            console.log('validate-home', data)
            setNewUser(data?.newUser ? true : false)
            if (data?.newUser) {
              setPanelTarget('welcome')
              setPanelOpen(true)
            }
            setIsSignedIn(data?.signer ? true : false)
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

  }
















  useEffect(() => {
    console.log("triggered");

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

  useEffect(() => {
    (async () => {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const isApp = await sdk.isInMiniApp();
      setIsMiniApp(isApp);

      const userProfile = await sdk.context;
      if (isApp && userProfile?.user?.fid == 9326) {
        setAdminTest(true);
      }

      if (isApp) {
        const client = sdk.context.client;
        console.log("client", client, userProfile.client);
        if (userProfile.client.added) {
          if (userProfile.client.notificationDetails) {
            setNotifStatus({
              app: true,
              notifs: true
            });
          } else {
            setNotifStatus({
              app: true,
              notifs: false
            });
          }
        } else {
          setNotifStatus({
            app: false,
            notifs: false
          });
        }
      }
    })();
  }, []);

  // useEffect(() => {
  //   console.log("version", version, userBalances.impact);
  //   if (version == "2.0" || adminTest) {
  //     if (userBalances.impact !== 0) {
  //       console.log("off-1");
  //       setPanelOpen(false);
  //       setPanelTarget(null);
  //     } else if (userBalances.impact == 0) {
  //       console.log("on-1");
  //       setPanelOpen(true);
  //       setPanelTarget("welcome");
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   console.log("version", version, userBalances.impact);
  //   if (version == "2.0" || adminTest) {
  //     if (userBalances.impact !== 0) {
  //       console.log("off-2");
  //       setPanelOpen(false);
  //       setPanelTarget(null);
  //     } else if (userBalances.impact == 0) {
  //       console.log("on-2");
  //       setPanelOpen(true);
  //       setPanelTarget("welcome");
  //     }
  //   }
  // }, [userBalances]);

  useEffect(() => {
    (async () => {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const isApp = await sdk.isInMiniApp();
      setIsMiniApp(isApp);
    })();
  }, [isLogged]);

  async function getStreakData(fid) {
    try {
      setStreaksLoading(true);
      
      // Fetch both tipping and curation streaks in parallel
      const [tippingResponse, tippingCeloResponse, curationResponse] = await Promise.all([
        axios.get("/api/streaks/tipping", { params: { fid } }),
        axios.get("/api/streaks/tippingCelo", { params: { fid } }),
        axios.get("/api/streaks/curation", { params: { fid } })
      ]);

      if (tippingResponse?.data?.success) {
        setTippingStreak(tippingResponse.data);
      }

      if (tippingCeloResponse?.data?.success) {
        setTippingCeloStreak(tippingCeloResponse.data);
      }

      if (curationResponse?.data?.success) {
        setCurationStreak(curationResponse.data);
      }

      setStreaksLoading(false);
    } catch (error) {
      console.log("getStreakData error", error);
      setStreaksLoading(false);
    }
  }

  // Helper function to render streak stars
  const renderStreakStars = (streakData) => {
    return streakData.map((day, index) => {
      const hasStar = day.hasTip || day.hasImpact;
      const isCurrentDay = index === streakData.length - 1; // Last item is current day
      
      if (hasStar) {
        // Current day (today) gets yellow color, other days get blue
        const color = isCurrentDay ? "#ffd700" : "#0af"; // Yellow for today, blue for others
        return <BsStarFill key={index} size={16} color={color} />;
      } else {
        // Empty stars: current day is yellow, other days are default
        const color = isCurrentDay ? "#ffd700" : undefined;
        return <BsStar key={index} size={16} color={color} />;
      }
    });
  };

  async function getUserSettings(fid) {
    try {
      setLoading({
        validate: true,
        boost: true,
        autoFund: true
      });
      const response = await axios.get("/api/user/getUserSettings", {
        params: { fid }
      });

      console.log("response", response);

      if (response?.data) {
        const userSettings = response?.data || null;
        console.log("userSettings updated", userSettings);
        setIsOn(prev => ({ ...prev, 
          boost: userSettings?.boost || false,
          validate: userSettings?.validate || false,
          autoFund: userSettings?.autoFund || false,
          score: userSettings?.score || 0,
          notifs: userSettings?.notifs || false,
          impactBoost: userSettings?.impactBoost || false,
          signal: isOn?.signal
        }));
      }
      setLoading({
        validate: false,
        boost: false,
        autoFund: false,
        score: 0
      });
    } catch (error) {
      console.error("Error setting invite:", error);
      setLoading({
        validate: false,
        boost: false,
        autoFund: false
      });
    }
  }

  useEffect(() => {
    if (isLogged && fid && isOn.score == 0) {
      getUserSettings(fid);
    } else if (!isLogged) {
      setIsOn(prev => ({ ...prev, 
        boost: false,
        validate: false,
        autoFund: false,
        score: 0,
        notifs: false,
        impactBoost: false,
        signal: isOn?.signal || false
      }));
    }
  }, [isLogged]);

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`562px`);
        setFeedMax("620px");
      } else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 120}px`);
        setFeedMax("580px");
      } else {
        setTextMax(`${screenWidth - 10}px`);
        setFeedMax(`${screenWidth}px`);
      }
    } else {
      setTextMax(`100%`);
      setFeedMax(`100%`);
    }
  }, [screenWidth]);

  useEffect(() => {
    if (isLogged) {
      let setEco = eco || "$IMPACT";
      let setReferrer = referrer || null;
      console.log("setEco", setEco);
      setPoints(setEco);
      if (userBalances.imppact == 0) {
        getRemainingBalances(store.fid, setEco, store.signer_uuid, setReferrer);
      }
      if (autoFund && store.fid && setReferrer) {
        setAutoFundInvite(store.fid, referrer, store.signer_uuid);
      }
    }
  }, [eco, isLogged]);

  async function setAutoFundInvite(fid, referrer, uuid) {
    try {
      const response = await axios.post("/api/curation/postInvite", { fid, referrer, uuid });
    } catch (error) {
      console.error("Error setting invite:", error);
    }
  }

  const ToggleSwitch = ({ target }) => {
    const handleToggle = () => {
      console.log("isOn", isOn);
      if (isOn) {
        setFundingSchedule("off");
      } else {
        setFundingSchedule("on");
      }

      if (isLogged) {
        setIsOn(prev => ({ ...prev, [target]: !isOn[target] }));
      }
    };

    return (
      <div className="flex-row" style={{ justifyContent: "center", alignItems: "center", margin: "0 5px 0 0" }}>
        {loading[target] && (
          <div
            className="flex-row"
            style={{
              height: "20px",
              alignItems: "center",
              width: "20px",
              justifyContent: "center",
              padding: "0px",
              position: "relative",
              right: "10%",
              top: "0px"
            }}
          >
            <Spinner size={20} color={"#468"} />
          </div>
        )}

        <div className={`toggleSwitch ${isOn[target] ? "toggleSwitch-on" : ""}`} onClick={handleToggle}>
          <span className="circle"></span>
        </div>
      </div>
    );
  };

  function setFundingSchedule(data) {
    console.log("data", data);
  }


  const shareCuration = async () => {
    if (fid) {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const isApp = await sdk.isInMiniApp();
  
      let shareUrl = `https://impact.abundance.id/~/curator/${fid}`
  
      let shareText = `I'm signal-boosting impactful creators & builders thru /impact\n\nCheck my curation:`
  
      let encodedShareText = encodeURIComponent(shareText)
      let encodedShareUrl = encodeURIComponent(shareUrl); 
      let shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
  
      if (!isApp) {
        window.open(shareLink, '_blank');
      } else if (isApp) {
        await sdk.actions.composeCast({
          text: shareText,
          embeds: [shareUrl],
          close: false
        })
      }
    }
  }


  async function viewCast(castHash) {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.haptics.impactOccurred('light')
      await sdk.actions.viewCast({ 
        hash: castHash,
      });
      console.log('Cast viewed successfully');
    } catch (error) {
      console.error('Error viewing cast:', error);
    }
  }

  async function notifsOn() {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      console.log("isMiniApp", isMiniApp, notifStatus.app, notifStatus.notifs);
      if (isMiniApp) {
        if (notifStatus.app && !notifStatus.notifs) {
          const result = await sdk.actions.addMiniApp();
          console.log("result1", result);
          if (result.notificationDetails) {
            console.log("test1");
            setNotifStatus({
              app: true,
              notifs: true
            });
            setIsOn(prev => ({ ...prev, 
              notifs: true
            }));
          } else {
            console.log("test2");

            setNotifStatus({
              app: true,
              notifs: false
            });
            setIsOn(prev => ({ ...prev, 
              notifs: false
            }));          }
        } else if (!notifStatus.app) {
          console.log("test3");

          const result = await sdk.actions.addFrame();
          console.log("result2", result);

          if (result.notificationDetails) {
            setNotifStatus({
              app: true,
              notifs: true
            });
            setIsOn(prev => ({ ...prev, 
              notifs: true
            }));          } else {
            console.log("test4");

            setNotifStatus({
              app: false,
              notifs: false
            });
            setIsOn(prev => ({ ...prev, 
              notifs: false
            }));
          }
        }
      } else {
        console.log("not miniapp");
      }
    } catch (error) {
      console.error("Notification setting failed", error);
      setIsOn(prev => ({ ...prev, 
        notifs: false
      }));    }
  }

  return (
    <div name="feed" style={{ width: "auto", maxWidth: "620px" }} ref={ref2}>
      <Head>
        <title>Impact App | Abundance Protocol</title>
        <meta name="description" content={`Building the global superalignment layer`} />
      </Head>

      {(!isLogged || version == "2.0" || adminTest) && (
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

      {/* {!isLogged && ( */}
      {/* <div style={{ padding: (!isLogged || (version == '2.0' || adminTest)) ? "0px 4px 0px 4px" : '0', width: feedMax }}> */}

      {/* <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}> */}

      {!isLogged && version == "1.0" && !adminTest && (
        <div
          id="autoFund"
          style={{
            padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
            width: "40%"
          }}
        ></div>
      )}

      {/* LOGIN */}

      {/* {(version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

            <div className='shadow flex-col'
              style={{
                backgroundColor: "#002244",
                borderRadius: "15px",
                height: '100%',
                border: "1px solid #11447799",
                width: isMiniApp || isMobile ? '340px' : '100%',
                margin: isMiniApp || isMobile ? '0px auto' : '',
                transition: '2.3s ease-in-out height'
              }}
            >
              <div
                className={`flex-row ${isLogged ? '' : 'shadow'}`}
                style={{
                  backgroundColor: "#11448888",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px", 
                  borderRadius: "15px",
                  margin: isLogged ? '0' : '0 0 10px 0'
                }} >


                <div
                  className="flex-row"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: "0px 0 0 4px",
                    margin: '0 0 0px 0'
                  }} >

                
                  <BsPersonFill style={{ fill: "#cde" }} size={20} />
                  <div>


                    <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                      <div className="top-layer flex-row">
                        <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                          <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                            Login
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
                      cursor: "pointer",
                    }} >

                  </div>
                </div>


                {isLogged ? (<div className='curator-button-red' style={{height: 'max-content', textAlign: 'center', width: '64px', padding: '5px 0 3px 0', alignItems: 'center', justifyContent: 'center'}} onClick={LogoutPopup}>
                <FaPowerOff size={16} color='#fff' />
                </div>) : isMiniApp ? 
                  (<MiniAppAuthButton
                    onSuccess={(fid, uuid, signers) => {
                      console.log('isLogged-3', fid)
                      store.setFid(fid);
                      store.setSignerUuid(uuid);
                      store.setIsAuth(uuid?.length > 0);

                      setFid(fid)
                      setIsLogged(true)
                      setShowLogin(false)
                      checkEcoEligibility(fid, '$IMPACT', uuid)
                    }}
                    onError={err => {
                      alert('Login failed: ' + err.message);
                    }}
                  />) : (<div style={{width: '125px', height: '36px', transform: 'scale(0.85)', transformOrigin: 'center'}}><NeynarSigninButton onSignInSuccess={handleSignIn} /></div>)}

              </div>

              {(showLoginNotice || !isLogged) && (
                <div
                  className={`login-message-wrapper ${isLogged ? 'fade-out' : 'fade-in'}`}
                  style={{
                    overflow: 'hidden',
                    backgroundColor: "#002244ff",
                    padding: '0px 18px 12px 18px',
                    borderRadius: '0 0 15px 15px',
                    color: '#ace',
                    fontSize: '12px',
                    gap: '0.75rem',
                    position: 'relative',
                    transition: 'all 0.5s ease',
                    maxHeight: isLogged ? 0 : '80px',
                    opacity: isLogged ? 0 : 1,
                  }}
                >
                  <div>
                    You need to login to enable Boosting, Auto-funding or Quests
                  </div>
                </div>
              )}
            </div>
          </div>
          )} */}

      {/* <div className='flex-row' style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>

        <div
          className="flex-col"
          style={{
            padding: "1px 5px 1px 5px",
            border: `1px solid #f66`,
            borderRadius: "18px",
            backgroundColor: "",
            alignItems: "center",
            gap: "0.0rem",
            height: "35px",
            width: "245px",
            justifyContent: "center"
          }}
        >
          <div style={{ fontSize: "13px", padding: "5px 0 5px 0", fontWeight: "700", color: "#f66" }}>
            Impact 2.0 is under construction
          </div>
        </div>

      </div> */}

      {/* Status Icons Row */}
      <div className='flex-row' style={{width: '100%', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', margin: '10px 0 0 0'}}>
        <div className='flex-row' style={{gap: '0.4rem', border: `1px solid #0af`, padding: '0 8px 0 0', borderRadius: '8px'}}>

        <Link 
            href={"/"}
            style={{
              padding: '8px',
              border: `0px solid ${isLogged ? "#aaa" : "#aaa"}`,
              borderRadius: '8px',
              backgroundColor: '#246',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsGearFill 
              size={16} 
              color={"#ace"} 
            />
          </Link>

          {/* <Link 
            href={"/"}
            style={{
              padding: '8px',
              border: `0px solid ${isLogged ? "#0af" : "#aaa"}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsPersonFill 
              size={16} 
              color={isLogged ? "#0af" : "#aaa"} 
            />
          </Link> */}


          <Link 
            href={"/"}
            style={{
              padding: '8px',
              border: `0px solid ${isOn.signal ? "#0af" : "#aaa"}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsStarFill 
              size={16} 
              color={isOn.signal ? "#0af" : "#aaa"} 
            />
          </Link>

          <Link 
            href={"/"}
            style={{
              padding: '8px',
              border: `0px solid ${isOn.validate ? "#0af" : "#aaa"}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsShieldFillCheck 
              size={16} 
              color={isOn.validate ? "#0af" : "#aaa"} 
            />
          </Link>

          {/* <Link 
            href={"/~/earn"}
            style={{
              padding: '8px',
              border: `0px solid ${isLogged && isOn.autoFund ? "#0af" : "#aaa"}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsPiggyBankFill 
              size={16} 
              color={isLogged && isOn.autoFund ? "#0af" : "#aaa"} 
            />
          </Link> */}

          <Link 
            href={"/"}
            style={{
              padding: '8px',
              border: `0px solid ${isOn.boost ? "#0af" : "#aaa"}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsSuitHeartFill 
              size={16} 
              color={isOn.boost ? "#0af" : "#aaa"} 
            />
          </Link>


          <Link 
            href={"/"}
            style={{
              padding: '8px',
              border: `0px solid ${isOn.impactBoost ? "#0af" : "#aaa"}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BsRocketTakeoffFill 
              size={16} 
              color={isOn.impactBoost ? "#0af" : "#aaa"} 
            />
          </Link>
        </div>
      </div>

      {(version == "2.0" || adminTest) && isLogged && (
        <div
          className="flex-row"
          style={{ backgroundColor: "", justifyContent: "center", gap: "1rem", margin: "20px 0 -20px 0" }}
        >







          <div
            className="flex-col"
            style={{
              padding: "1px 5px 1px 5px",
              border: `1px solid ${isLogged && isOn.boost ? "#0af" : "#aaa"}`,
              borderRadius: "18px",
              backgroundColor: "",
              alignItems: "center",
              gap: "0.0rem",
              height: "90px",
              width: "135px",
              justifyContent: "center"
            }}
          >
            <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center", padding: "0 10px" }}>
              <BsStar color={isLogged && isOn.boost ? "#0af" : "#aaa"} size={40} />
              <div style={{ fontSize: "43px", fontWeight: "700", color: isLogged && isOn.boost ? "#0af" : "#aaa" }}>
                {userBalances.impact}
              </div>
            </div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: isLogged && isOn.boost ? "#0af" : "#aaa" }}>
              Daily Points
            </div>
          </div>

          <div
            className="flex-col"
            style={{
              padding: "1px 5px 1px 5px",
              border: `1px solid ${isLogged && isOn.boost ? "#0af" : "#aaa"}`,
              borderRadius: "18px",
              backgroundColor: "",
              alignItems: "center",
              gap: "0.0rem",
              height: "90px",
              justifyContent: "center",
              width: "135px"
            }}
          >
            <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center", padding: "0 10px" }}>
              <div style={{ fontSize: "43px", fontWeight: "700", color: isLogged && isOn.boost ? "#0af" : "#aaa" }}>
                {formatNum(isOn?.score?.toFixed(0) || 0)}
              </div>
            </div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: isLogged && isOn.boost ? "#0af" : "#aaa" }}>
              Impact Score
            </div>
          </div>
        </div>
      )}


      <div
        className="flex-row"
        style={{ backgroundColor: "", justifyContent: "center", gap: "1rem", margin: "20px 0 0px 0", padding: "20px 0 0 0"}}
      >
        <div
          className="flex-col"
          style={{
            padding: "1px 5px 1px 5px",
            border: `1px solid ${isLogged ? "#0af" : "#aaa"}`,
            borderRadius: "18px",
            backgroundColor: "",
            alignItems: "center",
            gap: "0.0rem",
            height: "125px",
            width: "135px",
            justifyContent: "center"
          }}
        >
          <div style={{ fontSize: "13px", padding: "5px 0 5px 0", fontWeight: "700", color: isLogged ? "#0af" : "#aaa" }}>
            Creator Fund
          </div>
          <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center", padding: "0 10px" }}>
            {/* <BsStar color={isLogged ? "#0af" : "#aaa"} size={40} /> */}
            <div style={{ fontSize: "36px", fontWeight: "700", color: isLogged ? "#0af" : "#aaa", height: "45px" }}>
              {creatorRewards?.degen > 0 ? Math.floor(creatorRewards?.degen).toLocaleString() || 0 : "--"}
            </div>
          </div>
          <div style={{ fontSize: "10px", padding: "0 0 5px 0", fontWeight: "700", color: isLogged ? "#0af" : "#aaa" }}>
            $DEGEN
          </div>

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
                fontSize: "12px",
                fontWeight: "500",
                textWrap: "nowrap"
              }}
            >
              {creatorLoading
                ? "Loading..."
                : (creatorRewards?.degen > 0 || creatorRewards?.ham > 0) && creatorRewards?.wallet
                ? "S8 Airdropped"
                : (creatorRewards?.degen > 0 || creatorRewards?.ham > 0) && creatorRewards?.wallet == null
                ? "Missing wallet"
                : "No rewards"}
            </p>{" "}
            {/* update season 5/15 */}
          </div>



        </div>

        <div
          className="flex-col"
          style={{
            padding: "1px 5px 1px 5px",
            border: `1px solid ${isLogged ? "#0af" : "#aaa"}`,
            borderRadius: "18px",
            backgroundColor: "",
            alignItems: "center",
            gap: "0.0rem",
            height: "125px",
            width: "135px",
            justifyContent: "center",
            width: "135px"
          }}
        >
          <div style={{ fontSize: "13px", padding: "5px 0 5px 0", fontWeight: "700", color: isLogged ? "#0af" : "#aaa" }}>
            Daily Rewards
          </div>
          <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center", padding: "0 10px" }}>
            <div style={{ fontSize: "36px", fontWeight: "700", color: isLogged ? "#0af" : "#aaa", height: "45px" }}>
              {dailyRewards?.degen_total > 0 ? Math.floor(dailyRewards?.degen_total || 0) : "--"}
            </div>
          </div>
          <div style={{ fontSize: "10px", padding: "0 0 5px 0", fontWeight: "700", color: isLogged ? "#0af" : "#aaa" }}>
            $DEGEN
          </div>


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
                  fontSize: "12px",
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
                padding: "0px 0px",
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
              <Refresh className="" color={"#0077bf"} size={16} />
            </div>
          </div>







        </div>
      </div>




      <Settings />







            {(version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: '', margin: '50px 0 0 0'}}>

              <div 
                className='shadow flex-col'
                style={{
                  backgroundColor: isLogged ? "#002244" : '#333',
                  borderRadius: "15px",
                  border: isLogged ? "1px solid #11447799" : "1px solid #555",
                  width: isMiniApp || isMobile ? '340px' : '100%',
                  margin: isMiniApp || isMobile ? '15px auto 0 auto' : '15px auto 0 auto',
                }} >
                <div
                  className="shadow flex-row"
                  style={{
                    backgroundColor: isLogged ? "#11448888" : "#444",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px", 
                    borderRadius: "15px",
                    margin: '0 0 10px 0',
                    gap: '1rem'
                  }} >


                  <div
                    className="flex-row"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      padding: "0px 0 0 4px",
                      margin: '0 0 0px 0',
                    }} >
                    <div className='flex-row' style={{width: '100%', justifyContent: 'flex-start', alignItems: 'center'}}>
                      <BsBarChartFill style={{ fill: "#cde" }} size={20} />
                      <div>
                        <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', width: '100%', cursor: 'pointer', color: '#cde', position: 'relative'}}>
                          <div className="top-layer flex-row" style={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', alignItems: 'center', width: '100%'}}>
                              <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                                Impact Streaks
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {streaksLoading && (
                      <div style={{padding: '4px 10px 0px 0'}}>
                        <Spinner size={16} />
                      </div>
                    )}
                    <div
                      className="flex-row"
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                      }} >

                    </div>
                  </div>

                </div>

                <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>




                  <div style={{fontSize: '15px', fontWeight: '600', color: '#ace', margin: '8px 0 0px 0'}}>
                    Tipping Streak
                  </div>
                  <div style={{fontSize: '11px', fontWeight: '400', color: '#ace', margin: '-6px 0 0px 0'}}>
                    Tipped over $0.25 in the last 7 days
                  </div>
                  <div className='flex-row' style={{gap: '1.2rem', alignItems: 'center', justifyContent: 'center', margin: '-12px 0 0px 0'}}>
                    {streaksLoading ? (
                      Array(7).fill(0).map((_, index) => (
                        <BsStar key={index} size={16} color="#444" />
                      ))
                    ) : (
                      renderStreakStars(tippingStreak.streakData)
                    )}

                    <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                      <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}}>
                        {streaksLoading ? '0/7' : `${tippingStreak.totalDaysWithTips || 0}/7`}
                      </div>
                    </div>
                  </div>


                  <div style={{fontSize: '15px', fontWeight: '600', color: '#ace', margin: '8px 0 0px 0'}}>
                    Tipping Streak (Celo)
                  </div>
                  <div style={{fontSize: '11px', fontWeight: '400', color: '#ace', margin: '-6px 0 0px 0'}}>
                    Tipped over $0.25 in the last 7 days on Celo
                  </div>
                  <div className='flex-row' style={{gap: '1.2rem', alignItems: 'center', justifyContent: 'center', margin: '-12px 0 0px 0'}}>
                    {streaksLoading ? (
                      Array(7).fill(0).map((_, index) => (
                        <BsStar key={index} size={16} color="#444" />
                      ))
                    ) : (
                      renderStreakStars(tippingCeloStreak.streakData)
                    )}

                    <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                      <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}}>
                        {streaksLoading ? '0/7' : `${tippingCeloStreak.totalDaysWithTips || 0}/7`}
                      </div>
                    </div>
                  </div>


                  <div style={{fontSize: '15px', fontWeight: '600', color: '#ace', margin: '8px 0 0px 0'}}>
                    Curation Streak
                  </div>
                  <div style={{fontSize: '11px', fontWeight: '400', color: '#ace', margin: '-6px 0 0px 0'}}>
                    Curated impactful casts in the last 7 days
                  </div>
                  <div className='flex-row' style={{gap: '1.2rem', alignItems: 'center', justifyContent: 'center', margin: '-12px 0 12px 0'}}>
                    {streaksLoading ? (
                      Array(7).fill(0).map((_, index) => (
                        <BsStar key={index} size={16} color="#444" />
                      ))
                    ) : (
                      renderStreakStars(curationStreak.streakData)
                    )}

                    <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                      <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}}>
                        {streaksLoading ? '0/7' : `${curationStreak.totalDaysWithImpacts || 0}/7`}
                      </div>
                    </div>
                  </div>



                  <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                    <BsInfoCircle size={15} onClick={() => {
                      openSwipeable("streak"); }} />
                  </div>
                </div>
              </div>
              </div>

              )}



















      <div
        className="flex-row"
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 10px 0 10px",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div
          onClick={shareCuration}
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px",
                  // backgroundColor: "#aaa"
                }}
              >
                {(!isMobile || isMobile) && <BsShareFill size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "14px" : "18px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Share
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={"/~/tip"}
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px",
                  // backgroundColor: "#aaa"
                }}
              >
                {(!isMobile || isMobile) && <BsCurrencyExchange size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "14px" : "18px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Tip
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div
        className="flex-row"
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "20px 10px 0 10px",
          flexWrap: "wrap",
          gap: "0.8rem"
        }}
      >
        <Link
          href={"/~/ecosystems/abundance"}
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px"
                }}
              >
                {(!isMobile || isMobile) && <BsStarFill size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Explore
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px",
                  backgroundColor: "#aaa"
                }}
              >
                {(!isMobile || isMobile) && <BsShieldFillCheck size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Validate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <Link
          href={"/~/auto-fund"}
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px"
                }}
              >
                {(!isMobile || isMobile) && <BsPiggyBankFill size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Fund
                </p>
              </div>
            </div>
          </div>
        </Link> */}

        <Link
          href={"/~/rewards"}
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px"
                  // backgroundColor: "#aaa"
                }}
              >
                {(!isMobile || isMobile) && <BsGiftFill size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Rewards
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px",
                  backgroundColor: "#aaa"
                }}
              >
                {(!isMobile || isMobile) && <BsRocketTakeoffFill size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "500",
                    textWrap: "nowrap"
                  }}
                >
                  Quests
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* <div
            className="flex-col"
            style={{
              // width: "100%",
              justifyContent: "center",
              alignItems: "center",
              }} >

              <div
                className="flex-row"
                style={{
                  gap: "0.75rem",
                  margin: "0px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    className="flex-col cast-act-lt"
                    style={{
                      borderRadius: "8px",
                      padding: "8px 8px",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                      height: '90px',
                      width: '110px',
                      backgroundColor: '#aaa'
                    }}
                  >
                    {(!isMobile || isMobile) && <BsQuestionCircleFill size={20} style={{width: '21px'}} />}
                    <p
                      style={{
                        padding: "0px",
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: "500",
                        textWrap: "wrap",
                        textAlign: 'center'
                      }} >
                      How to
                    </p>
                    <p
                      style={{
                        padding: "0px",
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: "500",
                        textWrap: "wrap",
                        textAlign: 'center'
                      }} >
                      Earn
                    </p>
                  </div>
                </div>


              </div>

            </div> */}

        {/* <Link
          href={"/"}
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "40px",
                  width: "100px"
                }}
              >
                {(!isMobile || isMobile) && <BsGearFill size={20} style={{ width: "21px" }} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "500",
                    textWrap: "nowrap"
                  }}
                >
                  Settings
                </p>
              </div>
            </div>
          </div>
        </Link> */}
      </div>

      <div
        className="flex-row"
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 10px 100px 10px",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}
      >
        {(!isMobile || isMobile) && <BsInfoCircleFill size={20} color={"#ace"} style={{ width: "25px" }} />}
        <a
          onClick={() => viewCast('0x384b7285d593b8db12a24060aa26652be40042a8')} title="Navigate to cast"
          style={{
            padding: "0px",
            fontSize: isMobile ? "18px" : "18px",
            fontWeight: "500",
            textWrap: "wrap",
            textAlign: "center",
            color: "#ace",
            cursor: "pointer"
          }}
        >
          How it works
        </a>
      </div>

      {/* <div
        className="flex-row"
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "10px 10px 120px 10px",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "30px",
                  width: "100px",
                  backgroundColor: "#aaa"
                }}
              >
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "14px" : "14px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  How to Earn
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "30px",
                  width: "100px",
                  backgroundColor: "#aaa"
                }}
              >
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "14px" : "14px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Impact Score
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "0px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div>
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  height: "30px",
                  width: "100px",
                  backgroundColor: "#aaa"
                }}
              >
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? "13px" : "13px",
                    fontWeight: "500",
                    textWrap: "wrap",
                    textAlign: "center"
                  }}
                >
                  Weekly Points
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}


      {version == "2.0" || adminTest || (version == "1.0" && !adminTest && isLogged && <ProfilePage />)}
    </div>
  );
}
