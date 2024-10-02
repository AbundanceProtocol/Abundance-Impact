import React, { useContext, useRef, useEffect, useState } from 'react';
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

export default function Cast({ cast, index, updateCast, openImagePopup, ecosystem, self }) {
  const store = useStore()
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(undefined)
  const { LoginPopup, fid, userBalances, setUserBalances, isLogged } = useContext(AccountContext)
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
    return cast?.impact_points?.some(point => point.curator_fid == fid);
  }
  
  async function boostQuality(cast, qualityAmount) {
    const castHash = cast.hash
    const castChannel = cast.root_parent_url
    
    async function postQuality(fid, castHash, castChannel, qualityAmount) {
      try {
        const response = await axios.post('/api/curation/postPointQuality', { fid, castHash, castChannel, qualityAmount, points: ecosystem })
        return response
      } catch (error) {
        console.error('Error creating post:', error);
        return null
      }
    }

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
    const castContext = {
      author_fid: cast.author.fid,
      author_pfp: cast.author.pfp_url,
      author_username: cast.author.username,
      author_display_name: cast.author.display_name,
      cast_hash: cast.hash,
      cast_text: cast.text,
      cast_channel: cast.root_parent_url
    }
    
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
    cast && (<div className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
      <div className="flex-row">
        <div className="flex-col" style={{alignItems: 'center', userSelect: 'none'}}>

          <div className="" style={{margin: '0 10px 0 0'}}>
            <a className="" title="" href={`/${cast.author.username}`} onClick={(event) => {
              if (!isLogged) {
                console.log('ca1')
                LoginPopup()
                event.preventDefault()
              } else {
                goToUserProfile(event, cast.author)
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
                  console.log('ca2')
                  LoginPopup()
                } else {
                  if(userBalances.impact > 0) {
                    boostImpact(cast, 1)
                  } else { 
                    clickFailed()
                  }
                }
              }
            } style={{margin: `${shrinkMargin(cast.impact_balance)}px 0 ${shrinkMargin(cast.impact_balance)}px 0`}}>
              <FaStar size={growPoints(cast.impact_balance)} className='' style={{fontSize: '25px'}} />
            </div>

            {((self && cast?.impact_balance >= 1) || (fid && cast && isCurator(fid, cast))) && (<div className={`like-btn ${fail ? 'flash-fail' : ''}`} onClick={
             () => {
                if (!isLogged) {
                  console.log('ca3')
                  LoginPopup()
                } else {
                  unstakePoint(cast)
                }
              }
            } style={{margin: `${shrinkMargin(cast.impact_balance)}px 0 ${shrinkMargin(cast.impact_balance)}px 0`}}>
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
                <a href={`https://warpcast.com/${cast?.author?.username}`} className="fc-lnk" title={cast?.author?.display_name} style={{cursor: 'pointer'}}>
                  <div className="flex-row" style={{alignItems: 'center'}}>
                    <span className="name-font">{cast.author.display_name}</span>
                    <div className="" style={{margin: '0 0 0 3px'}}>
                      {(cast.author.power_badge) && (<ActiveUser />)}
                    </div>
                  </div>
                </a>
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
                <a href={`https://warpcast.com/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name}>@{cast.author.username}</a>
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

              <a href={`https://warpcast.com/${cast?.author?.username}/${cast?.hash?.substring(0, 10)}`} className="fc-lnk" title="Navigate to cast">
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
              {/* {(embed?.metadata?.content_type && embed?.metadata?.content_type?.startsWith('image/')) && (
                <Images image={embed?.url} subindex={subindex} textMax={textMax} handleClick={handleClick} index={index} />
              )} */}
              {(embed && embed.type && (embed.type == 'image' || embed.type == 'other')) && (
                <Images image={embed?.url} subindex={subindex} textMax={textMax} handleClick={handleClick} index={index} />
              )}
              {(embed && embed.type && embed.type == 'subcast') && (
                <div className="" key={`${index}-${subindex}`} style={{marginTop: '10px'}}>
                  <Subcast cast={embed.subcast} key={subindex} index={subindex} />
                </div>
              )}
              {(embed && embed.type && embed.type == 'video') && (
                <div className="" key={`${index}-${subindex}`}>
                  <VideoPlayer width={textMax} src={embed.url} />
                </div>
              )}
              {(embed && embed?.url && embed?.type && (embed?.type == 'html') && embed?.metadata && embed?.metadata?.title) && (
                <Embed embed={embed} index={index} subindex={subindex} textMax={textMax} />
              )}
            </div>
            )))}

            {(cast?.frames?.length > 0) && (cast?.frames?.map((frame, subindex) => (
              <div key={subindex} className='flex-col' style={{alignItems: 'center', display: hide ? 'flex' : 'flex'}}>
                {(frame?.image) && (
                  <Images {...{image: frame?.image, subindex, textMax, handleClick, index}} />
                )}
              </div>
            )))}

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
              <span className="" style={{padding: '0 0 0 5px'}}>{cast.replies.count}</span>
            </div>
            <div className="flex-row" style={{flex: 1}}>
              <div
                ref={el => (recastRefs.current[index] = el)} 
                className='flex-row recast-btn' 
                style={{color: cast.viewer_context?.recasted ? '#191' : ''}}
                onClick={() => {
                  if (!isLogged) {
                    console.log('ca7')
                    LoginPopup()
                  } else {
                    postRecast(cast.hash, index, cast.reactions.recasts_count)
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
                    console.log('ca8')
                    LoginPopup()
                  } else {
                    postLike(cast.hash, index, cast.reactions.likes_count)
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
                  console.log('ca9')
                  LoginPopup()
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
                  LoginPopup()
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