import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { AccountContext } from '../context'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
import useStore from '../utils/store'
import axios from 'axios';
import { FaSearch, FaLock, FaRegStar } from "react-icons/fa"
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";
import mql from '@microlink/mql';
import { useRouter } from 'next/router';
import Cast from '../components/Cast'

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
  const store = useStore()
  const [textMax, setTextMax] = useState('522px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const router = useRouter()
  const userButtons = ['Home', 'Trending', 'Projects', 'AI']
  const [searchSelect, setSearchSelect ] = useState('Trending')
  const initialState = { fid: null, signer: null, urls: [], channel: null, parentUrl: null, text: '' }
	const [castData, setCastData] = useState(initialState)
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLogged, setIsLogged] = useState(false)
  const [success, setSuccess] = useState(false)
  const [textboxRows, setTextboxRows] = useState(1)

  async function isImage(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('Content-Type');
      // console.log(contentType)
      return contentType && contentType.startsWith('image/');
    } catch (error) {
      console.error('Error fetching URL:', error);
      return false;
    }
  }

  async function getTrendingFeed() {
    try {
      const response = await axios.get('/api/getFeed')
      const feed = response.data.feed
      setUserFeed(feed)
      const updatedFeed = await setEmbeds(feed)
      setUserFeed([...updatedFeed])
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function postCast(castData) {
    if (castData.signer && castData.text) {
      try {
        const response = await axios.post('/api/postCast', {       
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

  useEffect(() => {
    feedRouter()
  }, [router, searchSelect])

  function feedRouter() {
    if (searchSelect == 'Trending') {
      getTrendingFeed()
    } else if (searchSelect == 'Home' && store.fid) {
      getUserFeed(store.fid, false)
    }
  }

  async function setEmbeds(feed) {
    if (feed) {
      for (let i = 0; i < feed.length; i++) {
        if (!feed[i].frames) {
          if (feed[i].embeds) {
            for (let j = 0; j < feed[i].embeds.length; j++) {
              const url = feed[i].embeds[j].url
              const isImg = await isImage(url)
              if (isImg) {
                feed[i].embeds[j].type = 'img'
              } else {
                feed[i].embeds[j].type = 'url'
              }
            }
          }
        }
      }
    }
    return feed
  }

  async function getUserFeed(fid, recasts) {
    console.log(fid)
    if (store.fid) {
      try {
        const response = await axios.get('/api/getUserFeed', {
          params: { fid, recasts }
        })
        const feed = response.data.feed
        await setUserFeed(feed)
        const updatedFeed = await setEmbeds(feed)
        setUserFeed([...updatedFeed])
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }

  const ExpandImg = ({embed}) => {
    return (
      <>
        <div className="overlay" onClick={closeImagePopup}></div>
        <img loading="lazy" src={embed.showPopup.url} className='popupConainer' alt="Cast image embed" style={{aspectRatio: 'auto', maxWidth: screenWidth, maxHeight: screenHeight, cursor: 'pointer', position: 'fixed', borderRadius: '12px'}} onClick={closeImagePopup} />
      </>
    )
  }

  const goToUserProfile = async (event, author) => {
    event.preventDefault()
    const username = author.username
    await store.setUserData(author)
    router.push(`/${username}`)
  }

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  const SearchOptionButton = (props) => {
    const btn = props.buttonName
    let isSearchable = true
    let comingSoon = false
    if (props.buttonName == 'Home' && !store.isAuth) {
      isSearchable = false
    }
    if (props.buttonName == 'Projects' || props.buttonName == 'AI') {
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
      console.log(store.isAuth, castData.text)
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
        const username = store.usernameFC
        const ipfsData = await axios.post('/api/postToIPFS', { username: username, text: castData.text, fid: store.fid })
        const longcastHash = ipfsData.data.ipfsHash
        let updatedCastData = { ...castData }
        updatedCastData.fid = store.fid
        updatedCastData.signer = store.signer_uuid
        const longcastFrame = `${baseURL}/${username}/articles/${longcastHash}`
        updatedCastData.text = longcastFrame
        updatedCastData.urls.push(longcastFrame)
        setCastData(updatedCastData)
        console.log(longcastFrame)
        await postCast(updatedCastData)
        console.log(longcastHash)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    } else {
      return
    }
  }

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
      <title>Impact App | Abundance Protocol</title>
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
      </div>
    </div>
    <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '0px solid #888'}}>
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
  )
}

