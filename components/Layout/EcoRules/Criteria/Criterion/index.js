import React from 'react';
import { ImCross, ImCheckmark } from "react-icons/im";

const Criterion = ({condition, show, children}) => {
  return (
    show && (
      <div className='flex-row' style={{alignItems: 'center'}}>
        <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}>{condition ? (<ImCheckmark size={20} color={'#6f6'} />) : (<ImCross size={20} color={'red'} />)}</div>
        <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>
          {children}
        </p>
      </div>
    )
  )
}

export default Criterion;