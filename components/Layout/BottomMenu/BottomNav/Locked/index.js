import React, { useContext } from 'react';
import { FaLock } from 'react-icons/fa';
import { AccountContext } from '../../../../../context';

const Locked = ({ TopIcon, menuState }) => {
  const { LoginPopup } = useContext(AccountContext)

  return (
    <div className={`flex-row`} style={{padding: '0 10px', justifyContent: 'flex-start', maxWidth: '260px'}} onClick={LoginPopup}>
        <div className="flex-col" style={{height: '46px', alignItems: 'center', justifyContent: 'center'}}>
          <div className={`flex-row flex-middle ${menuState} lock-btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
            <TopIcon className="size-25" style={{margin: '3px 12px 3px 12px'}} />
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