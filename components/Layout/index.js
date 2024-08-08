import React, { useRef, useState } from 'react';
import Mobile from './Mobile';
import LeftMenu from './LeftMenu';
import CenterMenu from './CenterMenu';
import RightMenu from './RightMenu';
import ShowActionNav from './ShowActionNav';
import BottomMenu from './BottomMenu';
import LoginModal from './Modals/LoginModal';
import LogoutModal from './Modals/LogoutModal';

const Layout = ({ children }) => {
  const ref = useRef(null)

  return (
    <div ref={ref} className='flex-col' style={{position: 'absolute', display: 'flex', minHeight: '100%', height: '100%', width: '100%', overflowX: 'hidden'}}>
      <Mobile />
      <div className='flex-row' style={{justifyContent: 'center', width: 'auto'}}>
        <LeftMenu />
        <CenterMenu>{children}</CenterMenu>
        <RightMenu />
      </div>
      <ShowActionNav />
      <BottomMenu />
      <LoginModal />
      <LogoutModal />
    </div>
  );
};

export default Layout;