import React from 'react';
import { PiSquaresFourLight as Actions } from "react-icons/pi";
import CastActions from './CastActions';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const CastActionNav = () => {
  const { isMobile, isTablet } = useMatchBreakpoints();

  return (
    <div className='left-container' style={{margin: '20px 23px 0 0', maxWidth: '237px'}}>
      <div style={{backgroundColor: '#334455ee', borderRadius: '16px', padding: '0px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
          <Actions size={32} color={'#9cf'} /><p className={isMobile ? '' : 'left-nav'} style={{paddingLeft: '10px', fontSize: isTablet ? '12px' : '18px', fontWeight: '500'}}>Cast Actions </p>
        </div>
        <CastActions />
      </div>
    </div>
  )
}

export default CastActionNav;