import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import Link from 'next/link'
import axios from 'axios';
// import { AiOutlineBars } from "react-icons/ai";
import { useInView } from 'react-intersection-observer'
// import { BsClock } from "react-icons/bs";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { IoShuffleOutline as ShuffleIcon } from "react-icons/io5";
import { PiClockClockwiseBold as ClockForward, PiClockCounterClockwiseBold as ClockBack } from "react-icons/pi";
import { AccountContext } from '../../../context';
import { confirmUser } from '../../../utils/utils';
import Spinner from '../../../components/Common/Spinner';
import ExpandImg from '../../../components/Cast/ExpandImg';
import CuratorData from '../../../components/Page/CuratorData';
// import TopPicks from '../../../components/Page/FilterMenu/TopPicks';
// import Shuffle from '../../../components/Page/FilterMenu/Shuffle';
// import Time from '../../../components/Page/FilterMenu/Time';
import { formatNum, getCurrentDateUTC, getTimeRange, isYesterday, checkEmbedType, populateCast, isCast } from '../../../utils/utils';
import Cast from '../../../components/Cast'
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import Connect from '../../../components/Connect';
import { useAccount, useReadContract, useContractWrite, usePrepareContractWrite, useWaitForTransactionReceipt } from "wagmi";
import contractABI from '../../../contracts/bulksender.json'
import Onchain from '../../../components/Onchain';


