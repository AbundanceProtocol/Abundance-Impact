import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import useStore from '../../utils/store';
import { AccountContext } from '../../context';
import { ActiveUser } from '../assets';
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';
import axios from 'axios';
import Cast from '../../components/Cast'
import { FaLock } from "react-icons/fa";

export default function ProfilePage() {
  const router = useRouter();
  const store = useStore()
  const [user, setUser] = useState(null)
  const account = useContext(AccountContext)
  const ref = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Casts', 'Channels', 'Media', 'Proposals']
  const [searchSelect, setSearchSelect ] = useState('Casts')
  const { isMobile } = useMatchBreakpoints();
  const [userFeed, setUserFeed] = useState(null)

  useEffect(() => {
    if (store.userProfile) {
      setUser(store.userProfile)
    }
  }, []);

  useEffect(() => {
    if (user && user.fid !== '-') {
      getUserFeed(user.fid, false)
    }
  }, [user])

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

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
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

    const formatNum = (num) => {
      const number = Number(num)
      let formattedNumber = number
      if (number > 1000000) {
        formattedNumber = (number / 1000000).toFixed(1) + 'M'
      } else if (number > 1000) {
        formattedNumber = (number / 1000).toFixed(1) + 'K'
      }
      return formattedNumber
    }


   return (
    <div className="inner-container flex-row" style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#66666633'}}>
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
                      <div className="flex-row" style={{flex: 1}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                          <div style={{fontWeight: '700', fontSize: '13px'}} title={user.follower_count}>{formatNum(user.follower_count)}</div>
                          <div style={{fontWeight: '400'}}>followed</div>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center'}}>
                          <div className='soon-btn'>SOON</div>
                          <div style={{fontWeight: '400'}}>impact</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {store.isAuth ? (<div className='out-btn' style={{height: 'max-content', textAlign: 'center'}} onClick={account.LogoutPopup}>Log out</div>) : (<div className='logout-btn' style={{height: 'max-content', textAlign: 'center'}} onClick={account.LoginPopup}>Login</div>)}
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
        {userFeed && userFeed.map((cast, index) => (<Cast cast={cast} key={index} index={index} />))}
      </div>
    </div>
  );
}