import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../../context'
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints'
import useStore from '../../utils/store'
import axios from 'axios';
import { FaPen, FaPlus } from "react-icons/fa"
import { useRouter } from 'next/router';
import { formatNum, isAlphanumeric, getToken, getChain } from '../../utils/utils';
import Spinner from '../../components/Common/Spinner';
import Button from '../../components/Ecosystem/Button';
import Description from '../../components/Ecosystem/Description';
import InputField from '../../components/Ecosystem/InputField';
import Dropdown from '../../components/Ecosystem/Dropdown';
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import Modal from '../../components/Layout/Modals/Modal';

export default function Ecosystem() {
  const ref = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const { setEcoData, getEcosystems, fid, isLogged } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const store = useStore()
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const initialQuery = {shuffle: true, time: null, tags: [], channels: [], curators: []}
  const [userQuery, setUserQuery] = useState(initialQuery)
  const router = useRouter()
  // const [isLogged, setIsLogged] = useState(false)
  const [channels, setChannels] = useState([])
  const [selectedChannels, setSelectedChannels] = useState([])
  const [channelSearched, setChannelSearched] = useState(false)
  const [modSearched, setModSearched] = useState(false)
  const [selectedModerators, setSelectedModerators] = useState([])
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  const [jobScheduled, setJobScheduled] = useState(false);
  const [loadedSchedule, setLoadedSchedule] = useState(false)
  const [loadingMod, setLoadingMod] = useState(false)
  const [loadingChannel, setLoadingChannel] = useState(false)
  const [filterChannels, setFilterChannels] = useState([])
  const [filterModerators, setFilterModerators] = useState([])
  const initialSubmit = {pass: false, target: null}
  const [submitCheck, SetSubmitCheck] = useState(initialSubmit)
  const [ecosystemData, setEcosystemData] = useState([])
  const [userEcosystems, setUserEcosystems] = useState([])
  const [allEcosystems, setAllEcosystems] = useState([])
  const ecosystemRules = {
    id: '',
    update: false,
    start: false, 
    fid: null, 
    nameField: false, 
    name: '', 
    handle: '', 
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
    handle: 'empty', 
    channel: 'empty', 
    moderators: 'empty', 
    handleDescription: 'Choose ecosystem handle', 
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
    { value: 'qdau', label: 'Points for qDAU down/upvote' },
    { value: 'percent-tipped', label: 'Percent Tipped to Curator' },
  ]
  const curatorThreshold = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ]


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
      if ((formController.name && formController.name !== 'working') || ( formController.points && formController.points !== 'working') || ( formController.handle && formController.handle !== 'working')) {
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
    let ecoHandle = ''
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
    ecoHandle = newEcosystem.handle
    ecoPoints = newEcosystem.points
    if (selectedChannels && selectedChannels.length > 0) {
      for (const channel of selectedChannels) {
        console.log(channel)
        let channelData = {url: channel.parent_url, name: channel.id, img: channel.image_url}
        ecoChannels.push(channelData)
      }
      ecoCuratorThreshold = newEcosystem.channelCuratorThreshold
      ecoPointsThreshold = newEcosystem.channelPointThreshold
    }
    if (selectedModerators && selectedModerators.length > 0) {
      for (const moderator of selectedModerators) {
        let moderatorData = {fid: moderator.fid, username: moderator.username}
        ecoModerators.push(moderatorData)
      }
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
        } else if (incentive.condition == 'qdau' && incentive.isSet == 'working') {
          let condition = {type: 'qdau', upvote: incentive.state.qdauUp, downvote: incentive.state.qdauDown}
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
      ecoHandle,
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
    console.log(fid, ecosystemData)
    try {
      const response = await axios.post('/api/ecosystem/postEcosystemRules', {       
        fid: fid,
        data: ecosystemData,
        update: newEcosystem.update,
        id: newEcosystem.id
      })
      if (response?.status == 200) {
        setFormController(controller)
        setNewEcosystem(ecosystemRules)
        getEcosystems()
        getUserEcosystems(fid)
        getAllEcosystems()
        if (newEcosystem.update) {
          setModal({on: true, success: true, text: 'Ecosystem updated successfully'});
        } else {
          setModal({on: true, success: true, text: 'Ecosystem created successfully'});
        }
        setTimeout(() => {
          setModal({on: false, success: false, text: ''});
        }, 2500);
      } else {
        if (newEcosystem.update) {
          setModal({on: true, success: false, text: 'Ecosystem update failed'});
        } else {
          setModal({on: true, success: false, text: 'Ecosystem creation failed'});
        }
        setTimeout(() => {
          setModal({on: false, success: false, text: ''});
        }, 2500);
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      if (newEcosystem.update) {
        setModal({on: true, success: false, text: 'Ecosystem update failed'});
      } else {
        setModal({on: true, success: false, text: 'Ecosystem creation failed'});
      }
      setTimeout(() => {
        setModal({on: false, success: false, text: ''});
      }, 2500);
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

  useEffect(() => {
    // if (!isLogged) {
    //   setIsLogged(store.isAuth)
    // }
    if (store.isAuth && jobScheduled) {
      getUserEcosystems(fid)
    } else if (store.isAuth) {
      const timeoutId = setTimeout(() => {
        getUserEcosystems(fid)
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isLogged, jobScheduled])

  useEffect(() => {
    getAllEcosystems()
  }, [])

  const getAllEcosystems = async () => {
    try {
      const ecosystemsData = await axios.get('/api/ecosystem/getEcosystems')
      if (ecosystemsData) {
        const ecosystems = ecosystemsData?.data?.ecosystems
        console.log(ecosystems)
        setAllEcosystems(ecosystems)
        setLoadedSchedule(true)
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setLoadedSchedule(true)
    }
  }

  const getUserEcosystems = async (fid) => {
    if (fid) {
      try {
        const ecosystemsData = await axios.get('/api/ecosystem/getUserEcosystems', { params: { fid } })
        if (ecosystemsData) {
          const ecosystems = ecosystemsData.data.ecosystems
          console.log(ecosystems)
          setUserEcosystems(ecosystems)
          setLoadedSchedule(true)
        }
      } catch (error) {
        console.error('Error creating post:', error);
        setLoadedSchedule(true)
      }
    }
  }

  useEffect(() => {
    console.log('triggered')
    // if (!isLogged) {
    //   setIsLogged(store.isAuth)
    // }

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
      if (response?.data) {
        const channels = response?.data?.channels
        const channelsData = response?.data?.channels
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

  function setupEcosystem(target) {
    console.log(newEcosystem)
    let updatedNewEcosystem = {...newEcosystem}
    if (target == 'start') {
      updatedNewEcosystem.nameField = true
      setNewEcosystem(updatedNewEcosystem)
    } else if (target == 'cancel') {
      if (newEcosystem.update) {
        updatedNewEcosystem.update = false
      }
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
    } else if (target == 'handle') {
      updatedNewEcosystem.handle = ''
      setNewEcosystem(updatedNewEcosystem)
      updatedformController.handle = 'empty'
      updatedformController.handleDescription = 'Choose ecosystem handle'
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
    } else if (value == 'percent-tipped') {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
      updatedNewEcosystem.incentives[target].condition = 'percent-tipped'
    } else if (value == 'qdau') {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
      updatedNewEcosystem.incentives[target].condition = 'qdau'
    } else if (value == 'tip-value') {
      if (state) {
        updatedNewEcosystem.incentives[target].state = {...updatedNewEcosystem.incentives[target].state, ...state}
        if (state && (state.tip <= 0 || isNaN(state.tip))) {
          updatedNewEcosystem.incentives[target].state.tip = 0
        }
        updatedNewEcosystem.incentives[target].isSet = 'working'
        updatedNewEcosystem.incentives[target].condition = 'tip'
      }
    } else if (value == 'qdau-up') {
      if (state) {
        updatedNewEcosystem.incentives[target].state = {...updatedNewEcosystem.incentives[target].state, ...state}
        if (state && (state.qdauUp <= 0 || isNaN(state.qdauUp))) {
          console.log(state.qdauUp)
          updatedNewEcosystem.incentives[target].state.qdauUp = 0
        }
        updatedNewEcosystem.incentives[target].isSet = 'working'
        updatedNewEcosystem.incentives[target].condition = 'qdau'
      }
    } else if (value == 'qdau-down') {
      if (state) {
        updatedNewEcosystem.incentives[target].state = {...updatedNewEcosystem.incentives[target].state, ...state}
        if (state && (state.qdauDown >= 0 || isNaN(state.qdauDown))) {
          updatedNewEcosystem.incentives[target].state.qdauDown = 0
        }
        updatedNewEcosystem.incentives[target].isSet = 'working'
        updatedNewEcosystem.incentives[target].condition = 'qdau'
      }
    } else {
      updatedNewEcosystem.incentives[target].isSet = 'empty'
    }
    console.log(updatedNewEcosystem)
    setNewEcosystem(updatedNewEcosystem)
  }
  

  function setEligibility(value, target, state) {
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
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        const currentState = updatedNewEcosystem.eligibility[target].state
        updatedNewEcosystem.eligibility[target].condition = 'nft'
        if (state && state.nftAddress && state.nftAddress.length == 42 && state.nftAddress.slice(0,2) == '0x' && currentState.chain && currentState.chain !== '0') {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else if (state && state.nftAddress && state.nftAddress.length > 0) {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        } else if (state?.nftAddress?.length == 0 && currentState?.chain == '0') {
          updatedNewEcosystem.eligibility[target].isSet = 'empty'
        }
      }
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
    } else if (value == 'erc20-address') {
      if (state) {
        updatedNewEcosystem.eligibility[target].state = {...updatedNewEcosystem.eligibility[target].state, ...state}
        updatedNewEcosystem.eligibility[target].condition = 'erc20'
        const currentState = updatedNewEcosystem.eligibility[target].state
        if (state && state.erc20Address && state.erc20Address.length == 42 && state.erc20Address.slice(0,2) == '0x' && currentState.token && currentState.token == '8' && currentState.chain && currentState.chain !== '0' && currentState.tokenMinValue && currentState.tokenMinValue >= 0) {
          updatedNewEcosystem.eligibility[target].isSet = 'working'
        } else {
          updatedNewEcosystem.eligibility[target].isSet = 'error'
        }
      }
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

  async function checkPoints(points) {
    try {
      const response = await axios.get('/api/ecosystem/checkPoints', { params: {      
        points }})
      if (response && response.data && response.data?.ecoPoints) {
        console.log(response)
        return response.data?.ecoPoints
      } else {
        return false
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      return true
    }
  }

  async function getModeators(fids) {
    let jointFids = ''
    if (fids?.length > 1) {
      jointFids = fids.join(',')
    } else if (fids?.length == 1) {
      jointFids = fids[0]
    }
    console.log(fids, jointFids)
    try {
      const response = await axios.get('/api/getUserProfile', {
        params: {
          fid: jointFids,
        }
      })
      if (response?.data?.userProfile) {
        const users = response.data.userProfile
        setSelectedModerators(users)
      } else {
        setSelectedModerators([])
      }
      updateEcosystemData()
    } catch (error) {
      console.error('Error', error)
      setSelectedModerators([])
      updateEcosystemData()
    }
  }

  async function modifyEcosystem(ecosystem) {
    setSelectedChannels([])
    setSelectedModerators([])
    let updatedformController = {...formController}
    let updatedNewEcosystem = {...newEcosystem}
    console.log(ecosystem)
    updatedNewEcosystem.eligibility = []
    updatedNewEcosystem.ecoRules = []
    updatedNewEcosystem.incentives = []

    updatedNewEcosystem.id = ecosystem._id
    updatedNewEcosystem.update = true
    updatedNewEcosystem.nameField = true
    updatedNewEcosystem.name = ecosystem.ecosystem_name
    updatedformController.name = 'working'
    updatedformController.nameDescription = 'Choose an ecosystem name'

    updatedNewEcosystem.handle = ecosystem.ecosystem_handle
    updatedformController.handle = 'working'
    updatedformController.handleDescription = 'Choose ecosystem handle'

    updatedNewEcosystem.points = ecosystem.ecosystem_points_name
    updatedformController.points = 'working'
    updatedformController.pointsDescription = 'Points name cannot be updated'

    updatedNewEcosystem.fid = ecosystem.fid

    console.log(ecosystem.condition_curators_threshold)
    if (ecosystem.condition_curators_threshold) {

      updatedNewEcosystem.channelCuratorThreshold = ecosystem.condition_curators_threshold
    }

    if (ecosystem.condition_points_threshold) {
      updatedNewEcosystem.channelPointThreshold = ecosystem.condition_points_threshold
    }
  
    if (ecosystem?.ecosystem_rules?.length > 0) {
      for (const rule of ecosystem.ecosystem_rules) {
        let ruleData = {rule: rule, isSet: 'working'}
        updatedNewEcosystem.ecoRules.push(ruleData)
      }
    }

    if (ecosystem?.condition_powerbadge) {
      let state = {type: null}
      let eligibility = {condition: 'powerbadge', isSet: 'working', state: state}
      updatedNewEcosystem.eligibility.push(eligibility)
    }

    if (ecosystem?.condition_following_channel) {
      let eligibility = {condition: 'follow-channel', isSet: 'working'}
      updatedNewEcosystem.eligibility.push(eligibility)
    }

    if (ecosystem?.condition_following_owner) {
      let eligibility = {condition: 'follow-owner', isSet: 'working'}
      updatedNewEcosystem.eligibility.push(eligibility)
    }

    if (ecosystem?.condition_holding_erc20 && ecosystem?.erc20s?.length > 0) {
      for (const erc20 of ecosystem.erc20s) {
        const token = getToken(erc20.erc20_address)
        if (token) {
          let state = {token: token, tokenMinValue: erc20.min}
          let eligibility = {condition: 'erc20', isSet: 'working', state: state}
          updatedNewEcosystem.eligibility.push(eligibility)
        } else {
          const chain = getChain(erc20.erco20_chain)
          let state = {token: '8', tokenMinValue: erc20.min, erc20Address: erc20.erc20_address, chain: chain}
          let eligibility = {condition: 'erc20', isSet: 'working', state: state}
          updatedNewEcosystem.eligibility.push(eligibility)
        }
      }
    }

    if (ecosystem?.condition_holding_nft && ecosystem?.nfts?.length > 0) {
      for (const nft of ecosystem.nfts) {
        const chain = getChain(nft.nft_chain)
        let state = {nftAddress: nft.nft_address, chain: chain}
        let eligibility = {condition: 'nft', isSet: 'working', state: state}
        updatedNewEcosystem.eligibility.push(eligibility)
      }
    }

    if (ecosystem?.percent_tipped) {
      let state = {tipPercent: ecosystem?.percent_tipped}
      let incentive = {condition: 'percent-tipped', isSet: 'working', state: state}
      updatedNewEcosystem.incentives.push(incentive)
    }

    if (ecosystem?.points_per_tip) {
      let state = {tip: ecosystem?.points_per_tip}
      let incentive = {condition: 'tip', isSet: 'working', state: state}
      updatedNewEcosystem.incentives.push(incentive)
    }

    if ((ecosystem?.upvote_value || ecosystem?.upvote_value == 0) && (ecosystem?.downvote_value || ecosystem?.downvote_value == 0)) {
      let state = {qdauUp: ecosystem?.upvote_value, qdauDown: (ecosystem?.downvote_value * -1)}
      let incentive = {condition: 'qdau', isSet: 'working', state: state}
      updatedNewEcosystem.incentives.push(incentive)
    }

    if (ecosystem?.channels?.length > 0) {
      let channels = []
      for (const channel of ecosystem?.channels) {
        console.log(channel)
        let addChannel = {name: channel.name, id: channel.name, parent_url: channel.url, image_url: channel.img}
        channels.push(addChannel)
      }
      setSelectedChannels(channels)
      updatedformController.channel = 'set'
    }

    if (ecosystem?.ecosystem_moderators?.length > 0) {
      getModeators(ecosystem?.ecosystem_moderators)
      updatedformController.moderators = 'set'
    }

    setNewEcosystem(updatedNewEcosystem)
    setFormController(updatedformController)
    updateEcosystemData()
  }

  async function checkHandle(handle) {
    try {
      const response = await axios.get('/api/ecosystem/checkHandle', { params: {      
        handle }})
      if (response && response.data && response.data?.ecoHandle) {
        console.log(response)
        return response.data?.ecoHandle
      } else {
        return false
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      return true
    }
  }

  async function onInput(event) {
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
        } else if (!isAlphanumeric(restOfString)) {
          updatedformController.points = 'error'
          updatedformController.pointsDescription = 'Needs to be numbers & chars'
        } else {
          const pointsExist = await checkPoints(inputValue)
          if (pointsExist) {
            updatedformController.points = 'error'
            updatedformController.pointsDescription = 'Points already exist'
          } else {
            updatedformController.points = 'working'
            updatedformController.pointsDescription = 'Choose a name for the points system'
          }
        }
      }
    } else if (event.target.name == 'handle') {
      const inputValue = event.target.value
      // const restOfString = inputValue.slice(1);
      if (inputValue.length == 0) {
        updatedformController.handle = 'empty'
        updatedformController.handleDescription = 'Choose ecosystem handle'
      } else if (inputValue.length < 4) {
        updatedformController.handle = 'error'
        updatedformController.handleDescription = 'Must be at least 4 chars'
      } else if (inputValue.length > 12) {
        updatedformController.handle = 'error'
        updatedformController.handleDescription = 'No more than 12 chars'
      } else if (!isAlphanumeric(inputValue)) {
        updatedformController.handle = 'error'
        updatedformController.handleDescription = 'Needs to be numbers & chars'
      } else {
        const handleExists = await checkHandle(inputValue)
        if (handleExists) {
          updatedformController.handle = 'error'
          updatedformController.handleDescription = 'Handle already exists'
        } else {
          updatedformController.handle = 'working'
          updatedformController.handleDescription = 'Choose ecosystem handle'
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
      console.log(updatedNewEcosystem.channelCuratorThreshold)
      setNewEcosystem(updatedNewEcosystem)
    } else if (event.target.name == 'channel points') {
      let inputValue = Number(event.target.value)
      if (inputValue < 1 || isNaN(inputValue)) {
        inputValue = 1
      }
      let updatedNewEcosystem = {...newEcosystem}
      updatedNewEcosystem.channelPointThreshold = inputValue
      console.log(updatedNewEcosystem.channelPointThreshold)
      setNewEcosystem(updatedNewEcosystem)
    }
    setFormController(updatedformController)
    console.log(newEcosystem)
    console.log(formController)
    updateEcosystemData()
	}

  const inputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setupEcosystem(event.target.name)
    }
  }

  const goToEcosystem = async (event, ecosystem) => {
    event.preventDefault()
    const systemHandle = ecosystem.ecosystem_handle
    await store.setEcosystemData(ecosystem)
    setEcoData(ecosystem)
    router.push(`/~/ecosystems/${systemHandle}`)
  }


  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref}>
    <Head>
      <title>Impact App | Abundance Protocol</title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div style={{padding: '58px 0 0 0', width: feedMax}}>
    </div>

    {!newEcosystem.nameField ? (<div style={{margin: '25px 0 0 0'}}><Button text={newEcosystem?.update ? 'Update Ecosystem' : 'Create Ecosystem'} size={'large'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'start'} isSelected={formController.nextCheck} /></div>) : (
      <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem', justifyContent: 'space-between', alignItems: 'center'}}>
        <Description show={true} text={newEcosystem?.update ? 'Update Ecosystem' : 'Create Ecosystem'} padding={'0px 0 4px 5px'} size={'large'} />
        <Button text={'Cancel'} size={'medium'} setupEcosystem={setupEcosystem} target={'cancel'} isSelected={formController.nextCheck} />
      </div>
    )}


    <Description {...{show: newEcosystem?.nameField, text: 'Ecosystem:', padding: '20px 0 4px 10px'}} />

    <InputField {...{show: newEcosystem?.nameField, title: 'Ecosystem name:', description: formController?.nameDescription, name: 'name', value: newEcosystem?.name, placeholder: `Ecosystem name`, inputKeyDown, onInput, setupEcosystem, target: 'name', isSet: formController?.name, clearInput, cancel: false }} />


    <Description {...{show: newEcosystem?.nameField, text: 'Ecosystem handle:', padding: '20px 0 4px 10px' }} text={'Ecosystem handle:'} padding={'20px 0 4px 10px'} />


    <InputField {...{show: newEcosystem?.nameField, title: 'Handle:', description: formController?.handleDescription, name: 'handle', value: newEcosystem?.handle, placeholder: `handle`, inputKeyDown, onInput, setupEcosystem, target: 'handle', isSet: formController?.handle, clearInput, cancel: false }} />


    <Description {...{show: newEcosystem?.nameField, text: 'Point system:', padding: '20px 0 4px 10px' }}  />

    <InputField {...{show: newEcosystem?.nameField, title: 'Points name:', description: formController?.pointsDescription, name: 'points', value: newEcosystem?.points, placeholder: `$POINTS`, inputKeyDown, onInput, setupEcosystem, target: 'points', isSet: formController?.points, clearInput, cancel: false, disabled: newEcosystem?.update}} />

    <Description {...{show: newEcosystem?.nameField, text: 'Channels:', padding: '20px 0 4px 10px' }} />


    <InputField {...{show: newEcosystem?.nameField, title: 'Add channel:', description: 'Search for a channel you own', name: 'channels', value: newEcosystem?.channels, placeholder: `Memes`, inputKeyDown, onInput, setupEcosystem, target: 'channels', button: 'Search', isSet: formController?.channel, clearInput, cancel: false}} />


    {(newEcosystem.nameField && (selectedChannels?.length > 0 || filterChannels?.length > 0 || loadingChannel || channelSearched)) && (<div className='flex-col active-nav-link btn-hvr' style={{border: '1px solid #777', padding: '18px 10px 12px 10px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '', maxWidth: '100%', cursor: 'default', width: 'auto', gap: '1rem'}}>

      {loadingChannel && (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', marginTop: '0px'}}>
        <Spinner size={31} color={'#999'} />
      </div>)}

      {(channelSearched && filterChannels?.length > 0) ? (<div className='flex-row top-layer' style={{gap: '0.5rem', padding: '0px 6px', flexWrap: 'wrap'}}>
        {filterChannels && (
          filterChannels.map((channel, index) => (
            <div key={`Ch2-${index}`} className='flex-row nav-link btn-hvr' style={{border: '1px solid #eee', padding: '4px 12px 4px 6px', gap: '0.5rem', borderRadius: '20px', margin: '0px 3px 3px 3px', alignItems: 'center'}} onClick={() => {addChannel(channel)}}>
              <img loading="lazy" src={channel?.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />
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
              {channel?.image_url && (<img loading="lazy" src={channel?.image_url} className="" alt={channel.name} style={{width: '16pxC', height: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '16px', border: '1px solid #000'}} />)}
              <div style={{fontWeight: '600', fontSize: '12px', color: '#eee'}}>{channel.name}</div>
            </div>
          )))}
      </div>)}
    </div>)}


    <Description {...{show: (newEcosystem.nameField && selectedChannels?.length > 0), text: 'Channel rules:', padding: '20px 0 4px 10px' }} />

    {(newEcosystem.nameField && selectedChannels?.length > 0) && (<div className={`active-nav-link btn-hvr ${isMobile ? 'flex-col' : 'flex-row'}`} style={{border: '1px solid #777', padding: '2px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '', maxWidth: '100%', cursor: 'default', width: 'auto', justifyContent: 'flex-start'}}>
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


    <Description {...{show: newEcosystem?.nameField, text: 'Moderators:', padding: '20px 0 4px 10px' }} />

    <InputField {...{show: newEcosystem?.nameField, title: 'Add moderator:', description: 'Search for moderators', name: 'moderators', value: newEcosystem?.moderators, placeholder: `dwr`, inputKeyDown, onInput, setupEcosystem, target: 'moderators', button: 'Search', isSet: formController?.moderators, clearInput, cancel: false }} />
    

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
      <Description {...{show: true, text: 'Curator eligibility:', padding: '0 0 0 10px' }} />
      <Button text={'Add'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'eligibility'} />
    </div>)}

    {newEcosystem.nameField && (newEcosystem.eligibility.map((eligibility, index) => 
      (<Dropdown key={index} name={index} value={eligibility.condition} setupEcosystem={setupEcosystem} target={index} conditions={conditions} cancel={true} removeField={removeEligibilityField} isSet={eligibility.isSet} setCondition={setEligibility} state={eligibility.state} onInput={onInput} />))
    )}


    {newEcosystem.nameField && (<div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: 'Point incentives:', padding: '0 0 0 10px'}} />
      <Button text={'Add'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'incentives'} />
    </div>)}


    {newEcosystem.nameField && (newEcosystem.incentives.map((incentive, index) => 
      (<Dropdown key={index} name={index} value={incentive.condition} setupEcosystem={setupEcosystem} target={index} conditions={incentives} cancel={true} removeField={removeIncentiveField} isSet={incentive.isSet} setCondition={setIncentives} state={incentive.state} onInput={onInput} />))
    )}

    {newEcosystem?.nameField && (<div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: 'Ecosystem rules:', padding: '0 0 0 10px'}} />
      <Button text={'Add'} prevIcon={FaPlus} setupEcosystem={setupEcosystem} target={'rules'} />
    </div>)}

    {(newEcosystem?.ecoRules?.map((ecoRule, index) => 
      (<InputField {...{show: newEcosystem?.nameField, name: index, value: ecoRule?.rule, placeholder: `Ecosystem rule`, inputKeyDown, onInput: ecoFields, setupEcosystem, target: index, isSet: ecoRule?.isSet, clearInput: clearEcoField, cancel: true, removeField: removeEcoField }} key={index} />)))}


    {newEcosystem?.nameField && (<div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem', justifyContent: 'space-between'}}>
      {formController.next !== 'none' && (<Button text={'Previous'} prevIcon={GrFormPrevious} setupEcosystem={setupEcosystem} target={formController.prev} isSelected={formController.prevCheck} />)}
      <div></div>
      {formController.next == 'none' && (<Button text={newEcosystem?.update ? 'Update' : 'Submit'} size={'medium'} setupEcosystem={setupEcosystem} target={submitCheck.target} isSelected={formController.nextCheck} submit={submitCheck.pass} />)}
    </div>)}


    <Description {...{show: !newEcosystem?.nameField, text: 'My Ecosystems:', padding: '30px 0 4px 10px' }} />

    {!newEcosystem.nameField && (
      <>{!loadedSchedule ? (
      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: feedMax, justifyContent: 'center', marginTop: '40px'}}>
        <Spinner size={31} color={'#999'} />
      </div>
    ) : (userEcosystems?.length > 0 && isLogged) ? userEcosystems.map((ecosystem, index) => { return (
    <div key={index} style={{border: '1px solid #777', padding: '8px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '#eef6ff11', cursor: 'pointer'}}>
    <div className="top-layer">
      <div className="flex-row" style={{padding: '0 10px', marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0rem', width: '100%', alignItems: 'center'}}>
        <div style={{fontSize: isMobile ? '18px' : '24px', fontWeight: '600', color: '#def', padding: '10px', width: 'auto', flexGrow: 1}} onClick={() => {goToEcosystem(event, ecosystem)}}>
          {ecosystem.ecosystem_name} Ecosystem
        </div>
        <div className={`flex-row ${userQuery['shuffle'] ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{border: '1px solid #abc', padding: '4px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}} onClick={() => {modifyEcosystem(ecosystem)}}>
          <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '5px'}}>
            <FaPen size={24} />
          </div>
        </div>
      </div>
    </div>

    </div>)}) : (
      <div style={{width: '100%', fontSize: '20px', fontWeight: '400', textAlign: 'center', color: '#cde'}}>No ecosystems found</div>
    )}</>)}


    <Description {...{show: !newEcosystem?.nameField, text: 'All Ecosystems:', padding: '30px 0 4px 10px'}} />


    {!newEcosystem?.nameField && (
      <>{!loadedSchedule ? (
      <div className='flex-row' style={{height: '100%', alignItems: 'center', width: feedMax, justifyContent: 'center', marginTop: '40px'}}>
        <Spinner size={31} color={'#999'} />
      </div>
    ) : (allEcosystems?.length > 0 && isLogged) ? allEcosystems.map((ecosystem, index) => { return (
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

    <div style={{margin: '0 0 70px 0'}}></div>
    <Modal modal={modal} />
  </div>
  )
}
