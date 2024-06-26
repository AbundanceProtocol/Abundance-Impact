import '../styles/index.css';
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useCallback, useState, useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import { HiChevronUp as CollapseIcon, HiMenu } from 'react-icons/hi';
import { FaPen, FaStar, FaRegStar } from 'react-icons/fa';
import { AccountContext } from '../context'
import useStore from '../utils/store'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints';
import useAuth from '../hooks/useAuth';
import {Logo } from './assets'
import { button } from './assets/button';
// import ConnectButton from '../components/ConnectButton';
import NeynarSigninButton from '../components/Signin';
// import { IoIosWarning } from "react-icons/io"
import { FaLock } from "react-icons/fa";
import axios from 'axios';
import { PiSquaresFourLight as Actions } from "react-icons/pi";
import { IoInformationCircleOutline as Info } from "react-icons/io5";
import Creators from '../components/Leaderboard/Creators';
// import qs from "querystring";
import { shortenAddress, getTokenAddress } from '../utils/utils';
import { ImCross, ImCheckmark } from "react-icons/im";

export default function App({ Component, pageProps }) {
  const secretKey = process.env.SECRET_KEY
  const botUuid = process.env.BOT_UUID
  const store = useStore()
  const auth = useAuth();
  const { isMobile, isTablet } = useMatchBreakpoints();
  const ref = useRef(null)
  const ref1 = useRef(null)
  const [isLogged, setIsLogged] = useState()
  const [bottomNavSize, setBottomNavSize] = useState(ref?.current?.offsetWidth)
  const [navSize, setNavSize] = useState(1060)
  const [ecoSched, setEcoSched] = useState(false)

  const router = useRouter()
  const [navWidth, setNavWidth] = useState((ref?.current?.offsetWidth - 1312)/2 - 167)
  const [linkTarget, setLinkTarget] = useState('Vision')
  const initEcosystem = [{
    channels: [],
    condition_channels: false,
    condition_curators_threshold: 1,
    condition_following_channel: false,
    condition_following_owner: false,
    condition_holding_erc20: false,
    condition_holding_nft: false,
    condition_points_threshold: 1,
    condition_powerbadge: false,
    createdAt: "2024-06-17T03:19:16.065Z",
    downvote_value: 1,
    ecosystem_moderators: [],
    ecosystem_name: 'Abundance',
    ecosystem_points_name: '$IMPACT',
    ecosystem_rules: [`Can't do evil`],
    erc20s: [],
    fid: 3,
    nfts: [],
    owner_name: 'none',
    percent_tipped: 10,
    points_per_tip: 1,
    upvote_value: 1,
  }]
  const [ecosystems, setEcosystems] = useState(initEcosystem)
  const [ecoValue, setEcoValue] = useState(initEcosystem[0])
  const [account, setAccount] = useState(null)
  const [navMenu, setNavMenu] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuHover, setMenuHover] = useState( {in: Date.now(), out: Date.now() } )
  const [showLogin, setShowLogin] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [topCreators, setTopCreators] = useState([])
  const [topCreatorsSched, setTopCreatorsSched] = useState(false)
  const [paused, setPaused] = useState(false)
  const initialEligibility = {
    badge: false,
    badgeReq: false,
    channelFollower: false,
    channelFollowerReq: false,
    ownerFollower: false,
    ownerFollowerReq: false,
    holdingNFT: false,
    holdingNFTReq: false,
    holdingERC20: false,
    holdingERC20Req: false,
    eligibility: false,
    hasWallet: false,
    hasWalletReq: false
  }
  const [eligibility, setEligibility] = useState(initialEligibility)
  const [loadRemaining, setLoadRemaining] = useState(true)
  const [prevPoints, setPrevPoints] = useState(null)
  const [ecoButton, setEcoButton] = useState('rules')

  const Col = styled.div`
    display: grid;
    grid-template-columns: 1fr auto auto; 
    align-items: center;
    justify-content: space-between;
    grid-gap: 32px;
    width: 100%;

    @media(min-width: 1440px) {
      grid-gap: ${navWidth}px;
    }
  `;

  useEffect(() => {
    let menuLink = targetLink()
    setBottomNavSize(ref?.current?.offsetWidth)
    setNavSize(ref?.current?.offsetWidth - 60)
    setLinkTarget(menuLink)
    setTopCreators([])
    getEcosystems()
    setNavMenu(button[menuLink].menu)
    handleNavResize()
    window.addEventListener("resize", handleNavResize);
    return () => {
      window.removeEventListener("resize", handleNavResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log(paused, topCreatorsSched)
    if (topCreatorsSched) {
      if (!paused) {
        getTopCreators()
        // getEcosystems()
      }
      setTopCreatorsSched(false);
    } else {
      const timeoutId = setTimeout(() => {
        if (!paused) {
          getTopCreators()
          // getEcosystems()
        }
        setTopCreatorsSched(false);
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [topCreators, topCreatorsSched]);


  useEffect(() => {
    // console.log(store.signer_uuid)
    if (store.isAuth)
      setIsLogged(true)
    else
      setIsLogged(false)
  }, [store.isAuth])
  
  function handleNavResize() {
    setNavWidth((ref?.current?.offsetWidth - 1312)/2 - 167)
    setBottomNavSize(ref?.current?.offsetWidth)
  }

  const toggleShowActions = () => {
    if (showActions) {
      setShowActions(false)
    } else {
      setShowActions(true)
    }
  }

  const handleSignIn = async (data) => {
    // console.log(data)
    // console.log(store.isAuth)
    setIsLogged(true)
    setShowLogin(false)
  };

  const handleLogOut = () => {
    store.setFid(null)
    store.setIsAuth(false)
    store.setSignerUuid(null)

    store.setUsernameFC(null)
    store.setSrcUrlFC(null)
    store.setUserDisplayNameFC(null)
    store.setUserActiveFC(false)
    store.setUserBioFC(null)
    store.setUserFollowersFC(null)
    store.setUserFollowingFC(null)
    store.setUserEthVerAddresses([])
    store.setUserSolVerAddresses([])
    setIsLogged(false)
    setShowLogout(false)
    if (router.route == '/~/profile') {
      router.push(`/`)
    }
  };

  useEffect(() => {
    // console.log(store.fid, store.isAuth, store.signer_uuid);
    if (store.isAuth) {
      setUserProfile(store.fid)
      setIsLogged(true)
      getRemainingBalances(store.fid, ecoValue.ecosystem_points_name)
    }
    else {
      setIsLogged(false)
    }
  }, [store.fid, store.isAuth, store.signer_uuid]);


  async function getEcosystems() {
    try {
      await setPaused(true)
      const response = await axios.get('/api/ecosystem/getEcosystems')
      console.log(response)

      if (response && response.data) {
        const ecosystemData = response.data.ecosystems
        console.log('triggered')
        
        const ecoIndex = ecosystemData.findIndex(eco => eco.ecosystem_points_name == '$IMPACT')
        if (ecoIndex !== -1) {
          setEcoValue(ecosystemData[ecoIndex])
        }
        setEcosystems(ecosystemData)

      } else {
        setEcosystems(initEcosystem)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setEcosystems(initEcosystem)
    }
  }


  async function getTopCreators() {
    if (!paused) {
      try {
        await setPaused(true)
        const response = await axios.get('/api/curation/getTopCreators')
        console.log(response)

        if (response && response.data && response.data.topCreators?.length > 0) {
          const receiverFids = response.data.topCreators
          console.log(receiverFids)
          setTopCreators(receiverFids)
        } else {
          setTopCreators([])
        }
      } catch (error) {
        console.error('Error submitting data:', error)
        setTopCreators([])
  
      }

    }
  }


  async function setUserProfile(fid) {
    try {
      const response = await axios.get('/api/getUserProfile', {
        params: {
          fid: fid,
        }
      })
      const user = response.data.userProfile[0]
      // console.log(user)
      // console.log(response)
      store.setUserProfile(user)
      store.setUsernameFC(user.username)
      store.setSrcUrlFC(user.pfp_url)
      store.setUserDisplayNameFC(user.display_name)
      store.setUserActiveFC(user.active_status)
      store.setUserBioFC(user.profile.bio.text)
      store.setUserFollowersFC(user.follower_count)
      store.setUserFollowingFC(user.following_count)
      let verEthAddresses = []
      for (let address in user.verified_addresses.eth_addresses) 
        verEthAddresses.push(address)
      store.setUserEthVerAddresses(verEthAddresses)
      let verSolAddresses = []
      for (let address in user.verified_addresses.sol_addresses) 
        verSolAddresses.push(address)
      store.setUserSolVerAddresses(verSolAddresses)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  const onAccount = useCallback(() => {
    store.setAccount(auth.account)
    store.setUsername(auth.username)
    setAccount(auth.account)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.account, auth.username, setAccount])

  useEffect(() => {
    onAccount()
  }, [onAccount])

  useEffect( () => {
    if (menuHover.in <= menuHover.out && typeof linkTarget !== 'object') {
      setNavMenu(button[linkTarget].menu)
    }
  }, [linkTarget, menuHover.in, menuHover.out])

  function handleResize() {
    setNavSize(ref?.current?.offsetWidth - 60)
  }

  const NavItem = (props) => {
    let btnHover = menuHover.in > menuHover.out
    let btn = button[props.buttonName]
    let Icon = btn.icon
    let menuVar = "pop-menu"
    let contentVar = "bg-blue"
    let textVar = ""
    let accountState = !btn.account || (account && btn.account)
    if (button[linkTarget].link === btn.link && btn.link && btn.working && accountState) {
      menuVar = "red-menu"
      contentVar = "bg-red"
      textVar = "bg-red"
    }
    if (!accountState) {
      menuVar = "grey-menu"
      contentVar = "bg-inactive"
      textVar = "bg-inactive"
    }
    if (!btn.working) {
      menuVar = "grey-menu"
      contentVar = "bg-grey"
      textVar = "bg-grey"
    }
    let topBox = `sub-cat-top-box flex-row ${menuVar}`
    let iconClass = `sub-cat-icon ${contentVar} size-30`
    let titleClass = `sub-cat-title nav-frame-title ${textVar} full-w`
    let textClass = `sub-cat-desc nav-frame-desc ${textVar} full-w`
    if (typeof Icon == 'undefined') { Icon = FaPen }
    let attributes = {}
    if (!btn.link) {
      attributes = {target: '_blank', rel: 'noopener noreferrer', href: btn.url}
    }

    return isMobile ? (
      <Link href={(btn.link && btn.working) ? btn.link : router.route} legacyBehavior>
        <a className={topBox} style={{borderRadius: '18px', padding: '16px 8px'}} {...attributes} onClick={() => {
          setLinkTarget(props.buttonName)
          if (btn.link && btn.working) {
            setMobileMenuOpen(false)
          }
          }}>
            <div style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '8px', alignItems: 'center'}}>
              <div className="sub-cat-box" >
                <Icon className={iconClass} iconsize="25"  style={{width: '25px', height: '25px'}}/>
              </div>
              <div className="sub-cat-text flex-col" style={{pointerEvents: 'none'}}>
                <span className={titleClass} style={{fontSize: '15px', fontWeight:'800', paddingRight: '10px', pointerEvents: 'none', width: 'max-content'}}>{props.buttonName}</span>
                <span className={textClass} style={{fontSize: '12px', paddingRight: '10px', pointerEvents: 'none'}}>{btn.description}</span>
              </div>
            </div>
        </a>
      </Link>
    ) : (
      <Link href={(btn.link && btn.working) ? btn.link : router.route}>
        <a className={topBox}  {...attributes} onClick={() => {
          setLinkTarget(props.buttonName)
          }} legacyBehavior>
          <div className="sub-cat-box" style={{margin: btnHover ? '8px 0' : '0 10px 0 0', minWidth: btnHover ? '50px' : '15px'}}>
            <Icon className={iconClass} iconsize={btnHover ? isTablet ? '25' : '30' : '15'} style={{height: btnHover ? '30px' : '15px', width: btnHover ? '30px' : '15px'}} />
          </div>
          <div className="sub-cat-text flex-col" style={{width: btnHover ? 'auto' : 'min-content', minWidth: btnHover ? null : '50px', pointerEvents: 'none'}}>
            <span className={titleClass} style={{fontSize: btnHover ?  isTablet ? '15px' : '19px' : isTablet ? '13px' : '15px', fontWeight: btnHover ? '800' : '600',  pointerEvents: 'none', width: btnHover ? '100%' : 'max-content'}}>{props.buttonName}</span>
            <span className={textClass} style={{fontSize: btnHover ? isTablet ? '12px' : '15px' : '0', opacity: btnHover ? '1' : '0', pointerEvents: 'none'}}>{btn.description}</span>
          </div>
        </a>
      </Link>
    );
  }

  const LogOut = () => {
    return (
      <div className='logout-btn' onClick={handleLogOut}>Log out</div>
    )
  }

  const HomeButton = () => {
    const isSmall = isMobile || isTablet;
    return (
      <Link href="/" legacyBehavior>
        <a className={navMenu === "Home" ? "nav-home-button-active" : "nav-home-button"} onMouseEnter={() => {
          setNavMenu('Home')
          setMenuHover({ ...menuHover, in: Date.now() })
        }} onMouseLeave={() => {
          // setMenuHover({ ...menuHover, out: Date.now() })
        }}>
          <div className="grid-col centered top-logo">
            <div className="logo-wrapper">
              <Logo height={isSmall ? '25px' : '45px'} width={isSmall ? '25px' : '45px'}/>
            </div>
            {/* <TitleWrapper >
              <h2 className={`nav-title${isSmall ? ' mid-frame-font' : ''}`}>Abundance Protocol</h2>
              <p className={`nav-subtitle${isSmall ? ' small-font' : ''}`}>building an economy of abundance</p>
            </TitleWrapper> */}
          </div>
        </a>
      </Link>
    )
  }

  const TopNav = (props) => {
    let btn = button[props.buttonName]
    let btnName = props.buttonName
    if (btnName === 'portal' && account) {
      btnName = store.username
    }
    const TopIcon = btn.icon
    let menuState = "nav-link"
    let accountState = !btn.account || (account && btn.account)
    if (navMenu === btn.menu && accountState) {
      menuState = "active-nav-link"
    } else if (!accountState) {
      menuState = "inactive-nav-link"
    }

    return (
      <div style={{padding: '0 8px'}} onMouseEnter={() => {
        setNavMenu(btn.menu)
        setMenuHover({ ...menuHover, in: Date.now() })
      }}
      onMouseLeave={() => setMenuHover({ ...menuHover, out: Date.now() }) }>
        <a style={{maxWidth: '87px'}}  
        >
          <div className={menuState} style={{paddingRight: isMobile ? '1em' : 'unset' }}>
            <div className="flex-col flex-middle" style={{height: '87px'}}>
              <div className="flex-col flex-middle" style={{position: 'relative'}}>
                <TopIcon className="size-25" />
                <div className="font-15 mar-t-6" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '15px'}}>
                  {btnName}
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    )
  }

  const closeLogin = () => {
    setShowLogin(false)
  }

  const closeLogout = () => {
    setShowLogout(false)
  }

  const testButton = async () => {
    console.log('test')
  }

  function newTest(value) {
    console.log(value)
  }


  const LoginPopup = async () => {
    setShowLogin(true)
  }

  const LogoutPopup = async () => {
    setShowLogout(true)
  }

  const LoginNotification = () => {
    return (
      <>
        <div className="overlay" onClick={closeLogin}></div>
        <div id="notificationContainer" style={{borderRadius: '16px', backgroundColor: '#cdd'}}>
          <div className='flex-col' id="notificationContent" style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '20px', maxWidth: '280px', fontWeight: '500'}}>You&apos;ll need to connect to Farcaster for that</div>
            <div className='flex-row' style={{width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '16px', gap: '10px'}}>
              <NeynarSigninButton onSignInSuccess={handleSignIn} />
              <div className='cncl-btn' onClick={closeLogin}>Cancel</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const LogoutNotification = () => {
    return (
      <>
        <div className="overlay" onClick={closeLogout}></div>
        <div id="notificationContainer" style={{borderRadius: '16px', backgroundColor: '#cdd'}}>
          <div className='flex-col' id="notificationContent" style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '20px', maxWidth: '280px', fontWeight: '500'}}>Are you sure you want to logout of the Impact App?</div>
            <div className='flex-row' style={{width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '16px', gap: '10px'}}>
              <div className='out-btn' onClick={handleLogOut}>Log out</div>
              <div className='cncl-btn' onClick={closeLogout}>Cancel</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const handleEcoButton = (button) => {
    console.log(button)
    setEcoButton(button)
  }

  const handleEcoChange = (event) => {
    const system = ecosystems.find(eco => eco.ecosystem_points_name == event.target.value)
    console.log(event.target.value)
    store.setEcosystemData(system)
    setEcoValue(system);
  };

  
  useEffect(() => {
    if (ecoSched) {
      if (store.isAuth && ecoValue) {
        getRemainingBalances(store.fid, ecoValue.ecosystem_points_name)
      }
      setEcoSched(false);
    } else {
      const timeoutId = setTimeout(() => {
        if (store.isAuth && ecoValue) {
          getRemainingBalances(store.fid, ecoValue.ecosystem_points_name)
        }
        setEcoSched(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [ecoValue, ecoSched])

  const getRemainingBalances = async (fid, points) => {
    setLoadRemaining(true)
    try {
      const response = await axios.get('/api/ecosystem/getBalances', {
        params: { fid, points } })
      if (response) {
        console.log(response)
        if (response.data && response.data?.user) {
          const remainingImpact = response.data.user.remaining_i_allowance
          const remainingQuality = response.data.user.remaining_q_allowance
          store.setUserRemainingImpact(remainingImpact)
          store.setUserRemainingQuality(remainingQuality)
          setLoadRemaining(false)
          setEligibility(initialEligibility)
        }
      } else {
        checkEcoEligibility(fid, points)
      }
    } catch (error) {
      console.error('error', error)
      checkEcoEligibility(fid, points)
    }
  }

  const checkEcoEligibility = async (fid, points) => {
    console.log(fid, points, prevPoints)
    if (points !== prevPoints) {
      setPrevPoints(points)
      setLoadRemaining(true)
      try {
        const response = await axios.get('/api/ecosystem/checkUserEligibility', {
          params: { fid, points } })
        if (response) {
          console.log(response)
          if (response.data && response.data?.eligibilityData?.eligibility && response.data?.createUser) {
            let userData = response.data?.createUser
            let eligibilityData = response.data.eligibilityData
            setEligibility(eligibilityData)
            store.setUserRemainingImpact(userData.remaining_i_allowance)
            store.setUserRemainingQuality(userData.remaining_q_allowance)
            setLoadRemaining(false)
            console.log(eligibility, eligibilityData)
          }
        } else {
          setEligibility(initialEligibility)
          store.setUserRemainingImpact(0)
          store.setUserRemainingQuality(0)
          setLoadRemaining(false)
        }
      } catch (error) {
        console.error('error', error)
        setEligibility(initialEligibility)
        store.setUserRemainingImpact(0)
        store.setUserRemainingQuality(0)
        setLoadRemaining(false)
      }

    }
  }


  const EcosystemMenu = ({ecosystems}) => {

    return (
      <div className={isMobile ? '' : 'left-container'} style={{margin: '0', maxWidth: '237px', width: 'auto'}}>
        <div style={{backgroundColor: '#334455ee', borderRadius: '16px', padding: '0px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
          <div className='flex-row' style={{gap: '0.5rem'}}>
            <select id="minuteSelect" value={ecoValue.ecosystem_points_name} onChange={handleEcoChange} style={{backgroundColor: '#adf', borderRadius: '4px', fontSize: '18px', fontWeight: '500', padding: isMobile ? '0 1px' : '0 3px'}}>
              {ecosystems.map((ecosystem) => (
                <option key={ecosystem.ecosystem_points_name} value={ecosystem.ecosystem_points_name}>
                  {ecosystem.ecosystem_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )
  }

  const LeftNav = ({buttonName}) => {
    let { account, icon, link, working } = button[buttonName]
    const TopIcon = icon
    let menuState = "nav-link"
    let accountState = !account || (store.isAuth && account)
    if ((router.route === link) && accountState) {
      menuState = "active-nav-link"
    } else if (!working) {
      menuState = "inactive-nav-link"
    }
    let unlockedState = 'btn-hvr'
    if (account && !store.isAuth || !working) {
      unlockedState = 'lock-btn-hvr'
    }

    const Working = () => {
      return (
        <Link href={link} style={{maxWidth: '260px'}}>
          <div className={`flex-row`} style={{paddingRight: isMobile ? '1em' : 'unset', justifyContent: 'flex-start'}}>
            <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
              <div className={`flex-row flex-middle ${menuState} btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
                <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
                <div className="font-15 left-nav mid-layer" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '18px', padding: '0 24px 0 0'}}>
                  {buttonName}
                </div>
                <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )
    }

    const Locked = () => {
      return (
        <div className={`flex-row`} style={{paddingRight: isMobile ? '1em' : 'unset', justifyContent: 'flex-start', maxWidth: '260px'}} onClick={LoginPopup}>
          <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
            <div className={`flex-row flex-middle ${menuState} lock-btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
              <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
              <div className="font-15 left-nav mid-layer" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '18px', padding: '0 24px 0 0'}}>
                {buttonName}
              </div>
              <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-100%, -50%)' }}>
                  <FaLock size={8} color='#999' />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const Soon = () => {
      return (
        <div className={`flex-row`} style={{paddingRight: isMobile ? '1em' : 'unset', justifyContent: 'flex-start', maxWidth: '260px'}}>
          <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
            <div className={`flex-row flex-middle inactive-nav-link lock-btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
              <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
              <div className="font-15 left-nav mid-layer" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '18px', padding: '0 24px 0 0'}}>
                {buttonName}
              </div>
              <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-70%, -50%)' }}>
                  <div className='soon-btn'>SOON</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="left-container" style={{padding: 'auto 8px'}}>
        {!working ? (<Soon />) : (isLogged || !account) ? (<Working />) : (<Locked />)}
      </div>
    )
  }

  const BottomNav = ({buttonName}) => {
    let { account, icon, link, working } = button[buttonName]
    const TopIcon = icon
    let menuState = "nav-link"
    let accountState = !account || (store.isAuth && account)
    if ((router.route === link) && accountState || (buttonName == 'Cast Actions' && showActions)) {
      menuState = "active-nav-link"
    } else if (!working) {
      menuState = "inactive-nav-link"
    }
    let unlockedState = 'btn-hvr'
    if (account && !store.isAuth || !working) {
      unlockedState = 'lock-btn-hvr'
    }

    const Working = () => {
      return (
        <div onClick={() => {
          if (buttonName == 'Cast Actions') {
            toggleShowActions()
          }
        }}>
        <Link href={link || ''} style={{maxWidth: '260px'}}>
          <div className={`flex-row`} style={{padding: '0 10px', justifyContent: 'center'}}>
            <div className="flex-col" style={{height: '46px', alignItems: 'center', justifyContent: 'center'}}>
              <div className={`flex-row flex-middle ${menuState} btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
                <TopIcon style={{margin: '3px 12px 3px 12px', width: (buttonName == 'Cast Actions') ? '30px' : '25px', height: (buttonName == 'Cast Actions') ? '30px' : '25px'}} />
              </div>
            </div>
          </div>
        </Link>
        </div>
      )
    }

    const Locked = () => {
      return (
        <div className={`flex-row`} style={{padding: '0 10px', justifyContent: 'flex-start', maxWidth: '260px'}} onClick={LoginPopup}>
          <div className="flex-col" style={{height: '46px', alignItems: 'center', justifyContent: 'center'}}>
            <div className={`flex-row flex-middle ${menuState} lock-btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
              <TopIcon className="size-25" style={{margin: '3px 12px 3px 12px'}} />
              <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-100%, -50%)' }}>
                  <FaLock size={8} color='#999' />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const Soon = () => {
      return (
        <div className={`flex-row`} style={{padding: '0 10px', justifyContent: 'flex-start', maxWidth: '260px'}}>
          <div className="flex-col" style={{height: '46px', alignItems: 'center', justifyContent: 'center'}}>
            <div className={`flex-row flex-middle inactive-nav-link lock-btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
              <TopIcon className="size-25" style={{margin: '3px 12px 3px 12px'}} />
              <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-70%, -50%)' }}>
                  <div className='soon-btn'>SOON</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }



    return (
      <div className="flex-row" style={{padding: 'auto 8px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>
        {!working ? (<Soon />) : (isLogged || !account) ? (<Working />) : (<Locked />)}
      </div>
    )
  }

  const SubCat = () => {
    try {
      let subButtons = button['nav-menu'][navMenu]
      if (typeof subButtons == 'undefined') {
        subButtons = button['nav-menu']['Home']
      }
      return (
        subButtons.map((btn, index) => (
          <NavItem buttonName={btn} key={index} /> ))
      )
    } catch (err) {
      console.log('error:', err)
      return null;
    }
  }

  function targetLink() {
    let search = router.asPath
    for (let key in button) {
      if (button[key].link === search) {
        return key
      }
    }
    return "Vision"
  }
  
  const connect = async () => {
    await auth.connect()
  }

  async function disconnect() {
    auth.disconnect();
    store.setAccount(null)

    setAccount(null)
    setTimeout(() => {
      // console.log('rerouting')
      router.push('/')
    }, 100)
  }

  const toggleDrawer = () => (e) => {
    if (
      e.type === 'keydown' &&
      (e.key === 'Tab' ||
        e.key === 'Shift')
    ) {
      return;
    }

    setMobileMenuOpen( !mobileMenuOpen );
  };

  const MobileNavMenu = () => {
    return (
      <div className="mobile-menu-wrapper" style={{display: 'grid', gridAutoFlow: 'column', height: '100%', justifyContent: 'start', width: '100%'}}>
        <Box height="100%" width="100%">
          <div style={{display: 'grid', gridAutoFlow: 'row'}}>
            {button['top-menu'].map((btn, index) => (
              <TopNav buttonName={btn} key={index} /> ))}
          </div>
        </Box>
        <Box style={{width: 'calc(100vw / 1.4)'}}>
          <MobileNavBox className="sub-nav-box" 
            onMouseEnter={() => {
            setMenuHover({ ...menuHover, in: Date.now() })
            }} onMouseLeave={() => {
            setMenuHover({ ...menuHover, out: Date.now() })}}>
            <SubCat />
          </MobileNavBox>
        </Box>
      </div>
    )
  }

  return (
    <div ref={ref} className='flex-col' style={{position: 'absolute', display: 'flex', minHeight: '100%', height: '100%', width: '100%', overflowX: 'hidden'}}>
      {isMobile && (
        <React.Fragment key="top">
          <MobileAppbar className='top-layer' position="fixed" elevation={0} sx={{paddingRight: 0}} style={{backgroundColor: '#2D4254'}}>
            <nav className="nav-bar-mobile">
              <NavbarHeader>
                <div className="navbar-header">
                  <HomeButton />
                  <div className='flex-row' style={{gap: '0.3rem', justifyContent: 'center', alignItems: 'center'}}>
                    {/* <div style={{fontSize: '18px', fontWeight: '600'}}>Ecosystem</div> */}
                    <EcosystemMenu ecosystems={ecosystems} />
                    {!loadRemaining && (<div className="flex-row" style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                        <span className="channel-font" style={{color: '#eee'}}>{store.userRemainingImpact}</span><span className="channel-font" style={{color: '#eee', fontWeight: '400', fontSize: '10px'}}>{ecoValue.ecosystem_points_name}</span>
                      </div>
                    </div>)}
                   {!loadRemaining && ( <div className="flex-row" style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                        <span className="channel-font" style={{color: '#eee'}}>{store.userRemainingQuality}</span><span className="channel-font" style={{color: '#eee', fontWeight: '400', fontSize: '10px'}}>qDAU</span>
                      </div>
                    </div>)}
                  </div>
                  <Box className="navbar-header-end flex-row" sx={{alignItems: 'center', justifyContent: 'space-between'}}>
                    <MenuButton onClick={toggleDrawer()}>
                      {mobileMenuOpen ? <CollapseIcon/> : <HiMenu />}
                    </MenuButton>
                  </Box>
                </div>
              </NavbarHeader>
            </nav>
          </MobileAppbar> 
          <Drawer className='top-layer' elevation={0} anchor="top" variant="temporary" open={mobileMenuOpen} onClose={toggleDrawer()}  
            sx={{
              transform: window.innerWidth <= 360 ? 'translateY(56px)' :'translateY(62px)',
              zIndex: 1,
              '& .MuiDrawer-paper': { width: 'fit-content',backgroundColor: 'transparent', padding: '16px', overflowX: 'hidden'}
            }}
            >
            <MobileNavMenu />
          </Drawer>
        </React.Fragment>
      )} 

      <div className='flex-row' style={{justifyContent: 'center', width: 'auto'}}>
        <div className="flex-col" style={{padding: '58px 0 0 0', position: 'relative'}}>
          <div className='left-container'></div>
            <div className='flex-row left-container' style={{position: 'fixed', top: '4px', width: '49px', height: '33px', alignItems: 'center', justifyContent: 'center'}}>
              <HomeButton />
            </div>

            <div className='flex-col left-container' style={{position: 'fixed'}}>

            { button['side-menu'].map((btn, index) => (
              <LeftNav buttonName={btn} key={index} /> ))}

            <div className='left-container' style={{margin: '20px 23px 0 0', maxWidth: '237px'}}>
              <div style={{backgroundColor: '#334455ee', borderRadius: '16px', padding: '0px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
                <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
                  <Actions size={32} color={'#9cf'} /><p className='left-nav' style={{paddingLeft: '10px', fontSize: isTablet ? '12px' : '18px', fontWeight: '500'}}>Cast Actions </p>
                </div>
                <div className='flex-col' style={{gap: '0.5rem', margin: '8px'}}>
                  <a className="" title={`+1 ${ecoValue.ecosystem_points_name}`} href={`https://warpcast.com/~/add-cast-action?name=%2B1+%24${ecoValue.ecosystem_points_name.substring(1)}&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=${ecoValue.ecosystem_points_name.substring(1)}&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
                    <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                      <FaRegStar size={20} />
                      <p className='left-nav' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+1 {ecoValue.ecosystem_points_name}</p>
                    </div>
                  </a>

                  <a className="" title={`+5 ${ecoValue.ecosystem_points_name}`} href={`https://warpcast.com/~/add-cast-action?name=%2B5+%24${ecoValue.ecosystem_points_name.substring(1)}&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact5%3Fpoints=${ecoValue.ecosystem_points_name.substring(1)}&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
                    <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                      <FaRegStar size={20} />
                      <p className='left-nav' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+5 {ecoValue.ecosystem_points_name}</p>
                    </div>
                  </a>

                  <a className="" title={`${ecoValue.ecosystem_points_name} Balance`} href={`https://warpcast.com/~/add-cast-action?name=%24${ecoValue.ecosystem_points_name.substring(1)}+Balance&icon=info&actionType=post&postUrl=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Faction%2Fbalance?points=${ecoValue.ecosystem_points_name.substring(1)}&description=Get+Cast+Balance+for+Impact+App`} target="_blank" rel="noopener noreferrer">
                    <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                      <div className='left-nav' style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                      <Info size={20} />
                      <p className='left-nav' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>{ecoValue.ecosystem_points_name} Balance</p>
                      <div className='left-nav' style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="container cast-area flex-col" style={isMobile ? {} : {width: isMobile? '100%' : '620px', position: 'relative'}}>
            {!isMobile && (<div className="flex-row top-layer" style={{gap: '0.3rem', justifyContent: 'center', alignItems: 'center', width: isMobile? '100%' : '620px', position: 'fixed', backgroundColor: '#1D324466', padding: '4px 0'}}>
              {/* <div style={{fontSize: '20px', fontWeight: '600', color: '#def'}}>Ecosystem</div> */}
              <EcosystemMenu ecosystems={ecosystems} />
              {!loadRemaining && (<div className="flex-row" style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
                <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                  <span className="channel-font" style={{color: '#eee'}}>{store.userRemainingImpact}</span><span className="channel-font" style={{color: '#eee', fontWeight: '400', fontSize: '10px'}}>{ecoValue.ecosystem_points_name}</span>
                </div>
              </div>)}
              {!loadRemaining && ( <div className="flex-row" style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
                <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                  <span className="channel-font" style={{color: '#eee'}}>{store.userRemainingQuality}</span><span className="channel-font" style={{color: '#eee', fontWeight: '400', fontSize: '10px'}}>qDAU</span>
                </div>
              </div>)}
              {/* <div style={{color: 'white', fontWeight: '600'}} onClick={testButton}>Test btn</div> */}
            </div>)}
            <AccountContext.Provider value={{...store.account, ref1, LoginPopup, LogoutPopup, newTest }}>
              <Component {...pageProps} connect={connect} />
            </AccountContext.Provider>
          </div>
        </div>
        <div className='right-nav-text' style={{width: '400px'}}>
          <div>
            <div style={{margin: '58px 0px 12px 10px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}><div className='flex-row' style={{alignItems: 'center', gap: '0.5rem', marginBottom: '10px'}}>
              <FaStar size={34} color={'#9cf'} />
              <div style={{fontSize: '22px', fontWeight: '600'}}>
                {ecoValue.ecosystem_name} Ecosystem
              </div>
            </div>
            <p style={{paddingTop: '20px', fontSize: '17px', fontWeight: '500'}}>Ecosystem Rules: </p>
            <div className='flex-col' style={{gap: '0.5rem', marginTop: '10px'}}>
              {(ecoValue && ecoValue.ecosystem_rules && ecoValue.ecosystem_rules.length > 0) && (ecoValue.ecosystem_rules.map((rule, index) => (<div key={index} className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>{rule}</p>
              </div>)))}
              {(ecoValue && ecoValue.points_per_tip) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Points per $1 tipped: {ecoValue.points_per_tip}</p>
              </div>)}
              {(ecoValue && ecoValue.condition_points_threshold) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Curation points threshold: {ecoValue.condition_points_threshold}</p>
              </div>)}
              {(ecoValue && ecoValue.condition_curators_threshold) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Curators threshold: {ecoValue.condition_curators_threshold}</p>
              </div>)}
              {(ecoValue && ecoValue.percent_tipped) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Percent tipped to curators: {ecoValue.percent_tipped}%</p>
              </div>)}
              {(ecoValue && ecoValue.upvote_value && ecoValue.downvote_value) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Upvote/Downvote effect: {ecoValue.upvote_value} / -{ecoValue.downvote_value} points</p>
              </div>)}
            </div>
            
            {eligibility.hasWalletReq && (<p style={{paddingTop: '30px', fontSize: '17px', fontWeight: '500'}}>Eligibility Criteria: </p>)}
              {eligibility.hasWalletReq ? (<div className='flex-col' style={{gap: '0.5rem', marginTop: '10px'}}>
                {eligibility.hasWalletReq && (<div className='flex-row' style={{alignItems: 'center'}}>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.hasWallet ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
                  <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Has verified wallet</p>
                </div>)}
                {(eligibility.badgeReq && ecoValue) && (<div className='flex-row' style={{alignItems: 'center'}}>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.badge ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
                  <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Has Powerbadge</p>
                </div>)}
                {(eligibility.channelFollowerReq && ecoValue) && (<div className='flex-row' style={{alignItems: 'center'}}>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.channelFollower ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
                  <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Follows channel</p>
                </div>)}
                {(eligibility.holdingERC20Req && ecoValue && ecoValue.erc20s && ecoValue.erc20s.length > 0) && (ecoValue.erc20s.map((erc20, index) => (<div key={index} className='flex-row' style={{alignItems: 'center'}}>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.holdingERC20 ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
                  <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Holds a min. of {erc20.min} <a href={getTokenAddress(erc20.erc20_chain, erc20.erc20_address, 'token')} className="fc-lnk" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline'}}>{shortenAddress(erc20.erc20_address)}</a></p>
                </div>)))}
                {(eligibility.holdingNFTReq && ecoValue && ecoValue.nfts && ecoValue.nfts.length > 0) && (ecoValue.nfts.map((nft, index) => (<div key={index} className='flex-row' style={{alignItems: 'center'}}>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.holdingNFT ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
                  <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Holds <a href={getTokenAddress(nft.nft_chain, nft.nft_address, 'token')} className="fc-lnk" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline'}}>{shortenAddress(nft.nft_address)}</a> NFT </p>
                </div>)))}
                {(eligibility.ownerFollowerReq && ecoValue && ecoValue.owner_name) && (<div className='flex-row' style={{alignItems: 'center'}}>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.ownerFollower ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
                  <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Follows @{ecoValue.owner_name}</p>
                </div>)}

              </div>) : (<div className="flex-row" style={{border: '1px solid #abc', padding: '8px 8px', margin: '30px 40px 0px 40px', borderRadius: '10px', justifyContent: 'center', alignItems: 'center', backgroundColor: '#012', cursor: 'pointer'}} onClick={() => {checkEcoEligibility(store.fid, ecoValue.ecosystem_points_name)}}>
                <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                  <span className="channel-font" style={{color: '#eee'}}>Show Eligibility Criteria</span>
                </div>
              </div>)}
            </div>

            {(topCreators.length > 0) && (<div style={{margin: '18px 0px 12px 20px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
              <p style={{padding: '0 0 6px 0', fontSize: '20px', fontWeight: '600'}}>Creator & Builder Leaderboard: </p>
              <div className='flex-col' style={{gap: '0.5rem', marginTop: '10px'}}>
                {(topCreators.map((creator, index) => (<Creators creator={creator} index={index} />)))}
              </div>
            </div>)}
          </div>
        </div>
      </div>
      {(isMobile && showActions) && (
        <div style={{margin: '20px 23px 0 0', bottom: '46px', width: `100%`, position: 'fixed'}}>
          <div style={{backgroundColor: '#1D3244cc', borderRadius: '16px 16px 0 0', padding: '10px 0 20px 0', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
          <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
            <p className='' style={{padding: '10px', fontSize: isTablet ? '12px' : '18px', fontWeight: '500'}}>{ecoValue.ecosystem_name} Ecosystem </p>
          </div>

          <div className='flex-row' style={{justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
            <div className="flex-row" style={{border: '1px solid #abc', padding: '4px 8px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: (ecoButton == 'rules') ? '#012' : '', cursor: 'pointer'}} onClick={() => {handleEcoButton('rules')}}>
              <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                <span className="channel-font" style={{color: '#eee'}}>Ecosystem rules</span>
              </div>
            </div>

            <div className="flex-row" style={{border: '1px solid #abc', padding: '4px 8px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: (ecoButton == 'eligibility') ? '#012' : '', cursor: 'pointer'}} onClick={() => {handleEcoButton('eligibility')}}>
              <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                <span className="channel-font" style={{color: '#eee'}}>Eligibility</span>
              </div>
            </div>

            <div className="flex-row" style={{border: '1px solid #abc', padding: '4px 8px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: (ecoButton == 'actions') ? '#012' : '', cursor: 'pointer'}} onClick={() => {handleEcoButton('actions')}}>
              <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
                <span className="channel-font" style={{color: '#eee'}}>Cast Actions</span>
              </div>
            </div>

          </div>

          {(ecoButton == 'rules') && (
            <div className='flex-col' style={{gap: '0.25rem', margin: '10px 20px'}}>
              {(ecoValue && ecoValue.ecosystem_rules && ecoValue.ecosystem_rules.length > 0) && (ecoValue.ecosystem_rules.map((rule, index) => (<div key={index} className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>{rule}</p>
              </div>)))}
              {(ecoValue && ecoValue.points_per_tip) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Points per $1 tipped: {ecoValue.points_per_tip}</p>
              </div>)}
              {(ecoValue && ecoValue.condition_points_threshold) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Curation points threshold: {ecoValue.condition_points_threshold}</p>
              </div>)}
              {(ecoValue && ecoValue.condition_curators_threshold) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Curators threshold: {ecoValue.condition_curators_threshold}</p>
              </div>)}
              {(ecoValue && ecoValue.percent_tipped) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Percent tipped to curators: {ecoValue.percent_tipped}%</p>
              </div>)}
              {(ecoValue && ecoValue.upvote_value && ecoValue.downvote_value) && (<div className='flex-row' style={{alignItems: 'center'}}>
                <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
                <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Upvote/Downvote effect: {ecoValue.upvote_value} / -{ecoValue.downvote_value} points</p>
              </div>)}
            </div>
          )}
          {(ecoButton == 'eligibility') && (eligibility.hasWalletReq ? (
            <div className='flex-col' style={{gap: '0.25rem', margin: '10px 20px'}}>
            {eligibility && (<div className='flex-row' style={{alignItems: 'center'}}>
              <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.hasWallet ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
              <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Has verified wallet</p>
            </div>)}
            {(eligibility.badgeReq && ecoValue) && (<div className='flex-row' style={{alignItems: 'center'}}>
              <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.badge ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
              <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Has Powerbadge</p>
            </div>)}
            {(eligibility.channelFollowerReq && ecoValue) && (<div className='flex-row' style={{alignItems: 'center'}}>
              <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.channelFollower ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
              <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Follows channel</p>
            </div>)}
            {(eligibility.holdingERC20Req && ecoValue && ecoValue.erc20s && ecoValue.erc20s.length > 0) && (ecoValue.erc20s.map((erc20, index) => (<div key={index} className='flex-row' style={{alignItems: 'center'}}>
              <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.holdingERC20 ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
              <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Holds a min. of {erc20.min} <a href={getTokenAddress(erc20.erc20_chain, erc20.erc20_address, 'token')} className="fc-lnk" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline'}}>{shortenAddress(erc20.erc20_address)}</a></p>
            </div>)))}
            {(eligibility.holdingNFTReq && ecoValue && ecoValue.nfts && ecoValue.nfts.length > 0) && (ecoValue.nfts.map((nft, index) => (<div key={index} className='flex-row' style={{alignItems: 'center'}}>
              <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.holdingNFT ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
              <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Holds <a href={getTokenAddress(nft.nft_chain, nft.nft_address, 'token')} className="fc-lnk" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline'}}>{shortenAddress(nft.nft_address)}</a> NFT </p>
            </div>)))}
            {(eligibility.ownerFollowerReq && ecoValue && ecoValue.owner_name) && (<div className='flex-row' style={{alignItems: 'center'}}>
              <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{eligibility.ownerFollower ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
              <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>Follows @{ecoValue.owner_name}</p>
            </div>)}
          </div>
          ) : (<div className="flex-row" style={{border: '1px solid #abc', padding: '8px 8px', margin: '30px', borderRadius: '10px', justifyContent: 'center', alignItems: 'center', backgroundColor: '#012', cursor: 'pointer'}} onClick={() => {checkEcoEligibility(store.fid, ecoValue.ecosystem_points_name)}}>
            <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
              <span className="channel-font" style={{color: '#eee'}}>Show Eligibility Criteria</span>
            </div>
          </div>))}

          {(ecoButton == 'actions') && (<div className='flex-col' style={{gap: '0.5rem', margin: '8px'}}>
            <a className="" title="+1 Impact" href={`https://warpcast.com/~/add-cast-action?name=%2B1+%24${ecoValue.ecosystem_points_name.substring(1)}&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=${ecoValue.ecosystem_points_name.substring(1)}&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
              <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                <FaRegStar size={20} />
                <p className='' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+1 {ecoValue.ecosystem_points_name}</p>
              </div>
            </a>

            <a className="" title='+5 Impact' href={`https://warpcast.com/~/add-cast-action?name=%2B5+%24${ecoValue.ecosystem_points_name.substring(1)}&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact5%3Fpoints=${ecoValue.ecosystem_points_name.substring(1)}&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
              <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                <FaRegStar size={20} />
                <p className='' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+5 {ecoValue.ecosystem_points_name}</p>
              </div>
            </a>

            <a className="" title="Cast Impact Balance" href={`https://warpcast.com/~/add-cast-action?name=%24${ecoValue.ecosystem_points_name.substring(1)}+Balance&icon=info&actionType=post&postUrl=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Faction%2Fbalance?points=${ecoValue.ecosystem_points_name.substring(1)}&description=Get+Cast+Balance+for+Impact+App`} target="_blank" rel="noopener noreferrer">
              <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                <div className='' style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                <Info size={20} />
                <p className='' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>{ecoValue.ecosystem_points_name} Balance</p>
                <div className='' style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
              </div>
            </a>
          </div>)}

        </div>
      </div>
      )}
      {isMobile ? (
        <div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#1D3244cc', height: '46px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}>
          <div className='flex-row' style={{position: 'relative', width: '100%', justifyContent: 'space-between', padding: '0 10px'}}>
          { button['bottom-nav'].map((btn, index) => (
            <BottomNav buttonName={btn} key={index} /> ))}
          </div>
        </div>
      ) : (
        <div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#000000ff', height: '0px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}></div>
      )}
      <div>
        {showLogin && (<LoginNotification />)}
      </div>
      <div>
        {showLogout && (<LogoutNotification />)}
      </div>
    </div>
  )
}


const MobileAppbar = styled(AppBar)`
  z-index: 2;
  padding: 0 16px;

  @media(max-width: 360px) {
    padding: 0 16px 0 8px;
  }
`;

const NavbarHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  align-items: baseline;
  background: transparent;
  
  .navbar-header {
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    align-items: center;
    // grid-gap: 16px;

    // @media(max-width: 360px) {
    //   grid-gap: 4px;
    // }
  
    .navbar-header-end {
      grid-gap: 16px;
      @media(max-width: 360px) {
        grid-gap: 4px;
      }
    }
  }

`;

const MobileNavBox = styled.div`
  margin-right: 16px;
  padding: 16px 24px 24px 24px;
  background-color: #dddddde6; 
  border-radius: 20px; 
  display: grid;
  grid-auto-flow: row;
  grid-gap: 8px;
  justify-content: start;
  alignItems: start;
  
  @media(max-width: 360px) {
    padding: 8px;
  }
`;

const MenuButton = styled(Button)`
  width: 100%; 
  justify-content: center; 
  align-items: start; 
  background: transparent;
  min-width: 48px;
  max-width: 48px;
  font-size: 25px;
  color: #eee;

  @media(max-width: 360px) {
    font-size: 22px;
    min-width: 40px;
    max-width: 40px;
  }
`;

const TopNavWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  justify-content: space-between;
  width: 100%;
  align-items: center;

  > * svg {
    width: 24px;
    height: 24px;
  }
  @media(min-width: 1024px) {
    > * svg {
      width: 25px;
      height: 25px;
    }
  }
`;

const TitleWrapper = styled.div`
  padding: 15px;

  @media(max-width: 360px) {
    h2 {

      font-size: 14px;
    }

    p {
      font-size: 10px;
    }
  }
`;

const SubNavBoxWrapper = styled.div`
  width: 100%;
  margin: 0;
  justify-content: center;

  @media(min-width: 638px) {
    .sub-nav-box {
      background: #dddddde6;
      border-radius: 20px;
      margin: 0 10px 10px 10px;
      padding: ${props => props.isHover ? '8px' : '0 8px'};
      display: grid;

      grid-gap: ${props => props.isHover ? '8px' : '4px'};
      grid-template-columns:${props => props.isHover ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)'};
      transition: all ease-in-out 0.1s;
      
      .sub-cat-top-box {
        border-radius: 15px;
        display: grid;
        grid-auto-flow: column;
        justify-content: center;
        align-items: center;
        padding: ${props => props.isHover ? '8px 16px' : '4px 8px'};
        margin: ${props => props.isHover ? '0' : '5px 0'};
        width: ${props => props.isHover ? 'calc(100vw / 3.4)' : '100%'};
        justify-content: start;
      }
      @media(min-width: 1024px) {
        .sub-cat-top-box {
            width: ${props => props.isHover ? 'calc(100vw / 3.4)' : '100%'};
            padding: ${props => props.isHover ? '4px 8px' : '3px 5px 2px 10px'};
            margin: ${props => props.isHover ? '0' : '5px 10px'};
            border-radius: 15px;
            justify-content: start;
        }
      }
  
      @media(min-width: 1440px) {
        .sub-cat-top-box {
          width: ${props => props.isHover ? '420px' : 'min-content'};
          padding: ${props => props.isHover ? '4px 8px' : '3px 5px 2px 10px'};
          margin: ${props => props.isHover ? '0' : '5px 10px'};
          border-radius: 15px;
          justify-content: start;
        }
      }
  
    }
  }

`;