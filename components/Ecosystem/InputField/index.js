import React from 'react';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { FaCheckCircle, FaCheck, FaRegTrashAlt  } from "react-icons/fa";
import { FaRegFaceMeh, FaRegFaceFrown, FaRegFaceSmileBeam  } from "react-icons/fa6";
import { ImCross } from "react-icons/im";

export default function InputField({ title, description, name, value, placeholder, inputKeyDown, onInput, setupEcosystem, target, button, isSet, clearInput, cancel, removeField }) {
  const { isMobile } = useMatchBreakpoints();

  // let mobileText = '18px'
  // let desktopText = '20px'
  // if (size && size == 'small') {
  //   mobileText = '14px'
  //   desktopText = '18px'
  // } else if (size && size == 'medium') {
  //   mobileText = '18px'
  //   desktopText = '22px'
  // } else if (size && size == 'large') {
  //   mobileText = '22px'
  //   desktopText = '24px'
  // }
  
  
  
  let setButton = 'btn-empty'
  if (isSet == 'empty') {
    setButton = 'btn-empty'
  } else if (isSet == 'error') {
    setButton = 'btn-error'
  } else if (isSet == 'working') {
    setButton = 'btn-set'
  } else if (isSet == 'set') {
    setButton = 'btn-hvr'
  }

  return (
    <div className='active-nav-link btn-hvr' style={{border: '1px solid #777', padding: '2px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '', maxWidth: '100%', cursor: (isSet == 'set') ? 'pointer' : 'default', width: 'auto'}}>
      
      <div className="" style={{width: '100%'}}>
        <div className="flex-row" style={{padding: '0 10px', marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '100%', alignItems: 'center'}}>

          <div className='flex-col'>
            {title && (<div style={{fontSize: isMobile ? '16px' : '20px', fontWeight: '600', color: '', padding: '10px 3px 4px 3px'}}>
              {title}
            </div>)}
            {description && (<div style={{fontSize: isMobile ? '10px' : '12px', fontWeight: '400', color: (isSet == 'error') ? '#f99' : '', padding: '0px 3px 10px 3px'}}>
              {description}
            </div>)}
          </div>
          <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '10px 0 10px 10px' : '10px 0 10px 0'), width: '', flexGrow: 1, position: 'relative'}}>
            <input onChange={onInput} 
              name={name} 
              placeholder={placeholder} 
              value={value} 
              className='srch-btn' 
              style={{width: '100%', backgroundColor: '#234', margin: '0'}} 
              onKeyDown={inputKeyDown} />
            {(isSet !== 'empty') && (<ImCross color={'grey'} size={14} style={{position: 'absolute', right: 18, top: 9, cursor: 'pointer'}} onClick={() => {clearInput(target)}} />)}
          </div>

          {button ? (<div className={`flex-row ${setButton} btn-hvr`} style={{border: '1px solid #abc', padding: '1px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', margin: isMobile ? '0 0 10px 10px' : '10px 0 10px 10px'}}
           onClick={() => {
            if (isSet == 'set') {
              setupEcosystem(target)
            }}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '5px', fontWeight: '600'}}>
              {button}
            </div>
          </div>) : (<div className={`flex-row ${setButton} btn-hvr`} style={{border: '0px solid #abc', padding: '1px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', margin: isMobile ? ((title) ? '0 0 10px 5px' : '10px 0 10px 5px') : '10px 0 10px 5px'}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '4px 0px', fontWeight: '600'}}>
              {(isSet == 'empty') ? (<FaRegFaceMeh  size={isMobile ? 18 : 20} />
              ) : (isSet == 'error') ? (<FaRegFaceFrown size={isMobile ? 18 : 20} />
              ) : (<FaRegFaceSmileBeam size={isMobile ? 18 : 20} />
              )}
            </div>
          </div>)}
          {cancel && (<div className={`flex-row active-nav-link btn-hvr`} style={{border: '1px solid #abc', padding: '1px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', margin: isMobile ? '10px 0 10px 10px' : '10px 0 10px 10px'}} onClick={() => {removeField(target)}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '7px 3px', fontWeight: '600'}}>
              <FaRegTrashAlt size={15} />
            </div>
          </div>)}

        </div>
      </div>
    </div>
  );
}