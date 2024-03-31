import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import useStore from '../../../utils/store';
import Cast from '../../../components/Cast'

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function CastPage({username, castHash}) {
  const router = useRouter();
  const ref = useRef(null)
  const [cast, setCast] = useState(null)
  const initialUser = {
    username: 'none',
    display_name: 'No user found',
    power_badge: false,
    fid: '-',
    profile: { bio: { text: 'No user bio found'}},
    following_count: '-',
    follower_count: '-',
  }
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [user, setUser] = useState(initialUser)
  const store = useStore()
  const [textMax, setTextMax] = useState('522px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [longcastLoaded, setLongcastLoaded] = useState(false)
  const [showPopup, setShowPopup] = useState({open: false, url: null})

  let noCast = {
    author: user,
    hash: '-',
    parent_url: '-',
    embeds: [],
    reactions: {
      likes: {length: 0 },
      recasts: { length: 0 }
    },
    replies: { count: 0 },
    text: 'No cast found',
    timestamp: '2020-01-01T21:39:47.000Z'
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

  useEffect(() => {
    if (store.castData && store.castData.hash == castHash) {
      setCast(store.castData)
      store.setCastData(null)
    } else if (castHash) {
      getCast(castHash)
    }
  }, [router]);

  useEffect(() => {
    if (cast && cast.hash !== '-' && !longcastLoaded) {
      if (cast.frames && cast.frames.length > 0) {
        cast.frames.forEach((frame, index) => {
          const frameUrl = frame.frames_url;
          const longcastBase = `https://impact.abundance.id/${username}/articles/`;
          if (frameUrl && frameUrl.includes(longcastBase)) {
            let longcastHash = frameUrl.slice(longcastBase.length, frameUrl.length)
            getLongcast(longcastHash, frameUrl)
          }
        })
      }
    }
  }, [cast]);

  async function getLongcast(hash, frameUrl) {
    try {
      let articleData = ''
      const response = await fetch(`${baseURL}/api/getIPFS?hash=${hash}`);
      const contentType = response.headers.get('content-type');
    
      if (contentType && contentType.includes('application/json')) {
        articleData = await response.json();
        if (articleData.text) {
          let updatedCast = {...cast}
          let castText = updatedCast.text
          let updatedCastText = await castText.replace(frameUrl, '')
          if (updatedCastText.length == 0) {
            updatedCastText = articleData.text
          } else {
            updatedCastText += ` \n\n${articleData.text}`
          }
          setCast({ ...cast, text: updatedCastText });
          setLongcastLoaded(true)
        }
      }
  
    } catch (error) {
      console.error('Error submitting data:', error)
      return null
    }
  }

  async function getAuthorProfile(name) {
    let fid = 3
    if (store.isAuth) {
      fid = store.fid
    }
    if (fid && name && (!cast || !cast.author)) {
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
          noCast.author = selectUser
          setCast(noCast)
          setUser(selectUser)
        } else {
          setCast(noCast)
        }
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }

  async function getCast(hash) {
    if (!cast || !cast.author) {
      try {
        const response = await axios.get('/api/getCastByHash', {
          params: {
            hash
          }
        })
        const castData = response.data.cast.cast
        if (castData) {
          store.setCastData(castData)
          setCast(castData)
        } else {
          store.setCastData(null)
          getAuthorProfile(username)
          setCast(noCast)
        }
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
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

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <Head>
        <title>@{username} cast | Impact App </title>
        <meta name="description" content={`Building the global superalignment layer`} />
      </Head>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { (cast) && <Cast cast={cast} key={0} index={0} openImagePopup={openImagePopup} /> }
      <div>
        {showPopup.open && (<ExpandImg embed={{showPopup}} />)}
      </div>
    </div>
  );
}


export async function getServerSideProps(context) {
  const { params } = context;
  const { username, cast } = params;
  const castHash = cast
 
  return {
    props: {
      username, castHash
    },
  };
}