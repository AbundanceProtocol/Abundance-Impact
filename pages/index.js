import Head from 'next/head';
import Link from 'next/link';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../context'
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer'
import Item from '../components/Ecosystem/ItemWrap/Item';
import Description from '../components/Ecosystem/Description';
import ItemWrap from '../components/Ecosystem/ItemWrap';
import useMatchBreakpoints from '../hooks/useMatchBreakpoints';
import { FaPowerOff, FaLock, FaUsers, FaUser, FaGlobe, FaPlus, FaRegStar, FaCoins, FaAngleDown, FaShareAlt as Share, FaStar } from "react-icons/fa";
// import { HiOutlineAdjustmentsHorizontal as Adjust } from "react-icons/hi2";
// import { GrSchedulePlay as Sched } from "react-icons/gr";
// import { AiFillSafetyCertificate as Aligned } from "react-icons/ai";
import { GiRibbonMedal as Medal } from "react-icons/gi";
// import { MdAdminPanelSettings as Mod } from "react-icons/md";
// import { FaArrowTrendUp as Grow } from "react-icons/fa6";
// import { RiVerifiedBadgeFill as Quality } from "react-icons/ri";
import LoginButton from '../components/Layout/Modals/FrontSignin';
// import EcosystemMenu from '../components/Layout/EcosystemNav/EcosystemMenu';
import { IoMdTrophy } from "react-icons/io";
import { IoInformationCircleOutline as Info, IoLogIn } from "react-icons/io5";
import { PiSquaresFourLight as Actions, PiBankFill } from "react-icons/pi";
import { Logo } from './assets';
import useStore from '../utils/store';
import ProfilePage from './~/studio';
import axios from 'axios';
import MiniAppAuthButton from '../components/MiniAppAuthButton';
import { BsKey, BsLock, BsLockFill, BsXCircle, BsPerson, BsPersonFill, BsShieldCheck, BsShieldFillCheck, BsPiggyBank, BsPiggyBankFill, BsStar, BsStarFill, BsQuestionCircle, BsGift, BsGiftFill, BsPencilFill  } from "react-icons/bs";

import Spinner from '../components/Common/Spinner';
import NeynarSigninButton from '../components/Layout/Modals/Signin';

const version = process.env.NEXT_PUBLIC_VERSION

