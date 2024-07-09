import React from 'react';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const Description = ({ show, text, padding, size }) => {
  const { isMobile } = useMatchBreakpoints();

  let mobileText = '18px'
  let desktopText = '20px'
  if (size && size == 'small') {
    mobileText = '14px'
    desktopText = '18px'
  } else if (size && size == 'medium') {
    mobileText = '18px'
    desktopText = '22px'
  } else if (size && size == 'large') {
    mobileText = '22px'
    desktopText = '24px'
  }


  return (
    show && (
      <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
      <div className="top-layer flex-row">
        <div className="flex-row" style={{padding: padding, marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
          <div style={{fontSize: isMobile ? mobileText : desktopText, fontWeight: '600', color: '', padding: '0px 3px'}}>
            {text}
          </div>
        </div>
      </div>
    </div>
    )
  );
}

export default Description;