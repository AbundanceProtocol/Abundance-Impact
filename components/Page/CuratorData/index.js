import React, { useContext, useEffect, useState } from "react";
import { ActiveUser } from '../../../pages/assets'
import { formatNum } from "../../../utils/utils";
import { AccountContext } from "../../../context";
import { useRouter } from 'next/router';
import useMatchBreakpoints from "../../../hooks/useMatchBreakpoints";
import axios from "axios";

const CuratorData = ({ user, textMax, show, type }) => {
  const { points, fid, autotipping, setAutotipping, isLogged, LoginPopup } = useContext(AccountContext)
  const [sched, setSched] = useState({autotip: false})
  const [curators, setCurators] = useState(null)
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints();

  useEffect(() => {
    console.log('user', user)
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




  return (
    show && (
      <div className="inner-container flex-col" style={{width: '100%', display: 'flex', flexDirection: 'col', justifyContent: 'space-between', backgroundColor: '#33445588', gap: '1rem'}}>
        <div className='flex-row' style={{gap: '0.5rem'}}>
          <div style={{width: '100%'}}>
            <div className="flex-row">
              <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                <a className="" title="" href={`https://warpcast.com/${user?.username}`}>
                  <img loading="lazy" src={user?.pfp?.url} className="" alt={`${user?.displayName} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #cdd'}} />
                </a>
              </span>
              <div className="flex-col" style={{width: '100%', gap: '1rem', alignItems: 'flex-start'}}>
                <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '', alignItems: 'flex-start'}}>
                  <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap'}}>
                    <span className="">
                      <a className="fc-lnk" title="" href={`https://warpcast.com/${user?.username}`}>
                        <div className="flex-row" style={{alignItems: 'center'}}>
                          <span className="name-font" style={{color: '#cdd', fontSize: '18px'}}>{user?.displayName}</span>
                          <div className="" style={{margin: '0 0 0 3px'}}>
                            {(user?.activeOnFcNetwork) && (<ActiveUser />)}
                          </div>
                        </div>
                      </a>
                    </span>
                    <span className="user-font">
                      <a className="fc-lnk" title="" href={`https://warpcast.com/${user?.username}`} style={{color: '#cdd'}}>@{user?.username}</a>
                    </span>
                    <div className="">·</div>
                    <a className="fc-lnk" title="Navigate to cast" href={`https://warpcast.com/${user?.username}`}>
                      <div className="fid-btn" style={{backgroundColor: '#355', color: '#cdd'}}>fid: {user?.fid}</div>
                    </a>
                  </div>
                </div>
                <div className="">
                  <div style={{wordWrap: 'break-word', maxWidth: textMax, color: '#cdd'}}>{user?.profile?.bio?.text}</div>
                </div>
                <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                  <div className="" style={{flex: 1}}>
                    <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                      <div style={{fontWeight: '700', fontSize: '13px'}} title={user?.followingCount}>{formatNum(user?.followingCount)}</div>
                      <div style={{fontWeight: '400'}}>following</div>
                    </div>
                  </div>
                  <div className="flex-row" style={{flex: 2}}>
                    <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                      <div style={{fontWeight: '700', fontSize: '13px'}} title={user?.followerCount}>{formatNum(user?.followerCount)}</div>
                      <div style={{fontWeight: '400'}}>followed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {type == 'curator' && (<div className='flex-col' style={{gap: '0.5rem', alignItems: 'center'}}>
            {autotipping.includes(user?.fid) ? (<div className='curator-button' style={{fontSize: isMobile ? '10px' : '11px'}} onClick={(event) => {removeAutotip(event, user?.fid)}}>Auto-tipping</div>) : (<div className='curator-button-on' style={{fontSize: isMobile ? '10px' : '11px'}} onClick={(event) => {addAutotip(event, user?.fid)}}>Auto-tip</div>)}
          </div>)}
          {type == 'creator' && (<div className='flex-col' style={{gap: '0.5rem', alignItems: 'center'}}>
            {/* {autotipping.includes(user?.fid) ? (<div className='curator-button' style={{fontSize: isMobile ? '10px' : '11px'}} onClick={(event) => {removeAutotip(event, user?.fid)}}>Auto-tipping</div>) : (<div className='curator-button-on' style={{fontSize: isMobile ? '10px' : '11px'}} onClick={(event) => {addAutotip(event, user?.fid)}}>Auto-tip</div>)} */}
          </div>)}
        </div>
      </div>
    )
  )
}

export default CuratorData;