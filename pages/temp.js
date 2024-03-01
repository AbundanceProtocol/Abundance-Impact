import { useContext, useState, useRef, useEffect } from 'react'
import { ethers } from 'ethers'
import { Swords, CoinBag, CoinStack, Waste, AbundanceStar, FeedbackLoop, Like, Recast, Message, Kebab, Warp, ActiveUser } from './assets'
import ReactPlayer from "react-player"
import Link from 'next/link'
import { AccountContext } from '../context'
import { Circles } from './assets'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
// require('dotenv').config();

export default function Home({apiKey}) {
  const ref = useRef(null)
  const [ userFeed, setUserFeed] = useState([])

  const { isMobile } = useMatchBreakpoints();
  const [vidSize, setVidSize] = useState({w: 1220 + 'px', h: 1220/16*9 + 'px'})
  const account = useContext(AccountContext)
  const [viewToggle, setViewToggle] = useState({record: false, source: false, media: false, science: false})
  const client = new NeynarAPIClient(apiKey);


  async function getData() {

    // const hash = "0x8ffed4e8fa53c6e22b85f678c9a53067826e846a";
    // const cast1 = await client.lookUpCastByHash(hash);
    // console.log(cast1); // logs information about the cast

    // fetch info about a Farcaster user
    // const fid = 3;
    // const user1 = await client.lookupUserByFid(fid);
    // console.log(user1); // logs information about the user
    // console.log(user1.result.user.displayName); // logs information about the user

    const base = "https://api.neynar.com/";
    // const apiKey = process.env.NEYNAR_API_KEY;

    // const hash = "0x8ffed4e8fa53c6e22b85f678c9a53067826e846a";
    // const url1 = `${base}v2/farcaster/cast?identifier=${hash}&type=hash`;
    // const response1 = await fetch(url1, {
    //   headers: {
    //     accept: "application/json",
    //     api_key: apiKey,
    //   },
    // });
    // const cast2 = await response1.json();
    // console.log(cast2); // logs information about the cast

    // const fid = 3;
    // const url2 = `${base}v1/farcaster/user?fid=${fid}`;
    // const response2 = await fetch(url2, {
    //   headers: {
    //     accept: "application/json",
    //     api_key: apiKey,
    //   },
    // });
    // const user2 = await response2.json();
    // console.log(user2); // logs information about the user


    // const displayName = user2.result.user.displayName
    // const pfp = user2.result.user.pfp.url
    // const userHandle = user2.result.user.username
    // const bio = user2.result.user.profile.bio.text
    // const followers = user2.result.user.followerCount
    // const following = user2.result.user.followingCount
    // console.log('name: '+ displayName + ', username: @' + userHandle + ', bio: ' + bio + ', followers: ' + followers + ', following: ' + following)


    const url3 = `${base}v2/farcaster/feed?feed_type=filter&filter_type=global_trending&with_recasts=true&with_replies=false&limit=25`;
    const response3 = await fetch(url3, {
      headers: {
        accept: "application/json",
        api_key: apiKey,
      },
    });
    const feed1 = await response3.json();
    
    setUserFeed(feed1)
    console.log(userFeed); // logs information about the feed

    // const casts = feed1.casts.length
    // console.log('Casts: ' + casts)

    // if (typeof feed1 !== 'undefined') {
    //   for (let i = 0; i < casts; i++) {
    //     const castAuthor = feed1.casts[i].author.display_name
    //     const castPfp = feed1.casts[i].author.pfp_url
    //     const castUsername = feed1.casts[i].author.username
    //     const castText = feed1.casts[i].text
    //     const castTimestamp = feed1.casts[i].timestamp
    //     const castReplies = feed1.casts[i].replies.count
    //     const castLikes = feed1.casts[i].reactions.likes.length
    //     const castRecasts = feed1.casts[i].reactions.recasts.length
    //     const castFrame = feed1.casts[i].frame

    //     console.log(castAuthor, castPfp, castUsername, castText, castTimestamp, castReplies, castLikes, castRecasts, castFrame)
    //   }
    // }


    // const url4 = `${base}v2/farcaster/channel/list`;
    // const response4 = await fetch(url4, {
    //   headers: {
    //     accept: "application/json",
    //     api_key: apiKey,
    //   },
    // });
    // const channel1 = await response4.json();
    // console.log(channel1); // logs information about the feed




  }

  useEffect(() => {
    handleResize()
    getData()
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  function handleResize() {
    setVidSize({w: ref.current.offsetWidth - 40 + 'px', h: (ref.current.offsetWidth - 40)/16*9 + 'px'})

    for (let i = 0; i <= 12; i++) {
      // Get the elements by their IDs or classes
      const AB1 = document.getElementById(`AB${i}`);
      const SC1 = document.getElementById(`SC${i}`);

      // Find the maximum height
      const maxHeight = Math.max(AB1.clientHeight, SC1.clientHeight);

      // Set the height for both elements
      AB1.style.height = `${maxHeight}px`;
      SC1.style.height = `${maxHeight}px`;
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
  <div>
    <div className="t-p-130 top layer" style={{backgroundColor: '#e4eadf'}}>
      <Circles />
      <div className="top-frame flex-middle flex-row top-layer">
        <div className="border-style wrap-cln flex-middle flex-col top-layer">
          <p className="frame-title">&nbsp;</p>
        </div>
      </div>
      <div className="top-frame flex-middle mid-layer">
        <div className="flex-middle flex-row flex-wr mid-layer" ref={ref}>
          <div className='flex-col flex-2 mid-layer'>
            <p className={`${isMobile ? "large-font-mobile" : "font-46"} mid-layer`}>BUILDING AN ECONOMY OF ABUNDANCE</p>
            <p className="font-30">Abundance Protocol solves two fundamental problems in our economy: market failures in public goods and negative externalities</p>
          </div>
          <div className='mid-layer'>
            <img className='homepage-img' src={'./images/abundanceisland01.png'} alt="Abundance Paradigm" />
          </div>
        </div>
      </div>

      <LineBreak />
      <div className="top-frame flex-middle">
        <div className="border-style wrap-title flex-middle flex-col">
            <p className="font-46">Why Abundance?</p>
        </div>
      </div>
        <LineBreak />
      </div>
      <div className="mid-layer flex-row flex-wr" style={{backgroundColor: '#e4eadf', justifyContent: 'space-evenly', alignItems: 'flex-start'}}>

        <div className='flex-col left-side dashed-br'>

          <div className="flex-row left-side bg-container">
            <div id='SC0' className='side-container mid-layer'>
              <p className="h2-title">Current Paradigm</p>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-grey1 cr-opacity cr-blur bottom-layer side-container'>
    </div>
            </div>
          </div>
          <LineBreak />
          <div className="flex-row left-side bg-container">
            <div className='flex-col side-container' style={{width: '100%'}}>
              <div className='flex-row centralize'>
                <div id='SC1' className='mid-layer centralize' style={{width: 100}}>
                  <CoinStack />
                </div>
              </div>
              <div className='mid-layer'>
                <p id='SC2' className="frame-title">Scarce Funding</p>
              </div>
              <div id='SC3' className='' style={{padding: '0 17%'}}>
                <p id='SC4' className="title-desc">The current econommic paradigm has no effective mechanisms to capture the value of public goods (scientific research, open source software, public infrastructure, and so on). Thus funding for these goods is limited</p>
              </div>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-grey2 cr-opacity cr-blur bottom-layer side-container'>
    </div>
            </div>
          </div>
          <LineBreak />
          <LineBreak />
          <div className="flex-row left-side bg-container">
            <div className='flex-col side-container' style={{width: '100%'}}>
              <div className='flex-row centralize'>
                <div id='SC5' className='mid-layer centralize' style={{width: 300}}>
                  <Swords />
                </div>
              </div>
              <div className='mid-layer'>
                <p id='SC6' className="frame-title">Digital Tribalism</p>
              </div>
              <div id='SC7' className='' style={{padding: '0 17%'}}>
                <p id='SC8' className="title-desc">Speculatoin and lack of funding for public goods create a dynamic where every person, project, company and ecosystem compete for attention, talent and users - resulting in tribalism that hurts the common good.</p>
              </div>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-grey1 cr-opacity cr-blur bottom-layer side-container'></div>
            </div>
          </div>
          <LineBreak />
          <LineBreak />
          <div className="flex-row left-side bg-container">
            <div className='flex-col side-container' style={{width: '100%'}}>
              <div className='flex-row centralize'>
                <div id='SC9' className='mid-layer centralize' style={{width: 300}}>
                  <Waste />
                </div>
              </div>
              <div className='mid-layer'>
                <p id='SC10' className="frame-title">Negative Externalities</p>
              </div>
              <div id='SC11' className='' style={{padding: '0 17%'}}>
                <p id='SC12' className="title-desc">There is an incentive in the economy to offload proudction costs onto the public. This way the private business gets all the returns while the public suffers the harms. There is no effective feedback loop in the market to fix this problem.
                </p>
              </div>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-grey2 cr-opacity cr-blur bottom-layer side-container'></div>
            </div>
          </div>
        </div>
        <div className='flex-col left-side' style={{overflow: 'hidden', width: '100%'}}> 
          <div className="flex-row right-side">
            <div id='AB0' className='side-container mid-layer'>
              <p className="h2-title">Abundance Paradigm</p>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-green1 cr-opacity cr-blur bottom-layer side-container'></div>
            </div>
          </div>
          <LineBreak />
          <div className="flex-row right-side bg-container">
            <div className='flex-col side-container' style={{width: '100%'}}>
              <div className='flex-row centralize'>
                <div id='AB1' className='mid-layer centralize' style={{width: 350}}>
                  <CoinBag />
                </div>
              </div>
              <div className='mid-layer'>
                <p id='AB2' className="frame-title">Funding Public Goods</p>
              </div>
              <div id='AB3' className='' style={{padding: '0 17%'}}>
                <p id='AB4' className="title-desc">Protocols like Bitcoin and Ethereum funded the common good of network security to the tune of over $1 trillion through their consensus mechanism. Abundance Protocol aims to expand this mechanism to all common and public goods (<a href="https://docs.abundance.id/docs/articles/introducing-abundance-protocol" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: '600' }}>learn more</a>)</p>
              </div>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-green2 cr-opacity cr-blur bottom-layer side-container'></div>
            </div>
          </div>
          <LineBreak />
          <LineBreak />
          <div className="flex-row right-side bg-container">
            <div className='flex-col side-container' style={{width: '100%'}}>
              <div className='flex-row centralize'>
                <div id='AB5' className='mid-layer centralize rotate' style={{width: 350}}>
                  <AbundanceStar />
                </div>
              </div>
              <div className='mid-layer'>
                <p id='AB6' className="frame-title">Superalignment</p>
              </div>
              <div id='AB7' className='' style={{padding: '0 17%'}}>
                <p id='AB8' className="title-desc">Abundance&apos;s superpower is the ability to align the economic incentives of rival communities and organizations. It aligns researchers and developers to work on impactful problems, creating cross-project alignment and progress for all (<a href="https://book.abundance.id/part-iii/chapter-8-superalignment" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: '600' }}>learn more</a>)</p>
              </div>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-green3 cr-opacity cr-blur bottom-layer side-container'></div>
            </div>
          </div>
          <LineBreak />
          <LineBreak />
          <div className="flex-row right-side bg-container">
            <div className='flex-col side-container' style={{width: '100%'}}>
              <div className='flex-row centralize'>
                <div id='AB9' className='mid-layer centralize' style={{width: 350}}>
                  <FeedbackLoop />
                </div>
              </div>
              <div className=''>
                <p id='AB10' className="frame-title">Feedback Loops</p>
              </div>
              <div id='AB11' className='' style={{padding: '0 17%'}}>
                <p id='AB12' className="title-desc">Abundance Protocol creates effective loops for both public goods and negative externalities. By incentivizing public goods proudction and disincentivizing externalities, abundance creates alignment between individual self-interest and the public interest  (<a href="https://book.abundance.id/part-iii/chapter-7-the-abundance-protocol" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: '600' }}>learn more</a>)</p>
              </div>
            </div>
            <div className='bottom-layer bg-container'>
              <div className='cr-green2 cr-opacity cr-blur bottom-layer side-container'></div>
            </div>
          </div>
        </div>
      </div>
      <div className="top layer" style={{backgroundColor: '#e4eadf'}}>
      <LineBreak />
      <LineBreak />
      <LineBreak />
      <div className="top-frame flex-middle">
        <div className="border-style wrap-title flex-middle flex-col">
            <p className="font-46">Proof-of-Impact Consensus Mechanism</p>
        </div>
      </div>
      <div className="top-frame flex-middle flex-row">
        <div className="border-style wrap-cln flex-middle flex-col flex-1 min-h">
          <p className="font-24" style={{ textAlign: 'justify' }}>Bitcoin and Ethereum, the two most prominent blockchain protocols, have funded the common good of network security to the tune of over 1 trillion dollars. Abundance Protocol aims to build on this success, and progressively expand this capability to all common and public goods through a Proof-of-Impact Consensus Mechanism.</p>
          <p className="font-26" style={{ textAlign: 'left' }}>Find out more in the <a href="https://whitepaper.abundance.id/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: '600' }}>Abundance Protocol Whitepaper</a></p>
          </div>
      </div>

      <LineBreak />
      <LineBreak />
      <LineBreak />
      <LineBreak />
      <LineBreak />
      <LineBreak />

      <div className="top-frame flex-row flex-wr">
        <div className="flex-col flex-1 min-h flex-4" style={{paddingLeft: '10px'}}>
          <p className="frame-title" style={{textAlign: 'left'}}>Discover</p>
          <p className="frame-desc text-l ftr-lnk"><Link className="frame-desc text-l" href="/">Home</Link></p>
          <p className="frame-desc text-l ftr-lnk" style={{color: '#999'}}><Link className="frame-desc text-l" href="/">Vision</Link></p>
          <p className="frame-desc text-l ftr-lnk"><Link className="frame-desc text-l" href="/roadmap">Roadmap</Link></p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://miro.com/app/board/uXjVPUvJDaU=/" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Miro project board</a></p>
          <p className="frame-desc text-l ftr-lnk"><Link className="frame-desc text-l" href="/blog">Blog</Link></p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://mirror.xyz/0xabundance.eth" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Mirror</a></p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://paragraph.xyz/@abundance" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Paragraph</a></p>
        </div>

        <div className="flex-col flex-1 min-h flex-4 flex-wr" style={{paddingLeft: '10px'}}>
          <p className="frame-title text-l">Create</p>
          <p className="frame-desc text-l"><a href="https://abundance-protocol.notion.site/Abundance-Impact-Center-553d59e1280e41d990967fb786c8948e" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Impact Center</a></p>
          <p className="frame-desc text-l"><a href="https://github.com/AbundanceProtocol/abundance-protocol" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">GitHub</a></p>
          <p className="frame-desc text-l"><a href="https://docs.abundance.id/" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Docs</a></p>
          <p className="frame-desc text-l"><a href="https://whitepaper.abundance.id/" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Whitepaper</a></p>
          <p className="frame-desc text-l" style={{color: '#999'}}>Promote</p>
          <p className="frame-desc text-l" style={{color: '#999'}}>Affiliates</p>
          <p className="frame-desc text-l" style={{color: '#999'}}>Contribute</p>
        </div>

        <div className="flex-col flex-1 min-h flex-4" style={{paddingLeft: '10px'}}>
          <p className="frame-title text-l">Try</p>
          <p className="frame-desc text-l" style={{color: '#999'}}>App</p>
          <p className="frame-desc text-l" style={{color: '#999'}}>Portal</p>
          <p className="frame-desc text-l" style={{color: '#999'}}>Ecosystem</p>
        </div>


        <div className="flex-col flex-1 min-h flex-4" style={{paddingLeft: '10px'}}>
          <p className="frame-title text-l">Connect</p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://twitter.com/Abundance_DAO" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">X (Twitter)</a></p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://warpcast.com/0xabundance.eth" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Farcaster</a></p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://www.youtube.com/@AbundanceProtocol/" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">YouTube</a></p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://discord.com/invite/sHcV7g3nqu" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Discord</a></p>
          <p className="frame-desc text-l ftr-lnk"><a href="https://opensea.io/AbundanceDAO" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">OpenSea</a></p>
          <p className="frame-desc text-l ftr-lnk"><a href="mailto:info@abundance.id" className="frame-desc text-l ftr-lnk" target="_blank" rel="noopener noreferrer">Email us</a></p>
        </div>
      </div>
      <LineBreak />
    </div>

        {
          (userFeed.length > 0) && (userFeed.map((cast, index) => (
            <div key={index} className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
              <div>
                <div className="relative px-4 py-2 hover:bg-overlay-faint cursor-pointer border-t border-faint">
                  <div className="absolute top-0 w-[1px] border-l-2 border-faint border-none" style="left: 38px; height: 22px;">
                  </div>
                  <div className="absolute bottom-0 w-[1px] border-l-2 border-faint border-none" style="left: 38px; top: 22px;">
                  </div>
                  <div className="relative flex flex-col">
                    <div className="relative flex">
                      <span className="relative h-min w-auto" data-state="closed">
                        <a className="" title="" href="/ccarella.eth">
                          <img loading="lazy" src={cast.author.pfp_url} className="shrink-0 rounded-full aspect-square object-cover border border-default bg-app relative mr-2" alt={`${cast.author.display_name} avatar`} style="width: 48px; height: 48px; min-width: 48px; min-height: 48px;" />
                        </a>
                      </span>
                      <div className="relative w-full min-w-0">
                        <div className="flex flex-row justify-between gap-2">
                          <div className="flex min-w-0 flex-1 shrink flex-row items-baseline gap-1">
                            <span className="relative h-min w-auto" data-state="closed">
                              <a className="relative min-w-0" title="" href={`https://farcaster.xyz/${cast.author.username}`}>
                                <div className="flex min-w-0 flex-row items-center">
                                  <span className="text-default min-w-0 hover:underline !block whitespace-nowrap break-words text-ellipsis overflow-hidden text-base font-semibold">{cast.author.display_name}</span>
                                  <div className="ml-1 flex flex-row items-center space-x-1">
                                    <svg width="12" height="12" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <g clip-path="url(#clip0_7_2)">
                                        <circle cx="16" cy="16" r="16" fill="#3670BC"></circle>
                                        <path d="M16.599 6.8728L19.3274 12.4L25.4264 13.2857C25.5501 13.3035 25.6663 13.3556 25.7619 13.4361C25.8575 13.5166 25.9286 13.6222 25.9672 13.7411C26.0059 13.8599 26.0104 13.9872 25.9804 14.1085C25.9504 14.2298 25.887 14.3403 25.7974 14.4274L21.3842 18.7291L22.426 24.8049C22.4469 24.9279 22.4331 25.0542 22.386 25.1697C22.3389 25.2852 22.2605 25.3853 22.1596 25.4586C22.0586 25.5318 21.9392 25.5754 21.8148 25.5845C21.6904 25.5935 21.566 25.5675 21.4556 25.5095L15.9997 22.6411L10.5447 25.5095C10.4342 25.5676 10.3096 25.5936 10.1851 25.5845C10.0606 25.5755 9.94113 25.5318 9.84016 25.4584C9.7392 25.385 9.66079 25.2848 9.6138 25.1692C9.5668 25.0535 9.55311 24.927 9.57426 24.804L10.616 18.7291L6.20279 14.4274C6.11313 14.3404 6.04967 14.23 6.01962 14.1087C5.98956 13.9874 5.99412 13.8602 6.03276 13.7414C6.0714 13.6225 6.14259 13.517 6.23823 13.4366C6.33387 13.3562 6.45014 13.3042 6.57383 13.2866L12.6728 12.4L15.3994 6.8728C15.4547 6.76089 15.5401 6.66667 15.6461 6.60079C15.7521 6.53491 15.8744 6.5 15.9992 6.5C16.124 6.5 16.2463 6.53491 16.3523 6.60079C16.4583 6.66667 16.5438 6.76089 16.599 6.8728Z" fill="white"></path>
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_7_2">
                                          <rect width="32" height="32" fill="white"></rect>
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  </div>
                                </div>
                              </a>
                            </span>
                            <span className="relative h-min w-auto" data-state="closed">
                              <a className="relative text-muted hover:underline" title="" href={`https://farcaster.xyz/${cast.author.username}`}>@{cast.author.username}</a>
                            </span>
                            <div className="text-muted">·</div>
                            <a className="" title="Navigate to cast" href="/ccarella.eth/0x83805081">
                              <div className="text-muted hover:underline">{cast.timestamp}</div>
                            </a>
                          </div>
                          <div className="relative cursor-pointer rounded-full px-1 text-muted hover:text-action-purple hover:bg-overlay-faint">
                            <svg aria-hidden="true" focusable="false" role="img" className="octicon octicon-kebab-horizontal" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="display: inline-block; user-select: none; vertical-align: text-bottom; overflow: visible;">
                              <path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="flex flex-col whitespace-pre-wrap break-words pb-2 text-base leading-5 tracking-normal">
                          <div>{cast.text}</div>


                          <div className="ml-[-6px] flex items-center gap-12">
                            <div className="flex flex-row items-center text-sm text-faint group w-14 cursor-pointer">
                              <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-purple  group-hover:text-action-purple hover:text-action-purple group-hover:bg-action-purple/30 hover:bg-action-purple/30 dark:group-hover:bg-action-purple/10 dark:hover:bg-action-purple/10 text-faint">
                                <Message />
                              </div>
                              <span className="ml-1 inline-flex text-center text-sm group transition-colors text-faint">{cast.replies.count}</span></div><div className="relative"><span>
                              <div className="flex flex-row items-center text-sm text-faint group w-14 cursor-pointer">
                                <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-green group-hover:text-action-green hover:text-action-green group-hover:bg-action-green/30 hover:bg-action-green/30 dark:group-hover:bg-action-green/10 dark:hover:bg-action-green/10 text-faint">
                                  <Recast />
                                </div>
                                <span className="ml-1 inline-flex text-center text-sm group transition-colors text-action-green group-hover:text-action-green text-faint">{cast.reactions.recasts.length}</span>
                              </div>
                            </span>
                          </div>
                          <div className="flex flex-row items-center text-sm text-faint group w-14 cursor-pointer">
                            <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-red group-hover:text-action-red hover:text-action-red group-hover:bg-action-red/30 hover:bg-action-red/30 dark:group-hover:bg-action-red/10 dark:hover:bg-action-red/10 text-faint">
                              <Like />
                            </div>
                            <span className="ml-1 inline-flex text-center text-sm group transition-colors text-action-red group-hover:text-action-red text-faint">{cast.reactions.likes.length}</span>
                          </div>
                          <div className="relative">
                            <div className="flex flex-row items-center text-sm text-faint group w-14 cursor-pointer">
                              <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-purple  group-hover:text-action-purple hover:text-action-purple group-hover:bg-action-purple/30 hover:bg-action-purple/30 dark:group-hover:bg-action-purple/10 dark:hover:bg-action-purple/10 text-faint">
                                <svg width="15" height="15" viewBox="0 0 28 28" fill="none">
                                  <path className="fill-current text-subtle" fill-rule="evenodd" d="M14.804.333a1.137 1.137 0 0 0-1.608 0L.333 13.196a1.137 1.137 0 0 0 0 1.608l12.863 12.863a1.137 1.137 0 0 0 1.608 0l12.863-12.863a1.137 1.137 0 0 0 0-1.608L14.804.333ZM14 5.159c0-.89-1.077-1.337-1.707-.707l-8.134 8.134a2 2 0 0 0 0 2.828l8.134 8.134c.63.63 1.707.184 1.707-.707V5.159Z" clip-rule="nonzero"></path>
                                </svg>
                              </div>
                              <span className="ml-1 inline-flex text-center text-sm group transition-colors text-faint hidden">0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          )))
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




{
  "channels": [
    {
      "id": "newyork",
      "url": "https://warpcast.com/~/channel/newyork",
      "name": "newyork",
      "description": "",
      "object": "channel",
      "image_url": "https://i.imgur.com/nzc5inE.png",
      "created_at": 1707064655,
      "parent_url": "https://warpcast.com/~/channel/newyork",
      "lead": {
        "object": "user",
        "fid": 18529,
        "custody_address": "0x6f4871de8480340f2a495e73bfaf6ba5c404503c",
        "username": "0xg",
        "display_name": "0xG",
        "pfp_url": "https://i.imgur.com/XruP6xs.jpg",
        "profile": {
          "bio": {
            "text": "⟠\n@0xG23 on X"
          }
        },
        "follower_count": 307,
        "following_count": 56,
        "verifications": [
          "0xa412e5f94cec412dd93f659836d92b160aa4531b"
        ],
        "verified_addresses": {
          "eth_addresses": [
            "0xa412e5f94cec412dd93f659836d92b160aa4531b"
          ],
          "sol_addresses": []
        },
        "active_status": "inactive"
      }
    },
    {
      "id": "newyorkcity",
      "url": "https://warpcast.com/~/channel/newyorkcity",
      "name": "newyorkcity",
      "description": "",
      "object": "channel",
      "image_url": "https://i.imgur.com/SVjDdLq.png",
      "created_at": 1707064664,
      "parent_url": "https://warpcast.com/~/channel/newyorkcity",
      "lead": {
        "object": "user",
        "fid": 18529,
        "custody_address": "0x6f4871de8480340f2a495e73bfaf6ba5c404503c",
        "username": "0xg",
        "display_name": "0xG",
        "pfp_url": "https://i.imgur.com/XruP6xs.jpg",
        "profile": {
          "bio": {
            "text": "⟠\n@0xG23 on X"
          }
        },
        "follower_count": 307,
        "following_count": 56,
        "verifications": [
          "0xa412e5f94cec412dd93f659836d92b160aa4531b"
        ],
        "verified_addresses": {
          "eth_addresses": [
            "0xa412e5f94cec412dd93f659836d92b160aa4531b"
          ],
          "sol_addresses": []
        },
        "active_status": "inactive"
      }
    }
  ]
}







{
    "object": "cast",
    "hash": "0xefc02e8c67478300461648a4ed84e42c4dae782c",
    "thread_hash": "0xefc02e8c67478300461648a4ed84e42c4dae782c",
    "parent_hash": null,
    "parent_url": "https://warpcast.com/~/channel/replyguys",
    "root_parent_url": "https://warpcast.com/~/channel/replyguys",
    "parent_author": {
        "fid": null
    },
    "author": {
        "object": "user",
        "fid": 278655,
        "custody_address": "0xd3d882e3d95e57aeb0622abeade3995e1f080750",
        "username": "maximonee",
        "display_name": "Maximonee",
        "pfp_url": "https://www.larvalabs.com/cryptopunks/cryptopunk5634.png",
        "profile": {
            "bio": {
                "text": "Smart contract dev & security engineer @ rtfkt.com\n\nCreator of @punkbot",
                "mentioned_profiles": []
            }
        },
        "follower_count": 2666,
        "following_count": 307,
        "verifications": [
            "0xc3d2a46894cbab35b8fc2c1613f91cc76fdd3419",
            "0x1bce689565ddb9e5f4193130f693d2b976a72096",
            "0xfd3d0332062d84db8a5ebf3871ddd4fa639630a5"
        ],
        "verified_addresses": {
            "eth_addresses": [
                "0xc3d2a46894cbab35b8fc2c1613f91cc76fdd3419",
                "0x1bce689565ddb9e5f4193130f693d2b976a72096",
                "0xfd3d0332062d84db8a5ebf3871ddd4fa639630a5"
            ],
            "sol_addresses": []
        },
        "active_status": "active"
    },
    "text": "Whats up fellow reply guys. Replies are art imo, here's a frame where you can turn them into a gen art piece :) https://socialgraphs.vercel.app/\nhttps://warpcast.com/maximonee/0x2bffe048",
    "timestamp": "2024-02-26T19:11:15.000Z",
    "embeds": [
        {
            "url": "https://socialgraphs.vercel.app/"
        },
        {
            "cast_id": {
                "fid": 278655,
                "hash": "0x2bffe048fea27d7374f6f1d7eca69e7fa6056e97"
            }
        }
    ],
    "frames": [
        {
            "version": "vNext",
            "image": "https://socialgraphs.vercel.app/socialgraphs.png",
            "buttons": [
                {
                    "index": 1,
                    "title": "Fetch your social graph data",
                    "action_type": "post"
                }
            ],
            "input": {},
            "post_url": "https://socialgraphs.vercel.app/api/frame?p=%2F&s=%7B%22m%22%3A1%2C%22l%22%3A%22%22%2C%22a%22%3A1337%7D&r=%7B%7D",
            "frames_url": "https://socialgraphs.vercel.app/"
        }
    ],
    "reactions": {
        "likes": [
            {
                "fid": 18262,
                "fname": "droo4you"
            },
            {
                "fid": 263272,
                "fname": "sungg"
            },
            {
                "fid": 290231,
                "fname": "itsmeasevvv"
            }
        ],
        "recasts": [
            {
                "fid": 18262,
                "fname": "droo4you"
            },
            {
                "fid": 263272,
                "fname": "sungg"
            },
            {
                "fid": 267027,
                "fname": "ryan9"
            }
        ]
    },
    "replies": {
        "count": 142
    },
    "mentioned_profiles": []
}





  async function getData() {
    const base = "https://api.neynar.com/";
    const  = `${base}v2/farcaster/feed?feed_type=filter&filter_type=global_trending&with_recasts=true&with_replies=false&limit=25`;
    const response3 = await fetch(url3, {
      headers: {
        accept: "application/json",
        api_key: apiKey,
      },
    });
    const feed1 = await response3.json();
    
    setUserFeed(feed1)
    console.log(userFeed)
  }


  const compute = async (num) => {

  };



const getChannelName = async (url) => {
  const base = "https://api.neynar.com/";
  const getChannel = url.slice(31)
  const channelQuery = `${base}v2/farcaster/channel/search?q=${getChannel}`;
  const channelData = await fetch(channelQuery, {
    headers: {
      accept: "application/json",
      api_key: apiKey,
    },
  });
  const channel = await channelData.json();
  const channelName = channel[0].name
  return channelName;
}


const getChannelImg = async (url) => {
  const base = "https://api.neynar.com/";
  const getChannel = url.slice(31)
  const channelQuery = `${base}v2/farcaster/channel/search?q=${getChannel}`;
  const channelData = await fetch(channelQuery, {
    headers: {
      accept: "application/json",
      api_key: apiKey,
    },
  });
  const channel = await channelData.json();
  const channelImg = channel[0].image_url
  return channelImg;
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











<div>
  <div>
    <div className="relative px-4 py-2 hover:bg-overlay-faint cursor-pointer border-t border-faint">
      <div className="absolute top-0 w-[1px] border-l-2 border-faint border-none" style={{left: '38px', height: '22px'}}>
    </div>
    <div className="absolute bottom-0 w-[1px] border-l-2 border-faint border-none" style={{left: '38px', top: '22px'}}>
    </div>
    <div className="relative flex flex-col">
      <div className="relative flex">
        <span className="relative h-min w-auto" dataState="closed">
          <a className="" title="" href={`https://warpcast.com/${cast.author.username}`}>
            <img loading="lazy" src={cast.author.pfp_url} className="shrink-0 rounded-full aspect-square object-cover border border-default bg-app relative mr-2" alt={`${cast.author.display_name} avatar`} style={{width: '48px', height: '48px', minWidth: '48px', minHeight: '48px'}}>
          </a>
        </span>
        <div className="relative w-full min-w-0">
          <div className="flex flex-row justify-between gap-2">
            <div className="flex min-w-0 flex-1 shrink flex-row items-baseline gap-1">
              <span className="relative h-min w-auto" data-state="closed">
                <a className="relative min-w-0" title="" href={`https://warpcast.com/${cast.author.username}`}>
                  <div className="flex min-w-0 flex-row items-center">
                    <span className="text-default min-w-0 hover:underline !block whitespace-nowrap break-words text-ellipsis overflow-hidden text-base font-semibold">{cast.author.display_name}</span>
                    <div className="ml-1 flex flex-row items-center space-x-1">
                      {(cast.author.active_status == 'active') && (<ActiveUser />)}
                    </div>
                  </div>
                </a>
              </span>
              <span className="relative h-min w-auto" dataState="closed">
                <a className="relative text-muted hover:underline" title="" href={`https://warpcast.com/${cast.author.username}`}>@{cast.author.username}</a>
              </span>
              <div className="text-muted">·</div>
              <a className="" title="Navigate to cast" href={`https://warpcast.com/${cast.author.username}/${cast.hash.sting(0,10)}`}>
                <div className="text-muted hover:underline">{timePassed(cast.timestamp)}</div>
              </a>
            </div>
            <div className="relative cursor-pointer rounded-full px-1 text-muted hover:text-action-purple hover:bg-overlay-faint">
              <Kebab />
            </div>
          </div>
          <div className="flex flex-col whitespace-pre-wrap break-words pb-2 text-base leading-5 tracking-normal">
            <div>{cast.text}</div>
            {(cast.embeds.length > 0) &&
            (<div className="mt-2 inline-flex flex-col justify-center space-y-1">
              <div className="flex flex-row overflow-hidden min-w-0 max-w-full border-default w-max justify-start border  rounded-lg">
                <img loading="lazy" src={cast.embeds.url} className="relative  cursor-pointer object-cover object-top w-auto max-h-[500px]" alt="Cast image embed" style={{aspectRatio: '0.75 / 1'}}>
              </div>
            </div>)}
          </div>
          <div className="mb-0.5 w-max rounded-md border p-1 border-default sm:px-1 sm:py-0">
            <div className="flex flex-row items-center justify-start">
              <img loading="lazy" src={getChannelImg(cast.parent_url)} className="shrink-0 rounded-sm aspect-square object-cover" alt="Channel image" style={{width: '17px', height: '17px', minWidth: '17px', minHeight: '17px'}}>
              <span className="ml-1 max-w-[300px] px-1 pt-[1px] text-md decoration-[#546473] text-muted inline line-clamp-1">{getChannelName(cast.parent_url)}</span>
            </div>
          </div>
          <div className="ml-[-6px] flex items-center gap-12">
            <div className="flex flex-row items-center text-sm text-faint group w-14 cursor-pointer">
              <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-purple  group-hover:text-action-purple hover:text-action-purple group-hover:bg-action-purple/30 hover:bg-action-purple/30 dark:group-hover:bg-action-purple/10 dark:hover:bg-action-purple/10 text-faint">
                <Message />
              </div>
              <span className="ml-1 inline-flex text-center text-sm group transition-colors text-faint">{cast.replies.count}</span>
            </div>
            <div className="relative">
              <span>
                <div className="flex flex-r0ow items-center text-sm text-faint group w-14 cursor-pointer">
                  <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-green group-hover:text-action-green hover:text-action-green group-hover:bg-action-green/30 hover:bg-action-green/30 dark:group-hover:bg-action-green/10 dark:hover:bg-action-green/10 text-faint">
                    <Recast />
                  </div>
                  <span className="ml-1 inline-flex text-center text-sm group transition-colors text-action-green group-hover:text-action-green text-faint hidden">{cast.reactions.recasts.length}</span>
                </div>
              </span>
            </div>
            <div className="flex flex-row items-center text-sm text-faint group w-14 cursor-pointer">
              <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-red group-hover:text-action-red hover:text-action-red group-hover:bg-action-red/30 hover:bg-action-red/30 dark:group-hover:bg-action-red/10 dark:hover:bg-action-red/10 text-faint">
                <Like />
              </div>
              <span className="ml-1 inline-flex text-center text-sm group transition-colors text-action-red group-hover:text-action-red text-faint">{cast.reactions.likes.length}</span>
            </div>
            <div className="relative">
              <div className="flex flex-row items-center text-sm text-faint group w-14 cursor-pointer">
                <div className="flex flex-row items-center justify-center rounded-full group p-[6px] transition-colors text-action-purple  group-hover:text-action-purple hover:text-action-purple group-hover:bg-action-purple/30 hover:bg-action-purple/30 dark:group-hover:bg-action-purple/10 dark:hover:bg-action-purple/10 text-faint">
                  <Warp />
                </div>
                <span className="ml-1 inline-flex text-center text-sm group transition-colors text-faint hidden">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>























[
    {
        "object": "cast",
        "hash": "0x64e2e0e78d9d5fefd585ca06e0e6555f6dc3af2d",
        "thread_hash": "0x64e2e0e78d9d5fefd585ca06e0e6555f6dc3af2d",
        "parent_hash": null,
        "parent_url": null,
        "root_parent_url": null,
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 1110,
            "custody_address": "0xc4c4db549d13ebd6a9805a42ef6a3e591af6aa2f",
            "username": "perl",
            "display_name": "🎩 perl 🎩",
            "pfp_url": "https://i.imgur.com/YbZMMsn.png",
            "profile": {
                "bio": {
                    "text": "tap the 🔔 to be notified when $PERL game starts. 🕹️: perl.xyz 💬: /perl ",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 36873,
            "following_count": 2,
            "verifications": [
                "0x1ab2be15a12437c0db4412ef2781a2f499964e6f"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0x1ab2be15a12437c0db4412ef2781a2f499964e6f"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "Round #40 ( Feb. 27) \n\nWill @base ( 👑 L2 by @coinbase & @jessepollak) get MORE or LESS than 8472.5 LIKES tomorrow?\n*Only the main/quote-casts count. Not replies\n\n📺 perl.xyz : LIVE stats & leaderboard\n🎩 300K $DEGEN for 1 perlson: Quote-cast a screen from perl.xyz\n🔔 Turn it ON\n\nhttps://perl.xyz/market/40/bet",
        "timestamp": "2024-02-27T02:54:37.000Z",
        "embeds": [
            {
                "url": "https://perl.xyz/market/40/bet"
            }
        ],
        "frames": [
            {
                "version": "vNext",
                "title": "Perl",
                "image": "https://perl.xyz/api/image?marketId=40&rand=LO24t",
                "buttons": [
                    {
                        "index": 1,
                        "title": "📈 MORE",
                        "action_type": "post"
                    },
                    {
                        "index": 2,
                        "title": "📉 LESS",
                        "action_type": "post"
                    }
                ],
                "input": {},
                "post_url": "https://perl.xyz/api/bet?marketId=40",
                "frames_url": "https://perl.xyz/market/40/bet"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 277944,
                    "fname": "mansour"
                },
                {
                    "fid": 260372,
                    "fname": "jpmax"
                }
            ],
            "recasts": [
                {
                    "fid": 342489,
                    "fname": "miguelcrypto"
                },
                {
                    "fid": 260372,
                    "fname": "jpmax"
                }
            ]
        },
        "replies": {
            "count": 119
        },
        "mentioned_profiles": [
            {
                "object": "user",
                "fid": 12142,
                "custody_address": "0x04e6f111ebf6fd25576d480480962435dc3aa8d8",
                "username": "base",
                "display_name": "Base",
                "pfp_url": "https://i.imgur.com/7Q0QBrm.jpg",
                "profile": {
                    "bio": {
                        "text": "base.org",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 38063,
                "following_count": 32,
                "verifications": [
                    "0x9652721d02b9db43f4311102820158abb4ecc95b"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0x9652721d02b9db43f4311102820158abb4ecc95b"
                    ],
                    "sol_addresses": []
                },
                "active_status": "active"
            },
            {
                "object": "user",
                "fid": 21773,
                "custody_address": "0xaa0cdffda98f9d8b360cbd6eb353faaf1d20e46f",
                "username": "coinbase",
                "display_name": "Coinbase",
                "pfp_url": "https://i.imgur.com/Rdj8kks.jpg",
                "profile": {
                    "bio": {
                        "text": "The most trusted crypto exchange.",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 1948,
                "following_count": 3,
                "verifications": [],
                "verified_addresses": {
                    "eth_addresses": [],
                    "sol_addresses": []
                },
                "active_status": "inactive"
            },
            {
                "object": "user",
                "fid": 99,
                "custody_address": "0x4ce34af3378a00c640125e4dbf4c9e64dff4c93b",
                "username": "jessepollak",
                "display_name": "Jesse Pollak 🔵",
                "pfp_url": "https://i.seadn.io/gae/GFkg_668tE-YxTKPt_XcZdL_xKMQ2CitZKR2L7dJoLoMXH4hUFXHv3Tzes-2hZWiyTEACe6AvutNqBpNbN_WS3b25g?w=500&auto=format",
                "profile": {
                    "bio": {
                        "text": "@base contributor #001; onchain cities w/ OAK & city3",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 148895,
                "following_count": 1128,
                "verifications": [
                    "0x849151d7d0bf1f34b70d5cad5149d28cc2308bf1",
                    "0xe73f9c181b571cac2bf3173634d04a9921b7ffcf",
                    "0x6e0d9c6dd8a08509bb625caa35dc61a991406f62"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0x849151d7d0bf1f34b70d5cad5149d28cc2308bf1",
                        "0xe73f9c181b571cac2bf3173634d04a9921b7ffcf",
                        "0x6e0d9c6dd8a08509bb625caa35dc61a991406f62"
                    ],
                    "sol_addresses": []
                },
                "active_status": "active"
            }
        ]
    },
    {
        "object": "cast",
        "hash": "0xfec871d8790a95722d9e5a2b4d6fe8d483fa05e9",
        "thread_hash": "0xfec871d8790a95722d9e5a2b4d6fe8d483fa05e9",
        "parent_hash": null,
        "parent_url": null,
        "root_parent_url": null,
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 1110,
            "custody_address": "0xc4c4db549d13ebd6a9805a42ef6a3e591af6aa2f",
            "username": "perl",
            "display_name": "🎩 perl 🎩",
            "pfp_url": "https://i.imgur.com/YbZMMsn.png",
            "profile": {
                "bio": {
                    "text": "tap the 🔔 to be notified when $PERL game starts. 🕹️: perl.xyz 💬: /perl ",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 36873,
            "following_count": 2,
            "verifications": [
                "0x1ab2be15a12437c0db4412ef2781a2f499964e6f"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0x1ab2be15a12437c0db4412ef2781a2f499964e6f"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "Round #39 ( Feb. 27) \n\nWill @pifours.eth ( /morpheus NFT ) get MORE or LESS than 889.5 LIKES tomorrow?\n*Only the main/quote-casts count. Not replies\n\n📺 perl.xyz : LIVE stats & leaderboard\n🎩 300K $DEGEN for 1 player: Quote-cast your profile ss from perl.xyz\n🔔 Turn it ON\n\nhttps://perl.xyz/market/39/bet",
        "timestamp": "2024-02-26T21:47:46.000Z",
        "embeds": [
            {
                "url": "https://perl.xyz/market/39/bet"
            }
        ],
        "frames": [
            {
                "version": "vNext",
                "title": "Perl",
                "image": "https://perl.xyz/api/image?marketId=39&rand=9Ff3E",
                "buttons": [
                    {
                        "index": 1,
                        "title": "📈 MORE",
                        "action_type": "post"
                    },
                    {
                        "index": 2,
                        "title": "📉 LESS",
                        "action_type": "post"
                    }
                ],
                "input": {},
                "post_url": "https://perl.xyz/api/bet?marketId=39",
                "frames_url": "https://perl.xyz/market/39/bet"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 277944,
                    "fname": "mansour"
                },
                {
                    "fid": 250277,
                    "fname": "alanf72"
                }
            ],
            "recasts": [
                {
                    "fid": 277944,
                    "fname": "mansour"
                },
                {
                    "fid": 258710,
                    "fname": "adexhrmwn"
                }
            ]
        },
        "replies": {
            "count": 75
        },
        "mentioned_profiles": [
            {
                "object": "user",
                "fid": 228880,
                "custody_address": "0xe06bc5fcfd0e1d7521edc0dc6766b2daf367e769",
                "username": "pifours.eth",
                "display_name": "pifours.eth 👁️ 🇺🇦",
                "pfp_url": "https://i.imgur.com/cXPNTQS.jpg",
                "profile": {
                    "bio": {
                        "text": "Web3 builder\n——\n/morpheus",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 2307,
                "following_count": 550,
                "verifications": [
                    "0xe06bc5fcfd0e1d7521edc0dc6766b2daf367e769"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0xe06bc5fcfd0e1d7521edc0dc6766b2daf367e769"
                    ],
                    "sol_addresses": []
                },
                "active_status": "active"
            }
        ]
    },
    {
        "object": "cast",
        "hash": "0x237df66126bac543418aa9e0cb36f16ecef2cd45",
        "thread_hash": "0x237df66126bac543418aa9e0cb36f16ecef2cd45",
        "parent_hash": null,
        "parent_url": "https://warpcast.com/~/channel/lp",
        "root_parent_url": "https://warpcast.com/~/channel/lp",
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 4482,
            "custody_address": "0xda8c2a87afe4a1855cc48ddd7d411b8317048df0",
            "username": "deployer",
            "display_name": "Deployer",
            "pfp_url": "https://i.imgur.com/y7BDXNg.jpg",
            "profile": {
                "bio": {
                    "text": "Currently deploying ",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 8460,
            "following_count": 326,
            "verifications": [
                "0x7490a48d50b9c9bc6154d33597ca1399f17c3e75",
                "0x538c4f2afa012911851dadf0655cb61377e7a8eb"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0x7490a48d50b9c9bc6154d33597ca1399f17c3e75",
                    "0x538c4f2afa012911851dadf0655cb61377e7a8eb"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "Ham tips are live! 🍖 You can now start tipping casts with Ham. You can view your daily allowance here https://based.thelp.xyz/leaderboard \n\nTo tip just comment the 🍖 emoji. A ham is 10 points and contributes to the next TN100x airdrop\n\nExamples: \n\n🍖 = 10 points\n\n🍖🍖🍖 = 30 points\n\n🍖 x 10 = 100 points",
        "timestamp": "2024-02-27T05:54:56.000Z",
        "embeds": [
            {
                "url": "https://i.imgur.com/sqidCVh.png"
            },
            {
                "url": "https://based.thelp.xyz/leaderboard"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 280293,
                    "fname": "yaghi"
                },
                {
                    "fid": 263574,
                    "fname": "tonyminh"
                }
            ],
            "recasts": [
                {
                    "fid": 280293,
                    "fname": "yaghi"
                },
                {
                    "fid": 8433,
                    "fname": "codincowboy"
                }
            ]
        },
        "replies": {
            "count": 763
        },
        "mentioned_profiles": []
    },
    {
        "object": "cast",
        "hash": "0x8f2353339572b8b47d017093c32b0f399e5d6ead",
        "thread_hash": "0x8f2353339572b8b47d017093c32b0f399e5d6ead",
        "parent_hash": null,
        "parent_url": "chain://eip155:7777777/erc721:0x5d6a07d07354f8793d1ca06280c4adf04767ad7e",
        "root_parent_url": "chain://eip155:7777777/erc721:0x5d6a07d07354f8793d1ca06280c4adf04767ad7e",
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 15983,
            "custody_address": "0x4ae49f0aa762efebebff4bac4ea0847eb6af4ec9",
            "username": "jacek",
            "display_name": "Jacek 🎩",
            "pfp_url": "https://i.imgur.com/liviil4.jpg",
            "profile": {
                "bio": {
                    "text": "Lead $DEGEN | https://www.degen.tips/",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 13006,
            "following_count": 227,
            "verifications": [
                "0xee6fb338e75c43cc9153ff86600700459e9871da",
                "0xf1e7dbedd9e06447e2f99b1310c09287b734addc"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0xee6fb338e75c43cc9153ff86600700459e9871da",
                    "0xf1e7dbedd9e06447e2f99b1310c09287b734addc"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "$DEGEN Update: Starting tomorrow, only those with 10,000+ $DEGEN in Farcaster-connected wallets will receive tip allowances. You can still receive $DEGEN with a zero balance. Shoutout to our HODLers through the Degen winter - your loyalty hasn't gone unnoticed. We're committed to building $DEGEN for the long haul!",
        "timestamp": "2024-02-27T13:18:12.000Z",
        "embeds": [],
        "reactions": {
            "likes": [
                {
                    "fid": 211532,
                    "fname": "aokla"
                },
                {
                    "fid": 17001,
                    "fname": "diakoe"
                }
            ],
            "recasts": [
                {
                    "fid": 354010,
                    "fname": "vincentia"
                },
                {
                    "fid": 244414,
                    "fname": "asadlatif"
                }
            ]
        },
        "replies": {
            "count": 266
        },
        "mentioned_profiles": []
    },
    {
        "object": "cast",
        "hash": "0x146410981fd10f8c54bfd10ea9e1b2fc1a5cc4be",
        "thread_hash": "0x146410981fd10f8c54bfd10ea9e1b2fc1a5cc4be",
        "parent_hash": null,
        "parent_url": "https://onchainsummer.xyz",
        "root_parent_url": "https://onchainsummer.xyz",
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 99,
            "custody_address": "0x4ce34af3378a00c640125e4dbf4c9e64dff4c93b",
            "username": "jessepollak",
            "display_name": "Jesse Pollak 🔵",
            "pfp_url": "https://i.seadn.io/gae/GFkg_668tE-YxTKPt_XcZdL_xKMQ2CitZKR2L7dJoLoMXH4hUFXHv3Tzes-2hZWiyTEACe6AvutNqBpNbN_WS3b25g?w=500&auto=format",
            "profile": {
                "bio": {
                    "text": "@base contributor #001; onchain cities w/ OAK & city3",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 148895,
            "following_count": 1128,
            "verifications": [
                "0x849151d7d0bf1f34b70d5cad5149d28cc2308bf1",
                "0xe73f9c181b571cac2bf3173634d04a9921b7ffcf",
                "0x6e0d9c6dd8a08509bb625caa35dc61a991406f62"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0x849151d7d0bf1f34b70d5cad5149d28cc2308bf1",
                    "0xe73f9c181b571cac2bf3173634d04a9921b7ffcf",
                    "0x6e0d9c6dd8a08509bb625caa35dc61a991406f62"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "preview of @base's upcoming onchain office\n\n- our team will work here full time (we already do in a smaller office)\n- we'll take meetings here (guests can join lobby + rooms)\n- there will be hack desks that we open up to the ecosystem\n\nwe're working to do all this onchain: incredible token-gating use case",
        "timestamp": "2024-02-27T00:17:43.000Z",
        "embeds": [
            {
                "url": "https://i.imgur.com/BadqLkW.png"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 368049,
                    "fname": "marcellin"
                },
                {
                    "fid": 7960,
                    "fname": "sheldon"
                }
            ],
            "recasts": [
                {
                    "fid": 337893,
                    "fname": "jam666"
                },
                {
                    "fid": 11528,
                    "fname": "jrf"
                }
            ]
        },
        "replies": {
            "count": 94
        },
        "mentioned_profiles": [
            {
                "object": "user",
                "fid": 12142,
                "custody_address": "0x04e6f111ebf6fd25576d480480962435dc3aa8d8",
                "username": "base",
                "display_name": "Base",
                "pfp_url": "https://i.imgur.com/7Q0QBrm.jpg",
                "profile": {
                    "bio": {
                        "text": "base.org",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 38063,
                "following_count": 32,
                "verifications": [
                    "0x9652721d02b9db43f4311102820158abb4ecc95b"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0x9652721d02b9db43f4311102820158abb4ecc95b"
                    ],
                    "sol_addresses": []
                },
                "active_status": "active"
            }
        ]
    },
    {
        "object": "cast",
        "hash": "0xf78e56f18f93ef43506a468e178bcfaf9a035750",
        "thread_hash": "0xf78e56f18f93ef43506a468e178bcfaf9a035750",
        "parent_hash": null,
        "parent_url": null,
        "root_parent_url": null,
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 1110,
            "custody_address": "0xc4c4db549d13ebd6a9805a42ef6a3e591af6aa2f",
            "username": "perl",
            "display_name": "🎩 perl 🎩",
            "pfp_url": "https://i.imgur.com/YbZMMsn.png",
            "profile": {
                "bio": {
                    "text": "tap the 🔔 to be notified when $PERL game starts. 🕹️: perl.xyz 💬: /perl ",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 36873,
            "following_count": 2,
            "verifications": [
                "0x1ab2be15a12437c0db4412ef2781a2f499964e6f"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0x1ab2be15a12437c0db4412ef2781a2f499964e6f"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "Round #41 ( Feb. 28) \n\nWill @br1an.eth ( 🐐 @unlonely) get MORE or LESS than 499.5 REPLIES tomorrow?\n\n📺 perl.xyz : You can wager custom amounts of PERLs for this game\n🎩 300K $DEGEN for 1: Quote-cast how many PERLs you are risking for this round - from perl.xyz\n🔔 Turn it ON\n\nhttps://perl.xyz/market/41/bet",
        "timestamp": "2024-02-27T13:57:36.000Z",
        "embeds": [
            {
                "url": "https://perl.xyz/market/41/bet"
            }
        ],
        "frames": [
            {
                "version": "vNext",
                "title": "Perl",
                "image": "https://perl.xyz/api/image?marketId=41&rand=DDyeo",
                "buttons": [
                    {
                        "index": 1,
                        "title": "📈 MORE",
                        "action_type": "post"
                    },
                    {
                        "index": 2,
                        "title": "📉 LESS",
                        "action_type": "post"
                    }
                ],
                "input": {},
                "post_url": "https://perl.xyz/api/bet?marketId=41",
                "frames_url": "https://perl.xyz/market/41/bet"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 218764,
                    "fname": "halamadrid"
                },
                {
                    "fid": 361439,
                    "fname": "emakurnia"
                }
            ],
            "recasts": [
                {
                    "fid": 331830,
                    "fname": "jibon2200"
                },
                {
                    "fid": 361439,
                    "fname": "emakurnia"
                }
            ]
        },
        "replies": {
            "count": 64
        },
        "mentioned_profiles": [
            {
                "object": "user",
                "fid": 548,
                "custody_address": "0xe936220ee2acf62134628e1d07f4f3e4182fabd7",
                "username": "br1an.eth",
                "display_name": "brian is live on unlonely",
                "pfp_url": "https://i.seadn.io/gae/T1n8naiIITR2TKLlRyPHDEkKIRhO01WwsTJBfv1_YeUeVbtPnSlhe4MqWuYo0tMyDj9HWV3t3vJYBEKEHVeKHXYo4XIFxqSFfgEVbQ?w=500&auto=format",
                "profile": {
                    "bio": {
                        "text": "building @unlonely, stream the $VIBES",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 52605,
                "following_count": 725,
                "verifications": [
                    "0x141edb16c70307cf2f0f04af2dda75423a0e1bea"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0x141edb16c70307cf2f0f04af2dda75423a0e1bea"
                    ],
                    "sol_addresses": [
                        "CGgvXvo9zd8ShBrbqeXeWrDg1RQfNtyUHXAp1DH4By9i"
                    ]
                },
                "active_status": "active"
            },
            {
                "object": "user",
                "fid": 1225,
                "custody_address": "0x4cb1a9b93f3ec198ccba04e061e2fae04f1b9f85",
                "username": "unlonely",
                "display_name": "unlonely",
                "pfp_url": "https://i.imgur.com/MNArpwV.png",
                "profile": {
                    "bio": {
                        "text": "web3 livestreaming. come be unlonely. unlonely.app",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 1904,
                "following_count": 2,
                "verifications": [],
                "verified_addresses": {
                    "eth_addresses": [],
                    "sol_addresses": []
                },
                "active_status": "inactive"
            }
        ]
    },
    {
        "object": "cast",
        "hash": "0x90320c26ff98a6d76ceefdfcaf4609464ddfa1b1",
        "thread_hash": "0x90320c26ff98a6d76ceefdfcaf4609464ddfa1b1",
        "parent_hash": null,
        "parent_url": "https://onchainsummer.xyz",
        "root_parent_url": "https://onchainsummer.xyz",
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 12142,
            "custody_address": "0x04e6f111ebf6fd25576d480480962435dc3aa8d8",
            "username": "base",
            "display_name": "Base",
            "pfp_url": "https://i.imgur.com/7Q0QBrm.jpg",
            "profile": {
                "bio": {
                    "text": "base.org",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 38063,
            "following_count": 32,
            "verifications": [
                "0x9652721d02b9db43f4311102820158abb4ecc95b"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0x9652721d02b9db43f4311102820158abb4ecc95b"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "Base Hunt is BACK\n\nJoin a guild and start playing, online or IRL at /ethdenver \n\n1️⃣ Complete challenges\n2️⃣ Earn points to level up\n3️⃣ Unlock limited edition merch, powered by @slice \n\nSee you in /base-hunt \n\nbasehunt.xyz",
        "timestamp": "2024-02-26T21:23:45.000Z",
        "embeds": [
            {
                "url": "https://stream.warpcast.com/v1/video/f607e55b2a7765d2dca17f256014f957.m3u8"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 199974,
                    "fname": "cavedude"
                },
                {
                    "fid": 319999,
                    "fname": "farzanzare"
                }
            ],
            "recasts": [
                {
                    "fid": 271729,
                    "fname": "lethanhhoang"
                },
                {
                    "fid": 11502,
                    "fname": "wecreateproject.eth"
                }
            ]
        },
        "replies": {
            "count": 77
        },
        "mentioned_profiles": [
            {
                "object": "user",
                "fid": 254376,
                "custody_address": "0x6ccdf4cd8c26407c328d65717266b5146bc5585b",
                "username": "slice",
                "display_name": "Slice",
                "pfp_url": "https://i.imgur.com/UZpA9lS.jpg",
                "profile": {
                    "bio": {
                        "text": "The onchain commerce protocol slice.so",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 2556,
                "following_count": 4,
                "verifications": [],
                "verified_addresses": {
                    "eth_addresses": [],
                    "sol_addresses": []
                },
                "active_status": "inactive"
            }
        ]
    },
    {
        "object": "cast",
        "hash": "0xae69f89a180769db808266a8a7132bc7960ffe50",
        "thread_hash": "0xae69f89a180769db808266a8a7132bc7960ffe50",
        "parent_hash": null,
        "parent_url": "https://warpcast.com/~/channel/morpheus",
        "root_parent_url": "https://warpcast.com/~/channel/morpheus",
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 228880,
            "custody_address": "0xe06bc5fcfd0e1d7521edc0dc6766b2daf367e769",
            "username": "pifours.eth",
            "display_name": "pifours.eth 👁️ 🇺🇦",
            "pfp_url": "https://i.imgur.com/cXPNTQS.jpg",
            "profile": {
                "bio": {
                    "text": "Web3 builder\n——\n/morpheus",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 2307,
            "following_count": 550,
            "verifications": [
                "0xe06bc5fcfd0e1d7521edc0dc6766b2daf367e769"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0xe06bc5fcfd0e1d7521edc0dc6766b2daf367e769"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "Hope you enjoy our perl collab? \n\nWe have something for you - the first 100 people get a free mint \n\nalso\n\nTeam MORE\n\nhttps://zora.co/collect/base:0x28e7473cad80fdfdb6e517a3ecc78424ba5c5bf1/13/frames",
        "timestamp": "2024-02-27T17:27:22.000Z",
        "embeds": [
            {
                "url": "https://zora.co/collect/base:0x28e7473cad80fdfdb6e517a3ecc78424ba5c5bf1/13/frames?referrer=0xBe3FC886e104904935cfC5f4F32F4CCec06CbA79"
            }
        ],
        "frames": [
            {
                "version": "vNext",
                "title": "Perl Special Edition",
                "image": "https://zora.co/api/thumbnail/8453/0x28e7473cad80fdfdb6e517a3ecc78424ba5c5bf1/13",
                "buttons": [
                    {
                        "index": 1,
                        "title": "View on Zora",
                        "action_type": "post_redirect"
                    },
                    {
                        "index": 2,
                        "title": "Mint",
                        "action_type": "post"
                    }
                ],
                "input": {},
                "post_url": "https://zora.co/api/farcaster/frameHandler",
                "frames_url": "https://zora.co/collect/base:0x28e7473cad80fdfdb6e517a3ecc78424ba5c5bf1/13/frames?referrer=0xBe3FC886e104904935cfC5f4F32F4CCec06CbA79"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 334818,
                    "fname": "ballid13"
                },
                {
                    "fid": 19067,
                    "fname": "ymy"
                }
            ],
            "recasts": [
                {
                    "fid": 334818,
                    "fname": "ballid13"
                },
                {
                    "fid": 19067,
                    "fname": "ymy"
                }
            ]
        },
        "replies": {
            "count": 40
        },
        "mentioned_profiles": []
    },
    {
        "object": "cast",
        "hash": "0xbe20b24f7961113a46e0df637465ef0a320fd581",
        "thread_hash": "0xbe20b24f7961113a46e0df637465ef0a320fd581",
        "parent_hash": null,
        "parent_url": "chain://eip155:7777777/erc721:0x4f86113fc3e9783cf3ec9a552cbb566716a57628",
        "root_parent_url": "chain://eip155:7777777/erc721:0x4f86113fc3e9783cf3ec9a552cbb566716a57628",
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 2,
            "custody_address": "0x4114e33eb831858649ea3702e1c9a2db3f626446",
            "username": "v",
            "display_name": "Varun Srinivasan",
            "pfp_url": "https://i.seadn.io/gae/sYAr036bd0bRpj7OX6B-F-MqLGznVkK3--DSneL_BT5GX4NZJ3Zu91PgjpD9-xuVJtHq0qirJfPZeMKrahz8Us2Tj_X8qdNPYC-imqs?w=500&auto=format",
            "profile": {
                "bio": {
                    "text": "Technowatermelon. Elder Millenial. Building Farcaster. \n\nnf.td/varun",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 142332,
            "following_count": 1129,
            "verifications": [
                "0x91031dcfdea024b4d51e775486111d2b2a715871",
                "0x182327170fc284caaa5b1bc3e3878233f529d741",
                "0xf86a7a5b7c703b1fd8d93c500ac4cc75b67477f0"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0x91031dcfdea024b4d51e775486111d2b2a715871",
                    "0x182327170fc284caaa5b1bc3e3878233f529d741",
                    "0xf86a7a5b7c703b1fd8d93c500ac4cc75b67477f0"
                ],
                "sol_addresses": [
                    "9t92xZy9q5SyfKBH4rZwEDFXjaZKgzj5PgviPhKtBjyy"
                ]
            },
            "active_status": "active"
        },
        "text": "The Frame Transactions spec is ready for feedback! \n\nPlease share your thoughts in replies, comments or DMs. Your feedback is very important to help us get the design right.\n\nhttps://www.notion.so/warpcast/Frames-Transactions-Public-Draft-c2e0d3210d684b4cb7803de1810db36d?pm=c",
        "timestamp": "2024-02-27T05:25:09.000Z",
        "embeds": [
            {
                "url": "https://www.notion.so/warpcast/Frames-Transactions-Public-Draft-c2e0d3210d684b4cb7803de1810db36d?pm=c"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 324919,
                    "fname": "3xpl0i7"
                },
                {
                    "fid": 18570,
                    "fname": "qt"
                }
            ],
            "recasts": [
                {
                    "fid": 324919,
                    "fname": "3xpl0i7"
                },
                {
                    "fid": 12031,
                    "fname": "sanjay"
                }
            ]
        },
        "replies": {
            "count": 74
        },
        "mentioned_profiles": []
    },
    {
        "object": "cast",
        "hash": "0x624f238854a78731b5ba15f6525cc1cb2cbe2c8e",
        "thread_hash": "0x624f238854a78731b5ba15f6525cc1cb2cbe2c8e",
        "parent_hash": null,
        "parent_url": null,
        "root_parent_url": null,
        "parent_author": {
            "fid": null
        },
        "author": {
            "object": "user",
            "fid": 5650,
            "custody_address": "0xadd746be46ff36f10c81d6e3ba282537f4c68077",
            "username": "vitalik.eth",
            "display_name": "Vitalik Buterin",
            "pfp_url": "https://i.imgur.com/IzJxuId.jpg",
            "profile": {
                "bio": {
                    "text": "hullo",
                    "mentioned_profiles": []
                }
            },
            "follower_count": 154797,
            "following_count": 72,
            "verifications": [
                "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
            ],
            "verified_addresses": {
                "eth_addresses": [
                    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
                ],
                "sol_addresses": []
            },
            "active_status": "active"
        },
        "text": "This is amazing.\n\nIdeally restaurants would just price using AMM curves.\n\nhttps://twitter.com/MorePerfectUS/status/1762251031910728069",
        "timestamp": "2024-02-27T00:09:54.000Z",
        "embeds": [
            {
                "url": "https://twitter.com/MorePerfectUS/status/1762251031910728069"
            }
        ],
        "reactions": {
            "likes": [
                {
                    "fid": 361782,
                    "fname": "jubayer"
                },
                {
                    "fid": 316167,
                    "fname": "fots"
                }
            ],
            "recasts": [
                {
                    "fid": 372242,
                    "fname": "f4b1nh0"
                },

                {
                    "fid": 263980,
                    "fname": "mangwa"
                }
            ]
        },
        "replies": {
            "count": 94
        },
        "mentioned_profiles": []
    }
]





































































































































{
    "casts": [
        {
            "object": "cast",
            "hash": "0xa6d68f700679e62232e087af5b3c839d63c553ec",
            "thread_hash": "0xa6d68f700679e62232e087af5b3c839d63c553ec",
            "parent_hash": null,
            "parent_url": "https://onchainsummer.xyz",
            "root_parent_url": "https://onchainsummer.xyz",
            "parent_author": {
                "fid": null
            },
            "author": {
                "object": "user",
                "fid": 12142,
                "custody_address": "0x04e6f111ebf6fd25576d480480962435dc3aa8d8",
                "username": "base",
                "display_name": "Base",
                "pfp_url": "https://i.imgur.com/7Q0QBrm.jpg",
                "profile": {
                    "bio": {
                        "text": "base.org",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 39112,
                "following_count": 32,
                "verifications": [
                    "0x9652721d02b9db43f4311102820158abb4ecc95b"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0x9652721d02b9db43f4311102820158abb4ecc95b"
                    ],
                    "sol_addresses": []
                },
                "active_status": "active"
            },
            "text": "\"i was there when base beat  /perl\"\n\nfree boosted mint, open for TONIGHT ONLY. give us your likes - jesse\n\nhttps://zora.co/collect/base:0xc5183533f98aa1520e6eff0c4b184c8b2c1b781e/3/frames",
            "timestamp": "2024-02-28T02:30:09.000Z",
            "embeds": [
                {
                    "url": "https://zora.co/collect/base:0xc5183533f98aa1520e6eff0c4b184c8b2c1b781e/3/frames?referrer=0xBe3FC886e104904935cfC5f4F32F4CCec06CbA79"
                }
            ],
            "frames": [
                {
                    "version": "vNext",
                    "title": "I was there when @base beat /perl",
                    "image": "https://zora.co/api/thumbnail/8453/0xc5183533f98aa1520e6eff0c4b184c8b2c1b781e/3",
                    "image_aspect_ratio": "1:1",
                    "buttons": [
                        {
                            "index": 1,
                            "title": "View on Zora",
                            "action_type": "post_redirect"
                        },
                        {
                            "index": 2,
                            "title": "Mint",
                            "action_type": "post"
                        }
                    ],
                    "input": {},
                    "state": {},
                    "post_url": "https://zora.co/api/farcaster/frameHandler",
                    "frames_url": "https://zora.co/collect/base:0xc5183533f98aa1520e6eff0c4b184c8b2c1b781e/3/frames?referrer=0xBe3FC886e104904935cfC5f4F32F4CCec06CbA79"
                }
            ],
            "reactions": {
                "likes": [
                    {
                        "fid": 293719,
                        "fname": "mstublefield"
                    },
                    {
                        "fid": 269743,
                        "fname": "sylvanus"
                    }
                ],
                "recasts": [
                    {
                        "fid": 326021,
                        "fname": "zhiyad29"
                    },
                    {
                        "fid": 327958,
                        "fname": "hifikun"
                    }
                ]
            },
            "replies": {
                "count": 800
            },
            "mentioned_profiles": []
        },
        {
            "object": "cast",
            "hash": "0x82932769cc3926d82686da4008b7c9fe39835463",
            "thread_hash": "0x82932769cc3926d82686da4008b7c9fe39835463",
            "parent_hash": null,
            "parent_url": "https://warpcast.com/~/channel/frames",
            "root_parent_url": "https://warpcast.com/~/channel/frames",
            "parent_author": {
                "fid": null
            },
            "author": {
                "object": "user",
                "fid": 348788,
                "custody_address": "0xcf4c4bd6468fbc1a4cff7d59c13fecc3facb7bc1",
                "username": "basemint",
                "display_name": "Basemint.tech",
                "pfp_url": "https://i.imgur.com/9pLnI8s.jpg",
                "profile": {
                    "bio": {
                        "text": "Where Creators and Fans go Deep.\n\n2x Base grant winner.\nFinalist - Backdrop Build v2\nAward - Bubblecon 2023",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 6424,
                "following_count": 74,
                "verifications": [
                    "0xcf31628b672f2eb1f9ad0be3369bac4e33813544"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0xcf31628b672f2eb1f9ad0be3369bac4e33813544"
                    ],
                    "sol_addresses": []
                },
                "active_status": "active"
            },
            "text": "Limited Mint of ''Savage''\n\nPlease like, recast and follow to mint.\n\nCreated and casted with nocode via @basemint ",
            "timestamp": "2024-02-27T23:49:42.000Z",
            "embeds": [
                {
                    "url": "https://basemint.tech/fc/basemint-tech"
                }
            ],
            "frames": [
                {
                    "version": "vNext",
                    "title": "Basemint.",
                    "image": "https://hcti.io/v1/image/7c10f5c0-af4a-413b-88ea-8ac67d2a30ef",
                    "buttons": [
                        {
                            "index": 1,
                            "title": "Mint",
                            "action_type": "post"
                        }
                    ],
                    "input": {},
                    "post_url": "https://basemint.bubbleapps.io/api/1.1/wf/f_endpoint",
                    "frames_url": "https://basemint.tech/fc/basemint-tech"
                }
            ],
            "reactions": {
                "likes": [
                    {
                        "fid": 230572,
                        "fname": "chusla"
                    },
                    {
                        "fid": 256872,
                        "fname": "harymage"
                    }
                ],
                "recasts": [
                    {
                        "fid": 255818,
                        "fname": "masr08"
                    },
                    {
                        "fid": 256872,
                        "fname": "harymage"
                    }
                ]
            },
            "replies": {
                "count": 76
            },
            "mentioned_profiles": [
                {
                    "object": "user",
                    "fid": 348788,
                    "custody_address": "0xcf4c4bd6468fbc1a4cff7d59c13fecc3facb7bc1",
                    "username": "basemint",
                    "display_name": "Basemint.tech",
                    "pfp_url": "https://i.imgur.com/9pLnI8s.jpg",
                    "profile": {
                        "bio": {
                            "text": "Where Creators and Fans go Deep.\n\n2x Base grant winner.\nFinalist - Backdrop Build v2\nAward - Bubblecon 2023",
                            "mentioned_profiles": []
                        }
                    },
                    "follower_count": 6424,
                    "following_count": 74,
                    "verifications": [
                        "0xcf31628b672f2eb1f9ad0be3369bac4e33813544"
                    ],
                    "verified_addresses": {
                        "eth_addresses": [
                            "0xcf31628b672f2eb1f9ad0be3369bac4e33813544"
                        ],
                        "sol_addresses": []
                    },
                    "active_status": "active"
                }
            ]
        },
        {
            "object": "cast",
            "hash": "0x09d4445d8e52933d38688935fbd4970c20a3af52",
            "thread_hash": "0x09d4445d8e52933d38688935fbd4970c20a3af52",
            "parent_hash": null,
            "parent_url": "https://onchainsummer.xyz",
            "root_parent_url": "https://onchainsummer.xyz",
            "parent_author": {
                "fid": null
            },
            "author": {
                "object": "user",
                "fid": 2099,
                "custody_address": "0x7ab82b13992e38462f50df7065256071204099e5",
                "username": "yuga",
                "display_name": "yuga.eth",
                "pfp_url": "https://lh3.googleusercontent.com/yYG-UACyc9nJeZf0Kuoeb1MzX3vmdOCQZ2X4XUHd5BwyS2a8ft5FkLFeUpWgG5V7ItGsa4TT9gsnpCvnHBVVpsH4OmtTGJHhxFJbAQ",
                "profile": {
                    "bio": {
                        "text": "Crypto @ Coinbase. yugacohler.twitter",
                        "mentioned_profiles": []
                    }
                },
                "follower_count": 20412,
                "following_count": 124,
                "verifications": [
                    "0xd8ddbfd00b958e94a024fb8c116ae89c70c60257"
                ],
                "verified_addresses": {
                    "eth_addresses": [
                        "0xd8ddbfd00b958e94a024fb8c116ae89c70c60257"
                    ],
                    "sol_addresses": []
                },
                "active_status": "active"
            },
            "text": "The yuga.eth OG NFT airdrop is here! My first 25,000 followers will be able to mint. Thank you for your patience.\n\nI'll periodically need to refill the minting wallet with Base Sepolia ETH, and the RPC may be rate limited, so it may be bumpy.\n\nPlease enjoy 💙 \n\nhttps://og-nft-ten.vercel.app/",
            "timestamp": "2024-02-27T21:27:17.000Z",
            "embeds": [
                {
                    "url": "https://og-nft-ten.vercel.app/"
                }
            ],
            "frames": [
                {
                    "version": "vNext",
                    "title": "yuga.eth NFT",
                    "image": "https://og-nft-ten.vercel.app/intro.webp",
                    "buttons": [
                        {
                            "index": 1,
                            "title": "Mint",
                            "action_type": "post"
                        }
                    ],
                    "input": {
                        "text": "Mint your yuga.eth NFT!"
                    },
                    "post_url": "https://og-nft-ten.vercel.app/api/frame",
                    "frames_url": "https://og-nft-ten.vercel.app/"
                }
            ],
            "reactions": {
                "likes": [
                    {
                        "fid": 366868,
                        "fname": "fluxfelix"
                    },
                    {
                        "fid": 192649,
                        "fname": "vietnamgov.eth"
                    }
                ],
                "recasts": [
                    {
                        "fid": 366872,
                        "fname": "saktihash"
                    },
                    {
                        "fid": 236412,
                        "fname": "safiudinzz"
                    }
                ]
            },
            "replies": {
                "count": 118
            },
            "mentioned_profiles": []
        }
    ],
    "next": {
        "cursor": "eyJ0aW1lc3RhbXAiOiIyMDI0LTAyLTI3IDIxOjI3OjE3LjAwMDAwMDAiLCJwb2ludHMiOiI0NjY1In0="
    }
}