import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useStore from '../../utils/store';
import { Like, Recast, Message, Kebab, ActiveUser } from '../../pages/assets'
import { FaSearch, FaLock, FaRegStar } from "react-icons/fa"

export default function Cast({ cast, index }) {
  const store = useStore()
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [textMax, setTextMax] = useState('522px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [showPopup, setShowPopup] = useState({open: false, url: null})

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

  const timePassed = (timestamp) => {
    const currentTime = new Date();
    const pastTime = new Date(timestamp);
    const timeDifference = currentTime - pastTime;
    
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (days > 0) {
      const stamp = `${days}d`
      return stamp
    } else {
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      if (hours > 0) {
        const stamp = `${hours}h`
        return stamp
      } else {
        const minutes = Math.floor(timeDifference / (1000 * 60));
        if (minutes > 0) {
          const stamp = `${minutes}m`
          return stamp
        } else {
          return `now`
        }
      }
    }
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

  async function postRecast(hash, index) {
    console.log(userFeed[index].reactions.recasts.length)

    // need to update recasts counter
    recastRefs.current[index].style.color = '#3b3'
    try {
      const response = await axios.post('/api/postRecastReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        recastRefs.current[index].style.color = '#000'

        // need to revert recasts counter
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function postLike(hash, index) {
    console.log(userFeed[index].reactions.likes.length)

    // need to update likes counter
    likeRefs.current[index].style.color = '#b33'
    try {
      const response = await axios.post('/api/postLikeReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        likeRefs.current[index].style.color = '#000'

        // need to revert likes counter
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  return (
    <div key={index} className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
        <div>
          <div>
            <div className="">
              <div className="">
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`/${cast.author.username}`} onClick={() => {goToUserProfile(event, cast.author)}}>
                      <img loading="lazy" src={cast.author.pfp_url} className="" alt={`${cast.author.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: 'auto', gap: '0.5rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <span className="" data-state="closed">
                          <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} style={{cursor: 'pointer'}} onClick={() => {goToUserProfile(event, cast.author)}}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font">{cast.author.display_name}</span>
                              <div className="" style={{margin: '0 0 0 3px'}}>
                                {(cast.author.power_badge) && (<ActiveUser />)}
                              </div>
                            </div>
                          </a>
                        </span>
                        <span className="user-font" datastate="closed">
                          <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} onClick={() => {goToUserProfile(event, cast.author)}}>@{cast.author.username}</a>
                        </span>
                        <div className="">·</div>
                        <a href={`/${cast.author.username}/casts/${cast.hash}`} className="fc-lnk" title="Navigate to cast" onClick={() => {goToCast(event, cast)}}>
                          <div className="user-font">{timePassed(cast.timestamp)}</div>
                        </a>
                      </div>
                      <div className="">
                        <Kebab />
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax, whiteSpace: 'pre-line'}}>{cast.text}</div>
                      {(cast.embeds.length > 0) && (cast.embeds.map((embed, subindex) => (
                      <div className='flex-col' style={{alignItems: 'center'}}>
                        {(embed.type && embed.type == 'img') && (
                          <div className="" key={`${index}-${subindex}`}>
                            <div className="flex-col" style={{position: 'relative'}}>
                              <img 
                                loading="lazy" 
                                src={embed.url} 
                                alt="Cast image embed" 
                                style={{
                                  maxWidth: textMax, 
                                  maxHeight: '500px', 
                                  marginTop: '10px', 
                                  cursor: 'pointer', 
                                  position: 'relative',
                                  borderRadius: '8px'}} 
                                onClick={() => {openImagePopup(embed)}} />
                            </div>
                          </div>
                        )}
                      </div>
                      )))}
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
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                      <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                        <div className="">
                          <Message />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{cast.replies.count}</span>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div
                        //  ref={el => (recastRefs.current[index] = el)} 
                         className='flex-row recast-btn'
                        //  onClick={() => postRecast(cast.hash, index, cast.reactions.recasts.length)}
                         >
                          <div className="">
                            <Recast />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.recasts.length}</span>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div 
                        // ref={el => (likeRefs.current[index] = el)} 
                        className='flex-row like-btn'
                        //  onClick={() => postLike(cast.hash, index, cast.reactions.likes.length)}
                         >
                          <div className="">
                            <Like />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.likes.length}</span>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                        <div className="" style={{padding: '2px 0 0 0px'}}>
                          <FaRegStar />
                        </div>
                        <span style={{padding: '0 0 0 5px'}}>{cast.impact && (`${cast.impact}`)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>
  );
}