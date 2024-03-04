import { useContext, useState, useRef, useEffect } from 'react'
import { ethers } from 'ethers'
import { Swords, CoinBag, CoinStack, Waste, AbundanceStar, FeedbackLoop, Like, Recast, Message, Kebab, Warp, ActiveUser } from './assets'
import ReactPlayer from "react-player"
import Link from 'next/link'
import { AccountContext } from '../context'
import { Circles } from './assets'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export default function Home({apiKey}) {
  const ref = useRef(null)
  const [ userFeed, setUserFeed] = useState([])
  const { isMobile } = useMatchBreakpoints();
  // const [vidSize, setVidSize] = useState({w: 1220 + 'px', h: 1220/16*9 + 'px'})
  const account = useContext(AccountContext)
  // const [viewToggle, setViewToggle] = useState({record: false, source: false, media: false, science: false})
  const client = new NeynarAPIClient(apiKey);
  const [textMax, setTextMax] = useState(522)

  async function getFeed() {
    const base = "https://api.neynar.com/";
    const url3 = `${base}v2/farcaster/feed?feed_type=filter&filter_type=global_trending&with_recasts=true&with_replies=false&limit=1`;
    const response3 = await fetch(url3, {
      headers: {
        accept: "application/json",
        api_key: apiKey,
      },
    });
    const feed1 = await response3.json();

    if (typeof feed1 !== 'undefined') {
      for (let i = 0; i < feed1.casts.length; i++) {
        if (feed1.casts[i].parent_url !== null) {
          const isChannel = feed1.casts[i].parent_url.slice(0,31)
          if (isChannel == 'https://warpcast.com/~/channel/') {
            const base = "https://api.neynar.com/";
            const getChannel = feed1.casts[i].parent_url.slice(31)
            const channelQuery = `${base}v2/farcaster/channel?id=${getChannel}`;
            const channelData = await fetch(channelQuery, {
              headers: {
                accept: "application/json",
                api_key: apiKey,
              },
            });
            const channel = await channelData.json();
            const channelImg = channel.channel.image_url
            const channelName = channel.channel.name
            feed1.casts[i].channelImg = channelImg
            feed1.casts[i].channelName = channelName
          }
        }
      }
      setUserFeed(feed1.casts)
    } else {
      setUserFeed(feed1.casts)
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
    getFeed()
    setTextMax(522)
    handleTextResize()
    window.addEventListener("resize", handleTextResize);
    return () => window.removeEventListener("resize", handleTextResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTextResize() {
    if (typeof ref?.current?.offsetWidth !== 'undefined') {
      if (ref?.current?.offsetWidth == 620) {
        setTextMax(522)
      } else {
        setTextMax(ref?.current?.offsetWidth - 102)
      }
    } else {
      setTextMax(522)
    }
  }

  const LineBreak = () => {
    return (
      <div style={{padding: '50px 0 0 0'}}>
        <p style={{fontSize: 0}}>&nbsp;</p>
      </div>
    )
  }

  return (
  <div style={{width: 'auto'}} ref={ref}>
    <div className="top-layer" style={{padding: '58px 0 0 0'}}>

    </div>

    {
      (typeof userFeed !== 'undefined' && userFeed.length > 0) && (userFeed.map((cast, index) => (<div key={index} className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
        <div>
          <div>
            <div className="">
              <div className="" style={{left: '38px', height: '22px'}}>
            </div>
            <div className="" style={{left: '38px', top: '22px'}}>
            </div>
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
                    <div style={{wordWrap: 'break-word', maxWidth: `${textMax}px`}}>{cast.text}</div>
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
                        <div className="flex-row">
                          <div className="">
                            <Recast />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.recasts.length}</span>
                        </div>
                      </span>
                    </div>
                    <div className="flex-row" style={{flex: 1}}>
                      <div className="">
                        <Like />
                      </div>
                      <span className="" style={{padding: '0 0 0 5px'}}>{cast.reactions.likes.length}</span>
                    </div>
                    <div className="" style={{flex: 1}}>
                      <div className="flex-row">
                        <div className="">
                          <Warp />
                        </div>
                        <span className="hidden" style={{padding: '0 0 0 5px', visibility: 'hidden'}}>0</span>
                      </div>
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