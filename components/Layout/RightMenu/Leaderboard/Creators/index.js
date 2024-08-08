import React, { useContext } from 'react';
import Link from 'next/link'
import useStore from '../../../../../utils/store';
import { AccountContext } from '../../../../../context';

const Creators = ({creator, index}) => {
  const store = useStore()
  const { LoginPopup } = useContext(AccountContext)

  return (
    <div className='flex-row' style={{alignItems: 'center', justifyContent: 'flex-start'}}>
      <div style={{fontSize: '15px', fontWeight: '700', width: '15px', padding: '6px 35px 6px 0', color: '#cde'}}>{index + 1}</div>
      <img loading="lazy" src={creator?.author_pfp} className="" alt={`${creator?.author_name} avatar`} style={{width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px', borderRadius: '24px', border: '1px solid #000'}} />
      <div style={{fontSize: '15px', fontWeight: '500', width: '15px', padding: '6px 10px', textWrap: 'nowrap'}}><Link className="fc-lnk" href={'/' + creator?.author_name} onClick={(event) => {if (!store.isAuth) {
        event.preventDefault()
        LoginPopup()
        }}}>@{creator?.author_name}</Link></div>
    </div>
  )
}

export default Creators;