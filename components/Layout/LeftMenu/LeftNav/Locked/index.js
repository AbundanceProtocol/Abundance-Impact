import React, { useContext } from 'react';
import { FaLock } from 'react-icons/fa';
import { AccountContext } from '../../../../../context';

const Locked = ({ TopIcon, menuState, isMobile, isTablet, buttonName }) => {
  const { LoginPopup } = useContext(AccountContext)

  return (
    <div className={`flex-row`} style={{paddingRight: isMobile ? '1em' : 'unset', justifyContent: 'flex-start', maxWidth: '260px'}} onClick={LoginPopup}>
      <div className="flex-col" style={{height: '58px', alignItems: 'center', justifyContent: 'center'}}>
        <div className={`flex-row flex-middle ${menuState}`} style={{padding: '2px 0 2px 0', borderRadius: '16px', border: '1px solid #345', color: '#bbb'}}>
          <TopIcon className="size-25" style={{margin: '6px 12px 6px 12px'}} />
          <div className="font-15 left-nav mid-layer" style={{textAlign: 'center', fontSize: isTablet ? '12px' : '19px', padding: '0 24px 0 0'}}>
            {buttonName}
          </div>
          <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
            <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-100%, -50%)' }}>
              <FaLock size={8} color='#999' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Locked;