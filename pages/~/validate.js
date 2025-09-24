import { useRouter } from "next/router";
import { useRef, useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Head from "next/head";

import { IoIosRocket, IoMdTrophy, IoMdRefresh as Refresh } from "react-icons/io";
import { BsLightningChargeFill as Impact, BsPiggyBankFill, BsQuestionCircle, BsGiftFill, BsShieldFillCheck, BsStarFill, BsSquare, BsCheckSquareFill, BsShieldCheck } from "react-icons/bs";
import { confirmUser, timePassed } from "../../utils/utils";
import Spinner from "../../components/Common/Spinner";
import ExpandImg from "../../components/Cast/ExpandImg";
import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";
import { AccountContext } from "../../context";
import qs from "querystring";
import Modal from "../../components/Layout/Modals/Modal";

const version = process.env.NEXT_PUBLIC_VERSION;

export default function Rewards() {
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
  const [validations, setValidations] = useState([]);
  const [validationsLoading, setValidationsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ pfp: null, username: null, display: null });
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [viewedCasts, setViewedCasts] = useState(new Set());
  const [flashingCast, setFlashingCast] = useState(null);
  const [functionalCasts, setFunctionalCasts] = useState(new Set());
  const [selectedVotes, setSelectedVotes] = useState(new Map());
  const [validatedSignals, setValidatedSignals] = useState(new Set());

  useEffect(() => {
    if (fid) {
      // getCreatorRewards(fid);
      // getDailyRewards(fid);
      // getTotalClaims(fid);
      getUserValidations(fid);
    }
  }, [fid]);

  // Countdown timer effect
  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeToNext6HourPeriod());
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const getUserBalance = async (fid) => {
    try {
      const res = await fetch(`/api/user/getUserBalance?fid=${fid}`);
      const data = await res.json();
      return {impact: data?.impact || 0, qdau: data?.qdau || 0};
    } catch (error) {
      console.error('Error getting user balance:', error);
      return {impact: 0, qdau: 0};
    }
  };

  const getUserValidations = async (fid) => {
    try {
      setValidationsLoading(true);
      const res = await fetch(`/api/validation/getUserValidations?fid=${fid}`);
      const data = await res.json();
      console.log('User validations:', data);
      if (data.validations) {
        setValidations(data.validations);
      }
    } catch (error) {
      console.error('Error getting user validations:', error);
      setValidations([]);
    } finally {
      setValidationsLoading(false);
    }
  };

  const submitValidation = async (signalId, vote) => {
    try {
      const res = await fetch('/api/validation/submitValidation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: fid,
          signal_id: signalId,
          vote: vote
        })
      });
      
      const data = await res.json();
      if (data.success) {
        console.log('Validation submitted successfully');
      } else {
        console.error('Failed to submit validation:', data.error);
        // Remove from validated set if submission failed
        setValidatedSignals(prev => {
          const newSet = new Set(prev);
          newSet.delete(signalId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error submitting validation:', error);
    }
  };

  async function viewCast(castHash) {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.haptics.impactOccurred('light');
      await sdk.actions.viewCast({ 
        hash: castHash,
      });
      
      // Mark this cast as viewed (checkbox gets checked immediately)
      setViewedCasts(prev => new Set(prev).add(castHash));
      
      // Add 5-second delay before buttons become functional
      setTimeout(() => {
        setFunctionalCasts(prev => new Set(prev).add(castHash));
      }, 3000);
      
      console.log('Cast viewed successfully');
    } catch (error) {
      console.error('Error viewing cast:', error);
    }
  }

  const handleValidationClick = (signalId, vote, castHash) => {
    if (!viewedCasts.has(castHash)) {
      // Flash the Show Cast button in red
      setFlashingCast(castHash);
      setTimeout(() => {
        setFlashingCast(null);
      }, 1000); // Flash for 1 second
      return;
    }
    
    if (!functionalCasts.has(castHash)) {
      // Cast has been viewed but buttons aren't functional yet (within 3-second delay)
      return;
    }
    
    // If cast has been viewed and delay has passed, select the vote
    setSelectedVotes(prev => new Map(prev).set(signalId, vote));
  };

  const handleValidateSubmission = async (signalId, castHash) => {
    const selectedVote = selectedVotes.get(signalId);
    if (selectedVote !== undefined) {
      // Mark as validated immediately to update UI
      setValidatedSignals(prev => new Set(prev).add(signalId));
      
      // Submit the validation
      await submitValidation(signalId, selectedVote);
    }
  };

  const calculateTimeToNext6HourPeriod = () => {
    // Get current time in EST/EDT
    const now = new Date();
    
    // Create a date in EST timezone using Intl.DateTimeFormat
    const estTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    // Get current time components in EST
    const currentHour = estTime.getHours();
    const currentMinute = estTime.getMinutes();
    const currentSecond = estTime.getSeconds();
    
    console.log(`Current EST time: ${currentHour}:${currentMinute}:${currentSecond}`);
    
    // Define the 6-hour periods: 0, 6, 12, 18
    const periods = [0, 6, 12, 18, 24]; // Include 24 for next day calculation
    
    // Find the next period
    let nextPeriod = periods.find(period => period > currentHour);
    
    // If no period found (after 18:xx), next period is 0:00 tomorrow
    if (!nextPeriod) {
      nextPeriod = 24; // Will be treated as 0:00 next day
    }
    
    console.log(`Next 6-hour period: ${nextPeriod === 24 ? '0 (tomorrow)' : nextPeriod}`);
    
    // Calculate total seconds until target time
    const currentTotalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;
    const targetTotalSeconds = nextPeriod * 3600;
    
    let secondsUntilTarget;
    if (nextPeriod === 24) {
      // Going to next day (0:00)
      secondsUntilTarget = (24 * 3600) - currentTotalSeconds;
    } else {
      // Same day
      secondsUntilTarget = targetTotalSeconds - currentTotalSeconds;
    }
    
    // Handle the case where we're exactly at a 6-hour boundary
    if (secondsUntilTarget <= 0) {
      // If we're at exactly 0, 6, 12, or 18:00:00, start counting to next period
      const nextIndex = periods.indexOf(nextPeriod) + 1;
      if (nextIndex < periods.length) {
        nextPeriod = periods[nextIndex];
      } else {
        nextPeriod = 24; // Next day
      }
      
      if (nextPeriod === 24) {
        secondsUntilTarget = (24 * 3600) - currentTotalSeconds;
      } else {
        secondsUntilTarget = (nextPeriod * 3600) - currentTotalSeconds;
      }
    }
    
    // Convert back to hours, minutes, seconds
    const hoursRemaining = Math.floor(secondsUntilTarget / 3600);
    const minutesRemaining = Math.floor((secondsUntilTarget % 3600) / 60);
    const secondsRemaining = secondsUntilTarget % 60;
    
    console.log(`Time remaining: ${hoursRemaining}:${minutesRemaining}:${secondsRemaining}`);
    
    return {
      hours: Math.max(0, hoursRemaining),
      minutes: Math.max(0, minutesRemaining),
      seconds: Math.max(0, secondsRemaining)
    };
  };

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
        
        <style jsx>{`
          @keyframes flash {
            0% { background-color: #ff4444; }
            100% { background-color: #cc2222; }
          }
        `}</style>
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

      <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px 0 0 4px",
                    margin: "0 0 0px 0"
                  }}
                >
                  <div className="flex-row" style={{ gap: "0px", alignItems: "center" }}>
                    <BsShieldFillCheck style={{ fill: "#cde" }} size={20} />
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
                              Validations
                            </div>
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
                    gap: "8px",
                    padding: "0px 8px 0 0px"
                  }}
                >
                  {/* Countdown Timer */}
                  <div className="flex-row" style={{ gap: "4px", alignItems: "center" }}>
                    <div
                      style={{
                        backgroundColor: "#114477",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        border: "1px solid #2266aa",
                        minWidth: "30px",
                        textAlign: "center"
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#88bbdd",
                          lineHeight: "1",
                          fontWeight: "600"
                        }}
                      >
                        H
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#aaddff",
                          lineHeight: "1"
                        }}
                      >
                        {timeRemaining.hours.toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: "#114477",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        border: "1px solid #2266aa",
                        minWidth: "30px",
                        textAlign: "center"
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#88bbdd",
                          lineHeight: "1",
                          fontWeight: "600"
                        }}
                      >
                        M
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#aaddff",
                          lineHeight: "1"
                        }}
                      >
                        {timeRemaining.minutes.toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: "#114477",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        border: "1px solid #2266aa",
                        minWidth: "30px",
                        textAlign: "center"
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#88bbdd",
                          lineHeight: "1",
                          fontWeight: "600"
                        }}
                      >
                        S
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#aaddff",
                          lineHeight: "1"
                        }}
                      >
                        {timeRemaining.seconds.toString().padStart(2, '0')}
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
                  padding: "5px 8px 12px 8px",
                  borderRadius: "0 0 15px 15px",
                  color: isLogged ? "#ace" : "#ddd",
                  fontSize: "12px",
                  gap: "0.75rem",
                  position: "relative"
                }}
              >
                {validationsLoading ? (
                  <div
                    className="flex-row"
                    style={{
                      color: "#9df",
                      width: "100%",
                      fontSize: isMobile ? "15px" : "17px",
                      padding: "10px 5px 15px 5px",
                      justifyContent: "center",
                      userSelect: "none"
                    }}
                  >
                    Loading validations...
                  </div>
                ) : validations.length === 0 ? (
                  <div
                    className="flex-row"
                    style={{
                      color: "#9df",
                      width: "100%",
                      fontSize: isMobile ? "15px" : "17px",
                      padding: "10px 5px 15px 5px",
                      justifyContent: "center",
                      userSelect: "none"
                    }}
                  >
                    No active validations
                  </div>
                ) : (
                  <div className="flex-col" style={{ gap: "15px", padding: "0px 0px 15px 0px" }}>
                    {validations.map((validation, index) => {
                      // Check if user has already voted (confirmed is true)
                      const userVote = validation.validator_entry?.vote;
                      const isAlreadyConfirmed = validation.validator_entry?.confirmed === true;
                      
                      return (
                        <div
                          key={validation.signal_id}
                          className="flex-col"
                          style={{
                            backgroundColor: isAlreadyConfirmed ? "#002244" : "#003366",
                            borderRadius: "12px",
                            border: isAlreadyConfirmed ? "1px solid #2266aa" : "1px solid #445566",
                            padding: "10px",
                            gap: "12px"
                          }}
                        >
                        {/* Author Info and Impact */}
                        <div className="flex-row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                          <div className="flex-row" style={{ alignItems: "center", gap: "12px" }}>
                            <img
                              src={validation.author_pfp}
                              alt={validation.author_username}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover"
                              }}
                            />
                            <div className="flex-col" style={{ gap: "2px" }}>
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#eee"
                                }}
                              >
                                @{validation.author_username}
                              </div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#bbb"
                                }}
                              >
                                {validation.author_display_name}
                              </div>
                            </div>
                          </div>
                          
                          {/* Impact Display */}
                          <div 
                            style={{
                              backgroundColor: "#114477",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              border: "1px solid #2266aa"
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#88bbdd",
                                textAlign: "center",
                                marginBottom: "2px"
                              }}
                            >
                              Impact
                            </div>
                            <div
                              className="flex-row"
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#aaddff",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px"
                              }}
                            >
                              <BsStarFill size={15} />
                              {validation.impact || 0}
                            </div>
                          </div>
                        </div>

                        {/* Show Cast Button */}
                        <div
                          onClick={() => viewCast(validation.cast_hash)}
                          className="flex-row"
                          style={{
                            fontSize: "14px",
                            color: flashingCast === validation.cast_hash ? "#fff" : "#4488cc",
                            padding: "14px 12px",
                            backgroundColor: flashingCast === validation.cast_hash ? "#ff4444" : "#002244",
                            borderRadius: "8px",
                            border: flashingCast === validation.cast_hash ? "1px solid #ff6666" : "1px solid #334455",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            cursor: "pointer",
                            lineHeight: "1.4",
                            transition: "all 0.2s ease",
                            animation: flashingCast === validation.cast_hash ? "flash 0.5s ease-in-out infinite alternate" : "none"
                          }}
                          onMouseEnter={(e) => {
                            if (flashingCast !== validation.cast_hash) {
                              e.target.style.backgroundColor = "#114477";
                              e.target.style.borderColor = "#4488cc";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (flashingCast !== validation.cast_hash) {
                              e.target.style.backgroundColor = "#002244";
                              e.target.style.borderColor = "#334455";
                            }
                          }}
                        >
                          Show Cast
                          {viewedCasts.has(validation.cast_hash) ? (
                            functionalCasts.has(validation.cast_hash) ? (
                              <BsCheckSquareFill size={16} />
                            ) : (
                              <Spinner />
                            )
                          ) : (
                            <BsSquare size={16} />
                          )}
                        </div>

                        {/* Validation Question */}
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#cde",
                            textAlign: "center",
                            margin: "8px 0 4px 0"
                          }}
                        >
                          How accurate is the cast's valuation?
                        </div>

                        {/* Validation Buttons and Validate Button */}
                        <div className="flex-col" style={{ gap: "12px" }}>
                          <div 
                            className="flex-row" 
                            style={{ 
                              gap: "6px", 
                              flexWrap: "nowrap",
                              justifyContent: "space-between",
                              alignItems: "stretch"
                            }}
                          >
                          {[
                            { label: "Too\nHigh", value: -2, color: "#4488cc" },
                            { label: "High", value: -1, color: "#4488cc" },
                            { label: "Well\nValued", value: 0, color: "#4488cc" },
                            { label: "Low", value: 1, color: "#4488cc" },
                            { label: "Very\nLow", value: 2, color: "#4488cc" }
                          ].map((button) => {
                            const isViewed = viewedCasts.has(validation.cast_hash);
                            const isFunctional = functionalCasts.has(validation.cast_hash);
                            const isValidated = validatedSignals.has(validation.signal_id);
                            const isDisabled = !isViewed || isValidated || isAlreadyConfirmed;
                            const isWaiting = isViewed && !isFunctional && !isAlreadyConfirmed;
                            const isSelected = isAlreadyConfirmed 
                              ? userVote === button.value 
                              : selectedVotes.get(validation.signal_id) === button.value;
                            
                            let buttonColor = button.color;
                            let backgroundColor = "rgba(0, 0, 0, 0.3)";
                            let textColor = buttonColor;
                            let opacity = 1;
                            let cursor = "pointer";
                            
                            if (isAlreadyConfirmed) {
                              buttonColor = "#888";
                              textColor = "#888";
                              opacity = 0.6;
                              cursor = "not-allowed";
                              if (isSelected) {
                                backgroundColor = "#888";
                                textColor = "#fff";
                              }
                            } else if (isValidated) {
                              buttonColor = "#888";
                              textColor = "#888";
                              opacity = 0.4;
                              cursor = "not-allowed";
                              if (isSelected) {
                                backgroundColor = "#888";
                                textColor = "#fff";
                              }
                            } else if (!isViewed) {
                              buttonColor = "#999";
                              textColor = "#999";
                              opacity = 0.5;
                              cursor = "not-allowed";
                            } else if (isWaiting) {
                              buttonColor = "#aaaaaa";
                              textColor = "#aaaaaa";
                              opacity = 0.7;
                              cursor = "wait";
                            } else if (isSelected) {
                              backgroundColor = button.color;
                              textColor = "#fff";
                            }
                            
                            return (
                              <button
                                key={button.value}
                                onClick={() => handleValidationClick(validation.signal_id, button.value, validation.cast_hash)}
                                className="btn-on"
                                disabled={isDisabled}
                                style={{
                                  borderRadius: "6px",
                                  padding: "8px 4px",
                                  fontSize: isMobile ? "12px" : "13px",
                                  fontWeight: "600",
                                  border: `2px solid ${buttonColor}`,
                                  backgroundColor: backgroundColor,
                                  color: textColor,
                                  cursor: cursor,
                                  transition: "all 0.2s ease",
                                  flex: "1",
                                  textAlign: "center",
                                  whiteSpace: "pre-line",
                                  lineHeight: "1.2",
                                  minHeight: "44px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  opacity: opacity
                                }}
                                onMouseEnter={(e) => {
                                  if (isFunctional && !isSelected && !isValidated && !isAlreadyConfirmed) {
                                    e.target.style.backgroundColor = button.color;
                                    e.target.style.color = "#fff";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (isFunctional && !isSelected && !isValidated && !isAlreadyConfirmed) {
                                    e.target.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
                                    e.target.style.color = button.color;
                                  }
                                }}
                              >
                                {button.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Validate Button */}
                        <div
                          className="flex-row"
                          style={{
                            justifyContent: "center",
                            marginTop: "0px"
                          }}
                        >
                          <button
                            onClick={() => handleValidateSubmission(validation.signal_id, validation.cast_hash)}
                            className="btn-on"
                            disabled={!selectedVotes.has(validation.signal_id) || validatedSignals.has(validation.signal_id) || isAlreadyConfirmed}
                            style={{
                              borderRadius: "12px",
                              padding: "6px 50px",
                              fontSize: "14px",
                              fontWeight: "600",
                              border: (validatedSignals.has(validation.signal_id) || isAlreadyConfirmed)
                                ? "2px solid #2d7d32" 
                                : selectedVotes.has(validation.signal_id) 
                                  ? "2px solid #0af" 
                                  : "2px solid #666",
                              backgroundColor: (validatedSignals.has(validation.signal_id) || isAlreadyConfirmed)
                                ? "#2d7d32"
                                : "rgba(0, 0, 0, 0.3)",
                              color: (validatedSignals.has(validation.signal_id) || isAlreadyConfirmed)
                                ? "#fff" 
                                : selectedVotes.has(validation.signal_id) 
                                  ? "#0af" 
                                  : "#666",
                              cursor: (validatedSignals.has(validation.signal_id) || isAlreadyConfirmed)
                                ? "default" 
                                : selectedVotes.has(validation.signal_id) 
                                  ? "pointer" 
                                  : "not-allowed",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              opacity: (selectedVotes.has(validation.signal_id) || validatedSignals.has(validation.signal_id) || isAlreadyConfirmed) ? 1 : 0.5
                            }}
                          >
                            {(validatedSignals.has(validation.signal_id) || isAlreadyConfirmed) ? (
                              <BsShieldFillCheck size={16} />
                            ) : (
                              <BsShieldCheck size={16} />
                            )}
                            {(validatedSignals.has(validation.signal_id) || isAlreadyConfirmed) ? "Validated" : "Validate"}
                          </button>
                        </div>
                        </div>
                        </div>
                      )
                    })}
                  </div>
                )}


              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "0 0 80px 0" }}>&nbsp;</div>

      <ExpandImg {...{ show: showPopup.open, closeImagePopup, embed: { showPopup }, screenWidth, screenHeight }} />
      <Modal modal={modal} />
    </div>
  );
}
