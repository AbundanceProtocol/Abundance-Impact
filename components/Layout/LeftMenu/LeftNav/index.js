import React, { useContext } from 'react';
import { AccountContext } from '../../../../context';
import { useRouter } from 'next/router';
import { button } from '../../../assets/button';
import Soon from './Soon';
import Working from './Working';
import Locked from './Locked';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';
import { FaPen } from 'react-icons/fa';

const LeftNav = ({buttonName}) => {
  const { isLogged, showActions } = useContext(AccountContext);
  const { isMobile, isTablet } = useMatchBreakpoints();
  const router = useRouter()
  let { account, icon, link, working } = button[buttonName]
  const TopIcon = icon || FaPen
  let menuState = "nav-link"
  let accountState = !account || (isLogged && account)
  if ((router.route === link) && accountState || (buttonName == 'Cast Actions' && showActions)) {
    menuState = "active-nav-link"
  } else if (!working) {
    menuState = "inactive-nav-link"
  }
  let unlockedState = 'btn-hvr'
  if (account && !isLogged || !working) {
    unlockedState = 'lock-btn-hvr'
  }

  return (
    <div className="left-container" style={{padding: 'auto 8px'}}>
      {!working ? (<Soon TopIcon={TopIcon} isMobile={isMobile} isTablet={isTablet} buttonName={buttonName} />) : (isLogged || !account) ? (<Working buttonName={buttonName} link={link} menuState={menuState} TopIcon={TopIcon} isTablet={isTablet} isMobile={isMobile} />) : (<Locked TopIcon={TopIcon} menuState={menuState} isMobile={isMobile} isTablet={isTablet} buttonName={buttonName} />)}
    </div>
  )
}

export default LeftNav;