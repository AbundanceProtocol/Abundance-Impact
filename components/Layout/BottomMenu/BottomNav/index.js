import React, { useContext } from 'react';
import { AccountContext } from '../../../../context';
import { useAppRouter } from '../../../../hooks/useAppRouter';
import { button } from '../../../assets/button';
import Soon from './Soon';
import Working from './Working';
import Locked from './Locked';

const BottomNav = ({buttonName}) => {
  const { showActions, isLogged } = useContext(AccountContext);
  const router = useAppRouter()

  let { account, icon, link, working } = button[buttonName]
  const TopIcon = icon
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
    <div className="flex-row" style={{padding: 'auto 8px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>
      {!working ? (<Soon TopIcon={TopIcon} />) : (isLogged || !account) ? (<Working buttonName={buttonName} link={link} menuState={menuState} TopIcon={TopIcon} />) : (<Locked TopIcon={TopIcon} menuState={menuState} />)}
    </div>
  )
}

export default BottomNav;