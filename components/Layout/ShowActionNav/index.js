import React, { useContext, useState } from 'react';
import { AccountContext } from '../../../context';
import EcosystemButtons from '../EcosystemNav/EcosystemButtons';
import Rules from '../EcoRules/Rules';
import Criteria from '../EcoRules/Criteria';
import CheckButton from '../EcoRules/CheckButton';
import CastActions from '../CastActionNav/CastActions';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const ShowActionNav = () => {
  const { eligibility, ecoData, showActions } = useContext(AccountContext);
  const { isMobile, isTablet } = useMatchBreakpoints();
  const [ecoButton, setEcoButton] = useState('rules')

  return (
    (isMobile && showActions) && 
      (<div style={{margin: '20px 23px 0 0', bottom: '46px', width: `100%`, position: 'fixed'}}>
        <div style={{backgroundColor: '#1D3244cc', borderRadius: '16px 16px 0 0', padding: '10px 0 20px 0', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
          <p className='' style={{padding: '10px', fontSize: isTablet ? '12px' : '18px', fontWeight: '500'}}>{ecoData?.ecosystem_name} Ecosystem </p>
        </div>
        <EcosystemButtons {...{ ecoButton, setEcoButton }} />

        {(ecoButton == 'rules') && (
          <Rules {...{ ecoData, isMobile }} />)}
        {(ecoButton == 'eligibility') && (eligibility?.hasWalletReq ? (
          <Criteria {...{ ecoData, eligibility, isMobile }} />
        ) : (
          <CheckButton />
        ))}
        {(ecoButton == 'actions') && (
          <CastActions />)}
      </div>
    </div>
    )
  )
}

export default ShowActionNav;