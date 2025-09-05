'use client'
import Head from 'next/head';
import Link from 'next/link';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../../context'
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer'
// import Item from '../../components/Ecosystem/ItemWrap/Item';
// import Description from '../../components/Ecosystem/Description';
// import ItemWrap from '../../components/Ecosystem/ItemWrap';
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';
import { FaPowerOff, FaLock, FaUsers, FaUser, FaGlobe, FaPlus, FaRegStar, FaCoins, FaAngleDown, FaShareAlt as Share, FaStar } from "react-icons/fa";
// import { GiRibbonMedal as Medal } from "react-icons/gi";
// import { IoMdTrophy } from "react-icons/io";
// import { IoInformationCircleOutline as Info, IoLogIn } from "react-icons/io5";
// import { PiSquaresFourLight as Actions, PiBankFill } from "react-icons/pi";
// import { Logo } from './assets';
import useStore from '../../utils/store';
import ProfilePage from './studio';
import axios from 'axios';
import MiniAppAuthButton from '../../components/MiniAppAuthButton';
import { BsKey, BsLock, BsLockFill, BsXCircle, BsPerson, BsPersonFill, BsShieldCheck, BsShieldFillCheck, BsPiggyBank, BsPiggyBankFill, BsStar, BsStarFill, BsQuestionCircle, BsGift, BsGiftFill, BsPencilFill, BsInfoCircle, BsBellSlash, BsBell, BsFillRocketTakeoffFill, BsShareFill } from "react-icons/bs";
import Modal from '../../components/Layout/Modals/Modal';
import Spinner from '../../components/Common/Spinner';
import NeynarSigninButton from '../../components/Layout/Modals/Signin';
import { formatNum } from '../../utils/utils';
// import LoginButton from '../../components/Layout/Modals/FrontSignin';

const version = process.env.NEXT_PUBLIC_VERSION

