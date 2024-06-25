import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { AccountContext } from '../../context'
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints'
import useStore from '../../utils/store'
import axios from 'axios';
import { FaSearch, FaLock, FaRegStar, FaRegClock, FaRegTrashAlt, FaPen, FaPause, FaPlus } from "react-icons/fa"
import { AiOutlineLoading3Quarters as Loading } from "react-icons/ai";
// import mql from '@microlink/mql';
import { useRouter } from 'next/router';
import Cast from '../../components/Cast'
import { formatNum, getTimeRange, checkEmbedType, isAlphanumeric } from '../../utils/utils';
import { IoShuffleOutline as Shuffle, IoPeople, IoPeopleOutline } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import { GoTag } from "react-icons/go";
import { AiOutlineBars } from "react-icons/ai";
import { IoCaretForwardOutline as Forward } from "react-icons/io5";
import Spinner from '../../components/Spinner';
import { Degen } from '../assets';
import { GiMeat, GiTwoCoins } from "react-icons/gi";
import Button from '../../components/Ecosystem/Button';
import Description from '../../components/Ecosystem/Description';
import InputField from '../../components/Ecosystem/InputField';
import Dropdown from '../../components/Ecosystem/Dropdown';
import { GrFormPrevious, GrFormNext } from "react-icons/gr";

