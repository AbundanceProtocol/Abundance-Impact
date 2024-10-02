import React, { useState, useContext, useEffect } from 'react';
import Curators from '../../RightMenu/Leaderboard/Curators';
import axios from 'axios';
import { useRouter } from 'next/router';
import { AccountContext } from '../../../../context';

const CuratorNav = () => {
  const { points } = useContext(AccountContext);
  const [topCurators, setTopCurators] = useState([])
  const [sched, setSched] = useState({points: false})
  const router = useRouter()

  async function getTopCurators() {
    try {
      const response = await axios.get('/api/curation/getTopCurators', {
        params: { points } })
      if (response?.data?.topCurators?.length > 0) {
        const receiverFids = response?.data?.topCurators
        console.log(receiverFids)
        setTopCurators(receiverFids)
      } else {
        setTopCurators([])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setTopCurators([])
    }
  }

  useEffect(() => {
    // if (router.route == '/~/ecosystems/[ecosystem]') {
      if (sched.points) {
        getTopCurators()
        setSched(prev => ({...prev, points: false }))
      } else {
        const timeoutId = setTimeout(() => {
          getTopCurators()
          setSched(prev => ({...prev, points: false }))
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    // }
  }, [points, sched.points]);

  return (
    topCurators?.length > 0 && (
      <div style={{margin: '18px 0px 12px 0px', width: '380px', padding: '0 32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <div className='flex-col' style={{gap: '0.25rem', marginTop: '10px'}}>
          {(topCurators.map((curator, index) => (<Curators {...{curator, index, key: index }} />)))}
        </div>
      </div>
    )
  )
}

export default CuratorNav;