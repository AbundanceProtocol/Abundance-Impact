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
import { IoIosWarning } from "react-icons/io"
import { FaLock } from "react-icons/fa";
import axios from 'axios';
import { PiSquaresFourLight as Actions } from "react-icons/pi";
import { IoInformationCircleOutline as Info } from "react-icons/io5";

export default function App({ Component, pageProps }) {
  const store = useStore()
  const auth = useAuth();
  const { isMobile, isTablet } = useMatchBreakpoints();
  const ref = useRef(null)
  const ref1 = useRef(null)
  const [isLogged, setIsLogged] = useState()
  const [bottomNavSize, setBottomNavSize] = useState(ref?.current?.offsetWidth)
  const [navSize, setNavSize] = useState(1060)
  const router = useRouter()
  const [navWidth, setNavWidth] = useState((ref?.current?.offsetWidth - 1312)/2 - 167)
  const [linkTarget, setLinkTarget] = useState('Vision')
  const [account, setAccount] = useState(null)
  const [navMenu, setNavMenu] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuHover, setMenuHover] = useState( {in: Date.now(), out: Date.now() } )
  const [showLogin, setShowLogin] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

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
    setNavMenu(button[menuLink].menu)
    handleNavResize()
    window.addEventListener("resize", handleNavResize);
    return () => {
      window.removeEventListener("resize", handleNavResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    }
    else {
      setIsLogged(false)
    }
  }, [store.fid, store.isAuth, store.signer_uuid]);

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

  const BottomNav = (props) => {
    let btn = button[props.buttonName]
    let btnName = props.buttonName
    if (btnName === 'portal' && account) {
      btnName = store.username
    }
    const TopIcon = btn.icon
    let menuState = "nav-link"
    let accountState = !btn.account || (account && btn.account)
    if ((router.route === btn.link) && accountState) {
      menuState = "active-nav-link"
    } else if (!btn.working) {
      menuState = "inactive-nav-link"
    }

    return (
      <div className="flex-row" style={{padding: 'auto 8px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}
      //  onMouseEnter={() => {
      //   setNavMenu(btn.menu)
      //   setMenuHover({ ...menuHover, in: Date.now() })
      // }}
      // onMouseLeave={() => setMenuHover({ ...menuHover, out: Date.now() }) }
      >
        <Link href={(btn.link && btn.working && !(!store.isAuth && btn.account)) ? btn.link : '#'} style={{width: 'auto'}}>
          <div className={`flex-row ${menuState}`} style={{padding: isMobile ? '2px' : 'unset', width: 'auto' }} onClick={() => {(!store.isAuth && btn.account) && LoginPopup()}}>
            <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
              {btn.working ? (
              <div className="flex-row btn-hvr flex-middle" style={{padding: '6px 2px', borderRadius: '12px'}}>
                <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
                <div className="font-15 left-nav" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '18px'}}>
                  {btnName}
                </div>
              </div>
              ) : (
              <div className="flex-row btn-hvr lock-btn-hvr flex-middle" style={{padding: '6px 2px', borderRadius: '12px', position: 'relative'}}>
                <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
                <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(30%, -50%)' }}>
                  <div className='soon-btn'>SOON</div>
                </div>
              </div>
              )}
            </div>
          </div>
        </Link>
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
      {isMobile ? (
        <React.Fragment key="top">
          <MobileAppbar className='top-layer' position="fixed" elevation={0} sx={{paddingRight: 0}} style={{backgroundColor: '#2D4254'}}>
            <nav className="nav-bar-mobile">
              <NavbarHeader>
                <div className="navbar-header">
                  <HomeButton />
                  <Box className="navbar-header-end flex-row" sx={{alignItems: 'center', justifyContent: 'space-between'}}>
                  {/* {isLogged ? (<LogOut />) : (<NeynarSigninButton onSignInSuccess={handleSignIn} />)} */}
                    {/* <ConnectButton 
                      account={store.account}
                      isMobile={isMobile}
                      onConnect={connect}
                      onDisconnect={disconnect}
                      /> */}
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
      ) : (
        <nav ref={ref1} className="nav-bar top-layer flex-col" style={{width: '100%', justifyContent: 'center', height: '58px'}}>
          <div className="flex-col nav-top" style={{justifyContent: 'center', margin: '0 auto', width: '100%'}}>
            <div className="flex-row" style={{justifyContent: 'center', alignItems: 'center'}}>
              <div className='top-left'>
                <HomeButton />
              </div>
              <Col className='top-right'>
              {/* <TopNavWrapper> */}
                {/* { button['top-menu'].map((btn, index) => (
                      <TopNav buttonName={btn} key={index} /> ))} */}
              {/* </TopNavWrapper> */}
              {/* //// test buttons //// */}
               {/* <div id="showLoginBtn" className='srch-select-btn' onClick={testButton}>Test Button</div>  */}
              {/* {(isLogged || showLogin) ? (<LogOut />) : (<NeynarSigninButton onSignInSuccess={handleSignIn} />)} */}
              {/* {isLogged ? (<LogOut />) : (<LogOut />)} */}
              {/* <ConnectButton 
                account={account}
                isMobile={isMobile}
                onConnect={connect}
                onDisconnect={disconnect}
                /> */}
              </Col>
            </div>
          </div>
        </nav>
      )}
      <div className='flex-row' style={{justifyContent: 'center', width: 'auto'}}>
        <div className="flex-col" style={{padding: '58px 0 0 0'}}>
          { button['side-menu'].map((btn, index) => (
            <LeftNav buttonName={btn} key={index} /> ))}
            <div className='left-container' style={{margin: '20px 23px 0 0', maxWidth: '237px'}}>
              <div style={{backgroundColor: '#334455ee', borderRadius: '16px', padding: '0px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
                <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
                  <Actions size={32} color={'#9cf'} /><p className='left-nav' style={{paddingLeft: '10px', fontSize: isTablet ? '12px' : '18px', fontWeight: '500'}}>Cast Actions </p>
                </div>
                <div className='flex-col' style={{gap: '0.5rem', margin: '8px'}}>
                  <a className="" title="+1 Impact" href='https://warpcast.com/~/add-cast-action?name=%2B1+Impact&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact%3Fp%3D1&description=Curate+Casts+with+the+Impact+App' target="_blank" rel="noopener noreferrer">
                    <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                      <FaRegStar size={20} />
                      <p className='left-nav' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+1 Impact</p>
                    </div>
                  </a>

                  <a className="" title='+5 Impact' href='https://warpcast.com/~/add-cast-action?name=%2B5+Impact&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact%3Fp%3D5&description=Curate+Casts+with+the+Impact+App' target="_blank" rel="noopener noreferrer">
                    <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                      <FaRegStar size={20} />
                      <p className='left-nav' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+5 Impact</p>
                    </div>
                  </a>

                  <a className="" title="Cast Impact Balance" href='https://warpcast.com/~/add-cast-action?name=Cast+Impact+Balance&icon=info&actionType=post&postUrl=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Faction%2Fbalance&description=Get+Cast+Balance+for+Impact+App ' target="_blank" rel="noopener noreferrer">
                    <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                      <div className='left-nav' style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                      <Info size={20} />
                      <p className='left-nav' style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>Cast Impact Balance</p>
                      <div className='left-nav' style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          {/* { button['side-menu'].map((btn, index) => (
            <LeftMenu btn={btn} index={index} key={index} LoginPopup={LoginPopup} /> ))} */}
        </div>
        <div>
          <div className="container cast-area" style={isMobile ? {} : {width: isMobile? '100%' : '620px'}}>
            <AccountContext.Provider value={{...store.account, ref1, LoginPopup, LogoutPopup }}>
              <Component {...pageProps} connect={connect} />
            </AccountContext.Provider>
          </div>
        </div>
        <div className='right-nav-text' style={{width: '400px'}}>
          <div>
            <div style={{margin: '58px 0px 12px 20px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}><FaStar size={40} color={'#9cf'} /><p style={{paddingTop: '10px', fontSize: '20px', fontWeight: '600'}}>3 ways to earn with Impact: </p>
              <div className='flex-col' style={{gap: '0.5rem', marginTop: '10px'}}>
                <div className='flex-row'>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '10px 35px 0 0'}}>1</div>
                  <p style={{paddingTop: '10px', fontSize: '16px', fontWeight: '500'}}>Create great things that benefit the Farcaster community. Curators will be looking for great content.</p>
                </div>
                <div className='flex-row'>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '10px 35px 0 0'}}>2</div>
                  <p style={{paddingTop: '10px', fontSize: '16px', fontWeight: '500'}}>Curate impactful casts. Curators get a percent of the rewards going to creators.</p>
                </div>
                <div className='flex-row'>
                  <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '10px 35px 0 0'}}>3</div>
                  <p style={{paddingTop: '10px', fontSize: '16px', fontWeight: '500'}}>Reward creators. The more rewards you give the more Impact Points you get to stake.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isMobile ? (
        <div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#1D3244cc', height: '56px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}>
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