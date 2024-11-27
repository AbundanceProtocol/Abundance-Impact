import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
// import Link from 'next/link'
// import { AccountContext } from '../../../context'
// import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints'
import axios from 'axios';
import { useRouter } from 'next/router';
import Button from '../../../components/Ecosystem/Button';
import Description from '../../../components/Ecosystem/Description';
import Dropdown from '../../../components/Ecosystem/Dropdown';
import Modal from '../../../components/Layout/Modals/Modal';
import qs from "querystring";
import { getTimeRange } from '../../../utils/utils'
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function MultiTip() {
  const ref = useRef(null)
  // const { isMobile } = useMatchBreakpoints();
  // const { miniApp, fid, isLogged } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const router = useRouter()
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  const initialSubmit = {pass: false, target: null}
  const [submitCheck, setSubmitCheck] = useState(initialSubmit)
  const [frameTime, setFrameTime] = useState({frame: '7 Days', url: '7d', isSet: 'working', condition: '7d'})
  const [sched, setSched] = useState({curators: false, channels: false, docs: false})
  const [frameCurators, setFrameCurators] = useState({frame: [9326], url: [9326], isSet: 'working', condition: 'abundance'})
  const [frameEcosystem, setFrameEcosystem] = useState({frame: 'abundance', url: 'abundance', eco: 'IMPACT', isSet: 'working', condition: 'abundance'})
  const initEcosystems = [
    { value: 'abundance', label: 'Abundance ecosystem' , eco: 'IMPACT'},
  ]
  const [ecosystemOptions, setEcosystemOptions] = useState(initEcosystems)
  const initChannels = [
    { value: ' ', label: 'Choose channel'},
    { value: 'impact', label: '/impact'},
  ]
  const [channelOptions, setChannelOptions] = useState(initChannels)
  const [selectedChannel, setSelectedChannel] = useState(' ')
  const [docNum, setDocNum] = useState(0)

  const initCurators = [
    { value: 'none', label: 'Choose curator', fid: null },
    { value: 'abundance', label: '@abundance', fid: 9326 },
  ]
  const [curatorOptions, setCuratorOptions] = useState(initCurators)
  const [frameFid, setFrameFid] = useState(null)

  const timeframe = [
    { value: 'none', label: 'Choose timeframe' },
    { value: '24h', label: '24 Hours' },
    { value: '3d', label: '3 Days' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All time' },
  ]

  const updateChannel = (value) => {
    setSelectedChannel(value)
  };

  async function getChannels(points) {
    try {
      const channelData = await axios.get('/api/curation/getChannelNames', { params: { points } })
      if (channelData) {
        const ecoChannels = channelData?.data?.channels
        console.log('e1', ecoChannels)
        const updatedChannels = ecoChannels.map(channel => ({ value: channel, label: `/${channel}` }));
        
        const finalChannels = [
          { value: ' ', label: 'Choose channel' },
          ...updatedChannels
        ]
        
        setChannelOptions(finalChannels);
      }
    } catch (error) {
      console.error('Error updating channels:', error);
    }
  }


  useEffect(() => {
    if (sched.docs) {
      getDocs('$IMPACT', frameCurators?.url, selectedChannel, frameTime?.url)
      setSched(prev => ({...prev, docs: false }))
    } else {
      const timeoutId = setTimeout(() => {
        getDocs('$IMPACT', frameCurators?.url, selectedChannel, frameTime?.url)
        setSched(prev => ({...prev, docs: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [frameCurators, frameEcosystem, frameTime, selectedChannel, sched.docs])


  async function getDocs(points, curators, channels, time) {
    const getTime = getTimeRange(time)
    try {
      const docData = await axios.get('/api/curation/getDocNum', { params: { points, curators, channels, time: getTime } })
      if (docData) {
        setDocNum(docData?.data?.docs)
      } else {
        setDocNum(0)
      }
    } catch (error) {
      console.error('Error updating channels:', error);
      setDocNum(0)
    }
  }


  useEffect(() => {
    if (sched.channels) {
      getChannels('$IMPACT')
      setSched(prev => ({...prev, channels: false }))
    } else {
      const timeoutId = setTimeout(() => {
        getChannels('$IMPACT')
        setSched(prev => ({...prev, channels: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [sched.channels])


  useEffect(() => {
    const { trigger, fid } = router.query;
    console.log('fid', fid)
    if (fid) {
      setFrameFid(Number(fid))
    }

    if (trigger === 'createEcosystem') {
      setupEcosystem('start');
    }
  }, [router.query]);


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
    if (sched.curators) {
      getCurators('$IMPACT')
      setSched(prev => ({...prev, curators: false }))
    } else {
      const timeoutId = setTimeout(() => {
        getCurators('$IMPACT')
        setSched(prev => ({...prev, curators: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [sched.curators])


  async function getCurators(points) {
    try {
      const curatorData = await axios.get('/api/curation/getCuratorNames', { params: { points } })
      if (curatorData) {
        const ecoCurators = curatorData?.data?.curators
        console.log('e1', ecoCurators)

        const updatedCurators = [
          { value: 'none', label: 'Choose curator', fid: null },
          ...ecoCurators
        ];
        setCuratorOptions(updatedCurators);
      }
    } catch (error) {
      console.error('Error updating curators:', error);
    }
  }


  useEffect(() => {
    console.log('e2 triggered')

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


  function setupEcosystem(target) {

    console.log(frameEcosystem?.url, frameTime?.url, frameFid, frameEcosystem?.eco)
    let shareUrl = `https://impact.abundance.id/~/ecosystems/${frameEcosystem?.url}/tip-v5?time=${frameTime?.url}&shuffle=true${frameCurators?.url ? '&curators=' + frameCurators?.url[0] : ''}&eco=${frameEcosystem?.eco}${ (selectedChannel !== ' ') ? '&channels=' + selectedChannel : ''}`

    console.log('shareUrl', shareUrl, frameFid)
    let shareText = ''

    if (frameCurators?.url && frameCurators?.url[0] == frameFid) {
      shareText = `I'm supporting great builders & creators on /impact by @abundance.\n\nExplore my curation and support the nominees here:`
    } else if (frameCurators?.url?.length > 0) {

      if (frameCurators?.url[0] !== frameFid) {
        shareText = `Loving @${frameCurators?.condition}'s curation of builders & creators on /impact by @abundance.\n\nExplore @${frameCurators?.condition}'s curation and support their nominees here:`
      } else {
        shareText = `I'm supporting great builders & creators in the ${frameEcosystem?.url} ecosystem on /impact by @abundance. Explore the ecosystem and support builders & creators here:`
      }
    } else {
      shareText = `I'm supporting great builders & creators in the ${frameEcosystem?.url} ecosystem on /impact by @abundance. Explore the ecosystem and support builders & creators here:`
    }

    let encodedShareText = encodeURIComponent(shareText)
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

    // if (!miniApp) {
    //   window.open(shareLink, '_blank');
    // } else if (miniApp) {
      window.parent.postMessage({
        type: "createCast",
        data: {
          cast: {
            text: shareText,
            embeds: [shareUrl]
          }
        }
      }, "*");
    // }
  }

  useEffect(() => {
    console.log('frame', frameCurators.isSet, frameEcosystem.isSet, frameTime.isSet)
    if (frameCurators.isSet == 'working' && frameEcosystem.isSet == 'working' && frameTime.isSet == 'working' && docNum > 0) {
      setSubmitCheck({pass: true, target: true})
    } else {
      setSubmitCheck({pass: false, target: false})
    }
  }, [frameCurators, frameEcosystem, frameTime, docNum])



  function setEcosystem(value, target, state) {
    console.log(value, target)

    const ecosystem = ecosystemOptions.find(item => item.value === value);
    // console.log(curator, Number(curator?.fid))
    if (curator && value !== 'none') {
      setFrameEcosystem({frame: ecosystem.value, url: ecosystem.value, isSet: 'working', condition: value});
    } else {
      setFrameEcosystem({frame: 'None', url: null, isSet: 'empty', condition: 'none'})
    }
  }

  function setCurators(value, target, state) {
    console.log(value, target)

    const curator = curatorOptions.find(item => item.value === value);
    // console.log(curator, Number(curator?.fid))
    if (curator && value !== 'none') {
      setFrameCurators({frame: [Number(curator?.fid)], url: [Number(curator?.fid)], isSet: 'working', condition: value});
    } else {
      setFrameCurators({frame: 'None', url: null, isSet: 'working', condition: 'none'})
    }
  }

  function setTimeframe(value, target, state) {
    console.log('get', value, target, state)
    const time = timeframe.find(item => item.value === value);
    if (time && value !== 'none') {
      setFrameTime({frame: time?.label, url: value, isSet: 'working', condition: value}); // Output: 'All time'
    } else {
      setFrameTime({frame: 'None', url: value, isSet: 'empty', condition: value})
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


    <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
      <p className='' style={{padding: '10px', color: '#fff', fontWeight: '700', fontSize: '20px'}}>Create Multi-tip Frame </p>
    </div>


    <div className='flex-row' style={{margin: '13px 3px 8px 3px', gap: '1rem', justifyContent: 'center'}}>
    <img src={`${baseURL}/api/multi-tip/frame?${qs.stringify({ curators: frameCurators?.url, points: '$IMPACT', time: frameTime?.url, channel: selectedChannel })}`} style={{width: '100%', height: 'auto', maxWidth: '400px', minWidth: 'auto', minHeight: 'auto', borderRadius: '15px', aspectRatio: '1 / 1', border: '3px solid #abc'}} /></div>

    <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: 'Ecosystem:', padding: '0 0 0 10px' }} />
    </div>

    <Dropdown {...{key: 0, name: 0, value: frameTime.condition, setupEcosystem, target: 0, conditions: ecosystemOptions, cancel: false, isSet: frameEcosystem.isSet, setCondition: setEcosystem, state: true}} />

    <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: 'Curators:', padding: '0 0 0 10px' }} />
    </div>

    <Dropdown {...{key: 1, name: 0, value: frameCurators.condition, setupEcosystem, target: 0, conditions: curatorOptions, cancel: false, isSet: frameCurators.isSet, setCondition: setCurators, state: frameCurators.state}} />


    <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: 'Timeframe:', padding: '0 0 0 10px'}} />
    </div>


    <Dropdown {...{key: 2, name: 0, value: frameTime.condition, setupEcosystem, target: 0, conditions: timeframe, cancel: false, isSet: frameTime.isSet, setCondition: setTimeframe, state: frameTime.state}} />


    <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: 'Channel:', padding: '0 0 0 10px'}} />
    </div>


    <Dropdown {...{key: 3, name: 0, value: selectedChannel, setupEcosystem, target: 0, conditions: channelOptions, cancel: false, isSet: 'working', setCondition: updateChannel, state: true}} />

    <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: `Number of casts: ${docNum}`, padding: '0 0 0 10px'}} />
    </div>


    <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem', justifyContent: 'center'}}>
      <Button {...{text: 'Create Frame', size: 'large', setupEcosystem, target: submitCheck.target, isSelected: false, submit: submitCheck.target}} />
      <div></div>
    </div>

    <div style={{margin: '0 0 70px 0'}}></div>
    <Modal modal={modal} />
  </div>
  )
}
