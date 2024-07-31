import React, { useContext } from 'react';
import { AccountContext } from '../../../../context';
import { FaRegStar } from 'react-icons/fa';
import { IoInformationCircleOutline as Info } from "react-icons/io5";
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const CastActions = () => {
  const { points, ecoData } = useContext(AccountContext);
  const { isMobile } = useMatchBreakpoints();

  return (
    <div className='flex-col' style={{gap: '0.5rem', margin: '8px'}}>
      <a className="" title={`+1 ${points}`} href={`https://warpcast.com/~/add-cast-action?name=%2B1+%24${points?.substring(1)}&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2F${ecoData.curate_user ? 'user' : 'impact'}1%3Fpoints=${points?.substring(1)}&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
        <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
          <FaRegStar size={20} />
          <p className={isMobile ? '' : 'left-nav'} style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+1 {points}</p>
        </div>
      </a>

      <a className="" title={`+5 ${points}`} href={`https://warpcast.com/~/add-cast-action?name=%2B5+%24${points?.substring(1)}&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2F${ecoData.curate_user ? 'user' : 'impact'}5%3Fpoints=${points?.substring(1)}&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
        <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
          <FaRegStar size={20} />
          <p className={isMobile ? '' : 'left-nav'} style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>+5 {points}</p>
        </div>
      </a>

      <a className="" title={`${points} Balance`} href={`https://warpcast.com/~/add-cast-action?name=%24${points?.substring(1)}+Balance&icon=info&actionType=post&postUrl=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Faction%2Fbalance?points=${points?.substring(1)}&description=Get+Cast+Balance+for+Impact+App`} target="_blank" rel="noopener noreferrer">
        <div className='flex-row cast-act' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
          <div className={ isMobile ? '' : 'left-nav'} style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
          <Info size={20} />
          <p className={ isMobile ? '' : 'left-nav'} style={{padding: '0px', fontSize: '15px', fontWeight: '500'}}>{points} Balance</p>
          <div className={ isMobile ? '' : 'left-nav'} style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
        </div>
      </a>
    </div>
  )
}

export default CastActions;