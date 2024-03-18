import Head from 'next/head';
import { useContext, useState, useRef, useEffect } from 'react'
import { ethers } from 'ethers'
import { Swords, CoinBag, CoinStack, Waste, AbundanceStar, FeedbackLoop, Like, Recast, Message, Kebab, Warp, ActiveUser } from './assets'
import Link from 'next/link'
import { AccountContext } from '../context'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
// import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import useStore from '../utils/store'
import axios from 'axios';
import { FaRegStar } from "react-icons/fa"

export default function Home() {
  const ref = useRef(null)
  const [ userFeed, setUserFeed] = useState([])
  const { isMobile } = useMatchBreakpoints();
  const [ feedWidth, setFeedWidth ] = useState()
  const account = useContext(AccountContext)
  const [ screenWidth, setScreenWidth ] = useState(undefined)
  // const client = new NeynarAPIClient(apiKey);
  const store = useStore()
  const [textMax, setTextMax] = useState('522px')

  async function getFeed() {
    try {
      const response = await axios.get('/api/getFeed')
      const feed = response.data.feed
      console.log(feed)
      setUserFeed(feed)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }


  async function postRecast(hash) {
    try {
      const response = await axios.post('/api/postRecastReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      // const users = response.data.users
      console.log(response)
      // setSearchResults({kind: 'users', data: users})
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function postLike(hash) {
    try {
      const response = await axios.post('/api/postLikeReaction', {       
        hash: hash,
        signer: store.signer_uuid,
      })
      console.log(response)
      // console.log(users)
      // setSearchResults({kind: 'users', data: users})
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

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`522px`)
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 160}px`)
      }
      else {
        setTextMax(`${screenWidth - 110}px`)
      }
    }
    else {
      setTextMax(`100%`)
    }
  }, [screenWidth])

  useEffect(() => {
    getFeed()
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
  
  
  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref}>
    <Head>
      <title>Impact | Abundance Protocol | Feed </title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div className="top-layer" style={{padding: '58px 0 0 0'}}>
    </div>
    {
      (typeof userFeed !== 'undefined' && userFeed.length > 0) && (userFeed.map((cast, index) => (<div key={index} className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
        <div>
          <div>
            <div className="">
              <div className="">
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`https://warpcast.com/${cast.author.username}`}>
                      <img loading="lazy" src={cast.author.pfp_url} className="" alt={`${cast.author.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: 'auto', gap: '0.5rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <span className="" data-state="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/${cast.author.username}`}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font">{cast.author.display_name}</span>
                              <div className="" style={{margin: '0 0 0 3px'}}>
                                {(cast.author.active_status == 'active') && (<ActiveUser />)}
                              </div>
                            </div>
                          </a>
                        </span>
                        <span className="user-font" datastate="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/${cast.author.username}`}>@{cast.author.username}</a>
                        </span>
                        <div className="">·</div>
                        <a className="fc-lnk" title="Navigate to cast" href={`https://warpcast.com/${cast.author.username}/${cast.hash.slice(0,10)}`}>
                          <div className="user-font">{timePassed(cast.timestamp)}</div>
                        </a>
                      </div>
                      <div className="">
                        <Kebab />
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax}}>{cast.text}</div>
                      {(cast.embeds.length > 0 && 1 == 2) &&
                      (<div className="">
                        <div className="">
                          <img loading="lazy" src={cast.embeds.url} className="" alt="Cast image embed" style={{aspectRatio: '0.75 / 1'}} />
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
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                      <div className="flex-row" style={{flex: 1}}>
                        <div className="">
                          <Message />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{cast.replies.count}</span>
                      </div>
                      <div className="" style={{flex: 1}}>
                        <span>
                          <div className="flex-row" onClick={() => postRecast(cast.hash)}>
                            <div className="">
                              <Recast />
                            </div>
                            <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.recasts.length}</span>
                          </div>
                        </span>
                      </div>
                      <div className="flex-row" style={{flex: 1}} onClick={() => postLike(cast.hash)}>
                        <div className="">
                          <Like />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.likes.length}</span>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
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
      </div>)))
    }
  </div>
  )
}


export async function getStaticProps() {
  return {
    props: {
      apiKey: process.env.NEYNAR_API_KEY,
    },
  };
}