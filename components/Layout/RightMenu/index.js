import React, { useContext } from 'react';
import { AccountContext } from '../../../context';
import { FaStar } from 'react-icons/fa';
import Rules from '../EcoRules/Rules';
import Criteria from '../EcoRules/Criteria';
import CheckButton from '../EcoRules/CheckButton';
import Leaderboard from './Leaderboard';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const RightMenu = () => {
  const { eligibility, ecoData } = useContext(AccountContext);
  const { isMobile } = useMatchBreakpoints();

  return (
    <div className='right-nav-text' style={{width: '400px'}}>
      <div>
        <div style={{margin: '58px 0px 12px 20px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}><div className='flex-row' style={{alignItems: 'center', gap: '0.5rem', marginBottom: '10px'}}>
          <FaStar size={34} color={'#9cf'} />
          <div style={{fontSize: '22px', fontWeight: '600'}}>
            {ecoData?.ecosystem_name} Ecosystem
          </div>
        </div>
        <p style={{paddingTop: '20px', fontSize: '17px', fontWeight: '500'}}>Ecosystem Rules: </p>
          <Rules ecoData={ecoData} isMobile={isMobile} />
        {eligibility?.hasWalletReq && (<p style={{paddingTop: '30px', fontSize: '17px', fontWeight: '500'}}>Eligibility Criteria: </p>)}
          {eligibility?.hasWalletReq ? (
            <Criteria ecoData={ecoData} eligibility={eligibility} isMobile={isMobile} />
          ) : (
            <CheckButton />
          )}
        </div>
        <Leaderboard />
      </div>
    </div>
  );
};

export default RightMenu;