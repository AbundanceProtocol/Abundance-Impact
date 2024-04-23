import React from 'react';
// import Spinner from '../../Spinner'
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";


export default function DashboardBtn({amount, type, icon: Icon, loading}) {
  return (
    <div className='flex-col' style={{position: 'relative'}}>
      <div className='flex-row' style={{position: 'relative'}}>
        <div className='follow-select flex-col' style={{color: loading ? 'transparent' : '#dee', textAlign: 'center', justifyContent: 'center', gap: '0.25rem', height: '60px', width: 'auto', backgroundColor: '#456', border: '1px solid #aaa'}}>
          <div className='flex-row' style={{gap: '0.25rem', justifyContent: 'center'}}>
            <div>{amount}</div>
            {<Icon style={{width: '17px', height: '17px', backgroundColor: 'white !important', padding: '1px 0 0 0'}} />}
          </div>
          <div style={{fontWeight: '400', fontSize: '14px'}}>{type}</div>
        </div>
      </div>
    </div>
  )
}