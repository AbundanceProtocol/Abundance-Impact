import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { FaStar, FaExternalLinkAlt } from "react-icons/fa"
import { Like, LikeOn, Recast, Message, Kebab, ActiveUser } from '../../../assets'
import { timePassed } from '../../../../utils/utils';
import { IoDiamondOutline as Diamond } from "react-icons/io5";
import { ImArrowUp, ImArrowDown  } from "react-icons/im";
import { AccountContext } from '../../../../context';
import cheerio from 'cheerio'
import FrameButton from '../../../../components/Cast/Frame/Button';
import qs from "querystring";
import Circle from '../../../../models/Circle';
import connectToDatabase from '../../../../libs/mongodb';
import mongoose from "mongoose";

// import useStore from '../../../utils/store';
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function Tips({time, curators, channels, tags, eco, ecosystem, fids, text, username, id, tipperFid}) {
  const { LoginPopup, fid, userBalances, isLogged } = useContext(AccountContext)
  const index = 0
  const router = useRouter();
  const ref = useRef(null)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const likeRefs = useRef([])
  const recastRefs = useRef([])
  const [userFid, setUserFid] = useState(null)
  const [textMax, setTextMax] = useState('510px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [fail, setFail] = useState(false)
  const [inputText, setInputText] = useState('')
  const initPayload = {
    fid: 3,
    inputText: '',
    buttonIndex: 1,
    castId: {
      hash: '123dlkwajerlj;lwaekr',
      fid: 435
    }
  }
  const [payload, setPayload] = useState(initPayload)
  const initFrame = 
    {
      version: "vNext",
      title: "Multi-Tip",
      image: `${baseURL}/images/frame36.gif`,
      image_aspect_ratio: "1:1",
      buttons: [
        {
          index: 1,
          title: "Multi tip >",
          action_type: "post",
          target: `${baseURL}/api/frames/tips/tip?tip=0`
        },
        {
          index: 2,
          title: "Menu",
          action_type: "post",
          target: `${baseURL}/api/frames/tip/menu?`
        },
        {
          index: 3,
          title: "Auto-tip >",
          action_type: "post",
          target: `${baseURL}/api/frames/tip/auto-tip?`
        },
      ],
      input: {
        text: "Eg.: 1000 $Degen, 500 $HAM"
      },
      state: {},
      frames_url: `${baseURL}/~/ecosystems/${ecosystem}/tips`
    }
  const [frameData, setFrameData] = useState(initFrame)
  const initCast = {
    author: {
      username: 'impactbot',
      pfp_url: 'https://i.imgur.com/0vKv0Xy.jpg',
      display_name: 'Impact App',
      fid: 388571,
      power_badge: false
    },
    impact_balance: 0,
    hash: '0x',
    timestamp: '2024-07-12T23:15:13.000Z',
    embeds: [],
    replies: 0,
    viewer_context: {
      recasted: false,
      liked: false
    },
    reactions: {
      recasts_count: 0,
      likes_count: 0,
    },
    quality_absolute: 0,
    quality_balance: 0
  }
  const [cast, setCast] = useState(initCast)
  const initQuery = {time: 'all', curators: [], channels: [], tags: [], shuffle: true, referrer: null, eco: null, ecosystem: null}
  const [queryData, setQueryData] = useState(initQuery)

  useEffect(() => {
    // console.log(time, curators, shuffle, referrer, eco, ecosystem)

    let timeQuery = '&time=all'
    let curatorsQuery = ''
    // let shuffleQuery = '&shuffle=true'
    // let referrerQuery = ''
    let ecoQuery = '&eco=IMPACT'
    let ecosystemQuery = '&ecosystem=abundance'
    if (time) {
      timeQuery = '&time=' + time
    }
    // if (curators) {
    //   console.log(curators)
    //   for (const curator of curators) {
    //     curatorsQuery += '&curators=' + parseInt(curator)
    //   }
    // }
    // if (shuffle || shuffle == false) {
    //   shuffleQuery = '&shuffle=' + shuffle
    // }
    // if (referrer) {
    //   referrerQuery = '&referrer=' + referrer
    // }
    if (eco) {
      ecoQuery = '&eco=' + eco
    }
    if (ecosystem) {
      ecosystemQuery = '&ecosystem=' + ecosystem
    }

    setQueryData(prev => ({ 
      ...prev, 
      time: timeQuery, 
      curators: curatorsQuery, 
      // shuffle: shuffleQuery, 
      // referrer: referrerQuery, 
      eco: ecoQuery, 
      ecosystem: ecosystemQuery
    }))

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
  }, [router]);

  useEffect(() => {
    console.log(queryData)

    const updatedFrameData = {...frameData}
    updatedFrameData.buttons[0].target = `${baseURL}/api/frames/console/tip-tip?${qs.stringify({ time, curators, eco, ecosystem, channels, start: true })}`

    updatedFrameData.buttons[1].target = `${baseURL}/api/frames/tip/menu?${qs.stringify({ time, curators, eco, ecosystem })}`

    updatedFrameData.buttons[2].target = `${baseURL}/api/frames/tip/auto-tip?${qs.stringify({ time, curators, eco, ecosystem })}`

    updatedFrameData.image = `${baseURL}/api/frames/tip/circle?${qs.stringify({ id })}`

    setFrameData(updatedFrameData)
  }, [queryData]);


  function growPoints(points) {
    if (points && points >= 0 && points <= 5) {
      return 2 * points + 18
    } else if (points && points > 5) {
      return 30
    } else {
      return 18
    }
  }
  
  function shrinkMargin(points) {
    if (points && points >= 0 && points <= 5) {
      return (points) * -1 + 4
    } else if ( points && points > 5) {
      return -2
    } else {
      return 4
    }
  }

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 690) {
        setTextMax(`512px`)
        setFeedMax('620px')
      }
      // else if (screenWidth >= 675 && screenWidth <= 680) {
      //   setTextMax(`${screenWidth - 190}px`)
      //   setFeedMax('580px')
      // }
      else {
        setTextMax(`${screenWidth - 120}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])
  
  const buttonAction = async (button) => {
    console.log(queryData.time + queryData.curators + queryData.points + queryData.ecosystem)
    const updatedPayload = {...payload}
    updatedPayload.buttonIndex = button.index
    updatedPayload.inputText = inputText
    updatedPayload.fid = fid ?? 3

    setPayload(updatedPayload)

    const url = button.target

    async function postFrame(url, untrustedData) {
      try {
        const response = await axios.post(url, {untrustedData})
        // console.log(response)
  
        if (response.headers['content-type'].includes('text/html')) {
          const $ = cheerio.load(response.data);
          const metadata = {};
  
          $('meta').each((i, elem) => {
              const name = $(elem).attr('name') || $(elem).attr('property');
              if (name) {
                  metadata[name] = $(elem).attr('content');
              }
          });
  
          return metadata;
      } else {
          throw new Error('Response is not of type text/html');
      }
  
      } catch (error) {
        console.log('Error:', error)
      }
    }

    const getframeData = await postFrame(url, updatedPayload) 
    
    if (getframeData) {
      let updatedFrameData = {...frameData}
      updatedFrameData.input = null
      updatedFrameData.buttons = null
      let frameMeta = []
      for (let i = 1; i <= 4; i++) {
        if (getframeData[`fc:frame:button:${i}`] && getframeData[`fc:frame:button:${i}:action`] && getframeData[`fc:frame:button:${i}:target`]) {
          let context = {
            index: i + 1,
            title: getframeData[`fc:frame:button:${i}`],
            action_type: getframeData[`fc:frame:button:${i}:action`],
            target: getframeData[`fc:frame:button:${i}:target`]
          }
          frameMeta.push(context)
        }
      }
      updatedFrameData.buttons = frameMeta
      updatedFrameData.image = getframeData[`fc:frame:image`]
      if (getframeData[`fc:frame:image:aspect_ratio`]) {
        updatedFrameData.image_aspect_ratio = getframeData[`fc:frame:image:aspect_ratio`]
      }
      console.log(frameMeta)
      if (getframeData[`fc:frame:input:text`]) {
        let input = {text: getframeData[`fc:frame:input:text`]}
        updatedFrameData.input = input
      }
      console.log(getframeData)
      console.log(updatedFrameData, updatedFrameData.buttons.length, updatedFrameData.buttons)
      setFrameData(updatedFrameData)
    } else {
      console.log('error')
    }
  }

  async function onInput(event) {
    setInputText(event.target.value)
  }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
            
    {queryData && (
      <Head>
        <title>Tips | Impact App</title>
        <meta name="description" content={`Support builder and creators with Impact App`} />
        <meta name="viewport" content="width=device-width"/>
        <meta property="og:title" content="Multi-Tip" />
        <meta property='og:image' content={`${baseURL}/api/frames/tip/circle?${qs.stringify({    
          id })}`} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${baseURL}/api/frames/tip/circle?${qs.stringify({    
          id })}`} />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />
        <meta property="fc:frame:button:1" content='Multi-tip >' />
        <meta property="fc:frame:button:1:action" content="post" />

        <meta property="fc:frame:button:1:target" content={`${baseURL}/api/frames/tip/tip?${qs.stringify({    
          time, curators, eco, ecosystem, channels, start: true
        })}`} />

        <meta property="fc:frame:button:2" content={'Menu'} />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content={`${baseURL}/api/frames/tip/menu?${qs.stringify({ time, curators, eco, ecosystem, channels })}`} />

        <meta property="fc:frame:button:3" content={'Auto-tip >'} />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content={`${baseURL}/api/frames/tip/auto-tip?${qs.stringify({ time, curators, eco, ecosystem, channels })}`} />

        <meta property="fc:frame:button:4" content={'Explore'} />
        <meta property="fc:frame:button:4:action" content="link" />
        <meta property="fc:frame:button:4:target" content={`https://warpcast.com/~/composer-action?view=prompt&url=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Fmini-app%2Fcurator%3Ffid%3D${tipperFid}%26id%3D${id}%26app%3Dmini`} />

        <meta name="fc:frame:input:text" content="Eg.: 1000 $Degen, 500 $HAM" />
      </Head>
    )}
    <div className="" style={{padding: '58px 0 0 0'}}>
    </div>


    <>{
    cast && (<div className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
      <div className="flex-row">
        <div className="flex-col" style={{alignItems: 'center', userSelect: 'none'}}>

          <div className="" style={{margin: '0 10px 0 0'}}>
            <a className="" title="" href={`/${cast.author.username}`} onClick={(event) => {
                  if (!isLogged) {
                    LoginPopup()
                    event.preventDefault()
                  } else {
                    // goToUserProfile(event, cast.author)
                  }
                }}>
              <img loading="lazy" src={cast.author.pfp_url} className="" alt={`${cast.author.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
            </a>
          </div>
          {(userFid && userFid !== cast.author.fid || true) && (
          <div className={`'flex-col' ${fail ? 'flash-fail' : ''}`} style={{margin: '10px 10px 0 0'}}>
            <div className={`${fail ? 'flash-fail' : ''}`} style={{textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#555', margin: '-6px 0 0 0'}}>
              <div>{cast.impact_balance || 0}</div>
            </div>
            <div className={`impact-arrow ${fail ? 'flash-fail' : ''}`} onClick={
             () => {
                if (!isLogged) {
                  LoginPopup()
                } else {
                  if(userBalances.impact > 0) {
                    // boostImpact(cast, 1)
                  } else { 
                    clickFailed()
                  }
                }
              }
            } style={{margin: `${shrinkMargin(cast.impact_balance)}px 0 ${shrinkMargin(cast.impact_balance)}px 0`}}>
              <FaStar size={growPoints(cast.impact_balance)} className='' style={{fontSize: '25px'}} />
            </div>
          </div>
          )}
        </div>
        <div className="flex-col" style={{width: 'auto', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem'}}>
        <div className="flex-col" style={{gap: '0.5rem'}}>
          <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '', alignItems: 'flex-start', flexWrap: 'wrap'}}>
            <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', userSelect: 'none'}}>
              <span className="">
                <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} style={{cursor: 'pointer'}} onClick={(event) => {
                  if (!isLogged) {
                    LoginPopup()
                    event.preventDefault()
                  } else {
                    // goToUserProfile(event, cast.author)
                  }
                }}>
                  <div className="flex-row" style={{alignItems: 'center'}}>
                    <span className="name-font">{cast.author.display_name}</span>
                    <div className="" style={{margin: '0 0 0 3px'}}>
                      {(cast.author.power_badge) && (<ActiveUser />)}
                    </div>
                  </div>
                </a>
              </span>
              <span className="user-font">
                <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} onClick={(event) => {
                  if (!isLogged) {
                    LoginPopup()
                    event.preventDefault()
                  } else {
                    // goToUserProfile(event, cast.author)
                  }
                }}>@{cast.author.username}</a>
              </span>
              <div className="">·</div>
              <a href={`/${cast.author.username}/casts/${cast.hash}`} className="fc-lnk" title="Navigate to cast" onClick={(event) => {
                  if (!isLogged) {
                    LoginPopup()
                    event.preventDefault()
                  } else {
                    // goToCast(event, cast)
                  }
                }}>
                <div className="user-font">{timePassed(cast.timestamp)}</div>
              </a>
            </div>
            {/* <div className="">
              <Kebab />
            </div> */}
          </div>
          <div className="">
            <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax, whiteSpace: 'pre-line'}}>
              {/* <CastText text={cast.text} embeds={cast.embeds} mentions={cast.mentioned_profiles} /> */}
              {cast.text}
              </div>
            {(cast.embeds.length > 0) && (cast.embeds.map((embed, subindex) => (
              
            <div key={subindex} className='flex-col' style={{alignItems: 'center', display: hide ? 'flex' : 'flex'}}>
            </div>
            )))}
          </div>
          <div>
            {frameData && (<div className="flex-col" style={{border: '1px solid #666', padding: '8px 8px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '0.5rem'}}>
              <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                <img src={frameData.image} style={{width: 'auto', height: 'auto', maxWidth: textMax, minWidth: 'auto', minHeight: 'auto', borderRadius: '5px', aspectRatio: frameData.image_aspect_ratio == '1:1' ? '1 / 1' : '16 / 9'}} />
              </div>
              <div className='flex-row' style={{width: '100%', justifyContent: 'space-evenly', gap: '0.5rem', flexWrap: 'wrap'}}>

                {frameData?.input && (<input onChange={onInput} 
                  name='frame-input' 
                  placeholder={frameData.input.text} 
                  value={inputText} 
                  className='srch-btn' 
                  style={{width: '100%', backgroundColor: '#234', margin: '0', color: '#fff'}} 
                />)}
                    
                {frameData?.buttons && (frameData.buttons.map((button, index) => (
                  <FrameButton key={index} {...{frameData, button, buttonAction, type: button.action_type, index}} />
                )))}
              </div>
            </div>)}
          </div>
          {(typeof cast.channelName !== 'undefined') && (
            <div className="flex-row" style={{border: '1px solid #666', padding: '2px 4px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                <img loading="lazy" src={cast.channelImg} className="" alt="Channel image" style={{width: '17px', height: '17px', minWidth: '17px', minHeight: '17px', borderRadius: '3px'}} />
                <span className="channel-font">{cast.channelName}
                </span>
              </div>
            </div>
          )}
          </div>
          <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
            <div className="flex-row" style={{flex: 1, padding: '3px'}}>
              <div className="">
                <Message />
              </div>
              <span className="" style={{padding: '0 0 0 5px'}}>{cast.replies.count}</span>
            </div>
            <div className="flex-row" style={{flex: 1}}>
              <div
                ref={el => (recastRefs.current[index] = el)} 
                className='flex-row recast-btn' 
                style={{color: cast.viewer_context?.recasted ? '#191' : ''}}
                onClick={() => {
                  if (!isLogged) {
                    LoginPopup()
                  } else {
                    // postRecast(cast.hash, index, cast.reactions.recasts_count)
                  }
                }}
                >
                <div className="">
                  <Recast />
                </div>
                <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.recasts_count}</span>
              </div>
            </div>
            <div className="flex-row" style={{flex: 4}}>
              <div 
                ref={el => (likeRefs.current[index] = el)} 
                className='flex-row like-btn' 
                style={{color: cast.viewer_context?.liked ? '#b33' : ''}}
                onClick={() => {
                  if (!isLogged) {
                    LoginPopup()
                  } else {
                    // postLike(cast.hash, index, cast.reactions.likes_count)
                  }
                }}>
                <div className="">
                  {cast.viewer_context?.liked ? <LikeOn /> : <Like />}
                </div>
                <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.likes_count}</span>
              </div>
            </div>
            <div className="flex-row" style={{flex: 1, padding: '3px', gap: '0.5rem'}}>
              <div className={`impact-arrow ${fail ? 'flash-fail' : ''}`} style={{padding: '0px 1px 0 0px'}} onClick={() => {
                if (!isLogged) {
                  LoginPopup()
                } else {
                  // boostQuality(cast, 1)
                }
                }}>
                <ImArrowUp />
              </div>

              <span className={`flex-row ${fail ? 'flash-fail' : ''}`} style={{padding: '0 0 0 5px', userSelect: 'none', gap: '0.15rem'}}>
                <div>{cast.quality_balance || 0}</div>
              {(cast.quality_absolute && cast.quality_absolute !== 0 && cast.quality_absolute != Math.abs(cast.quality_balance)) ? (<div style={{color: '#666', fontSize: '13px', padding: '2px 0 0 0'}}>{`(${cast.quality_absolute})`}</div>) : ''}
              </span>

              <div className={`${fail ? 'flash-fail' : ''}`} style={{padding: '2px 10px 0 0px'}}>
                <Diamond />
              </div>

              <div className={`like-btn ${fail ? 'flash-fail' : ''}`} style={{padding: '2px 0 0 0px'}} onClick={() => {
                if (!isLogged) {
                  LoginPopup()
                } else {
                  // boostQuality(cast, -1)
                }
                }}>
                <ImArrowDown />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>)}</>
    </div>
  );
}


export async function getServerSideProps(context) {
  const { query, params } = context;
  const { id } = query;
  const { ecosystem } = params;
  
  async function getCircle(id) {
    if (id) {
      try {
        const objectId = new mongoose.Types.ObjectId(id)
        console.log(id)
        await connectToDatabase();
        let circle = await Circle.findOne({ _id: objectId }).exec();
        if (circle) {
          let eco = ''
          if (circle.points) {
            eco = circle?.points?.substring(1)
          }
          return { time: circle?.time, curators: circle?.curators, channels: circle?.channels, eco, username: circle?.username, tipperFid: circle?.fid }
        } else {
          return { time: 'all', curators: [], channels: [], eco: null, username: '', tipperFid: 9326 }
        }
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return { time: 'all', curators: [], channels: [], eco: null, username: '', tipperFid: 9326 }
      }  
    } else {
      return { time: 'all', curators: [], channels: [], eco: null, username: '', tipperFid: 9326 }
    }
  }
  
  const { time, curators, channels, eco, username, tipperFid } = await getCircle(id)
  
  let setId = ''
  if (id) {
    setId = id
  }
  let setUsername = ''
  if (username) {
    setUsername = username
  }
  let setEco = null
  if (eco) {
    setEco = eco
  }
  let setTime = 'all'
  if (time) {
    setTime = time
  }
  let setCurators = []
  if (curators) {
    setCurators = Array.isArray(curators) ? parseInt(curators) : [parseInt(curators)]
  }  
  let setChannels = []
  if (channels) {
    setChannels = Array.isArray(channels) ? channels : [channels]
  }
  let setTipperFid = 9326
  if (tipperFid) {
    setTipperFid = tipperFid
  }

  return {
    props: {
      time: setTime,
      curators: setCurators,
      channels: setChannels,
      eco: setEco,
      ecosystem: ecosystem,
      username: setUsername,
      id: setId,
      tipperFid: setTipperFid
    },
  };
}