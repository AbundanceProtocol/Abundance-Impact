import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../../../../context';
import Creators from './Creators';
import axios from 'axios';
import { useRouter } from 'next/router';

const Leaderboard = () => {
  const { points } = useContext(AccountContext);
  const [topCreators, setTopCreators] = useState([])
  const [sched, setSched] = useState({points: false})
  const router = useRouter()

  async function getTopCreators() {
    // if (!paused) {
      try {
        // await setPaused(true)
        const response = await axios.get('/api/curation/getTopCreators', {
          params: { points } })
        // console.log(response)
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
    // }
  }

  useEffect(() => {
    if (router.route == '/~/ecosystems/[ecosystem]') {
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
    }
  }, [points, sched.points]);

  return (
    (router.route == '/~/ecosystems/[ecosystem]' && topCreators?.length > 0) && (
      <div style={{margin: '18px 0px 12px 20px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <p style={{padding: '0 0 6px 0', fontSize: '20px', fontWeight: '600'}}>Creator & Builder Leaderboard: </p>
        <div className='flex-col' style={{gap: '0.5rem', marginTop: '10px'}}>
          {(topCreators.map((creator, index) => (<Creators creator={creator} index={index} key={index} />)))}
        </div>
      </div>
    )
  )
}

export default Leaderboard;