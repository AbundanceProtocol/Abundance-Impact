'use client'

import React, { useRef, useState, useEffect, useContext } from 'react';
import Mobile from './Mobile';
import LeftMenu from './LeftMenu';
import CenterMenu from './CenterMenu';
import RightMenu from './RightMenu';
import ShowActionNav from './ShowActionNav';
// import BottomMenu from './BottomMenu';
import BottomBar from './BottomBar';
import LoginModal from './Modals/LoginModal';
import LogoutModal from './Modals/LogoutModal';
// Head component is not compatible with App Router - use metadata API instead
import { AccountContext } from '../../context';
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';
import UserMenu from './UserMenu';
import SwipeablePanel from '../Common/SwipeablePanel';

const version = process.env.NEXT_PUBLIC_VERSION

const Layout = ({ children }) => {
  const ref = useRef(null)
  const { setIsLogged, setFid, setIsMiniApp, isMiniApp, userBalances, setUserBalances, setUserInfo, adminTest } = useContext(AccountContext)
  const { isMobile } = useMatchBreakpoints();

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

  useEffect(() => {
    (async () => {
      // Only run this on the client side
      if (typeof window === 'undefined') return;
      
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
    
        const isMiniApp = await sdk.isInMiniApp()
        setIsMiniApp(isMiniApp)
        console.log('isMiniApp1', isMiniApp)

        const userProfile = await sdk.context

        console.log(userProfile?.user?.fid)

        const checkUserProfile = async (fid) => {
          try {
            const res = await fetch(`/api/user/validateUser?fid=${fid}`);
            const data = await res.json();
            return data.valid;
          } catch (error) {
            return null
          }
        };

        const isValidUser = await checkUserProfile(userProfile?.user?.fid);
        console.log(`User is valid: ${isValidUser}`);
        console.log(isValidUser)
        if (isValidUser) {
          setIsLogged(true)
          setFid(Number(userProfile?.user?.fid))
          setUserInfo({
            pfp: userProfile?.user?.pfpUrl || null,
            username: userProfile?.user?.username || null,
            display: userProfile?.user?.displayName || null,
          })
        }    

        sdk.actions.ready()

        if (isValidUser && !(userBalances?.impact > 0) ) {
          const {impact, qdau} = await getUserBalance(userProfile?.user?.fid)
          console.log('userBalance', impact)
          setUserBalances(prev => ({ ...prev, impact, qdau }))
        }  
      } catch (error) {
        console.error('Error initializing miniapp-sdk:', error);
      }
    })();
  }, []);


  useEffect(() => {
    (async () => {
      // Only run this on the client side
      if (typeof window === 'undefined') return;
      
      if (adminTest) {
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
      
          const isMiniApp = await sdk.isInMiniApp()
          setIsMiniApp(isMiniApp)
          if (isMiniApp) {
            sdk.actions.addMiniApp()
          }
        } catch (error) {
          console.error('Error initializing miniapp-sdk in admin test:', error);
        }
      }
    })();
  }, [adminTest]);


  return (
    <div ref={ref} className='flex-col' style={{position: 'absolute', display: 'flex', minHeight: '100%', height: '100%', width: '100%', overflowX: 'hidden'}}>

      {/* Metadata moved to app/layout.js for App Router compatibility */}



      {/* <Mobile /> */}
      <div className='flex-row' style={{justifyContent: 'center', width: 'auto'}}>
        {/* <LeftMenu /> */}
        {(isMiniApp || isMobile) && <UserMenu />}

        <CenterMenu>{children}</CenterMenu>
        {/* <RightMenu /> */}
      </div>
      <ShowActionNav />
      {((version == '1.0' && !adminTest) || (version == '2.0' || adminTest)) && <BottomBar />}
      {/* {(version == '2.0' || adminTest) ? (<BottomBar />) : (<BottomMenu />)} */}
      <LoginModal />
      <LogoutModal />
      {(version == '2.0' || adminTest) && (<SwipeablePanel />)}
    </div>
  );
};

export default Layout;