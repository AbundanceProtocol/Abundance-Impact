import React, { useContext } from 'react';
import Link from 'next/link'
import { AccountContext } from '../../../../../context';

const Curators = ({curator, index}) => {
  const { points } = useContext(AccountContext)

  return (
    <div className='flex-row' style={{alignItems: 'center', justifyContent: 'flex-start'}}>
      <div style={{fontSize: '15px', fontWeight: '700', width: '15px', padding: '6px 25px 6px 0', color: '#cde'}}>{index + 1}</div>
      <img loading="lazy" src={curator?.author_pfp} className="" alt={`${curator?.author_name} avatar`} style={{width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px', borderRadius: '24px', border: '1px solid #000'}} />
      <div style={{fontSize: '15px', fontWeight: '500', width: '15px', padding: '6px 10px', textWrap: 'nowrap'}}><Link href={'/~/curator/' + curator?.fid + '?points=' + points }>@{curator?.author_name}</Link></div>
    </div>
  )
}

export default Curators;