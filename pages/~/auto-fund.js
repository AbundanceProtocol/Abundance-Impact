import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import Link from 'next/link'
import axios from 'axios';
import Head from 'next/head';
// import { AiOutlineBars } from "react-icons/ai";
import { useInView } from 'react-intersection-observer'
import { BsLightningChargeFill as Impact } from "react-icons/bs";
import Item from '../../components/Ecosystem/ItemWrap/Item';
import Description from '../../components/Ecosystem/Description';
import ItemWrap from '../../components/Ecosystem/ItemWrap';
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { FaLock, FaFire, FaGlobe, FaRegStar, FaAngleDown, FaShareAlt as Share, FaCode, FaSearch, FaUsers } from "react-icons/fa";
import { PiSquaresFourLight as Actions, PiClockClockwiseBold as ClockForward, PiClockCounterClockwiseBold as ClockBack, PiBankFill } from "react-icons/pi";
import { GrSchedulePlay as Sched } from "react-icons/gr";
import { GiRibbonMedal as Medal } from "react-icons/gi";
import { IoShuffleOutline as ShuffleIcon, IoBuild, IoCloseCircle, IoLogIn } from "react-icons/io5";
import { BiGift } from "react-icons/bi";
import { FaStar, FaCoins } from "react-icons/fa6";
import { IoIosRocket, IoMdTrophy, IoMdRefresh as Refresh} from "react-icons/io";
import { BsPiggyBankFill, BsQuestionCircle } from 'react-icons/bs';
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
import { Logo, Degen } from '../assets'
import qs from "querystring";
// import ScoreDashboard from '../../components/Common/ScoreDashboard';
import Modal from '../../components/Layout/Modals/Modal';

const version = process.env.NEXT_PUBLIC_VERSION

