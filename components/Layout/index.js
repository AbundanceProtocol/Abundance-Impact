import React, { useRef, useState, useEffect, useContext } from 'react';
import Mobile from './Mobile';
import LeftMenu from './LeftMenu';
import CenterMenu from './CenterMenu';
import RightMenu from './RightMenu';
import ShowActionNav from './ShowActionNav';
import BottomMenu from './BottomMenu';
import LoginModal from './Modals/LoginModal';
import LogoutModal from './Modals/LogoutModal';
import Head from 'next/head';
import { AccountContext } from '../../context';

const Layout = ({ children }) => {
  const ref = useRef(null)
  const { setIsLogged, setFid } = useContext(AccountContext)

  useEffect(() => {
    (async () => {
      const { sdk } = await import('@farcaster/frame-sdk');
  
      
      const userProfile = await sdk.context

      console.log(userProfile?.user?.fid)

      const checkUserProfile = async (fid) => {
        const res = await fetch(`/api/user/validate?fid=${fid}`);
        const data = await res.json();
        return data.valid;
      };

      const isValidUser = await checkUserProfile(userProfile?.user?.fid);
      console.log(`User is valid: ${isValidUser}`);
      console.log(isValidUser)
      if (isValidUser) {
        setIsLogged(true)
        setFid(Number(userProfile?.user?.fid))
      }    

      sdk.actions.ready()


    })();
  }, []);



  return (
    <div ref={ref} className='flex-col' style={{position: 'absolute', display: 'flex', minHeight: '100%', height: '100%', width: '100%', overflowX: 'hidden'}}>

      <Head>
        <meta
          name="fc:frame"
          content='{"version":"next","imageUrl":"https://impact.abundance.id/images/icon-02.png","button":{"title":"Impact 2.0","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}'
        />

        {/* Mini App specific metadata */}
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta
          name="fc:miniapp:description"
          content="Get boosted and rewarded for your impact on Farcaster"
        />
        <meta
          name="fc:miniapp:icon"
          content="https://impact.abundance.id/images/icon-02.png"
        />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id" />
      </Head>



      {/* <Mobile /> */}
      <div className='flex-row' style={{justifyContent: 'center', width: 'auto'}}>
        {/* <LeftMenu /> */}
        <CenterMenu>{children}</CenterMenu>
        {/* <RightMenu /> */}
      </div>
      <ShowActionNav />
      <BottomMenu />
      <LoginModal />
      <LogoutModal />
    </div>
  );
};

export default Layout;