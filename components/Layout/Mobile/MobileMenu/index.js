import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import NavItem from './NavItem';
import TopNav from './TopNav';
import Box from '@mui/material/Box';
import { button } from '../../../assets/button';
import styled from '@emotion/styled'

// const SubCat = ({ navMenu, menuHover, setMobileMenuOpen, linkTarget, setLinkTarget }) => {
//   try {
//     let subButtons = button['nav-menu'][navMenu]
//     if (typeof subButtons == 'undefined') {
//       subButtons = button['nav-menu']['Home']
//     }

//     return (
//       subButtons?.length > 0 && (
//         subButtons.map((btn, index) => (
//         <NavItem buttonName={btn} key={index} menuHover={menuHover} setMobileMenuOpen={setMobileMenuOpen} linkTarget={linkTarget} setLinkTarget={setLinkTarget} /> ))
//       )
//     )
//   } catch (err) {
//     console.log('error:', err)
//     return null;
//   }
// }

const MobileMenu = ({ setMobileMenuOpen }) => {

  return (
    <div className="mobile-menu-wrapper" style={{display: 'grid', gridAutoFlow: 'column', height: '100%', justifyContent: 'start', width: '100%'}}>
      <Box height="100%" width="100%">
        <div style={{display: 'grid', gridAutoFlow: 'row'}}>
          {button['top-menu'].map((btn, index) => (
            <TopNav {...{buttonName: btn, key: index}} /> ))}
        </div>
      </Box>
    </div>
  )
}

export default MobileMenu;


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