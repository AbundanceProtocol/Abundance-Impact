import React from 'react';

const Soon = ({ TopIcon }) => {

  return (
    <div className={`flex-row`} style={{padding: '0 10px', justifyContent: 'flex-start', maxWidth: '260px'}}>
      <div className="flex-col" style={{height: '46px', alignItems: 'center', justifyContent: 'center'}}>
        <div className={`flex-row flex-middle inactive-nav-link lock-btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
          <TopIcon className="size-25" style={{margin: '3px 12px 3px 12px'}} />
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