import { useContext, useState, useRef, useEffect } from 'react'
import { ethers } from 'ethers'
import { Like, Recast, Message, Kebab, Warp, ActiveUser } from './assets'
import Link from 'next/link'
import { AccountContext } from '../context'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
// import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FaSearch } from 'react-icons/fa';
import useStore from '../utils/store'
import axios from 'axios';

export default function Home() {
  const ref = useRef(null)
  // const [ userFeed, setUserFeed ] = useState([])
  const initialState = { search: '' }
	const [userSearch, setUserSearch] = useState(initialState)
  const searchButtons = ['Ecosystems', 'Channels', 'Proposals', 'Users']
  const [ searchSelect, setSearchSelect ] = useState('Ecosystems')
  const [ searchResults, setSearchResults ] = useState({kind: 'ecosystems', data: []})
  const { isMobile } = useMatchBreakpoints();
  const account = useContext(AccountContext)
  // const client = new NeynarAPIClient(apiKey);
  const [textMax, setTextMax] = useState('522px')
  const [textChMax, setTextChMax] = useState('430px')
  const store = useStore()

	function onChange(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  function routeSearch() {
    console.log(store.isAuth, userSearch.search)
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

  useEffect(() => {
    if (!store.isAuth) {
      setSearchSelect('Ecosystems')
    }
  }, [store.isAuth])

  useEffect(() => {
    if (account.ref1?.current?.offsetWidth) {
      if (account.ref1?.current?.offsetWidth > 680) {
        setTextMax(`522px`)
      }
      else if (account.ref1?.current?.offsetWidth >= 640 && account.ref1?.current?.offsetWidth <= 680) {
        setTextMax(`${account.ref1?.current?.offsetWidth - 160}px`)
      }
      else {
        setTextMax(`${account.ref1?.current?.offsetWidth - 100}px`)
      }
    }
    else {
      setTextMax(`522px`)
    }

    handleTextResize()
    window.addEventListener("resize", handleTextResize);
    return () => {
      window.removeEventListener("resize", handleTextResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTextResize() {
    if (account.ref1?.current?.offsetWidth) {
      if (account.ref1?.current?.offsetWidth > 680) {
        setTextMax(`522px`)
        setTextChMax(`430px`)
      }
      else if (account.ref1?.current?.offsetWidth >= 640 && account.ref1?.current?.offsetWidth <= 680) {
        setTextMax(`${account.ref1?.current?.offsetWidth - 160}px`)
        setTextChMax(`${account.ref1?.current?.offsetWidth - 190}px`)
      }
      else {
        setTextMax(`${account.ref1?.current?.offsetWidth - 100}px`)
        setTextChMax(`${account.ref1?.current?.offsetWidth - 130}px`)
      }
    }
    else {
      setTextMax(`522px`)
      setTextChMax(`430px`)
    }
  }

  const SearchOptionButton = (props) => {
    const btn = props.buttonName
    let isSearchable = true
    if (props.buttonName == 'Users' && !store.isAuth) {
      isSearchable = false
    }
    return isSearchable ? (
      <div className={(searchSelect == btn) ? 'srch-select' : 'srch-btn'} onClick={searchOption} name={btn}>{btn}</div>
    ) : (
      <div className={(searchSelect == btn) ? 'x-srch-select' : 'x-srch-btn'} name={btn} disabled>{btn}</div>
    )
  }

  return (
  <div className='flex-col' style={{width: 'auto'}} ref={ref}>
    <div className="" style={{padding: '58px 0 0 0'}}>
    </div>
    <div style={{padding: '12px 20px', backgroundColor: '#ffffff11', borderRadius: '10px', border: '1px solid #888', marginBottom: '16px'}}>
      <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '1px solid #888'}}>
        { searchButtons.map((btn, index) => (
          <SearchOptionButton buttonName={btn} key={index} /> ))}
      </div>
      <div>
        <div className="flex-row" style={{padding: '10px 0 0 0'}}>
            <input onChange={onChange} name='search' placeholder={`Search ${searchSelect}`} value={userSearch.search} className='srch-btn' style={{width: '100%', backgroundColor: '#234'}} />
            <div className='srch-select-btn' onClick={routeSearch} style={{padding: '12px 14px 9px 14px'}}><FaSearch /></div>
          </div>
        </div>
    </div>

    {
      (searchResults.kind == 'channels' && searchResults.data.length > 0) && (searchResults.data.map((channel, index) => (<div key={index} className="inner-container flex-row" style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
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
                      <div style={{wordWrap: 'break-word', maxWidth: textChMax}}>{channel.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-col">
          <div className='srch-select' name='follow'>Follow</div>
          <div className='srch-select' name='review'>Review</div>
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
                      <div style={{wordWrap: 'break-word', maxWidth: textChMax}}>{user.profile.bio.text}</div>
                    </div>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                      <div className="flex-row" style={{flex: 1}}>
                        <div className="">
                          <Message />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{user.follower_count}</span>
                      </div>
                      <div className="" style={{flex: 1}}>
                        <span>
                          <div className="flex-row">
                            <div className="">
                              <Recast />
                            </div>
                            <span className="" style={{padding: '0 0 0 5px'}}>{user.following_count}</span>
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
        <div className="flex-col">
          <div className='srch-select' name='follow'>Follow</div>
        </div>
      </div>)))
    }
  </div>
  )
}