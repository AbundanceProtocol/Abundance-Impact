import React, { useContext, useRef, useEffect, useState } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/router';
import useStore from '../../utils/store';
import { AccountContext } from '../../context';
import { Like, LikeOn, Recast, Message, Kebab, ActiveUser } from '../../pages/assets'
import { FaSearch, FaLock, FaRegStar, FaStar, FaArrowUp, FaArrowDown } from "react-icons/fa"
import { BiSolidDownArrow as ArrowDown } from "react-icons/bi";
import axios from 'axios';
import { timePassed } from '../../utils/utils';
import CastText from './Text'
import Embed from './Embed';
import Subcast from './Subcast';
import { IoDiamondOutline as Diamond } from "react-icons/io5";
import { ImArrowUp, ImArrowDown  } from "react-icons/im";
import VideoPlayer from './VideoPlayer';
import Images from './Images';
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';

export default function Cast({ cast, index, updateCast, openImagePopup, ecosystem, handle, self, app }) {
  const store = useStore()
  const router = useRouter();
  const { isMobile } = useMatchBreakpoints();
  const [screenWidth, setScreenWidth] = useState(undefined)
  const { LoginPopup, fid, userBalances, setUserBalances, isLogged, isMiniApp } = useContext(AccountContext)
  const [textMax, setTextMax] = useState('522px')
  const [feedMax, setFeedMax ] = useState('620px')
  const likeRefs = useRef([])
  const recastRefs = useRef([])
  const [userFid, setUserFid] = useState(null)
  const [fail, setFail] = useState(false)
  const handleClick = (embed) => {
    openImagePopup(embed); 
  };
  const [hide, setHide] = useState(false)
  function clickFailed() {
    setFail(true);
    setTimeout(() => {
      setFail(false);
    }, 1000);
  }

  function isCurator(fid, cast) {
    if (!isMiniApp) {
      return Array.isArray(cast?.impact_points) &&
       cast?.impact_points.some(point => point?.curator_fid == fid);
    }
  }
  
  async function viewCast(castHash) {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.haptics.impactOccurred('light')
      await sdk.actions.viewCast({ 
        hash: castHash,
      });
      console.log('Cast viewed successfully');
    } catch (error) {
      console.error('Error viewing cast:', error);
    }
  }


  
  async function boostQuality(cast, qualityAmount) {
    const castHash = cast.hash
    const castChannel = cast.root_parent_url
    console.log('fid, castHash, castChannel, qualityAmount', fid, castHash, castChannel, qualityAmount)
    async function postQuality(fid, castHash, castChannel, qualityAmount) {
      try {
        const response = await axios.post('/api/curation/postPointQuality', { fid, castHash, castChannel, qualityAmount, points: '$IMPACT' })
        console.log('response', response)
        return response
      } catch (error) {
        console.error('Error creating post:', error);
        return null
      }
    }
    console.log(userBalances.impact, userBalances.qdau, fid, fid !== '-', qualityAmount, castHash, userBalances.qdau > 0, (cast.impact_balance || cast.impact_balance == 0), !(cast.impact_balance == 0 && qualityAmount < 0))
    if (fid && fid !== '-' && qualityAmount && castHash && userBalances.qdau > 0 && (cast.impact_balance || cast.impact_balance == 0)  &&  !(cast.impact_balance == 0 && qualityAmount < 0)) {
      const qualityResponse = await postQuality(fid, castHash, castChannel, qualityAmount)
      console.log(qualityResponse)
      if (qualityResponse?.data && qualityResponse?.status == 201) {
        const qdauBalance = qualityResponse?.data?.userBalance
        const castAbsoluteQ = qualityResponse?.data?.castAbsoluteQ
        const castTotalI = qualityResponse?.data?.castTotalI
        const castBalanceQ = qualityResponse?.data?.castBalanceQ
        const updatedCast = {...cast, impact_balance: castTotalI, quality_absolute: castAbsoluteQ, quality_balance: castBalanceQ}
        updateCast(index, updatedCast)
        setUserBalances(prev => ({
          ...prev,
          qdau: qdauBalance
        }))
        console.log('userBalance', qdauBalance)

      } else {
        console.log('fail')
        clickFailed()
      }
    } else {
      clickFailed()
    }
  }

  async function unstakePoint(cast) {
    try {
      const response = await axios.post('/api/curation/postUnstake', { castHash: cast.hash, fid, points: ecosystem })
      if (response?.data?.castImpact || response?.data?.castImpact == 0) {
        console.log(response?.data?.castImpact)
        const impactBalance = response?.data?.castImpact
        const updatedCast = {...cast, impact_balance: impactBalance}
        updateCast(index, updatedCast)
      } else {
        clickFailed()
      }
    } catch (error) {
      console.error('Error creating post:', error);
      clickFailed()
    }
  }


  async function boostImpact(cast, impactAmount) {
    console.log('cast', cast)

    const castContext = {
      author_fid: cast.author.fid,
      author_pfp: cast.author.pfp_url,
      author_username: cast.author.username,
      author_display_name: cast.author.display_name,
      cast_hash: cast.hash,
      cast_text: cast.text,
      cast_channel: cast.root_parent_url
    }
    
    // console.log('112 ca1', fid, cast, impactAmount, ecosystem)
    async function postImpact(fid, castContext, impactAmount) {
      try {
        const response = await axios.post('/api/curation/postPointImpact', { fid, castContext, impactAmount, points: ecosystem })
        return response
      } catch (error) {
        console.error('Error creating post:', error);
        return null
      }
    }

    let impactResponse
    if (fid && fid !== '-' && impactAmount && castContext && userBalances?.impact > 0) {
      impactResponse = await postImpact(fid, castContext, impactAmount)
      if (impactResponse?.data && impactResponse.status == 201) {
        let impactBalance = impactResponse?.data?.balance
        let currentImpact = cast.impact_balance || 0
        let addedPoints = impactResponse.data.points
        const updatedCast = {...cast, impact_balance: currentImpact + addedPoints}
        updateCast(index, updatedCast)
        setUserBalances(prev => ({
          ...prev,
          impact: impactBalance
        }))
        console.log('userBalance', impactBalance)

      } else {
        console.log('fail')
        clickFailed()
      }
    } else {
      clickFailed()
    }
  }

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`522px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 160}px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 110}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])

  useEffect(() => {
    if (isLogged) {
      setUserFid(fid)
    }
    console.log('isLogged', isLogged, fid)
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isLogged) {
      setUserFid(fid)
    }
  }, [isLogged])


  const goToCast = async (event, cast) => {
    event.preventDefault()
    const username = cast.author.username
    const castHash = cast.hash
    await store.setCastData(cast)
    router.push(`/${username}/casts/${castHash}`)
  }

  const goToUserProfile = async (event, author) => {
    event.preventDefault()
    const username = author.username
    await store.setUserData(author);
    router.push(`/${username}`)
  }

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

  function shrinkTextMargin(points) {
    if (points && points >= 0 && points <= 4) {
      return (points) + 1
    } else if ( points && points > 4) {
      return 8
    } else {
      console.log('points', points)
      return 2
    }
  }

  async function postRecast(hash, index, count) {
    const recastedCount = count ? Number(count) : 0
    recastRefs.current[index].style.color = '#191'
    try {
      const response = await axios.post('/api/postRecastReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        recastRefs.current[index].style.color = '#000'
      } else if (response.status == 200) {
        const { viewer_context, reactions } = cast
        const updatedRecast = {...viewer_context, recasted: true}
        const updateRecastCount = {...reactions, recasts_count: recastedCount + 1}
        const updatedCast = {...cast, viewer_context: updatedRecast, reactions: updateRecastCount}
        updateCast(index, updatedCast)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function postLike(hash, index, count) {
    const likesCount = count ? Number(count) : 0
    likeRefs.current[index].style.color = '#b33'
    try {
      const response = await axios.post('/api/postLikeReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        likeRefs.current[index].style.color = '#000'
      } else if (response.status == 200) {
        const { viewer_context, reactions } = cast
        const updatedLike = {...viewer_context, liked: true}
        const updateLikesCount = {...reactions, likes_count: likesCount + 1}
        const updatedCast = {...cast, viewer_context: updatedLike, reactions: updateLikesCount}
        updateCast(index, updatedCast)
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  return (<>{
    cast && (<div className="inner-container" style={{width: (isMiniApp || isMobile) ? '340px' : '100%', display: 'flex', flexDirection: 'column', margin: (isMiniApp || isMobile) ? '10px auto' : ''}}>
      <div className='flex-row' style={{width: '100%', justifyContent: 'flex-end', gap: '0.8rem'}}>
        {cast?.tip && (cast?.tip?.map((tip, index) => (<div key={index} className='flex-row' style={{gap: '0.2rem', alignItems: 'flex-end'}}>
          <div style={{fontSize: '13px', fontWeight: '700', color: '#181'}}>{tip?.amount}</div>
          <div style={{fontSize: '11px', fontWeight: '500', color: '#222'}}>{tip?.currency == '$TN100x' ? '$HAM' : tip?.currency}</div>
        </div>
        )))}
      </div>
      <div className={(isMiniApp || isMobile) ? 'flex-col' : 'flex-row'}>
        <div className={(isMiniApp || isMobile) ? 'flex-row' : 'flex-col'} style={{alignItems: 'center', userSelect: 'none'}}>
          <div className="" style={{margin: '0 10px 0 0', height: '50px'}}>
            <Link href={`/~/ecosystems/${handle}/creators/${cast?.author?.username}`}>
              <img loading="lazy" src={cast?.author?.pfp_url} className="" alt={`${cast.author.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
            </Link>
          </div>
          {(userFid && userFid !== cast.author.fid || true) && (
          <div className={`${(isMiniApp || isMobile) ? 'flex-row' : 'flex-col'} ${fail ? 'flash-fail' : ''}`} style={{margin: (isMiniApp || isMobile) ? '10px 0px 10px auto' : '10px 10px 0 0', border: (isMiniApp || isMobile) ? '1px solid #000' : '', padding: (isMiniApp || isMobile) ? '3px 10px 3px 3px' : '', borderRadius: (isMiniApp || isMobile) ? '10px' : '', backgroundColor: (isMiniApp || isMobile) ? '#fff' : ''}}>

          {!(isMiniApp || isMobile) && (<div className={`${fail ? 'flash-fail' : ''}`} style={{textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#555', margin: (isMiniApp || isMobile) ? '8px 0 0 0' : '-6px 0 0 0'}}>
            <div>{cast.impact_balance || 0}</div>
          </div>)}


          <div className={`impact-arrow ${fail ? 'flash-fail' : ''}`} onClick={
             () => {
                if (!isLogged) {
                  console.log('ca2')
                  if (!app) {
                    LoginPopup()
                  }
                } else {
                  if(userBalances.impact > 0) {
                    boostImpact(cast, 1)
                  } else { 
                    clickFailed()
                  }
                }
              }
            } style={{margin: (isMiniApp || isMobile) ? '0 0 0 0' : `${shrinkMargin(cast.impact_balance)}px 0 ${shrinkMargin(cast.impact_balance)}px 0`}}>
              <FaStar size={growPoints(cast.impact_balance)} className='' style={{fontSize: '25px'}} />
          </div>

          {(isMiniApp || isMobile) && (<div className={`${fail ? 'flash-fail' : ''}`} style={{textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#555', margin: `${shrinkTextMargin(cast.impact_balance)}px 0 0 0`}}>
            <div>{cast.impact_balance || 0}</div>
          </div>)}



            {((self && cast?.impact_balance >= 1) || (fid && cast && isCurator(fid, cast))) && (<div className={`like-btn ${fail ? 'flash-fail' : ''}`} onClick={
             () => {
                if (!isLogged) {
                  console.log('ca3')
                  if (!app) {
                    LoginPopup()
                  }
                } else {
                  unstakePoint(cast)
                }
              }
            } style={{margin: (isMiniApp || isMobile) ? '1px -3px -2px 1px' : `${shrinkMargin(cast.impact_balance)}px 0 ${shrinkMargin(cast.impact_balance)}px 0`}}>
              <ArrowDown size={growPoints(cast.impact_balance)} className='' style={{fontSize: '25px'}} />
            </div>)}
          </div>
          )}
        </div>
        <div className="flex-col" style={{width: 'auto', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem'}}>
        <div className="flex-col" style={{gap: '0.5rem'}}>
          <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '', alignItems: 'flex-start', flexWrap: 'wrap'}}>
            <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', userSelect: 'none'}}>
              <span className="">
                {/* <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} style={{cursor: 'pointer'}} onClick={(event) => {
                  if (!isLogged) {
                    console.log('ca4')
                    LoginPopup()
                    event.preventDefault()
                  } else {
                    goToUserProfile(event, cast.author)
                  }
                }}> */}
                <Link className="fc-lnk" title={cast?.author?.display_name} style={{cursor: 'pointer'}} href={`/~/ecosystems/${handle}/creators/${cast?.author?.username}/${cast?.hash}`}>
                  <div className="flex-row" style={{alignItems: 'center'}}>
                    <span className="name-font">{cast.author.display_name}</span>
                    <div className="" style={{margin: '0 0 0 3px'}}>
                      {(cast.author.power_badge) && (<ActiveUser />)}
                    </div>
                  </div>
                </Link>
              </span>
              <span className="user-font">
                {/* <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} onClick={(event) => {
                  if (!isLogged) {
                    console.log('ca5')
                    LoginPopup()
                    event.preventDefault()
                  } else {
                    goToUserProfile(event, cast.author)
                  }
                }}>@{cast.author.username}</a> */}
                <a href={`https://farcaster.xyz/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name}>@{cast.author.username}</a>
              </span>
              <div className="">·</div>

              {/* <a href={`/${cast.author.username}/casts/${cast.hash}`} className="fc-lnk" title="Navigate to cast"
               onClick={(event) => {
                  if (!isLogged) {
                    console.log('ca6')
                    LoginPopup()
                    event.preventDefault()
                  } else {
                    goToCast(event, cast)
                  }
                }}
                ></a> */}

              {!(isMiniApp || isMobile) ? (<a href={`https://farcaster.xyz/${cast?.author?.username}/${cast?.hash?.substring(0, 10)}`} className="fc-lnk" title="Navigate to cast">
                <div className="user-font">{timePassed(cast.timestamp)}</div>
                </a>) : (<a onClick={() => viewCast(cast?.hash)} className="fc-lnk" title="Navigate to cast">
                <div className="user-font">{timePassed(cast.timestamp)}</div>
              </a>)}
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

            {(cast?.cast_media?.length > 0) && (cast?.cast_media?.map((media, subindex) => (
              
              <div key={subindex} className='flex-col' style={{alignItems: 'center', display: hide ? 'flex' : 'flex'}}>
                {(media?.content_type?.startsWith('text/html')) && (
                  <Embed url={media?.url} index={index} subindex={subindex} textMax={textMax} />
                )}
                {(media?.content_type?.startsWith('image/') || media?.content_type == 'frame') && (
                  <Images image={media?.url} subindex={subindex} textMax={textMax} handleClick={handleClick} index={index} />
                )}
                {(media?.content_type == 'quotecast') && (
                  <div className="" key={`${index}-${subindex}`} style={{marginTop: '10px'}}>
                    <Subcast castHash={media?.url} key={subindex} index={subindex} />
                  </div>
                )}
                {(media?.content_type == 'application/x-mpegurl') && (
                  <div className="" key={`${index}-${subindex}`}>
                    <VideoPlayer width={textMax} src={media.url} />
                  </div>
                )}
              </div>
              )))}








            {/* {(cast?.frames?.length > 0) && (cast?.frames?.map((frame, subindex) => (
              <div key={subindex} className='flex-col' style={{alignItems: 'center', display: hide ? 'flex' : 'flex'}}>
                {(frame?.image) && (
                  <Images {...{image: frame?.image, subindex, textMax, handleClick, index}} />
                )}
              </div>
            )))} */}

            {cast?.channel && (<div style={{alignSelf: 'flex-start', fontSize: '13px', margin: '10px 0 0 0', padding: '3px 6px', border: '1px solid #666', width: 'fit-content', borderRadius: '3px', backgroundColor: '#eff', fontWeight: '500', color: '#246'}}>/{cast?.channel?.id}</div>)}
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
              {/* <span className="" style={{padding: '0 0 0 5px'}}>{cast.replies.count}</span> */}
            </div>
            <div className="flex-row" style={{flex: 1}}>
              <div
                ref={el => (recastRefs.current[index] = el)} 
                className='flex-row recast-btn' 
                style={{color: cast.viewer_context?.recasted ? '#191' : ''}}
                onClick={() => {
                  if (!isLogged) {
                    console.log('ca7')
                    if (!app) {
                      LoginPopup()
                    }
                  } else {
                    postRecast(cast.hash, index, cast.reactions.recasts_count)
                  }
                }}
                >
                <div className="">
                  <Recast />
                </div>
                {/* <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.recasts_count}</span> */}
              </div>
            </div>
            <div className="flex-row" style={{flex: 4}}>
              <div 
                ref={el => (likeRefs.current[index] = el)} 
                className='flex-row like-btn' 
                style={{color: cast.viewer_context?.liked ? '#b33' : ''}}
                onClick={() => {
                  if (!isLogged) {
                    console.log('ca8')
                    if (!app) {
                      LoginPopup()
                    }
                  } else {
                    postLike(cast.hash, index, cast.reactions.likes_count)
                  }
                }}>
                <div className="">
                  {cast.viewer_context?.liked ? <LikeOn /> : <Like />}
                </div>
                {/* <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.likes_count}</span> */}
              </div>
            </div>
            <div className="flex-row" style={{flex: 1, padding: '3px', gap: '0.5rem'}}>
              <div className={`impact-arrow ${fail ? 'flash-fail' : ''}`} style={{padding: '0px 1px 0 0px'}} onClick={() => {
                if (!isLogged) {
                  console.log('ca9')
                  if (!app) {
                    LoginPopup()
                  }
                } else {
                  boostQuality(cast, 1)
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
                  console.log('ca10')
                  if (!app) {
                    LoginPopup()
                  }
                } else {
                  boostQuality(cast, -1)
                }
                }}>
                <ImArrowDown />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>)}</>
  );
}