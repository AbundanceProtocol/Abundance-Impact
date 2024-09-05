import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
// import Link from 'next/link'
import { AccountContext } from '../../context'
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints'
import useStore from '../../utils/store'
import axios from 'axios';
import { FaSearch, FaLock, FaRegStar, FaRegClock, FaRegTrashAlt, FaPen, FaPause } from "react-icons/fa"
import { useRouter } from 'next/router';
import { formatNum } from '../../utils/utils';
import { IoShuffleOutline as Shuffle, IoPeople, IoPeopleOutline } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import { GoTag } from "react-icons/go";
import { AiOutlineBars } from "react-icons/ai";
import { IoCaretForwardOutline as Forward } from "react-icons/io5";
import Spinner from '../../components/Common/Spinner';
import ExpandImg from '../../components/Cast/ExpandImg';
import Modal from '../../components/Layout/Modals/Modal';
import HorizontalScale from '../../components/Common/HorizontalScale';
import TipScheduler from '../../components/Common/TipScheduler';

export default function Schedule() {
  const ref = useRef(null)
  const likeRefs = useRef([])
  const recastRefs = useRef([])
  const { isMobile } = useMatchBreakpoints();
  // const [feedWidth, setFeedWidth] = useState()
  const { isLogged, fid, userProfile } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const store = useStore()
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const initialQuery = {shuffle: true, time: null, tags: [], channels: [], curators: []}
  const [userQuery, setUserQuery] = useState(initialQuery)
  // const [oldQuery, setOldQuery] = useState(null)
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

  const initialState = { fid: null, signer: null, urls: [], channel: null, parentUrl: null, text: '' }
	const [castData, setCastData] = useState(initialState)
  const [loading, setLoading] = useState(false);
  const [isSelected, setIsSelected] = useState('none')
	const [userSearch, setUserSearch] = useState({ search: '' })
  const [channels, setChannels] = useState([])
  const [curators, setCurators] = useState([])
  const [selectedCurators, setSelectedCurators] = useState([])
  const [selectedChannels, setSelectedChannels] = useState([])
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  const [initValue, setInitValue] = useState(50)
  const [initHour, setInitHour] = useState('Hr')
  const [initMinute, setInitMinute] = useState('0')
  const [cronId, setCronId] = useState(null)
  const [activeCron, setActiveCron] = useState(null)
  const [loadedSchedule, setLoadedSchedule] = useState(false)
  const tokenInfo = [{token: '$DEGEN', set: true}, {token: '$TN100x', set: true}, {token: '$FARTHER', set: true}]
  const [tokenData, setTokenData] = useState(tokenInfo)
  const [tokensSelected, setTokensSelected] = useState(['$DEGEN'])
  const availableTokens = ['$DEGEN', '$TN100x', '$FARTHER']
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

  const getUserSchedule = async (fid) => {
    console.log(fid)
    if (fid) {
      const userSchedule = await axios.get('/api/curation/getScheduledSearch', {
        params: {
          fid: fid,
        }
      })
      if (userSchedule && userSchedule.status == 200) {
        const schedule = userSchedule.data
        let updatedUserQuery = { ...userQuery }
        if (schedule.shuffle) {
          updatedUserQuery.shuffle = schedule.shuffle
        }
        if (schedule.time) {
          updatedUserQuery.time = schedule.time
        }
        if (schedule.curators) {
          updatedUserQuery.curators = schedule.curators
        }
        if (schedule.channels) {
          updatedUserQuery.channels = schedule.channels
        }
        if (schedule.tags) {
          updatedUserQuery.tags = schedule.tags
        }
        setUserQuery(updatedUserQuery)
        if (schedule.schedTime) {
          const minutes = schedule.schedTime.substring(0, 2)
          const hours = schedule.schedTime.substring(3, 5)
          setInitHour(hours)
          setInitMinute(minutes)
        }
        if (schedule.active_cron == false || schedule.active_cron == true) {
          setActiveCron(schedule.active_cron)
        }
        if (schedule.percent) {
          setInitValue(schedule.percent)
        }
        if (schedule.cron_job_id) {
          setCronId(schedule.cron_job_id)
        }
        if (schedule.currencies && schedule.currencies.length > 0) {
          let updatedTokenData = [...tokenData]
          for (const token of updatedTokenData) {
            if (schedule.currencies.includes(token.token)) {
              token.allowance = 0
              token.set = true
              token.totalTip = 0
            } else {
              token.allowance = 0
              token.set = false
              token.totalTip = 0
            }
          }
          setTokenData(updatedTokenData)
        }
        console.log(userSchedule.data)
      }
      setLoadedSchedule(true)
    }
  }

  useEffect(() => {
    console.log('triggered')
    getUserSchedule(fid)

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
    getUserSchedule(fid)
  }, [isLogged])

  const goToUserProfile = async (event, author) => {
    event.preventDefault()
    const username = author.username
    await store.setUserData(author)
    router.push(`/${username}`)
  }

	function onChange(e) {
		setCastData( () => ({ ...castData, [e.target.name]: e.target.value }) )
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

  async function getCurators(name) {
    console.log(name)
    try {
      const response = await axios.get('/api/curation/getCurators', {
        params: {
          name: name,
        }
      })
      if (response) {
        const curators = response.data.users
        console.log(curators)
        setCurators(curators)
      }
      // console.log(channels)
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
    const curatorIndex = prevUserQuery.curators.indexOf(curator.fid);
    if (curatorIndex === -1) {
      return {
        ...prevUserQuery,
        curators: [...prevUserQuery.curators, curator.fid]
      };
    } else {
      // If the curator is found, remove it from the array
      return {
        ...prevUserQuery,
        curators: prevUserQuery.curators.filter(item => item !== curator.fid)
        };
      }
    });

    const isCuratorSelected = selectedCurators.some((c) => c.fid === curator.fid);

    if (isCuratorSelected) {
      // If the curator is already selected, remove it from the state
      setSelectedCurators(selectedCurators.filter((c) => c.fid !== curator.fid));
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

  async function deleteSchedule() {
    console.log(cronId, fid)
    try {
      const response = await axios.delete('/api/curation/deleteTipSchedule', {
        params: {
          cronId: cronId, fid
        }
      })
      if (response && response.status == 200) {
        let updatedUserQuery = { ...userQuery }
        updatedUserQuery.shuffle = false
        updatedUserQuery.time = null
        updatedUserQuery.curators = []
        updatedUserQuery.channels = []
        updatedUserQuery.tags = []
        setUserQuery(updatedUserQuery)

        setModal({on: true, success: true, text: response.data.message});
        setTimeout(() => {
          setModal({on: false, success: false, text: ''});
        }, 2500);

        return true
      } else {

        setModal({on: true, success: false, text: 'Tip schedule delete failed'});
        setTimeout(() => {
          setModal({on: false, success: false, text: ''});
        }, 2500);
        return null
      }
    } catch (error) {
      setModal({on: true, success: false, text: 'Tip schedule delete failed'});
      setTimeout(() => {
        setModal({on: false, success: false, text: ''});
      }, 2500);
      console.error('Error submitting data:', error)
      return null
    }
  }

  async function pauseSchedule() {
    console.log(cronId, fid)
    try {
      const response = await axios.get('/api/curation/updateTipSchedule', {
        params: {
          cronId: cronId, fid
        }
      })
      // console.log(response)

      if (response && response.data) {
        const curators = response.data
        if (response.data.update == 1) {
          setModal({on: true, success: true, text: 'Tip schedule paused'});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);

          setActiveCron(false)

        } else if (response.data.update == 0) {
          setModal({on: true, success: true, text: 'Tip schedule resumed'});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);

          setActiveCron(true)
        }
        console.log(curators)
        // setCurators(curators)
        return curators
      } else {
        return null
      }
      // console.log(channels)
    } catch (error) {
      console.error('Error submitting data:', error)
      return null
    }
  }


  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref}>
    <Head>
      <title>Impact App | Abundance Protocol</title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div style={{padding: '58px 0 0 0', width: feedMax}}>
    </div>

    {!loadedSchedule ? (
      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: feedMax, justifyContent: 'center', marginTop: '40px'}}>
        <Spinner size={31} color={'#999'} />
      </div>
    ) : (userQuery.time && isLogged) ? (<div style={{border: '1px solid #777', padding: '8px', borderRadius: '10px', margin: '3px', backgroundColor: '#eef6ff11'}}>
    <div className="top-layer">
      <div className="flex-row" style={{padding: '0', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.50rem'}}>
        <div className='flex-row' style={{gap: '0.75rem', margin: '2px 0 0 0'}}>
          <div className={`mini-btn flex-row ${userQuery['shuffle'] ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{border: '1px solid #abc', padding: '3px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}} onClick={() => {if (isLogged) {deleteSchedule()}}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem'}}>
              <FaRegTrashAlt size={15} />
            </div>
          </div>

          <div className={`flex-row ${userQuery['shuffle'] ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{border: '1px solid #abc', padding: '4px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}} onClick={() => { if (isLogged) {pauseSchedule()}}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem'}}>
              {activeCron ? (<FaPause size={14} />) : (<Forward size={14} />)}
            </div>
          </div>

          <div className={`flex-row ${userQuery['shuffle'] ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{border: '1px solid #abc', padding: '4px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}} onClick={() => {modifySchedule('shuffle')}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem'}}>
              <FaPen size={14} />
            </div>
          </div>
        </div>
        <div className={`${isMobile ? 'flex-col' : 'flex-row'}`} style={{gap: '0.5rem', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
          <div className='flex-row'>
            {isLogged && userProfile && (
              <a className="" title="" href={`/${userProfile.username}`} onClick={() => {goToUserProfile(event, store.userProfile)}}>
                <img loading="lazy" src={userProfile.pfp_url} className="" alt={`${userProfile.display_name} avatar`} style={{width: '40px', height: '40px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #abc', margin: '22px 0 0px 20px'}} />
              </a>
            )}
            <HorizontalScale {...{ initValue, setTipPercent, tokenData, setTokenData, availableTokens, tokensSelected, setInitValue, type: 'schedule' }} />
          </div>
          <div>
            <TipScheduler {...{ initHour, setInitHour, initMinute, setInitMinute, userQuery, tokenData, initValue, setLoading, type: 'schedule' }} />
          </div>
        </div>
      </div>
    </div>
    <div>
    <div className='flex-row' style={{justifyContent: 'space-between', margin: '15px 0 5px 0'}}>
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
        <div className='' style={{position: 'absolute', width: feedMax, margin: 'auto', marginTop: '28px', transform: 'translate(-11px, 0)'}} onMouseEnter={() => {handleSelection('curators')}} onMouseLeave={() => {handleSelection('none')}}>
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
            {curators && (
              curators.map((curator, index) => (
                <div key={`Cu2-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addCurator(curator)}}>
                  <img loading="lazy" src={curator.pfp} className="" alt={curator.display_name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                  <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>@{curator.username}</div>
                </div>
            )))}
            </div>

            {(selectedCurators?.length > 0) && (
              <div className='flex-row' style={{gap: '0.5rem', padding: '10px 6px 6px 6px', flexWrap: 'wrap', borderTop: '1px solid #888', width: '100%', alignItems: 'center'}}>
                <div style={{color: '#ddd', fontWeight: '600', fontSize: '13px', padding: '0 0 3px 6px'}}>Selected:</div>
                {(selectedCurators.map((curator, index) => (
                  <div key={`Cu-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addCurator(curator)}}>
                    <img loading="lazy" src={curator.pfp} className="" alt={curator.display_name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                    <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>@{curator.username}</div>
                  </div>
                )))}
              </div>)}
            </div>
          </div>
      )}

      {(isSelected == 'channels') && (
        <div className='' style={{position: 'absolute', width: feedMax, margin: 'auto', marginTop: '28px', transform: 'translate(-11px, 0)' }} onMouseEnter={() => {handleSelection('channels')}} onMouseLeave={() => {handleSelection('none')}}>
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
                  <div key={`Ch2-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
                    <img loading="lazy" src={channel.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                    <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
                    <div style={{fontWeight: '400', fontSize: '10px', color: '#ccc'}}>{formatNum(channel.follower_count)}</div>
                  </div>
                  )
              ))}
            </div>

            {(selectedChannels && selectedChannels.length > 0) && (
              <div className='flex-row' style={{gap: '0.5rem', padding: '10px 6px 6px 6px', flexWrap: 'wrap', borderTop: '1px solid #888', width: '100%', alignItems: 'center'}}>
                <div style={{color: '#ddd', fontWeight: '600', fontSize: '13px', padding: '0 0 3px 6px'}}>Selected:</div>
                {(selectedChannels.map((channel, index) => (
                  <div key={`Ch-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
                    <img loading="lazy" src={channel.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
                    <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
                  </div>
              )))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
    </div>) : (
      <div style={{width: '100%', fontSize: '20px', fontWeight: '400', textAlign: 'center', color: '#cde'}}>No schedule found</div>
    )}
    <div style={{margin: '0 0 70px 0'}}>
    </div>
    <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
    <Modal modal={modal} />
  </div>
  )
}