export default function Home() {
  const ref2 = useRef(null)
  const [ref, inView] = useInView()
  const { LoginPopup, checkEcoEligibility, ecoData, points, setPoints, isLogged, showLogin, setShowLogin, setIsLogged, fid, setFid, getRemainingBalances, isMiniApp, userBalances, setIsMiniApp, LogoutPopup, userInfo, setUserInfo, setPanelOpen, setPanelTarget, adminTest, setAdminTest } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const router = useRouter()
  const { eco, referrer, autoFund } = router.query
  const { isMobile } = useMatchBreakpoints();
  const [display, setDisplay] = useState({personal: false, ecosystem: false})
  const store = useStore()

  const [fundLoading , setFundLoading ] = useState(true);
  const [isOn, setIsOn] = useState({boost: false, validate: false, autoFund: false, fund: 0, currencies: []});
  const [expand, setExpand] = useState({boost: false, validate: false, autoFund: false});
  const [loading, setLoading] = useState({boost: false, validate: false, autoFund: false})

  const openSwipeable = (target) => {
    setPanelTarget(target);
    setPanelOpen(true);
  };



  // async function setFundingSchedule(schedule, data) {
  //   setFundLoading(true)
  //   try {
  //     console.log(fid, schedule)
  //     const response = await axios.post('/api/fund/postSchedule', { fid, schedule, data });
  //     if (response?.data) {
  //       console.log('response', response?.data)
  //       setUserFunding(response?.data?.updatedSchedule)
  //       setCuratorList(response?.data?.curators)
  //       if (response?.data?.updatedSchedule?.active_cron) {
  //         setIsOn(true)
  //       } else {
  //         setIsOn(false)
  //       }
  //       setModal({on: true, success: true, text: 'Auto-Fund updated successfully'});
  //       setTimeout(() => {
  //         setModal({on: false, success: false, text: ''});
  //       }, 2500);
  //     } else {
  //       console.log('no auto-fund response')
  //       setUserFunding(null)
  //       setCuratorList([])
  //       setModal({on: true, success: false, text: 'Auto-Fund failed to update'});
  //       setTimeout(() => {
  //         setModal({on: false, success: false, text: ''});
  //       }, 2500);
  //       setIsOn(false)
  //     }
  //     console.log('schedule-4', schedule)
  //     setFundLoading(false)
  //     return schedule
  //   } catch (error) {
  //     console.error('Error updating auto-fund:', error);
  //     setFundLoading(false)
  //     setModal({on: true, success: false, text: 'Auto-Fund failed to update'});
  //     setTimeout(() => {
  //       setModal({on: false, success: false, text: ''});
  //     }, 2500);
  //     setIsOn(false)
  //     return null
  //   }
  // }


  const closeSwipeable = () => {
    setPanelOpen(false);
    setPanelTarget(null);
  };


  const createEcosystem = () => {
    router.push({
      pathname: '/~/ecosystems',
      query: { trigger: 'createEcosystem' }
    });
  };

  const lockedSelect = () => {
    console.log('eab')
    event.preventDefault()
    LoginPopup()
  };

  const handleSignIn = async (loginData) => {
    console.log('isLogged-3')
    setFid(loginData.fid)
    setIsLogged(true)
    setShowLogin(false)
  };

  useEffect(() => {
    console.log('triggered')

    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      setScreenHeight(window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    (async () => {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      const isApp = await sdk.isInMiniApp()
      setIsMiniApp(isApp)
    })();
  }, []);

  useEffect(() => {
    console.log('version', version, userBalances.impact)
    if ((version == '2.0' || adminTest)) {
      if (userBalances.impact !== 0) {
        console.log('off-1')
        setPanelOpen(false)
        setPanelTarget(null)
      } else if (userBalances.impact == 0) {
        console.log('on-1')
        setPanelOpen(true)
        setPanelTarget('welcome')
      }
    }
  }, []);

  useEffect(() => {
    console.log('version', version, userBalances.impact)
    if ((version == '2.0' || adminTest)) {
      if (userBalances.impact !== 0) {
        console.log('off-2')
        setPanelOpen(false)
        setPanelTarget(null)
      } else if (userBalances.impact == 0) {
        console.log('on-2')
        setPanelOpen(true)
        setPanelTarget('welcome')
      }
    }
  }, [userBalances]);

  useEffect(() => {
    (async () => {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      const isApp = await sdk.isInMiniApp()
      setIsMiniApp(isApp)
    })();
  }, [isLogged]);

  async function getUserSettings(fid) {
    try {
      setLoading({
        validate: true,
        boost: true,
        autoFund: true
      })
      const response = await axios.get('/api/user/getUserSettings', {
        params: { fid } })

      console.log('response', response)

      if (response?.data) {
        const userSettings = response?.data || null
        setIsOn({
          boost: userSettings.boost || false,
          validate: userSettings.validate || false, 
          autoFund: userSettings.autoFund || false, 
          fund: userSettings.fund || 0, 
          currencies: userSettings.currencies || []
        })
      }
      setLoading({
        validate: false,
        boost: false,
        autoFund: false
      })
    } catch (error) {
      console.error('Error setting invite:', error)
      setLoading({
        validate: false,
        boost: false,
        autoFund: false
      })
    }
  }


  useEffect(() => {
    if (isLogged && fid) {
      getUserSettings(fid)
    } else if (!isLogged) {
      setIsOn({
        boost: false,
        validate: false, 
        autoFund: false, 
        fund: 0, 
        currencies: []
      })
    }
  }, [isLogged]);



  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`562px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 120}px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 10}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])

  useEffect(() => {
    if (isLogged) {
      let setEco = eco || '$IMPACT'
      let setReferrer = referrer || null
      console.log('setEco', setEco)
      setPoints(setEco)
      if (userBalances.imppact == 0) {
        getRemainingBalances(store.fid, setEco, store.signer_uuid, setReferrer)
      }
      if (autoFund && store.fid && setReferrer) {
        setAutoFundInvite(store.fid, referrer, store.signer_uuid)
      }
    }
  }, [eco, isLogged])

  async function setAutoFundInvite(fid, referrer, uuid) {
    try {
      const response = await axios.post('/api/curation/postInvite', { fid, referrer, uuid });
    } catch (error) {
      console.error('Error setting invite:', error)
    }
  }


  const ToggleSwitch = ({target}) => {
    const handleToggle = () => {
      console.log('isOn', isOn)
      if (isOn) {
        setFundingSchedule('off')
      } else {
        setFundingSchedule('on')
      }

      if (isLogged) {
        setIsOn(prev => ({...prev, [target]: !isOn[target] }))
      }
    };


    return (
      <div className="flex-row" style={{justifyContent: 'center', alignItems: 'center', margin: '0 5px 0 0'}}>

        {loading[target] && (<div className='flex-row' style={{height: '20px', alignItems: 'center', width: '20px', justifyContent: 'center', padding: '0px', position: 'relative', right: '10%', top: '0px'}}>
          <Spinner size={20} color={'#468'} />
        </div>)}


        <div
          className={`toggleSwitch ${isOn[target] ? "toggleSwitch-on" : ""}`}
          onClick={handleToggle}
        >
          <span className='circle'></span>
        </div>
      </div>
    );
  }


  function setFundingSchedule(data) {
    console.log('data', data)
  }




  return (
    <div name="feed" style={{ width: "auto", maxWidth: "620px" }} ref={ref2}>
      <Head>
        <title>Impact App | Abundance Protocol</title>
        <meta
          name="description"
          content={`Building the global superalignment layer`}
        />
      </Head>
    {(!isLogged || (version == '2.0' || adminTest)) && (
      <div id="log in"
      style={{
        padding: isMobile ? ((version == '1.0' && !adminTest) ? "58px 0 20px 0" : "48px 0 20px 0") : "58px 0 60px 0",
        width: feedMax, fontSize: '0px'
      }} >&nnsp;

      </div>
    )}

      {/* {!isLogged && ( */}
      <div style={{ padding: (!isLogged || (version == '2.0' || adminTest)) ? "0px 4px 140px 4px" : '0', width: feedMax }}>
        <div
          className="flex-col"
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!isLogged && (version == '1.0' && !adminTest) && (<Logo
            className="rotate"
            height={isMobile ? "95px" : "165px"}
            width={isMobile ? "95px" : "165px"}
            style={{ fill: "#9ce" }}
          />)}
          {!isLogged && (version == '1.0' && !adminTest) && (<Description
            {...{
              show: true,
              text: "/impact",
              padding: "30px 0 14px 5px",
              size: "title",
            }}
          />)}

          {!isLogged && (version == '1.0' && !adminTest) && (<div
            className="flex-row"
            style={{
              color: "#ace",
              width: "100%",
              fontSize: isMobile ? "18px" : "25px",
              padding: "0px 10px 5px 10px",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            /impact rewards you for your impact
          </div>)}

          {!isLogged && (version == '1.0' && !adminTest) && (<div
            className="flex-row"
            style={{
              color: "#ace",
              width: "100%",
              fontSize: isMobile ? "24px" : "33px",
              padding: "0px 10px 35px 10px",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            make an impact - get rewards
          </div>)}
          {!isLogged && (version == '1.0' && !adminTest) && (<div className='flex-row' style={{justifyContent: 'center', margin: '0 0 10px 0'}}>


          {/* WHAT IS IMPACT BUTTON */}

            <div
              className="flex-col"
              style={{
                // width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >



              <div
                className="flex-row"
                style={{
                  gap: "0.75rem",
                  margin: "20px 8px 8px 8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() =>
                    document
                      .getElementById("what is impact")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <div
                    className="flex-row cast-act-lt"
                    style={{
                      borderRadius: "8px",
                      padding: "8px 8px",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                    }}
                  >
                    {/* {!isMobile && <IoMdTrophy size={14} />} */}
                    <p
                      style={{
                        padding: "0px",
                        fontSize: isMobile ? '13px' : '15px',
                        fontWeight: "500",
                        textWrap: "nowrap",
                      }}
                    >
                      What is /impact
                    </p>
                  </div>
                </div>


              </div>

            </div>

          {/* HOW IT WORKS BUTTON */}

            <div
              className="flex-col"
              style={{
                // width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >



              <div
                className="flex-row"
                style={{
                  gap: "0.75rem",
                  margin: "20px 8px 8px 8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() =>
                    document
                      .getElementById("how it works")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <div
                    className="flex-row cast-act-lt"
                    style={{
                      borderRadius: "8px",
                      padding: "8px 8px",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                    }}
                  >
                    {/* {!isMobile && <PiBankFill size={14} />} */}
                    <p
                      style={{
                        padding: "0px",
                        fontSize: isMobile ? '13px' : '15px',
                        fontWeight: "500",
                        textWrap: "nowrap",
                      }}
                    >
                      How it works
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>)}



          {!isLogged && (version == '1.0' && !adminTest) && (<div
            className="flex-row"
            style={{
              color: "#ace",
              width: "100%",
              fontSize: isMobile ? "18px" : "23px",
              padding: "30px 10px 15px 10px",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            login to get started:
          </div>)}


          {/* {isLogged && (version == '1.0' && !adminTest) && ( */}

          {!isLogged && (version == '1.0' && !adminTest) && (
            <>
              <div>
                {showLogin ? (
                  <div
                    className="frnt-nynr-btn"
                    style={{
                      color: "white",
                      fontSize: "18px",
                      font: "Ariel",
                      textAlign: "center",
                      padding: "12px 12px 12px 32px",
                      fontWeight: "600",
                    }}
                  >
                    Connect Farcaster
                  </div>
                ) : (
                  isMiniApp ? 
                  (<MiniAppAuthButton
                    onSuccess={(fid, uuid, signers) => {
                      console.log('isLogged-3', fid)
                      store.setFid(fid);
                      store.setSignerUuid(uuid);
                      store.setIsAuth(uuid?.length > 0);

                      setFid(fid)
                      setIsLogged(true)
                      setShowLogin(false)
                      checkEcoEligibility(fid, '$IMPACT', uuid, referrer)
                    }}
                    onError={err => {
                      // Handle error (optional)
                      alert('Login failed: ' + err.message);
                    }}
                  />) : (<LoginButton onSignInSuccess={handleSignIn} />)
                )}
              </div>
              <div
                className="flex-row"
                style={{
                  color: "#59b",
                  width: isMobile ? "75%" : "50%",
                  fontSize: isMobile ? "13px" : "15px",
                  padding: "10px 10px 15px 10px",
                  justifyContent: "center",
                  textAlign: "center",
                  margin: '0 0 100px 0'
                }} >
                /impact needs your permission to create tipping casts on your behalf
              </div>
            </>
          )}
        </div>





        {!isLogged && (version == '1.0' && !adminTest) && (<div
          id="what is impact"
          style={{
            padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
            width: "40%",
          }} >
        </div>)}


        {!isLogged && (version == '1.0' && !adminTest) && (<div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }} >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }} >
            <Description
              {...{
                show: true,
                text: "What is /impact",
                padding: "4px 0 4px 10px",
                size: "large",
              }}
            />
          </div>

          <div className='flex-row page-t3' style={{ fontSize: isMobile ? "15px" : "17px" }} >
            /impact is working toward an 'Impact = Profit' economy.
          </div>

          <div className='flex-row page-t3' style={{ fontSize: isMobile ? "15px" : "17px" }} >
            We want everyone on Farcaster (and beyond) to prosper simply by making meaningful contributions in their community & the world. /impact is the first step in that journey.
          </div>


          <div className='flex-row page-t3' style={{ fontSize: isMobile ? "15px" : "17px" }} >
            We're creating an Impact Market where curators are rewarded for proactively finding and evaluating impactful content and work on Farcaster.
          </div>


          <div className='flex-row page-t3' style={{ fontSize: isMobile ? "15px" : "17px" }} >
            We're then rewarding members for growing this ecosystem and tipping impactful creators & builders.
          </div>

          <div className='flex-row page-t3' style={{ fontSize: isMobile ? "15px" : "17px" }} >
            As the ecosystem grows a feedback loop will start forming between the impact created and the Network Economy.
          </div>

          <div className='flex-row page-t3' style={{ fontSize: isMobile ? "15px" : "17px", display: 'inline-block' }} >
            Read about the <Link href="https://paragraph.xyz/@abundance/the-secret-impact-alpha-master-plan" target="_blank">
              <span style={{ textDecoration: "underline" }} >Secret Impact Alpha Master Plan</span>
            </Link>
          </div>


          <div
            className="flex-row"
            style={{
              padding: "0px 0 0 0",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }} >
          </div>
        </div>)}




        {!isLogged && (version == '1.0' && !adminTest) && (<div
          id="how it works"
          style={{
            padding: isMobile ? "128px 0 20px 0" : "128px 0 20px 0",
            width: "40%",
          }} >
          </div>)}




        {!isLogged && (version == '1.0' && !adminTest) && (<div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }} >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }} >
            <Description
              {...{
                show: true,
                text: "How it works",
                padding: "4px 0 14px 10px",
                size: "large",
              }}
            />
          </div>


          <div
            className="flex-row"
            style={{
              padding: "0px 0 0 0",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }} >


            <ItemWrap>
              <Item
                {...{
                  icon: IoMdTrophy,
                  text: "Impact Score",
                  description:
                    `/impact is currently running Daily Impact Rewards`,
                }}
              />
              <Item
                {...{ 
                  noIcon: true,
                  description: `You need a 3-day Impact Score of min 0.25 to be eligible` }}
              />

              <Item
                {...{ 
                  noIcon: true,
                  description: `Your chance to win Impact Rewards grow the more you curate, contribute and invite quality members into the ecosystem` }}
              />

            </ItemWrap>



            <ItemWrap>
              <Item
                {...{
                  icon: Medal,
                  text: "Curate",
                  description:
                    `You get a daily allowance of $IMPACT points`,
                }}
              />
              <Item
                {...{
                  noIcon: true,
                  description: `Stake these points on casts based on their value to the Farcaster ecosystem`,
                }}
              />
              <Item
                {...{ 
                  noIcon: true,
                  description: `Overvaluing casts can result in a downvote, which lowers your future $IMPACT allowance` }}
              />
              <Item
                {...{ 
                  noIcon: true,
                  description: `
                  90% of rewards flow to creators, and 10% to curators` }}
              />
            </ItemWrap>


            <ItemWrap>
              <Item
                {...{
                  icon: PiBankFill,
                  text: "Auto-Fund",
                  description: `Don't let your allowance go to waste `,
                }}
              />
              <Item
                {...{ 
                  noIcon: true,
                  description: `
                  Auto-Fund automatically distributes your remaining $degen & $ham allowances to impactful builders and creators on Farcaster - and rewards you in the process` }}
              />
            </ItemWrap>

            <ItemWrap>
              <Item
                {...{
                  icon: FaUsers,
                  text: "Invite",
                  description:
                    "Invite your friends to use Impact Alpha - win rewards. ",
                }}
              />
              <Item
                {...{ 
                  noIcon: true,
                  description: `
                  any /impact frame you share has your referral` }}
              />
            </ItemWrap>


            <ItemWrap crsr={true}>
              <div onClick={() =>
              document
                .getElementById("log in")
                .scrollIntoView({ behavior: "smooth" })
              }>
                <Item
                  {...{
                    icon: IoLogIn,
                    text: "Login",
                    description:
                      "Log in to get started",
                  }}
                />
              </div>
            </ItemWrap>

          </div>
        </div>)}




        <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>

          {!isLogged && (version == '1.0' && !adminTest) && (<div
            id="autoFund"
            style={{
              padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
              width: "40%",
            }}
          ></div>)}



          {/* LOGIN */}

          {(version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

            <div className='shadow flex-col'
              style={{
                backgroundColor: "#002244",
                borderRadius: "15px",
                border: "1px solid #11447799",
                width: isMiniApp || isMobile ? '340px' : '100%',
                margin: isMiniApp || isMobile ? '0px auto' : '', 
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
                  margin: '0 0 10px 0'
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
                      // Handle error (optional)
                      alert('Login failed: ' + err.message);
                    }}
                  />) : (<div style={{width: '125px', height: '36px', transform: 'scale(0.85)', transformOrigin: 'center'}}><NeynarSigninButton onSignInSuccess={handleSignIn} /></div>)}

              </div>





              <div className='flex-col' style={{backgroundColor: "#002244ff", padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: '#ace', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>
                <div>
                  You need to login to enable Boosting, Auto-funding or Quests
                </div>
              </div>
            </div>
          </div>
          )}




          {/* BOOST & NOMINATE */}

          {(version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

            <div className='shadow flex-col'
              style={{
                backgroundColor: isLogged ? "#002244" : '#333',
                borderRadius: "15px",
                border: isLogged ? "1px solid #11447799" : "1px solid #555",
                width: isMiniApp || isMobile ? '340px' : '100%',
                margin: isMiniApp || isMobile ? '40px auto 0 auto' : '40px auto 0 auto',
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
                  margin: '0 0 10px 0'
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

                
                  <BsStarFill style={{ fill: "#cde" }} size={20} />
                  <div>


                    <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                      <div className="top-layer flex-row">
                        <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                          <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                            Boost & Nominate
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

                <ToggleSwitch target={'boost'} />

              </div>




              <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>
                <div>
                  Nominate casts to be boosted and rewarded based on their impact on Farcaster - earn rewards
                </div>
                <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                  <BsQuestionCircle size={15} onClick={() => {
                      openSwipeable("boost"); }} />
                </div>
              </div>
            </div>
          </div>
          )}


          {/* VALIDATE */}

          {(version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

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
                  margin: '0 0 10px 0'
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
                
                  <BsShieldFillCheck style={{ fill: "#cde" }} size={20} />
                  <div>

                    <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                      <div className="top-layer flex-row">
                        <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                          <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                            Validate
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

                <ToggleSwitch target={'validate'} />

              </div>

              <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>
                <div>
                  Ensure the quality of nominations - earn rewards
                </div>
                <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                  <BsQuestionCircle size={15} onClick={() => {
                      openSwipeable("validate"); }} />
                </div>
              </div>
            </div>
          </div>

          )}


          {/* AUTO-FUND */}

          {(version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

            <div className='shadow flex-col'
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

                }}
              >


                <div
                  className="flex-row"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: "0px 0 0 4px",
                    margin: '0 0 0px 0'
                  }} >


                
                  <BsPiggyBankFill style={{ fill: "#cde" }} size={20} />
                  <div>


                    <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                      <div className="top-layer flex-row">
                        <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                          <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                            Auto-fund
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
                <Link href={'/~/auto-fund'}>
                  <div style={{padding: '4px 5px 1px 5px', border: '1px solid #ace', borderRadius: '8px', backgroundColor: '#22446666'}}>
                    <BsPencilFill color={'#ace'} size={16} />
                  </div>
                </Link>
                <ToggleSwitch target={'autoFund'} />
              </div>


              <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>
                <div>
                  Support creators with your remaining $degen and $tipn allowances - earn rewards
                </div>

                <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                  <BsQuestionCircle size={15} onClick={() => {
                    openSwipeable("autoFund"); }} />
                </div>
              </div>
            </div>
          </div>
          )}



          {fid && fid == 9326 && adminTest && (<div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "17px",
              padding: "10px 10px 15px 10px",
              justifyContent: "center",
              userSelect: 'none',
              gap: '1rem'
            }} >
            <div style={{padding: '5px', border: '1px solid #777', backgroundColor: adminTest ? '#246' : '#ace', color: adminTest ? '#ace' : '#246', cursor: 'pointer'}} onClick={() => setAdminTest(false)}>Impact 1.0</div>
            <div style={{padding: '5px', border: '1px solid #777', backgroundColor: adminTest ? '#ace' : '#246', color: adminTest ? '#246' : '#ace', cursor: 'pointer'}} onClick={() => setAdminTest(true)}>Impact 2.0</div>

            <div style={{padding: '5px', border: '1px solid #777', backgroundColor: adminTest ? '#ace' : '#246', color: adminTest ? '#246' : '#ace', cursor: 'pointer'}}>{'userInfo.pfp: ' + userInfo?.pfp + 'userInfo.display: ' + userInfo?.display + 'userBalances.impact: ' + userBalances?.impact}</div>
          </div>)}
        </div>
      </div>
      {!isLogged && (<div ref={ref}>&nbsp;</div>)}
      {(version == '2.0' || adminTest) || (version == '1.0' && !adminTest) && isLogged && <ProfilePage />}
    </div>
  );
}