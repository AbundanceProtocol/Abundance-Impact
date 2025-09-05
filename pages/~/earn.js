"use client"
import { useRouter } from "next/router";
import { useRef, useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Head from "next/head";

import { IoIosRocket, IoMdTrophy, IoMdRefresh as Refresh } from "react-icons/io";
import { BsLightningChargeFill as Impact, BsPiggyBankFill, BsQuestionCircle, BsGiftFill, BsStar, BsShareFill } from "react-icons/bs";
import { confirmUser, timePassed } from "../../utils/utils";
import Spinner from "../../components/Common/Spinner";
import ExpandImg from "../../components/Cast/ExpandImg";
import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";
import { AccountContext } from "../../context";
import qs from "querystring";
import Modal from "../../components/Layout/Modals/Modal";
import Settings from "./settings";

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
    adminTest,
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
  const [settingsIsOn, setSettingsIsOn] = useState(null);

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

  const shareCuration = async () => {
    if (fid) {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const isApp = await sdk.isInMiniApp();
  
      let impactLabel = ''

      let counter = 0
      if (settingsIsOn?.boost) {
        counter++
      }
      if (settingsIsOn?.validate) {
        counter++
      }
      if (settingsIsOn?.impactBoost) {
        counter++
      }
      if (settingsIsOn?.autoFund) {
        counter++
      }
  
      if (counter == 1) {
        if (settingsIsOn?.boost) {
          impactLabel = 'a Signal Booster'
        } else if (settingsIsOn?.validate) {
          impactLabel = 'an Impact Defender'
        } else if (settingsIsOn?.impactBoost) {
          impactLabel = 'an Impact Booster'
        } else if (settingsIsOn?.autoFund) {
          impactLabel = 'an Impact Funder'
        }
      } else if (counter == 2) {
        impactLabel = 'a Prime Impactor'
      } else if (counter == 3) {
        impactLabel = 'a Star Impactor'
      } else if (counter == 4) {
        impactLabel = 'a Super Impactor'
      }

      let shareUrl = `https://impact.abundance.id/~/earn/${fid}`
  
      let shareText = ''

      const options = [
        `/impact won't take us to the moon, but it will take us to the stars!\n\nWhat's your impact?`,
        `I'm earning with /impact while boosting FC creators & builders\n\nWhat's your impact?`,
        `I'm ${impactLabel}! What is your impact?`,
        `This is not complicated\n\nFarcaster's growth depends on boosting and rewarding casters based on their impact\n\nThat's what Impact 2.0 is for...`,
        `Impact 2.0 is Farcaster's 'Social Algorithm' - check it out here:`,
        `What if we had an algo that was based on value creation instead of engagement - turn out we can! Check out Impact 2.0:`,
        `Can we have a sufficiently decentralized network without sufficiently decentralized algos?`,
        `What if we had an algo that valued our impact, instead of extracting value from our attention? Check out Impact 2.0:`
      ];
      shareText = options[Math.floor(Math.random() * options.length)];
  
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
          content='{"version":"next","imageUrl":"https://impact.abundance.id/images/icon-02.png","button":{"title":"Earn with Impact","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id/~/earn","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}'
        />

        {/* Mini App specific metadata */}
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id/~/earn" />
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

      <div className='flex-row' style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <div
          className="flex-col"
          style={{
            padding: "1px 5px 1px 5px",
            border: `1px solid ${isLogged ? "#0af" : "#aaa"}`,
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
            <BsStar color={isLogged ? "#0af" : "#aaa"} size={40} />
            <div style={{ fontSize: "43px", fontWeight: "700", color: isLogged ? "#0af" : "#aaa" }}>
              {(() => {
                if (!settingsIsOn) return 0; // Default if no settings passed
                
                let points = 0;
                if (settingsIsOn?.boost) points += 30;
                if (settingsIsOn?.boost && settingsIsOn?.validate) points += 15;
                if (settingsIsOn?.boost && settingsIsOn?.autoFund) points += 14;
                if (settingsIsOn?.boost && settingsIsOn?.impactBoost) points += 10;
                
                return points;
              })()}
            </div>
          </div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: isLogged ? "#0af" : "#aaa" }}>
            Weekly Points
          </div>
        </div>
      </div>



      {(settingsIsOn?.boost || settingsIsOn?.validate || settingsIsOn?.impactBoost || settingsIsOn?.autoFund) && (<div
        onClick={shareCuration}
        className="flex-col"
        style={{
          // width: "100%",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px 0 10px 0"
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
                padding: "8px 2px",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                height: "28px",
                width: "165px",
                // backgroundColor: "#aaa"
              }}
            >
              {(!isMobile || isMobile) && <BsShareFill size={14} style={{ width: "21px" }} />}
              <p
                style={{
                  padding: "0px",
                  fontSize: isMobile ? "13px" : "13px",
                  fontWeight: "500",
                  textWrap: "wrap",
                  textAlign: "center"
                }}
              >
                Share your Impact
              </p>
            </div>
          </div>
        </div>
      </div>)}






      <div style={{ fontSize: "25px", fontWeight: "700", margin: "10px 0 -25px 0", color: "#44aaff", textAlign: "center", width: "100%" }}>
        How to Earn with Impact:
      </div>


      <Settings {...{ rewards: true }} onSettingsChange={setSettingsIsOn} />

      <div style={{ padding: "0 0 80px 0" }}>&nbsp;</div>

      <ExpandImg {...{ show: showPopup.open, closeImagePopup, embed: { showPopup }, screenWidth, screenHeight }} />
      <Modal modal={modal} />
    </div>
  );
}
