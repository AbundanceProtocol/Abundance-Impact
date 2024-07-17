import React from 'react';
import { FaStar } from 'react-icons/fa';

const Rule = ({show, children}) => {
  console.log(show)

  return (
    show ? (
      <div className='flex-row' style={{alignItems: 'center'}}>
        <div style={{paddingTop: '10px', fontSize: '30px', fontWeight: '700', width: '30px', padding: '0px 35px 0 0'}}><FaStar size={20} color={'#6f6'} /></div>
        <p style={{paddingTop: '0px', fontSize: '14px', fontWeight: '500'}}>
            {children}
        </p>
      </div>
    ) : (<></>)
  )
}

export default Rule;