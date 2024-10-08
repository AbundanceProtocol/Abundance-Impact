import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useRef, useEffect, useState } from 'react';
import { AccountContext } from '../../../context';
import axios from 'axios';
import useStore from '../../../utils/store';
import Cast from '../../../components/Cast'
import ExpandImg from '../../../components/Cast/ExpandImg';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function CastPage({username, castHash}) {
  const router = useRouter();
  const ref = useRef(null)
  const { LoginPopup } = useContext(AccountContext)
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
  const initialEco = {
    channels: [],
    condition_channels: false,
    condition_curators_threshold: 1,
    condition_following_channel: false,
    condition_following_owner: false,
    condition_holding_erc20: false,
    condition_holding_nft: false,
    condition_points_threshold: 1,
    condition_powerbadge: false,
    createdAt: "2024-06-17T03:19:16.065Z",
    downvote_value: 1,
    ecosystem_moderators: [],
    ecosystem_name: 'none',
    ecosystem_handle: 'none',
    ecosystem_points_name: '$IMPACT',
    ecosystem_rules: [`Can't do evil`],
    erc20s: [],
    fid: 3,
    nfts: [],
    owner_name: 'none',
    percent_tipped: 10,
    points_per_tip: 1,
    upvote_value: 1,
  }
  const [eco, setEco] = useState(initialEco)
  const [longcastLoaded, setLongcastLoaded] = useState(false)
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const [isLogged, setIsLogged] = useState(false)

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
    if (!isLogged) {
      console.log('cast1', isLogged)
      setIsLogged(store.isAuth)
    }
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
    if (store.castData && store.castData.hash == castHash && isLogged) {
      setCast(store.castData)
      store.setCastData(null)
    } else if (castHash && isLogged) {
      getCast(castHash, store.fid)
    }
  }, [router]);

  useEffect(() => {
    if (!isLogged) {
      console.log('cast2', isLogged)
      setIsLogged(store.isAuth)
    }
    if (castHash && isLogged) {
      getCast(castHash, store.fid)
    } else if (!isLogged && !store.isAuth) {
      console.log('triggered')
      LoginPopup()
    }
  }, [isLogged, store.isAuth])

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

  async function getCast(hash, userFid) {
    if (!cast || !cast.author) {
      try {
        const response = await axios.get('/api/getCastByHash', {
          params: { hash, userFid }
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



  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <Head>
        <title>@{String(username)} cast | Impact App </title>
        <meta name="description" content={`Building the global superalignment layer`} />
      </Head>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { (cast) && <Cast cast={cast} key={0} index={0} openImagePopup={openImagePopup} ecosystem={eco.ecosystem_points_name} /> }
      <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
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