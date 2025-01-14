import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import Link from 'next/link'
import axios from 'axios';
// import { AiOutlineBars } from "react-icons/ai";
import { useInView } from 'react-intersection-observer'
import { BsLightningChargeFill as Impact } from "react-icons/bs";
import Item from '../../components/Ecosystem/ItemWrap/Item';
import Description from '../../components/Ecosystem/Description';
import ItemWrap from '../../components/Ecosystem/ItemWrap';
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { FaLock, FaGlobe, FaRegStar, FaAngleDown, FaShareAlt as Share } from "react-icons/fa";
import { PiSquaresFourLight as Actions, PiClockClockwiseBold as ClockForward, PiClockCounterClockwiseBold as ClockBack, PiBankFill } from "react-icons/pi";
import { GrSchedulePlay as Sched } from "react-icons/gr";
import { GiRibbonMedal as Medal } from "react-icons/gi";
import { IoShuffleOutline as ShuffleIcon, IoBuild } from "react-icons/io5";
import { FaStar, FaCoins } from "react-icons/fa6";
import { IoIosRocket, IoMdTrophy } from "react-icons/io";
import { confirmUser, timePassed } from '../../utils/utils';
import Spinner from '../../components/Common/Spinner';
import ExpandImg from '../../components/Cast/ExpandImg';
import CuratorData from '../../components/Page/CuratorData';
// import TopPicks from '../../components/Page/FilterMenu/TopPicks';
// import Shuffle from '../../components/Page/FilterMenu/Shuffle';
// import Time from '../../components/Page/FilterMenu/Time';
import { formatNum, getCurrentDateUTC, getTimeRange, isYesterday, checkEmbedType, populateCast, isCast } from '../../utils/utils';
import Cast from '../../components/Cast'
import LoginButton from '../../components/Layout/Modals/FrontSignin';
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';
import { AccountContext } from '../../context';
import { FiShare } from "react-icons/fi";
import { Logo } from '../assets'
import qs from "querystring";
// import ScoreDashboard from '../../components/Common/ScoreDashboard';
import Modal from '../../components/Layout/Modals/Modal';

