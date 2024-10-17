import React, { useState, useContext, useEffect } from 'react';
import Curators from '../../RightMenu/Leaderboard/Curators';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const CuratorNav = () => {
  const { fid, points, ecoData, autotipping, setAutotipping, isLogged, LoginPopup } = useContext(AccountContext);
  const [topCurators, setTopCurators] = useState([])
  const [sched, setSched] = useState({points: false, autotip: false})
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints();


  useEffect(() => {
    // console.log('user', user)
    if (sched.autotip) {
      if (fid) {
        getUserAutotips(fid)
      }
      setSched(prev => ({...prev, autotip: false }))
    } else {
      const timeoutId = setTimeout(() => {
        if (fid) {
          getUserAutotips(fid)
        }
        setSched(prev => ({...prev, autotip: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [router.query, sched.autotip]);

  async function getUserAutotips(fid) {
    console.log('trigger getAutotipCurators', fid)
    try {
      const response = await axios.get('/api/curation/getAutotipCurators', {
        params: { fid } })
      if (response?.data?.curators?.length > 0 || curators) {
        const userAutotips = response?.data?.curators
        console.log('userAutotips', userAutotips)
        setAutotipping(userAutotips)
      } else {
        setAutotipping([])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setAutotipping([])
    }
  }

  async function removeAutotip(event, curatorFid) {
    event.preventDefault();
    console.log('remove', curatorFid)
    if (!isLogged) {
      LoginPopup()
      return
    } else {
      try {
        const response = await axios.post('/api/curation/removeAutotip', { fid, curators: curatorFid, points });
        console.log(response)
        if (response?.data) {
          let schedCurators = response?.data?.schedule?.search_curators || []
          if (!schedCurators.includes(curatorFid)) {
            setAutotipping(schedCurators);
            console.log(`Added ${curatorFid} to autotipping list`);
          }
        } else {
          console.log('Failed to add curator to autotipping list');
        }
      } catch (error) {
        console.error('Error adding autotip curator:', error);
      }
    }
  }

  async function addAutotip(event, curatorFid) {
    event.preventDefault();
    console.log('add', fid, curatorFid, points)
    if (!isLogged) {
      LoginPopup()
      return
    } else {
      try {
        const response = await axios.post('/api/curation/addAutotip', { fid, curators: curatorFid, points });
        console.log(response)
        if (response?.data) {
          let schedCurators = response?.data?.schedule?.search_curators || []
          if (schedCurators.includes(curatorFid)) {
            setAutotipping(prevAutotipping => [...prevAutotipping, curatorFid]);
            console.log(`Added ${curatorFid} to autotipping list`);
          }
        } else {
          console.log('Failed to add curator to autotipping list');
        }
      } catch (error) {
        console.error('Error adding autotip curator:', error);
      }
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
    console.log('ecoData', ecoData)
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
    <>{(topCurators?.length > 0 && (
      <div style={{margin: '18px 0px 12px 0px', width: '180%', padding: '0 32px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <div className='flex-col' style={{gap: '0.25rem', marginTop: '10px'}}>
          {(topCurators.map((curator, index) => (<div className='flex-row' key={index} style={{alignItems: 'center'}}>
            
            <Curators {...{curator, index }} />
            <div>
              {autotipping.includes(curator?.fid) ? (<div className='curator-button' style={{fontSize: isMobile ? '9px' : '10px', padding: '2px 7px'}} onClick={(event) => {removeAutotip(event, curator?.fid)}}>Auto-tipping</div>) : (<div className='curator-button-on' style={{fontSize: isMobile ? '9px' : '10px', padding: '2px 7px'}} onClick={(event) => {addAutotip(event, curator?.fid)}}>Auto-tip</div>)}
            </div>
          
          
          </div>)))}
        </div>
      </div>
    ))}
    {topCurators?.length > 0 && (<div className='flex-row' style={{height: '10px', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '0px', margin: '0 0 0 0'}}><Link href={`/~/ecosystems/${ecoData?.ecosystem_handle}/curator`} ><div className={'filter-item'} style={{fontSize: '12px', border: '1px solid #666', padding: '1px 5px'}}>See all</div></Link></div>)}
    </>
  )
}

export default CuratorNav;