export default function Autofund() {
  const router = useRouter();
  const [ref, inView] = useInView()
  const { ecosystem, username, app, userFid, pass } = router.query
  const [user, setUser] = useState(null)
  const { LoginPopup, isLogged, showLogin, setShowLogin, setPoints, setIsLogged, setFid, miniApp, setMiniApp, fid, ecoData, isMiniApp, setIsMiniApp, userBalances, setUserBalances } = useContext(AccountContext)
  const ref1 = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Curation', 'Casts', 'Casts + Replies']
  const [searchSelect, setSearchSelect ] = useState('Curation')
  const { isMobile } = useMatchBreakpoints();
  const [display, setDisplay] = useState({fund: false, ecosystem: false, multitip: false, promotion: false, curation: false, score: false, distribution: false, rewards: false, autoFund: true, invites: false})
  const [isOn, setIsOn] = useState(false);
  const [scoreTime , setScoreTime ] = useState('all');
  const [scoreLoading , setScoreLoading ] = useState(false);
  const [fundLoading , setFundLoading ] = useState(true);
  const [userFeed, setUserFeed] = useState(null)
  const [distLoading, setDistLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [channelData, setChannelData] = useState([])
  const [curatorData, setCuratorData] = useState([])
  const [invites, setInvites] = useState([])
  const [channelsLength, setChannelsLength] = useState(0)
  const [curatorsLength, setCuratorsLength] = useState(0)
  const [fundSearch, setFundSearch] = useState('Curators')
  const [curatorList, setCuratorList] = useState([])
  const [funds, setFunds] = useState({curatorDegen: 0, curatorHam: 0, fundDegen: 0, fundHam: 0})
  const [distribution, setDistribution] = useState(null)
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
  const [impactFunds, setImpactFunds] = useState(null)
  const [creatorRewards, setCreatorRewards] = useState(null)
  const [creatorLoading, setCreatorLoading] = useState(true)
  const [dailyRewards, setDailyRewards] = useState(null)
  const [dailyLoading, setDailyLoading] = useState(true)
  const [totalClaims, setTotalClaims] = useState(0)
  const [claimsLoading, setClaimsLoading] = useState(true)
  const [fundToggle, setFundToggle] = useState(true)
  const [seasonToggle, setSeasonToggle] = useState('s7') // update season 5/15
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
  const [loading, setLoading] = useState({fund: true, ecosystem: true, multitip: true, promotion: true, curation: true, score: true, invites: true});
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
        const profile = response?.data?.data || null
        // const profile = response?.data?.data?.Socials?.Social[0] || null
        console.log('profile', profile)
        const populatedProfile = {
          // username: profile?.profileName,
          username: profile?.username,
          // pfp: {
          //   url: profile?.profileImage,
          // },
          pfp: {
            url: profile?.pfp?.url,
          },
          // displayName: profile?.profileDisplayName,
          displayName: profile?.displayName,
          // activeOnFcNetwork: true,
          activeOnFcNetwork: true,
          // profile: { bio: { text: profile?.profileBio } },
          profile: { bio: { text: profile?.profile?.bio?.text || "" } },
          followingCount: profile?.followingCount,
          followerCount: profile?.followerCount,
          fid: Number(profile?.fid)
        }
        console.log('populatedProfile', populatedProfile)
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
    console.log('1')
    if (!display[target]) {
      if (target == "score" && fid && !userScore) {
        setScoreLoading(true)
        getScores(fid, scoreTime || 'all')
      } else if (target == "multitip" && fid && multitips?.length == 0) {
        getTips(fid)
      } else if (target == 'distribution' && fid) {
        console.log('2')
        getDistribution(fid)
      } else if (target == 'invites' && fid) {
        console.log('2')
        getInvites(fid)
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




  async function getInvites(fid) {
    setLoading(prev => ({...prev, invites: true }))
    setDistLoading(true)
    try {
      const response = await axios.get('/api/curation/getInvites', {
        params: { fid } })
        console.log('getInvites', response)
      if (response?.data) {
        const userInvites = response?.data?.data || []
        setInvites(userInvites)
        // const funds = distData?.funds || []
        // let curatorDegen = 0
        // let curatorHam = 0
        // let fundDegen = 0
        // let fundHam = 0
        // for (const fund of funds) {
        //   if (fund?.curators?.length == 0) {
        //     fundDegen += fund?.degen_total
        //     fundHam += fund?.ham_total
        //   } else {
        //     curatorDegen += fund?.degen_total
        //     curatorHam += fund?.ham_total
        //   }
        // }
        // setFunds({curatorDegen, curatorHam, fundDegen, fundHam})
        
        // setDistribution(distData)
      } else {
        setInvites([])

        // setDistribution([])
      }
      // setDistLoading(false)
      setLoading(prev => ({...prev, invites: false }))
      // setLoaded(true)
    } catch (error) {
      console.error('Error submitting data:', error)
      // setLoaded(true)
      setLoading(prev => ({...prev, invites: false }))
      // setDistribution([])
      // setDistLoading(false)
    }
  }



  async function getDistribution(fid) {
    setLoading(prev => ({...prev, distribution: true }))
    setDistLoading(true)
    try {
      const response = await axios.get('/api/fund/getDistribution', {
        params: { fid } })
      if (response?.data) {
        const distData = response?.data
        console.log('distData', distData)
        const funds = distData?.funds || []
        let curatorDegen = 0
        let curatorHam = 0
        let fundDegen = 0
        let fundHam = 0
        for (const fund of funds) {
          if (fund?.curators?.length == 0) {
            fundDegen += fund?.degen_total
            fundHam += fund?.ham_total
          } else {
            curatorDegen += fund?.degen_total
            curatorHam += fund?.ham_total
          }
        }
        setFunds({curatorDegen, curatorHam, fundDegen, fundHam})
        
        setDistribution(distData)
      } else {
        setDistribution([])
      }
      setDistLoading(false)
      setLoading(prev => ({...prev, distribution: false }))
      // setLoaded(true)
    } catch (error) {
      console.error('Error submitting data:', error)
      // setLoaded(true)
      setLoading(prev => ({...prev, distribution: false }))
      setDistribution([])
      setDistLoading(false)
    }
  }








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
      getSched(fid)
      getFunds(fid)
      getCreatorRewards(fid)
      getDailyRewards(fid)
      getTotalClaims(fid)
      getCuratorData(fid)
      setUserQuery({
        ...userQuery,
        curators: [fid]
      })
    }

  }, [fid]);





  useEffect(() => {
    if (userBalances.impact == 0) {
      (async () => {
        const { sdk } = await import('@farcaster/miniapp-sdk');
    
        const isMiniApp = await sdk.isInMiniApp()
        setIsMiniApp(isMiniApp)
        console.log('isMiniApp1', isMiniApp)
  
        const userProfile = await sdk.context
  
        console.log(userProfile?.user?.fid)
  
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
        console.log(`User is valid: ${isValidUser}`);
        console.log(isValidUser)
        if (isValidUser) {
          setIsLogged(true)
          setFid(Number(userProfile?.user?.fid))
          setUserInfo({
            pfp: userProfile?.user?.pfp?.url || null,
            username: userProfile?.user?.username || null,
            display: userProfile?.user?.displayName || null,
          })
        }    
  
        sdk.actions.ready()
  
        if (isValidUser && !(userBalances?.impact > 0) ) {
          const {impact, qdau} = await getUserBalance(userProfile?.user?.fid)
          console.log('userBalance', impact)
          setUserBalances(prev => ({ ...prev, impact, qdau }))
        }  
  
      })();
    }
  }, []);












  async function getCreatorRewards(fid) {
    try {
      const response = await axios.get('/api/fund/getCreatorRewards', {
        params: { fid }
      })
      if (response?.data?.data) {
        setCreatorRewards(response?.data?.data)
        console.log('getCreatorRewards', response?.data?.data)
      } else {
        setCreatorRewards(null)
      }
      setCreatorLoading(false)
    } catch (error) {
      console.error('Error submitting data:', error)
      setCreatorLoading(false)
    }
  }

  async function updateChannels(text, more) {
    setCuratorData([])
    setCuratorsLength(0)
    if (text?.length > 0) {
      try {
        const response = await axios.get('/api/curation/getChannels', {
          params: { channel: text, more }
        })
        const sortedData = response?.data?.data.sort((a, b) => a.channelId.localeCompare(b.channelId));
        setChannelData(sortedData);
        setChannelsLength(response?.data?.length)
        // setChannelData(response?.data?.data)
        console.log('response', response?.data?.data)
      } catch (error) {
        console.error('Error submitting data:', error)
        // setUser(null)
        setChannelData([])
        setChannelsLength(0)
      }
    } else {
      setChannelData([])
      setChannelsLength(0)
    }
  }

  async function updateCurators(text, more) {
    setChannelData([])
    setChannelsLength(0)
    if (text?.length > 0) {
      try {
        const response = await axios.get('/api/curation/getCurators', {
          params: { name: text, more }
        })
        const sortedData = response?.data?.users.sort((a, b) => a.username.localeCompare(b.username));
        setCuratorData(sortedData);
        setCuratorsLength(response?.data?.length)
        // setChannelData(response?.data?.data)
        console.log('response', response?.data?.users)
      } catch (error) {
        console.error('Error submitting data:', error)
        // setUser(null)
        setCuratorData([])
        setCuratorsLength(0)
      }
    } else {
      setCuratorData([])
      setCuratorsLength(0)
    }
  }

  async function getInput(text, more) {
    console.log(text)
    setSearchInput(text)
    if (text.length < 3) {
      setTimeout(() => {
        console.log('Second delay for short text');
      }, 20000);
    }
    if (text.length > 0 && fundSearch == 'Channels') {
      updateChannels(text, more)
    } else if (text.length > 0 && fundSearch == 'Curators') {
      updateCurators(text, more)
    } else {
      setChannelData([])
      setChannelsLength(0)
      setCuratorData([])
      setCuratorsLength(0)
    }
  }


  async function updateSchedule(data, search) {
    setChannelData([])
    setChannelsLength(0)
    setCuratorData([])
    setCuratorsLength(0)
    setSearchInput('')

    if (search == 'Channels') {
      const channelIncluded = userFunding.search_channels.includes(data);
      if (channelIncluded) {
        setFundingSchedule('remove-channel', data)
      } else {
        setFundingSchedule('add-channel', data)
      }
    } else if (search == 'Curators') {
      const curatorIncluded = userFunding.search_curators.includes(data);
      if (curatorIncluded) {
        setFundingSchedule('remove-curator', data)
      } else {
        setFundingSchedule('add-curator', data)
      }
    }
  }
  
  async function getTotalClaims(fid) {
    try {
      const response = await axios.get('/api/fund/getTotalClaims', {
        params: { fid }
      })
      console.log('getTotalClaims1', response)
      if (response?.data?.data) {
        setTotalClaims(response?.data?.data)
        console.log('getTotalClaims2', response?.data?.data)
      } else {
        setTotalClaims(0)
      }
      setClaimsLoading(false)

    } catch (error) {
      console.error('Error submitting data:', error)
      setClaimsLoading(false)
    }
  }


  async function getDailyRewards(fid) {
    try {
      const response = await axios.get('/api/fund/getDailyRewards', {
        params: { fid }
      })
      if (response?.data?.data) {
        setDailyRewards(response?.data?.data)
        console.log('getDailyRewards', response?.data?.data)
      } else {
        setDailyRewards(null)
      }
      setDailyLoading(false)

    } catch (error) {
      console.error('Error submitting data:', error)
      setDailyLoading(false)
    }
  }


  async function getFunds(fid) {
    try {
      const response = await axios.get('/api/fund/getFunds', {
        params: { fid }
      })
      if (response?.data) {
        setImpactFunds(response?.data)
        console.log('getFunds', response?.data)
      } else {
        setImpactFunds(null)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      // setFundLoading(false)
    }
  }


  async function getSched(fid) {
    try {
      const response = await axios.get('/api/fund/getSched', {
        params: { fid }
      })
      if (response?.data) {
        const fundingData = response?.data?.schedule || null
        console.log('fundingData', response?.data)
        if (fundingData) {
          setUserFunding(fundingData)
          setCuratorList(response?.data?.curators)

          if (fundingData.active_cron) {
            setIsOn(true)
          } else {
            setIsOn(false)
          }
        } else {
          setUserFunding(null)
          setCuratorList([])
        }
      } else {
        setUserFunding(null)
        setCuratorList([])
      }
      setFundLoading(false)
      // setLoading(prev => ({...prev, score: false }))
      // setScoreLoading(false)
    } catch (error) {
      console.error('Error submitting data:', error)
      setUserFunding(null)
      setCuratorList([])
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



  function claimReward(event, reward) {

    event.preventDefault();
    let shareUrl = `https://impact.abundance.id/~/ecosystems/abundance/daily-v1?${qs.stringify({
      id: reward?._id,
    })}`;
    let shareText = `I just claimed ${reward?.degen_total} $degen in Impact Rewards for contributing to /impact (frame by @abundance)\n\n/impact gives out daily rewards to those who curate, auto-fund or invite contributors to use Impact Alpha. Check your reward here 👇`

    let encodedShareText = encodeURIComponent(shareText)
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

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
    let shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

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
  }


  function updateSearch(search) {
    console.log('search', search)
    setChannelData([])
    setChannelsLength(0)
    setCuratorData([])
    setCuratorsLength(0)
    setSearchInput('')
    setFundSearch(search)
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

  async function setFundingSchedule(schedule, data) {
    setFundLoading(true)
    try {
      console.log(fid, schedule)
      const response = await axios.post('/api/fund/postSchedule', { fid, schedule, data });
      if (response?.data) {
        console.log('response', response?.data)
        setUserFunding(response?.data?.updatedSchedule)
        setCuratorList(response?.data?.curators)
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
        setCuratorList([])
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
      if (isLogged) {
        console.log('isOn', isOn)
        if (isOn) {
          setFundingSchedule('off')
        } else {
          setDisplay(prev => ({...prev, ['fund']: true }))
          setFundingSchedule('on')
        }
      } else {
        LoginPopup()
      }
    };
  
    return (
      <div className="flex-row" style={{justifyContent: 'center', alignItems: 'center', margin: '0 5px 0 0'}}>

        {fundLoading && (<div className='flex-row' style={{height: '20px', alignItems: 'center', width: '20px', justifyContent: 'center', padding: '0px', position: 'relative', right: '10%', top: '0px'}}>
          <Spinner size={20} color={'#468'} />
        </div>)}


        <div
          className={`toggleSwitch ${isOn ? "toggleSwitch-on" : ""}`}
          onClick={handleToggle}
        >
          <span className='circle'></span>
        </div>
      </div>

    );
  }


  const FundPanel = ({fundName, fundData}) => {
    let userDegen = 0
    let totalDegen = 0
    let userHam = 0
    let totalHam = 0

    let totalIndex = 0
    let userIndex = 0

    let degenKey = 'creator_degen'
    let hamKey = 'creator_ham'
    if (fundName == 'Creator Fund') {
      degenKey = 'creator_degen'
      hamKey = 'creator_ham'      
    } else if (fundName == 'Dev Fund') {
      degenKey = 'dev_degen'
      hamKey = 'dev_ham'         
    } else if (fundName == 'Growth Fund') {
      degenKey = 'growth_degen'
      hamKey = 'growth_ham'   
    } else if (fundName == 'Special Fund') {
      degenKey = 'special_degen'
      hamKey = 'special_ham'   
    }

    if (seasonToggle == 's1') {
      totalIndex = fundData?.totalFunds?.findIndex(data => data._id === 1);
      userIndex = fundData?.userFunds?.findIndex(data => data._id === 1);
    } else if (seasonToggle == 's2') {
      totalIndex = fundData?.totalFunds?.findIndex(data => data._id === 2);
      userIndex = fundData?.userFunds?.findIndex(data => data._id === 2);
    } else if (seasonToggle == 's3') {
      totalIndex = fundData?.totalFunds?.findIndex(data => data._id === 3);
      userIndex = fundData?.userFunds?.findIndex(data => data._id === 3);
    } else if (seasonToggle == 's4') {
      totalIndex = fundData?.totalFunds?.findIndex(data => data._id === 4);
      userIndex = fundData?.userFunds?.findIndex(data => data._id === 4);
    } else if (seasonToggle == 's5') {
      totalIndex = fundData?.totalFunds?.findIndex(data => data._id === 5);
      userIndex = fundData?.userFunds?.findIndex(data => data._id === 5);
    } else if (seasonToggle == 's6') {
      totalIndex = fundData?.totalFunds?.findIndex(data => data._id === 6);
      userIndex = fundData?.userFunds?.findIndex(data => data._id === 6);
    } else if (seasonToggle == 's7') {
      totalIndex = fundData?.totalFunds?.findIndex(data => data._id === 7);
      userIndex = fundData?.userFunds?.findIndex(data => data._id === 7);
    } // update season 5/15

    if (seasonToggle == 'all') {
      for (const fund of fundData.userFunds) {
        userDegen += fund?.[degenKey]
        userHam += fund?.[hamKey]
      }
      for (const fund of fundData.totalFunds) {
        totalDegen += fund?.[degenKey]
        totalHam += fund?.[hamKey]
      }
    } else {
      userDegen = fundData?.userFunds?.[userIndex]?.[degenKey] ?? null
      totalDegen = fundData?.totalFunds?.[totalIndex]?.[degenKey] ?? null
      userHam = fundData?.userFunds?.[userIndex]?.[hamKey] ?? null
      totalHam = fundData?.totalFunds?.[totalIndex]?.[hamKey] ?? null
    }
  
    return (
      <div className={`flex-col btn-select blu-drk shadow`} style={{minWidth: isMobile ? '135px' : '130px', color: '#cde', height: '133px', width: '22%', cursor: 'default'}}>
        <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
          <div style={{fontSize: '15px', fontWeight: '700', margin: '0 0 5px 0', color: '#44aaff'}}>{fundName}</div>
        </div>
        <div className='flex-col' style={{justifyContent: "center", alignItems: 'center', gap: '0.25rem'}}>
          <div style={{fontSize: '16px', fontWeight: '700'}}>{fundToggle ? formatNum(totalDegen || 0) || '--' : formatNum(userDegen || 0) || '--'}</div>
          <div style={{fontSize: '9px', fontWeight: '400', color: '#8cf'}}>$DEGEN</div>

          {/* <div style={{fontSize: '16px', fontWeight: '700', margin: '10px 0 0 0'}}>{fundToggle ? formatNum(totalHam || 0) || '--' : formatNum(userHam || 0) || '--'}</div>
          <div style={{fontSize: '9px', fontWeight: '400', color: '#8cf'}}>$HAM</div> */}
        </div>
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


      <Head>
        <meta
          name="fc:frame"
          content='{"version":"next","imageUrl":"https://impact.abundance.id/images/icon-02.png","button":{"title":"Auto-fund $TIPN","action":{"type":"launch_frame","name":"Auto-fund $TIPN","url":"https://impact.abundance.id/~/auto-fund","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}'
        />

        {/* Mini App specific metadata */}
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Auto-fund $TIPN" />
        <meta
          name="fc:miniapp:description"
          content="Get boosted and rewarded for your impact on Farcaster"
        />
        <meta
          name="fc:miniapp:icon"
          content="https://impact.abundance.id/images/icon-02.png"
        />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id/~/auto-fund" />
      </Head>


      {/* <div className="" style={{padding: '58px 0 0 0'}}>
      </div> */}

      {(!isLogged || version == '1.0' || version == '2.0') && (
      <div id="log in"
      style={{
        padding: isMobile ? (version == '1.0' ? "58px 0 20px 0" : "48px 0 20px 0") : "58px 0 60px 0",
        width: feedMax, fontSize: '0px'
      }} >&nnsp;

      </div>
    )}



      {/* {user && (<CuratorData {...{ show: (isLogged && user), user, textMax, type: 'curator' }} />)} */}




      {/* AUTO FUND */}


      <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>












{(version == '1.0' || version == '2.0') && (<div className='flex-col' style={{backgroundColor: ''}}>

<div className='shadow flex-col'
  style={{
    backgroundColor: isLogged ? "#002244" : '#333',
    borderRadius: "15px",
    border: isLogged ? "1px solid #11447799" : "1px solid #555",
    width: isMiniApp || isMobile ? '340px' : '100%',
    margin: isMiniApp || isMobile ? '0px auto 0 auto' : '0px auto 0 auto',
  }} >
  <div
    className="shadow flex-row"
    style={{
      backgroundColor: isLogged ? "#11448888" : "#444",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px", 
      borderRadius: "15px",
      margin: '0 0 10px 0',
      gap: '1rem'

    }}
  >


    <div
      className="flex-row"
      style={{
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "0px 0 0 4px",
        margin: '0 0 0px 0'
      }} >


    
      <BsPiggyBankFill style={{ fill: "#cde" }} size={20} />
      <div>


        <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
          <div className="top-layer flex-row">
            <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
              <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                Auto-fund
              </div>
            </div>
          </div>
        </div>
      </div>


      <div
        className="flex-row"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }} >

      </div>
    </div>

    <ToggleSwitch target={'autoFund'} />
  </div>






  <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>


          {(display.autoFund && <><div
            className="flex-row"
            style={{
              padding: "0px 0 0 0",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >





          <div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "16px",
              padding: "20px 10px 0px 10px",
              justifyContent: "center",
              userSelect: 'none',
              fontWeight: '600'
            }}
          >
            Coins to tip:
          </div>


            <div className='flex-row' style={{fontSize: '13px', justifyContent: isMobile ? "center" : "space-between", alignItems: 'center', gap: '0.75rem', margin: '20px 0', flexWrap: 'wrap', width: '60%'}}>
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.currencies?.includes('$DEGEN') ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '30%' : '30%', color: userFunding?.active_cron && userFunding?.currencies?.includes('$DEGEN') ? '#000' : '#cde', height: '33px'}} onClick={() => {setFundingSchedule(userFunding?.currencies?.includes('$DEGEN') ? 'degen-off' : 'degen-on')}}>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{fontSize: '15px', fontWeight: '700', margin: '5px 0 5px 0'}}>$DEGEN</div>
                </div>
              </div>
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.currencies?.includes('$TIPN') ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '30%' : '30%', color: userFunding?.active_cron && userFunding?.currencies?.includes('$TIPN') ? '#000' : '#cde', height: '33px'}} onClick={() => {setFundingSchedule(userFunding?.currencies?.includes('$TIPN') ? 'tipn-off' : 'tipn-on')}}>
                <div className='flex-row' style={{justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{fontSize: '15px', fontWeight: '700', margin: '5px 0 5px 0'}}>$TIPN</div>
                </div>
              </div>
            </div>





          <div
            className="flex-row"
            style={{
              color: "#9df",
              width: "100%",
              fontSize: isMobile ? "15px" : "16px",
              padding: "20px 10px 0px 10px",
              justifyContent: "center",
              userSelect: 'none',
              fontWeight: '600'
            }}
          >
            Overall allocation:
          </div>


            <div className='flex-row' style={{fontSize: '13px', justifyContent: isMobile ? "center" : "space-between", alignItems: 'center', gap: '0.75rem', margin: '20px 0', flexWrap: 'wrap', width: '100%'}}>
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.creator_fund == 100 ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '185px' : '180px', color: userFunding?.active_cron && userFunding?.creator_fund == 100 ? '#000' : '#cde', height: '133px'}} onClick={() => {setFundingSchedule('standard')}}>
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
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.creator_fund == 80 ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '185px' : '180px', color: userFunding?.active_cron && userFunding?.creator_fund == 80 ? '#000' : '#cde', height: '133px'}} onClick={() => {setFundingSchedule('optimized')}}>
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
              <div className={`flex-col btn-select ${userFunding?.active_cron && userFunding?.creator_fund == 60 ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{minWidth: isMobile ? '185px' : '180px', color: userFunding?.active_cron && userFunding?.creator_fund == 60 ? '#000' : '#cde', height: '133px'}} onClick={() => {setFundingSchedule('accelerated')}}>
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




            {userFunding?.creator_fund > 0 && (<div
              className="flex-row"
              style={{
                color: "#9df",
                width: "100%",
                fontSize: isMobile ? "15px" : "16px",
                padding: "20px 10px 10px 10px",
                justifyContent: "center",
                userSelect: 'none',
                fontWeight: '600'
              }}
            >
              Creator Fund allocation:
            </div>)}

            {userFunding?.creator_fund > 0 && (<div className='flex-row' style={{width: '100%', justifyContent: 'center', flexWrap: "wrap", color: '#024'}}>

              {(userFunding?.search_channels?.length == 0 && userFunding?.search_curators?.length == 0 && userFunding?.creator_fund > 0) ? (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}}>
                <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                  <div style={{display: 'flex', textAlign: 'center', fontSize: '16px', margin: '0', cursor: 'pointer', fontWeight: '600'}} onClick={() => {
                    getInput(searchInput, 'true')}}>&nbsp;Ecosystem-wide</div>
                </div>
              </div>) : userFunding?.search_channels?.length > 0 ? (<><div style={{fontSize: '15px', color: '#eff', fontWeight: '600', padding: '3px', margin: '7px 5px'}}>Channels:</div>{userFunding?.search_channels?.map((channel, index) => (
                (<div key={index} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}}>
                  <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                    {/* {channel?.imageUrl && (<img src={channel?.imageUrl} width={20} height={20} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)} */}
                    <div style={{display: 'flex', textAlign: 'center', fontSize: '15px', margin: '0', padding: '0 0 0 5px'}}>{channel ? `/${channel}` : ' channel not found'}</div>
                    <IoCloseCircle size={18} color={'#a00'} onClick={() => {
                      setFundingSchedule('remove-channel', channel)}} />
                  </div>
                </div>)
              ))}</>) : curatorList?.length > 0 ? (<><div style={{fontSize: '15px', color: '#eff', fontWeight: '600', padding: '3px', margin: '7px 5px'}}>Curators:</div>{curatorList?.map((curator, index) => (
                (<div key={index} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}}>
                  <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                    {curator?.pfp && (<img src={curator?.pfp} width={20} height={20} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
                    <div style={{display: 'flex', textAlign: 'center', fontSize: '15px', margin: '0', padding: curator?.pfp ? '0' : '0 0 0 5px'}}>{curator ? `@${curator?.username}` : ' curator not found'}</div>
                    <IoCloseCircle size={18} color={'#a00'} onClick={() => {
                      setFundingSchedule('remove-curator', curator?.fid)}} />
                  </div>
                </div>)
              ))}</>) : (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}}>
                <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                  <div style={{display: 'flex', textAlign: 'center', fontSize: '16px', margin: '0', cursor: 'pointer', fontWeight: '600'}} onClick={() => {
                    getInput(searchInput, 'true')}}>&nbsp;Ecosystem-wide</div>
                </div>
              </div>) }
            </div>)}




            {userFunding?.creator_fund > 0 && (<div className='flex-col' style={{height: '30px', alignItems: 'center', justifyContent: 'center', padding: '40px 0 30px 0', color: '#024'}}>
                <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#002244ee', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>

                  <FaSearch size={15} color={'#eff'} style={{margin: '0 2px 0 2px'}} />
                  {/* <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '12px' : '13px'}}>SEARCH</div> */}

                  <div className={fundSearch == 'Curators' ? 'filter-item-on' : 'filter-item'} style={{fontSize: '12px'}} onClick={() => {updateSearch('Curators')}}>Curators</div>
                  {/* <div className={fundSearch == 'Channels' ? 'filter-item-on' : 'filter-item'} style={{fontSize: '12px'}} onClick={() => {updateSearch('Channels')}}>Channels</div> */}

                  <input type="text" value={searchInput} onChange={(e) => getInput(e.target.value, null)} style={{backgroundColor: '#adf', borderRadius: '8px', padding: isMobile ? '2px 4px' : '2px 4px', fontSize: isMobile ? '12px' : '14px', width: '150px', fontWeight: '600', margin: '0 0 0 4px'}} placeholder={"search " + fundSearch.toLowerCase()} />

                </div>
              </div>)}




            {userFunding?.creator_fund > 0 && (<div className='flex-row' style={{width: '100%', justifyContent: 'center', flexWrap: "wrap", color: '#024', fontWeight: '600', fontSize: '12px'}}>

              {channelData?.length > 0 && (channelData?.map((channel, index) => (
                (<div key={index} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}} onClick={() => {
                  updateSchedule(channel?.channelId, 'Channels')}}>
                  <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                    {channel?.imageUrl && (<img src={channel?.imageUrl} width={20} height={20} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
                    <div style={{display: 'flex', textAlign: 'center', fontSize: '15px', margin: '0'}}>{channel?.channelId ? `/${channel?.channelId}  (${channel?.followerCount})` : ' channel not found'}</div>
                  </div>
                </div>)
              )))}
              {channelsLength > 20 && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}}>
                <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                  <div style={{display: 'flex', textAlign: 'center', fontSize: '15px', margin: '0', cursor: 'pointer'}} onClick={() => {
                    if (fundSearch == 'Curators') {
                      getInput(searchInput, 'true')
                    } else {

                    }
                    
                    }}>&nbsp;+{channelsLength - 20}</div>
                </div>
              </div>)}


              {curatorData?.length > 0 && (curatorData?.map((curator, index) => (
                (<div key={index} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}} onClick={() => {
                  updateSchedule(curator?.fid, 'Curators')}}>
                  <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                    {curator?.pfp && (<img src={curator?.pfp} width={20} height={20} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
                    <div style={{display: 'flex', textAlign: 'center', fontSize: '15px', margin: '0'}}>{curator?.username ? `@${curator?.username}` : ' curator not found'}</div>
                  </div>
                </div>)
              )))}
              {curatorsLength > 20 && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '7px 5px'}}>
                <div className='cast-act-lt' style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
                  <div style={{display: 'flex', textAlign: 'center', fontSize: '15px', margin: '0', cursor: 'pointer'}} onClick={() => {
                    if (fundSearch == 'Curators') {
                      getInput(searchInput, 'true')
                    }}}>&nbsp;+{curatorsLength - 20}</div>
                </div>
              </div>)}

            </div>)}

          </div></>)}






    {/* <div>
      Support creators with your remaining $degen and $tipn allowances - earn rewards
    </div>

    <div className='flex-row' style={{position: 'absolute', bottom: '0', right: '0', padding: '5px 5px', gap: '.25rem', alignItems: 'center'}}>
      <BsQuestionCircle size={15} onClick={() => {
        openSwipeable("autoFund"); }} />
    </div> */}






  </div>
</div>
</div>
)}












      </div>



      <div style={{padding: '0 0 80px 0'}}>&nbsp;</div>

      <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
      <Modal modal={modal} />
    </div>
  );
}