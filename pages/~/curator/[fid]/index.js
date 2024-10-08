import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
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
import { decryptPassword } from '../../../../utils/utils';
const userSecret = process.env.USER_SECRET

export default function ProfilePage() {
  const router = useRouter();
  const { fid, points, app, userFid, pass } = router.query
  const [user, setUser] = useState(null)
  const { LoginPopup, isLogged, setPoints, setIsLogged, setFid } = useContext(AccountContext)
  const ref = useRef(null)
  const [textMax, setTextMax] = useState('430px')
  const [screenWidth, setScreenWidth ] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const userButtons = ['Curation', 'Casts', 'Casts + Replies']
  const [searchSelect, setSearchSelect ] = useState('Curation')
  const { isMobile } = useMatchBreakpoints();
  const [userFeed, setUserFeed] = useState(null)
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const [feedRouterScheduled, setFeedRouterScheduled] = useState(false);
  const [userRouterScheduled, setUserRouterScheduled] = useState(false);
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
  const initialQuery = {shuffle: true, time: '3days', tags: [], channels: [], curators: []}
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
  // console.log('updated', fid)

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
    if (app && app == 'mini' && userFid && pass) {
      const decodedParam = decodeURIComponent(pass);
      let decryptedPass = decryptPassword(decodedParam, userSecret)
      let decryptedFid = decryptedPass.slice(10);
      console.log('userFid', userFid)
      if (userFid == decryptedFid) {
        setIsLogged(true)
        setFid(Number(userFid))
      }
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
    // getUser(fid)
  }, [fid]);

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


  useEffect(() => {
    if (userRouterScheduled) {
      if (user && fid && fid !== '-') {
        console.log('2')
        feedRouter()

      }
      setUserRouterScheduled(false);
    } else {
      const timeoutId = setTimeout(() => {
        if (user && fid && fid !== '-') {
          console.log('3')
          feedRouter()
        }
        setUserRouterScheduled(false);
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [user, userRouterScheduled]);

  useEffect(() => {
    // console.log('updated', userQuery)
    if (feedRouterScheduled) {
      feedRouter();
      setFeedRouterScheduled(false);
    } else {
      const timeoutId = setTimeout(() => {
        feedRouter();
        setFeedRouterScheduled(false);
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [searchSelect, userQuery, feedRouterScheduled])

  function feedRouter() {
    // console.log(searchSelect)
    // if (user && searchSelect == 'Casts') {
    //   getLatestUserCasts(fid, fid)
    // } else if (searchSelect == 'Casts + Replies') {
    //   getUserFeed(fid, false, fid)
    // } else if (searchSelect == 'Curation') {
      const { shuffle, time, tags, channels, curators, points } = userQuery
      const timeRange = getTimeRange(time)
      // console.log(userQuery)
      getUserSearch(timeRange, tags, channels, curators, null, shuffle, points)
    // }
  }
  
  async function getUserSearch(time, tags, channel, curator, text, shuffle, points) {

    async function getSearch(time, tags, channel, curator, text, shuffle, points) {
      try {
        const response = await axios.get('/api/curation/getUserSearch', {
          params: { time, tags, channel, curator, text, shuffle, points }
        })
        let casts = []
        if (response && response.data && response.data.casts.length > 0) {
          casts = response.data.casts
        }
        return casts
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }
    }

    const casts = await getSearch(time, tags, channel, curator, text, shuffle, points)
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
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      {user && (<CuratorData {...{ show: (isLogged && user), user, textMax }} />)}
      {/* <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-evenly', margin: '0', borderBottom: '1px solid #888'}}>
        {userButtons.map((btn, index) => (
          <FeedMenu {...{buttonName: btn, searchSelect, searchOption, isMobile }} key={index} />))}
      </div> */}

      {searchSelect == 'Curation' && (

      <div className='flex-row' style={{justifyContent: 'space-between', marginTop: '15px', marginBottom: '30px'}}>
        <div className='flex-row' style={{gap: '0.5rem'}}>
          <TopPicks handleSelection={handleSelection} selection={'picks'} />
          <Shuffle handleSelect={handleSelect} selection={'shuffle'} userQuery={userQuery} />
        </div>

        <Time handleSelection={handleSelection} handleSelect={handleSelect} userQuery={userQuery} options={queryOptions.time} selection={'time'} isSelected={isSelected} isMobile={isMobile} btnText={btnText} />

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

        <div style={{position: 'relative'}}>
          <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == 'channels') ? '2px solid #99ddff' : '1px solid #abc', height: '28px', marginRight: '4px'}} onMouseEnter={() => {handleSelection('channels')}} onMouseLeave={() => {handleSelection('none')}}>
            <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
              <AiOutlineBars size={15} color='#eee' />
              <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0', color: userQuery['channels'].length == 0 ? '#aaa' : ''}}>{isMobile ? '' : userQuery['channels'].length == 0 ? 'All channels' : 'Channels'}</span>
            </div>
          </div>
        </div>

        {(isSelected == 'channels') && (
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
          )}
        </div>
      )}

      <div style={{margin: '0 0 70px 0'}}>
        {(!userFeed || userFeed.length == 0) ? (
        <div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
          <Spinner size={31} color={'#999'} />
        </div>
        ) : (userFeed.map((cast, index) => (<Cast {...{cast, key: index, index, updateCast, openImagePopup, ecosystem: eco.ecosystem_points_name, self: false, app}} />)))}
      </div>
      <ExpandImg  {...{show: showPopup.open, closeImagePopup, embed: {showPopup}, screenWidth, screenHeight }} />
    </div>
  );
}