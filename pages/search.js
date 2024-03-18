import { useContext, useState, useRef, useEffect } from 'react'
import { ethers } from 'ethers'
import { Like, Recast, Message, Kebab, Warp, ActiveUser } from './assets'
import Link from 'next/link'
import { AccountContext } from '../context'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
// import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FaSearch, FaLock } from 'react-icons/fa';
import useStore from '../utils/store'
import axios from 'axios';
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";

export default function Search() {
  const ref = useRef(null)
  const initialState = { search: '' }
	const [userSearch, setUserSearch] = useState(initialState)
  const searchButtons = ['Ecosystems', 'Channels', 'Proposals', 'Users']
  const [ searchSelect, setSearchSelect ] = useState('Channels')
  const [ searchResults, setSearchResults ] = useState({kind: 'ecosystems', data: []})
  const { isMobile } = useMatchBreakpoints();
  const account = useContext(AccountContext)
  const [ screenWidth, setScreenWidth ] = useState(undefined)

  // const client = new NeynarAPIClient(apiKey);
  const [textMax, setTextMax] = useState('430px')
  const [textChMax, setTextChMax] = useState('430px')
  const [ feedMax, setFeedMax ] = useState('620px')
  const store = useStore()
	function onChange(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  function routeSearch() {
    // console.log(store.isAuth, userSearch.search)
    if (searchSelect == 'Channels') {
      getChannels(userSearch.search)
    }
    else if (searchSelect == 'Users' && store.isAuth) {
      getUsers(userSearch.search)
    }
  }

  async function getUsers(name) {
    let fid = 3
    if (store.isAuth) {
      fid = store.fid
    }

    try {
      const response = await axios.get('/api/getUsers', {
        params: {
          fid: fid,
          name: name,
        }
      })
      const users = response.data.users
      console.log(users)
      setSearchResults({kind: 'users', data: users})
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function getChannels(name) {
    try {
      const response = await axios.get('/api/getChannels', {
        params: {
          name: name,
        }
      })
      const channels = response.data.channels.channels
      setSearchResults({kind: 'channels', data: channels})
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }


  async function unfollowUser(fid, index) {
    console.log('follow', fid, index)
    const updatedSearchResults = { ...searchResults }
    updatedSearchResults.data[index].following = 0
    setSearchResults(updatedSearchResults)
  }

  async function followUser(fid, index) {

    
    console.log('follow', fid, index)
    const updatedSearchResults = { ...searchResults }
    updatedSearchResults.data[index].following = 1
    setSearchResults(updatedSearchResults)
    // try {
    //   const signer = store.signer_uuid

    //   // console.log(fid)
    //   // console.log(signer)
    //   // console.log(store.signer_uuid)
    //   const response = await axios.post('/api/postFollowUser', {       
    //     fid: fid,
    //     signer: signer,
    //   })
    //   const followed = response
    //   console.log(followed.status === 200)
    //   if (followed.status === 200) {

    //   } else {

    //   }
    //   // setSearchResults({kind: 'channels', data: channels})
    // } catch (error) {
    //   console.error('Error submitting data:', error)
    // }
  }

  useEffect(() => {
    if (!store.isAuth && searchSelect == 'Users') {
      setSearchSelect('Ecosystems')
    }
  }, [store.isAuth])

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

  const SearchOptionButton = (props) => {
    const btn = props.buttonName
    let isSearchable = true
    let comingSoon = false
    if (props.buttonName == 'Users' && !store.isAuth) {
      isSearchable = false
    }
    if (props.buttonName == 'Ecosystems' || props.buttonName == 'Proposals') {
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
    <div style={{padding: '12px 20px', backgroundColor: '#66666611', borderRadius: '10px', border: '1px solid #888', marginBottom: '16px', width: feedMax}}>
      <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '1px solid #888'}}>
        { searchButtons.map((btn, index) => (
          <SearchOptionButton buttonName={btn} key={index} /> ))}
      </div>
      <div sytle={{}}>
        <div className="flex-row" style={{padding: '10px 0 0 0'}}>
            <input onChange={onChange} name='search' placeholder={`Search ${searchSelect}`} value={userSearch.search} className='srch-btn' style={{width: '100%', backgroundColor: '#234'}} />
            <div className='srch-select-btn' onClick={routeSearch} style={{padding: '12px 14px 9px 14px'}}><FaSearch /></div>
          </div>
        </div>
    </div>

    {
      (searchResults.kind == 'channels' && searchResults.data.length > 0) && (searchResults.data.map((channel, index) => (<div key={index} className="inner-container flex-row" style={{width: feedMax, display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <div>
          <div>
            <div className="">
              <div className="">
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`https://warpcast.com/~/channel/${channel.id}`}>
                      <img loading="lazy" src={channel.image_url} className="" alt="" style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: 'auto', gap: '0.5rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <span className="" data-state="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/~/channel/${channel.id}`}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font">{channel.name}</span>
                            </div>
                          </a>
                        </span>
                        <span className="user-font" datastate="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/~/channel/${channel.id}`}>/{channel.id}</a>
                        </span>
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: textMax, width: '100%'}}>{channel.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-col">
        {store.isAuth ? (
          <div className='srch-select' name='follow' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px'}}>Follow</div>
        ) : (
          <div className='flex-row' style={{position: 'relative', marginBottom: '8px'}}>
            <div className='locked-btn' onClick={account.LoginPopup} style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Follow</div>
            <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-50%, -50%)' }}>
              <FaLock size={8} color='#999' />
            </div>
          </div>
        )}
          <div className='flex-row' style={{position: 'relative'}}>
            <div className='locked-btn'>Review</div>
            <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(20%, -50%)' }}>
              <div className='soon-btn'>SOON</div>
            </div>
          </div>
        </div>
        
      </div>)))
    }

    {
      (searchResults.kind == 'users' && searchResults.data.length > 0) && (searchResults.data.map((user, index) => (<div key={index} className="inner-container flex-row" style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <div style={{width: '100%'}}>
          <div>
            <div>
              <div>
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`https://warpcast.com/${user.username}`}>
                      <img loading="lazy" src={user.pfp_url} className="" alt={`${user.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: '100%', gap: '0.5rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <span className="" data-state="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/${user.username}`}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font">{user.display_name}</span>
                              <div className="" style={{margin: '0 0 0 3px'}}>
                                {(user.active_status == 'active') && (<ActiveUser />)}
                              </div>
                            </div>
                          </a>
                        </span>
                        <span className="user-font" datastate="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/${user.username}`}>@{user.username}</a>
                        </span>
                        <div className="">·</div>
                        <a className="fc-lnk" title="Navigate to cast" href={`https://warpcast.com/${user.username}`}>
                          <div className="user-font">fid: {user.fid}</div>
                        </a>
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: textMax}}>{user.profile.bio.text}</div>
                    </div>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                      <div className="flex-row" style={{flex: 1}}>
                        {/* <div className="">
                          <Message />
                        </div> */}
                        <span className="" style={{padding: '0 0 0 5px'}}>Followed: {user.follower_count}</span>
                      </div>
                      <div className="" style={{flex: 1}}>
                        <span>
                          <div className="flex-row">
                            {/* <div className="">
                              <Recast />
                            </div> */}
                            <span className="" style={{padding: '0 0 0 5px'}}>Following: {user.following_count}</span>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {store.isAuth ? (
            <div className="flex-col">
              {(user.following == 1) ? (
                <div className='unfollow-select' onClick={() => unfollowUser(user.fid, index)} name='follow'>Unfollow</div>
              ) : (
                <div className='follow-select' onClick={() => followUser(user.fid, index)} name='follow'>Follow</div>
              )}
            </div>
          ) : (
            <div className="flex-row" style={{position: 'relative'}}>
              <div className='follow-locked' onClick={account.LoginPopup}>Follow</div>
              <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-50%, -50%)' }}>
              <FaLock size={8} color='#666' />
            </div>
            </div>
          )
        }

        {/* <div className="flex-col">
          <div className='srch-select' name='follow'>Follow</div>
        </div> */}
      </div>)))
    }
  </div>
  )
}