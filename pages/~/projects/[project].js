import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import projectData from '../../../data/dummyFarcasterData.json'
import onchainData from '../../../data/dummyOnchainData.json'
import { Swords, CoinBag, CoinStack, Waste, AbundanceStar, FeedbackLoop, Like, Recast, Message, Kebab, Warp, ActiveUser } from '../../assets'
import { FaRegStar } from "react-icons/fa"
import useStore from '../../../utils/store';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints'; 
import { IoMdArrowDropdown as Dropdown } from "react-icons/io";
import { BsPatchCheckFill as Verified } from "react-icons/bs";
import { BiSolidErrorAlt as Rejected } from "react-icons/bi";

export default function ProposalPage() {
  const router = useRouter();
  const ref = useRef(null)
  const [textMax, setTextMax] = useState('522px')
  const store = useStore()
  const [ screenWidth, setScreenWidth ] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')

  const { project } = router.query;
  const project00 = projectData[0]
  const project01 = projectData[1]
  const project02 = projectData[2]
  const project03 = projectData[3]
  const project04 = projectData[4]
  const project05 = projectData[5]
  const project06 = projectData[6]
  const project07 = projectData[7]
  const project08 = projectData[8]
  const project09 = projectData[9]

  useEffect(() => {
    console.log(project02)
    // console.log(projectData)
    console.log(`Proposal: ${project}`);
  }, [project]);
  
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


  const ProjectData = () => {
    const userButtons = ['Ecosystems', 'Proposals', 'Data', 'Consensus']
    const [ searchSelect, setSearchSelect ] = useState('Casts')
    const { isMobile } = useMatchBreakpoints();


    const goToUserProfile = async (author) => {
      const username = author.username
      await store.setUserData(author)
      console.log(author, store.userData)
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

    const searchOption = (e) => {
      setSearchSelect(e.target.getAttribute('name'))
    }


    const SearchOptionButton = (props) => {
      const btn = props.buttonName
      let isSearchable = true
      let comingSoon = false
      if (props.buttonName == 'Users' && !store.isAuth) {
        isSearchable = false
      }
      if (props.buttonName == 'Casts' || props.buttonName == 'Channels') {
        comingSoon = true
      }
  
      return isSearchable ? (<>{comingSoon ? (<div className='flex-row' style={{position: 'relative'}}><div className={(searchSelect == btn) ? 'active-nav-link-lt btn-hvr-lt lock-btn-hvr-lt' : 'nav-link-lt btn-hvr-lt lock-btn-hvr-lt'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '12px' : '15px'}}>{btn}</div>
        <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(20%, -50%)' }}>
          <div className='soon-btn'>SOON</div>
        </div>
      </div>) : (
        <div className={(searchSelect == btn) ? 'active-nav-link-lt btn-hvr-lt flex-row' : 'nav-link-lt btn-hvr-lt flex-row'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px 5px 5px', borderRadius: '14px', fontSize: isMobile ? '12px' : '15px'}}><Dropdown size={18} /><div> {btn} </div></div>)}</>
      ) : (
        <div className='flex-row' style={{position: 'relative'}}>
          <div className='lock-btn-hvr-lt' name={btn} style={{color: '#bbb', fontWeight: '600', padding: '5px 14px', borderRadius: '14px', cursor: 'pointer', fontSize: isMobile ? '12px' : '15px'}} onClick={account.LoginPopup}>{btn}</div>
          <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-20%, -50%)' }}>
            <FaLock size={8} color='#999' />
          </div>
        </div>
      )
    }


    const ProjectPanel = (props) => {

      const shortenAddress = (input) => {
        const parts = input.split(':');
        const address = parts[2].substring(2);
        const shortenedAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
        return shortenedAddress;
      }


      const data = props.projectData
      // let isSearchable = true
      // let comingSoon = false
      if (props.buttonName == 'Users' && !store.isAuth) {
        isSearchable = false
      }
      if (props.buttonName == 'Casts' || props.buttonName == 'Channels') {
        comingSoon = true
      }
  
      return (
        <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem'}}>
          <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#eee'}}>
            <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
              <div className="flex-col">
                <div style={{fontSize: '12px', fontWeight: '500', color: '#888'}}>Pending</div>
                <div style={{fontSize: '13px', color: '#888'}}>$52.4k</div>
              </div>
              {/* <Verified color={'#32b439'} size={25} /> */}
            </div>
          </div>

          <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#eee'}}>
            <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
              <div className="flex-col">
                <div style={{fontSize: '12px', fontWeight: '500'}}>Earned</div>
                <div style={{fontSize: '13px'}}>$12.5k</div>
              </div>
              {/* <Verified color={'#32b439'} size={25} /> */}
            </div>
          </div>

          <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#eee'}}>
            <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
              <div className="flex-col">
                <div style={{fontSize: '12px', fontWeight: '500'}}>Verified</div>
                <div style={{fontSize: '13px'}}>{shortenAddress(project02.frames[0].buttons[1].target)}</div>
              </div>
              <Verified color={'#32b439'} size={24} />
            </div>
          </div>
        </div>
      )
    }




    return (
      <div className="inner-container flex-col" style={{width: '100%'}}>
        <div className="top-layer flex-row" style={{padding: '0px 0 10px 0', alignItems: 'center', justifyContent: 'end', margin: '0'}}>
          <ProjectPanel />
        </div>
        <div>
          <div>
            <div className="">
              <div className="">
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`https://warpcast.com/${project02.author.username}`}>
                      <img loading="lazy" src={project02.author.pfp_url} className="" alt={`${project02.author.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: 'auto', gap: '0.5rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <span className="" data-state="closed">
                          <a className="fc-lnk" title="" style={{cursor: 'pointer'}} onClick={() => {goToUserProfile(project02.author)}}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font">{project02.author.display_name}</span>
                              <div className="" style={{margin: '0 0 0 3px'}}>
                                {(project02.author.active_status == 'active' && 1 == 2) && (<ActiveUser />)}
                              </div>
                            </div>
                          </a>
                        </span>
                        <span className="user-font" datastate="closed">
                          <a className="fc-lnk" title="" href={`https://warpcast.com/${project02.author.username}`}>@{project02.author.username}</a>
                        </span>
                        <div className="">·</div>
                        <a className="fc-lnk" title="Navigate to cast" href={`https://warpcast.com/${project02.author.username}/${project02.hash.slice(0,10)}`}>
                          <div className="user-font">{timePassed(project02.timestamp)}</div>
                        </a>
                      </div>
                      <div className="">
                        <Kebab />
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax}}>{project02.text}</div>
                      {(project02.embeds.length > 0) && (project02.embeds.map((embed, subindex) => (
                      <div className='flex-col' style={{alignItems: 'center'}}>
                        {(embed.type && embed.type == 'img') && (
                          <div className="" key={`${index}-${subindex}`}>
                            <div className="flex-col" style={{position: 'relative'}}>
                              <img 
                                loading="lazy" 
                                src={embed.url} 
                                alt="Cast image embed" 
                                style={{aspectRatio: '0.75 / 1', 
                                  maxWidth: textMax, 
                                  maxHeight: '500px', 
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
                    {(typeof project02.channelName !== 'undefined') && (
                      <div className="flex-row" style={{border: '1px solid #666', padding: '2px 4px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                        <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                          <img loading="lazy" src={project02.channelImg} className="" alt="Channel image" style={{width: '17px', height: '17px', minWidth: '17px', minHeight: '17px', borderRadius: '3px'}} />
                          <span className="channel-font">{project02.channelName}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                      <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                        <div className="">
                          <Message />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{project02.replies.count}</span>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div className='flex-row recast-btn' onClick={() => postRecast(project02.hash)}>
                          <div className="">
                            <Recast />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{project02.reactions.recasts.length}</span>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1}}>
                        <div className='flex-row like-btn' onClick={() => postLike(project02.hash)}>
                          <div className="">
                            <Like />
                          </div>
                          <span className="" style={{padding: '0 0 0 5px'}}>{project02.reactions.likes.length}</span>
                        </div>
                      </div>
                      <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                        <div className="" style={{padding: '2px 0 0 0px'}}>
                          <FaRegStar />
                        </div>
                        <span style={{padding: '0 0 0 5px'}}>{project02.impact && (`${project02.impact}`)}</span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
        <div className="top-layer flex-row" style={{padding: '20px 0 0px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0'}}>
          { userButtons.map((btn, index) => (
            <SearchOptionButton buttonName={btn} key={index} /> ))}
        </div>
      </div>)
    }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { (project00) && <ProjectData/> }
      {/* <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '1px solid #888'}}>
        { userButtons.map((btn, index) => (
          <SearchOptionButton buttonName={btn} key={index} /> ))}
      </div> */}
    </div>
  );
}