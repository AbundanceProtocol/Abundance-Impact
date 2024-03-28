import Head from 'next/head';
import { useContext, useState, useRef, useEffect } from 'react'
// import { ethers } from 'ethers'
import { Like, Recast, Message, Kebab, ActiveUser } from './assets'
import Link from 'next/link'
import { AccountContext } from '../context'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
// import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import useStore from '../utils/store'
import axios from 'axios';
import { FaSearch, FaLock, FaRegStar } from "react-icons/fa"
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";
import mql from '@microlink/mql';
import { useRouter } from 'next/router';

export default function Home() {
  const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
  const ref = useRef(null)
  const likeRefs = useRef([])
  const recastRefs = useRef([])
  const [userFeed, setUserFeed] = useState([])
  const { isMobile } = useMatchBreakpoints();
  const [feedWidth, setFeedWidth] = useState()
  const account = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  // const client = new NeynarAPIClient(apiKey);
  const store = useStore()
  const [textMax, setTextMax] = useState('522px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const router = useRouter()
  const userButtons = ['Trending', 'Following', 'Projects', 'AI']
  const [searchSelect, setSearchSelect ] = useState('Trending')
  const initialState = { fid: null, signer: null, urls: [], channel: null, parentUrl: null, text: '' }
	const [castData, setCastData] = useState(initialState)
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLogged, setIsLogged] = useState(false)
  const [success, setSuccess] = useState(false)

  async function getFeed() {
    try {
      const response = await axios.get('/api/getFeed')
      const feed = response.data.feed
      setUserFeed(feed)
      const imageRegex = /\.(jpg|gif|png|jpeg)$/i;
      for (let i = 0; i < feed.length; i++) {
        if (!feed[i].frames) {
          // console.log('frame', i, feed[i].frames.length)
          if (feed[i].embeds) {
            for (let j = 0; j < feed[i].embeds.length; j++) {
              if (imageRegex.test(feed[i].embeds[j].url)) {
                feed[i].embeds[j].type = 'img'
              } else {
                // const { data } = await mql(feed[i].embeds[j].url)
                feed[i].embeds[j].type = 'url'
              }
            }
          }
        }
      }
      console.log(feed)
      setUserFeed([...feed])
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function postCast(castData) {
    console.log(castData)
    try {
      const response = await axios.post('/api/postCast', {       
        fid: castData.fid,
        signer: castData.signer,
        urls: castData.urls,
        // channel: castData.channel,
        channel: 'impact', // temp for testing
        parentUrl: castData.parentUrl, // cast hash or parent URL
        castText: castData.text,
      })
      if (response.status !== 200) {
        console.log(response)

        // need to revert recasts counter
      } else {
        clearCastText()
        shrinkBox()
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }


  async function postRecast(hash, index) {
    console.log(userFeed[index].reactions.recasts.length)

    // need to update recasts counter
    recastRefs.current[index].style.color = '#3b3'
    try {
      const response = await axios.post('/api/postRecastReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        recastRefs.current[index].style.color = '#000'

        // need to revert recasts counter
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function postLike(hash, index) {
    console.log(userFeed[index].reactions.likes.length)

    // need to update likes counter
    likeRefs.current[index].style.color = '#b33'
    try {
      const response = await axios.post('/api/postLikeReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        likeRefs.current[index].style.color = '#000'

        // need to revert likes counter
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  const timePassed = (timestamp) => {
    const currentTime = new Date();
    const pastTime = new Date(timestamp);
    const timeDifference = currentTime - pastTime;
    
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (days > 0) {
      const stamp = `${days}d`
      return stamp
    } else {
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      if (hours > 0) {
        const stamp = `${hours}h`
        return stamp
      } else {
        const minutes = Math.floor(timeDifference / (1000 * 60));
        if (minutes > 0) {
          const stamp = `${minutes}m`
          return stamp
        } else {
          return `now`
        }
      }
    }
  }

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`522px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 160}px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 110}px`)
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

  function openImagePopup(embed) {
    let newPopup = { ...showPopup }
    newPopup.open = true
    newPopup.url = embed.url
    setShowPopup(newPopup)
  }

  useEffect(() => {
    setIsLogged(store.isAuth)
  }, [store.isAuth])

  useEffect(() => {
    setIsLogged(store.isAuth)

    getFeed()
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

  const ExpandImg = ({embed}) => {
    return (
      <>
        <div className="overlay" onClick={closeImagePopup}></div>
        <img loading="lazy" src={embed.showPopup.url} className='popupConainer' alt="Cast image embed" style={{aspectRatio: 'auto', maxWidth: screenWidth, maxHeight: screenHeight, cursor: 'pointer', position: 'fixed', borderRadius: '12px'}} onClick={closeImagePopup} />
      </>
    )
  }

  const goToUserProfile = async (event, author) => {
    console.log('passed')
    event.preventDefault()
    const username = author.username
    await store.setUserData(author)
    console.log(author, store.userData)
    router.push(`/${username}`)
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
    if (props.buttonName == 'Following' || props.buttonName == 'Projects' || props.buttonName == 'AI') {
      comingSoon = true
    }

    return isSearchable ? (<>{comingSoon ? (<div className='flex-row' style={{position: 'relative'}}><div className={(searchSelect == btn) ? 'active-nav-link btn-hvr lock-btn-hvr' : 'nav-link btn-hvr lock-btn-hvr inactive-nav-link'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '12px' : '15px'}}>{btn}</div>
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

  function clearCastText() {
    setCastData({ ...castData, text: '', parentUrl: null });
  }

	function onChange(e) {
		setCastData( () => ({ ...castData, [e.target.name]: e.target.value }) )
	}

  async function routeCast() {
    console.log(castData.text.length)
    if (store.isAuth && store.signer_uuid && castData.text.length > 0 && castData.text.length <= 320) {
      try {
        let updatedCastData = { ...castData }
        updatedCastData.fid = store.fid
        updatedCastData.signer = store.signer_uuid
        setCastData(updatedCastData)
        postCast(castData)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
    else if (store.isAuth && store.signer_uuid && castData.text.length > 320) {
      try {
        // const castContent = { username: store.username, text: castData.text }
        // const jsonData = JSON.stringify(userData, null, 2)
        const username = store.usernameFC
        const ipfsData = await axios.post('/api/postToIPFS', { username: username, text: castData.text, fid: store.fid })
        const longcastHash = ipfsData.data.ipfsHash
        let updatedCastData = { ...castData }
        updatedCastData.fid = store.fid
        updatedCastData.signer = store.signer_uuid
        const longcastFrame = `${baseURL}/${username}/articles/${longcastHash}`
        updatedCastData.text = longcastFrame
        // setCastData(updatedCastData)
        console.log(longcastFrame)
        postCast(castData)
        console.log(longcastHash)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    } else {
      return
    }



    // console.log(store.isAuth, userSearch.search)
    // if (searchSelect == 'Channels') {
    //   getChannels(userSearch.search)
    // }
    // else if (searchSelect == 'Users' && store.isAuth) {
    //   getUsers(userSearch.search)
    // }
    // else if (searchSelect == 'Ecosystems') {
    //   getEcosystems(userSearch.search)
    // }
    // else if (searchSelect == 'Proposals') {
    //   getProposals(userSearch.search)
    // }
  }
  const [textboxRows, setTextboxRows] = useState(1)
  const expandBox = () => {
    if (textboxRows == 1) {
      setIsFocused(true)
      setTextboxRows(4)
    }
  }

  const shrinkBox = () => {
    console.log(castData.text)
    if (textboxRows > 1 && castData.text.length < 40) {
      setIsFocused(false)
      setTextboxRows(1)
    }
  }

  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref}>
    <Head>
      <title>Feed | Impact App </title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div style={{padding: '58px 0 0 0', width: feedMax}}>
    </div>
    <div className="top-layer">
      <div className="flex-row" style={{padding: '0', marginBottom: '10px'}}>
        {isLogged && (
          <a className="" title="" href={`/${store.userProfile.username}`} onClick={() => {goToUserProfile(event, store.userProfile)}}>
            <img loading="lazy" src={store.srcUrlFC} className="" alt={`${store.userDisplayNameFC} avatar`} style={{width: '40px', height: '40px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #abc', margin: '6px 0 2px 0'}} />
          </a>
        )}
        <textarea onChange={onChange} 
          name='text' 
          rows={textboxRows}
          placeholder={`Start typing a new cast here...`} 
          value={castData.text} 
          className='textbox' 
          onFocus={expandBox}
          onBlur={shrinkBox}
          style={{height: isFocused ? '120px' : '48px'}} />

          {isLogged ? (
            <div className="flex-row">
              {(castData.text.length > 320) ? (
                <div className={`flex-row unfollow-select-drk ${success ? 'flash-success' : ''}`} style={{position: 'relative', height: 'auto', width: '60px', marginRight: '0'}}>
                  <div className=' cast-btn' onClick={routeCast} name='unfollow' style={{color: loading ? 'transparent' : '#dee', height: 'auto', textAlign: 'center'}}>Long cast</div>
                  <div className='top-layer rotation' style={{position: 'absolute', top: '7px', left: '34px', visibility: loading ? 'visible': 'hidden' }}>
                    <Loading size={24} color='#dee' />
                  </div>
                </div>
              ) : (
                <div className={`flex-row follow-select ${success ? 'flash-success' : ''}`} style={{position: 'relative', height: 'auto', width: '60px', marginRight: '0'}}>
                  <div className='cast-btn' onClick={routeCast} name='follow' style={{color: loading ? 'transparent' : '#fff', height: 'auto'}}>Cast</div>
                  <div className='top-layer rotation' style={{position: 'absolute', top: '7px', left: '34px', visibility: loading ? 'visible': 'hidden'}}>
                    <Loading size={24} color='#fff' />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-row follow-locked" style={{position: 'relative', height: 'auto', width: '60px', marginRight: '0'}}>
              <div className='cast-btn' onClick={account.LoginPopup} style={{height: 'auto'}}>Cast</div>
              <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(40%, -60%)' }}>
                <FaLock size={8} color='#eee' />
              </div>
            </div>
          )
        }

        {/* <div className='srch-select-btn' 
          onClick={routeCast} 
          style={{padding: '12px 14px 9px 14px'}}><FaSearch /></div> */}
      </div>
    </div>
    <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '0px solid #888'}}>
      { userButtons.map((btn, index) => (
        <SearchOptionButton buttonName={btn} key={index} /> ))}
    </div>
    {
      (typeof userFeed !== 'undefined' && userFeed.length > 0) && (userFeed.map((cast, index) => (<div key={index} className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
        <div>
          <div>
            <div className="">
              <div className="">
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`https://warpcast.com/${cast.author.username}`}>
                      <img loading="lazy" src={cast.author.pfp_url} className="" alt={`${cast.author.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: 'auto', gap: '0.5rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <span className="" data-state="closed">
                          <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} style={{cursor: 'pointer'}} onClick={() => {goToUserProfile(event, cast.author)}}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font">{cast.author.display_name}</span>
                              <div className="" style={{margin: '0 0 0 3px'}}>
                                {(cast.author.power_badge) && (<ActiveUser />)}
                              </div>
                            </div>
                          </a>
                        </span>
                        <span className="user-font" datastate="closed">
                          <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} onClick={() => {goToUserProfile(event, cast.author)}}>@{cast.author.username}</a>
                        </span>
                        <div className="">·</div>
                        <a className="fc-lnk" title="Navigate to cast" href={`https://warpcast.com/${cast.author.username}/${cast.hash.slice(0,10)}`}>
                          <div className="user-font">{timePassed(cast.timestamp)}</div>
                        </a>
                      </div>
                      <div className="">
                        <Kebab />
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax}}>{cast.text}</div>
                      {(cast.embeds.length > 0) && (cast.embeds.map((embed, subindex) => (
                      <div className='flex-col' style={{alignItems: 'center'}}>
                        {(embed.type && embed.type == 'img') && (
                          <div className="" key={`${index}-${subindex}`}>
                            <div className="flex-col" style={{position: 'relative'}}>
                              <img 
                                loading="lazy" 
                                src={embed.url} 
                                alt="Cast image embed" 
                                style={{aspectRatio: '0.75 / 1', 
                                  maxWidth: textMax, 
                                  maxHeight: '500px', 
                                  marginTop: '10px', 
                                  cursor: 'pointer', 
                                  position: 'relative',
                                  borderRadius: '8px'}} 
                                onClick={() => {openImagePopup(embed)}} />
                            </div>
                          </div>
                        )}
                      </div>
                      )))}
                    </div>
                    {(typeof cast.channelName !== 'undefined') && (
                      <div className="flex-row" style={{border: '1px solid #666', padding: '2px 4px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                        <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                          <img loading="lazy" src={cast.channelImg} className="" alt="Channel image" style={{width: '17px', height: '17px', minWidth: '17px', minHeight: '17px', borderRadius: '3px'}} />
                          <span className="channel-font">{cast.channelName}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                      <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                        <div className="">
                          <Message />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{cast.replies.count}</span>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div ref={el => (recastRefs.current[index] = el)} className='flex-row recast-btn' onClick={() => postRecast(cast.hash, index, cast.reactions.recasts.length)}>
                          <div className="">
                            <Recast />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.recasts.length}</span>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div ref={el => (likeRefs.current[index] = el)} className='flex-row like-btn' onClick={() => postLike(cast.hash, index, cast.reactions.likes.length)}>
                          <div className="">
                            <Like />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.likes.length}</span>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                        <div className="" style={{padding: '2px 0 0 0px'}}>
                          <FaRegStar />
                        </div>
                        <span style={{padding: '0 0 0 5px'}}>{cast.impact && (`${cast.impact}`)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>)))
    }

    <div>
      {showPopup.open && (<ExpandImg embed={{showPopup}} />)}
    </div>
  </div>
  )
}

