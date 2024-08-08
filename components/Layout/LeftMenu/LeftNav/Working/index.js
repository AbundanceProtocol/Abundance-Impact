import React from 'react';
import Link from 'next/link';

const Working = ({buttonName, link, menuState, TopIcon, isTablet, isMobile }) => {

  return (
    <Link href={link} style={{maxWidth: '260px'}}>
      <div className={`flex-row`} style={{paddingRight: isMobile ? '1em' : 'unset', justifyContent: 'flex-start'}}>
        <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
          <div className={`flex-row flex-middle ${menuState} btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
            <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
            <div className="font-15 left-nav mid-layer" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '19px', padding: '0 24px 0 0'}}>
              {buttonName}
            </div>
            <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Working;