import React, { useState, useContext, useEffect } from 'react';
import Creators from '../../RightMenu/Leaderboard/Creators';
import axios from 'axios';
import { useRouter } from 'next/router';
import { AccountContext } from '../../../../context';

const CreatorNav = () => {
  const { points } = useContext(AccountContext);
  const [topCreators, setTopCreators] = useState([])
  const [sched, setSched] = useState({points: false})
  const router = useRouter()

  async function getTopCreators() {
    try {
      const response = await axios.get('/api/curation/getTopCreators', {
        params: { points } })
      if (response?.data?.topCreators?.length > 0) {
        const receiverFids = response.data.topCreators
        console.log(receiverFids)
        setTopCreators(receiverFids)
      } else {
        setTopCreators([])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setTopCreators([])
    }
  }

  useEffect(() => {
    // if (router.route == '/~/ecosystems/[ecosystem]') {
      if (sched.points) {
        getTopCreators()
        setSched(prev => ({...prev, points: false }))
      } else {
        const timeoutId = setTimeout(() => {
          getTopCreators()
          setSched(prev => ({...prev, points: false }))
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    // }
  }, [points, sched.points]);

  return (
    topCreators?.length > 0 && (
      <div style={{margin: '18px 0px 12px 0px', width: '380px', padding: '0 32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <div className='flex-col' style={{gap: '0.25rem', marginTop: '10px'}}>
          {(topCreators.map((creator, index) => (<Creators {...{creator, index, key: index }} />)))}
        </div>
      </div>
    )
  )
}

export default CreatorNav;