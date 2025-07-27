import React, { useRef, useContext, useEffect } from 'react';
import Link from 'next/link';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { useRouter } from 'next/router';
import { AccountContext } from '../../../context';
import { FaStar } from 'react-icons/fa';
import { Logo } from '../../../pages/assets';
import { BsTrophy, BsGear, BsCurrencyExchange, BsChevronDoubleLeft } from "react-icons/bs";
import axios from 'axios';

const version = process.env.NEXT_PUBLIC_VERSION

const UserMenu = () => {
  const ref1 = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const router = useRouter()
  const { userBalances, userInfo, setUserBalances, fid, isLogged, setIsMiniApp, setUserInfo, adminTest } = useContext(AccountContext)

  useEffect(() => {
    console.log('useEffect', fid, userBalances, userInfo)
    if (fid && userBalances.impact == 0) {
      getUserBalance(fid)
    }

    if (fid && !userInfo.username) {
      getUserInfo()
    }
  }, [fid])

  async function getUserInfo() {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
  
      const isMiniApp = await sdk.isInMiniApp()
      console.log('isMiniApp', isMiniApp)
      setIsMiniApp(isMiniApp)

      const userProfile = await sdk.context

      console.log(userProfile?.user?.fid)

      const checkUserProfile = async (fid) => {
        console.log('test4', fid)

        try {
          const res = await fetch(`/api/user/validateUser?fid=${fid}`);
          const data = await res.json();
          console.log('test5', data.valid)

          return data.valid;
        } catch (error) {
          return null
        }
      };

      const isValidUser = await checkUserProfile(fid || userProfile?.user?.fid);
      console.log(`User is valid: ${isValidUser}`);
      console.log(isValidUser)
      if (isValidUser) {
        // setIsLogged(true)
        // setFid(Number(userProfile?.user?.fid))
        console.log('userInfo', userInfo, isMiniApp, userProfile)
        if (isMiniApp && !userInfo.username) {
          setUserInfo({
            pfp: userProfile?.user?.pfp?.url || null,
            username: userProfile?.user?.username || null,
            display: userProfile?.user?.displayName || null,
          })
        } else if (!userInfo.username) {
          getUserProfile(fid)
        }
      }  

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  async function getUserProfile(fid) {
    try {
      const response = await axios.get('/api/user/getUserInfo', { params: { fid } } )
      console.log('getuserInfo', response)
      if (response?.data) {
        let profile = response?.data
        setUserInfo({
          pfp: profile?.pfp || null,
          username: profile?.username || null,
          display: profile?.display || null,
        })
      } else {
        return null
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      return null
    }
  }

  async function getUserBalance(fid) {
    try {
      const response = await axios.get('/api/ecosystem/getBalances', {
        params: { fid, points: '$IMPACT' } })
      if (response?.data?.user) {
        console.log('um-1', response?.data?.user)
        const remainingImpact = response?.data?.user?.remaining_i_allowance || 0
        const remainingQuality = response?.data?.user?.remaining_q_allowance || 0
        setUserBalances(prev => ({
          ...prev,
          impact: remainingImpact,
          qdau: remainingQuality
        }))
      }
    } catch (error) {
      console.error('Error, getBalances failed:', error)
      setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
    }
  }

  
  return (
    <div ref={ref1} className='flex-row' style={{position: 'fixed', top: 0, backgroundColor: '', height: '', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box', zIndex: '9999'}}>


      <div className='flex-row' style={{justifyContent: 'space-between', margin: '10px 16px 10px 16px', width: '100%'}}>



        {userInfo?.pfp ? (<Link href={'/'}><img loading="lazy" src={userInfo?.pfp} className="" alt={`${userInfo?.display} avatar`} style={{width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '24px', border: '1px solid #cdd'}} /></Link>) : (<Link href={'/'}><Logo
          className="rotate"
          height="36px"
          width="36px"
          style={{ fill: "#9ce" }}
        /></Link>)}


        {userInfo?.pfp && (<div className='flex-row' style={{gap: '0.5rem'}}>


          {(version == '2.0' || adminTest) && router.route !== '/' && (
            <div className={'flex-row items-center'} style={{border: '1px solid #999', padding: '5px 3px 0px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}} onClick={() => router.back()}>
              <div className={`impact-arrow`} style={{margin: '0 0 0 0' }}>
                <BsChevronDoubleLeft size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
              </div>
            </div>)}

          <div className={'flex-row items-center'} style={{border: '1px solid #999', padding: '3px 3px 3px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}}>

            <div className={`impact-arrow`} style={{margin: '2px 0 0 0' }}>
              <FaStar size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
            </div>

            <div style={{textAlign: 'center', fontSize: '16px', fontWeight: '600', color: '#eee', margin: `2px 8px 0px 2px`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div>{userBalances?.impact || '0'}</div>
            </div>

            {/* <div style={{textAlign: 'center', fontSize: '13px', fontWeight: '400', color: '#eee', margin: `3px 8px 3px 5px`, width: '', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div>$impact</div>
            </div> */}
          </div>

          {(version == '2.0' || adminTest) && (<div className={'flex-row items-center'} style={{border: '1px solid #999', padding: '5px 3px 0px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}}>
            <div className={`impact-arrow`} style={{margin: '0 0 0 0' }}>
              <BsCurrencyExchange size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
            </div>
          </div>)}


          {(version == '2.0' || adminTest) && (<div className={'flex-row items-center'} style={{border: '1px solid #999', padding: '5px 3px 0px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}}>
            <div className={`impact-arrow`} style={{margin: '0 0 0 0' }}>
              <BsTrophy size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
            </div>
          </div>)}

          {(version == '2.0' || adminTest) && (<div className={'flex-row items-center'} style={{border: '1px solid #999', padding: '5px 3px 0px 3px', borderRadius: '10px', backgroundColor: '#002244cc'}}>
            <div className={`impact-arrow`} style={{margin: '0 0 0 0' }}>
              <BsGear size={22} className='' style={{fontSize: '25px', color: '#eee'}} />
            </div>
          </div>)}


        </div>)}


      </div>

    </div>
  )
}

export default UserMenu;