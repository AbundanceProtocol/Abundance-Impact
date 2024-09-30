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
    <div className='flex-col' style={{justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
      <div className='flex-row' style={{justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
        <EcoButton {...{handleEcoButton, ecoButton, type: 'rules', text: 'Ecosystem rules' }} />
        <EcoButton {...{handleEcoButton, ecoButton, type: 'eligibility', text: 'Eligibility' }} />
        <EcoButton {...{handleEcoButton, ecoButton, type: 'actions', text: 'Cast Actions' }} />
      </div>
      <div className='flex-row' style={{justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
        <EcoButton {...{handleEcoButton, ecoButton, type: 'curators', text: 'Top curators' }} />
        <EcoButton {...{handleEcoButton, ecoButton, type: 'creators', text: 'Top creators' }} />
      </div>
    </div>
  )
}

export default EcosystemButtons;