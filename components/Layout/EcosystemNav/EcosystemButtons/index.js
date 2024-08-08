import React, { useContext } from 'react';
import EcoButton from './EcoButton';
import { AccountContext } from '../../../../context';

const EcosystemButtons = ({ecoButton, setEcoButton}) => {
  const { setPrevPoints } = useContext(AccountContext);

  const handleEcoButton = (button) => {
    console.log(button)
    setEcoButton(button)
    setPrevPoints(null)
  }

  return (
    <div className='flex-row' style={{justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
      <EcoButton handleEcoButton={handleEcoButton} ecoButton={ecoButton} type={'rules'} text={'Ecosystem rules'} />
      <EcoButton handleEcoButton={handleEcoButton} ecoButton={ecoButton} type={'eligibility'} text={'Eligibility'} />
      <EcoButton handleEcoButton={handleEcoButton} ecoButton={ecoButton} type={'actions'} text={'Cast Actions'} />
    </div>
  )
}

export default EcosystemButtons;