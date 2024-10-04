import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../../../context'
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints'
import useStore from '../../../utils/store'
import axios from 'axios';
import { useRouter } from 'next/router';
import Cast from '../../../components/Cast'
import { formatNum, getTimeRange, checkEmbedType, populateCast, isCast } from '../../../utils/utils';
import { IoShuffleOutline as Shuffle, IoPeople, IoPeopleOutline } from "react-icons/io5";
import { HiRefresh } from "react-icons/hi";
import { BsClock } from "react-icons/bs";
import { GoTag } from "react-icons/go";
import { AiOutlineBars } from "react-icons/ai";
import Spinner from '../../../components/Common/Spinner';
import { useInView } from 'react-intersection-observer'
import ExpandImg from '../../../components/Cast/ExpandImg';
import Modal from '../../../components/Layout/Modals/Modal';
import FeedMenu from '../../../components/Common/FeedMenu';
import TipScheduler from '../../../components/Common/TipScheduler';
import HorizontalScale from '../../../components/Common/HorizontalScale';
import TipAll from '../../../components/Common/TipAll';

export default function Home({ time, curators, channels, tags, shuffle, referrer, eco, ecosystem }) {
  const ref2 = useRef(null)
  const [ref, inView] = useInView()
  const [userFeed, setUserFeed] = useState([])
  const { isMobile } = useMatchBreakpoints();
  const { LoginPopup, ecoData, points, setPoints, isLogged, fid, userProfile, populate } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const store = useStore()
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const initialQuery = {shuffle: false, time: 'all', tags: [], channels: [], curators: []}
  const [userQuery, setUserQuery] = useState(initialQuery)
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const router = useRouter()
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
  const [sched, setSched] = useState({userQuery: false, ecoData: false, login: false, searchSelect: false, inView: false})
  const userButtons = ['Curation', 'Main', 'Recent']
  const [searchSelect, setSearchSelect] = useState('Main')
  const [channelSelect, setChannelSelect] = useState(null)
  const initialState = { fid: null, signer: null, urls: [], channel: null, parentUrl: null, text: '' }
	const [castData, setCastData] = useState(initialState)
  const [loading, setLoading] = useState(false);
  const tokenInfo = [{token: '$DEGEN', set: true}, {token: '$TN100x', set: false}]
  const [tokenData, setTokenData] = useState(tokenInfo)
  const [isSelected, setIsSelected] = useState('none')
	const [userSearch, setUserSearch] = useState({ search: '' })
  const [filterChannels, setFilterChannels] = useState([])
  const [filterCurators, setFilterCurators] = useState([])
  const [selectedCurators, setSelectedCurators] = useState([])
  const [selectedChannels, setSelectedChannels] = useState([])
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  const [initValue, setInitValue] = useState(50)
  const [initHour, setInitHour] = useState('Hr')
  const [initMinute, setInitMinute] = useState('0')
  const [tokensSelected, setTokensSelected] = useState(['$DEGEN'])
  const availableTokens = ['$DEGEN', '$TN100x']
  const [noTip, setNoTip] = useState(true)
  const [cursor, setCursor] = useState('')
  const [prevCursor, setPrevCursor] = useState('')
  const [tipPercent, setTipPercent] = useState(50)
  
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

  const handleSelect = async (type, selection) => {
    console.log(type)
    setPrevCursor('')
    setCursor('')
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

  useEffect(() => {
    const searchRouter = () => {
      setCursor('')
      setPrevCursor('')
      if (isLogged && ecoData) {
        console.log('triggered')
        if (searchSelect == 'Curation') {
          feedRouter()
        } else if (searchSelect == 'Main' && ecoData?.channels?.length > 0) {
          getFeed(fid, ecoData?.channels[0]?.name, true)
        } else if (searchSelect == 'Recent' && ecoData?.channels?.length > 0) {
          getFeed(fid, ecoData?.channels[0]?.name, false)
        }
      }
    }

    if (sched.userQuery) {
      searchRouter()
      setSched(prev => ({...prev, userQuery: false }))
    } else {
      const timeoutId = setTimeout(() => {
        searchRouter()
        setSched(prev => ({...prev, userQuery: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
    
  }, [userQuery, selectedChannels, selectedCurators, sched.userQuery]);

  useEffect(() => {
    const ecoRouter = () => {
      if (populate && populate !== 0) {
        if (ecoData?.channels?.length > 0) {
          setUserFeed([])
          setPrevCursor('')
          setCursor('')
          setChannelSelect(ecoData.channels[0].name)
          setSearchSelect('Main')
          getFeed(fid, ecoData?.channels[0]?.name, true)
        } else {
          setUserFeed([])
          setPrevCursor('')
          setCursor('')
          setChannelSelect(null)
          setSearchSelect('Curation')
          feedRouter()
        }
      }
    }

    if (sched.ecoData) {
      ecoRouter()
      setSched(prev => ({...prev, ecoData: false }))
    } else {
      const timeoutId = setTimeout(() => {
        ecoRouter()
        setSched(prev => ({...prev, ecoData: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [populate, sched.ecoData]);

  const handleSelection = (type) => {
    if (type == 'shuffle') {
      setIsSelected('none')
    } else {
      setIsSelected(type)
    }
  }

  useEffect(() => {
    setTokenData((prevTokenData) => {
      let updatedTokenData = [...prevTokenData];

      updatedTokenData.forEach((token) => {
        if (token.allowance) {
          return token.totalTip = Math.round((token.allowance * tipPercent) / 100)
        }
      })
      return updatedTokenData
    })
    console.log(tokenData)

  }, [tipPercent])

  useEffect(() => {
    for (const token of tokenData) {
      if (token.set) {
        if (token.token == '$TN100x' && token.totalTip >= 1) {
          setNoTip(false)
          return
        } else if (token.totalTip > 0) {
          setNoTip(false)
          return
        }
      }
    }
    setNoTip(true)
  }, [tokenData])

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`562px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 120}px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 10}px`)
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

  async function getAllowance(token, fid) {
    let getToken = 'degen'
    if (token == '$DEGEN') {
      getToken = 'degen'
    } else if (token == '$TN100x') {
      getToken = 'ham'
    } else if (token == '$FARTHER') {
      getToken = 'farther'
    }

    try {
      const responseTotal = await axios.get(`/api/${getToken}/getUserAllowance`, {
        params: { fid } })
      let remaningAllowance = 0
      let minTip = 1
      if (responseTotal?.data) {
        remaningAllowance = responseTotal?.data?.remaining
        if (getToken == 'farther') {
          minTip = responseTotal?.data?.minTip
        }
        return { allowance: remaningAllowance, minTip }
      } else {
        return { allowance: 0, minTip: 1 }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      return { allowance: 0, minTip: 1 }
    }
  }

  async function updateAllowances(tokens, fid) {
    let updatedTokenData = [...tokenData]
    for (const token of tokens) {
      let { allowance, minTip } = await getAllowance(token, fid)
      const tokenIndex = updatedTokenData.findIndex(currentToken => currentToken.token == token)
      if (tokenIndex !== -1) {
        if (!updatedTokenData[tokenIndex]?.set) {
          updatedTokenData[tokenIndex].set = false
        }
        if (token == '$FARTHER') {
          updatedTokenData[tokenIndex].min = minTip
        }
        updatedTokenData[tokenIndex].allowance = allowance
        updatedTokenData[tokenIndex].totalTip = Math.round(allowance * tipPercent / 100)
      } else if (token == '$FARTHER') {
        const newToken = {
          token: token,
          set: false,
          allowance: allowance,
          min: minTip,
          totalTip: Math.round(allowance * tipPercent / 100)
        }
        updatedTokenData.push(newToken)
      } else {
        const newToken = {
          token: token,
          set: false,
          allowance: allowance,
          totalTip: Math.round(allowance * tipPercent / 100)
        }
        updatedTokenData.push(newToken)
      }
      setTokenData(updatedTokenData)
    }
  }

  useEffect(() => {
    if (isLogged && ecoData && cursor == 'x') {
      if (searchSelect == 'Curation') {
        console.log(cursor)
        feedRouter()
      }
    }
  }, [cursor])


  useEffect(() => {

    const allowanceUpdate = () => {
      if (isLogged) {
        updateAllowances(availableTokens, fid)
      }
    }

    if (sched.login) {
      allowanceUpdate()
      setSched(prev => ({...prev, login: false }))
    } else {
      const timeoutId = setTimeout(() => {
        allowanceUpdate()
        setSched(prev => ({...prev, login: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }

  }, [isLogged, sched.login])

  const searchSelectRouter = () => {
    console.log(searchSelect, ecoData, ecoData?.channels[0])
    setLoading(false)
    setPrevCursor('')
    setCursor('')
    if (isLogged && ecoData) {
      if (searchSelect == 'Curation') {
        console.log(cursor)
        setPrevCursor('x')
        setCursor('x')
      } else if (searchSelect == 'Main') {
        getFeed(fid, ecoData?.channels[0]?.name, true)
      } else if (searchSelect == 'Recent') {
        getFeed(fid, ecoData?.channels[0]?.name, false)
      }
    }
  }
  
  useEffect(() => {
    if (sched.searchSelect) {
      searchSelectRouter()
      setSched(prev => ({...prev, searchSelect: false }))
    } else {
      const timeoutId = setTimeout(() => {
        searchSelectRouter()
        setSched(prev => ({...prev, searchSelect: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }

  }, [searchSelect, sched.searchSelect])
  
  useEffect(() => {
    const inViewRouter = () => {
      if (userFeed && (userFeed.length % 10 == 0)) {
        if (cursor !== prevCursor && cursor !== '' && isLogged) {
          if (searchSelect == 'Main') {
            setPrevCursor(cursor)
            addToFeed(fid, channelSelect, true, cursor)
          } else if (searchSelect == 'Recent') {
            setPrevCursor(cursor)
            addToFeed(fid, channelSelect, false, cursor)
          } else if (searchSelect == 'Curation') {
            setPrevCursor(cursor)
            feedRouter()
          }
          console.log('trigger get additional casts', cursor, prevCursor, searchSelect)
          
        } else {
          console.log('triggered, no new casts', cursor, prevCursor, searchSelect)
        }
      }
    }

    if (sched.inView) {
      inViewRouter()
      setSched(prev => ({...prev, inView: false }))
    } else {
      const timeoutId = setTimeout(() => {
        inViewRouter()
        setSched(prev => ({...prev, inView: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [inView, sched.inView])

  async function getFeed(fid, channel, curated) {
    const getChannelFeed = async (fid, channel, curated) => {
      setLoading(true)
      try {
        const response = await axios.get('/api/ecosystem/getFeed', {
          params: { fid, channel, curated } })
        setLoading(false)
        if (response?.data) {
          // console.log(response)
          const casts = response?.data?.casts
          let cursorData = ''
          if (response?.data?.cursor) {
            cursorData = response.data.cursor
          }
          console.log(casts, cursorData)
          return {channelFeed: casts, cursorData}
        } else {
          return {channelFeed: [], cursorData: ''}
        }
      } catch (error) {
        console.error('Error submitting data:', error)
        return {channelFeed: [], cursorData: ''}
      }
    }

    const {channelFeed, cursorData} = await getChannelFeed(fid, channel, curated)
    
    setUserFeed(channelFeed)
    updateFeed([], channelFeed, fid)
    
    setPrevCursor(cursor)
    setCursor(cursorData)

  }

  async function updateFeed(oldFeed, feed, fid) {
    let combinedFeed = oldFeed.concat(feed)
    console.log(combinedFeed)
    if (oldFeed?.length > 0) {
      setUserFeed((prevUserFeed) => prevUserFeed.concat(feed))
    } else {
      setUserFeed(feed)
    }

  }

  async function addToFeed(fid, channel, curated, cursor) {

    const getChannelFeed = async (fid, channel, curated, cursor) => {
      try {
        const response = await axios.get('/api/ecosystem/getFeed', {
          params: { fid, channel, curated, cursor } })
        let casts = []
        if (response?.data) {
          casts = response?.data?.casts
          let cursorData = ''
          if (response?.data?.cursor) {
            cursorData = response?.data?.cursor
          }
          return {channelFeed: casts, cursorData}
        } else {
          return {channelFeed: [], cursorData: ''}
        }
      } catch (error) {
        console.error('Error submitting data:', error)
        return {channelFeed: [], cursorData: ''}
      }
    }

    const {channelFeed, cursorData} = await getChannelFeed(fid, channel, curated, cursor)
    console.log(channelFeed)
    updateFeed(userFeed, channelFeed, fid)
    setCursor(cursorData)
  }

  useEffect(() => {
    setUserQuery(updateUserQuery => {
      return {time, channels, tags, shuffle, curators}
    })
  }, [time, curators, channels, tags, shuffle])

  useEffect(() => {
    console.log('triggered []')

    if (isLogged) {
      updateAllowances(availableTokens, fid)
    }

    setUserQuery(updateUserQuery => {
      return {time, channels, tags, shuffle, curators}
    })

    async function getCuratorsQuery(curators) {

      const getCuratorData = async (name) => {
        try {
          const response = await axios.get('/api/curation/queryCurators', {
            params: {
              name: name,
            }
          })
          if (response) {
            const curatorsData = response?.data?.users
            console.log(curatorsData)
            return curatorsData
          } else {
            return null
          }
        } catch (error) {
          console.error('Error submitting data:', error)
          return null
        }
      }

      for (const curator of curators) {
        const curatorData = await getCuratorData(curator)
        addCurator(curatorData)
      }
    }

    if (curators && selectedCurators?.length == 0) {
      getCuratorsQuery(curators)
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
    if (!isLogged) {
      LoginPopup()
    }
  }, [router]);

  function feedRouter() {
    const { shuffle, time, tags, channels, curators } = userQuery
    const timeRange = getTimeRange(time)
    console.log(userQuery)
    getUserSearch(timeRange, tags, channels, curators, null, shuffle)
  }

  async function getUserSearch(time, tags, channel, curator, text, shuffle) {
    let page = null
    if (!shuffle && typeof cursor !== 'number') {
      page = 1
      setPrevCursor(page)
      setCursor(page+1)
    } else if (!shuffle && typeof cursor == 'number') {
      page = cursor
      setPrevCursor(cursor)
      setCursor(cursor+1)
    }

    async function getSearch(time, tags, channel, curator, text, shuffle) {
      setLoading(true)
      try {
        const response = await axios.get('/api/curation/getUserSearch', {
          params: { time, tags, channel, curator, text, shuffle, points, page }
        })
        setLoading(false)
        let casts = []
        let getPage = 1
        let pages = 1
        if (response?.data?.casts.length > 0) {
          casts = response.data.casts
        }
        if (response?.data?.page) {
          getPage = response?.data?.page
        }
        if (response?.data?.pages) {
          pages = response?.data?.pages
        }

        if (getPage == pages) {
          setPrevCursor('')
          setCursor('')
        } else {
          setPrevCursor(cursor)
          setCursor(getPage+1)
        }
        return {casts, getPage}
      } catch (error) {
        console.error('Error submitting data:', error)
        setPrevCursor('')
        setCursor('')
        return { casts: null, getPage: 0 }
      }
    }

    const {casts, getPage} = await getSearch(time, tags, channel, curator, text, shuffle, page)

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
      sortedCasts = filteredCasts.sort((a, b) => b.impact_total - a.impact_total);

      let displayedCasts = await populateCast(sortedCasts)

      setUserFeed(displayedCasts)

    }
  }

  const goToUserProfile = async (event, author) => {
    event.preventDefault()
    const username = author.username
    await store.setUserData(author)
    router.push(`/${username}`)
  }

  function clearCastText() {
    setCastData({ ...castData, text: '', parentUrl: null });
  }

	function onChange(e) {
		setCastData( () => ({ ...castData, [e.target.name]: e.target.value }) )
	}

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  const updateCast = (index, newData) => {
    const updatedFeed = [...userFeed]
    updatedFeed[index] = newData
    console.log(newData)
    setUserFeed(updatedFeed)
  }

  const channelKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      getChannels(userSearch.search)
    }
  }

  const curatorKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      getCurators(userSearch.search)
    }
  }

  async function getChannels(name) {
    console.log(name)
    try {
      const response = await axios.get('/api/getChannels', {
        params: { name } })
      if (response) {
        const channelsData = response?.data?.channels?.channels
        console.log(channelsData)
        setFilterChannels(channelsData)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function getCurators(name) {
    console.log(name)
    try {
      const response = await axios.get('/api/curation/getCurators', {
        params: { name } })
      if (response) {
        const curatorsData = response?.data?.users
        console.log(curatorsData)
        setFilterCurators(curatorsData)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  function onChannelChange(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  function onCuratorSearch(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  function addCurator(curator) {
    console.log(curator)
    setUserQuery(prevUserQuery => {
    const curatorIndex = prevUserQuery.curators.indexOf(curator?.fid);
    if (curatorIndex === -1) {
      return {
        ...prevUserQuery,
        curators: [...prevUserQuery.curators, curator?.fid]
      };
    } else {
      // If the curator is found, remove it from the array
      return {
        ...prevUserQuery,
        curators: prevUserQuery.curators.filter(item => item !== curator?.fid)
        };
      }
    });

    const isCuratorSelected = selectedCurators.some((c) => c.fid === curator?.fid);

    if (isCuratorSelected) {
      // If the curator is already selected, remove it from the state
      setSelectedCurators(selectedCurators.filter((c) => c.fid !== curator?.fid));
    } else {
      // If the curator is not selected, add it to the state
      setSelectedCurators([...selectedCurators, curator]);
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

  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref2}>
    <Head>
      <title>Impact App | Abundance Protocol</title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div style={{padding: '58px 0 0 0', width: feedMax}}>
    </div>
    <div className="top-layer">
      <div className="flex-row" style={{padding: '0', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
        <div className='flex-row' style={{gap: '0.5rem', width: '100%', alignItems: 'center'}}>
          {isLogged && userProfile && (
            <a className="" title="" href={`/${userProfile.username}`} onClick={() => {goToUserProfile(event, store.userProfile)}}>
              <img loading="lazy" src={userProfile.pfp_url} className="" alt={`${userProfile.display_name} avatar`} style={{width: '40px', height: '40px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #abc', margin: '6px 0 2px 20px'}} />
            </a>
          )}
          <HorizontalScale {...{ initValue, setTipPercent, tokenData, setTokenData, availableTokens, tokensSelected, setInitValue }} />
        </div>
        <div className='flex-row' style={{gap: '0.5rem'}}>
          <TipAll {...{ tokenData, setTokenData, loading, setLoading, noTip, modal, setModal, userFeed, tipPercent }} />
          <TipScheduler {...{ initHour, setInitHour, initMinute, setInitMinute, userQuery, tokenData, initValue, setLoading, setModal }}  />
        </div>
      </div>
    </div>
    <div>

    {(ecoData?.channels?.length > 0) && (<div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-evenly', margin: '0', borderBottom: '1px solid #888'}}>
      { userButtons.map((btn, index) => (
        <FeedMenu {...{buttonName: btn, key: index, searchOption, searchSelect}} /> ))}
    </div>)}

    <div className='flex-row' style={{justifyContent: 'space-between', margin: '15px 0 30px 0'}}>
      <div className='flex-row' style={{gap: '0.5rem', marginLeft: '4px'}}>
        <div className="flex-row" style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center'}} onClick={() => {handleSelection('picks')}}>
          <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
            <span className="channel-font" style={{color: '#eee'}}>Top Picks</span>
          </div>
        </div>

        <div className={`flex-row ${userQuery['shuffle'] ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}} onClick={() => {handleSelect('shuffle')}}>
          <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem'}}>
            <Shuffle size={22} />
          </div>
        </div>
      </div>

      <div style={{position: 'relative'}}>
        <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == 'time') ? '2px solid #99ddff' : '1px solid #abc', height: '28px'}} onMouseEnter={() => {handleSelection('time')}} onMouseLeave={() => {handleSelection('none')}}>
          <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
            <BsClock size={15} color='#eee' />
            <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0'}}>{!isMobile && btnText('time')}</span>
          </div>
        </div>
        {(isSelected == 'time') && (
          <div className='top-layer' style={{position: 'absolute'}} onMouseEnter={() => {handleSelection('time')}} onMouseLeave={() => {handleSelection('none')}}>
            <div className='flex-col' style={{gap: '0.25rem', padding: '6px 6px', borderRadius: '10px', backgroundColor: '#1D3244dd', border: '1px solid #abc', width: 'auto', marginTop: '10px', alignItems: 'flex-start'}}>
              <div className={`selection-btn ${userQuery['time'] == '24hr' ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('time', '24hr')}}>{'24 hours'}</div>
              <span className={`selection-btn ${userQuery['time'] == '3days' ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('time', '3days')}}>{'3 days'}</span>
              <span className={`selection-btn ${userQuery['time'] == '7days' ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('time', '7days')}}>{'7 days'}</span>
              <span className={`selection-btn ${userQuery['time'] == '30days' ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('time', '30days')}}>{'30 days'}</span>
              <span className={`selection-btn ${userQuery['time'] == 'all' ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('time', 'all')}}>{'All'}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{position: 'relative'}}>
        <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == 'tags') ? '2px solid #99ddff' : '1px solid #abc', height: '28px'}} onMouseEnter={() => {handleSelection('tags')}} onMouseLeave={() => {handleSelection('none')}}>
          <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
            <GoTag size={23} color='#eee' />
            <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0'}}>{!isMobile && btnText('tags')}</span>
          </div>
        </div>
        {(isSelected == 'tags') && (
          <div className=' top-layer' style={{position: 'absolute', right: '0'}} onMouseEnter={() => {handleSelection('tags')}} onMouseLeave={() => {handleSelection('none')}}>
            <div className='flex-col' style={{gap: '0.25rem', padding: '6px 6px', borderRadius: '10px', backgroundColor: '#1D3244dd', border: '1px solid #abc', width: 'auto', marginTop: '10px', alignItems: 'flex-start'}}>
              <div className={`selection-btn ${(userQuery['tags'] == 'all' || userQuery['tags'].length == 0) ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('tags', 'all')}}>{'All tags'}</div>
              <span className={`selection-btn ${userQuery['tags'].includes('art') ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('tags', 'art')}}>{'Art'}</span>
              <span className={`selection-btn ${userQuery['tags'].includes('dev') ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('tags', 'dev')}}>{'Dev'}</span>
              <span className={`selection-btn ${userQuery['tags'].includes('vibes') ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect('tags', 'vibes')}}>{'Vibes'}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{position: 'relative'}}>
        <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == 'channels') ? '2px solid #99ddff' : '1px solid #abc', height: '28px'}} onMouseEnter={() => {handleSelection('channels')}} onMouseLeave={() => {handleSelection('none')}}>
          <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
            <AiOutlineBars size={15} color='#eee' />
            <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0', color: userQuery['channels'].length == 0 ? '#aaa' : ''}}>{isMobile ? '' : userQuery['channels'].length == 0 ? 'All channels' : 'Channels'}</span>
          </div>
        </div>
      </div>

      <div style={{position: 'relative'}}>
        <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == 'curators') ? '2px solid #99ddff' : '1px solid #abc', height: '28px', marginRight: '4px'}} onMouseEnter={() => {handleSelection('curators')}} onMouseLeave={() => {handleSelection('none')}}>
          <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
            <IoPeopleOutline size={15} color='#eee' />
            <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0', color: userQuery['curators'].length == 0 ? '#aaa' : ''}}>{isMobile ? '' : userQuery['curators'].length == 0 ? 'All curators' : 'Curators'}</span>
          </div>
        </div>
      </div>


      {(isSelected == 'curators') && (
        <div className='' style={{position: 'absolute', width: feedMax, margin: 'auto', marginTop: '28px'}} onMouseEnter={() => {handleSelection('curators')}} onMouseLeave={() => {handleSelection('none')}}>
          <div className='top-layer flex-col' style={{gap: '0.25rem', padding: '6px 6px', borderRadius: '10px', backgroundColor: '#1D3244dd', border: '1px solid #abc', width: 'auto', marginTop: '10px', alignItems: 'flex-start'}}>
            <div className={`selection-btn ${(userQuery['curators'] == 'all' || userQuery['curators'].length == 0) ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}}>
              <input onChange={onCuratorSearch} 
                name='search' 
                placeholder={`Search curators`} 
                value={userSearch.search} 
                className='srch-btn' 
                style={{width: '100%', backgroundColor: '#234'}} 
                onKeyDown={curatorKeyDown} />
            </div>
            <div className='flex-row' style={{gap: '0.5rem', padding: '0px 6px', flexWrap: 'wrap'}}>
              {filterCurators && (
                filterCurators.map((curator, index) => (
                  <div key={`Cu2-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addCurator(curator)}}>
                    <img loading="lazy" src={curator.pfp} className="" alt={curator.display_name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                    <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>@{curator.username}</div>
                  </div>
                )
              ))}
            </div>

            {(selectedCurators && selectedCurators.length > 0) && (<div className='flex-row' style={{gap: '0.5rem', padding: '10px 6px 6px 6px', flexWrap: 'wrap', borderTop: '1px solid #888', width: '100%', alignItems: 'center'}}>
              <div style={{color: '#ddd', fontWeight: '600', fontSize: '13px', padding: '0 0 3px 6px'}}>Selected:</div>
              {(
                selectedCurators.map((curator, index) => (
                  <div key={`Cu-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addCurator(curator)}}>
                    <img loading="lazy" src={curator.pfp} className="" alt={curator.display_name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                    <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>@{curator.username}</div>
                  </div>
                )
              ))}
            </div>)}
          </div>
        </div>
      )}

      {(isSelected == 'channels') && (
          <div className='' style={{position: 'absolute', width: feedMax, margin: 'auto', marginTop: '28px'}} onMouseEnter={() => {handleSelection('channels')}} onMouseLeave={() => {handleSelection('none')}}>
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
                {filterChannels && (
                  filterChannels.map((channel, index) => (
                    <div key={`Ch2-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
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
                    <div key={`Ch-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
                      <img loading="lazy" src={channel.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                      <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
                    </div>
                  )
                ))}
              </div>)}
            </div>
          </div>
        )}
      </div>
    </div>

    <div className='flex-col' style={{margin: '0 0 70px 0'}}>
      {(!userFeed || userFeed.length == 0) ? (
        <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
          {loading ? (<Spinner size={31} color={'#999'} />) : (<div className='flex-row' style={{gap: '1rem', alignItems: 'center'}}>
              <div style={{fontSize: '20px', color: '#def'}}>No casts found</div>
              <div style={{cursor: 'pointer', margin: '3px 0 0 0'}} onClick={searchSelectRouter}>
                <HiRefresh size={28} color='#fff' />
              </div>
            </div>
            )}
        </div>
      ) : (userFeed.map((cast, index) => (<Cast key={index} {...{cast, index, updateCast, openImagePopup, ecosystem: points}} />)))}
      {(cursor && cursor !== '') && (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
        <Spinner size={31} color={'#999'} />
      </div>)}
    </div>
    <div ref={ref}>&nbsp;</div>
    <ExpandImg {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
    <Modal {...{modal}} />
  </div>
  )
}


export async function getServerSideProps(context) {
  // Fetch dynamic parameters from the context object
  const { query, params } = context;
  const { time, curators, channels, tags, shuffle, referrer, eco } = query;
  const { ecosystem } = params;

  let setTime = 'all'
  let setEco = eco || '$IMPACT'
  if (time) {
    setTime = time
  }
  let setCurators = []
  if (curators) {
    setCurators = Array.isArray(curators) ? curators : [curators]
  }  
  let setChannels = []
  if (channels) {
    setChannels = Array.isArray(channels) ? channels : [channels]
  }
  let setTags = []
  if (tags) {
    setTags = Array.isArray(tags) ? tags : [tags]
  }
  let setShuffle = false
  if (shuffle) {
    if (shuffle == 'true') {
      setShuffle = true
    } else if (shuffle == 'false') {
      setShuffle = false
    }
  }
  let setReferrer = referrer || null
  console.log(setTime, setCurators, setChannels, setTags, setShuffle)
  return {
    props: {
      time: setTime,
      curators: setCurators,
      channels: setChannels,
      tags: setTags,
      shuffle: setShuffle,
      referrer: setReferrer,
      ecosystem: ecosystem
    },
  };
}