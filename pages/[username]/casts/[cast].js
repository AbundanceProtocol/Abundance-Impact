import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import useStore from '../../../utils/store';
import { Like, Recast, Message, Kebab, ActiveUser } from '../../assets'
import { FaLock, FaRegStar } from "react-icons/fa"
import { BsPatchCheckFill as Verified } from "react-icons/bs";
import { BiSolidErrorAlt as Rejected } from "react-icons/bi";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function CastPage({username, castHash}) {
  const router = useRouter();
  const ref = useRef(null)
  const likeRef = useRef(null)
  const recastRef = useRef(null)
  const [cast, setCast] = useState(null)
  const initialUser = {
    username: 'none',
    display_name: 'No user found',
    power_badge: false,
    fid: '-',
    profile: { bio: { text: 'No user bio found'}},
    following_count: '-',
    follower_count: '-',
  }
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [user, setUser] = useState(initialUser)
  const store = useStore()
  const [textMax, setTextMax] = useState('522px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [longcastLoaded, setLongcastLoaded] = useState(false)
  let noCast = {
    author: user,
    hash: '-',
    parent_url: '-',
    embeds: [],
    reactions: {
      likes: {length: 0 },
      recasts: { length: 0 }
    },
    replies: { count: 0 },
    text: 'No cast found',
    timestamp: '2020-01-01T21:39:47.000Z'
  }
  
  useEffect(() => {

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
    if (store.castData && store.castData.hash == castHash) {
      setCast(store.castData)
      store.setCastData(null)
    } else if (castHash) {
      getCast(castHash)
    }
  }, [router]);

  useEffect(() => {
    if (cast && cast.hash !== '-' && !longcastLoaded) {
      if (cast.frames && cast.frames.length > 0) {
        cast.frames.forEach((frame, index) => {
          const frameUrl = frame.frames_url;
          const longcastBase = `https://impact.abundance.id/${username}/articles/`;
          if (frameUrl && frameUrl.includes(longcastBase)) {
            let longcastHash = frameUrl.slice(longcastBase.length, frameUrl.length)
            getLongcast(longcastHash, frameUrl)
          }
        })
      }
    }
  }, [cast]);

  async function getLongcast(hash, frameUrl) {
    try {
      let articleData = ''
      const response = await fetch(`${baseURL}/api/getIPFS?hash=${hash}`);
      const contentType = response.headers.get('content-type');
    
      if (contentType && contentType.includes('application/json')) {
        articleData = await response.json();
        if (articleData.text) {
          let updatedCast = {...cast}
          let castText = updatedCast.text
          let updatedCastText = await castText.replace(frameUrl, '')
          if (updatedCastText.length == 0) {
            updatedCastText = articleData.text
          } else {
            updatedCastText += ` \n\n${articleData.text}`
          }
          setCast({ ...cast, text: updatedCastText });
          setLongcastLoaded(true)
        }
      }
  
    } catch (error) {
      console.error('Error submitting data:', error)
      return null
    }
  }

  async function getAuthorProfile(name) {
    let fid = 3
    if (store.isAuth) {
      fid = store.fid
    }
    if (fid && name && (!cast || !cast.author)) {
      try {
        const response = await axios.get('/api/getUsers', {
          params: {
            fid: fid,
            name: name,
          }
        })
        const users = response.data.users
        const selectUser = users.find(user => user.username == name)
        if (selectUser) {
          noCast.author = selectUser
          setCast(noCast)
          setUser(selectUser)
        } else {
          setCast(noCast)
        }
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }

  async function getCast(hash) {
    if (!cast || !cast.author) {
      try {
        const response = await axios.get('/api/getCastByHash', {
          params: {
            hash
          }
        })
        const castData = response.data.cast.cast
        if (castData) {
          store.setCastData(castData)
          setCast(castData)
        } else {
          store.setCastData(null)
          getAuthorProfile(username)
          setCast(noCast)
        }
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }

  async function postRecast(hash) {
    // need to update recasts counter
    recastRef.style.color = '#3b3'
    try {
      const response = await axios.post('/api/postRecastReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        recastRef.style.color = '#000'

        // need to revert recasts counter
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function postLike(hash) {
    // need to update likes counter
    likeRef.style.color = '#b33'
    try {
      const response = await axios.post('/api/postLikeReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      if (response.status !== 200) {
        likeRef.style.color = '#000'

        // need to revert likes counter
      }
      console.log(response.status)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
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
    await store.setUserData(author)
    router.push(`/${username}`)
  }

  const Article = () => {

    function shortenAddress(input) {
      if (input.length <= 8) {
        return input;
      } else {
        return input.substring(0, 4) + '...' + input.substring(input.length - 4);
      }
    }
    
    return (
      <>
      {(cast) && (

      <div className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
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
                      {(cast.embeds && cast.embeds.length > 0) && (cast.embeds.map((embed, index) => (
                      <div className='flex-col' style={{alignItems: 'center'}}>
                        {(embed.type && embed.type == 'img') && (
                          <div className="" key={index}>
                            <div className="flex-col" style={{position: 'relative'}}>
                              <img 
                                loading="lazy" 
                                src={embed.url} 
                                alt="Cast image embed" 
                                style={{aspectRatio: '0.75 / 1', 
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
                        <span className="" style={{padding: '0 0 0 5px'}}>{cast.replies?.count}</span>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div ref={recastRef} className='flex-row recast-btn' onClick={() => postRecast(cast.hash, cast.reactions.recasts.length)}>
                          <div className="">
                            <Recast />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions?.recasts?.length}</span>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div ref={likeRef} className='flex-row like-btn' onClick={() => postLike(cast.hash, cast.reactions?.likes?.length)}>
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
      </div>)}

    </>)   

  }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <Head>
        <title>@{username} cast | Impact App </title>
        <meta name="description" content={`Building the global superalignment layer`} />
      </Head>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { (cast) && <Article/> }

    </div>
  );
}


export async function getServerSideProps(context) {
  const { params } = context;
  const { username, cast } = params;
  const castHash = cast
 
  return {
    props: {
      username, castHash
    },
  };
}