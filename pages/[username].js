import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import useStore from '../utils/store';
import { AccountContext } from '../context';
import { ActiveUser } from './assets';
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'; 
import axios from 'axios';
import { FaSearch, FaLock, FaRegStar } from "react-icons/fa"
import Cast from '../components/Cast'
import { setEmbeds, formatNum } from '../utils/utils';

export default function UserPage({username}) {
  const router = useRouter();
  // const { username } = router.query;
  const noUser = {
    username: 'none',
    display_name: 'No user found',
    power_badge: false,
    fid: '-',
    profile: { bio: { text: 'No user bio found'}},
    following_count: '-',
    follower_count: '-',
  }
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
  }, []);

  useEffect(() => {
    if (user && user.fid !== '-') {
      getUserCasts(user.fid)
    }
  }, [user])

  async function getUserCasts(fid) {
    console.log(fid, userFeed)
    if (!userFeed) {
      try {
        const response = await axios.get('/api/getUserCasts', {
          params: { fid }
        })
        const feed = response.data.feed
        await setUserFeed(feed)
        const updatedFeed = await setEmbeds(feed)
        setUserFeed([...updatedFeed])

        // console.log(response.data.feed)
        // setUserFeed(feed)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }

  async function getUserProfile(name) {
    let fid = 3
    if (store.isAuth) {
      fid = store.fid
    }
    if (fid && name) {
      try {
        const response = await axios.get('/api/getUsers', {
          params: {
            fid: fid,
            name: name,
          }
        })
        const users = response.data.users
        const selectUser = users.find(user => user.username == name)
        if (selectUser) {
          setUser(selectUser)
        } else {
          setUser(noUser)
        }
      } catch (error) {
        console.error('Error submitting data:', error)
        setUser(noUser)
      }
    }
    else {
      console.log(fid, name)
    }
  }

  useEffect(() => {
    console.log(store.userData)
    if (store.userData && store.userData.username == username) {
      setUserFeed(null)
      setUser(store.userData)
    } else {
      setUserFeed(null)
      getUserProfile(username)
    }
  }, [router])


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

  const UserData = () => {
    const [loading, setLoading] = useState(false);

    async function postUnfollowUser() {
      try {
        const signer = store.signer_uuid
        const response = await axios.delete('/api/deleteFollowUser', {       
          params: {
            fid: user.fid,
            signer: signer,
          }
        })
        const followed = response
        if (followed.status === 200) {
          let updatedUser = { ...user }
          updatedUser.following = 0
          updatedUser.follower_count--
          setUser(updatedUser)
        } else {
          let updatedUser = { ...user }
          updatedUser.following = 1
          updatedUser.follower_count++
          setUser(updatedUser)
        }
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }

    async function postFollowUser() {
      try {
        const signer = store.signer_uuid
        const response = await axios.post('/api/postFollowUser', {       
          fid: user.fid,
          signer: signer,
        })
        const followed = response
        if (followed.status === 200) {
          let updatedUser = { ...user }
          updatedUser.following = 1
          updatedUser.follower_count++
          setUser(updatedUser)
        } else {
          let updatedUser = { ...user }
          updatedUser.following = 0
          updatedUser.follower_count--
          setUser(updatedUser)
        }
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }

    const followUser = async () => {
      try {
        setLoading(true)

        await postFollowUser();
    
      } catch (error) {
        console.error('Error following user:', error);

      } finally {
        setLoading(false)
      }
    };
  
    const unfollowUser = async () => {
      try {
        setLoading(true)

        await postUnfollowUser();
  
      } catch (error) {
        console.error('Error unfollowing user:', error);
      } finally {
        setLoading(false)
      }
    };

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
        {(store.userProfile && store.userProfile.username !== user.username && user.fid !== '-') && (
          <>
            {store.isAuth ? (
              <div className="flex-row">
                {(user.following == 1) ? (
                  <div className='flex-row' style={{position: 'relative'}}>
                    <div className='unfollow-select-drk' onClick={unfollowUser} name='unfollow' style={{color: loading ? 'transparent' : '#dee', textAlign: 'center'}}>Unfollow</div>
                    <div className='top-layer rotation' style={{position: 'absolute', top: '7px', left: '34px', visibility: loading ? 'visible': 'hidden' }}>
                      <Loading size={24} color='#dee' />
                    </div>
                  </div>
                ) : (
                  <div className='flex-row' style={{position: 'relative'}}>
                    <div className='follow-select' onClick={followUser} name='follow' style={{color: loading ? 'transparent' : '#fff', textAlign: 'center'}}>Follow</div>
                    <div className='top-layer rotation' style={{position: 'absolute', top: '7px', left: '34px', visibility: loading ? 'visible': 'hidden' }}>
                      <Loading size={24} color='#fff' />
                    </div>
                  </div>
                )}
              </div>
              ) : (
              <div className="flex-row" style={{position: 'relative'}}>
                <div className='follow-locked' onClick={account.LoginPopup} style={{textAlign: 'center'}}>Follow</div>
                <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-50%, -50%)' }}>
                  <FaLock size={8} color='#666' />
                </div>
              </div>
              )
            }
          </>
        )}
    </div>)
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

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  const SearchOptionButton = (props) => {
    const btn = props.buttonName
    let isSearchable = true
    let comingSoon = false
    if (props.buttonName == 'Users' && !store.isAuth) {
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
      <Head>
        <title>@{username}&apos;s Profile  | Impact App </title>
        <meta name="description" content={`Building the global superalignment layer`} />

      </Head>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { ((user && username == user.username) || (user && user.fid == '-')) && <UserData/> }
      <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '1px solid #888'}}>
        { userButtons.map((btn, index) => (
          <SearchOptionButton buttonName={btn} key={index} /> ))}
      </div>
      <div style={{margin: '0 0 30px 0'}}>
        {userFeed && userFeed.map((cast, index) => (<Cast cast={cast} key={index} index={index} openImagePopup={openImagePopup} />))}
      </div>
      <div>
        {showPopup.open && (<ExpandImg embed={{showPopup}} />)}
      </div>
    </div>
  );
}


export async function getServerSideProps(context) {
  // Fetch dynamic parameters from the context object
  const { params } = context;
  const { username } = params;

  return {
    props: {
      username
    },
  };
}