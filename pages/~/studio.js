import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import useStore from '../../utils/store';
import { AccountContext } from '../../context';
import { ActiveUser, Degen, Logo } from '../assets';
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';
import axios from 'axios';
import Cast from '../../components/Cast'
import DashboardBtn from '../../components/Panels/DashboardBtn'
import { FaLock, FaPowerOff } from "react-icons/fa";
import { formatNum, getCurrentDateUTC, isYesterday, checkImageUrls } from '../../utils/utils';
import { FaRegStar } from 'react-icons/fa';
import { IoDiamondOutline as Diamond } from "react-icons/io5";
// import { MdOutlineRefresh } from "react-icons/md";
import { HiRefresh } from "react-icons/hi";

export default function ProfilePage() {
  const router = useRouter();
  const store = useStore()
  const [user, setUser] = useState(null)
  const account = useContext(AccountContext)
  const ref = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Casts', 'Channels', 'Media', 'Proposals']
  const [searchSelect, setSearchSelect ] = useState('Casts')
  const { isMobile } = useMatchBreakpoints();
  const [userFeed, setUserFeed] = useState(null)
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const [userTips, setUserTips] = useState(null)
  const [userAllowance, setUserAllowance] = useState(null)
  const [userAllowances, setUserAllowances] = useState({totalImpact: 0, totalQuality: 0, remainingImpact: 0, remainingQuality: 0})
  const userTotalImpact = useStore(state => state.userTotalImpact);
  const userTotalQuality = useStore(state => state.userTotalQuality);
  const userRemainingImpact = useStore(state => state.userRemainingImpact);
  const userRemainingQuality = useStore(state => state.userRemainingQuality);
  const [feedRouterScheduled, setFeedRouterScheduled] = useState(false);

  useEffect(() => {
    if (store.userProfile) {
      setUser(store.userProfile)
    }
    // if (store.fid && store.fid !== '-') {
    //   console.log('4')

    //   getUserFeed(store.fid, false)
    //   // getUserTipsReceived(user.fid)
    //   getUserAllowance(store.fid)
    //   const currentDate = getCurrentDateUTC()
    //   if (store && store.userUpdateTime && isYesterday(store.userUpdateTime, currentDate)) {
    //     console.log('1')
    //     getCurationAllowance(store.fid)
    //   }

    // }
  }, []);

  // useEffect(() => {
  //   if (user && user.fid && user.fid !== '-') {
  //     console.log('1')
  //     getUserFeed(user.fid, false)
  //     // getUserTipsReceived(user.fid)
  //     getUserAllowance(user.fid)
  //     const currentDate = getCurrentDateUTC()
  //     if (store && store.userUpdateTime && isYesterday(store.userUpdateTime, currentDate)) {
  //       console.log('1')
  //       getCurationAllowance(user.fid)
  //     }
  //   }
  // }, [user])

  useEffect(() => {
    if (feedRouterScheduled) {
      if (user && user.fid && user.fid !== '-') {
        console.log('2')

        getUserFeed(user.fid, false)
        // getUserTipsReceived(user.fid)
        getUserAllowance(user.fid)
        const currentDate = getCurrentDateUTC()
        if (store && store.userUpdateTime && isYesterday(store.userUpdateTime, currentDate)) {
          console.log('1')
          getCurationAllowance(user.fid)
        }
      }
      setFeedRouterScheduled(false);
    } else {
      const timeoutId = setTimeout(() => {
        if (user && user.fid && user.fid !== '-') {
          console.log('3')

          getUserFeed(user.fid, false)
          // getUserTipsReceived(user.fid)
          getUserAllowance(user.fid)
          const currentDate = getCurrentDateUTC()
          if (store && store.userUpdateTime && isYesterday(store.userUpdateTime, currentDate)) {
            console.log('1')
            getCurationAllowance(user.fid)
          }
        }
        setFeedRouterScheduled(false);
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [user, feedRouterScheduled]);


  async function refresh() {
    
  }

  async function getUserFeed(fid, recasts) {
    if (!userFeed) {
      try {
        const response = await axios.get('/api/getUserCasts', {
          params: {
            fid,
            recasts
          }
        })
        const feed = response.data.feed
        console.log(response.data.feed)
        setUserFeed(feed)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }

  async function getUserAllowance(fid) {
    // console.log(fid, userFeed)
    if (user && !userAllowance && fid) {
      // let totalAllowance = 0
      let remaningAllowance = 0
      // let usedAllowance = 0

      try {
        const responseTotal = await axios.get('/api/degen/getUserAllowance', {
          params: {
            fid: fid,
          }
        })

        if (responseTotal?.data) {
          console.log(responseTotal.data.total)
          // totalAllowance = await responseTotal.data.total
          remaningAllowance = await responseTotal.data.remaining
        }

        // const responseUsed = await axios.get('/api/degen/getUsedTips', {
        //   params: {
        //     fid: fid,
        //   }
        // })

        // if (responseUsed?.data) {
        //   console.log(responseUsed.data.tips)
        //   usedAllowance = await responseUsed.data.tips
        // }

        // let remaningAllowance = Number(totalAllowance) - Number(usedAllowance)
        console.log(remaningAllowance)
        if (!isNaN(remaningAllowance)) {
          console.log(remaningAllowance)
          setUserAllowance(remaningAllowance)
        } else {
          console.log(0)
          setUserAllowance(0)
        }
      } catch (error) {
        console.error('Error creating post:', error);
        setUserAllowance(0)
      }

      // try {
      //   const response = await axios.get('/api/degen/getUserTipsReceived', {
      //     params: { fid }
      //   })
      //   const tips = response.data.tips
      //   if (tips) {
      //     setUserTips(tips)
      //   }
      //   console.log(tips)
      //   // console.log(response.data.feed)
      //   // setUserFeed(feed)
      // } catch (error) {
      //   console.error('Error submitting data:', error)
      // }



    }
  }

  async function getCurationAllowance(fid) {
    try {
      const response = await axios.post('/api/curation/postUserStatus', {fid: fid })
      if (response.data) {
        const { impact_allowance, quality_allowance, remaining_i_allowance, remaining_q_allowance } = response.data
        store.setUserTotalImpact(impact_allowance)
        store.setUserTotalQuality(quality_allowance)
        store.setUserRemainingImpact(remaining_i_allowance)
        store.setUserRemainingQuality(remaining_q_allowance)
        const currentDate = getCurrentDateUTC()
        store.setUserUpdateTime(currentDate)
      }
      console.log('Post created:', response.data.impact_allowance);
      // console.log('Post created:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }

  async function getUserTipsReceived(fid) {
    // console.log(fid, userFeed)
    if (user && !userTips) {
      try {
        const response = await axios.get('/api/degen/getUserTipsReceived', {
          params: { fid }
        })
        const tips = response.data.tips
        if (tips) {
          setUserTips(tips)
        }
        console.log(tips)
        // console.log(response.data.feed)
        // setUserFeed(feed)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`430px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`390px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 190}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])
  
  function closeImagePopup() {
    setShowPopup({open: false, url: null})
  }
  function closeImagePopup() {
    setShowPopup({open: false, url: null})
  }

  function openImagePopup(embed) {
    let newPopup = { ...showPopup }
    newPopup.open = true
    newPopup.url = embed.url
    setShowPopup(newPopup)
  }

  const ExpandImg = ({embed}) => {
    return (
      <>
        <div className="overlay" onClick={closeImagePopup}></div>
        <img loading="lazy" src={embed.showPopup.url} className='popupConainer' alt="Cast image embed" style={{aspectRatio: 'auto', maxWidth: screenWidth, maxHeight: screenHeight, cursor: 'pointer', position: 'fixed', borderRadius: '12px'}} onClick={closeImagePopup} />
      </>
    )
  }

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      setScreenHeight(window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const UserData = () => {
    const [loading, setLoading] = useState(false);

   return (
    <div className="inner-container flex-col" style={{width: '100%', display: 'flex', flexDirection: 'col', justifyContent: 'space-between', backgroundColor: '#66666633', gap: '1rem'}}>
      <div className='flex-row' style={{gap: '0.5rem'}}>

        <div style={{width: '100%'}}>
          <div>
            <div>
              <div>
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`https://warpcast.com/${user.username}`}>
                      <img loading="lazy" src={user.pfp_url} className="" alt={`${user.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #cdd'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: '100%', gap: '1rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <span className="" data-state="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/${user.username}`}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font" style={{color: '#cdd', fontSize: '18px'}}>{user.display_name}</span>
                              <div className="" style={{margin: '0 0 0 3px'}}>
                                {(user.power_badge) && (<ActiveUser />)}
                              </div>
                            </div>
                          </a>
                        </span>
                        <span className="user-font" datastate="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/${user.username}`} style={{color: '#cdd'}}>@{user.username}</a>
                        </span>
                        <div className="">·</div>
                        <a className="fc-lnk" title="Navigate to cast" href={`https://warpcast.com/${user.username}`}>
                          <div className="fid-btn" style={{backgroundColor: '#355', color: '#cdd'}}>fid: {user.fid}</div>
                        </a>
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: textMax, color: '#cdd'}}>{user.profile.bio.text}</div>
                    </div>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                    <div className="" style={{flex: 1}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                          <div style={{fontWeight: '700', fontSize: '13px'}} title={user.following_count}>{formatNum(user.following_count)}</div>
                          <div style={{fontWeight: '400'}}>following</div>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 2}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                          <div style={{fontWeight: '700', fontSize: '13px'}} title={user.follower_count}>{formatNum(user.follower_count)}</div>
                          <div style={{fontWeight: '400'}}>followed</div>
                        </div>
                      </div>
                      {/* <div className="flex-row" style={{flex: 1}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center'}}>
                          <div className='soon-btn'>SOON</div>
                          <div style={{fontWeight: '400'}}>impact</div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex-col' style={{gap: '0.5rem', alignItems: 'center'}}>
          
          {store.isAuth ? (<div className='mini-out-btn' style={{height: 'max-content', textAlign: 'center', width: '30px', padding: '6px', alignItems: 'center', justifyContent: 'center'}} onClick={account.LogoutPopup}>
            {/* Log out */}
            <FaPowerOff size={20} color='#fff' />
            </div>) : (<div className='logout-btn' style={{height: 'max-content', textAlign: 'center'}} onClick={account.LoginPopup}>Login</div>)}

          <div className='follow-select' style={{width: 'auto', padding: '5px 5px 8px 5px', textAlign: 'center'}} onClick={() => getCurationAllowance(user.fid)}>
            <HiRefresh size={22} color='#fff' />
          </div>
        </div>
        
        </div>
        <div className='flex-row' style={{justifyContent: 'center', gap: '0.5rem'}}>
          {/* <DashboardBtn amount={formatNum(userTips)} type={'received'} icon={Degen} /> */}
          <DashboardBtn amount={formatNum(userAllowance)} type={'allowance'} icon={Degen} />
          <DashboardBtn amount={formatNum(userRemainingImpact)} type={'impact'} icon={FaRegStar} />
          <DashboardBtn amount={formatNum(userRemainingQuality)} type={'q/dau'} icon={Diamond} />
        </div>
    </div>)
  }

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  const SearchOptionButton = (props) => {
    const btn = props.buttonName
    let isSearchable = true
    let comingSoon = false
    if (props.buttonName == 'Casts' && !store.isAuth) {
      isSearchable = false
    }
    if (props.buttonName == 'Channels' || props.buttonName == 'Media' || props.buttonName == 'Proposals') {
      comingSoon = true
    }

    return isSearchable ? (<>{comingSoon ? (<div className='flex-row' style={{position: 'relative'}}><div className={(searchSelect == btn) ? 'active-nav-link btn-hvr lock-btn-hvr' : 'nav-link btn-hvr lock-btn-hvr'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '12px' : '15px'}}>{btn}</div>
      <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(20%, -50%)' }}>
        <div className='soon-btn'>SOON</div>
      </div>
    </div>) : (
      <div className={(searchSelect == btn) ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '12px' : '15px'}}>{btn}</div>)}</>
    ) : (
      <div className='flex-row' style={{position: 'relative'}}>
        <div className='lock-btn-hvr' name={btn} style={{color: '#bbb', fontWeight: '600', padding: '5px 14px', borderRadius: '14px', cursor: 'pointer', fontSize: isMobile ? '12px' : '15px'}} onClick={account.LoginPopup}>{btn}</div>
        <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-20%, -50%)' }}>
          <FaLock size={8} color='#999' />
        </div>
      </div>
    )
  }

  const updateCast = (index, newData) => {
    const updatedFeed = [...userFeed]
    updatedFeed[index] = newData
    console.log(newData)
    setUserFeed(updatedFeed)
  }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { (store.isAuth && user) && <UserData/> }
      <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '1px solid #888'}}>
        { userButtons.map((btn, index) => (
          <SearchOptionButton buttonName={btn} key={index} /> ))}
      </div>
      <div style={{margin: '0 0 30px 0'}}>
        {userFeed && userFeed.map((cast, index) => (<Cast cast={cast} key={index} index={index} updateCast={updateCast} openImagePopup={openImagePopup} />))}
      </div>
      <div>
        {showPopup.open && (<ExpandImg embed={{showPopup}} />)}
      </div>
    </div>
  );
}