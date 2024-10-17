import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';
import axios from 'axios';
import Cast from '../../../../components/Cast'
import { formatNum, getCurrentDateUTC, getTimeRange, isYesterday, checkEmbedType, populateCast, isCast } from '../../../../utils/utils';
import { AiOutlineBars } from "react-icons/ai";
import Spinner from '../../../../components/Common/Spinner';
import ExpandImg from '../../../../components/Cast/ExpandImg';
import CuratorData from '../../../../components/Page/CuratorData';
import TopPicks from '../../../../components/Page/FilterMenu/TopPicks';
import Shuffle from '../../../../components/Page/FilterMenu/Shuffle';
import Time from '../../../../components/Page/FilterMenu/Time';
import { confirmUser } from '../../../../utils/utils';
import { useInView } from 'react-intersection-observer'
import { BsClock } from "react-icons/bs";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { IoShuffleOutline as ShuffleIcon } from "react-icons/io5";

export default function ProfilePage() {
  const router = useRouter();
  const [ref, inView] = useInView()
  const { fid, points, app, userFid, pass, id } = router.query
  const [user, setUser] = useState(null)
  const { LoginPopup, isLogged, setPoints, setIsLogged, setFid, miniApp, setMiniApp } = useContext(AccountContext)
  const ref1 = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Curation', 'Casts', 'Casts + Replies']
  const [searchSelect, setSearchSelect ] = useState('Curation')
  const { isMobile } = useMatchBreakpoints();
  const [userFeed, setUserFeed] = useState(null)
  const [prevSearch, setPrevSearch] = useState({getTime: null, channel: null, curator: null, text: null, shuffle: null, points: null, page: 0, order: -1})
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
  const [isSelected, setIsSelected] = useState('none')
  const [userSearch, setUserSearch] = useState({ search: '' })
  const [selectedChannels, setSelectedChannels] = useState([])
  const [channels, setChannels] = useState([])
  const initialQuery = {shuffle: false, time: '3d', tags: [], channels: [], curators: [], order: -1}
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
  const [sched, setSched] = useState({inView: false, user: false, feed: false, id: false, fid: false})
  const [delay, setDelay] = useState(true)
  const [timeframe, setTimeframe] = useState('3d')
  const [sortBy, setSortBy] = useState('down')
  const [tipId, setTipId] = useState(null)
  const [userTip, setUserTip] = useState(null)
  const [curators, setCurators] = useState([])
  const [tipEcosystem, setTipEcosystem] = useState('abundance')

  async function getCuratorData(fid) {
    try {
      const response = await axios.get('/api/getCuratorProfile', {
        params: { fid }
      })
      if (response?.data) {
        const profile = response?.data?.data?.Socials?.Social[0] || null
        const populatedProfile = {
          username: profile?.profileName,
          pfp: {
            url: profile?.profileImage,
          },
          displayName: profile?.profileDisplayName,
          activeOnFcNetwork: true,
          profile: { bio: { text: profile?.profileBio } },
          followingCount: profile?.followingCount,
          followerCount: profile?.followerCount,
          fid
        }
        setUser(populatedProfile)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setUser(null)
    }
  }

  useEffect(() => {
    const inViewRouter = () => {
      console.log('running', userFeed?.length, (userFeed?.length % 10 == 0), id, tipId)
      if (!id) {
        console.log('test1', id, tipId)
        setDelay(true)
        // feedRouter()
      }
      // if (userFeed?.length % 10 == 0) {



        // if (cursor !== prevCursor && cursor !== '' && isLogged) {
        //   if (searchSelect == 'Main') {
        //     setPrevCursor(cursor)
        //     addToFeed(fid, channelSelect, true, cursor)
        //   } else if (searchSelect == 'Recent') {
        //     setPrevCursor(cursor)
        //     addToFeed(fid, channelSelect, false, cursor)
        //   } else if (searchSelect == 'Curation') {
        //     setPrevCursor(cursor)
        //     feedRouter()
        //   }
        //   console.log('trigger get additional casts', cursor, prevCursor, searchSelect)
          
        // } else {
        //   console.log('triggered, no new casts', cursor, prevCursor, searchSelect)
        // }
      // }
    }

    if (sched.inView) {
      inViewRouter()
      setSched(prev => ({...prev, inView: false }))
    } else {
      const timeoutId = setTimeout(() => {
        inViewRouter()
        setSched(prev => ({...prev, inView: false }))
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [inView, sched.inView])


  useEffect(() => {

    function fidTrigger() {
      if (id) {
        console.log('id set')
        setDelay(true)
        setTipId(true)
        getTipCasts(id)
      }
      if (fid) {
        getCuratorData(fid)
      }
      if (points) {
        setPoints(points)
      }
      setUserQuery({
        ...userQuery,
        curators: [fid], points: points || null
      })

    }

    if (sched.fid) {
      console.log('feed', id, tipId)
      fidTrigger()
      setSched(prev => ({...prev, fid: false }))
    } else {
      const timeoutId = setTimeout(() => {
        fidTrigger()
        setSched(prev => ({...prev, fid: false }))
      }, 1000);
      return () => clearTimeout(timeoutId);
    }






  }, [fid, sched.fid]);


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
    console.log('app02', isLogged, fid)
  }, [isLogged]);



  // async function getUser(fid) {
  //   try {
  //     const response = await axios.get('/api/getUserByFid', {
  //       params: { fid }
  //     })
  //     if (response?.data) {
  //       setUser(response?.data)
  //     } else {
  //       setUser(null)
  //     }
  //   } catch (error) {
  //     console.error('Error submitting data:', error)
  //     setUser(null)
  //   }
  // }


  // useEffect(() => {
  //   if (sched.user) {
  //     if (user && fid && fid !== '-') {
  //       console.log('2')
  //       feedRouter()
  //     }
  //     setSched(prev => ({...prev, user: false }))
  //   } else {
  //     const timeoutId = setTimeout(() => {
  //       if (user && fid && fid !== '-') {
  //         console.log('3')
  //         feedRouter()
  //       }
  //       setSched(prev => ({...prev, user: false }))
  //     }, 300);
  
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [user, sched.user]);

  useEffect(() => {
    if (sched.id) {
      console.log('feed', id, tipId)
      if (id) {
        setDelay(true)
        setTipId(true)
        getTipCasts(id)
      }
      setSched(prev => ({...prev, id: false }))
    } else {
      const timeoutId = setTimeout(() => {
        if (id) {
          setDelay(true)
          setTipId(true)
          getTipCasts(id)
        }
        setSched(prev => ({...prev, id: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [id, sched.id])

  // useEffect(() => {
  //   console.log('userFeed', userFeed)
  // }, [userFeed])


  useEffect(() => {
    if (sched.feed) {
      console.log('feed', id, tipId)
      // setPage(1)
      if (!id) {
        console.log('test2', id, tipId)
        feedRouter();
      }
      setSched(prev => ({...prev, feed: false }))
    } else {
      const timeoutId = setTimeout(() => {
        // setPage(1)
        if (!id) {
          console.log('test3', id)
          feedRouter();
        }
        setSched(prev => ({...prev, feed: false }))
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [searchSelect, userQuery, sched.feed])

  function feedRouter() {
    const { shuffle, time, tags, channels, curators, order } = userQuery
    if (!id) {
      getUserSearch(time, tags, channels, curators, null, shuffle, order)
    } else {
      getTipCasts(id)
    }
  }
  
  async function getUserSearch(getTime, tags, channel, curator, text, shuffle, order) {
    console.log('no id!')
    const time = getTimeRange(getTime)

    console.log(getTime, tags, channel, curator, text, shuffle, points, order)
    let page = prevSearch.page + 1

    console.log(prevSearch.getTime == getTime, prevSearch.channel == channel, prevSearch.curator == curator, prevSearch.text == text, prevSearch.points == points, prevSearch.getTime == getTime && prevSearch.channel == channel && prevSearch.curator == curator && prevSearch.text == text && prevSearch.points == points)


    if (shuffle) {
      setDelay(true)
      console.log('opt1')
      page = 1
      setUserFeed([])
      setPrevSearch(prev => ({...prev, getTime, channel, curator, text, shuffle, points, page, order }))
    } else if (prevSearch.getTime == getTime && prevSearch.channel == channel && prevSearch.curator == curator && prevSearch.text == text && prevSearch.points == points && prevSearch.order == order) {
      setDelay(true)
      console.log('opt2')
      setPrevSearch(prev => ({...prev, getTime, channel, curator, text, shuffle, points, page, order }))
    } else {
      setDelay(true)
      console.log('opt3')
      page = 1
      setUserFeed([])
      setPrevSearch(prev => ({...prev, getTime, channel, curator, text, shuffle, points, page, order })) 
    }

    async function getSearch(time, tags, channel, curator, text, shuffle, points, page, order) {

      try {
        const response = await axios.get('/api/curation/getUserSearch', {
          params: { time, tags, channel, curator, text, shuffle, points, page, order }
        })

        const removeDelay = () => {
          setTimeout(() => {
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
        console.log(casts)

        return casts
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }
    }

    let casts = []
    console.log('pages', page, page == 1, (page !== 1 && userFeed?.length % 10 == 0))
    if (!id && (page == 1 || (page !== 1 && userFeed?.length % 10 == 0)) ) {
      casts = await getSearch(time, tags, channel, curator, text, shuffle, points, page, order)
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

      if (order == -1) {
        sortedCasts = filteredCasts.sort((a, b) => b.impact_total - a.impact_total);
      } else {
        sortedCasts = filteredCasts.sort((a, b) => a.impact_total - b.impact_total);
      }

      let displayedCasts = await populateCast(sortedCasts)

      if (userFeed?.length == 0 || page == 1 || shuffle) {
        console.log('opt1-2')
        setUserFeed(displayedCasts)
      } else if (userFeed) {
        console.log('opt2-2')
        console.log('feed length', userFeed?.length)
        setUserFeed((prevUserFeed) => prevUserFeed.concat(displayedCasts))
      }
    }
  }





async function getTipCasts(id) {
  console.log('id!')
  let casts = []
  let tip = ''
  let curatorData = []
  let ecosystem = 'abundance'

  async function getCasts(id) {
    console.log('get tips', id)
    try {
      const response = await axios.get('/api/getTipCircle', {
        params: { id }
      })

      let casts = []
      let tip = ''
      let curatorData = []
      let ecosystem = 'abundance'

      if (response?.data?.casts?.length > 0) {
        casts = response?.data?.casts
        tip = response?.data?.tip
        curatorData = response?.data?.curatorData
        ecosystem = response?.data?.ecosystem
      }
      console.log(casts)

      return {casts, tip, curatorData: curatorData || [], ecosystem}
    } catch (error) {
      console.error('Error submitting data:', error)
      return {cassts: [], tip: '', curatorData: [], ecosystem: 'abundance'}
    }
  }

  if (id) {
    ({ casts, tip, curatorData } = await getCasts(id))
  }
  console.log('tip', tip, curatorData)

  setUserTip(tip)
  setCurators(curatorData)
  setTipEcosystem(ecosystem)

  let filteredCasts
  let sortedCasts

  if (!casts) {
    setUserFeed([])

  } else {

    console.log(casts)
    filteredCasts = await casts.reduce((acc, current) => {
      const existingItem = acc.find(item => item._id === current._id);
      if (!existingItem) {
        acc.push(current);
      }
      return acc;
    }, [])

    // if (order == -1) {
      sortedCasts = filteredCasts.sort((a, b) => b.impact_total - a.impact_total);
    // } else {
    //   sortedCasts = filteredCasts.sort((a, b) => a.impact_total - b.impact_total);
    // }

    let displayedCasts = await populateCast(sortedCasts)

    // if (userFeed?.length == 0 || page == 1 || shuffle) {
    //   console.log('opt1-2')
      setUserFeed(displayedCasts)
    // } else if (userFeed) {
    //   console.log('opt2-2')
    //   console.log('feed length', userFeed?.length)
    //   setUserFeed((prevUserFeed) => prevUserFeed.concat(displayedCasts))
    // }
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
        order: 1, shuffle: false
      })
    } else if (order == 'down') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: false
      })
    } else if (order == 'shuffle') {
      setUserQuery({
        ...userQuery,
        order: -1, shuffle: true
      })
    }

  }


  useEffect(() => {


    // Example usage:
    // executeWithDelay(() => {
    //   console.log('This function is executed after a 2 second delay');
    // });


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
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>

      <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'flex-start', padding: '20px 0 30px 0'}}>
        <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
          {/* <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>TIME</div> */}

          <Link href={`/~/ecosystems/${tipEcosystem || 'abundance'}`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>{tipEcosystem || 'abundance'}</div></Link>
          <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
          {id ? (<div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>tips</div>) : (<Link href={`/~/ecosystems/${tipEcosystem || 'abundance'}/curator`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>curator</div></Link>)}
          <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
          <div className='filter-item-on' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>@{user?.username}</div>
        </div>
      </div>


      {user && (<CuratorData {...{ show: (isLogged && user), user, textMax }} />)}
      {/* <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-evenly', margin: '0', borderBottom: '1px solid #888'}}>
        {userButtons.map((btn, index) => (
          <FeedMenu {...{buttonName: btn, searchSelect, searchOption, isMobile }} key={index} />))}
      </div> */}

      {searchSelect == 'Curation' && !id ? (

      <div className='flex-row' style={{justifyContent: 'center', marginTop: '15px', marginBottom: '30px', gap: '1rem'}}>
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


        {/* <div style={{position: 'relative'}}>
          <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == 'tags') ? '2px solid #99ddff' : '1px solid #abc', height: '28px'}} onMouseEnter={() => {handleSelection('tags')}} onMouseLeave={() => {handleSelection('none')}}>
            <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
              <GoTag size={23} color='#eee' />
              <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0'}}>{!isMobile && btnText('tags')}</span>
            </div>
          </div>
          {(isSelected == 'tags') && (
            <div className=' top-layer' style={{position: 'absolute', right: '0'}} onMouseEnter={() => {handleSelection('tags')}} onMouseLeave={() => {handleSelection('none')}}>

              <TagsDropdown handleSelect={handleSelect} userQuery={userQuery} options={queryOptions.tags} selection={'tags'} />

            </div>
          )}
        </div> */}

        {/* <div style={{position: 'relative'}}>
          <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == 'channels') ? '2px solid #99ddff' : '1px solid #abc', height: '28px', marginRight: '4px'}} onMouseEnter={() => {handleSelection('channels')}} onMouseLeave={() => {handleSelection('none')}}>
            <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
              <AiOutlineBars size={15} color='#eee' />
              <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0', color: userQuery['channels'].length == 0 ? '#aaa' : ''}}>{isMobile ? '' : userQuery['channels'].length == 0 ? 'All channels' : 'Channels'}</span>
            </div>
          </div>
        </div> */}

        {/* {(isSelected == 'channels') && (
          <div className='' style={{position: 'absolute', width: '100%', margin: 'auto', marginTop: '28px'}} onMouseEnter={() => {handleSelection('channels')}} onMouseLeave={() => {handleSelection('none')}}>
            <div className='top-layer flex-col' style={{gap: '0.25rem', padding: '6px 6px', borderRadius: '10px', backgroundColor: '#1D3244dd', border: '1px solid #abc', width: 'auto', marginTop: '10px', alignItems: 'flex-start'}}>
              <div className={`selection-btn ${(userQuery['channels'] == 'all' || userQuery['channels'].length == 0) ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}}>
                <input onChange={onChannelChange} 
                  name='search' 
                  placeholder={`Search channels`} 
                  value={userSearch.search} 
                  className='srch-btn' 
                  style={{width: '100%', backgroundColor: '#234'}} 
                  onKeyDown={channelKeyDown} />
              </div>
              <div className='flex-row top-layer' style={{gap: '0.5rem', padding: '0px 6px', flexWrap: 'wrap'}}>
                {channels && (
                  channels.map((channel, index) => (
                    <div key={index} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
                      <img loading="lazy" src={channel.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                      <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
                      <div style={{fontWeight: '400', fontSize: '10px', color: '#ccc'}}>{formatNum(channel.follower_count)}</div>
                    </div>
                  )
                ))}
              </div>

              {(selectedChannels && selectedChannels.length > 0) && (<div className='flex-row' style={{gap: '0.5rem', padding: '10px 6px 6px 6px', flexWrap: 'wrap', borderTop: '1px solid #888', width: '100%', alignItems: 'center'}}>
                <div style={{color: '#ddd', fontWeight: '600', fontSize: '13px', padding: '0 0 3px 6px'}}>Selected:</div>
                {(
                  selectedChannels.map((channel, index) => (
                    <div key={index} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
                      <img loading="lazy" src={channel.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                      <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
                    </div>
                  )
                ))}
              </div>)}
              </div>
            </div>
          )} */}
        </div>
      ) : (
        <div className='flex-row' style={{justifyContent: 'center', marginTop: '15px', marginBottom: '30px', gap: '1rem'}}>
          <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
            <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
              <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>USER TIP</div>
              <div className={timeframe == '24h' ? 'filter-item-on' : 'filter-item'} style={{fontSize: isMobile ? '9px' : '10px'}}>{userTip || 'none'}</div>
            </div>
          </div>

          <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
            <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
              <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>CURATORS</div>
              {curators && (curators.map((curator, index) => (
                (<Link key={index} href={`/~/ecosystems/${tipEcosystem || 'abundance'}/curator/${curator?.username}`}><div className='filter-item' style={{fontSize: isMobile ? '9px' : '10px'}}>@{curator?.username}</div></Link>)
              )))}
            </div>
          </div>


        </div>
      )}

      <div style={{margin: '0 0 70px 0'}}>
        {(!userFeed || userFeed.length == 0) ? (
        <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
          <Spinner size={31} color={'#999'} />
        </div>
        ) : (userFeed.map((cast, index) => (<Cast {...{cast, key: index, index, updateCast, openImagePopup, ecosystem: eco.ecosystem_points_name, self: false, app}} />)))}
      </div>
      {!delay && (<div ref={ref}>&nbsp;</div>)}
      <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
    </div>
  );
}