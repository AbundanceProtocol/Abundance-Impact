'use client'
import React, { useRef, useContext, useEffect } from "react";
import Link from "next/link";
import useMatchBreakpoints from "../../../hooks/useMatchBreakpoints";
import { useRouter } from "next/router";
import { AccountContext } from "../../../context";
import { FaStar } from "react-icons/fa";
import { Logo } from "../../assets";
import {
  BsTrophy,
  BsGear,
  BsGearFill,
  BsCurrencyExchange,
  BsChevronDoubleLeft,
  BsGift,
  BsGiftFill,
  BsPiggyBank,
  BsPiggyBankFill,
  BsHouseDoor,
  BsHouseDoorFill,
  BsInfoCircle
} from "react-icons/bs";
import axios from "axios";

const version = process.env.NEXT_PUBLIC_VERSION;

const UserMenu = () => {
  const ref1 = useRef(null);
  const { isMobile } = useMatchBreakpoints();
  const router = useRouter();
  const {
    userBalances,
    userInfo,
    setUserBalances,
    fid,
    isLogged,
    setIsMiniApp,
    setUserInfo,
    adminTest,
    navMenu,
    isOn,
    setIsOn,
    isSignedIn,
    setIsSignedIn,
    setNewUser,
    setPanelTarget,
    setPanelOpen
  } = useContext(AccountContext);

  const openSwipeable = target => {
    setPanelTarget(target);
    setPanelOpen(true);
  };

  async function getUserSettings(fid) {
    try {
      // setLoading({
      //   validate: true,
      //   boost: true,
      //   autoFund: true
      // });
      const response = await axios.get("/api/user/getUserSettings", {
        params: { fid }
      });

      if (response?.data) {
        const userSettings = response?.data || null;
        setIsOn(prev => ({ ...prev, 
          boost: userSettings?.boost || false,
          validate: userSettings?.validate || false,
          autoFund: userSettings?.autoFund || false,
          score: userSettings?.score || 0,
          notifs: userSettings?.notifs || false,
          impactBoost: userSettings?.impactBoost || false,
          signal: isOn?.signal || false
        }));
      }
      // setLoading({
      //   validate: false,
      //   boost: false,
      //   autoFund: false,
      //   score: 0
      // });
    } catch (error) {
      console.error("Error setting invite:", error);
      // setLoading({
      //   validate: false,
      //   boost: false,
      //   autoFund: false
      // });
    }
  }

  async function getAppStatus() {
    try {
    const { sdk } = await import('@farcaster/miniapp-sdk')
      const userProfile = await sdk.context;
      console.log("add app", userProfile?.client?.added);
      if (userProfile?.client?.added) {
        setIsOn(prev => ({ ...prev, signal: true }));
      }
    } catch (error) {
      console.error("Error fetching app status:", error);
    }
  }

  useEffect(() => {
    console.log("isOn", isOn);
  }, [isOn]);

  useEffect(() => {
    getAppStatus();
  }, []);

  useEffect(() => {
    console.log("useEffect", fid, userBalances, userInfo);
    if (fid && userBalances.impact == 0) {
      console.log('getUserBalance');
      getUserBalance(fid);
    }

    if (fid && !userInfo?.username) {
      console.log('getUserInfo');
      getUserInfo();
    }

    if (fid && isOn.score == 0) {
      console.log('getUserSettings');
      getUserSettings(fid);
    }
  }, [fid]);

  async function getUserInfo() {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk')

      const isMiniApp = await sdk.isInMiniApp();
      console.log("isMiniApp", isMiniApp);
      setIsMiniApp(isMiniApp);

      const userProfile = await sdk.context;

      console.log(userProfile?.user?.fid);

      const checkUserProfile = async fid => {
        console.log("test4", fid);

        try {
          const res = await fetch(`/api/user/validateUser?fid=${fid}`);
          const data = await res.json();
          console.log('validate-usermenu', data)
          setNewUser(data?.newUser ? true : false)
          if (data?.newUser) {
            setPanelTarget('welcome')
            setPanelOpen(true)
          }
          setIsSignedIn(data?.signer ? true : false)
          return data?.valid;
        } catch (error) {
          return null;
        }
      };

      const isValidUser = await checkUserProfile(fid || userProfile?.user?.fid);
      console.log(`User is valid: ${isValidUser}`);
      console.log(isValidUser);

      if (isValidUser) {
        // setIsLogged(true)
        // setFid(Number(userProfile?.user?.fid))
        console.log("userInfo", userInfo, isMiniApp, userProfile);


        if (isMiniApp && !userInfo?.username) {
          setUserInfo({
            pfp: userProfile?.user?.pfpUrl || null,
            username: userProfile?.user?.username || null,
            display: userProfile?.user?.displayName || null
          });
        } else if (!userInfo?.username) {
          getUserProfile(fid);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function getUserProfile(fid) {
    try {
      const response = await axios.get("/api/user/getUserInfo", { params: { fid } });
      console.log("getuserInfo", response);
      if (response?.data) {
        let profile = response?.data;
        setUserInfo({
          pfp: profile?.pfp || null,
          username: profile?.username || null,
          display: profile?.display || null
        });
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      return null;
    }
  }

  async function getUserBalance(fid) {
    try {
      const response = await axios.get("/api/ecosystem/getBalances", {
        params: { fid, points: "$IMPACT" }
      });
      if (response?.data?.user) {
        console.log("um-1", response?.data?.user);
        const remainingImpact = response?.data?.user?.remaining_i_allowance || 0;
        const remainingQuality = response?.data?.user?.remaining_q_allowance || 0;
        setUserBalances(prev => ({
          ...prev,
          impact: remainingImpact,
          qdau: remainingQuality
        }));
      }
    } catch (error) {
      console.error("Error, getBalances failed:", error);
      setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }));
    }
  }

  return (
    <div
      ref={ref1}
      className="flex-row"
      style={{
        position: "fixed",
        top: 0,
        backgroundColor: "",
        height: "",
        width: `100%`,
        borderRadius: "0px",
        padding: "0",
        border: "0px solid #678",
        boxSizing: "border-box",
        zIndex: "9999"
      }}
    >
      <div
        className="flex-row"
        style={{ justifyContent: "space-between", margin: "10px 16px 10px 16px", width: "100%" }}
      >
        {userInfo?.pfp ? (
          <Link href={"/"}>
            <img
              loading="lazy"
              src={userInfo?.pfp}
              className=""
              alt={`${userInfo?.display} avatar`}
              style={{
                width: "36px",
                height: "36px",
                maxWidth: "36px",
                maxHeight: "36px",
                borderRadius: "24px",
                border: "1px solid #cdd"
              }}
            />
          </Link>
        ) : (
          <Link href={"/"}>
            <Logo className="rotate" height="36px" width="36px" style={{ fill: "#9ce" }} />
          </Link>
        )}

        <div className="flex-row" style={{ gap: "0.5rem" }}>
          {/* {userInfo?.pfp && (version == "2.0" || adminTest) && router.route !== "/" && (
            <div
              className={"flex-row items-center"}
              style={{
                border: "1px solid #999",
                padding: "5px 3px 0px 3px",
                borderRadius: "10px",
                backgroundColor: "#002244cc"
              }}
              onClick={() => router.back()}
            >
              <div className={`impact-arrow`} style={{ margin: "0 0 0 0" }}>
                <BsChevronDoubleLeft size={22} className="" style={{ fontSize: "25px", color: "#eeeeeeee" }} />
              </div>
            </div>
          )} */}


        <Link
          className={"flex-row items-center impact-arrow"}
          href={"/"}
          style={{
            border: "1px solid #999",
            padding: "0 6px",
            borderRadius: "10px",
            backgroundColor: navMenu == "home" || router.route == "/" ? "#eeeeeeee" : "#002244ee",
            margin: "0 0 0 0",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {navMenu == "home" || router.route == "/" ? (
            <BsHouseDoorFill size={22} className="" style={{ fontSize: "25px", color: "#002244ee" }} />
          ) : (
            <BsHouseDoor size={22} className="" style={{ fontSize: "25px", color: "#eeeeeeee" }} />
          )}
        </Link>


          {/* {userInfo?.pfp && (version == "1.0" || version == "2.0" || adminTest) && ( */}
            <Link href={"/~/ecosystems/abundance"}
              className={"flex-row items-center"}
              style={{
                border: "1px solid #88ccffee",
                padding: "3px 3px 3px 3px",
                borderRadius: "10px",
                backgroundColor: router.route == "/~/ecosystems/[ecosystem]" ? "#88ccffee" : "#002244ee",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <div className={`impact-arrow`} style={{ margin: "0px 0 0 0" }}>
                <FaStar size={22} className="" style={{ fontSize: "25px", color: router.route == "/~/ecosystems/[ecosystem]" ? "#002244ee" : "#88ccffee" }} />
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: router.route == "/~/ecosystems/[ecosystem]" ? "#002244ee" : "#88ccffee",
                  margin: `2px 8px 2px 2px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div>{userBalances?.impact || "0"}</div>
              </div>

              {/* <div style={{textAlign: 'center', fontSize: '13px', fontWeight: '400', color: '#eee', margin: `3px 8px 3px 5px`, width: '', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div>$impact</div>
            </div> */}
            </Link>
          {/* )} */}

          {/* {userInfo?.pfp && (version == '2.0' || adminTest) && (<div className={'flex-row items-center'} style={{border: '1px solid #999', padding: '5px 3px 0px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}}>
            <div className={`impact-arrow`} style={{margin: '0 0 0 0' }}>
              <BsCurrencyExchange size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
            </div>
          </div>)} */}

          {/* {userInfo?.pfp && (version == "1.0" || version == "2.0" || adminTest) && (
            <Link
              className={"flex-row items-center impact-arrow"}
              href={"/~/auto-fund"}
              style={{
                border: "1px solid #999",
                padding: "0 6px",
                borderRadius: "10px",
                backgroundColor: navMenu == "auto-fund" || router.route == "/~/auto-fund" ? "#224466aa" : "#002244cc",
                margin: "0 0 0 0",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {navMenu == "auto-fund" || router.route == "/~/auto-fund" ? (
                <BsPiggyBankFill size={22} className="" style={{ fontSize: "25px", color: "#99ddff" }} />
              ) : (
                <BsPiggyBank size={22} className="" style={{ fontSize: "25px", color: "#eeeeeeee" }} />
              )}
            </Link>
          )} */}

          {/* {userInfo?.pfp && (version == '2.0' || adminTest) && (<div className={'flex-row items-center'} style={{border: '1px solid #999', padding: '5px 3px 0px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}}>
            <div className={`impact-arrow`} style={{margin: '0 0 0 0' }}>
              <BsTrophy size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
            </div>
          </div>)} */}



        <Link
          className={"flex-row items-center impact-arrow"}
          href={"/~/tip"}
          style={{
            border: "1px solid #ffdd88ee",
            padding: "0 6px",
            borderRadius: "10px",
            backgroundColor: navMenu == "tip" || router.route == "/~/tip" ? "#ffdd88ee" : "#002244ee",
            margin: "0 0 0 0",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {navMenu == "rewards" || router.route == "/~/tip" ? (
            <BsCurrencyExchange size={22} className="" style={{ fontSize: "25px", color: "#002244ee" }} />
          ) : (
            <BsCurrencyExchange size={22} className="" style={{ fontSize: "25px", color: "#ffdd88ee" }} />
          )}
        </Link>


        <Link
          className={"flex-row items-center impact-arrow"}
          href={"/~/rewards"}
          style={{
            border: "1px solid #999",
            padding: "0 6px",
            borderRadius: "10px",
            backgroundColor: navMenu == "rewards" || router.route == "/~/rewards" ? "#eeeeeeee" : "#002244ee",
            margin: "0 0 0 0",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {navMenu == "rewards" || router.route == "/~/rewards" ? (
            <BsGiftFill size={22} className="" style={{ fontSize: "25px", color: "#002244ee" }} />
          ) : (
            <BsGift size={22} className="" style={{ fontSize: "25px", color: "#eeeeeeee" }} />
          )}
        </Link>

        <div
          className={"flex-row items-center impact-arrow"}
          onClick={() => openSwipeable("welcome")}
          // href={"/~/tip"}
          style={{
            border: "1px solid #999",
            padding: "0 6px",
            borderRadius: "10px",
            backgroundColor: navMenu == "about" || router.route == "/~/about" ? "#eeeeeeee" : "#002244ee",
            margin: "0 0 0 0",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {navMenu == "rewards" || router.route == "/~/about" ? (
            <BsInfoCircle size={22} className="" style={{ fontSize: "25px", color: "#002244ee" }} />
          ) : (
            <BsInfoCircle size={22} className="" style={{ fontSize: "25px", color: "#eeeeeeee" }} />
          )}
        </div>




          {/* {(version == "2.0" || adminTest) && (
            <Link
              className={"flex-row items-center impact-arrow"}
              href={"/~/settings"}
              style={{
                border: "1px solid #999",
                padding: "0 6px",
                borderRadius: "10px",
                backgroundColor: navMenu == "settings" || router.route == "/~/settings" ? "#224466aa" : "#002244cc",
                margin: "0 0 0 0",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {navMenu == "settings" || router.route == "/~/settings" ? (
                <BsGearFill size={22} className="" style={{ fontSize: "25px", color: "#99ddff" }} />
              ) : (
                <BsGear size={22} className="" style={{ fontSize: "25px", color: "#eeeeeeee" }} />
              )}
            </Link>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
