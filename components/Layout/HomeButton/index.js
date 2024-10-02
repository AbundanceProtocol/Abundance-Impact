import React from 'react';
import Link from 'next/link';
import { Logo } from '../../../pages/assets';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const HomeButton = () => {
  const { isMobile, isTablet } = useMatchBreakpoints();
  let isSmall = isMobile || isTablet
  return (
  <Link href="/" legacyBehavior>
    <a className={"nav-home-button"}>
      <div className="grid-col centered top-logo">
        <div className="logo-wrapper" style={{padding: isMobile ? '0' : '8px 0 0 0'}}>
          <Logo height={isSmall ? '25px' : '45px'} width={isSmall ? '25px' : '45px'}/>
        </div>
      </div>
    </a>
  </Link>
  )
}

export default HomeButton;