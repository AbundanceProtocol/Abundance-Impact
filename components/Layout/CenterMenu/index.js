import React from 'react';
import EcosystemNav from '../EcosystemNav';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const CenterMenu = ({ children }) => {
  const { isMobile } = useMatchBreakpoints();

  return (
    <div>
      <div className="container cast-area flex-col" style={isMobile ? {} : {width: isMobile? '100%' : '620px', position: 'relative'}}>
        {!isMobile && <EcosystemNav />}
        {children}
      </div>
    </div>
  )
}

export default CenterMenu;