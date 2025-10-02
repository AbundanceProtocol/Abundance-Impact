import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import Link from 'next/link'
import axios from 'axios';
import Head from "next/head";
// import { AiOutlineBars } from "react-icons/ai";
import { useInView } from 'react-intersection-observer'
// import { BsClock } from "react-icons/bs";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { IoShuffleOutline as ShuffleIcon } from "react-icons/io5";
import { PiClockClockwiseBold as ClockForward, PiClockCounterClockwiseBold as ClockBack } from "react-icons/pi";
import { AccountContext } from '../../../../context';
import { confirmUser } from '../../../../utils/utils';
import Spinner from '../../../../components/Common/Spinner';
import ExpandImg from '../../../../components/Cast/ExpandImg';
// import CuratorData from '../../../../components/Page/CuratorData';
// import CuratorBlock from '../../../../components/Page/CuratorBlock';
import ChannelBlock from '../../../../components/Page/ChannelBlock';
import { BsGiftFill, BsFillPersonFill } from "react-icons/bs";
import { formatNum, getCurrentDateUTC, getTimeRange, isYesterday, checkEmbedType, populateCast, isCast } from '../../../../utils/utils';
import Cast from '../../../../components/Cast'
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';
import qs from "querystring";
import Tip from '../../tip'

