import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import projectData from '../../../data/dummyProject.json'
import onchainData from '../../../data/dummyOnchainData.json'
import { Swords, CoinBag, CoinStack, Waste, AbundanceStar, FeedbackLoop, Like, Recast, Message, Kebab, Warp, ActiveUser } from '../../assets'
import { FaRegStar } from "react-icons/fa"
import useStore from '../../../utils/store';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints'; 
import { IoMdArrowDropdown as Dropdown } from "react-icons/io";
import { BsPatchCheckFill as Verified } from "react-icons/bs";
import { MdError as Rejected } from "react-icons/md";
import { shortenAddress, timePassed, formatNum } from '../../../utils/utils';
import Spinner from '../../../components/Spinner'

export default function ProposalPage() {
  const router = useRouter();
  const ref = useRef(null)
  const [textMax, setTextMax] = useState('495px')
  const store = useStore()
  const [ screenWidth, setScreenWidth ] = useState(undefined)
  const [feedMax, setFeedMax ] = useState('620px')
  const [verified, setVerified] = useState(null)
  const [loading, setLoading] = useState(true)

  const { project } = router.query;
  const projectInfo = projectData[0]


  useEffect(() => {
    console.log(`Proposal: ${projectInfo}`);
  }, [projectInfo]);
  
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
        setTextMax(`495px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 187}px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 137}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])


  const ProjectData = () => {
    const userButtons = ['Resources', 'Data', 'Contributors', 'Influences', 'Ecosystems']
    const [ searchSelect, setSearchSelect ] = useState('Casts')
    const { isMobile } = useMatchBreakpoints();


    // const goToUserProfile = async (author) => {
    //   const username = author.username
    //   await store.setUserData(author)
    //   console.log(author, store.userData)
    //   router.push(`/${username}`)
    // }

    const searchOption = (e) => {
      setSearchSelect(e.target.getAttribute('name'))
    }

    const SearchOptionButton = ({buttonName, size, index, num}) => {
      let count = 0
      const btn = buttonName
      if (btn == 'Resources' && num.resources) {
        count = num.resources.length
      } else if (btn == 'Data' && num.data) {
        count = num.data.length
      } else if (btn == 'Contributors' && num.contributions.contributors) {
        count = num.contributions.contributors.length
      } else if (btn == 'Influences' && num.contributions.sources) {
        count = num.contributions.sources.length
      } else if (btn == 'Proposals' && (num.project_pending || project_earnings)) {
        if (num.project_pending) {
          count += num.project_pending.length
        }
        if (num.project_earnings) {
          count += num.project_earnings.length
        }
      } else if (btn == 'Ecosystems') {
        const allProjects = [...num.project_pending, ...num.project_earnings]
        const uniqueEcosystems = new Set(allProjects.map(project => project.ecosystem))
        count = uniqueEcosystems.size
      }

      const fontSize = size
      let isSearchable = true
      let comingSoon = false
      if (buttonName == 'Users' && !store.isAuth) {
        isSearchable = false
      }
      if (buttonName == 'Casts' || buttonName == 'Channels') {
        comingSoon = true
      }
  
      return isSearchable ? (<>{comingSoon ? (<div key={index} className='flex-row' style={{position: 'relative'}}><div className={(searchSelect == btn) ? 'active-nav-link-lt btn-hvr-lt lock-btn-hvr-lt' : 'nav-link-lt btn-hvr-lt lock-btn-hvr-lt'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '12px' : `${fontSize}px`}}>{(count !== 0) && (count + ' ')}{btn}</div>
        <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(20%, -50%)' }}>
          <div className='soon-btn'>SOON</div>
        </div>
      </div>) : (
        <div className={(searchSelect == btn) ? 'active-nav-link-lt btn-hvr-lt flex-row' : 'nav-link-lt btn-hvr-lt flex-row'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px 5px 5px', borderRadius: '14px', fontSize: isMobile ? '12px' : `${fontSize}px`}}><Dropdown size={18} /><div>{(count !== 0) && (count + ' ')}{btn} </div></div>)}</>
      ) : (
        <div className='flex-row' style={{position: 'relative'}}>
          <div className='lock-btn-hvr-lt' name={btn} style={{color: '#bbb', fontWeight: '600', padding: '5px 14px', borderRadius: '14px', cursor: 'pointer', fontSize: isMobile ? '12px' : `${fontSize}px`}} onClick={account.LoginPopup}>{(count !== 0) && (count + ' ')}{btn}</div>
          <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-20%, -50%)' }}>
            <FaLock size={8} color='#999' />
          </div>
        </div>
      )
    }

    const StatusBtn = ({btn, stage, color}) => {
      return (
        <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#eee'}}>
        <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
          <div className="flex-col">
            <div style={{fontSize: '12px', fontWeight: '500', color: color}}>{btn}</div>
            {/* <div style={{fontSize: '13px', color: color}}>{value}</div> */}
          </div>
          {/* <>
            {(verified == null) ?  null : 
            (loading) ? (<Spinner size={21} color={'#ccc'}></Spinner>) : (verified) ? (<Verified color={'#32b439'} size={25} />) : 
            (!verified) ? (<Rejected color={'red'} size={25} />) : null}
          </> */}
        </div>
      </div>
      )
    }


    const TopPanelBtn = ({text, value, color, verified}) => {
      return (
        <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#eee'}}>
        <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
          <div className="flex-col">
            <div style={{fontSize: '12px', fontWeight: '500', color: color}}>{text}</div>
            <div style={{fontSize: '13px', color: color}}>{value}</div>
          </div>
          <>
            {(verified == null) ?  null : 
            (loading) ? (<Spinner size={21} color={'#ccc'}></Spinner>) : (verified) ? (<Verified color={'#32b439'} size={25} />) : 
            (!verified) ? (<Rejected color={'red'} size={25} />) : null}
          </>
        </div>
      </div>
      )
    }


    const ProjectTopPanel = (props) => {
      const data = props.projectData
      if (props.buttonName == 'Users' && !store.isAuth) {
        isSearchable = false
      }
      if (props.buttonName == 'Casts' || props.buttonName == 'Channels') {
        comingSoon = true
      }
      const pending = projectInfo.project_pending.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.funding;
      }, 0);
      const earned = projectInfo.project_earnings.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.funding;
      }, 0);
      // let funding 
      const funding = projectInfo.project_funding.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.funding;
      }, 0);
      let consensus = projectInfo.contributions.consensus
      let projectHash = projectInfo.hash
      let verified = true
      let text = 'Verified'
      if (verified) {
        text = 'Verified'
      } else {
        text = 'Rejected'
      }

      return (
        <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem', justifyContent: 'space-between', width: '100%'}}>
          <div className="flex-row" style={{margin: '0px 0px', gap: '0.2rem'}}>
            <div className="flex-row" style={{border: '0px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'transparent'}}>
            <div style={{fontSize: '24px', fontWeight: '500', color: '#123'}}>Proposal</div>
            </div>
          <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#eee'}}>
            <div style={{fontSize: '18px', fontWeight: '500', color: '#123'}}>expected</div>
            </div>
            </div>
          <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem'}}>
            <TopPanelBtn text={'Funding'} value={`$${formatNum(funding)}`} color={'#123'} verified={null} />
            {/* <TopPanelBtn text={'Pending'} value={`$${formatNum(pending)}`} color={'#888'} verified={null} /> */}
            {/* <TopPanelBtn text={'Earned'} value={`$${formatNum(earned)}`} color={'green'} verified={null} /> */}
            <TopPanelBtn text={'Cons'} value={'ensus'} color={'#123'} verified={consensus} />
            <TopPanelBtn text={text} value={shortenAddress(projectHash)} color={'#123'} verified={verified} />
          </div>
        </div>
        )
    }


    const ProjectPanel = (props) => {

      const data = props.projectData
      if (props.buttonName == 'Users' && !store.isAuth) {
        isSearchable = false
      }
      if (props.buttonName == 'Casts' || props.buttonName == 'Channels') {
        comingSoon = true
      }
      const pending = projectInfo.project_pending.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.funding;
      }, 0);
      const earned = projectInfo.project_earnings.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.funding;
      }, 0);
      // let funding 
      const funding = projectInfo.project_funding.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.funding;
      }, 0);
      let consensus = projectInfo.contributions.consensus
      let projectHash = projectInfo.hash
      let verified = true
      let text = 'Verified'
      if (verified) {
        text = 'Verified'
      } else {
        text = 'Rejected'
      }

      return (
        <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem', justifyContent: 'space-between', width: '100%'}}>
          <div className="flex-row" style={{margin: '0px 0px', gap: '0.2rem'}}>
            <div className="flex-row" style={{border: '0px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'transparent'}}>
            <div style={{fontSize: '24px', fontWeight: '500', color: '#123'}}>Proposal</div>
            </div>
          <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#eee'}}>
            <div style={{fontSize: '18px', fontWeight: '500', color: '#123'}}>expected</div>
            </div>
            </div>
          <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem'}}>
            <StatusBtn text={'Funding'} value={`$${formatNum(funding)}`} color={'#123'} verified={null} />
            {/* <TopPanelBtn text={'Pending'} value={`$${formatNum(pending)}`} color={'#888'} verified={null} /> */}
            {/* <TopPanelBtn text={'Earned'} value={`$${formatNum(earned)}`} color={'green'} verified={null} /> */}
            <StatusBtn text={'Cons'} value={'ensus'} color={'#123'} verified={consensus} />
            <StatusBtn text={text} value={shortenAddress(projectHash)} color={'#123'} verified={verified} />
          </div>
        </div>
        )
    }


    const StatusPanel = (props) => {

      const data = props.projectData
      if (props.buttonName == 'Users' && !store.isAuth) {
        isSearchable = false
      }
      if (props.buttonName == 'Casts' || props.buttonName == 'Channels') {
        comingSoon = true
      }
      let verified = true
      let text = 'Verified'
      if (verified) {
        text = 'Verified'
      } else {
        text = 'Rejected'
      }

      return (
        <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem', justifyContent: 'space-between', width: '100%'}}>
          <div className="flex-row" style={{border: '0px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: 'transparent'}}>
            <span className="" data-state="closed">
              <div className="flex-row" style={{alignItems: 'center'}}>
                <span className="name-font" style={{fontSize: '20px', color: '#123'}}>{projectInfo.project_title}</span>
              </div>
            </span>
          </div>
        <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem'}}>
          <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
            <span className="user-font" datastate="closed">
              <a className="fc-lnk" title="" href={`https://warpcast.com/${projectInfo.author.username}`}>by @{projectInfo.author.username}</a>
            </span>
            <div className="">·</div>
            <a className="fc-lnk" title="Navigate to cast" href={`https://warpcast.com/${projectInfo.author.username}/${projectInfo.hash.slice(0,10)}`}>
              <div className="user-font">{timePassed(projectInfo.timestamp)}</div>
            </a>
          </div>
        </div>
      </div>
      )
    }

    return (
      <div className="inner-container flex-col" style={{width: '100%'}}>
        <div className="top-layer flex-row" style={{padding: '0px 0 10px 0', alignItems: 'center', justifyContent: 'end', margin: '0'}}>
          <ProjectTopPanel />
        </div>
        <div className="top-layer flex-row" style={{padding: '0px 0 10px 0', alignItems: 'center', justifyContent: 'end', margin: '0'}}>
          <StatusPanel />
        </div>
        <div className="top-layer flex-row" style={{padding: '0px 0 10px 0', alignItems: 'center', justifyContent: 'end', margin: '0'}}>
          <ProjectPanel />
        </div>
        <div>
          <div>
            <div className="">
              <div className="">
                <div className="flex-row">
                  <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                    <a className="" title="" href={`https://warpcast.com/${projectInfo.author.username}`}>
                      <img loading="lazy" src={projectInfo.project_image} className="" alt={`${projectInfo.author.display_name} avatar`} style={{width: '75px', height: '75px', maxWidth: '75px', maxHeight: '75px', borderRadius: '10px', border: '1px solid #000'}} />
                    </a>
                  </span>
                  <div className="flex-col" style={{width: 'auto', gap: '0.5rem', alignItems: 'flex-start'}}>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax, fontSize: '18px', fontWeight: '500'}}>Summary</div>
                      <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax}}>{projectInfo.text}</div>
                    </div>
                  </div>
                </div>
                <div className="flex-col" style={{width: '100%', gap: '0.5rem', alignItems: 'flex-start', padding: '15px 0 0 0'}}>
                  <div className="">
                    <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: '100%', fontSize: '18px', fontWeight: '500'}}>Description</div>
                    <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: '100%'}}>{projectInfo.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
        <div className="top-layer flex-row" style={{padding: '20px 0 0px 0', alignItems: 'center', justifyContent: 'flex-start', margin: '0', gap: '0.75rem', maxWidth: '620px', flexWrap: 'wrap'}}>
          { userButtons.map((btn, index) => (
            <SearchOptionButton buttonName={btn} size={14} index={index} num={projectInfo} /> ))}
        </div>
        <div className="top-layer flex-row" style={{padding: '25px 0 0px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', flexWrap: 'wrap'}}>
          {/* { userButtons.map((btn, index) => ( */}
            <SearchOptionButton buttonName={'Proposals'} size={18} key={0} num={projectInfo} /> 
        </div>
      </div>)
    }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { (projectInfo) && <ProjectData/> }
    </div>
  );
}