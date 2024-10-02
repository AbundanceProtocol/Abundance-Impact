import React, { useContext } from 'react';
import { button } from '../../../pages/assets/button';
import HomeButton from '../HomeButton';
import LeftNav from './LeftNav';
import CastActionNav from '../CastActionNav'
import { AccountContext } from '../../../context';
import { useRouter } from 'next/router';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const LeftMenu = () => {
  const { isLogged } = useContext(AccountContext)
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints();

  return (
    !isMobile && (
      <div className="flex-col" style={{padding: '58px 0 0 0', position: 'relative'}}>
        <div className='left-container'></div>
        {!(!isLogged && router.route == '/') && (<div className='flex-row left-container' style={{position: 'fixed', top: '4px', width: '49px', height: '33px', alignItems: 'center', justifyContent: 'center'}}>
            <HomeButton />
          </div>)}

          {!(!isLogged && router.route == '/') && (<div className='flex-col left-container' style={{position: 'fixed'}}>
          {button['side-menu'].map((btn, index) => (
            <LeftNav buttonName={btn} key={index} />))}
          <CastActionNav />
        </div>)}
      </div>
    )
  )
}

export default LeftMenu;