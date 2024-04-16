import React, { useRef, useEffect, useState } from 'react';
import Spinner from '../../Spinner'



export default function TopPanelBtn({text, value, color, verified, loading}) {
  return (
    <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#eee'}}>
    <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
      <div className="flex-col">
        <div style={{fontSize: '12px', fontWeight: '500', color: color}}>{text}</div>
        <div style={{fontSize: '13px', color: color}}>{value}</div>
      </div>
      <>
        {(verified == null) ?  null : 
        (loading) ? (<Spinner size={21} color={'#ccc'}></Spinner>) : (verified) ? (<Verified color={'#32b439'} size={25} />) : 
        (!verified) ? (<Rejected color={'red'} size={25} />) : null}
      </>
    </div>
  </div>
  )
}