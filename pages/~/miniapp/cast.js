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
import ImpactScale from '../../../components/Common/ImpactScale';


export default function SharedCast() {
  const searchParams = useSearchParams();
  
  const router = useRouter();
  const [ref, inView] = useInView()
  // const { castHash, castFid, viewerFid } = router.query
  // const [user, setUser] = useState(null)
  const { LoginPopup, isLogged, setPoints, setIsLogged, setFid, miniApp, setMiniApp, setIsMiniApp, userBalance, setUserInfo } = useContext(AccountContext)
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
  const [tipPercent, setTipPercent] = useState(5)
  const [initValue, setInitValue] = useState(5)



  async function getWalletAddress(fid) {
    try {
      const response = await axios.get('/api/user/getWallet', { params: { fid } } )
      console.log('getWallet', response)
      if (response) {
        return response?.data?.wallet || ''
      } else {
        return ''
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      return ''
    }
  }

  useEffect(() => {
    const castHash = searchParams.get("castHash");
    const castFid = searchParams.get("castFid");
    const viewerFid = searchParams.get("viewerFid");
    console.log('castHash', castHash, 'castFid', castFid, 'viewerFid', viewerFid);

    async function setCast(castContext, embeds) {
      try {
        const response = await axios.post('/api/user/postCast', { hash: castContext?.cast_hash, castContext, embeds }
        )
        console.log('postCast', response)
        let cast = []
        if (response?.data?.cast) {
          cast = response?.data?.cast
        }

        return cast
      } catch (error) {
        console.error('Error submitting data:', error)
        return []
      }
    }

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
      if (typeof window === 'undefined') return;
      const { getMiniAppSdk } = await import('../../../utils/getMiniAppSdk');
      const sdk = await getMiniAppSdk();
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
        let populatedCast = await populateCast([castData])

        setUserFeed(populatedCast)
      } else {
        let userWallet = ''
        if (cast?.author?.fid) {
          userWallet = await getWalletAddress(cast?.author?.fid)
        }



        let castContext = {
          author_fid: cast?.author?.fid || null,
          author_pfp: cast?.author?.pfpUrl || null,
          author_username: cast?.author.username || null,
          author_display_name: cast?.author.displayName || null,
          cast_hash: cast?.hash || null,
          cast_text: cast?.text,
          wallet: userWallet,
          channel_id: cast?.channelKey || null
        }

        const savedCast = await setCast(castContext, cast?.embeds)
        console.log('savedCast', savedCast)
        if (savedCast) {
          let populatedCast = await populateCast([savedCast])
  
          setUserFeed(populatedCast)
        }
      }

      
      const userProfile = await sdk.context

      const checkUserProfile = async (fid) => {
        try {
          const res = await fetch(`/api/user/validateUser?fid=${fid}`);
          const data = await res.json();
          return data.valid;
        } catch (error) {
          return null
        }
      };

      const isValidUser = await checkUserProfile(userProfile?.user?.fid);

      if (isValidUser) {
        setIsLogged(true)
        setFid(Number(userProfile?.user?.fid))
        if (userBalance.impact == 0) {
          setUserInfo({
            pfp: userProfile?.user?.pfpUrl || null,
            username: userProfile?.user?.username || null,
            display: userProfile?.user?.displayName || null,
          })
        }
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

      <div style={{margin: '0 0 270px 0'}}>
        {(!userFeed || userFeed.length == 0) ? (
        <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
          <Spinner size={31} color={'#999'} />
        </div>
        ) : (userFeed.map((cast, index) => (<div className='flex-col' key={index}>
          <Cast {...{cast, key: index, index, updateCast, openImagePopup, ecosystem: 'Abundance', handle: 'abundance', self: false, app: true}} />
          {/* <ImpactScale {...{setTipPercent, setInitValue, cast, updateCast, index}} /> */}
        </div>)))}
        {!delay && !shuffled && (
          <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
            <Spinner size={31} color={'#999'} />
          </div>
        )}
      </div>

      <div className='flex-row' style={{position: 'fixed', bottom: '65px', width: isMobile ? '340px' : 'auto', height: '', margin: '0', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: '100%', position: 'relative'}}>

          {userFeed && (userFeed.map((cast, index) => (
            <div className='flex-col' key={index}>
              <ImpactScale {...{setTipPercent, setInitValue, cast, updateCast, index}} style={{position: 'absolute', bottom: '66px'}} />
            </div>
          )))}

        </div>
      </div>

      {!delay && (<div ref={ref}>&nbsp;</div>)}
      <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
    </div>
  );
}