const version = process.env.NEXT_PUBLIC_VERSION;

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function CuratorFid() {
  const router = useRouter();
  const [ref, inView] = useInView()
  const { username, app, userFid, pass, fid, channel } = router.query
  const [channelData, setChannelData] = useState(null)
  const { LoginPopup, LogoutPopup, isLogged, setPoints, setIsLogged, setFid, miniApp, setMiniApp, autotipping, setAutotipping, adminTest, isMiniApp } = useContext(AccountContext)
  const ref1 = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Curation', 'Casts', 'Casts + Replies']
  const [searchSelect, setSearchSelect ] = useState('Curation')
  const { isMobile } = useMatchBreakpoints();
  const [userFeed, setUserFeed] = useState(null)
  
  // Handle tip toggle from CuratorBlock
  const handleTipToggle = () => {
    setShowTip(prev => !prev);
  };
  const [prevSearch, setPrevSearch] = useState({getTime: null, channel: null, username: null, text: null, shuffle: null, ecosystem: null, curators: [], page: 0, order: -1, timeSort: null})
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const [showTip, setShowTip] = useState(false)
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
  const [isSelected, setIsSelected] = useState('none')
  const [userSearch, setUserSearch] = useState({ search: '' })
  const [selectedChannels, setSelectedChannels] = useState([])
  const [channels, setChannels] = useState([])
  const initialQuery = {shuffle: false, time: '30d', tags: [], channels: [], username: null, curators: [], order: -1}
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
  const [sched, setSched] = useState({inView: false, channelData: false, feed: false})
  const [delay, setDelay] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')
  const [sortBy, setSortBy] = useState('down')
  const [shuffled, setShuffled] = useState(false)

  async function getChannelData(channel) {
    try {
      const response = await axios.get('/api/getChannelProfile', {
        params: { channel }
      })
      console.log(response)
      if (response?.data) {
        const profile = response?.data?.data || null
        const populatedProfile = {
          username: profile?.id,
          pfp: {
            url: profile?.imageUrl
          },
          displayName: profile?.name,
          activeOnFcNetwork: true,
          profile: { bio: { text: profile?.description || "" } },
          followingCount: profile?.memberCount,
          followerCount: profile?.followerCount,
          fid: 0
        }
        console.log('populatedProfile', populatedProfile)
        setChannelData(populatedProfile)
      
        // const updateResponse = await axios.get('/api/getCuratorProfile', {
        //   params: { fid: populatedProfile?.fid }
        // })

      } else {
        setChannelData(null)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setChannelData(null)
    }
  }

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


  useEffect(() => {
    if (channel) {
      getChannelData(channel)
    }
    // if (points) {
    //   setPoints(points)
    // }

    setUserQuery({
      ...userQuery,
      ecosystem: 'abundance', channels: channel
    })
    // getUser(fid)
  }, [channel]);


  useEffect(() => {
    console.log('app01', app, userFid, !isLogged, pass !== '', !isLogged && app && app == 'mini' && userFid && pass !== '')
    if (!isLogged && app && app == 'mini' && userFid && pass !== '' && !miniApp) {
      console.log('set mini app')
      setMiniApp(true)
    }
  }, [userFid, pass, app]);

  useEffect(() => {
    if (miniApp) {
      const confirmed = confirmUser(userFid, pass)
      console.log('confirmed', confirmed)
      if (confirmed) {
        console.log('isLogged-1')
        setIsLogged(true)
        setFid(Number(userFid))
        console.log('app03', isLogged, confirmed)
      }
    }
  }, [miniApp]);




  useEffect(() => {
    console.log('app02', isLogged, username)
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
    const { shuffle, time, tags, channels, ecosystem, username, curators, order, timeSort } = userQuery
    if (ecosystem) {
      console.log('get channelData executed')
      getUserSearch(time, tags, channels, null, null, shuffle, order, ecosystem, timeSort, curators )
    }
  }
  
  async function getUserSearch(getTime, tags, channel, username, text, shuffle, order, ecosystem, timeSort, curators) {
    const time = getTimeRange(getTime)

    console.log(getTime, tags, channel, username, text, shuffle, order, ecosystem)
    let page = prevSearch.page + 1

    console.log(prevSearch.getTime == getTime, prevSearch.channel == channel, prevSearch.username == username, prevSearch.text == text, prevSearch.ecosystem == ecosystem, prevSearch.getTime == getTime && prevSearch.channel == channel && prevSearch.username == username && prevSearch.text == text && prevSearch.ecosystem == ecosystem)


    if (shuffle) {
      setShuffled(true)
      console.log('delay2')
      setDelay(true)
      console.log('opt1')
      page = 1
      setUserFeed([])
      setPrevSearch(prev => ({...prev, getTime, channel, username, text, shuffle, ecosystem, page, order, timeSort, curators }))
    } else if (prevSearch.getTime == getTime && prevSearch.channel == channel && prevSearch.username == username && prevSearch.text == text && prevSearch.ecosystem == ecosystem && prevSearch.order == order && prevSearch.timeSort == timeSort && prevSearch.curators == curators) {
      setShuffled(false)
      console.log('delay3')
      setDelay(true)
      console.log('opt2')
      setPrevSearch(prev => ({...prev, getTime, channel, username, text, shuffle, ecosystem, page, order, timeSort, curators }))
    } else {
      setShuffled(false)
      console.log('delay4')
      setDelay(true)
      console.log('opt3')
      page = 1
      setUserFeed([])
      setPrevSearch(prev => ({...prev, getTime, channel, username, text, shuffle, ecosystem, page, order, timeSort, curators })) 
    }

    async function getSearch(time, tags, channel, curators, text, shuffle, ecosystem, page, order, timeSort) {

      try {
        console.log('testing 123')
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

  const handleSelect = async (type, selection) => {
    console.log(type)
    if (type == 'shuffle') {
      setUserQuery(prevState => ({
        ...prevState, 
        [type]: !userQuery[type] 
      }));
      setIsSelected('none')
    } else if (type == 'time') {
      setUserQuery(prevState => ({
        ...prevState, 
        [type]: selection 
      }));
      setIsSelected('none')
    } else if (type == 'tags') {
      if (selection == 'all') {
        setUserQuery(prevState => ({
          ...prevState, 
          [type]: [] 
        }));
      } else {
        setUserQuery(prevUserQuery => {
          const tagIndex = prevUserQuery.tags.indexOf(selection);
          if (tagIndex === -1) {
            return {
              ...prevUserQuery,
              tags: [...prevUserQuery.tags, selection]
            };
          } else {
            return {
              ...prevUserQuery,
              tags: prevUserQuery.tags.filter(item => item !== selection)
            };
          }
        });
      }

    } else {
      setIsSelected(type)
    }

    if (type !== 'tags') {
      setTimeout(() => {
        setIsSelected('none')
      }, 300);
    }
  }

  const handleSelection = (type, selection) => {
    if (type == 'shuffle') {
      setIsSelected('none')
    } else {
      setIsSelected(type)
    }
  }
  
  function btnText(type) {
    if (type == 'tags' && (userQuery[type] == 'all' || userQuery[type].length == 0)) {
      return 'All tags'
    } else if (type == 'tags' && (userQuery[type].length > 1)) {
      return 'Tags'
    } else if (type == 'tags') {
      const options = queryOptions[type];
      const option = options.find(option => option.value === userQuery.tags[0]);
      return option ? option.text : '';
    } else {
      const options = queryOptions[type];
      const option = options.find(option => option.value === userQuery[type]);
      return option ? option.text : '';
    }
  }

  function onChannelChange(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  async function getChannels(name) {
    console.log(name)
    try {
      const response = await axios.get('/api/getChannels', {
        params: {
          name: name,
        }
      })
      if (response) {
        const channels = response.data.channels.channels
        console.log(channels)
        setChannels(channels)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  const channelKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      getChannels(userSearch.search)
    }
  }
  
  function addChannel(channel) {
    console.log(channel)
    setUserQuery(prevUserQuery => {
    const channelIndex = prevUserQuery.channels.indexOf(channel.url);
    if (channelIndex === -1) {
      return {
        ...prevUserQuery,
        channels: [...prevUserQuery.channels, channel.url]
      };
    } else {
      // If the curator is found, remove it from the array
      return {
        ...prevUserQuery,
        channels: prevUserQuery.channels.filter(item => item !== channel.url)
        };
      }
    });

    const isChannelSelected = selectedChannels.some((c) => c.url === channel.url);

    if (isChannelSelected) {
      // If the curator is already selected, remove it from the state
      setSelectedChannels(selectedChannels.filter((c) => c.url !== channel.url));
    } else {
      // If the curator is not selected, add it to the state
      setSelectedChannels([...selectedChannels, channel]);
    }
  }

  function updateTime(time) {
    setUserFeed([])
    // setTimeframe(time)
    console.log('time', time)

    setTimeframe(time)
    setUserQuery({
      ...userQuery,
      time: time
    })

    // setUserQuery({
    //   ...userQuery,
    //   curators: [fid], points: points || null
    // })

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

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  const updateCast = (index, newData) => {
    const updatedFeed = [...userFeed]
    updatedFeed[index] = newData
    console.log(newData)
    setUserFeed(updatedFeed)
  }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref1}>
      <Head>
        <meta
          name="fc:frame"
          content={`{"version":"next","imageUrl":"${baseURL}/api/frames/tip/circle-v7?${qs.stringify({
            channel
          })}","button":{"title":"Curated Channel","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id/~/channels/${channel}","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}`}
        />

        {/* Mini App specific metadata */}
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content={`https://impact.abundance.id/~/channel/${channel}`} />
      </Head>
      {/* <div className="" style={{padding: '58px 0 0 0'}}>
      </div> */}

      {(!isLogged || (version == "1.0" && !adminTest) || version == "2.0" || adminTest) && (
        <div
          id="log in"
          style={{
            padding: isMobile ? (version == "1.0" && !adminTest ? "58px 0 20px 0" : "48px 0 20px 0") : "58px 0 60px 0",
            width: feedMax,
            fontSize: "0px"
          }}
        >
          &nnsp;
        </div>
      )}




      {channelData && (<ChannelBlock {...{ show: (channelData), channelData, textMax, feedMax, type: 'channel', onTipToggle: handleTipToggle, showTip }} />)}

      {showTip && <Tip {...{ channelId: channel }} />}




      {searchSelect == 'Curation' && (

      <div className={isMobile ? 'flex-col' : 'flex-row'} style={{justifyContent: 'center', marginTop: '15px', marginBottom: '30px', gap: isMobile ? '0.25rem' : '1rem'}}>


        <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
          <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
            <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>SORT</div>
            {/* <div className={timeframe == '24h' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('24h')}}>24hr</div>
            <div className={timeframe == '3d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('3d')}}>3d</div> */}
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

