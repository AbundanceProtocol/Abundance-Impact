import React, { useContext } from 'react';
import EcosystemMenu from './EcosystemMenu'
import { AccountContext } from '../../../context';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { useRouter } from 'next/router';

const EcosystemNav = () => {
  const { userBalances, ecoData } = useContext(AccountContext)
  const { isMobile } = useMatchBreakpoints();
  const router = useRouter()

  return (
    (router.route.startsWith('/~/ecosystems/') && router.route.split('/').length > 3) && (<div className={`flex-row ${!isMobile && 'top-layer'}`} style={{gap: '0.3rem', justifyContent: 'center', alignItems: 'center', width: !isMobile ? '620px' : '100%', position: !isMobile ? 'fixed' : 'relative', backgroundColor: isMobile ? '' : '#00112266', padding: isMobile ? '0' : '4px 0'}}>
      <EcosystemMenu />
      <div className="flex-row" style={{border: '1px solid #abc', padding: isMobile ? '3px 4px' : '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
        <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
          <span className="channel-font" style={{color: '#eee', fontSize: isMobile ? '12px' : '14px'}}>{userBalances.impact || 0}</span><span className="channel-font" style={{color: '#eee', fontWeight: '400', fontSize: isMobile ? '9px' : '10px'}}>{ecoData?.ecosystem_points_name || '$IMPACT'}</span>
        </div>
      </div>
      <div className="flex-row" style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
        <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
          <span className="channel-font" style={{color: '#eee', fontSize: isMobile ? '12px' : '14px'}}>{userBalances.qdau || 0}</span><span className="channel-font" style={{color: '#eee', fontWeight: '400', fontSize: isMobile ? '9px' : '10px'}}>qDAU</span>
        </div>
      </div>
    </div>)
  );
};

export default EcosystemNav;