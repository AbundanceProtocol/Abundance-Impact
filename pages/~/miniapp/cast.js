import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer'
import { AccountContext } from '../../../context';
import Spinner from '../../../components/Common/Spinner';
import ExpandImg from '../../../components/Cast/ExpandImg';
import Cast from '../../../components/Cast'
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { populateCast } from '../../../utils/utils';

export default function SharedCast() {
  const searchParams = useSearchParams();
  
  const router = useRouter();
  const [ref, inView] = useInView()
  // const { castHash, castFid, viewerFid } = router.query
  // const [user, setUser] = useState(null)
  const { LoginPopup, isLogged, setPoints, setIsLogged, setFid, miniApp, setMiniApp, setIsMiniApp } = useContext(AccountContext)
  const ref1 = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const { isMobile } = useMatchBreakpoints();
  const [userFeed, setUserFeed] = useState(null)
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const [delay, setDelay] = useState(true)
  const [shuffled, setShuffled] = useState(false)






  useEffect(() => {
    const castHash = searchParams.get("castHash");
    const castFid = searchParams.get("castFid");
    const viewerFid = searchParams.get("viewerFid");
    console.log('castHash', castHash, 'castFid', castFid, 'viewerFid', viewerFid);

    async function getCast(hash) {
      try {
        const response = await axios.get('/api/curation/getUserSearch', {
          params: { hash, override: 1 }
        })

        let cast = null
        if (response?.data?.casts?.length > 0) {
          cast = response?.data?.casts[0]
        }

        return cast
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }

    }


    async function init() {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      const isMiniApp = await sdk.isInMiniApp()
      setIsMiniApp(isMiniApp)
      console.log('isMiniApp2', isMiniApp, sdk)

      let context = sdk.context;
      if (typeof context.then === "function") {
        context = await context;
      }
      console.log('context', context);


      const cast = context?.location?.cast || null
      let newCast = {
        author: {
          fid: cast?.author.fid || null,
          pfp_url: cast?.author.pfpUrl || null,
          username: cast?.author.username || null,
          display_name: cast?.author.displayName || null,
          power_badge: false,
        },
        hash: cast?.hash || null,
        cast_media: [],
        timestamp: new Date(cast?.timestamp || 0).toISOString(),
        text: cast?.text,
        impact_points: 0,
        tip: [],
        embeds: [],
        mentioned_profiles: [],
        replies: {
          count: 0
        },
        reactions: {
          recasts: [],
          likes: []
        },
        impact_balance: 0,
        quality_absolute: 0,
        quality_balance: 0
      }
      setUserFeed([newCast])

      let castData = null
      if (cast?.hash) {
        castData = await getCast(cast?.hash)
      }
      if (castData) {
        let populatedCast = await populateCast(castData)

        setUserFeed(populatedCast)
      }

      
      const userProfile = await sdk.context

      const checkUserProfile = async (fid) => {
        const res = await fetch(`/api/user/validateUser?fid=${fid}`);
        const data = await res.json();
        return data.valid;
      };

      const isValidUser = await checkUserProfile(userProfile?.user?.fid);

      if (isValidUser) {
        setIsLogged(true)
        setFid(Number(userProfile?.user?.fid))
      }   

    }
    init();
  }, [searchParams]);


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



  const updateCast = (index, newData) => {
    const updatedFeed = [...userFeed]
    updatedFeed[index] = newData
    console.log(newData)
    setUserFeed(updatedFeed)
  }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref1}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>

      <div style={{margin: '0 0 70px 0'}}>
        {(!userFeed || userFeed.length == 0) ? (
        <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
          <Spinner size={31} color={'#999'} />
        </div>
        ) : (userFeed.map((cast, index) => (<Cast {...{cast, key: index, index, updateCast, openImagePopup, ecosystem: 'Abundance', handle: 'abundance', self: false, app: true}} />)))}
        {!delay && !shuffled && (
          <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
            <Spinner size={31} color={'#999'} />
          </div>
        )}
      </div>
      {!delay && (<div ref={ref}>&nbsp;</div>)}
      <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
    </div>
  );
}