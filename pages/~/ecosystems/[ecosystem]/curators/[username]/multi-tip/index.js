import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { AccountContext } from '../../../../../../../context'
import useMatchBreakpoints from '../../../../../../../hooks/useMatchBreakpoints'
import axios from 'axios';
import { useRouter } from 'next/router';
import Button from '../../../../../../../components/Ecosystem/Button';
import Description from '../../../../../../../components/Ecosystem/Description';
import Dropdown from '../../../../../../../components/Ecosystem/Dropdown';
import Modal from '../../../../../../../components/Layout/Modals/Modal';
import qs from "querystring";
import { getTimeRange } from '../../../../../../../utils/utils';
import Spinner from '../../../../../../../components/Common/Spinner';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function MultiTip() {
  const ref = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const { miniApp, fid, isLogged } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const router = useRouter()
  const { ecosystem, username } = router.query;
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  const initialSubmit = {pass: false, target: null}
  const [submitCheck, setSubmitCheck] = useState(initialSubmit)
  const [frameTime, setFrameTime] = useState({frame: '7 Days', url: '7d', isSet: 'working', condition: '7d'})
  const [sched, setSched] = useState({curators: false, channels: false, docs: false})
  const [frameCurators, setFrameCurators] = useState({frame: [9326], url: [9326], isSet: 'working', condition: 'abundance'})
  const [frameEcosystem, setFrameEcosystem] = useState({frame: 'abundance', url: 'abundance', eco: 'IMPACT', isSet: 'working', condition: 'abundance'})
  const [loading, setLoading] = useState(false)
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
  const [curatorData, setCuratorData] = useState(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [showcase, setShowcase] = useState([])
  const initCurators = [
    { value: 'none', label: 'Choose curator', fid: null },
    { value: 'abundance', label: '@abundance', fid: 9326 },
  ]
  const [curatorOptions, setCuratorOptions] = useState(initCurators)
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


  async function createCircle(
    fid,
    time,
    curator,
    channel,
    showcase
  ) {

    try {
      const response = await axios.post(
        "/api/curation/postCurationCircle",
        {
          fid,
          time,
          curator,
          channel,
          showcase,
        }
      );
      if (response?.data) {
        return response?.data?.circleId;
      } else{
        return null
      }
    } catch (error) {
      console.error("Error creating post:", error);
      return null
    }
  }


  async function updateImage(curator, channels, timeframe, showcase, docs) {
    setSubmitCheck({ pass: false, target: false });
    let pfp = null;
    let username = null;
    if (curator) {
      pfp = curator.pfp;
      username = curator.username;
    }
    console.log("curator", curator, pfp, username);
    try {
      const response = await axios.post(
        "/api/multi-tip/postFrame",
        {
          curator: [{ pfp, username }],
          channels: [channels] || [],
          showcase,
          timeframe,
        },
        {
          responseType: "blob", // Important: tell axios to handle the response as a blob
        }
      );
      console.log(response?.data);
      const url = URL.createObjectURL(new Blob([response?.data]));
      setImgSrc(url);
      setLoading(false);
      // setImgSrc(response?.data || null);
      // return response?.data;
    } catch (error) {
      console.error("Error creating post:", error);
      setImgSrc(null);
      setLoading(false);
    }
    if (
      frameCurators.isSet == "working" &&
      frameEcosystem.isSet == "working" &&
      frameTime.isSet == "working" &&
      docs > 0
    ) {
      setSubmitCheck({ pass: true, target: true });
    } else {
      setSubmitCheck({ pass: false, target: false });
    }
  }



  async function getDocs(points, curators, channels, time) {
    if (!loading) {
      setLoading(true);
    }
    const getTime = getTimeRange(time)
    try {
      const docData = await axios.get('/api/curation/getDocNum', { params: { points, curators, channels, time: getTime } })
      if (docData) {
        console.log("casts", docData?.data?.curator);
        setDocNum(docData?.data?.docs)
        setCuratorData(docData?.data?.curator);
        let showcaseData = []
        if (docData?.data?.casts?.length > 0) {
          showcaseData = docData?.data?.casts
          if (showcaseData?.length > 0 && showcaseData[0]?.impact) {
            showcaseData.sort((a, b) => b.impact - a.impact);
          }
        }
        setShowcase(showcaseData);
        updateImage(
          docData?.data?.curator,
          channels,
          time,
          showcaseData,
          docData?.data?.docs
        );
      } else {
        setDocNum(0)
        setShowcase([])
        setCuratorData(null)
        updateImage(frameCurators, channels, time, [], 0);
      }
    } catch (error) {
      console.error('Error updating channels:', error);
      setDocNum(0)
      setShowcase([]);
      setCuratorData(null);
      updateImage(frameCurators, channels, time, [], 0);
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

    const { userFid, name } = router.query;

    if (userFid && name) {
      let curator = { value: name, label: '@' + name, fid: Number(userFid) }
      console.log('username', name, '@' + name)

      const updatedCurators = [
        // { value: 'none', label: 'Choose curator', fid: null },
        // { value: 'abundance', label: '@abundance', fid: 9326 },
        { value: name, label: '@' + name, fid: Number(userFid) },
      ];
      setCuratorOptions(updatedCurators);
      setFrameCurators({frame: [Number(userFid)], url: [Number(userFid)], isSet: 'working', condition: name})
      // setCuratorOptions(initCurators)
    // }
    } else {
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
      console.error('Error creating post:', error);
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


  async function setupEcosystem(target) {

    console.log(frameEcosystem?.url, frameTime?.url, fid, frameEcosystem?.eco)

    const getCircleId = await createCircle(
      fid,
      frameTime.url,
      curatorData,
      selectedChannel,
      showcase
    );


    // let shareUrl = `https://impact.abundance.id/~/ecosystems/${frameEcosystem?.url}/tip-v5?time=${frameTime?.url}&shuffle=true${frameCurators?.url ? '&curators=' + frameCurators?.url[0] : ''}&eco=${frameEcosystem?.eco}${ (selectedChannel !== ' ') ? '&channels=' + selectedChannel : ''}`

    let shareUrl = `https://impact.abundance.id/~/ecosystems/${frameEcosystem?.url}/curation-v1?id=${getCircleId}`

    let tippedCreators = "";
    if (showcase?.length > 0) {
      tippedCreators = showcase.reduce((str, creator, index, arr) => {
        if (!str.includes(creator.username)) {
          if (str === "") {
            return "@" + creator.username;
          }
          if (index === arr.length - 1 && index !== 0) {
            return str + " & @" + creator.username + " ";
          }
          return str + ", @" + creator.username;
        }
        return str;
      }, "");
    }

    // console.log('shareUrl', shareUrl)
    let shareText = ''

    if (frameCurators?.url && frameCurators?.url[0] == fid) {
      shareText = `I'm supporting great builders & creators on /impact by @abundance.\n\nMy latest picks feature ${tippedCreators}\n\nExplore my curation and support the nominees here:`;
    } else if (frameCurators?.url?.length > 0) {

      if (frameCurators?.url[0] !== fid) {
        shareText = `Loving @${frameCurators?.condition}'s curation of builders & creators on /impact by @abundance.\n\n@${frameCurators?.condition}'s latest picks feature ${tippedCreators}\n\nExplore @${frameCurators?.condition}'s curation and support the nominees here:`;
      } else {
        shareText = `I'm supporting great builders & creators on /impact by @abundance.\n\nLatest picks feature ${tippedCreators}\n\nExplore the ecosystem and support builders & creators here:`;
      }
    } else {
      shareText = `I'm supporting great builders & creators on /impact by @abundance.\n\nLatest picks feature ${tippedCreators}\n\nExplore the ecosystem and support builders & creators here:`;
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

  // useEffect(() => {
  //   console.log('frame', frameCurators.isSet, frameEcosystem.isSet, frameTime.isSet)
  //   if (frameCurators.isSet == 'working' && frameEcosystem.isSet == 'working' && frameTime.isSet == 'working' && docNum > 0) {
  //     setSubmitCheck({pass: true, target: true})
  //   } else {
  //     setSubmitCheck({pass: false, target: false})
  //   }
  // }, [frameCurators, frameEcosystem, frameTime, docNum])



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

    <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'flex-start', padding: '20px 0 30px 0'}}>
      <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
        {/* <Link href={`/~/studio`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>Studio</div></Link> */}

        <Link href={`/~/ecosystems/${ecosystem}`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>{ecosystem}</div></Link>
        <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
        <Link href={`/~/ecosystems/${ecosystem}/curators`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>curators</div></Link>
        <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
        <Link href={`/~/ecosystems/${ecosystem}/curators/${username}`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>@{username}</div></Link>
        <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
        <div className='filter-item-on' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>multi-tip</div>
      </div>
    </div>

    <div
        className="flex-row"
        style={{
          margin: "33px 3px 8px 3px",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        {!imgSrc ? (
          <div style={{ position: "relative" }}>
            <img
              src={`${baseURL}/images/backgroundframe3.png`}
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "400px",
                minWidth: "auto",
                minHeight: "auto",
                borderRadius: "15px",
                aspectRatio: "1 / 1",
                border: "3px solid #abc",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Spinner size={46} color={"#eee"} />
            </div>
          </div>
        ) : imgSrc && !loading ? (
          <img
            src={imgSrc}
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "400px",
              minWidth: "auto",
              minHeight: "auto",
              borderRadius: "15px",
              aspectRatio: "1 / 1",
              border: "3px solid #abc",
            }}
          />
        ) : (
          <div style={{ position: "relative" }}>
            <img
              src={imgSrc}
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "400px",
                minWidth: "auto",
                minHeight: "auto",
                borderRadius: "15px",
                aspectRatio: "1 / 1",
                border: "3px solid #abc",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Spinner size={46} color={"#eee"} />
            </div>
          </div>
        )}
      </div>



    {/* <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem', justifyContent: 'center'}}>
    <img src={`${baseURL}/api/multi-tip/frame?${qs.stringify({ status: 'off', curators: frameCurators?.url, points: '$IMPACT', needLogin: false, time: frameTime?.url})}`} style={{width: '100%', height: 'auto', maxWidth: '400px', minWidth: 'auto', minHeight: 'auto', borderRadius: '15px', aspectRatio: '1 / 1', border: '3px solid #abc'}} /></div> */}

    {/* <div className='flex-row' style={{margin: '33px 3px 8px 3px', gap: '1rem'}}>
      <Description {...{show: true, text: 'Ecosystem:', padding: '0 0 0 10px' }} />
    </div>

    <Dropdown {...{key: 0, name: 0, value: frameTime.condition, setupEcosystem, target: 0, conditions: ecosystemOptions, cancel: false, isSet: frameEcosystem.isSet, setCondition: setEcosystem, state: true}} /> */}

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
    <Button
      {...{
        text: "Create Frame",
        size: "large",
        setupEcosystem,
        target: submitCheck.target,
        isSelected: false,
        submit: submitCheck.target,
        loading,
        textLoading: "Generating frame...",
      }}
    />
      <div></div>
    </div>

    <div style={{margin: '0 0 70px 0'}}></div>
    <Modal modal={modal} />
  </div>
  )
}
