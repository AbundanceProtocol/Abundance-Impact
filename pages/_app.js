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
import { FaPen } from 'react-icons/fa';
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

export default function App({ Component, pageProps }) {
  const store = useStore()
  const auth = useAuth();
  const { isMobile, isTablet } = useMatchBreakpoints();
  const ref = useRef(null)
  const ref1 = useRef(null)
  const [isSignedIn, setIsSignedIn] = useState()
  const [bottomNavSize, setBottomNavSize] = useState(ref?.current?.offsetWidth)
  const [navSize, setNavSize] = useState(1060)
  const router = useRouter()
  const [navWidth, setNavWidth] = useState((ref?.current?.offsetWidth - 1312)/2 - 167)
  const [linkTarget, setLinkTarget] = useState('Vision')
  const [account, setAccount] = useState(null)
  const [navMenu, setNavMenu] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuHover, setMenuHover] = useState( {in: Date.now(), out: Date.now() } )
  const [showNotification, setShowNotification] = useState(false)

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
    useStore.setState({ router })
  }, [router])

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
      setIsSignedIn(true)
    else
      setIsSignedIn(false)
  }, [store.isAuth])
  
  function handleNavResize() {
    setNavWidth((ref?.current?.offsetWidth - 1312)/2 - 167)
    setBottomNavSize(ref?.current?.offsetWidth)
  }

  const handleSignIn = async (data) => {
    // console.log(data)
    // console.log(store.isAuth)
    setIsSignedIn(true)
    setShowNotification(false)
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
    setIsSignedIn(false)
  };

  useEffect(() => {
    // console.log(store.fid, store.isAuth, store.signer_uuid);
    if (store.isAuth) {
      setUserProfile(store.fid)
      // setIsSignedIn(true)
    }
    else {
      setIsSignedIn(false)
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
      store.setUsernameFC(user.username)
      store.setSrcUrlFC(user.pfl_url)
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
      <Link href={(btn.link && btn.working) ? btn.link : router.route}>
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
          }}>
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
      <Link href="/">
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

  const closeNotification = () => {
    setShowNotification(false)
  }

  const LoginPopup = async () => {
    setShowNotification(true)
  }

  const LogNotification = () => {
    return (
      <>
        <div className="overlay" onClick={closeNotification}></div>
        <div id="notificationContainer" style={{borderRadius: '16px', backgroundColor: '#cdd'}}>
          <div className='flex-col' id="notificationContent" style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '20px', maxWidth: '280px', fontWeight: '500'}}>You&apos;ll need to connect to Farcaster for that</div>
            <div className='flex-row' style={{width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '16px', gap: '10px'}}>
              <NeynarSigninButton onSignInSuccess={handleSignIn} />
              <div className='cncl-btn' onClick={closeNotification}>Cancel</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const LeftNav = (props) => {
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
    let unlockedState = 'btn-hvr'
    if (btn.account && !store.isAuth || !btn.working)
      unlockedState = 'lock-btn-hvr'
    return (
      <div className="left-container" style={{padding: 'auto 8px'}} onMouseEnter={() => {
        setNavMenu(btn.menu)
        setMenuHover({ ...menuHover, in: Date.now() })
      }}
      onMouseLeave={() => setMenuHover({ ...menuHover, out: Date.now() }) }>
        <Link href={(btn.link && btn.working) ? btn.link : router.route}>
          <a style={{maxWidth: '260px'}}  
        >
            <div className={`flex-row`} style={{paddingRight: isMobile ? '1em' : 'unset', justifyContent: 'flex-start'}}>
              <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
                <div className={`flex-row flex-middle ${menuState} ${unlockedState}`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
                  <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
                  <div className="font-15 left-nav mid-layer" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '18px', padding: '0 24px 0 0'}}>
                    {btnName}
                  </div>
                  <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>

                    {btn.working ? (<>
                      {(btn.account && !store.isAuth) && (<div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-100%, -50%)' }}>
                        <FaLock size={8} color='#999' />
                      </div>)}</>
                      ) : (
                      <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-70%, -50%)' }}>
                        <div className='soon-btn'>SOON</div>
                      </div>
                    )}



                    {/* {(btn.account && !store.isAuth) && (
                    <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-100%, -50%)' }}>
                      {btn.working ? (
                      <FaLock size={8} color='#999' />
                      ) : (
                      <div style={{fontSize: '7px', border: '1px solid #ccc', padding: '2px 3px', borderRadius: '3px', backgroundColor: '#00333399'}}>SOON</div>
                      )}
                    </div>
                    )} */}


                  </div>
                </div>
              </div>
            </div>
          </a>
        </Link>
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
      <div className="flex-row" style={{padding: 'auto 8px', width: 'auto', justifyContent: 'center', alignItems: 'center'}} onMouseEnter={() => {
        setNavMenu(btn.menu)
        setMenuHover({ ...menuHover, in: Date.now() })
      }}
      onMouseLeave={() => setMenuHover({ ...menuHover, out: Date.now() }) }>
        <Link href={(btn.link && btn.working) ? btn.link : router.route}>
          <a style={{width: 'auto'}}>
            <div className={`flex-row ${menuState}`} style={{padding: isMobile ? '2px' : 'unset', width: 'auto' }}>
              <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
                {btn.working? (
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
          </a>
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
                  {/* {isSignedIn ? (<LogOut />) : (<NeynarSigninButton onSignInSuccess={handleSignIn} />)} */}
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
              <TopNavWrapper>
                {/* { button['top-menu'].map((btn, index) => (
                      <TopNav buttonName={btn} key={index} /> ))} */}
              </TopNavWrapper>
              {/* //// test buttons //// */}
              {/* <div id="showNotificationBtn" className='srch-select-btn' onClick={LoginPopup}>Test Button</div>
              {(isSignedIn || showNotification) ? (<LogOut />) : (<NeynarSigninButton onSignInSuccess={handleSignIn} />)} */}
              {/* {isSignedIn ? (<LogOut />) : (<LogOut />)} */}
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
        </div>
        <div>
          <div className="container cast-area" style={isMobile ? {} : {width: isMobile? '100%' : '620px'}}>
            <AccountContext.Provider value={{...store.account, ref1, LoginPopup}}>
              <Component {...pageProps} connect={connect} />
            </AccountContext.Provider>
          </div>
        </div>
        <div className='right-nav-text' style={{width: '400px'}}>
          <div>
            <div style={{margin: '58px 0px 12px 20px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}><IoIosWarning size={40} color={'#fbb'} /><p style={{paddingTop: '10px'}}>NOTICE: the Abundance Protocol&apos;s Impact App is currently in an early development stage </p></div>
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
        {showNotification && (<LogNotification />)}
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