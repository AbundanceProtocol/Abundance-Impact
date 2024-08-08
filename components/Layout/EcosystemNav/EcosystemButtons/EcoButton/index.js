import React from 'react';

const EcoButton = ({handleEcoButton, ecoButton, type, text}) => {

  return (
    <div className="flex-row" style={{border: '1px solid #abc', padding: '4px 8px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: (ecoButton == type) ? '#012' : '', cursor: 'pointer'}} onClick={() => {handleEcoButton(type)}}>
    <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
      <span className="channel-font" style={{color: '#eee'}}>{text}</span>
    </div>
  </div>
  )
}

export default EcoButton;