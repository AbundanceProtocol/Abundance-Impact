import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { AccountContext } from '../../context'
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints'
import useStore from '../../utils/store'
import axios from 'axios';
import { FaSearch, FaLock, FaRegStar, FaRegClock, FaRegTrashAlt, FaPen, FaPause } from "react-icons/fa"
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";
// import mql from '@microlink/mql';
import { useRouter } from 'next/router';
import Cast from '../../components/Cast'
import { formatNum, getTimeRange, checkEmbedType } from '../../utils/utils';
import { IoShuffleOutline as Shuffle, IoPeople, IoPeopleOutline } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import { GoTag } from "react-icons/go";
import { AiOutlineBars } from "react-icons/ai";
import { IoCaretForwardOutline as Forward } from "react-icons/io5";
import Spinner from '../../components/Spinner';

export default function Schedule() {
  const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
  const ref = useRef(null)
  const likeRefs = useRef([])
  const recastRefs = useRef([])
  const [userFeed, setUserFeed] = useState([])
  const { isMobile } = useMatchBreakpoints();
  const [feedWidth, setFeedWidth] = useState()
  const account = useContext(AccountContext)
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

  const userButtons = ['Top Picks', 'Explore', 'Home', 'Trending', 'AI']
  // const timeButtons = ['24hr', '7days', '30d', 'All']
  // const tagButtons = ['Art', 'Media', 'Dev', 'Vibes']
  const [searchSelect, setSearchSelect ] = useState(null)
  const [search, setSearch] = useState({})
  const initialState = { fid: null, signer: null, urls: [], channel: null, parentUrl: null, text: '' }
	const [castData, setCastData] = useState(initialState)
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLogged, setIsLogged] = useState(false)
  const [success, setSuccess] = useState(false)
  const [textboxRows, setTextboxRows] = useState(1)
  const [userAllowance, setUserAllowance] = useState(null)
  const [tipValue, setTipValue] = useState(null)
  const [isSelected, setIsSelected] = useState('none')
  const [feedRouterScheduled, setFeedRouterScheduled] = useState(false);
  const userTipPercent = useStore(state => state.userTipPercent);
	const [userSearch, setUserSearch] = useState({ search: '' })
  const [channels, setChannels] = useState([])
  const [curators, setCurators] = useState([])
  const [selectedCurators, setSelectedCurators] = useState([])
  const [selectedChannels, setSelectedChannels] = useState([])
  const [tipDistribution, setTipDistribution] = useState({curators: [], creators: [], totalTip: null, totalPoints: null})
  const [totalTip, setTotalTip] = useState(0)
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  const [initValue, setInitValue] = useState(50)
  const [initHour, setInitHour] = useState('Hr')
  const [initMinute, setInitMinute] = useState('0')
  const [cronId, setCronId] = useState(null)
  const [activeCron, setActiveCron] = useState(null)
  const [jobScheduled, setJobScheduled] = useState(false);

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

  const ScheduleTaskForm = () => {
    const [hour, setHour] = useState(initHour);
    const [minute, setMinute] = useState(initMinute);

    // Generate options for hours (0-23)
    const hoursOptions = [
      { value: 'Hr', label: 'Hr' },
      ...Array.from({ length: 24 }, (_, i) => ({
          value: i.toString().padStart(2, '0'),
          label: i.toString().padStart(2, '0'),
      })),
  ];

    // Generate options for minutes (00, 30)
    const minutesOptions = [
      { value: '0', label: 'Min' },
      { value: '00', label: '00' },
      { value: '30', label: '30' },
    ];

    const handleHourChange = (event) => {
      setHour(event.target.value);
      setInitHour(event.target.value);
    };

    const handleMinuteChange = (event) => {
      setMinute(event.target.value);
      setInitMinute(event.target.value);
    };

    const handleSubmit = async () => {
      // Schedule the task with the selected hour and minute
      let minutes = minute
      if (minute == '0') {
        minutes = '00'
      }
      const schedTime = `${minutes} ${hour} * * *`;
      const { shuffle, time, tags, channels, curators } = userQuery
      // const timeRange = getTimeRange(time)
      // getUserSearch(timeRange, tags, channels, curators, null, shuffle)
      console.log(schedTime)
      async function postSchedule(shuffle, time, tags, channels, curators, schedTime) {
        const fid = await store.fid
        const uuid = await store.signer_uuid
        const percent = initValue

        try {
          setLoading(true)
          setInitHour('Hr')
          setInitMinute('0')
          const response = await axios.post('/api/curation/postTipSchedule', { fid, uuid, shuffle, time, tags, channels, curators, percent, schedTime })
          let schedData = []

          if (response && response.status !== 200) {
            setLoading(false)
            console.log(response)
            setModal({on: true, success: false, text: 'Tip scheduling failed'});
            setTimeout(() => {
              setModal({on: false, success: false, text: ''});
            }, 2500);
          } else {
            setLoading(false)
            console.log(response)

            setModal({on: true, success: true, text: response.data.message});
            setTimeout(() => {
              setModal({on: false, success: false, text: ''});
            }, 2500);
          }  
          return schedData
        } catch (error) {
          console.error('Error submitting data:', error)
          return null
        }
      }
    
      const schedData = await postSchedule(shuffle, time, tags, channels, curators, schedTime)
    };

    return (
      <>
        <div className={`flex-col ${(hour !== 'Hr' && isLogged) ? 'follow-select' : 'follow-locked'}`} style={{backgroundColor: '', borderRadius: '5px', width: '240px', gap: '0.25rem', alignItems: 'center', justifyContent: 'center', padding: '6px 8px 6px 8px', height: '60px', margin: '2px 0 2px 10px', cursor: 'default', maxWidth: '150px'}}>
          <div className='flex-row' style={{gap: '0.5rem'}}>
            <select id="hourSelect" value={hour} onChange={handleHourChange} style={{backgroundColor: '#adf', borderRadius: '4px'}}>
              {hoursOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select id="minuteSelect" value={minute} onChange={handleMinuteChange} style={{backgroundColor: '#adf', borderRadius: '4px'}}>
              {minutesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => {
            if (!isLogged) { 
              account.LoginPopup() 
            } else if (hour !== 'Hr') {
              handleSubmit() 
            }}} style={{backgroundColor: 'transparent', fontWeight: '600', color: '#fff', cursor: (hour !== 'Hr' || !isLogged) ? 'pointer' : 'default', fontSize: '12px', padding: '0'}}>MODIFY SCHEDULE</button>
        </div>
        {!isLogged && (<div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
          <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-70%, -30%)' }}>
            <FaLock size={8} color='#eee' />
          </div>
        </div>)}
      </>
    );
  }

  const updateSearch = (key, value) => {
    setSearch(prevState => ({
      ...prevState,
      [key]: value
    }));
  };

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


  // useEffect(() => {
  //   if (feedRouterScheduled) {
  //     feedRouter();
  //     setFeedRouterScheduled(false);
  //   } else {
  //     const timeoutId = setTimeout(() => {
  //       feedRouter();
  //       setFeedRouterScheduled(false);
  //     }, 300);
  
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [userQuery, feedRouterScheduled]);


  const handleSelection = (type, selection) => {
    if (type == 'shuffle') {
      setIsSelected('none')
    } else {
      setIsSelected(type)
    }
  }

  // useEffect(() => {
  //   // console.log(userFeed, totalTip)

  //   determineDistribution(userFeed, totalTip)

  // }, [userFeed])

  // useEffect(() => {
  //   // console.log(userFeed, totalTip)
  //   if (store.fid) {
  //     determineDistribution(userFeed, totalTip)
  //   }

  // }, [totalTip])

  const getName = (tag, value) => {
    const categoryOptions = queryOptions[qType];
  
    if (categoryOptions) {
      const tag = categoryOptions.find(tag => tag.value === value);
  
      if (tag) {
        console.log(tag.text)

        return tag.text;
      } else {
        return null; // Value not found
      }
    } else {
      return null; // Category not found
    }
  }

  async function postCast(castData) {
    if (castData.signer && castData.text) {
      try {
        const response = await axios.post('/api/postCast', {       
          signer: castData.signer,
          urls: castData.urls,
          // channel: castData.channel,
          channel: 'impact', // temp for testing
          parentUrl: castData.parentUrl, // cast hash or parent URL
          castText: castData.text,
        })
        if (response.status !== 200) {
          console.log(response)
          // need to revert recasts counter
        } else {
          clearCastText()
          shrinkBox()
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
          }, 2000);
        }
        console.log(response.status)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
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

  function openImagePopup(embed) {
    let newPopup = { ...showPopup }
    newPopup.open = true
    newPopup.url = embed.url
    setShowPopup(newPopup)
  }

  useEffect(() => {
    setIsLogged(store.isAuth)
    if (store.isAuth && jobScheduled) {
      getUserSchedule(store.fid)
      setJobScheduled(false);
    } else if (store.isAuth) {
      const timeoutId = setTimeout(() => {
        getUserSchedule(store.fid)
        setJobScheduled(false);
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [isLogged, store.isAuth, jobScheduled])

  const getUserSchedule = async (fid) => {
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


      console.log(userSchedule.data)
    }
    // getScheduledSearch
  }

  useEffect(() => {
    console.log('triggered')
    setIsLogged(store.isAuth)

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

  function feedRouter() {
    const { shuffle, time, tags, channels, curators } = userQuery
    const timeRange = getTimeRange(time)
    console.log(userQuery)
    getUserSearch(timeRange, tags, channels, curators, null, shuffle)
  }

  async function populateCast(casts) {
    let displayedCasts = []
    
    if (casts) {
      casts.forEach(cast => {
        let newCast = {
          author: {
            fid: cast.author_fid,
            pfp_url: cast.author_pfp,
            username: cast.author_username,
            display_name: cast.author_display_name,
            power_badge: false,
          },
          hash: cast.cast_hash,
          timestamp: cast.createdAt,
          text: cast.cast_text,
          impact_points: cast.impact_points,
          embeds: [],
          mentioned_profiles: [],
          replies: {
            count: 0
          },
          reactions: {
            recasts: [],
            likes: []
          },
          impact_balance: cast.impact_total,
          quality_absolute: cast.quality_absolute,
          quality_balance: cast.quality_balance
        }

        displayedCasts.push(newCast)
      });
    }
    return displayedCasts
  }



  async function getUserAllowance(fid) {
    if (isLogged && !userAllowance && fid) {
      let remaningAllowance = 0
      try {
        const responseTotal = await axios.get('/api/degen/getUserAllowance', {
          params: {
            fid: fid,
          }
        })
        if (responseTotal?.data) {
          remaningAllowance = await responseTotal.data.remaining
        }
        console.log(remaningAllowance)
        setTotalTip(remaningAllowance * userTipPercent / 100)
        if (!isNaN(remaningAllowance)) {
          setUserAllowance(remaningAllowance)
          setTipValue(remaningAllowance)
        } else {
          setUserAllowance(0)
        }
      } catch (error) {
        console.error('Error creating post:', error);
        setUserAllowance(0)
      }
    }
  }


  function determineDistribution(ulfilteredCasts, tip) {

    function filterObjects(castArray, filterFid) {
      return castArray.filter(obj => {
        if (obj.author.fid != filterFid) {
          obj.impact_points = obj.impact_points.filter(point => point.curator_fid != filterFid);
          return true; 
        }
        return false;
      });
    }
  
  let casts = filterObjects(ulfilteredCasts, store.fid);
  
  console.log(casts);

    const totalBalanceImpact = casts.reduce((total, obj) => {
      return total + obj.impact_balance - obj.quality_balance;
    }, 0);
    console.log(totalBalanceImpact)
    let newDistribution = []
    let newCurators = []
    if (casts && tip) {
      casts.forEach(cast => {
        let ratio = 1
        if (cast.impact_points && cast.impact_points.length > 0) {
          ratio =  0.92
        }
        let castTip = Math.floor((cast.impact_balance  - cast.quality_balance) / totalBalanceImpact * ratio * tip)
        // console.log(castTip)
        let castDistribution = null
        castDistribution = {
          fid: cast.author.fid,
          cast: cast.hash,
          tip: castTip,
          coin: '$degen'
        }
        newDistribution.push(castDistribution)
        const curators = cast.impact_points
        // console.log(curators)
        curators.forEach(curator => {
          // console.log(newCurators)
          let points = curator.impact_points
          // console.log(curator.impact_points)
          let curatorTip = Math.floor(curator.impact_points / totalBalanceImpact * 0.08 * tip)
          let curatorDistribution = null
          curatorDistribution = {
            fid: curator.curator_fid,
            cast: 'temp',
            points: points,
            // tip: curatorTip,
            coin: '$degen'
          }
          newCurators.push(curatorDistribution)
        })
      })


      const tempCasts = newCurators.filter(obj => obj.cast === 'temp');

      tempCasts.sort((a, b) => a.fid - b.fid);
      // console.log(tempCasts)
  
      // Combine objects with the same fid by adding up the tip
      const combinedCasts = tempCasts.reduce((acc, curr) => {
        const existingCast = acc.find(obj => obj.fid === curr.fid);
        if (existingCast) {
          existingCast.points += curr.points;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
  
      setTipDistribution({curators: combinedCasts, creators: newDistribution, totalPoints: totalBalanceImpact, totalTip: Math.round(tip)})
    }

  }

  async function getUserSearch(time, tags, channel, curator, text, shuffle) {
    const fid = await store.fid

    const timeRange = getTimeRange(time)

    async function getSearch() {
      try {
        const response = await axios.get('/api/curation/getUserSearch', {
          params: { time, tags, channel, curator, text, shuffle }
        })
        let casts = []
        if (response && response.data && response.data.casts.length > 0) {
          casts = response.data.casts
        }
        // console.log(casts)

        return casts
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }
    }

    const casts = await getSearch(timeRange, tags, channel, curator, text, shuffle)
    let filteredCasts
    let sortedCasts

    if (casts) {

      // console.log(casts)
      filteredCasts = await casts.reduce((acc, current) => {
        const existingItem = acc.find(item => item._id === current._id);
        if (!existingItem) {
          acc.push(current);
        }
        return acc;
      }, [])
      // console.log(filteredCasts)
      sortedCasts = filteredCasts.sort((a, b) => b.impact_total - a.impact_total);
      // console.log(sortedCasts)

    }

    let displayedCasts = await populateCast(sortedCasts)
    // setUserFeed(displayedCasts)

    let castString

    if (sortedCasts) {
      const castHashes = sortedCasts.map(obj => obj.cast_hash)
      castString = castHashes.join(',');
    }


    async function populateCasts(fid, castString) {
      try {
        const response = await axios.get('/api/curation/getCastsByHash', {
          params: { fid, castString }
        })
        return response
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }
    }

    const populateResponse = await populateCasts(fid, castString)

    let populatedCasts = []

    if (populateResponse) {
      populatedCasts = populateResponse.data.casts
      // setUserFeed(populatedCasts)
    }

    for (let i = 0; i < populatedCasts.length; i++) {
      const obj2 = populatedCasts[i]
      let obj1 = displayedCasts.find(cast => cast.hash === obj2.hash)
      if (obj1) {
        Object.keys(obj2).forEach(key => {
          obj1[key] = obj2[key]
        })
      } else {
        displayedCasts.push({...obj2})
      }
    }

    setUserFeed(displayedCasts)


    async function checkEmbedTypeForCasts(casts) {
      // Map over each cast and apply checkEmbedType function
      const updatedCasts = await Promise.all(casts.map(async (cast) => {
        return await checkEmbedType(cast);
      }));
    
      return updatedCasts;
    }
    
    // Usage
    const castsWithImages = await checkEmbedTypeForCasts(displayedCasts);
    setUserFeed(castsWithImages);


    async function getSubcast(hash, userFid) {
      if (hash && userFid) {
        try {
          const response = await axios.get('/api/getCastByHash', {
            params: { hash, userFid }
          })
          const castData = response.data.cast.cast
          if (castData) {
            console.log(castData)
            return castData
          } else {
            return null
          }
        } catch (error) {
          console.error('Error submitting data:', error)
          return null
        }
      }
    }

    async function populateSubcasts(cast, fid) {
      const { embeds } = cast;
      if (embeds && embeds.length > 0) {
        const updatedEmbeds = await Promise.all(embeds.map(async (embed) => {
          if (embed.type == 'subcast') {
            const subcastData = await getSubcast(embed.cast_id.hash, fid)
            const checkImages = await checkEmbedType(subcastData)
            return { ...embed, subcast: checkImages };
          } else {
            return { ...embed }
          }
        }));
        return { ...cast, embeds: updatedEmbeds };
      }
      
      return cast;
    }
    
    async function populateEmbeds(cast) {
      const { embeds } = cast
      // console.log(embeds)
      if (embeds && embeds.length > 0) {
        const updatedEmbeds = await Promise.all(embeds.map(async (embed) => {
          // console.log(embed.type)
          if (embed && embed.url && embed.type == 'html') {
            // console.log(embed)
            try {
              const metaData = await axios.get('/api/getMetaTags', {
                params: { url: embed.url } })
              if (metaData && metaData.data) {
                return { ...embed, metadata: metaData.data };
              } else {
                return { ...embed }
              }
            } catch (error) {
              return { ...embed }
            }
          } else {
            return { ...embed }
          }
        }));
        return { ...cast, embeds: updatedEmbeds };
      }
      
      return cast;
    }

    async function checkEmbeds(casts) {
      const updatedCasts = await Promise.all(casts.map(async (cast) => {
        return await populateEmbeds(cast);
      }));
    
      return updatedCasts;
    }

    async function checkSubcasts(casts, fid) {
      const updatedCasts = await Promise.all(casts.map(async (cast) => {
        return await populateSubcasts(cast, fid);
      }));
    
      return updatedCasts;
    }

    const castsWithSubcasts = await checkSubcasts(castsWithImages, fid)
    console.log(castsWithSubcasts)
    setUserFeed(castsWithSubcasts);


    const castsWithEmbeds = await checkEmbeds(castsWithSubcasts)
    console.log(castsWithEmbeds)
    setUserFeed(castsWithEmbeds);

  }

  const ExpandImg = ({embed}) => {
    return (
      <>
        <div className="overlay" onClick={closeImagePopup}></div>
        <img loading="lazy" src={embed.showPopup.url} className='popupConainer' alt="Cast image embed" style={{aspectRatio: 'auto', maxWidth: screenWidth, maxHeight: screenHeight, cursor: 'pointer', position: 'fixed', borderRadius: '12px'}} onClick={closeImagePopup} />
      </>
    )
  }

  const Modal = () => {
    return (
      <>
        <div className="modalConainer" style={{borderRadius: '10px', backgroundColor: modal.success ? '#9e9' : '#e99'}}>
          <div className='flex-col' id="notificationContent" style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '20px', width: '380px', maxWidth: '380px', fontWeight: '400', height: 'auto', padding: '6px', fontSize: '16px'}}>{modal.text}</div>
          </div>
        </div>
      </>
    )
  }

  const goToUserProfile = async (event, author) => {
    event.preventDefault()
    const username = author.username
    await store.setUserData(author)
    router.push(`/${username}`)
  }

  const HorizontalScale = () => {
    const [value, setValue] = useState(initValue);
    const [allowance, setAllowance] = useState(() => {
      return userAllowance;
    });
    useEffect(() => {
      setAllowance(userAllowance);
    }, [userAllowance]);
  
    const handleChange = (event) => {
      setValue(parseInt(event.target.value));
    };
    
    const tip = Math.round(allowance * value / 100);

    const handleMouseLeave = () => {
      store.setUserTipPercent(value);
      setTotalTip(tip)
      setInitValue(value)
    };
  
    return (
      <div className='flex-row' style={{ width: '100%', padding: '3px 12px', gap: '1.0rem', alignItems: 'center' }}
      onMouseLeave={handleMouseLeave}>
        <input
          type="range"
          min="1"
          max="100"
          value={value}
          onChange={handleChange}
          style={{ width: '100%' }}
        />

        <div className='flex-col' style={{ textAlign: 'center', color: '#def', width: '80px', gap: '0.25rem' }}>
          <div style={{ textAlign: 'center', color: '#def', fontSize: '18px', fontWeight: '700' }}>{formatNum(tip)}</div>
          <div style={{ textAlign: 'center', color: '#def', fontSize: '12px' }}>({value}%)</div>
        </div>
      </div>
    );
  };

  function clearCastText() {
    setCastData({ ...castData, text: '', parentUrl: null });
  }

	function onChange(e) {
		setCastData( () => ({ ...castData, [e.target.name]: e.target.value }) )
	}

  async function routeCast() {
    console.log(castData.text.length)
    if (store.isAuth && store.signer_uuid && castData.text.length > 0 && castData.text.length <= 320) {
      console.log(store.isAuth, castData.text)
      try {
        let updatedCastData = { ...castData }
        updatedCastData.fid = store.fid
        updatedCastData.signer = store.signer_uuid
        setCastData(updatedCastData)
        postCast(castData)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
    else if (store.isAuth && store.signer_uuid && castData.text.length > 320) {
      try {
        const username = store.usernameFC
        const ipfsData = await axios.post('/api/postToIPFS', { username: username, text: castData.text, fid: store.fid })
        const longcastHash = ipfsData.data.ipfsHash
        let updatedCastData = { ...castData }
        updatedCastData.fid = store.fid
        updatedCastData.signer = store.signer_uuid
        const longcastFrame = `${baseURL}/${username}/articles/${longcastHash}`
        updatedCastData.text = longcastFrame
        updatedCastData.urls.push(longcastFrame)
        setCastData(updatedCastData)
        console.log(longcastFrame)
        await postCast(updatedCastData)
        console.log(longcastHash)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    } else {
      return
    }
  }

  const expandBox = () => {
    if (textboxRows == 1) {
      setIsFocused(true)
      setTextboxRows(4)
    }
  }

  const shrinkBox = () => {
    console.log(castData.text)
    if (textboxRows > 1 && castData.text.length < 40) {
      setIsFocused(false)
      setTextboxRows(1)
    }
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
    try {
      const response = await axios.delete('/api/curation/deleteTipSchedule', {
        params: {
          cronId: cronId, fid: store.fid
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
    try {
      const response = await axios.get('/api/curation/updateTipSchedule', {
        params: {
          cronId: cronId, fid: store.fid
        }
      })
      console.log(response)

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

  async function postMultiTip() {

    console.log(tipDistribution)

    let fidSet = []

    const curatorList = tipDistribution.curators
    if (curatorList && curatorList.length > 0) {
      curatorList.forEach(curator => {
        fidSet.push(curator.fid)
      })
    }
    // console.log(fidSet)
    let returnedCurators = []
    if (fidSet.length > 0) {

      async function getCuratorsByFid(fidSet) {
        let userFids = fidSet.join(',')
        try {
          const response = await axios.get('/api/curation/getCuratorsByFid', {
            params: {
              name: userFids,
            }
          })
          if (response) {
            const curators = response.data.users
            // console.log(curators)
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

      returnedCurators = await getCuratorsByFid(fidSet)
    }

   
    // Map to create a lookup table for faster access
    const lookupTable = returnedCurators.reduce((acc, obj) => {
        acc[obj.fid] = obj;
        return acc;
    }, {});
  
    const creatorData = tipDistribution.creators
    // Construct the third array
    const curatorData = curatorList.map(obj => {
      const matchingObj = lookupTable[obj.fid];
      if (matchingObj) {
        return {
          fid: obj.fid,
          cast: matchingObj.set_cast_hash,
          coin: obj.coin,
          tip: Math.floor(obj.points / tipDistribution.totalPoints * tipDistribution.totalTip * 0.08)
        };
      } else {
        return null;
      }
    }).filter(obj => obj !== null);
    
    console.log(curatorData);

    const combinedLists = [...new Set([...creatorData, ...curatorData])];
    console.log(combinedLists)

    combinedLists.forEach(cast => {
      cast.text = `${cast.tip} ${cast.coin} via /impact`
    })
    console.log(combinedLists)


    if (combinedLists && combinedLists.length > 0 && store.signer_uuid) {
      setLoading(true)
      try {
        const response = await axios.post('/api/curation/postMultipleTips', {       
          signer: store.signer_uuid,
          fid: store.fid,
          data: combinedLists
        })
        if (response.status !== 200) {
          setLoading(false)
          console.log(response)
          setModal({on: true, success: false, text: 'Tipping all casts failed'});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);
          // need to revert recasts counter
        } else {
          setLoading(false)
          console.log(response)
          if (response?.data?.tip) {
            setUserAllowance(userAllowance - response.data.tip)
          }
          setModal({on: true, success: true, text: response.data.message});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);
        }
        console.log(response.status)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
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

{(userQuery.time && isLogged) ? (<div style={{border: '1px solid #777', padding: '8px', borderRadius: '10px', margin: '3px', backgroundColor: '#eef6ff11'}}>
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


        <div className='flex-row' style={{gap: '0.5rem', width: '100%'}}>

          {isLogged && (
            <a className="" title="" href={`/${store.userProfile.username}`} onClick={() => {goToUserProfile(event, store.userProfile)}}>
              <img loading="lazy" src={store.srcUrlFC} className="" alt={`${store.userDisplayNameFC} avatar`} style={{width: '40px', height: '40px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #abc', margin: '12px 0 8px 20px'}} />
            </a>
          )}
          <HorizontalScale />

          <ScheduleTaskForm />

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
    </div>) : (
      <div style={{width: '100%', fontSize: '20px', fontWeight: '400', textAlign: 'center', color: '#cde'}}>No schedule found</div>
    )
    }
    <div style={{margin: '0 0 70px 0'}}>

    {/* {(!userFeed) ? (
      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
        <Spinner size={31} color={'#999'} />
      </div>
    ) : (userFeed.map((cast, index) => (<Cast cast={cast} key={index} index={index} updateCast={updateCast} openImagePopup={openImagePopup} />)))} */}

    </div>
    <div>
      {showPopup.open && (<ExpandImg embed={{showPopup}} />)}
    </div>
    <div>
      {modal.on && <Modal />}
    </div>
  </div>
  )
}