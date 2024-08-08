import React, { useState } from 'react';
import useStore from '../../../../../utils/store';
import { button } from '../../../../../pages/assets/button';
import useMatchBreakpoints from '../../../../../hooks/useMatchBreakpoints';

const TopNav = ({ buttonName }) => {
  const { isMobile, isTablet } = useMatchBreakpoints();
  const store = useStore()

  let btn = button[buttonName]
  let btnName = buttonName
  if (btnName === 'portal') {
    btnName = store.username
  }
  const TopIcon = btn.icon
  let menuState = "nav-link"
  // let accountState = !btn.account
  // if (navMenu === btn.menu && accountState) {
  //   menuState = "active-nav-link"
  // } else if (!accountState) {
  //   menuState = "inactive-nav-link"
  // }

  return (
    <div style={{padding: '0 8px'}}
    // onMouseEnter={() => {
    //   setNavMenu(btn.menu)
    //   setMenuHover({ ...menuHover, in: Date.now() })
    // }}
    // onMouseLeave={() => setMenuHover({ ...menuHover, out: Date.now() }) }
    >
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

export default TopNav;