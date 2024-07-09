import React from 'react';

const Soon = ({ TopIcon, isMobile, buttonName, isTablet }) => {

  return (
    <div className={`flex-row`} style={{paddingRight: isMobile ? '1em' : 'unset', justifyContent: 'flex-start', maxWidth: '260px'}}>
      <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
        <div className={`flex-row flex-middle inactive-nav-link lock-btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
          <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
          <div className="font-15 left-nav mid-layer" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '18px', padding: '0 24px 0 0'}}>
            {buttonName}
          </div>
          <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
            <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-70%, -50%)' }}>
              <div className='soon-btn'>SOON</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Soon;