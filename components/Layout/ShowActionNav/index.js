import React, { useContext, useState } from 'react';
import { AccountContext } from '../../../context';
import EcosystemButtons from '../EcosystemNav/EcosystemButtons';
import Rules from '../EcoRules/Rules';
import Criteria from '../EcoRules/Criteria';
import CheckButton from '../EcoRules/CheckButton';
import CastActions from '../CastActionNav/CastActions';
import CreatorNav from '../CastActionNav/CreatorNav';
import CuratorNav from '../CastActionNav/CuratorNav';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import Connect from '../../../components/Connect';
import { useAccount, useReadContract, useContractWrite, usePrepareContractWrite, useWaitForTransactionReceipt } from "wagmi";
import contractABI from '../../../contracts/bulksender.json'
import Onchain from '../../../components/Onchain';



const ShowActionNav = () => {
  const { eligibility, ecoData, showActions } = useContext(AccountContext);
  const { isMobile, isTablet } = useMatchBreakpoints();
  const [ecoButton, setEcoButton] = useState('rules')

  return (
    (isMobile && showActions) && 
      (<div style={{margin: '20px 23px 0 0', bottom: '46px', width: `100%`, position: 'fixed'}}>
        <div style={{backgroundColor: '#193c69ee', borderRadius: '16px 16px 0 0', padding: '10px 0 20px 0', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
          <p className='' style={{padding: '10px', fontSize: isTablet ? '12px' : '18px', fontWeight: '500'}}>Wallet </p>

          {/* <p className='' style={{padding: '10px', fontSize: isTablet ? '12px' : '18px', fontWeight: '500'}}>{ecoData?.ecosystem_name} Ecosystem </p> */}
        </div>

        <div className='flex-col' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
          <Connect />
          <Onchain />

        </div>


        {/* <EcosystemButtons {...{ ecoButton, setEcoButton }} /> */}

        {/* {(ecoButton == 'rules') && (
          <Rules {...{ ecoData, isMobile }} />)} */}

        {/* {(ecoButton == 'eligibility') && (eligibility?.hasWalletReq ? (
          <Criteria {...{ ecoData, eligibility, isMobile }} />
        ) : (
          <CheckButton />
        ))} */}

        {/* {(ecoButton == 'actions') && (
          <CastActions />)} */}

        {/* {(ecoButton == 'curators') && (
          <CuratorNav />)} */}

        {/* {(ecoButton == 'creators') && (
          <CreatorNav />)} */}

      </div>
    </div>
    )
  )
}

export default ShowActionNav;