export default function ProfilePage() {
  const router = useRouter();
  const [ref, inView] = useInView()
  const { ecosystem, username, app, userFid, pass } = router.query
  const [user, setUser] = useState(null)
  const { LoginPopup, isLogged, showLogin, setShowLogin, setPoints, setIsLogged, setFid, miniApp, setMiniApp, fid } = useContext(AccountContext)
  const ref1 = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Curation', 'Casts', 'Casts + Replies']
  const [searchSelect, setSearchSelect ] = useState('Curation')
  const { isMobile } = useMatchBreakpoints();
  const [display, setDisplay] = useState({fund: false, ecosystem: false, multitip: false, promotion: false, curation: false, score: false})
  const [isOn, setIsOn] = useState(false);
  const [scoreTime , setScoreTime ] = useState('all');
  const [scoreLoading , setScoreLoading ] = useState(false);
  const [fundLoading , setFundLoading ] = useState(true);
  const [userFeed, setUserFeed] = useState(null)
  const [prevSearch, setPrevSearch] = useState({getTime: null, channel: null, username: null, text: null, shuffle: null, ecosystem: null, page: 0, order: -1, timeSort: null})
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
  const [userScore, setUserScore] = useState(null)
  const [userFunding, setUserFunding] = useState(null)
  const [isSelected, setIsSelected] = useState('none')
  const [userSearch, setUserSearch] = useState({ search: '' })
  const [selectedChannels, setSelectedChannels] = useState([])
  const [channels, setChannels] = useState([])
  const initialQuery = {shuffle: false, time: '3d', tags: [], channels: [], username: null, order: -1, timeSort: null}
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
  const [multitips, setMultitips] = useState([])
  const [loading, setLoading] = useState({fund: true, ecosystem: true, multitip: true, promotion: true, curation: true, score: true});
  const [loaded, setLoaded] = useState(false);
  const initChannels = [
    ' ',
    'impact',
  ]
  const [channelOptions, setChannelOptions] = useState(initChannels)
  const [selectedChannel, setSelectedChannel] = useState('none')
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  
  async function getCuratorData(fid) {
    try {
      const response = await axios.get('/api/getCuratorProfile', {
        params: { fid }
      })
      if (response?.data) {
        const profile = response?.data?.data?.Socials?.Social[0] || null
        console.log('profile', profile)
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
          fid: Number(profile?.userId)
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

  async function getScores(fid, time) {
    try {
      const response = await axios.get('/api/score/getScores', {
        params: { fid, time }
      })
      if (response?.data) {
        const score = response?.data?.scoreData || null
        console.log('score', score)
        if (score) {
          setUserScore(score)
        } else {
          setUserScore(null)
        }
      } else {
        setUserScore(null)
      }
      setLoading(prev => ({...prev, score: false }))
      setScoreLoading(false)
    } catch (error) {
      console.error('Error submitting data:', error)
      setUserScore(null)
      setLoading(prev => ({...prev, score: false }))
      setScoreLoading(false)
    }
  }

  function toggleMenu(target) {
    if (!display[target]) {
      if (target == "score" && fid && !userScore) {
        setScoreLoading(true)
        getScores(fid, scoreTime || 'all')
      } else if (target == "multitip" && fid && multitips?.length == 0) {
        getTips(fid)
      }
    }
    setDisplay(prev => ({...prev, [target]: !display[target] }))
  }


  useEffect(() => {
    if (display.curation) {
      getChannels('$IMPACT')
      feedRouter()
    }
  }, [display.curation])



  async function getTips(fid) {
    // console.log(points, time)
    // const points = '$IMPACT'
    try {
      const response = await axios.get('/api/curation/getTips', {
        params: { fid } })
      if (response?.data?.latestTips?.length > 0) {
        const tipData = response?.data?.latestTips
        console.log('tipData', tipData)
        setMultitips(tipData)
      } else {
        setMultitips([])
      }
      setLoading(prev => ({...prev, multitip: false }))
      setLoaded(true)
    } catch (error) {
      console.error('Error submitting data:', error)
      setLoaded(true)
      setLoading(prev => ({...prev, multitip: false }))
      setMultitips([])
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

    if (sched.inView && userFeed?.length !== 0) {
      inViewRouter()
      setSched(prev => ({...prev, inView: false }))
    } else if (userFeed?.length !== 0) {
      const timeoutId = setTimeout(() => {
        inViewRouter()
        setSched(prev => ({...prev, inView: false }))
      }, 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [inView, sched.inView])


  useEffect(() => {
    if (fid) {
      // getTips(fid)
      getFunding(fid)
      getCuratorData(fid)
      setUserQuery({
        ...userQuery,
        curators: [fid]
      })
    }

  }, [fid]);


  async function getFunding(fid) {
    try {
      const response = await axios.get('/api/fund/getFunding', {
        params: { fid }
      })
      if (response?.data) {
        const fundingData = response?.data?.schedule || null
        console.log('fundingData', fundingData)
        if (fundingData) {
          setUserFunding(fundingData)
          if (fundingData.active_cron) {
            setIsOn(true)
          } else {
            setIsOn(false)
          }
        } else {
          setUserFunding(null)
        }
      } else {
        setUserFunding(null)
      }
      setFundLoading(false)
      // setLoading(prev => ({...prev, score: false }))
      // setScoreLoading(false)
    } catch (error) {
      console.error('Error submitting data:', error)
      setUserFunding(null)
      setFundLoading(false)
      // setLoading(prev => ({...prev, score: false }))
      // setScoreLoading(false)
    }
  }




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
    const { shuffle, time, tags, channels, curators, ecosystem, order, timeSort } = userQuery
    if (curators && display.curation) {
      console.log('get user executed')
      getUserSearch(time, tags, channels, curators, null, shuffle, order, ecosystem, timeSort )
    }
  }
  
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

  // useEffect(() => {
  //   if (sched.channels) {
  //     getChannels('$IMPACT')
  //     setSched(prev => ({...prev, channels: false }))
  //   } else {
  //     const timeoutId = setTimeout(() => {
  //       getChannels('$IMPACT')
  //       setSched(prev => ({...prev, channels: false }))
  //     }, 300);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [sched.channels])

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

  async function getUserSearch(getTime, tags, channel, curators, text, shuffle, order, ecosystem, timeSort ) {
    const time = getTimeRange(getTime)

    console.log(getTime, tags, channel, text, shuffle, order, ecosystem)
    let page = prevSearch.page + 1

    console.log(prevSearch.getTime == getTime, prevSearch.channel == channel, prevSearch.text == text, prevSearch.ecosystem == ecosystem, prevSearch.getTime == getTime && prevSearch.channel == channel && prevSearch.text == text && prevSearch.ecosystem == ecosystem)


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
    console.log('casts', casts)
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


  function shareFrame(event, tip) {
    let tippedCreators = ''
    if (tip?.showcase?.length > 0) {
      tippedCreators = tip.showcase.reduce((str, creator, index, arr) => {
        if (!str.includes(creator.username)) {
          if (str === '') {
            return '@' + creator.username;
          }
          if (index === arr.length - 1 && index !== 0) {
            return str + ' & @' + creator.username + ' ';
          }
          return str + ', @' + creator.username;
        }
        return str;
      }, '');
    }
    event.preventDefault();
    let shareUrl = `https://impact.abundance.id/~/ecosystems/${
      tip?.handle
    }/tip-share-${(tip?.showcase?.length > 0) ? 'v3' : 'v2'}?${qs.stringify({
      id: tip?._id,
    })}`;
    let shareText = ''

    if (tip?.curators && tip?.curators[0]?.fid == fid) {
      shareText = `I multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders '} thru /impact by @abundance.\n\nSupport my nominees here:`;
    } else if (tip?.curators?.length > 0) {
      // const curatorName = await getCurator(curators, points)

      if (tip?.curators[0]?.fid !== fid) {
        shareText = `I multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders '}thru /impact by @abundance.\n\nThese creators were curated by @${tip?.curators[0]?.username}. Support their nominees here:`;
      } else {
        shareText = `I multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders '} thru /impact by @abundance. Try it out here:`
      }
    } else {
      shareText = `I multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders '} thru /impact by @abundance. Try it out here:`
    }

    let encodedShareText = encodeURIComponent(shareText)
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

    if (!miniApp) {
      window.open(shareLink, '_blank');
    } else if (miniApp) {
      window.parent.postMessage({
        type: "createCast",
        data: {
          cast: {
            text: shareText,
            embeds: [shareUrl]
          }
        }
      }, "*");
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

  // async function getChannels(name) {
  //   console.log(name)
  //   try {
  //     const response = await axios.get('/api/getChannels', {
  //       params: {
  //         name: name,
  //       }
  //     })
  //     if (response) {
  //       const channels = response.data.channels.channels
  //       console.log(channels)
  //       setChannels(channels)
  //     }
  //   } catch (error) {
  //     console.error('Error submitting data:', error)
  //   }
  // }

  // async function getChannels(points) {
  //   try {
  //     const channelData = await axios.get('/api/curation/getChannelNames', { params: { points } })
  //     if (channelData) {
  //       const ecoChannels = channelData?.data?.channels
  //       console.log('e1', ecoChannels)

  //       const updatedChannels = [
  //         ' ',
  //         ...ecoChannels
  //       ];
  //       setChannelOptions(updatedChannels);
  //     }
  //   } catch (error) {
  //     console.error('Error updating channels:', error);
  //   }
  // }


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



  
  function updateScore(time) {
    setScoreLoading(true)
    setScoreTime(time)
    getScores(fid, time)

    // setUserFeed([])
    // setTimeframe(time)
    console.log('time', time)

    // setUserQuery({
    //   ...userQuery,
    //   time: time
    // })

    // setUserQuery({
    //   ...userQuery,
    //   curators: [fid], points: points || null
    // })

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

  async function setFundingSchedule(schedule) {
    setFundLoading(true)
    try {
      console.log(fid, schedule)
      const response = await axios.post('/api/fund/postSchedule', { fid, schedule });
      if (response?.data) {
        console.log('response', response?.data)
        setUserFunding(response?.data?.updatedSchedule)
        if (response?.data?.updatedSchedule?.active_cron) {
          setIsOn(true)
        } else {
          setIsOn(false)
        }
        setModal({on: true, success: true, text: 'Auto-Fund updated successfully'});
        setTimeout(() => {
          setModal({on: false, success: false, text: ''});
        }, 2500);
      } else {
        console.log('no auto-fund response')
        setUserFunding(null)

        setModal({on: true, success: false, text: 'Auto-Fund failed to update'});
        setTimeout(() => {
          setModal({on: false, success: false, text: ''});
        }, 2500);
        setIsOn(false)
      }
      console.log('schedule', schedule)
      setFundLoading(false)
      return schedule
    } catch (error) {
      console.error('Error updating auto-fund:', error);
      setFundLoading(false)
      setModal({on: true, success: false, text: 'Auto-Fund failed to update'});
      setTimeout(() => {
        setModal({on: false, success: false, text: ''});
      }, 2500);
      setIsOn(false)
      return null
    }
  }



  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  const ToggleSwitch = () => {
    const handleToggle = () => {
      console.log('isOn', isOn)
      if (isOn) {
        setFundingSchedule('off')
      } else {
        setDisplay(prev => ({...prev, ['fund']: true }))
        setFundingSchedule('on')
      }
      // setIsOn(!isOn);
    };
  
    return (
      <div className="flex-col" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          className={`toggleSwitch ${isOn ? "toggleSwitch-on" : ""}`}
          onClick={handleToggle}
        >
          <span className='circle'></span>
        </div>
        <div style={{fontSize: '10px', color: isOn ? '#8ad' : '#68a', margin: '10px 0 0 0'}}>{isOn ? 'Auto-Funding On' : 'Auto-Funding Off'}</div>

      </div>
    );
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

          <div className='filter-item-on' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>Studio</div>
          <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
          <Link href={`/~/studio/multi-tip`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>multi-tip</div></Link>
          {/* <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
          <Link href={`/~/ecosystems/${ecosystem}/curators`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>curators</div></Link>
          <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
          <div className='filter-item-on' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>@{user?.username}</div> */}
        </div>
      </div>

      {user && (<CuratorData {...{ show: (isLogged && user), user, textMax, type: 'curator' }} />)}









      <div className='flex-row' style={{justifyContent: 'center'}}>


      {/* IMPACT SCORE BUTTON */}

        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >



          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "20px 8px 8px 8px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              onClick={() =>
                document
                  .getElementById("score")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                }}
              >
                {!isMobile && <IoMdTrophy size={14} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? '13px' : '15px',
                    fontWeight: "500",
                    textWrap: "nowrap",
                  }}
                >
                  Score
                </p>
              </div>
            </div>


          </div>

        </div>

      {/* IMPACT FUND BUTTON */}

        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >



          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "20px 8px 8px 8px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              onClick={() =>
                document
                  .getElementById("fund")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                }}
              >
                {!isMobile && <PiBankFill size={14} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? '13px' : '15px',
                    fontWeight: "500",
                    textWrap: "nowrap",
                  }}
                >
                  Auto-Fund
                </p>
              </div>
            </div>


          </div>

        </div>

      {/* CURATION BUTTON */}

        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >



          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "20px 8px 8px 8px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              onClick={() =>
                document
                  .getElementById("curation")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                }}
              >
                {!isMobile && <FaStar size={14} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? '13px' : '15px',
                    fontWeight: "500",
                    textWrap: "nowrap",
                  }}
                >
                  Curation
                </p>
              </div>
            </div>


          </div>

        </div>


      {/* MULTI-TIPS BUTTON */}

        <div
          className="flex-col"
          style={{
            // width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >



          <div
            className="flex-row"
            style={{
              gap: "0.75rem",
              margin: "20px 8px 8px 8px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              onClick={() =>
                document
                  .getElementById("multitip")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              <div
                className="flex-row cast-act-lt"
                style={{
                  borderRadius: "8px",
                  padding: "8px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                }}
              >
                {!isMobile && <FaCoins size={14} />}
                <p
                  style={{
                    padding: "0px",
                    fontSize: isMobile ? '13px' : '15px',
                    fontWeight: "500",
                    textWrap: "nowrap",
                  }}
                >
                  Multi-Tips
                </p>
              </div>
            </div>


          </div>

        </div>




      </div>










      {/* IMPACT SCORE */}

      <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>




        <div
          id="score"
          style={{
            padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
            width: "40%",
          }}
        ></div>

        <div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }}
        >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }}
          >
            <IoMdTrophy style={{ fill: "#cde" }} size={27} onClick={() => {
              toggleMenu("score");
            }} />
            <div onClick={() => {
              toggleMenu("score");
            }}>
              <Description
                {...{
                  show: true,
                  text: "Impact Score",
                  padding: "4px 0 4px 10px",
                  size: "large",
                }}
              />
            </div>

              <div
                className="flex-row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => {
                  toggleMenu("score");
                }}
              >
                {/* <Item {...{ text: "How it works" }} /> */}



              <FaAngleDown
                size={28} color={"#cde"}
                style={{
                  margin: "5px 15px 5px 5px",
                  transform: display.score
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>
          </div>

          <div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "17px",
              padding: "10px 10px 15px 10px",
              justifyContent: "center",
              userSelect: 'none'
            }}
          >
            See your impact on Farcaster
          </div>



          {(display.score && <>{loading.score ? (
            <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
              <Spinner size={31} color={'#468'} />
            </div>
          ) : (<div
            className={isMobile ? "flex-col" : "flex-row"}
            style={{
              padding: "0px 0 0 0",
              width: "100%",
              height: 'auto',
              // flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >



            <div className={'flex-col btn-select'} style={{minWidth: isMobile ? '155px' : '120px', width: isMobile ? '100%' : '50%', padding: isMobile ? '22px 12px 12px 12px' : '10px', flexGrow: 1 }}>

              <div style={{width: '167px', position: 'relative'}}>
                <div style={{mask: `linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) ${userScore?.impactRank * 2.7 || 0}deg, rgba(0, 0, 0, 0) 0deg)`, transform: 'rotate(-135deg)', width: '100%', transition: 'mask-image 0.3s ease'}} className="top-layer absolute blu-std p-5 rounded-full aspect-square"></div>
                <div className="blu-std-drk p-5 rounded-full aspect-square" style={{mask: 'linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) 270deg, rgba(0, 0, 0, 0) 0deg)', transform: 'rotate(-135deg)', width: '100%'}}></div>
                <div className="absolute flex flex-col justify-c items-c text-c">
                  {scoreLoading ? (
                      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                        <Spinner size={31} color={'#468'} />
                      </div>
                    ) : (<div>
                    <div style={{fontSize: '28px', fontWeight: '700'}}>{userScore?.impactScore || 0}</div>
                    <div style={{fontSize: '13px'}}>Top {userScore?.impactRank || 0}%
                    </div>
                  </div>)}
                </div>
              </div>


              <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                <div style={{fontSize: '18px', fontWeight: '600', margin: '-10px 0 3px 0'}}>{(scoreTime == 'all' || scoreTime == '30d') ? 'Impact ' : 'Reward '}Score</div>
              </div>



              <div className='flex-row text-c' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem', margin: '10px 0 0 0', width: isMobile ? '60%' : '90%', padding: '8px', borderRadius: '10px', border: '1px solid #246', backgroundColor: '#00224466'}}>
                <div style={{fontSize: isMobile ? '12px' : '12px', fontWeight: '400'}}>{(scoreTime == 'all' || scoreTime == '30d') ? 'Impact Score = Creator Score + Curator Score + Contributor Score' : 'Reward Score = Curator Score + Contributor Score + Invite Score'} </div>
              </div>




              {/* {scoreTime == '24h' ? (<div>24h</div>) : scoreTime == '3d' ? (<div>24h</div>) : scoreTime == '7d' ? (<div>24h</div>) : scoreTime == '24h' ? (<div>24h</div>) : scoreTime == '24h' ? (<div>24h</div>) : scoreTime == '24h' ? (<div>24h</div>)} */}


            <div className={isMobile ? 'flex-row' : 'flex-col'} style={{gap: isMobile ? '0.5rem' : '0.25rem', margin: isMobile ? '5px 0 0 0' : '30px 0 0 0'}}>


              <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '0px 0'}}>
                <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#002244ee', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
                  <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>REWARD</div>

                  <div className={scoreTime == '24h' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateScore('24h')}}>24hr</div>
                  <div className={scoreTime == '3d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateScore('3d')}}>3d</div>
                  <div className={scoreTime == '7d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateScore('7d')}}>7d</div>
                </div>
              </div>

              <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '0px 0'}}>
                <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#002244ee', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
                  <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>IMPACT</div>
                  <div className={scoreTime == '30d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateScore('30d')}}>30d</div>
                  <div className={scoreTime == 'all' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateScore('all')}}>all</div>
                </div>
              </div>
            </div>



            </div>



            <div className={'flex-row'} style={{color: "#cde", fontSize: '13px', justifyContent: isMobile ? "center" : "space-between", gap: '0.75rem', margin: '0px 0', flexWrap: 'wrap', width: isMobile ? '100%' : '60%', height: isMobile ? 'auto' : '400px', flexGrow: 1}}>
              <div className='flex-col btn-select blu-lt' style={{minWidth: isMobile ? '125px' : '120px', width: isMobile ? '42%' : '42%', padding: isMobile ? '22px 12px 12px 12px' : '10px' }}>

                <div style={{width: '127px', position: 'relative'}}>
                  <div style={{mask: `linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) ${(scoreTime == 'all' || scoreTime == '30d') ? userScore?.creatorRank * 2.7 || 0 : 0}deg, rgba(0, 0, 0, 0) 0deg)`, transform: 'rotate(-135deg)', width: '100%'}} className="top-layer absolute blu-std p-5 rounded-full aspect-square"></div>
                  <div className="blu-std-drk p-5 rounded-full aspect-square" style={{mask: 'linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) 270deg, rgba(0, 0, 0, 0) 0deg)', transform: 'rotate(-135deg)', width: '100%'}}></div>
                  <div className="absolute flex flex-col justify-c items-c text-c">
                    {scoreLoading ? (
                      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                        <Spinner size={31} color={'#468'} />
                      </div>
                    ) : (<div>
                      <div style={{fontSize: '24px', fontWeight: '700'}}>{(scoreTime == 'all' || scoreTime == '30d') ? userScore?.creatorScore / 20 || 0 : '--'}</div>
                      <div style={{fontSize: '10px'}}>Top {(scoreTime == 'all' || scoreTime == '30d') ? userScore?.creatorRank || 0 : 0}%
                      </div>
                    </div>)}
                  </div>
                </div>


                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div className='t-box-m1'>Creator Score</div>
                </div>

              </div>






              <div className='flex-col btn-select blu-lt' style={{minWidth: isMobile ? '125px' : '120px', width: isMobile ? '42%' : '42%', padding: isMobile ? '22px 12px 12px 12px' : '10px' }}>

                <div style={{width: '127px', position: 'relative'}}>
                  <div style={{mask: `linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) ${userScore?.curatorRank * 2.7 || 0}deg, rgba(0, 0, 0, 0) 0deg)`, transform: 'rotate(-135deg)', width: '100%'}} className="top-layer absolute blu-std p-5 rounded-full aspect-square"></div>
                  <div className="blu-std-drk p-5 rounded-full aspect-square" style={{mask: 'linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) 270deg, rgba(0, 0, 0, 0) 0deg)', transform: 'rotate(-135deg)', width: '100%'}}></div>
                  <div className="absolute flex flex-col justify-c items-c text-c">
                    {scoreLoading ? (
                      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                        <Spinner size={31} color={'#468'} />
                      </div>
                    ) : (<div>
                      <div style={{fontSize: '24px', fontWeight: '700'}}>{userScore?.curatorScore / 100 || 0}</div>
                      <div style={{fontSize: '10px'}}>Top {userScore?.curatorRank || 0}%
                      </div>
                    </div>)}
                  </div>
                </div>


                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div className='t-box-m1'>Curator Score</div>
                </div>

              </div>


              <div className='flex-col btn-select blu-lt' style={{minWidth: isMobile ? '125px' : '120px', width: isMobile ? '42%' : '42%', padding: isMobile ? '22px 12px 12px 12px' : '10px' }}>

                <div style={{width: '127px', position: 'relative'}}>
                  <div style={{mask: `linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) ${userScore?.contributorRank * 2.7 || 0}deg, rgba(0, 0, 0, 0) 0deg)`, transform: 'rotate(-135deg)', width: '100%'}} className="top-layer absolute blu-std p-5 rounded-full aspect-square"></div>
                  <div className="blu-std-drk p-5 rounded-full aspect-square" style={{mask: 'linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) 270deg, rgba(0, 0, 0, 0) 0deg)', transform: 'rotate(-135deg)', width: '100%'}}></div>
                  <div className="absolute flex flex-col justify-c items-c text-c">
                    {scoreLoading ? (
                      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                        <Spinner size={31} color={'#468'} />
                      </div>
                    ) : (<div>
                      <div style={{fontSize: '24px', fontWeight: '700'}}>{userScore?.contributorScore || 0}</div>
                      <div style={{fontSize: '10px'}}>Top {userScore?.contributorRank || 0}%
                      </div>
                    </div>)}
                  </div>
                </div>


                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div className='t-box-m1'>Contributor Score</div>
                </div>

              </div>



              <div className='flex-col btn-select blu-lt' style={{minWidth: isMobile ? '125px' : '120px', width: isMobile ? '42%' : '42%', padding: isMobile ? '22px 12px 12px 12px' : '10px' }}>

              <div style={{width: '127px', position: 'relative'}}>
                <div style={{mask: `linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) ${(scoreTime == 'all' || scoreTime == '30d') ? 0 : userScore?.inviteRank * 2.7 || 0}deg, rgba(0, 0, 0, 0) 0deg)`, transform: 'rotate(-135deg)', width: '100%'}} className="top-layer absolute blu-std p-5 rounded-full aspect-square"></div>
                <div className="blu-std-drk p-5 rounded-full aspect-square" style={{mask: 'linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 0px) content-box intersect, conic-gradient(rgb(0, 0, 0) 270deg, rgba(0, 0, 0, 0) 0deg)', transform: 'rotate(-135deg)', width: '100%'}}></div>
                <div className="absolute flex flex-col justify-c items-c text-c">
                  {scoreLoading ? (
                    <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                      <Spinner size={31} color={'#468'} />
                    </div>
                  ) : (<div>
                    <div style={{fontSize: '24px', fontWeight: '700'}}>{(scoreTime == 'all' || scoreTime == '30d') ? '--' : userScore?.inviteScore || 0}</div>
                    <div style={{fontSize: '10px'}}>Top {userScore?.inviteRank || 0}%
                    </div>
                  </div>)}
                </div>
              </div>


              <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                <div className='t-box-m1'>Invite Score</div>
              </div>

              </div>

            </div>

          </div>)}
          
          <div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "17px",
              padding: "30px 10px 15px 10px",
              justifyContent: "center",
            }}
          >
            How to boost your impact
          </div>

          </>)}
        </div>
      </div>

























      {/* IMPACT FUND */}


      <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>









        <div
          id="fund"
          style={{
            padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
            width: "40%",
          }}
        ></div>

        <div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }}
        >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }}
          >
            <PiBankFill style={{ fill: "#cde" }} size={27}             onClick={() => {
              toggleMenu("fund");
            }} />
            <div onClick={() => {
              toggleMenu("fund");
            }}>
              <Description
                {...{
                  show: true,
                  text: "Auto-Fund",
                  padding: "4px 0 4px 10px",
                  size: "large",
                }}
              />
            </div>


              <div
                className="flex-row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => {
                  toggleMenu("fund");
                }}
              >
                {/* <Item {...{ text: "How it works" }} /> */}



                <FaAngleDown
                  size={28} color={"#cde"}
                  style={{
                    margin: "5px 15px 5px 5px",
                    transform: display.fund
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
          </div>

          <div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "17px",
              padding: "10px 10px 15px 10px",
              justifyContent: "center",
              userSelect: 'none'
            }}
          >
            Join the Impact Fund - boost your Impact Score
          </div>

          <div className='flex-row' style={{margin: '0 0 10px 0', width: "100%", justifyContent: "center"}}>
            <div className='flex-row' style={{width: '100px', position: 'relative'}}>
            <ToggleSwitch />
            {fundLoading && (<div className='flex-row' style={{height: '20px', alignItems: 'center', width: '20px', justifyContent: 'center', padding: '0px', position: 'absolute', right: '-8%', top: '-3px'}}>
              <Spinner size={20} color={'#468'} />
            </div>)}
            </div>
          </div>


          {(display.fund && <><div
            className="flex-row"
            style={{
              padding: "0px 0 0 0",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            <div className='flex-row' style={{fontSize: '13px', justifyContent: isMobile ? "center" : "space-between", alignItems: 'center', gap: '0.75rem', margin: '20px 0', flexWrap: 'wrap', width: '100%'}}>
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.creator_fund == 100 ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '185px' : '180px', color: userFunding?.active_cron && userFunding?.creator_fund == 100 ? '#000' : '#cde'}} onClick={() => {setFundingSchedule('standard')}}>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{fontSize: '15px', fontWeight: '700', margin: '0 0 5px 0'}}>Standard</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
                  <Impact size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 100 ? '#147' : '#5af'} />
                  <div>Creator</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>100%</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
                  <IoBuild size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 100 ? '#147' : '#5af'} />
                  <div>Dev</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>0%</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
                  <IoIosRocket size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 100 ? '#147' : '#5af'} />
                  <div>Growth</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>0%</div>
                </div>
                <div className='flex-row' style={{margin: '5px 0 0 0', color: userFunding?.active_cron && userFunding?.creator_fund == 100 ? '#111' : "#9df", fontSize: '11px'}}>
                  <div>1.0x Score Boost</div>
                </div>
              </div>
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.creator_fund == 80 ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '185px' : '180px', color: userFunding?.active_cron && userFunding?.creator_fund == 80 ? '#000' : '#cde'}} onClick={() => {setFundingSchedule('optimized')}}>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{fontSize: '15px', fontWeight: '700', margin: '0 0 5px 0'}}>Optimized</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <Impact size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 80 ? '#147' : '#5af'} />
                  <div>Creator</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>80%</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <IoBuild size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 80 ? '#147' : '#5af'} />
                  <div>Dev</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>10%</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <IoIosRocket size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 80 ? '#147' : '#5af'} />
                  <div>Growth</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>10%</div>
                </div>
                <div className='flex-row' style={{margin: '5px 0 0 0', color: userFunding?.active_cron && userFunding?.creator_fund == 80 ? '#111' : "#9df", fontSize: '11px'}}>
                  <div>1.25x Score Boost</div>
                </div>
              </div>
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.creator_fund == 60 ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '185px' : '180px', color: userFunding?.active_cron && userFunding?.creator_fund == 60 ? '#000' : '#cde'}} onClick={() => {setFundingSchedule('accelerated')}}>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{fontSize: '15px', fontWeight: '700', margin: '0 0 5px 0'}}>Accelerated</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <Impact size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 60 ? '#147' : '#5af'} />
                  <div>Creator</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>60%</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <IoBuild size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 60 ? '#147' : '#5af'} />
                  <div>Dev</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>20%</div>
                </div>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <IoIosRocket size={15} color={userFunding?.active_cron && userFunding?.creator_fund == 60 ? '#147' : '#5af'} />
                  <div>Growth</div>
                  <div style={{fontSize: '14px', fontWeight: '700'}}>20%</div>
                </div>
                <div className='flex-row' style={{margin: '5px 0 0 0', color: userFunding?.active_cron && userFunding?.creator_fund == 60 ? '#111' : "#9df", fontSize: '11px'}}>
                  <div>1.33x Score Boost</div>
                </div>
              </div>
              
            </div>


            <div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              textAlign: 'center',
              fontSize: isMobile ? "12px" : "14px",
              padding: "10px 10px 15px 10px",
              justifyContent: "center",
            }}
          >
            How it works: Auto-Fund automatically distributes your leftover $degen and $ham allowances before allowances reset to Impact Fund based on your preference.
          </div>


            <ItemWrap bgColor={'#002244ee'} brdr={'0px'}>
              <Item
                {...{
                  icon: Impact,
                  text: "Creator Fund",
                  description:
                    `Rewards builders & creators on Farcaster based on their contribution to the ecosystem (impact = profit). 90% of funds go to creators and 10% to curators`,
                }}
              />
            </ItemWrap>


            <ItemWrap bgColor={'#002244ee'} brdr={'0px'}>
              <Item
                {...{
                  icon: IoBuild,
                  text: "Development Fund",
                  description: `Helps offset some of the costs of full-time work on Impact Alpha, and the broader vision of creating a new economic paradigm. Since the project is open source those who contribute to its development can also be rewarded through this fund`,
                }}
              />
            </ItemWrap>

            <ItemWrap bgColor={'#002244ee'} brdr={'0px'}>
              <Item
                {...{
                  icon: IoIosRocket,
                  text: "Growth Fund",
                  description:
                    `Adds incentives and rewards to those who curate, contribute and spread the word about Impact Alpha while the system gets to the scale where it can operate self-sustainably`,
                }}
              />
            </ItemWrap>

          </div></>)}
        </div>
      </div>

















      {/* CURATION */}

      <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>


        <div
          id="curation"
          style={{
            padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
            width: "40%",
          }}
        ></div>

        <div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }}
        >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }}
          >
            <FaStar style={{ fill: "#cde" }} size={27} onClick={() => {
              toggleMenu("curation");
            }} />
              <div onClick={() => {
                toggleMenu("curation");
              }}>
              <Description
                {...{
                  show: true,
                  text: "Curation",
                  padding: "4px 0 4px 10px",
                  size: "large",
                }}
              />
            </div>
            <div
              className="flex-row"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                toggleMenu("curation");
              }}
            >
              {/* <Item {...{ text: "How it works" }} /> */}
              <FaAngleDown
                size={28} color={"#cde"}
                style={{
                  margin: "5px 15px 5px 5px",
                  transform: display.curation
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>
          </div>


          <div
              className={isMobile ? "flex-col" : "flex-row"}
              style={{
                margin: isMobile ? '10px 0 0 0' : "0",
                gap: isMobile ? "0.1rem" : "0.25rem",
                alignItems: "center",
                justifyContent: 'center'
              }}
            >
              <div
                className="flex-row"
                style={{ alignItems: "center", gap: "0.5rem" }}
              >
                <Actions size={20} color={"#9cf"} />
                <div
                  style={{
                    fontSize: isMobile ? "13px" : "15px",
                    fontWeight: "500",
                    color: "#ace",
                  }}
                >
                  Cast Actions:
                </div>
              </div>
              <div
                className="flex-row"
                style={{
                  gap: "0.5rem",
                  margin: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isLogged ? (
                  <a
                    className=""
                    title={`$IMPACT Console`}
                    href={`https://warpcast.com/~/add-cast-action?name=%24IMPACT+Console&icon=star&actionType=post&postUrl=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Faction%2Fstatus%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div
                      className="flex-row cast-act-lt"
                      style={{
                        borderRadius: "8px",
                        padding: "5px 5px",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FaRegStar size={14} />
                      <p
                        style={{
                          padding: "0px",
                          fontSize: "12px",
                          fontWeight: "500",
                          textWrap: "nowrap",
                        }}
                      >
                        $IMPACT Console
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className={`flex-row`} onClick={LoginPopup}>
                    <div>
                      <div
                        className="flex-row cast-act-lt"
                        style={{
                          borderRadius: "8px",
                          padding: "5px 5px",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.25rem",
                          backgroundColor: "#bbb",
                        }}
                      >
                        <FaRegStar size={14} />
                        <p
                          style={{
                            padding: "0px",
                            fontSize: "12px",
                            fontWeight: "500",
                            textWrap: "nowrap",
                            color: "#222",
                          }}
                        >
                          $IMPACT Console
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        position: "relative",
                        fontSize: "0",
                        width: "0",
                        height: "100%",
                      }}
                    >
                      <div
                        className="top-layer"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <FaLock size={8} color="#999" />
                      </div>
                    </div>
                  </div>
                )}

                {isLogged ? (
                  <a
                    className=""
                    title={`+1 $IMPACT`}
                    href={`https://warpcast.com/~/add-cast-action?name=%2B1+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div
                      className="flex-row cast-act-lt"
                      style={{
                        borderRadius: "8px",
                        padding: "5px 5px",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FaRegStar size={14} />
                      <p
                        style={{
                          padding: "0px",
                          fontSize: "12px",
                          fontWeight: "500",
                          textWrap: "nowrap",
                        }}
                      >
                        +1 $IMPACT
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className={`flex-row`} onClick={LoginPopup}>
                    <div>
                      <div
                        className="flex-row cast-act-lt"
                        style={{
                          borderRadius: "8px",
                          padding: "5px 5px",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.25rem",
                          backgroundColor: "#bbb",
                        }}
                      >
                        <FaRegStar size={14} />
                        <p
                          style={{
                            padding: "0px",
                            fontSize: "12px",
                            fontWeight: "500",
                            textWrap: "nowrap",
                            color: "#222",
                          }}
                        >
                          +1 $IMPACT
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        position: "relative",
                        fontSize: "0",
                        width: "0",
                        height: "100%",
                      }}
                    >
                      <div
                        className="top-layer"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <FaLock size={8} color="#999" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>



          {!display.curation && (<div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "17px",
              padding: "10px 10px 15px 10px",
              justifyContent: "center",
              userSelect: 'none'
            }}
          >
            Explore your curation
          </div>)}





          {(display.curation && <><div
            className="flex-row"
            style={{
              padding: "0px 0 0 0",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >






            {/* <div className='flex-row' style={{padding: '10px 5px 20px 5px', flexWrap: 'wrap', minWidth: feedMax, gap: '0.5rem', justifyContent: 'center', maxWidth: textMax}}>
              {multitips?.length > 0 ? multitips.map((multitip, index) => { return (
                <Link className='btn-blu' key={index} href={`/~/studio/tip/${multitip?._id}`} style={{minWidth: isMobile ? '190px' : '190px'}}>
                  <div className='' style={{gap: '1.5rem'}}>
                    <div className='flex-row' style={{gap: '1rem', paddingBottom: '0px', justifyContent: 'flex-end'}}>

                      <div className='flex-row' style={{flexWrap: 'wrap'}}>
                        {(multitip?.text) && (<div className='curator-button-off' style={{fontSize: isMobile ? '8px' : '9px', border: '0px'}}>TIP: {multitip?.text}</div>)}
                        {(multitip?.createdAt) && (<div className='curator-button-off' style={{fontSize: isMobile ? '8px' : '9px', border: '0px'}}>{timePassed(multitip?.createdAt)}</div>)}
                        {(multitip) && (<div className='curator-button' style={{fontSize: isMobile ? '8px' : '9px', border: '1px solid #999'}} onClick={(event) => {shareFrame(event, multitip)}}><FiShare size={9} color={'#eff'} /></div>)}

                      </div>
                    </div>
                    <div style={{fontSize: isMobile ? '17px' : '18px', fontWeight: '500', color: '#eff'}}>{(multitip?.text) && (<div className='flex-row' style={{fontSize: isMobile ? '11px' : '12px', border: '0px', alignItems: 'center'}}>CURATOR: {multitip?.curators?.length > 0 && (multitip?.curators.map((curator, index) => (
                      (<Link key={index} href={`/~/ecosystems/${curator?.handle || 'abundance'}/curators/${curator?.username}`}><div className='filter-item' style={{fontSize: isMobile ? '11px' : '12px'}}>@{curator?.username}</div></Link>)
                    )))}</div>)}</div>
                  </div>
                </Link>
              )}) : (
                <>
                  {!loaded ? (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                    <Spinner size={31} color={'#468'} />
                  </div>) : (<div style={{fontSize: '20px', color: '#def'}}>No tips found</div>)}
                </>
              )}
            </div> */}




            {searchSelect == 'Curation' && (

            <div className={'flex-row'} style={{justifyContent: 'center', marginTop: '15px', marginBottom: '30px', gap: isMobile ? '0.15rem' : '0.15rem', flexWrap: 'wrap'}}>
              {/* <div className='flex-row' style={{gap: '0.5rem'}}>
                <TopPicks handleSelection={handleSelection} selection={'picks'} />
                <Shuffle handleSelect={handleSelect} selection={'shuffle'} userQuery={userQuery} />
              </div>

              <Time handleSelection={handleSelection} handleSelect={handleSelect} userQuery={userQuery} options={queryOptions.time} selection={'time'} isSelected={isSelected} isMobile={isMobile} btnText={btnText} /> */}



              <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
                <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#002244ee', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
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
                <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#002244ee', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
                  <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>TIME</div>

                  <div className={timeframe == '24h' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('24h')}}>24hr</div>
                  <div className={timeframe == '3d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('3d')}}>3d</div>
                  <div className={timeframe == '7d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('7d')}}>7d</div>
                  <div className={timeframe == '30d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('30d')}}>30d</div>
                  <div className={timeframe == 'all' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('all')}}>all</div>
                </div>
              </div>


              <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '20px 0'}}>
                <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#002244ee', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
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

            <div style={{margin: '0 0 20px 0'}}>
              {(!userFeed) ? (
              <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                <Spinner size={31} color={'#468'} />
              </div>
              ) : (userFeed?.length == 0 ? (<div style={{fontSize: '20px', color: '#def'}}>No casts found</div>) : userFeed.map((cast, index) => (<Cast {...{cast, key: index, index, updateCast, openImagePopup, ecosystem: eco?.ecosystem_points_name, handle: eco?.ecosystem_handle, self: false, app}} />)))}
              {!delay && !shuffled && userFeed?.length !== 0 && (
                <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                  <Spinner size={31} color={'#468'} />
                </div>
              )}
            </div>
            {!delay && (<div ref={ref}>&nbsp;</div>)}



          </div></>)}
        </div>
      </div>



      {/* MULTI-TIPS */}

      <div style={{ padding: "0px 4px 80px 4px", width: feedMax }}>


        <div
          id="multitip"
          style={{
            padding: isMobile ? "28px 0 20px 0" : "28px 0 20px 0",
            width: "40%",
          }}
        ></div>

        <div
          style={{
            padding: "8px",
            backgroundColor: "#11448888",
            borderRadius: "15px",
            border: "1px solid #11447799",
          }}
        >
          <div
            className="flex-row"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0 0 0",
            }}
          >
            <FaCoins style={{ fill: "#cde" }} size={27} onClick={() => {
                toggleMenu("multitip");
              }}/>
            <div onClick={() => {
                toggleMenu("multitip");
              }}>
            <Description
              {...{
                show: true,
                text: "Multi-Tips",
                padding: "4px 0 4px 10px",
                size: "large",
              }}
            />
            </div>
              <div
                className="flex-row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => {
                  toggleMenu("multitip");
                }}
              >
                {/* <Item {...{ text: "How it works" }} /> */}
                <FaAngleDown
                  size={28} color={"#cde"}
                  style={{
                    margin: "5px 15px 5px 5px",
                    transform: display.multitip
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
          </div>

          <div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "17px",
              padding: "10px 10px 15px 10px",
              justifyContent: "center",
              userSelect: 'none'
            }}
          >
            Share your latest multi-tipping
          </div>

          {(display.multitip && <>
            {loading.multitip ? (
            <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
              <Spinner size={31} color={'#468'} />
            </div>
          ) : (<div
            className="flex-row"
            style={{
              padding: "0px 0 0 0",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >







            <div className='flex-row' style={{padding: '10px 5px 20px 5px', flexWrap: 'wrap', minWidth: feedMax, gap: '0.5rem', justifyContent: 'center', maxWidth: textMax}}>
              {multitips?.length > 0 ? multitips.map((multitip, index) => { return (
                <Link className='btn-blu' key={index} href={`/~/studio/tip/${multitip?._id}`} style={{minWidth: isMobile ? '190px' : '190px'}}>
                  <div className='' style={{gap: '1.5rem'}}>
                    <div className='flex-row' style={{gap: '1rem', paddingBottom: '0px', justifyContent: 'flex-end'}}>

                      <div className='flex-row' style={{flexWrap: 'wrap'}}>
                        {(multitip?.text) && (<div className='curator-button-off' style={{fontSize: isMobile ? '8px' : '9px', border: '0px'}}>TIP: {multitip?.text}</div>)}
                        {(multitip?.createdAt) && (<div className='curator-button-off' style={{fontSize: isMobile ? '8px' : '9px', border: '0px'}}>{timePassed(multitip?.createdAt)}</div>)}
                        {(multitip) && (<div className='curator-button' style={{fontSize: isMobile ? '8px' : '9px', border: '1px solid #999'}} onClick={(event) => {shareFrame(event, multitip)}}><FiShare size={9} color={'#eff'} /></div>)}

                      </div>
                    </div>
                    <div style={{fontSize: isMobile ? '17px' : '18px', fontWeight: '500', color: '#eff'}}>{(multitip?.text) && (<div className='flex-row' style={{fontSize: isMobile ? '11px' : '12px', border: '0px', alignItems: 'center'}}>CURATOR: {multitip?.curators?.length > 0 && (multitip?.curators.map((curator, index) => (
                      (<Link key={index} href={`/~/ecosystems/${curator?.handle || 'abundance'}/curators/${curator?.username}`}><div className='filter-item' style={{fontSize: isMobile ? '11px' : '12px'}}>@{curator?.username}</div></Link>)
                    )))}</div>)}</div>
                  </div>
                </Link>
              )}) : (
                <>
                  {!loaded ? (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
                    <Spinner size={31} color={'#468'} />
                  </div>) : (<div style={{fontSize: '20px', color: '#def'}}>No tips found</div>)}
                </>
              )}
            </div>
          </div>)}
          </>)}
        </div>
      </div>




      <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
      <Modal modal={modal} />
    </div>
  );
}