import React, { useContext } from 'react';
import EcosystemNav from '../EcosystemNav';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { AccountContext } from '../../../context';
import UserMenu from '../UserMenu';

const CenterMenu = ({ children }) => {
  const { isMobile } = useMatchBreakpoints();
  const { isMiniApp } = useContext(AccountContext)

  return (
    <div>
      <div className="container cast-area flex-col" style={isMobile ? {} : {width: isMobile ? '100%' : '620px', position: 'relative', maxWidth: isMobile? '100%' : '620px' }}>
        {!isMobile && <EcosystemNav />}
      {children}
      </div>
    </div>
  )
}

export default CenterMenu;