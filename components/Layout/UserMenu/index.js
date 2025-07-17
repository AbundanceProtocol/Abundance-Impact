import React, { useRef, useContext } from 'react';
import { button } from '../../../pages/assets/button';
import BottomNav from '../BottomMenu/BottomNav';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { useRouter } from 'next/router';
import { AccountContext } from '../../../context';
import { FaStar } from 'react-icons/fa';

const UserMenu = () => {
  const ref1 = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const router = useRouter()
  const { userBalances } = useContext(AccountContext)

  return (
    <div ref={ref1} className='flex-row' style={{position: 'fixed', top: 0, backgroundColor: '', height: '', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box', zIndex: '9999'}}>

      <div className={'flex-row items-center'} style={{margin: '10px auto 10px auto', border: '1px solid #999', padding: '3px 3px 3px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}}>

        <div className={`impact-arrow`} style={{margin: '0 0 0 0' }}>
          <FaStar size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
        </div>

        <div style={{textAlign: 'center', fontSize: '16px', fontWeight: '600', color: '#eee', margin: `2px 2px`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div>{userBalances?.impact || '0'}</div>
        </div>

        <div style={{textAlign: 'center', fontSize: '13px', fontWeight: '400', color: '#eee', margin: `3px 8px 3px 5px`, width: '', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div>$impact</div>
        </div>
      </div>

    </div>
  )
}

export default UserMenu;