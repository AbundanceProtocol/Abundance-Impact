import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../../../../context';
import Creators from './Creators';
import Curators from './Curators';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';

const Leaderboard = () => {
  const { points, ecoData } = useContext(AccountContext);
  const [topCreators, setTopCreators] = useState([])
  const [topCurators, setTopCurators] = useState([])
  const [sched, setSched] = useState({points: false})
  const router = useRouter()
  const { ecosystem } = router.query

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
    if (router.route == '/~/ecosystems/[ecosystem]') {
      if (sched.points) {
        getTopCreators()
        getTopCurators()
        setSched(prev => ({...prev, points: false }))
      } else {
        const timeoutId = setTimeout(() => {
          getTopCreators()
          getTopCurators()
          setSched(prev => ({...prev, points: false }))
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [points, sched.points]);

  return (
    router.route == '/~/ecosystems/[ecosystem]' && (
      <>
        {topCreators?.length > 0 && (
          <div style={{margin: '18px 0px 12px 20px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
            <p style={{padding: '0 0 6px 0', fontSize: '20px', fontWeight: '600'}}>Creator & Builder Leaderboard: </p>
            <div className='flex-col' style={{gap: '0.5rem', marginTop: '10px'}}>
              {(topCreators.map((creator, index) => (<Creators {...{creator, index, key: index }} />)))}
            </div>
          </div>
        )}
        {topCurators?.length > 0 && (
          <div style={{margin: '18px 0px 12px 20px', backgroundColor: '#334455ee', width: '380px', borderRadius: '20px', padding: '32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
            <p style={{padding: '0 0 6px 0', fontSize: '20px', fontWeight: '600'}}>Curator Leaderboard: </p>
            <div className='flex-col' style={{gap: '0.5rem', marginTop: '10px'}}>
              {(topCurators.map((curator, index) => (<Curators {...{curator, index, key: index }} />)))}
            </div>
            {topCurators?.length > 0 && (<div className='flex-row' style={{height: '10px', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '0px', margin: '15px 0 0 0'}}><Link href={`/~/ecosystems/${ecoData?.ecosystem_handle}/curators`} ><div className={'filter-item'} style={{fontSize: '12px', border: '1px solid #666', padding: '1px 5px'}}>See all</div></Link></div>)}
          </div>
        )}
      </>
    )
  )
}

export default Leaderboard;