export default function Ecosystem() {
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
  const [channelSearched, setChannelSearched] = useState(false)
  const [modSearched, setModSearched] = useState(false)
  const [selectedModerators, setSelectedModerators] = useState([])
  const [tipDistribution, setTipDistribution] = useState({curators: [], creators: [], totalTip: null, totalPoints: null})
  const [totalTip, setTotalTip] = useState(0)
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  const [initValue, setInitValue] = useState(50)
  const [initHour, setInitHour] = useState('Hr')
  const [initMinute, setInitMinute] = useState('0')
  const [cronId, setCronId] = useState(null)
  const [activeCron, setActiveCron] = useState(null)
  const [jobScheduled, setJobScheduled] = useState(false);
  const [loadedSchedule, setLoadedSchedule] = useState(false)
  const [loadingMod, setLoadingMod] = useState(false)
  const [loadingChannel, setLoadingChannel] = useState(false)
  const tokenInfo = [{token: '$DEGEN', set: true}, {token: '$TN100x', set: true}]
  const [tokenData, setTokenData] = useState(tokenInfo)
  const [tokensSelected, setTokensSelected] = useState(['$DEGEN'])
  const availableTokens = ['$DEGEN', '$TN100x']
  const [filterChannels, setFilterChannels] = useState([])
  const [filterModerators, setFilterModerators] = useState([])
  const initialSubmit = {pass: false, target: null}
  const [submitCheck, SetSubmitCheck] = useState(initialSubmit)
  const [ecosystemData, setEcosystemData] = useState([])
  const [userEcosystems, setUserEcosystems] = useState([])
  const [allEcosystems, setAllEcosystems] = useState([])
  const ecosystemRules = {
    start: false, 
    fid: null, 
    nameField: false, 
    name: null, 
    points: '$', 
    dropdown: null,
    pointsField: false, 
    moderators: null, 
    channels: null, 
    channelCuratorThreshold: 1,
    channelPointThreshold: 1,
    rules: [''],
    powerbadge: false, 
    followingChannel: false, 
    followingOwner: false, 
    holdingNFT: false, 
    nfts: [], 
    holdingERC20: false, 
    erc20s: [],
    ecoRules: [{rule: '', isSet: 'empty'}],
    incentives: [{condition: 'none', isSet: 'empty', state: {type: null}}],
    eligibility: [{condition: 'none', isSet: 'empty', state: {type: null}}],
  }
  const controller = {
    name: 'empty', 
    channel: 'empty', 
    moderators: 'empty', 
    nameDescription: 'Choose an ecosystem name', 
    pointsDescription: 'Choose a name for the points system',
    rules: ['empty'],
    next: 'none',
    prev: 'none',
    prevCheck: false,
    nextCheck: false,
  }
  const [formController, setFormController] = useState(controller)
  const [newEcosystem, setNewEcosystem] = useState(ecosystemRules)
  const conditions = [
    { value: 'none', label: 'Choose condition' },
    { value: 'powerbadge', label: 'User holds Powerbadge' },
    { value: 'follow-channel', label: 'User follows Channel' },
    { value: 'follow-owner', label: 'User follows Channel Owner' },
    { value: 'nft', label: 'User holds NFT' },
    { value: 'erc20', label: 'User holds ERC20 Token' },
    { value: 'hypersub', label: 'User holds Hypersub' },
  ]
  const points = [
    { value: 0, label: 'Choose' },
    { value: 1, label: '$IMPACT' },
    { value: 2, label: '$OCTANT' },
  ]
  const incentives = [
    { value: 'none', label: 'Choose incentives' },
    { value: 'tip', label: 'Points for tipping' },
    { value: 'qdao', label: 'Points for qDAO down/upvote' },
    { value: 'percent-tipped', label: 'Percent Tipped to Curator' },
  ]
  const curatorThreshold = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ]

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
    if (newEcosystem && formController) {
      let passed = true
      for (const rule of newEcosystem.ecoRules) {
        if (rule.isSet == 'error') {
          passed = false
        }
      }
      for (const incentive of newEcosystem.incentives) {
        if (incentive.isSet == 'error') {
          passed = false
        }
      }
      for (const eligibility of newEcosystem.eligibility) {
        if (eligibility.isSet == 'error') {
          passed = false
        }
      }
      if ((formController.name && formController.name !== 'working') ||( formController.points && formController.points !== 'working')) {
        passed = false
      }
      if (passed) {
        const pass = {pass: true, target: 'submit'}
        SetSubmitCheck(pass)
        updateEcosystemData()
      } else {
        const pass = {pass: false, target: null}
        SetSubmitCheck(pass)
      }
    } else {
      const pass = {pass: false, target: null}
      SetSubmitCheck(pass)
    }


  }, [newEcosystem, formController])


  function updateEcosystemData() {
    let ecoName = ''
    let ecoOwner = store.usernameFC
    let ecoPoints = ''
    let ecoChannels = []
    let ecoModerators = []
    let ecoCuratorThreshold = 1
    let ecoPointsThreshold = 1
    let ecoIncentives = []
    let ecoRules = []
    let ecoEligibility = []

    ecoName = newEcosystem.name
    ecoPoints = newEcosystem.points
    if (selectedChannels && selectedChannels.length > 0) {
      for (const channel of selectedChannels) {
        
        let channelData = {url: channel.parent_url, name: channel.id}
        ecoChannels.push(channelData)
      }
    }
    if (selectedModerators && selectedModerators.length > 0) {
      for (const moderator of selectedModerators) {
        let moderatorData = {fid: moderator.fid, username: moderator.username}
        ecoModerators.push(moderatorData)
      }
      ecoCuratorThreshold = newEcosystem.channelCuratorThreshold
      ecoPointsThreshold = newEcosystem.channelPointThreshold
    }
    if (newEcosystem.eligibility && newEcosystem.eligibility.length > 0) {
      for (const eligibility of newEcosystem.eligibility) {
        if (eligibility.condition == 'powerbadge') {
          let condition = {type: 'powerbadge', condition: true}
          ecoEligibility.push(condition)
        } else if (eligibility.condition == 'powerbadge' && eligibility.isSet == 'working') {

          ecoEligibility.push(condition)
        } else if (eligibility.condition == 'follow-owner' && eligibility.isSet == 'working' && selectedChannels && selectedChannels.length > 0) {
          let condition = {type: 'follow-owner', condition: true}
          ecoEligibility.push(condition)
        } else if (eligibility.condition == 'follow-channel' && eligibility.isSet == 'working' && selectedChannels && selectedChannels.length > 0) {
          let condition = {type: 'follow-channel', condition: true}
          ecoEligibility.push(condition)
        } else if (eligibility.condition == 'nft' && eligibility.isSet == 'working') {
          let chainAddress = 'eip155:1'
          if (eligibility.state && eligibility.state && eligibility.state.chain) {
            if (eligibility.state.chain == '1') {
              chainAddress = 'eip155:1'
            } else if (eligibility.state.chain == '2') {
              chainAddress = 'eip155:10'
            } else if (eligibility.state.chain == '3') {
              chainAddress = 'eip155:8453'
            } else if (eligibility.state.chain == '4') {
              chainAddress = 'eip155:42161'
            } else if (eligibility.state.chain == '5') {
              chainAddress = 'eip155:7777777'
            } else if (eligibility.state.chain == '6') {
              chainAddress = 'eip155:137'
            } else if (eligibility.state.chain == '7') {
              chainAddress = 'eip155:666666666'
            } else if (eligibility.state.chain == '8') {
              chainAddress = 'eip155:5112'
            }
          }
          let condition = {type: 'nft', condition: true, address: eligibility.state.nftAddress, chain: chainAddress}
          ecoEligibility.push(condition)
        } else if (eligibility.condition == 'erc20' && eligibility.isSet == 'working') {
          let condition
          if (eligibility.state.token !== '0') {
            if (eligibility.state.token == '1') {
              condition = {type: 'erc20', chain: 'eip155:1', token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', min: eligibility.state.tokenMinValue}
            } else if (eligibility.state.token == '2') {
              condition = {type: 'erc20', chain: 'eip155:10', token: '0x4200000000000000000000000000000000000042', min: eligibility.state.tokenMinValue}
            } else if (eligibility.state.token == '3') {
              condition = {type: 'erc20', chain: 'eip155:8453', token: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', min: eligibility.state.tokenMinValue}
            } else if (eligibility.state.token == '4') {
              condition = {type: 'erc20', chain: 'eip155:5112', token: '0x5b5dee44552546ecea05edea01dcd7be7aa6144a', min: eligibility.state.tokenMinValue}
            } else if (eligibility.state.token == '5') {
              condition = {type: 'erc20', chain: 'eip155:7777777', token: '0xa6b280b42cb0b7c4a4f789ec6ccc3a7609a1bc39', min: eligibility.state.tokenMinValue}
            } else if (eligibility.state.token == '6') {
              condition = {type: 'erc20', chain: 'eip155:1', token: '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429', min: eligibility.state.tokenMinValue}
            } else if (eligibility.state.token == '7') {
              condition = {type: 'erc20', chain: 'eip155:1', token: '0xba5BDe662c17e2aDFF1075610382B9B691296350', min: eligibility.state.tokenMinValue}
            } else if (eligibility.state.token == '8') {
              condition = {type: 'erc20', chain: eligibility.state.chain, token: eligibility.state.token, min: eligibility.state.tokenMinValue}
            }
            ecoEligibility.push(condition)
          }
        } else if (eligibility.condition == 'hypersub' && eligibility.isSet == 'working') {
          let condition = {type: 'hypersub', condition: true, address: eligibility.state.hypersubAddress}
          ecoEligibility.push(condition)
        }
      }
    }
    if (newEcosystem.incentives && newEcosystem.incentives.length > 0) {
      for (const incentive of newEcosystem.incentives) {
        if (incentive.condition == 'tip' && incentive.isSet == 'working') {
          let condition = {type: 'tip', value: parseInt(incentive.state.tip)}
          ecoIncentives.push(condition)
        } else if (incentive.condition == 'qdao' && incentive.isSet == 'working') {
          let condition = {type: 'qdao', upvote: incentive.state.qdaoUp, downvote: incentive.state.qdaoDown}
          ecoIncentives.push(condition)
        } else if (incentive.condition == 'percent-tipped' && incentive.isSet == 'working') {
          let condition = {type: 'percent-tipped', percent: incentive.state.tipPercent}
          ecoIncentives.push(condition)
        }
      }
    }
    if (newEcosystem.ecoRules && newEcosystem.ecoRules.length > 0) {
      for (const rule of newEcosystem.ecoRules) {
        if (rule.isSet == 'working') {
          let condition = {type: 'rule', value: rule.rule}
          ecoRules.push(condition)
        }
      }
    }
    const ecoData = {
      ecoName,
      ecoOwner,
      ecoPoints,
      ecoChannels,
      ecoModerators,
      ecoCuratorThreshold,
      ecoPointsThreshold,
      ecoIncentives,
      ecoRules,
      ecoEligibility,
    }
    console.log(ecoData)
    setEcosystemData(ecoData)
  }

  async function sendEcosystemRules() {
    // const (name, points, moderators, channels, powerbadge, )
    console.log(store.fid, ecosystemData)
    try {
      const response = await axios.post('/api/ecosystem/postEcosystemRules', {       
        fid: store.fid,
        data: ecosystemData
      })
      if (response) {
        console.log(response)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
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
    if (!isLogged) {
      setIsLogged(store.isAuth)
    }
    if (store.isAuth && jobScheduled) {
      getUserSchedule(store.fid)
      getUserEcosystems(store.fid)
      setJobScheduled(false);
    } else if (store.isAuth) {
      const timeoutId = setTimeout(() => {
        getUserSchedule(store.fid)
        getUserEcosystems(store.fid)
        setJobScheduled(false);
      }, 300);
  
      return () => clearTimeout(timeoutId);
    }
  }, [isLogged, store.isAuth, jobScheduled])

  useEffect(() => {
    getEcosystems()
  }, [])

  const getEcosystems = async () => {
    try {
      const ecosystemsData = await axios.get('/api/ecosystem/getEcosystems')
      if (ecosystemsData) {
        const ecosystems = ecosystemsData.data.ecosystems
        console.log(ecosystems)
        setAllEcosystems(ecosystems)
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }

  const getUserEcosystems = async (fid) => {
    try {
      const ecosystemsData = await axios.get('/api/ecosystem/getUserEcosystems', { params: { fid } })
      if (ecosystemsData) {
        const ecosystems = ecosystemsData.data.ecosystems
        console.log(ecosystems)
        setUserEcosystems(ecosystems)
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }


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

  useEffect(() => {
    console.log('triggered')
    if (!isLogged) {
      setIsLogged(store.isAuth)
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
  
    const handleChange = (event) => {
      setValue(parseInt(event.target.value));
    };

    const handleMouseLeave = () => {
      store.setUserTipPercent(value);
      setInitValue(value)
    };
  
    return (
      <div className='flex-row' style={{ width: '100%', padding: '3px 12px', gap: '1.0rem', alignItems: 'center' }}
      onMouseLeave={handleMouseLeave} onTouchEnd={handleMouseLeave}>
        <input
          type="range"
          min="1"
          max="100"
          value={value}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
        <div className='flex-col' style={{gap: '0.45rem'}}>
          <div className='flex-row' style={{flexWrap: 'wrap', justifyContent: 'center', gap: '0.35rem', width: '150px'}}>
          {(tokenData && tokenData.length > 0) && tokenData.map((token, index) => {
            return ((token.allowance >= 0) && (<div key={index} className='flex-row' style={{border: token.set ? '1px solid #abc' : '1px solid #aaa', borderRadius: '6px', padding: '2px 5px', color: token.set ? '#9df' : '#ccc', gap: '0.35rem', alignItems: 'center', cursor: 'pointer', backgroundColor: token.set ? '#246' : 'transparent'}} onClick={() => {handleToken(token.token)}}>
              <div style={{textAlign: 'center', color: token.set ? '#9df' : '#ccc', fontSize: '14px', fontWeight: '700'}}>
                {value}%
              </div>
              {(token.token == '$DEGEN') ? (<Degen />) : (token.token == '$TN100x') ? (<GiMeat style={{transform: 'scaleX(-1)'}} />) : (<GiTwoCoins />)}
            </div>))
          })}
          </div>
          <div className='flex-row' style={{gap: '0.5rem', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{ textAlign: 'center', color: '#def', fontSize: '12px' }}>({value}%)</div><div style={{border: '1px solid #abc', fontSize: '12px', color: (tokensSelected.length == 0 || tokensSelected.length == 2) ? '#9df' : '#eee', padding: '1px 3px', borderRadius: '5px', backgroundColor: (tokensSelected.length == 0 || tokensSelected.length == 2) ? '#246' : 'transparent', cursor: 'pointer'}} onClick={() => {handleToken('All tokens')}}>SELECT ALL</div>
          </div>
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
    setLoadingChannel(true)
    setFilterChannels([])
    try {
      const response = await axios.get('/api/ecosystem/getOwnerChannels', {
        params: {
          fid: store.fid,
          name: name,
        }
      })
      if (response && response.data) {
        const channels = response.data.channels
        const channelsData = response.data.channels
        console.log(channels)
        setChannels(channels)
        setFilterChannels(channelsData)
        setChannelSearched(true)
        console.log(channelSearched, filterChannels.length)
      } else {
        setFilterChannels([])
        setChannelSearched(true)
        console.log(channelSearched, filterChannels.length)
      }
      setLoadingChannel(false)
    } catch (error) {
      console.error('Error submitting data:', error)
      setFilterChannels([])
      setLoadingChannel(false)
      setChannelSearched(true)
      console.log(channelSearched, filterChannels.length)
    }
  }


  async function getModerators(name) {
    console.log(name)
    setLoadingMod(true)
    setFilterModerators([])
    try {
      const response = await axios.get('/api/getUsers', {
        params: {
          fid: store.fid,
          name: name,
        }
      })
      if (response) {
        console.log(response)
        const moderators = response.data.users
        console.log(moderators)
        setFilterModerators(moderators)
        setModSearched(true)
      } else {
        setFilterModerators([])
        setModSearched(true)
      }
      setLoadingMod(false)
    } catch (error) {
      console.error('Error submitting data:', error)
      setLoadingMod(false)
      setFilterModerators([])
      setModSearched(true)
    }
  }

  // async function getCurators(name) {
  //   console.log(name)
  //   try {
  //     const response = await axios.get('/api/curation/getCurators', {
  //       params: {
  //         name: name,
  //       }
  //     })
  //     if (response) {
  //       const curators = response.data.users
  //       console.log(curators)
  //       setCurators(curators)
  //     }
  //     // console.log(channels)
  //   } catch (error) {
  //     console.error('Error submitting data:', error)
  //   }
  // }

  function onChannelChange(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  function onCuratorSearch(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  function addModerator(moderator) {
    console.log(moderator)

    const isModeratorSelected = selectedModerators.some((c) => c.fid === moderator.fid);

    if (isModeratorSelected) {
      setSelectedModerators(selectedModerators.filter((c) => c.fid !== moderator.fid));
    } else {
      setSelectedModerators([...selectedModerators, moderator]);
    }
  }

  function addChannel(channel) {
    console.log(channel)

    const isChannelSelected = selectedChannels.some((c) => c.url === channel.url);

    if (isChannelSelected) {
      setSelectedChannels(selectedChannels.filter((c) => c.url !== channel.url));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  }

  async function deleteSchedule() {
    console.log(cronId, store.fid)
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
    console.log(cronId, store.fid)
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

  function setupEcosystem(target) {
    // console.log(newEcosystem)
    let updatedNewEcosystem = {...newEcosystem}
    if (target == 'start') {
      updatedNewEcosystem.nameField = true
      setNewEcosystem(updatedNewEcosystem)
    } else if (target == 'cancel') {
      updatedNewEcosystem.nameField = false
      setNewEcosystem(updatedNewEcosystem)
    } else if (target == 'name') {
      updatedNewEcosystem.pointsField = true
      setNewEcosystem(updatedNewEcosystem)
    } else if (target == 'channels') {
      console.log(newEcosystem.channels)
      getChannels(newEcosystem.channels)
    } else if (target == 'moderators') {
      getModerators(newEcosystem.moderators)
    } else if (target == 'rules') {
      if (updatedNewEcosystem.ecoRules.length < 10) {
        updatedNewEcosystem.ecoRules.push({rule: '', isSet: 'empty'})
        setNewEcosystem(updatedNewEcosystem)
      }
    } else if (target == 'incentives') {
      if (updatedNewEcosystem.incentives.length < 6) {
        updatedNewEcosystem.incentives.push({condition: 'none', isSet: 'empty'})
        setNewEcosystem(updatedNewEcosystem)
      }
    } else if (target == 'eligibility') {
      if (updatedNewEcosystem.eligibility.length < 6) {
        updatedNewEcosystem.eligibility.push({condition: 'none', isSet: 'empty'})
        setNewEcosystem(updatedNewEcosystem)
      }
    } else if (target == 'submit') {
      console.log('submitted')
      sendEcosystemRules()
    }
    console.log(newEcosystem)
  }

  function clearInput(target) {
    let updatedNewEcosystem = {...newEcosystem}
    let updatedformController = {...formController}
    if (target == 'name') {
      updatedNewEcosystem.name = ''
      setNewEcosystem(updatedNewEcosystem)
      updatedformController.name = 'empty'
      updatedformController.nameDescription = 'Choose an ecosystem name'
      setFormController(updatedformController)
    } else if (target == 'points') {
      updatedNewEcosystem.points = '$'
      setNewEcosystem(updatedNewEcosystem)
      updatedformController.points = 'empty'
      updatedformController.pointsDescription = 'Choose a name for the points system'
      setFormController(updatedformController)
    } else if (target == 'channels') {
      updatedNewEcosystem.channels = ''
      setNewEcosystem(updatedNewEcosystem)
      updatedformController.channel = 'empty'
      setFormController(updatedformController)
      setFilterChannels([])
      setChannelSearched(false)
    } else if (target == 'moderators') {
      updatedNewEcosystem.moderators = ''
      setNewEcosystem(updatedNewEcosystem)
      updatedformController.moderators = 'empty'
      setFormController(updatedformController)
      setFilterModerators([])
      setModSearched(false)
    }
  }

  function ecoFields(event) {
    // console.log(event.target.name)
    // console.log(event.target.value)
    let updatedNewEcosystem = {...newEcosystem}
    updatedNewEcosystem.ecoRules[event.target.name].rule = event.target.value
    if (event.target.value.length == 0) {
      updatedNewEcosystem.ecoRules[event.target.name].isSet = 'empty'
    } else if (event.target.value.length < 5) {
      updatedNewEcosystem.ecoRules[event.target.name].isSet = 'error'
    } else {
      updatedNewEcosystem.ecoRules[event.target.name].isSet = 'working'
    }
    setNewEcosystem(updatedNewEcosystem)
  }

  function clearEcoField(target) {
    // console.log(target)
    let updatedNewEcosystem = {...newEcosystem}
    updatedNewEcosystem.ecoRules[target].rule = ''
    updatedNewEcosystem.ecoRules[target].isSet = 'empty'
    setNewEcosystem(updatedNewEcosystem)
  }

  function removeEcoField(target) {
    // console.log(target)
    let updatedNewEcosystem = {...newEcosystem}
    let rules = updatedNewEcosystem.ecoRules
    if (rules.length == 1) {
      updatedNewEcosystem.ecoRules[target].rule = ''
      updatedNewEcosystem.ecoRules[target].isSet = 'empty'
    } else {
      updatedNewEcosystem.ecoRules = rules.filter((_, i) => i !== target)
    }
    setNewEcosystem(updatedNewEcosystem)
  }

  function removeIncentiveField(target) {
    // console.log(target)
    let updatedNewEcosystem = {...newEcosystem}
    let incentives = updatedNewEcosystem.incentives
    if (incentives.length == 1) {
      updatedNewEcosystem.incentives[target].condition = 'none'
      updatedNewEcosystem.incentives[target].isSet = 'empty'
    } else {
      updatedNewEcosystem.incentives = incentives.filter((_, i) => i !== target)
    }
    setNewEcosystem(updatedNewEcosystem)
  }

  function removeEligibilityField(target) {
    // console.log(target)
    let updatedNewEcosystem = {...newEcosystem}
    let eligibility = updatedNewEcosystem.eligibility
    // console.log(eligibility)
    if (eligibility.length == 1) {
      updatedNewEcosystem.eligibility[target].condition = 'none'
      updatedNewEcosystem.eligibility[target].isSet = 'empty'
    } else {
      updatedNewEcosystem.eligibility = eligibility.filter((_, i) => i !== target)
    }
    console.log(updatedNewEcosystem.eligibility)

    setNewEcosystem(updatedNewEcosystem)
  }

  function setIncentives(value, target, state) {
    // console.log(value, target)
    let updatedNewEcosystem = {...newEcosystem}
    if (value == 'none') {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
      updatedNewEcosystem.incentives[target].condition = 'none'
    } else if (value == 'tip') {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
      updatedNewEcosystem.incentives[target].condition = 'tip'
    } else if (value == 'tip-percent') {
      updatedNewEcosystem.incentives[target].isSet = 'working'
      updatedNewEcosystem.incentives[target].condition = 'percent-tipped'
      updatedNewEcosystem.incentives[target].state = {...updatedNewEcosystem.incentives[target].state, ...state}
      // console.log(updatedNewEcosystem.incentives[target])
    } else if (value == 'percent-tipped') {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
      updatedNewEcosystem.incentives[target].condition = 'percent-tipped'
    } else if (value == 'qdao') {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
      updatedNewEcosystem.incentives[target].condition = 'qdao'
    } else if (value == 'tip-value') {
      if (state) {
        // console.log(state.tip)
        updatedNewEcosystem.incentives[target].state = {...updatedNewEcosystem.incentives[target].state, ...state}
        if (state && (state.tip <= 0 || isNaN(state.tip))) {
          // console.log(state.tip)
          updatedNewEcosystem.incentives[target].state.tip = 0
        }
        updatedNewEcosystem.incentives[target].isSet = 'working'
        updatedNewEcosystem.incentives[target].condition = 'tip'
      }
      // console.log(updatedNewEcosystem.incentives[target])
    } else if (value == 'qdao-up') {
      if (state) {
        // console.log(state.qdaoUp)
        updatedNewEcosystem.incentives[target].state = {...updatedNewEcosystem.incentives[target].state, ...state}
        if (state && (state.qdaoUp <= 0 || isNaN(state.qdaoUp))) {
          console.log(state.qdaoUp)
          updatedNewEcosystem.incentives[target].state.qdaoUp = 0
        }
        updatedNewEcosystem.incentives[target].isSet = 'working'
        updatedNewEcosystem.incentives[target].condition = 'qdao'
      }
      // console.log(updatedNewEcosystem.incentives[target])
    } else if (value == 'qdao-down') {
      if (state) {
        // console.log(state.qdaoDown)
        updatedNewEcosystem.incentives[target].state = {...updatedNewEcosystem.incentives[target].state, ...state}
        if (state && (state.qdaoDown >= 0 || isNaN(state.qdaoDown))) {
          // console.log(state.qdaoDown)
          updatedNewEcosystem.incentives[target].state.qdaoDown = 0
        }
        updatedNewEcosystem.incentives[target].isSet = 'working'
        updatedNewEcosystem.incentives[target].condition = 'qdao'
      }
      // console.log(updatedNewEcosystem.incentives[target])
    } else {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
    }
    console.log(updatedNewEcosystem)
    setNewEcosystem(updatedNewEcosystem)
  }
  

  function setEligibility(value, target, state) {
    // console.log(value, target, state)
    let updatedNewEcosystem = {...newEcosystem}
    if (value == 'none') {
      updatedNewEcosystem.eligibility[target].isSet = 'empty'
      updatedNewEcosystem.eligibility[target].condition = 'none'
    } else if (value == 'powerbadge') {
      updatedNewEcosystem.eligibility[target].isSet = 'working'
      updatedNewEcosystem.eligibility[target].condition = 'powerbadge'
    }  else if (value == 'follow-owner') {
      updatedNewEcosystem.eligibility[target].isSet = 'working'
      updatedNewEcosystem.eligibility[target].condition = 'follow-owner'
    } else if (value == 'follow-channel') {
      updatedNewEcosystem.eligibility[target].isSet = 'working'
      updatedNewEcosystem.eligibility[target].condition = 'follow-channel'
    } else if (value == 'nft') {
      updatedNewEcosystem.eligibility[target].isSet = 'empty'
      updatedNewEcosystem.eligibility[target].condition = 'nft'
    } else if (value == 'tip-value' || value == 'erc20-value') {
      if (state) {
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
      }
      // console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'hypersub-address') {
      if (state) {
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        updatedNewEcosystem.eligibility[target].condition = 'hypersub'
        if (state && state.hypersubAddress && state.hypersubAddress.length == 42 && state.hypersubAddress.slice(0,2) == '0x') {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else if (state && state.hypersubAddress && state.hypersubAddress.length > 0) {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        } else if (state && state.hypersubAddress && state.hypersubAddress.length == 0) {
          updatedNewEcosystem.eligibility[target].isSet = 'empty'
        }
      }
      console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'nft-address') {
      if (state) {
        // console.log(state.chain)
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        const currentState = updatedNewEcosystem.eligibility[target].state
        // console.log(state, state.nftAddress, state?.nftAddress?.length == 0, currentState.chain, currentState?.chain == '0')
        // console.log(state?.nftAddress?.length == 0 && currentState?.chain == '0')
        updatedNewEcosystem.eligibility[target].condition = 'nft'
        if (state && state.nftAddress && state.nftAddress.length == 42 && state.nftAddress.slice(0,2) == '0x' && currentState.chain && currentState.chain !== '0') {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else if (state && state.nftAddress && state.nftAddress.length > 0) {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        } else if (state?.nftAddress?.length == 0 && currentState?.chain == '0') {
          updatedNewEcosystem.eligibility[target].isSet = 'empty'
        }
      }
      // console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'erc20-min-token') {
      if (state) {
        if (state && state.tokenMinValue && (state.tokenMinValue < 0 || isNaN(state.tokenMinValue))) {
          updatedNewEcosystem.eligibility[target].state.tokenMinValue = 0
        } else {
          updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        }
        const currentState = updatedNewEcosystem.eligibility[target].state
        updatedNewEcosystem.eligibility[target].condition = 'erc20'
        if (state && (currentState.erc20Address && currentState.erc20Address.length == 42 && currentState.erc20Address.slice(0,2) == '0x' && currentState.token && currentState.token == '8' && currentState.chain && currentState.chain !== '0') || (currentState.token && currentState.token !== '0' && currentState.token !== '8' && currentState.tokenMinValue && currentState.tokenMinValue >= 0)) {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        }
      }
      // console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'erc20-token') {
      if (state) {
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        updatedNewEcosystem.eligibility[target].condition = 'erc20'
        const currentState = updatedNewEcosystem.eligibility[target].state
        console.log((state.token !== '0' && state.token !== '8' && currentState.tokenMinValue && currentState.tokenMinValue >= 0))
        if (state && (currentState.erc20Address && currentState.erc20Address.length == 42 && currentState.erc20Address.slice(0,2) == '0x' && currentState.token && state.token == '8' && currentState.chain && currentState.chain !== '0') || (state.token !== '0' && state.token !== '8' && currentState.tokenMinValue && currentState.tokenMinValue >= 0)) {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        }
      }
      // console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'erc20-address') {
      if (state) {
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        updatedNewEcosystem.eligibility[target].condition = 'erc20'
        const currentState = updatedNewEcosystem.eligibility[target].state
        // console.log((state.token !== '0' && state.token !== '8' && currentState.tokenMinValue && currentState.tokenMinValue >= 0))
        if (state && state.erc20Address && state.erc20Address.length == 42 && state.erc20Address.slice(0,2) == '0x' && currentState.token && currentState.token == '8' && currentState.chain && currentState.chain !== '0' && currentState.tokenMinValue && currentState.tokenMinValue >= 0) {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        }
      }
      // console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'erc20-chain') {
      if (state) {
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        updatedNewEcosystem.eligibility[target].condition = 'erc20'
        const currentState = updatedNewEcosystem.eligibility[target].state
        if (state && currentState.erc20Address && currentState.erc20Address.length == 42 && currentState.erc20Address.slice(0,2) == '0x' && currentState.token && currentState.token == '8' && state.chain && state.chain !== '0' && currentState.tokenMinValue && currentState.tokenMinValue >= 0) {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        }
      }
      // console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'nft-chain') {
      if (state) {
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        const currentState = updatedNewEcosystem.eligibility[target].state
        updatedNewEcosystem.eligibility[target].condition = 'nft'
        if (state && currentState.nftAddress && currentState.nftAddress.length == 42 && currentState.nftAddress.slice(0,2) == '0x' && state.chain && state.chain !== '0') {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else if ((state && currentState.nftAddress && currentState.nftAddress.length > 0) || (state.chain !== '0' && !(currentState.nftAddress && currentState.nftAddress.length == 42 && currentState.nftAddress.slice(0,2) == '0x'))) {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        } else if (state && currentState.nftAddress && currentState.nftAddress.length == 0 && state.chain && state.chain == '0') {
          updatedNewEcosystem.eligibility[target].isSet = 'empty'
        }
      }
      // console.log(updatedNewEcosystem.eligibility[target])
    } else if (value == 'erc20') {
      updatedNewEcosystem.eligibility[target].isSet = 'empty'
      updatedNewEcosystem.eligibility[target].condition = 'erc20'
    } else if (value == 'hypersub') {
      updatedNewEcosystem.eligibility[target].isSet = 'empty'
      updatedNewEcosystem.eligibility[target].condition = 'hypersub'
    } else {
      updatedNewEcosystem.eligibility[target].isSet = 'empty'
    }
    console.log(updatedNewEcosystem)
    setNewEcosystem(updatedNewEcosystem)
  }

  function onInput(event) {
    if (event.target.name == 'points') {
      const inputValue = event.target.value
      console.log(inputValue.startsWith('$'))
      if (inputValue.startsWith('$')) {
        setNewEcosystem( () => ({ ...newEcosystem, [event.target.name]: event.target.value }) )
      } else {
        setNewEcosystem( () => ({ ...newEcosystem, [event.target.name]: '$' + inputValue.replace('$', '') }) )
      }
    } else {
      setNewEcosystem( () => ({ ...newEcosystem, [event.target.name]: event.target.value }) )
    }
    let updatedformController = {...formController}
    if (event.target.name == 'name') {
      if (event.target.value.length == 0) {
        updatedformController.name = 'empty'
        updatedformController.nameDescription = 'Choose an ecosystem name'
      } else if (event.target.value.length == 1) {
        updatedformController.name = 'error'
        updatedformController.nameDescription = 'Should be at least 2 chars'
      } else if (event.target.value.length > 1) {
        updatedformController.name = 'working'
        updatedformController.nameDescription = 'Choose an ecosystem name'
      }
    } else if (event.target.name == 'points') {
      const inputValue = event.target.value
      const restOfString = inputValue.slice(1);
      if (inputValue.length <= 1) {
        updatedformController.points = 'empty'
        updatedformController.pointsDescription = 'Choose a name for the points system'
      } else {
        if (inputValue.length == 2) {
          updatedformController.points = 'error'
          updatedformController.pointsDescription = 'Must be at least 2 chars'
        } else if (inputValue.length > 7) {
          updatedformController.points = 'error'
          updatedformController.pointsDescription = 'No more than 6 chars'
        } else if (isAlphanumeric(restOfString)) {
          updatedformController.points = 'working'
          updatedformController.pointsDescription = 'Choose an ecosystem name'
        } else {
          updatedformController.points = 'error'
          updatedformController.pointsDescription = 'Needs to be numbers & chars'
        }
      }
    } else if (event.target.name == 'channels') {
      const inputValue = event.target.value
      if (event.target.value.length == 0) {
        updatedformController.channel = 'empty'
      } else {
        updatedformController.channel = 'set'
      }
    } else if (event.target.name == 'moderators') {
      const inputValue = event.target.value
      if (event.target.value.length == 0) {
        updatedformController.moderators = 'empty'
      } else {
        updatedformController.moderators = 'set'
      }
    } else if (event.target.name == 'channel curator') {
      const inputValue = Number(event.target.value)
      let updatedNewEcosystem = {...newEcosystem}
      updatedNewEcosystem.channelCuratorThreshold = inputValue
      setNewEcosystem(updatedNewEcosystem)
    } else if (event.target.name == 'channel points') {
      let inputValue = Number(event.target.value)
      if (inputValue < 1 || isNaN(inputValue)) {
        inputValue = 1
      }
      let updatedNewEcosystem = {...newEcosystem}
      updatedNewEcosystem.channelPointThreshold = inputValue
      setNewEcosystem(updatedNewEcosystem)
    }
    setFormController(updatedformController)
    // console.log(event.target.name)
    // console.log(event.target.value)
    // console.log(newEcosystem)
	}

  const inputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setupEcosystem(event.target.name)
    }
  }

  const goToEcosystem = async (event, ecosystem) => {
    event.preventDefault()
    const systemName = ecosystem.ecosystem_name
    await store.setEcosystemData(ecosystem)
    router.push(`/~/ecosystems/${systemName}`)
  }


  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref}>
    <Head>
      <title>Impact App | Abundance Protocol</title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div style={{padding: '58px 0 0 0', width: feedMax}}>
    </div>

    {!newEcosystem.nameField ? (<div style={{margin: '25px 0 0 0'}}><Button text={'Create Ecosystem'} size={'large'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'start'} isSelected={formController.nextCheck} /></div>) : (
      <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem', justifyContent: 'space-between', alignItems: 'center'}}>
        <Description text={'Create Ecosystem'} padding={'0px 0 4px 5px'} size={'large'} />
        <Button text={'Cancel'} size={'medium'} setupEcosystem={setupEcosystem} target={'cancel'} isSelected={formController.nextCheck} />
      </div>
    )}


    {newEcosystem.nameField && (<Description text={'Ecosystem:'} padding={'20px 0 4px 10px'} />)}

    {newEcosystem.nameField && (
      <InputField title={'Ecosystem name:'} description={formController.nameDescription} name={'name'} value={newEcosystem.name} placeholder={`Ecosystem name`} inputKeyDown={inputKeyDown} onInput={onInput} setupEcosystem={setupEcosystem} target={'name'} isSet={formController.name} clearInput={clearInput} cancel={false} />
    )}

    {newEcosystem.nameField && (<Description text={'Point system:'} padding={'20px 0 4px 10px'} />)}

    {newEcosystem.nameField && (
      <InputField title={'Points name:'} description={formController.pointsDescription} name={'points'} value={newEcosystem.points} placeholder={`$POINTS`} inputKeyDown={inputKeyDown} onInput={onInput} setupEcosystem={setupEcosystem} target={'points'} isSet={formController.points} clearInput={clearInput} cancel={false} />
    )}

    {newEcosystem.nameField && (<Description text={'Channels:'} padding={'20px 0 4px 10px'} />)}

    {newEcosystem.nameField && (
      <InputField title={'Add channel:'} description={'Search for a channel you own'} name={'channels'} value={newEcosystem.channels} placeholder={`Memes`} inputKeyDown={inputKeyDown} onInput={onInput} setupEcosystem={setupEcosystem} target={'channels'} isSet={formController.channel} button={'Search'} clearInput={clearInput} cancel={false} />
    )}


    {(newEcosystem.nameField && (selectedChannels.length > 0 || filterChannels.length > 0 || loadingChannel || channelSearched)) && (<div className='flex-col active-nav-link btn-hvr' style={{border: '1px solid #777', padding: '18px 10px 12px 10px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '', maxWidth: '100%', cursor: 'default', width: 'auto', gap: '1rem'}}>

      {loadingChannel && (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', marginTop: '0px'}}>
        <Spinner size={31} color={'#999'} />
      </div>)}

      {(channelSearched && filterChannels && filterChannels.length > 0) ? (<div className='flex-row top-layer' style={{gap: '0.5rem', padding: '0px 6px', flexWrap: 'wrap'}}>
        {filterChannels && (
          filterChannels.map((channel, index) => (
            <div key={`Ch2-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
              <img loading="lazy" src={channel.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
              <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
              <div style={{fontWeight: '400', fontSize: '10px', color: '#ccc'}}>{formatNum(channel.follower_count)}</div>
            </div>
          )
        ))}
      </div>) : (!loadingChannel && channelSearched) && (<div style={{color: '#ddd', fontWeight: '600', fontSize: isMobile ? '13px' : '15px', padding: '0 0 3px 6px', textAlign: 'center'}}>No channels found</div>)}
      {(selectedChannels && selectedChannels.length > 0) && (<div className='flex-row' style={{gap: '0.5rem', padding: (filterChannels.length > 0) ? '16px 6px 0px 6px' : '0px 6px 0px 6px', flexWrap: 'wrap', borderTop: (filterChannels.length > 0) ? '1px solid #888' : '0px solid #888', width: '100%', alignItems: 'center'}}>
        <div style={{color: '#ddd', fontWeight: '600', fontSize: isMobile ? '13px' : '15px', padding: '0 0 3px 6px'}}>Selected:</div>
        {(
          selectedChannels.map((channel, index) => (
            <div key={`Ch-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
              <img loading="lazy" src={channel.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
              <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
            </div>
          )))}
      </div>)}
    </div>)}


    {(newEcosystem.nameField && selectedChannels && selectedChannels.length > 0) &&  (<Description text={'Channel rules:'} padding={'20px 0 4px 10px'} />)}

    {(newEcosystem.nameField && selectedChannels && selectedChannels.length > 0) && (<div className={`active-nav-link btn-hvr ${isMobile ? 'flex-col' : 'flex-row'}`} style={{border: '1px solid #777', padding: '2px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '', maxWidth: '100%', cursor: 'default', width: 'auto', justifyContent: 'flex-start'}}>
      <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '5px 10px 0px 10px' : '5px 10px 5px 10px', alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1}}>

        <div className='flex-col'>
          <div style={{fontSize: isMobile ? '15px' : '18px', fontWeight: '600', color: '', padding: '10px 3px 4px 3px'}}>Curator threshold:</div>
          <div style={{fontSize: isMobile ? '10px' : '12px', fontWeight: '400', color: '', padding: '0px 3px 10px 3px'}}>Min. curators to display cast</div>
        </div>

        <div className='flex-row' style={{margin: isMobile ? '0 0 0 10px' : '5px 0 5px 10px', width: '', flexGrow: 0, position: 'relative'}}>
          <select value={newEcosystem.channelCuratorThreshold} name='channel curator' onChange={onInput} style={{backgroundColor: '#adf', borderRadius: '4px', padding: isMobile ? '7px 4px' : '6px', fontSize: isMobile ? '14px' : '16px', width: 'auto', fontWeight: '600'}}>
            {curatorThreshold.map((threshold) => (
              <option key={threshold.value} value={threshold.value}>
                {threshold.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 5px 10px' : '5px 10px 5px 10px', alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1}}>
        <div className='flex-col'>
          <div style={{fontSize: isMobile ? '15px' : '18px', fontWeight: '600', color: '', padding: '10px 3px 4px 3px'}}>Points threshold:</div>
          <div style={{fontSize: isMobile ? '10px' : '12px', fontWeight: '400', color: '', padding: '0px 3px 10px 3px'}}>Min. points to display cast</div>
        </div>
        <div className='flex-row' style={{margin: isMobile ? '0 0 0 10px' : '5px 0 0px 10px', width: '', flexGrow: 0, position: 'relative'}}>
          <input onChange={onInput} 
            name='channel points' 
            placeholder='3' 
            value={newEcosystem.channelPointThreshold} 
            type='number' 
            className='srch-btn' 
            style={{width: '100px', backgroundColor: '#234', margin: '0'}} 
            onKeyDown={inputKeyDown} />
        </div>
      </div>
    </div>)}


    {newEcosystem.nameField && (<Description text={'Moderators:'} padding={'20px 0 4px 10px'} />)}

    {newEcosystem.nameField && (
      <InputField title={'Add moderator:'} description={'Search for moderators'} name={'moderators'} value={newEcosystem.moderators} placeholder={`dwr`} inputKeyDown={inputKeyDown} onInput={onInput} setupEcosystem={setupEcosystem} target={'moderators'} isSet={formController.moderators} button={'Search'} clearInput={clearInput} cancel={false} />
    )}

    {(newEcosystem.nameField && (selectedModerators.length > 0 || filterModerators.length > 0 || loadingMod || modSearched)) && (<div className='flex-col active-nav-link btn-hvr' style={{border: '1px solid #777', padding: '18px 10px 12px 10px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '', maxWidth: '100%', cursor: 'default', width: 'auto', gap: '1rem'}}>

      {loadingMod && (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', marginTop: '0px'}}>
        <Spinner size={31} color={'#999'} />
      </div>)}

      {(filterModerators && filterModerators.length > 0) ? (<div className='flex-row top-layer' style={{gap: '0.5rem', padding: '0px 6px', flexWrap: 'wrap'}}>
        {filterModerators && (
          filterModerators.map((moderator, index) => (
            <div key={`Ch2-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addModerator(moderator)}}>
              <img loading="lazy" src={moderator.pfp_url} className="" alt={moderator.display_name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
              <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>@{moderator.username}</div>
              <div style={{fontWeight: '400', fontSize: '10px', color: '#ccc'}}>{formatNum(moderator.follower_count)}</div>
            </div>
          )
        ))}
      </div>) : (!loadingMod && modSearched) && (<div style={{color: '#ddd', fontWeight: '600', fontSize: isMobile ? '13px' : '15px', padding: '0 0 3px 6px', textAlign: 'center'}}>No moderators found</div>)}
      {(selectedModerators && selectedModerators.length > 0) && (<div className='flex-row' style={{gap: '0.5rem', padding: (filterModerators.length > 0) ? '16px 6px 0px 6px' : '0px 6px 0px 6px', flexWrap: 'wrap', borderTop: (filterModerators.length > 0) ? '1px solid #888' : '0px solid #888', width: '100%', alignItems: 'center'}}>
        <div style={{color: '#ddd', fontWeight: '600', fontSize: isMobile ? '13px' : '15px', padding: '0 0 3px 6px'}}>Selected:</div>
        {(
          selectedModerators.map((moderator, index) => (
            <div key={`Ch-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addModerator(moderator)}}>
              <img loading="lazy" src={moderator.pfp_url} className="" alt={moderator.display_name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
              <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>@{moderator.username}</div>
            </div>
          )))}
      </div>)}
    </div>)}


    {newEcosystem.nameField && (<div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description text={'Curator eligibility:'} padding={'0 0 0 10px'} />
      <Button text={'Add'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'eligibility'} />
    </div>)}

    {newEcosystem.nameField && (newEcosystem.eligibility.map((eligibility, index) => 
      (<Dropdown key={index} name={index} value={eligibility.condition} setupEcosystem={setupEcosystem} target={index} conditions={conditions} cancel={true} removeField={removeEligibilityField} isSet={eligibility.isSet} setCondition={setEligibility} state={eligibility.state} onInput={onInput} />))
    )}

    {/* {newEcosystem.nameField && (
      <Dropdown name={'name'} value={newEcosystem.dropdown} inputKeyDown={inputKeyDown} onInput={onInput} setupEcosystem={setupEcosystem} target={'points'} conditions={conditions} cancel={true} />
    )} */}


    {newEcosystem.nameField && (<div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description text={'Point incentives:'} padding={'0 0 0 10px'} />
      <Button text={'Add'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'incentives'} />
    </div>)}

    {/* {newEcosystem.nameField && (
      <Dropdown setupEcosystem={setupEcosystem} target={'points'} conditions={incentives} cancel={true} />
    )} */}

    {newEcosystem.nameField && (newEcosystem.incentives.map((incentive, index) => 
      (<Dropdown key={index} name={index} value={incentive.condition} setupEcosystem={setupEcosystem} target={index} conditions={incentives} cancel={true} removeField={removeIncentiveField} isSet={incentive.isSet} setCondition={setIncentives} state={incentive.state} onInput={onInput} />))
    )}

    {newEcosystem.nameField && (<div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description text={'Ecosystem rules:'} padding={'0 0 0 10px'} />
      <Button text={'Add'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'rules'} />
    </div>)}

    {newEcosystem.nameField && (newEcosystem.ecoRules.map((ecoRule, index) => 
      (<InputField key={index} name={index} value={ecoRule.rule} placeholder={`Ecosystem rule`} inputKeyDown={inputKeyDown} onInput={ecoFields} setupEcosystem={setupEcosystem} target={index} isSet={ecoRule.isSet} clearInput={clearEcoField} cancel={true} removeField={removeEcoField} />)
    ))}


    {newEcosystem.nameField && (<div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem', justifyContent: 'space-between'}}>
      {formController.next !== 'none' && (<Button text={'Previous'} prevIcon={GrFormPrevious} setupEcosystem={setupEcosystem} target={formController.prev} isSelected={formController.prevCheck} />)}
      <div></div>
      {formController.next == 'none' && (<Button text={'Submit'} size={'medium'} setupEcosystem={setupEcosystem} target={submitCheck.target} isSelected={formController.nextCheck} submit={submitCheck.pass} />)}
    </div>)}


    {!newEcosystem.nameField && (<Description text={'My Ecosystems:'} padding={'30px 0 4px 10px'} />)}

    {!newEcosystem.nameField && (
      <>{!loadedSchedule ? (
      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: feedMax, justifyContent: 'center', marginTop: '40px'}}>
        <Spinner size={31} color={'#999'} />
      </div>
    ) : (userEcosystems && userEcosystems.length > 0 && isLogged) ? userEcosystems.map((ecosystem, index) => { return (
    <div key={index} style={{border: '1px solid #777', padding: '8px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '#eef6ff11', cursor: 'pointer'}}>
    <div className="top-layer">
      <div className="flex-row" style={{padding: '0 10px', marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0rem', width: '100%', alignItems: 'center'}}>
        <div style={{fontSize: isMobile ? '18px' : '24px', fontWeight: '600', color: '#def', padding: '10px', width: 'auto', flexGrow: 1}} onClick={() => {goToEcosystem(event, ecosystem)}}>
          {ecosystem.ecosystem_name} Ecosystem
        </div>
        <div className={`flex-row ${userQuery['shuffle'] ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{border: '1px solid #abc', padding: '4px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}} onClick={() => {modifySchedule('shuffle')}}>
          <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '5px'}}>
            <FaPen size={24} />
          </div>
        </div>
      </div>
    </div>

    </div>)}) : (
      <div style={{width: '100%', fontSize: '20px', fontWeight: '400', textAlign: 'center', color: '#cde'}}>No ecosystems found</div>
    )}</>)}


    {!newEcosystem.nameField && (<Description text={'All Ecosystems:'} padding={'30px 0 4px 10px'} />)}




    {!newEcosystem.nameField && (
      <>{!loadedSchedule ? (
      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: feedMax, justifyContent: 'center', marginTop: '40px'}}>
        <Spinner size={31} color={'#999'} />
      </div>
    ) : (allEcosystems && allEcosystems.length > 0 && isLogged) ? allEcosystems.map((ecosystem, index) => { return (
    <div key={index} style={{border: '1px solid #777', padding: '8px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '#eef6ff11', justifyContent: 'fit-content', cursor: 'pointer'}} onClick={() => {goToEcosystem(event, ecosystem)}}>
    <div className="top-layer">
      <div className="flex-col" style={{padding: '0 20px', marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0rem', width: '100%', alignItems: 'flex-start', width: 'auto', flexGrow: 1}}>
        <div style={{fontSize: isMobile ? '18px' : '24px', fontWeight: '600', color: '#def', padding: '0px'}}>
          {ecosystem.ecosystem_name} Ecosystem
        </div>
        <div style={{fontSize: isMobile ? '10px' : '14px', fontWeight: '400', color: '#def', padding: '0px 0 5px 0'}}>
          By @{ecosystem.owner_name}
        </div>
      </div>
    </div>

    </div>)}) : (
      <div style={{width: '100%', fontSize: '20px', fontWeight: '400', textAlign: 'center', color: '#cde'}}>No ecosystems found</div>
    )}</>)}











    <div style={{margin: '0 0 70px 0'}}>
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
