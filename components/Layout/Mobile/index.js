import React, { useState } from 'react';
import styled from '@emotion/styled'
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import { HiChevronUp as CollapseIcon, HiMenu } from 'react-icons/hi';
import EcosystemNav from '../EcosystemNav'
import HomeButton from '../HomeButton';
import MobileMenu from './MobileMenu';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const Mobile = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isMobile } = useMatchBreakpoints();

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

  return (
    isMobile && 
      (<React.Fragment key="top">
        <MobileAppbar className='top-layer' position="fixed" elevation={0} sx={{paddingRight: 0}} style={{backgroundColor: '#2D4254'}}>
          <nav className="nav-bar-mobile">
            <NavbarHeader>
              <div className="navbar-header">
                <HomeButton />
                <EcosystemNav />
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
          <MobileMenu {...{setMobileMenuOpen}} />
        </Drawer>
      </React.Fragment>
    )
  )
}

export default Mobile;

const MobileAppbar = styled(AppBar)`
  z-index: 2;
  padding: 0 8px;

  @media(max-width: 360px) {
    padding: 0 8px 0 8px;
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

const MenuButton = styled(Button)`
  width: 100%; 
  justify-content: center; 
  align-items: start; 
  background: transparent;
  min-width: 38px;
  max-width: 38px;
  font-size: 25px;
  color: #eee;

  @media(max-width: 360px) {
    font-size: 22px;
    min-width: 40px;
    max-width: 40px;
  }
`;