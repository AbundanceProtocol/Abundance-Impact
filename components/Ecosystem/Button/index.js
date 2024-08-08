import React from 'react';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

export default function Button({ text, prevIcon: PrevIcon, postIcon: PostIcon, setupEcosystem, target, isSelected, size, submit }) {
  const { isMobile } = useMatchBreakpoints();
  let mobileIcon = 18
  let desktopIcon = 20
  let mobileText = '14px'
  let desktopText = '18px'
  let textPadding = '0px 3px'
  if (size && size == 'small') {
    mobileIcon = 18
    desktopIcon = 20
    mobileText = '14px'
    desktopText = '18px'
    textPadding = '0px 3px'
  } else if (size && size == 'medium') {
    mobileIcon = 19
    desktopIcon = 22
    mobileText = '18px'
    desktopText = '22px'
    textPadding = '2px 3px'
  } else if (size && size == 'large') {
    mobileIcon = 24
    desktopIcon = 24
    mobileText = '18px'
    desktopText = '24px'
    textPadding = '10px 3px'
  }


  return (
    <div className='active-nav-btn btn-hvr' style={{border: `${isSelected ? '2px solid #9df' : '1px solid #777'}`, padding: '2px', borderRadius: '10px', backgroundColor: submit ? '#6f6' : '', maxWidth: 'fit-content', cursor: submit ? 'pointer' : 'default'}} onClick={() => {
      if (target || submit) {
          console.log(target)
          setupEcosystem(target)
        }
      }}>
      <div className="top-layer flex-row">
        <div className="flex-row" style={{padding: '0 10px', marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>

          {PrevIcon && (<div className={`flex-row`} style={{border: '0px solid #abc', padding: '0px 5px 0px 0', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '0px 0px'}}>
              <PrevIcon size={isMobile ? mobileIcon : desktopIcon} />
            </div>
          </div>)}
          {text && (<div style={{fontSize: isMobile ? mobileText : desktopText, fontWeight: '600', color: submit ? '#222' : '', padding: textPadding}}>
            {text}
          </div>)}
          {PostIcon && (<div className={`flex-row`} style={{border: '0px solid #abc', padding: '0px 0px 0px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '0px 0px'}}>
              <PostIcon size={isMobile ? mobileIcon : desktopIcon} />
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
}