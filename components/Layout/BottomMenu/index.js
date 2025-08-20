import React, { useRef, useContext } from 'react';
import { button } from '../../assets/button';
import BottomNav from './BottomNav';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { useRouter } from 'next/router';
import { AccountContext } from '../../../context';

const BottomMenu = () => {
  const ref1 = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const router = useRouter()
  const { isLogged } = useContext(AccountContext)

  return (
    isMobile ? (
      <>
        {router.route !== '/~/studio/multi-tip-compose' && (<div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#002244cc', height: '46px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}>
          <div className='flex-row' style={{position: 'relative', width: '100%', justifyContent: 'center', padding: '0 10px'}}>
          {button['bottom-nav'].map((btn, index) => (
            <BottomNav buttonName={btn} key={index} /> ))}
          </div>
        </div>)}
      </>
    ) : (
      <>
        {isLogged && router.route !== '/~/studio/multi-tip-compose' && (<div ref={ref1} className='flex-row shadow' style={{position: 'fixed', top: 0, backgroundColor: '#002244ee', height: '54px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box', justifyContent: 'center'}}>
          <div className='flex-row' style={{position: 'relative', maxWidth: '620px', width: '100%', justifyContent: 'center', padding: '0 10px'}}>
          {button['bottom-nav'].map((btn, index) => (
            <BottomNav buttonName={btn} key={index} /> ))}
          </div>
        </div>)}
      </>


      // <div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#000000ff', height: '0px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}></div>
    )
  )
}

export default BottomMenu;