export default function Eco() {
  const router = useRouter();
  // const { address, isConnected, chainId } = useAccount()
  const [ref, inView] = useInView()
  const { ecosystem, time, curators, channels, shuffle, app, userFid, pass, referrer } = router.query
  const [user, setUser] = useState(null)
  const { LoginPopup, isLogged, setPoints, setIsLogged, setFid, miniApp, setMiniApp, fid } = useContext(AccountContext)
  const ref1 = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Curation', 'Casts', 'Casts + Replies']
  const [searchSelect, setSearchSelect ] = useState('Curation')
  const { isMobile } = useMatchBreakpoints();
  const [userFeed, setUserFeed] = useState(null)
  const [prevSearch, setPrevSearch] = useState({getTime: null, channel: null, curators: null, text: null, shuffle: null, ecosystem: null, page: 0, order: -1, timeSort: null})
  const [showPopup, setShowPopup] = useState({open: false, url: null})
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
    ecosystem_handle: 'abundance',
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
  // const [isSelected, setIsSelected] = useState('none')
  // const [userSearch, setUserSearch] = useState({ search: '' })
  // const [selectedChannels, setSelectedChannels] = useState([])
  // const [channels, setChannels] = useState([])
  const initialQuery = {shuffle: false, time: '3d', tags: [], channels: [], curators: null, order: -1}
  const [userQuery, setUserQuery] = useState(initialQuery)
  const queryOptions = {
    tags: [
      {
        text: 'All tags',
        value: []
      },
      {
        text: 'Art',
        value: 'art'
      },
      {
        text: 'Dev',
        value: 'dev'
      },        
      {
        text: 'Content',
        value: 'content'
      },
      {
        text: 'Vibes',
        value: 'vibes'
      },
    ],
    time: [
      {
        text: '24 hours',
        value: '24hr'
      },
      {
        text: '3 days',
        value: '3days'
      },
      {
        text: '7 days',
        value: '7days'
      },        
      {
        text: '30 days',
        value: '30days'
      },
      {
        text: 'All',
        value: 'all'
      },
    ]
  }
  // const [page, setPage] = useState(1)
  const [sched, setSched] = useState({inView: false, user: false, feed: false, channels: false})
  const [delay, setDelay] = useState(true)
  const [timeframe, setTimeframe] = useState('3d')
  const [sortBy, setSortBy] = useState('down')
  const [shuffled, setShuffled] = useState(false)
  const initChannels = [
    ' ',
    'impact',
  ]
  const [channelOptions, setChannelOptions] = useState(initChannels)
  const [selectedChannel, setSelectedChannel] = useState('none')


  useEffect(() => {
    const inViewRouter = () => {
      console.log('running', userFeed?.length, (userFeed?.length % 10 == 0))
      console.log('delay1')
      setDelay(true)
      console.log('feed3')
      feedRouter()
    }

    if (sched.inView) {
      inViewRouter()
      setSched(prev => ({...prev, inView: false }))
    } else {
      const timeoutId = setTimeout(() => {
        inViewRouter()
        setSched(prev => ({...prev, inView: false }))
      }, 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [inView, sched.inView])


  async function getChannels(points) {
    try {
      const channelData = await axios.get('/api/curation/getChannelNames', { params: { points } })
      if (channelData) {
        const ecoChannels = channelData?.data?.channels
        console.log('e1', ecoChannels)

        const updatedChannels = [
          ' ',
          ...ecoChannels
        ];
        setChannelOptions(updatedChannels);
      }
    } catch (error) {
      console.error('Error updating channels:', error);
    }
  }

  // useEffect(() => {
  //   console.log('address', address, isConnected, chainId)
  // }, [address, isConnected, chainId]);

  useEffect(() => {

    if (time && (time == '24h' || time == '3d' || time == '7d' || time == '30d' || time == 'all')) {
      setTimeframe(time)
    }

    if (shuffle && shuffle == 'true') {
      setSortBy('shuffle')
    } else {
      setSortBy('down')
    }


    console.log('query', ecosystem, time, curators, channels, shuffle)
    let setCurators = []
    if (curators) {
      setCurators = Array.isArray(curators) ? curators : [Number(curators)]
    }

    setUserQuery({
      ...userQuery,
      ecosystem, time: time || '3d', curators: setCurators || null, channels: channels || null, shuffle: shuffle || false
    })
    // getUser(fid)
  }, [router.query]);


  // useEffect(() => {
  //   console.log('app01', app, userFid, !isLogged, pass !== '', !isLogged && app && app == 'mini' && userFid && pass !== '')
  //   if (!isLogged && app && app == 'mini' && userFid && pass !== '' && !miniApp) {
  //     console.log('set mini app')
  //     setMiniApp(true)
  //   }
  // }, [userFid, pass, app]);

  // useEffect(() => {
  //   if (miniApp) {
  //     const confirmed = confirmUser(userFid, pass)
  //     console.log('confirmed', confirmed)
  //     if (confirmed) {
  //       console.log('isLogged-1')
  //       setIsLogged(true)
  //       setFid(Number(userFid))
  //       console.log('app03', isLogged, confirmed)
  //     }
  //   }
  // }, [miniApp]);




  useEffect(() => {
    console.log('app02', isLogged)
  }, [isLogged]);


  useEffect(() => {
    console.log('userQuery', userQuery)
    if (sched.feed) {
      // setPage(1)
      console.log('feed1')
      feedRouter();
      setSched(prev => ({...prev, feed: false }))
    } else {
      const timeoutId = setTimeout(() => {
        // setPage(1)
        console.log('feed2')
        feedRouter();
        setSched(prev => ({...prev, feed: false }))
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [searchSelect, userQuery, sched.feed])

  function feedRouter() {
    const { shuffle, time, tags, channels, ecosystem, curators, order, timeSort } = userQuery
    if (ecosystem) {
      console.log('get user executed', shuffle, time, tags, channels, ecosystem, curators, order)
      getUserSearch(time, tags, channels, curators, null, shuffle, order, ecosystem, timeSort )
    }
  }
  
  async function getUserSearch(getTime, tags, channel, curators, text, shuffle, order, ecosystem, timeSort) {
    const time = getTimeRange(getTime)

    console.log(getTime, tags, channel, curators, text, shuffle, order, ecosystem)
    let page = prevSearch.page + 1

    console.log(prevSearch.getTime == getTime, prevSearch.channel == channel, prevSearch.curators == curators, prevSearch.text == text, prevSearch.ecosystem == ecosystem, prevSearch.getTime == getTime && prevSearch.channel == channel && prevSearch.curators == curators && prevSearch.text == text && prevSearch.ecosystem == ecosystem)


    if (shuffle) {
      setShuffled(true)
      console.log('delay2')
      setDelay(true)
      console.log('opt1')
      page = 1
      setUserFeed([])
      setPrevSearch(prev => ({...prev, getTime, channel, curators, text, shuffle, ecosystem, page, order, timeSort }))
    } else if (prevSearch.getTime == getTime && prevSearch.channel == channel && prevSearch.curators == curators && prevSearch.text == text && prevSearch.ecosystem == ecosystem && prevSearch.order == order && prevSearch.timeSort == timeSort) {
      setShuffled(false)
      console.log('delay3')
      setDelay(true)
      console.log('opt2')
      setPrevSearch(prev => ({...prev, getTime, channel, curators, text, shuffle, ecosystem, page, order, timeSort }))
    } else {
      setShuffled(false)
      console.log('delay4')
      setDelay(true)
      console.log('opt3')
      page = 1
      setUserFeed([])
      setPrevSearch(prev => ({...prev, getTime, channel, curators, text, shuffle, ecosystem, page, order, timeSort })) 
    }

    async function getSearch(time, tags, channel, curators, text, shuffle, ecosystem, page, order, timeSort) {

      try {
        const response = await axios.get('/api/curation/getUserSearch', {
          params: { time, tags, channel, curators, text, shuffle, ecosystem, page, order, timeSort }
        })

        const removeDelay = () => {
          setTimeout(() => {
            console.log('delay off1')
            setDelay(false);
            console.log('no delay')
          }, 2000);
        };
    
        if (!shuffle) {
          removeDelay()
        }

        let casts = []
        if (response?.data?.casts?.length > 0) {
          casts = response?.data?.casts
        }
        // console.log(casts)

        return casts
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }
    }

    let casts = []
    console.log('pages', page, page == 1, (page !== 1 && userFeed?.length % 10 == 0))
    if (page == 1 || (page !== 1 && userFeed?.length % 10 == 0) ) {
      casts = await getSearch(time, tags, channel, curators, text, shuffle, ecosystem, page, order, timeSort)
    }
    
    let filteredCasts
    let sortedCasts

    if (!casts) {
      // setUserFeed([])

    } else {

      console.log(casts)
      filteredCasts = await casts.reduce((acc, current) => {
        const existingItem = acc.find(item => item._id === current._id);
        if (!existingItem) {
          acc.push(current);
        }
        return acc;
      }, [])

      if (timeSort) {
        if (timeSort == -1) {
          sortedCasts = filteredCasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
          sortedCasts = filteredCasts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
      } else {
        if (order == -1) {
          sortedCasts = filteredCasts.sort((a, b) => b.impact_total - a.impact_total);
        } else {
          sortedCasts = filteredCasts.sort((a, b) => a.impact_total - b.impact_total);
        }
      }

      let displayedCasts = await populateCast(sortedCasts)





      if (userFeed?.length == 0 || page == 1 || shuffle) {
        console.log('opt1-2')
        setUserFeed(displayedCasts)
      } else if (userFeed) {
        // let combinedCasts = userFeed.concat(displayedCasts)

        // let filteredCombined = await combinedCasts.reduce((acc, current) => {
        //   const existingItem = acc.find(item => item._id === current._id);
        //   if (!existingItem) {
        //     acc.push(current);
        //   }
        //   return acc;
        // }, [])
  

        console.log('opt2-2')
        console.log('feed length', userFeed?.length)
        setUserFeed((prevUserFeed) => prevUserFeed.concat(displayedCasts))
      }
      // setPage(page+1)
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

  function updateTime(time) {
    setUserFeed([])
    console.log('time', time)

    setTimeframe(time)
    setUserQuery({
      ...userQuery,
      time: time
    })
  }

  function updateOrder(order) {
    setUserFeed([])
    // setTimeframe(time)
    console.log('time', order)
    setSortBy(order)
    if (order == 'up') {
      setUserQuery({
        ...userQuery,
        order: 1, shuffle: false, timeSort: null
      })
    } else if (order == 'down') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: false, timeSort: null
      })
    } else if (order == 'shuffle') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: true, timeSort: null
      })
    } else if (order == 'clock-forward') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: false, timeSort: -1
      })
    } else if (order == 'clock-back') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: false, timeSort: 1
      })
    }

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

  // const searchOption = (e) => {
  //   setSearchSelect(e.target.getAttribute('name'))
  // }
  const updateChannel = (event) => {
    setSelectedChannel(event.target.value)
    let channelUpdate = []
    if (event.target.value !== ' ') {
      channelUpdate = event.target.value
    }
    setUserQuery({
      ...userQuery,
      channels: channelUpdate
    })
  };

  useEffect(() => {
    if (sched.channels) {
      getChannels('$IMPACT')
      setSched(prev => ({...prev, channels: false }))
    } else {
      const timeoutId = setTimeout(() => {
        getChannels('$IMPACT')
        setSched(prev => ({...prev, channels: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [sched.channels])

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
      {/* <Connect />
      <Onchain /> */}
      {/* <Wallet /> */}
      <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'flex-start', padding: '20px 0 30px 0'}}>
        <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
          {/* <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>TIME</div> */}

          <Link href={`/~/ecosystems/${ecosystem}`}><div className='filter-item-on' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>{ecosystem}</div></Link>
          <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
          <Link href={`/~/ecosystems/${ecosystem}/curators`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>curators</div></Link>
          <Link href={`/~/ecosystems/${ecosystem}/creators`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>creators</div></Link>
          <Link href={`/~/ecosystems/${ecosystem}/contributors`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>contributors</div></Link>
          {/* <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
          <div className='filter-item-on' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>@{username}</div> */}
        </div>
      </div>

      {user && (<CuratorData {...{ show: (isLogged && user), user, textMax, type: 'curator' }} />)}
      {/* <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-evenly', margin: '0', borderBottom: '1px solid #888'}}>
        {userButtons.map((btn, index) => (
          <FeedMenu {...{buttonName: btn, searchSelect, searchOption, isMobile }} key={index} />))}
      </div> */}

      {searchSelect == 'Curation' && (

      <div className={'flex-row'} style={{justifyContent: 'center', marginTop: '15px', marginBottom: '30px', gap: isMobile ? '0.25rem' : '0.25rem', flexWrap: 'wrap'}}>
        {/* <div className='flex-row' style={{gap: '0.5rem'}}>
          <TopPicks handleSelection={handleSelection} selection={'picks'} />
          <Shuffle handleSelect={handleSelect} selection={'shuffle'} userQuery={userQuery} />
        </div>

        <Time handleSelection={handleSelection} handleSelect={handleSelect} userQuery={userQuery} options={queryOptions.time} selection={'time'} isSelected={isSelected} isMobile={isMobile} btnText={btnText} /> */}



        <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
          <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
            <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>SORT</div>

            <div className={sortBy == 'down' ? 'filter-item-on' : 'filter-item'} style={{padding: '2px 6px 0px 6px'}} onClick={() => {updateOrder('down')}}><BiSortDown size={12} /></div>
            <div className={sortBy == 'up' ? 'filter-item-on' : 'filter-item'} style={{padding: '2px 6px 0px 6px'}} onClick={() => {updateOrder('up')}}><BiSortUp size={12} /></div>
            <div className={sortBy == 'shuffle' ? 'filter-item-on' : 'filter-item'} style={{padding: '2px 6px 0px 6px'}} onClick={() => {updateOrder('shuffle')}}><ShuffleIcon size={12} /></div>
            <div className={sortBy == 'clock-forward' ? 'filter-item-on' : 'filter-item'} style={{padding: '2px 6px 0px 6px'}} onClick={() => {updateOrder('clock-forward')}}><ClockForward size={12} /></div>
            <div className={sortBy == 'clock-back' ? 'filter-item-on' : 'filter-item'} style={{padding: '2px 6px 0px 6px'}} onClick={() => {updateOrder('clock-back')}}><ClockBack size={12} /></div>
          </div>
        </div>




        <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
          <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
            <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>TIME</div>

            <div className={timeframe == '24h' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('24h')}}>24hr</div>
            <div className={timeframe == '3d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('3d')}}>3d</div>
            <div className={timeframe == '7d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('7d')}}>7d</div>
            <div className={timeframe == '30d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('30d')}}>30d</div>
            <div className={timeframe == 'all' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('all')}}>all</div>
          </div>
        </div>


        <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
          <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
            <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>CHANNEL</div>

            <select value={selectedChannel} onChange={updateChannel} style={{backgroundColor: '#adf', borderRadius: '4px', padding: isMobile ? '1px 4px' : '1px', fontSize: isMobile ? '10px' : '12px', width: '100%', fontWeight: '600'}}>
              {channelOptions.map((channel) => (
                <option key={channel} value={channel}>
                  {(channel !== ' ') ? '/' + channel : channel}
                </option>
              ))}
            </select>
          </div>
        </div>

        </div>
      )}

      <div style={{margin: '0 0 70px 0'}}>
        {(!userFeed || userFeed.length == 0) ? (
        <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
          <Spinner size={31} color={'#999'} />
        </div>
        ) : (userFeed.map((cast, index) => (<Cast {...{cast, key: index, index, updateCast, openImagePopup, ecosystem: eco?.ecosystem_points_name, handle: eco?.ecosystem_handle, self: false, app}} />)))}
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