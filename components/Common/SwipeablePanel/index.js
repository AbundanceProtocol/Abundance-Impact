import React, { useContext, useRef, useEffect } from 'react';
import ItemWrap from '../../Ecosystem/ItemWrap';
import Item from '../../Ecosystem/ItemWrap/Item';
import { BsKey, BsLock, BsLockFill, BsXCircle, BsPerson, BsPersonFill, BsShieldCheck, BsShieldFillCheck, BsPiggyBank, BsPiggyBankFill, BsStar, BsStarFill, BsQuestionCircle, BsGift, BsGiftFill } from "react-icons/bs";
import { AccountContext } from '../../../context';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import BoostInfo from './BoostInfo';
import ValidateInfo from './ValidateInfo';
import AutoFundInfo from './AutoFundInfo';
import WelcomeInfo from './WelcomeInfo';
import ImpactInfo from './ImpactInfo';
import StreakInfo from './StreakInfo';

const version = process.env.NEXT_PUBLIC_VERSION

const SwipeablePanel = () => {
  const { isLogged, isMiniApp, userBalances, panelOpen, setPanelOpen, panelTarget, setPanelTarget } = useContext(AccountContext)
  const panelRef = useRef(null);
  const { isMobile } = useMatchBreakpoints();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let startY = 0;
    let currentY = 0;

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 80) {
        closeSwipeable();
      }
    };

    panel.addEventListener('touchstart', onTouchStart);
    panel.addEventListener('touchmove', onTouchMove);

    return () => {
      panel.removeEventListener('touchstart', onTouchStart);
      panel.removeEventListener('touchmove', onTouchMove);
    };
  }, [panelOpen]);



  const closeSwipeable = () => {
    setPanelOpen(false);
    setPanelTarget(null);
  };

  return (
    <div onClick={closeSwipeable}>

      {panelOpen && (
        <div
          
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s',
            zIndex: 999,
          }} />
        )}

        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            bottom: panelOpen ? 0 : (panelTarget !== 'welcome') ? '-60%' : '-95%',
            left: '0.5%',
            width: '99%',
            height: (panelTarget !== 'welcome') ? '58%' : '90%',
            backgroundColor: '#55779999',
            backdropFilter: 'blur(12px)',
            borderRadius: '15px 15px 0 0',
            border: '1px solid #468',
            borderBottom: '0',
            padding: '13px 20px 20px 20px',
            margin: '0 0px',
            zIndex: 1000,
            transition: 'bottom 0.3s ease-in-out',
          }}
        >
          <div style={{
            fontSize: '0px',
            height: '4px',
            width: '60px',
            backgroundColor: '#cde',
            borderRadius: '3px',
            margin: '0 auto 10px auto'
          }}>&nbsp;</div>

          {panelTarget == 'welcome' && (<WelcomeInfo />)}
          {panelTarget == 'boost' && (<BoostInfo />)}
          {panelTarget == 'validate' && (<ValidateInfo />)}
          {panelTarget == 'autoFund' && (<AutoFundInfo />)}
          {panelTarget == 'impactBoost' && (<ImpactInfo />)}
          {panelTarget == 'streak' && (<StreakInfo />)}

      </div>

    </div>
  );
};

export default SwipeablePanel;