export default function Settings({test, rewards, onSettingsChange}) {
  const ref2 = useRef(null)
  const [ref, inView] = useInView()
  const { LoginPopup, checkEcoEligibility, ecoData, points, setPoints, isLogged, setShowLogin, setIsLogged, fid, setFid, getRemainingBalances, isMiniApp, userBalances, setIsMiniApp, LogoutPopup, userInfo, setUserInfo, setPanelOpen, setPanelTarget, adminTest, setAdminTest } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  // const [showPopup, setShowPopup] = useState({open: false, url: null})
  const router = useRouter()
  const { eco, referrer, autoFund } = router.query
  const { isMobile } = useMatchBreakpoints();
  // const [display, setDisplay] = useState({personal: false, ecosystem: false})
  const store = useStore()

  const [fundLoading , setFundLoading ] = useState(true);
  const [isOn, setIsOn] = useState({boost: false, validate: false, autoFund: false, notifs: false, impactBoost: false});
  // const [expand, setExpand] = useState({boost: false, validate: false, autoFund: false});
  const [loading, setLoading] = useState({boost: false, validate: false, autoFund: false, impactBoost: false})

  const [showLoginNotice, setShowLoginNotice] = useState(!isLogged);
  const [notifStatus, setNotifStatus] = useState({app: false, notifs: false})
  const [needNotif, setNeedNotif] = useState(false)
  const [modal, setModal] = useState({on: false, success: false, text: ''})

  useEffect(() => {
    if (!isLogged) {
      setShowLoginNotice(true);
    } else {
      setTimeout(() => setShowLoginNotice(false), 500);
    }
  }, [isLogged]);

  // Notify parent component when isOn state changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(isOn);
    }
  }, [isOn, onSettingsChange]);

  const openSwipeable = (target) => {
    setPanelTarget(target);
    setPanelOpen(true);
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
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const isApp = await sdk.isInMiniApp()
      setIsMiniApp(isApp)


      const userProfile = await sdk.context
      if (isApp && userProfile?.user?.fid == 9326) {
        setAdminTest(true)
      }

      if (isApp) {
        const client = sdk.context.client;
        console.log('client', client, userProfile.client)
        if (userProfile.client.added) {
          if (userProfile.client.notificationDetails) {
            setNotifStatus({
              app: true,
              notifs: true
            })
          } else {
            setNotifStatus({
              app: true,
              notifs: false
            })
          }
        } else {
          setNotifStatus({
            app: false,
            notifs: false
          })        
        }
      }


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
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const isApp = await sdk.isInMiniApp()
      setIsMiniApp(isApp)
    })();
  }, [isLogged]);

  async function getUserSettings(fid) {
    try {
      setLoading({
        validate: true,
        boost: true,
        autoFund: true,
        impactBoost: true
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
          impactBoost: userSettings.impactBoost || false,
          score: userSettings.score || 0,
          notifs: userSettings.notifs || false
        })
      }
      setLoading({
        validate: false,
        boost: false,
        autoFund: false,
        impactBoost: false,
        score: 0
      })
    } catch (error) {
      console.error('Error setting invite:', error)
      setLoading({
        validate: false,
        boost: false,
        autoFund: false,
        impactBoost: false,
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
        impactBoost: false,
        score: 0,
        notifs: false
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

  async function updateSettings(setting, data) {
    try {
      const response = await axios.post("/api/user/postSettings", { fid, setting, data });
      console.log('response', response)
      return response?.data?.updatedSettings
    } catch (error) {
      console.error('Failed:', error, error?.response?.data?.message)
      if (error?.response?.data?.message) {
        return error?.response?.data?.message
      } else {
        return null
      }
    }
  }


  const shareCuration = async () => {
    if (fid) {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const isApp = await sdk.isInMiniApp();
  
      let impactLabel = ''

      let counter = 0
      if (isOn.boost) {
        counter++
      }
      if (isOn.validate) {
        counter++
      }
      if (isOn.impactBoost) {
        counter++
      }
      if (isOn.autoFund) {
        counter++
      }
  
      if (counter == 1) {
        if (isOn.boost) {
          impactLabel = 'a Signal Booster'
        } else if (isOn.validate) {
          impactLabel = 'an Impact Defender'
        } else if (isOn.impactBoost) {
          impactLabel = 'an Impact Booster'
        } else if (isOn.autoFund) {
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



  const ToggleSwitch = ({target}) => {
    const handleToggle = async () => {
      console.log('isOn', isOn)
      if (isOn) {
        setFundingSchedule('off')
      } else {
        setFundingSchedule('on')
      }

      if (isLogged) {
        if (target !== 'validate') {

          if (target == 'boost') {
            if (isOn[target] == false) {
              setLoading(prev => ({...prev, [target]: true }))
                try {
                  const response = await updateSettings("boost-on")
                  console.log(response)
                } catch (error) {
                  console.error('Failed:', error)
                }
              setLoading(prev => ({...prev, [target]: false }))
            } else if (isOn[target] == true) {
              setLoading(prev => ({...prev, [target]: true }))
                try {
                  const response = await updateSettings("boost-off")
                  console.log(response)
                } catch (error) {
                  console.error('Failed:', error)
                }
              setLoading(prev => ({...prev, [target]: false }))
            }
          } else if (target == 'autoFund') {
            if (isOn[target] == false) {
              setLoading(prev => ({...prev, [target]: true }))
                try {
                  const response = await updateSettings("autoFund-on")
                  console.log(response)
                } catch (error) {
                  console.error('Failed:', error)
                }
              setLoading(prev => ({...prev, [target]: false }))
            } else if (isOn[target] == true) {
              setLoading(prev => ({...prev, [target]: true }))
                try {
                  const response = await updateSettings("autoFund-off")
                  console.log(response)
                } catch (error) {
                  console.error('Failed:', error)
                }
              setLoading(prev => ({...prev, [target]: false }))
            }
          } else if (target == 'impactBoost') {
            if (isOn[target] == false) {
              setLoading(prev => ({...prev, [target]: true }))
                try {
                  const response = await updateSettings("impactBoost-on")
                  console.log(response)
                } catch (error) {
                  console.error('Failed:', error)
                }
              setLoading(prev => ({...prev, [target]: false }))
            } else if (isOn[target] == true) {
              setLoading(prev => ({...prev, [target]: true }))
                try {
                  const response = await updateSettings("impactBoost-off")
                  console.log(response)
                } catch (error) {
                  console.error('Failed:', error)
                }
              setLoading(prev => ({...prev, [target]: false }))
            }
          }
          setIsOn(prev => ({...prev, [target]: !isOn[target] }))
        } else if (target == 'validate' && isOn.notifs) {
          if (isOn[target] == false) {
            setLoading(prev => ({...prev, [target]: true }))
              try {
                const response = await updateSettings("validate-on")
                console.log(response)
                if (response?.data?.message && response?.data?.message == 'Turn on notifications') {
                  setModal({on: true, success: false, text: 'Turn on notifications'});
                  setTimeout(() => {
                    setModal({on: false, success: false, text: ''});
                  }, 2500);
                  setNotifStatus({
                    app: false,
                    notifs: false
                  })
                  setIsOn({...isOn, notifs: false})
                }
              } catch (error) {
                console.error('Failed:', error)
              }
            setLoading(prev => ({...prev, [target]: false }))
          } else if (isOn[target] == true) {
            setLoading(prev => ({...prev, [target]: true }))
              try {
                const response = await updateSettings("validate-off")
                console.log(response)
                if (response?.data?.message && response?.data?.message == 'Turn on notifications') {
                  setModal({on: true, success: false, text: 'Turn on notifications'});
                  setTimeout(() => {
                    setModal({on: false, success: false, text: ''});
                  }, 2500);
                  setNotifStatus({
                    app: false,
                    notifs: false
                  })
                  setIsOn({...isOn, notifs: false})
                }
              } catch (error) {
                console.error('Failed:', error)
              }
            setLoading(prev => ({...prev, [target]: false }))
          }




          setIsOn(prev => ({...prev, [target]: !isOn[target] }))
        } else if (target == 'validate' && !isOn.notifs) {
          setNeedNotif(true)
          setTimeout(() => {
            setNeedNotif(false)
          }, 500)
        }
      }
    };




    return (
      <div className="flex-row" style={{justifyContent: 'center', alignItems: 'center', margin: '0 5px 0 0'}}>

        {loading[target] && (<div className='flex-row' style={{height: '20px', alignItems: 'center', width: '20px', justifyContent: 'center', padding: '0px', position: 'relative', right: '10%', top: '0px'}}>
          <Spinner size={20} color={'#468'} />
        </div>)}


        <div
          className={`toggleSwitch ${(isOn[target] && !(target == 'validate' && !isOn.notifs)) ? "toggleSwitch-on" : ""}`}
          onClick={handleToggle}>
          <span className='circle'></span>
        </div>
      </div>
    );
  }

  function setFundingSchedule(data) {
    console.log('data', data)
  }

  async function notifsOn() {
    try {
      if (isMiniApp) {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        const userProfile = await sdk.context

        console.log('isMiniApp', isMiniApp, notifStatus.app, notifStatus.notifs, userProfile.client.added, userProfile.client.notificationDetails)

        if (userProfile.client.added && !userProfile.client.notificationDetails) {
          console.log('notifs off')

          const result = await sdk.actions.addMiniApp()

          // const result = await sdk.actions.addFrame();
          console.log('result2', result)

          if (result.notificationDetails) {
            const notifUpdate = await axios.post('/api/user/postNotification', { fid, notif: result.notificationDetails });

            if (notifUpdate?.data) {
              console.log('test1', notifUpdate?.data)
              setNotifStatus({
                app: true,
                notifs: true
              })
              setIsOn({...isOn, notifs: true})
            }
          }

        } else if (!userProfile.client.added && !userProfile.client.notificationDetails) {
          console.log('app off')

          const result = await sdk.actions.addMiniApp()
          console.log('result1', result)
          if (result.notificationDetails) {
            const notifUpdate = await axios.post('/api/user/postNotification', { fid, notif: result.notificationDetails });

            if (notifUpdate?.data) {
              console.log('test2', notifUpdate?.data)
              setNotifStatus({
                app: true,
                notifs: true
              })
              setIsOn({...isOn, notifs: true})
            }
          }

        } else if (userProfile.client.added && userProfile.client.notificationDetails) {

          console.log('app on')

          const notifUpdate = await axios.post('/api/user/postNotification', { fid, notif: result.notificationDetails });
          if (notifUpdate?.data) {
            console.log('test3', notifUpdate?.data)
            setNotifStatus({
              app: true,
              notifs: true
            })
            setIsOn({...isOn, notifs: true})
          }
        }
      
      } else {
        console.log('not miniapp')
      }

    } catch(error) {
      console.error('Notification setting failed', error)
      setIsOn({...isOn, notifs: false})

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
    {(!rewards && (!isLogged || (version == '2.0' || adminTest))) && (
      <div id="log in"
      style={{
        padding: isMobile ? ((version == '1.0' && !adminTest) ? "58px 0 20px 0" : "48px 0 20px 0") : "58px 0 60px 0",
        width: feedMax, fontSize: '0px'
      }} >&nnsp;

      </div>
    )}

      {/* {!isLogged && ( */}
      {/* <div style={{ padding: (!isLogged || (version == '2.0' || adminTest)) ? "0px 4px 0px 4px" : '0', width: feedMax }}> */}

        {/* <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}> */}

          {!isLogged && (version == '1.0' && !adminTest) && (<div
            id="autoFund"
            style={{
              padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
              width: "40%",
            }}
          ></div>)}



          {/* LOGIN */}

          {(!rewards && (version == '2.0' || adminTest)) && (<div className='flex-col' style={{backgroundColor: ''}}>

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
                      // Handle error (optional)
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
          )}


          {(!rewards && ((version == '2.0' || adminTest) && isLogged)) && (<div className='flex-row' style={{backgroundColor: '', justifyContent: 'center', gap: '1rem', margin: '20px 0 -20px 0'}}>
            <div className='flex-col' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.boost) ? '#0af' : '#aaa'}`, borderRadius: '18px', backgroundColor: '', alignItems: 'center', gap: '0.0rem', height: '90px', justifyContent: 'center'}}>
              <div className='flex-row' style={{gap: '0.5rem', alignItems: 'center', padding: '0 10px'}}>
                <BsStar color={(isLogged && isOn.boost) ? '#0af' : '#aaa'} size={40} />
                <div style={{fontSize: '43px', fontWeight: '700', color: (isLogged && isOn.boost) ? '#0af' : '#aaa'}}>
                  {userBalances.impact}
                </div>

              </div>
              <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.boost) ? '#0af' : '#aaa'}}>
                Daily Points
              </div>
            </div>

            <div className='flex-col' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.boost) ? '#0af' : '#aaa'}`, borderRadius: '18px', backgroundColor: '', alignItems: 'center', gap: '0.0rem', height: '90px', justifyContent: 'center', width: '135px'}}>
              <div className='flex-row' style={{gap: '0.5rem', alignItems: 'center', padding: '0 10px'}}>
                {/* <BsStar color={(isLogged && isOn.boost) ? '#0af' : '#aaa'} size={40} /> */}
                <div style={{fontSize: '43px', fontWeight: '700', color: (isLogged && isOn.boost) ? '#0af' : '#aaa'}}>
                  {formatNum(isOn?.score?.toFixed(0) || 0)}
                </div>

              </div>
              <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.boost) ? '#0af' : '#aaa'}}>
                Impact Score
              </div>
            </div>


          </div>)}


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
                            Signal & Boost
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




              <div className='flex-row' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>

                <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.boost) ? '#0af' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                  <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.boost) ? '#0af' : '#aaa'}}>
                    +30
                  </div>
                  <BsStar color={(isLogged && isOn.boost) ? '#0af' : '#aaa'} size={13} />
                </div>

                <div>
                  Nominate impactful casts, become an Impact Booster to grow your Impact Score & earn rewards
                </div>
                <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                  <BsInfoCircle size={15} onClick={() => {
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

                {isOn.notifs ? (
                  <div style={{padding: '4px 5px 1px 5px', border: '1px solid #ace', borderRadius: '8px', backgroundColor: '#22446666'}}>
                    <BsBell color={'#ace'} size={16} />
                  </div>
                ) : (
                  <div style={{padding: '4px 5px 1px 5px', border: needNotif ? '1px solid #f00' :  '1px solid #ace', borderRadius: '8px', backgroundColor: needNotif ? '#fcc' : '#22446666'}} onClick={notifsOn}>
                    <BsBellSlash color={needNotif ? '#f00' : '#ace'} size={16} />
                  </div>
                )}

                <ToggleSwitch target={'validate'} />

              </div>

              <div className='flex-row' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>

                <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                  <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'}}>
                    +15
                  </div>
                  <BsStar color={(isLogged && isOn.validate && isOn.boost && isOn.notifs) ? '#0af' : (isLogged && isOn.validate) ? '#ace' : '#aaa'} size={13} />
                </div>

                <div>
                  Ensure the quality of nominations - earn rewards
                </div>
                <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                  <BsInfoCircle size={15} onClick={() => {
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


              <div className='flex-row' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>

                <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.autoFund && isOn.boost) ? '#0af' : (isLogged && isOn.autoFund) ? '#ace' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                  <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.autoFund && isOn.boost) ? '#0af' : (isLogged && isOn.autoFund) ? '#ace' : '#aaa'}}>
                    +14
                  </div>
                  <BsStar color={(isLogged && isOn.autoFund && isOn.boost) ? '#0af' : (isLogged && isOn.autoFund) ? '#ace' : '#aaa'} size={13} />
                </div>

                <div>
                  Support creators with your remaining $tipn allowances - earn rewards
                </div>

                <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                  <BsInfoCircle size={15} onClick={() => {
                    openSwipeable("autoFund"); }} />
                </div>
              </div>
            </div>
          </div>
          )}




          {rewards && (<div className='flex-col' style={{backgroundColor: ''}}>

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


              
                <BsFillRocketTakeoffFill style={{ fill: "#cde" }} size={20} />
                <div>


                  <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                    <div className="top-layer flex-row">
                      <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                        <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                          Impact Boost
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

              <ToggleSwitch target={'impactBoost'} />
            </div>


            <div className='flex-row' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>

              <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.impactBoost && isOn.boost) ? '#0af' : (isLogged && isOn.impactBoost) ? '#ace' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.impactBoost && isOn.boost) ? '#0af' : (isLogged && isOn.impactBoost) ? '#ace' : '#aaa'}}>
                  +10
                </div>
                <BsStar color={(isLogged && isOn.impactBoost && isOn.boost) ? '#0af' : (isLogged && isOn.impactBoost) ? '#ace' : '#aaa'} size={13} />
              </div>

              <div>
                Auto-boost Impact-centered casts from @abundance - earn rewards
              </div>

              <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                <BsInfoCircle size={15} onClick={() => {
                  openSwipeable("impactBoost"); }} />
              </div>
            </div>
          </div>
          </div>
          )}







          {rewards && (<div className='flex-col' style={{backgroundColor: ''}}>

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


              
                <BsShareFill style={{ fill: "#cde" }} size={20} />
                <div>


                  <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                    <div className="top-layer flex-row">
                      <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                        <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                          Share
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
                        height: "30px",
                        width: "75px",
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
                        Share
                      </p>
                    </div>
                  </div>
                </div>
              </div>





              {/* <ToggleSwitch target={'impactBoost'} /> */}
            </div>


            <div className='flex-row' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>

              <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(isLogged && isOn.impactBoost && isOn.boost) ? '#0af' : (isLogged && isOn.impactBoost) ? '#ace' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
                <div style={{fontSize: '13px', fontWeight: '700', color: (isLogged && isOn.impactBoost && isOn.boost) ? '#0af' : (isLogged && isOn.impactBoost) ? '#ace' : '#aaa'}}>
                  +2
                </div>
                <BsStar color={(isLogged && isOn.impactBoost && isOn.boost) ? '#0af' : (isLogged && isOn.impactBoost) ? '#ace' : '#aaa'} size={13} />
              </div>

              <div>
                Share your impact to boost your score (up to 2 points per day)
              </div>

              {/* <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
                <BsInfoCircle size={15} onClick={() => {
                  openSwipeable("impactBoost"); }} />
              </div> */}
            </div>
          </div>
          </div>
          )}


        {/* </div> */}
      {/* </div> */}
      {/* {!isLogged && (<div ref={ref}>&nbsp;</div>)} */}
      {(version == '2.0' || adminTest) || (version == '1.0' && !adminTest) && isLogged && <ProfilePage />}
      <Modal modal={modal} />
    </div>
  )
}