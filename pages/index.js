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
import { FaLock, FaUsers, FaUser, FaGlobe, FaPlus, FaRegStar, FaCoins, FaAngleDown, FaShareAlt as Share } from "react-icons/fa";
import { HiOutlineAdjustmentsHorizontal as Adjust } from "react-icons/hi2";
import { GrSchedulePlay as Sched } from "react-icons/gr";
import { AiFillSafetyCertificate as Aligned } from "react-icons/ai";
import { GiRibbonMedal as Medal } from "react-icons/gi";
import { MdAdminPanelSettings as Mod } from "react-icons/md";
import { FaArrowTrendUp as Grow } from "react-icons/fa6";
import { RiVerifiedBadgeFill as Quality } from "react-icons/ri";
import LoginButton from '../components/Layout/Modals/FrontSignin';
import EcosystemMenu from '../components/Layout/EcosystemNav/EcosystemMenu';
import { IoMdTrophy } from "react-icons/io";
import { IoInformationCircleOutline as Info, IoLogIn } from "react-icons/io5";
import { PiSquaresFourLight as Actions, PiBankFill } from "react-icons/pi";
import { Logo } from './assets';
import useStore from '../utils/store';
import ProfilePage from './~/studio';
import axios from 'axios';
import MiniAppAuthButton from '../components/MiniAppAuthButton';

export default function Home() {
  const ref2 = useRef(null)
  const [ref, inView] = useInView()
  const { LoginPopup, checkEcoEligibility, ecoData, points, setPoints, isLogged, showLogin, setShowLogin, setIsLogged, setFid, getRemainingBalances, isMiniApp, userBalances } = useContext(AccountContext)
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

  function toggleMenu(target) {
    setDisplay(prev => ({...prev, [target]: !display[target] }))
  }

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

  // const handleSignIn = async (loginData) => {
  //   console.log('isLogged-3')
  //   setFid(loginData.fid)
  //   setIsLogged(true)
  //   setShowLogin(false)
  // };

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

  return (
    <div name="feed" style={{ width: "auto", maxWidth: "620px" }} ref={ref2}>
      <Head>
        <title>Impact App | Abundance Protocol</title>
        <meta
          name="description"
          content={`Building the global superalignment layer`}
        />
      </Head>
    {!isLogged && (<div id="log in"
      style={{
        padding: isMobile ? "58px 0 20px 0" : "58px 0 60px 0",
        width: feedMax,
      }}
    ></div>)}

      {!isLogged && (<div style={{ padding: "0px 4px 140px 4px", width: feedMax }}>
        <div
          className="flex-col"
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Logo
            className="rotate"
            height={isMobile ? "95px" : "165px"}
            width={isMobile ? "95px" : "165px"}
            style={{ fill: "#9ce" }}
          />
          <Description
            {...{
              show: true,
              text: "/impact",
              padding: "30px 0 14px 5px",
              size: "title",
            }}
          />

          <div
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
          </div>

          <div
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
          </div>


          <div className='flex-row' style={{justifyContent: 'center', margin: '0 0 10px 0'}}>


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






          </div>



          <div
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
          </div>



          {!isLogged && (
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
                  <MiniAppAuthButton
                    onSuccess={(fid, uuid, signers) => {
                      console.log('isLogged-3', fid)
                      setFid(fid)
                      setIsLogged(true)
                      setShowLogin(false)
                      checkEcoEligibility(fid, '$IMPACT', uuid, referrer)
                    }}
                    onError={err => {
                      // Handle error (optional)
                      alert('Login failed: ' + err.message);
                    }}
                  />
                  // <LoginButton onSignInSuccess={handleSignIn} />
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
                }}
              >
                /impact needs your permission to create tipping casts on your behalf
              </div>
            </>
          )}
        </div>





        <div
          id="what is impact"
          style={{
            padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
            width: "40%",
          }}
        ></div>





        <div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }}
        >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }}
          >
            {/* <FaGlobe style={{ fill: "#cde" }} size={24} /> */}
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
            }}
          >




          </div>

        </div>




        <div
          id="how it works"
          style={{
            padding: isMobile ? "128px 0 20px 0" : "128px 0 20px 0",
            width: "40%",
          }}
        ></div>




        <div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }}
        >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }}
          >
            {/* <FaGlobe style={{ fill: "#cde" }} size={24} /> */}
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
            }}
          >


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
        </div>



      </div>)}


      {!isLogged && (<div ref={ref}>&nbsp;</div>)}
      {isLogged && <ProfilePage />}
    </div>
  );
}