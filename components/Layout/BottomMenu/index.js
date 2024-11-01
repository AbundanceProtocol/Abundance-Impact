import React, { useRef } from 'react';
import { button } from '../../../pages/assets/button';
import BottomNav from './BottomNav';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { useRouter } from 'next/router';

const BottomMenu = () => {
  const ref1 = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const router = useRouter()

  return (
    isMobile ? (
      <>
        {router.route == '/~/ecosystems/[ecosystem]' && (<div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#1D3244cc', height: '46px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}>
          <div className='flex-row' style={{position: 'relative', width: '100%', justifyContent: 'space-between', padding: '0 10px'}}>
          {button['bottom-nav'].map((btn, index) => (
            <BottomNav buttonName={btn} key={index} /> ))}
          </div>
        </div>)}
      </>
    ) : (
      <div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#000000ff', height: '0px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}></div>
    )
  )
}

export default BottomMenu;