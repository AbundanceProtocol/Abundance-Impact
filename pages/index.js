import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../context'
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer'
import ExpandImg from '../components/Cast/ExpandImg';
import Modal from '../components/Layout/Modals/Modal';
import Item from '../components/Ecosystem/ItemWrap/Item';
import Description from '../components/Ecosystem/Description';
import ItemWrap from '../components/Ecosystem/ItemWrap';
import useMatchBreakpoints from '../hooks/useMatchBreakpoints';
import { FaLock, FaUser, FaGlobe, FaPlus, FaRegStar, FaCoins, FaAngleDown, FaShareAlt as Share } from "react-icons/fa";
import { HiOutlineAdjustmentsHorizontal as Adjust } from "react-icons/hi2";
import { GrSchedulePlay as Sched } from "react-icons/gr";
import { BiSolidDonateHeart as Donate } from "react-icons/bi";
import { AiFillSafetyCertificate as Aligned } from "react-icons/ai";
import { GiRibbonMedal as Medal } from "react-icons/gi";
import { MdAdminPanelSettings as Mod } from "react-icons/md";
import { FaArrowTrendUp as Grow } from "react-icons/fa6";
import { RiVerifiedBadgeFill as Quality } from "react-icons/ri";
import LoginButton from '../components/Layout/Modals/FrontSignin';
import EcosystemMenu from '../components/Layout/EcosystemNav/EcosystemMenu';
import { IoInformationCircleOutline as Info } from "react-icons/io5";
import { PiSquaresFourLight as Actions } from "react-icons/pi";
import { Logo } from './assets';


export default function Home() {
  const ref2 = useRef(null)
  const [ref, inView] = useInView()
  const { LoginPopup, ecoData, points, setPoints, isLogged, showLogin, setShowLogin, setIsLogged, setFid } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [showPopup, setShowPopup] = useState({open: false, url: null})
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints();
  const [display, setDisplay] = useState({personal: false, ecosystem: false})

  function toggleMenu(target) {
    setDisplay(prev => ({...prev, [target]: !display[target] }))
  }

  const createEcosystem = () => {
    router.push({
      pathname: '/~/ecosystems',
      query: { trigger: 'createEcosystem' }
    });
  };

  const lockedSelect = () => {
    console.log('eab')
    event.preventDefault()
    LoginPopup()
  };

  const handleSignIn = async (loginData) => {
    setFid(loginData.fid)
    setIsLogged(true)
    setShowLogin(false)
  };

  useEffect(() => {
    console.log('triggered')

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


  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`562px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 120}px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 10}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])


  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref2}>
    <Head>
      <title>Impact App | Abundance Protocol</title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div style={{padding: isMobile ? '58px 0 20px 0' : '58px 0 60px 0', width: feedMax}}>
    </div>

    <div style={{padding: '0px 4px 80px 4px', width: feedMax}}>

      <div className='flex-col' style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <Logo className='rotate' height={isMobile ? '95px' : '165px'} width={isMobile ? '95px' : '165px'} style={{fill: '#9ce'}} />
        <Description {...{show: true, text: '/impact', padding: '30px 0 14px 5px', size: 'title'}} />

        <div className='flex-row' style={{color: '#ace', width: '100%', fontSize: isMobile ? '24px' : '33px', padding: '0px 10px 35px 10px', textAlign: 'center', justifyContent: 'center'}}>boost & reward creators on farcaster</div>

        <div className='flex-row' style={{color: '#ace', width: '95%', fontSize: isMobile ? '17px' : '22px', padding: '10px 10px 25px 10px', textAlign: 'center', fontWeight: '400'}}><p>/impact aims to accelerate Farcaster&apos;s transition from an <strong>Attention Economy</strong> to a <strong>Creation Economy</strong></p></div>

        <div className='flex-row' style={{color: '#8ac', width: '90%', fontSize: isMobile ? '14px' : '18px', padding: '0px 10px 5px 10px', textAlign: 'center', fontWeight: '400', justifyContent: 'center'}}>Currently building (alpha):</div>

        <div className='flex-row' style={{gap: '0.75rem', margin: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>
          <div onClick={() => document.getElementById('personal').scrollIntoView({ behavior: 'smooth' })}>
            <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
              <FaUser size={14} />
              <p style={{padding: '0px', fontSize: '15px', fontWeight: '500', textWrap: 'nowrap'}}>Personal /impact</p>
            </div>
          </div>

          <div onClick={() => document.getElementById('ecosystem').scrollIntoView({ behavior: 'smooth' })}>
            <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
              <FaGlobe size={14} />
              <p style={{padding: '0px', fontSize: '15px', fontWeight: '500', textWrap: 'nowrap'}}>Ecosystem /impact</p>
            </div>
          </div>
        </div>

        <div className={isMobile ? 'flex-col' : 'flex-row'} style={{alignItems: 'center', gap: '1.5rem'}}>
          <div className='flex-row' style={{color: '#579', width: isMobile ? '90%' : '50%', fontSize: isMobile ? '14px' : '15px', padding: isMobile ? '40px 10px 15px 10px' : '60px 10px 75px 10px', textAlign: 'center', fontWeight: '400'}}><p>In an <strong style={{color: '#8bf'}}>Attention Economy</strong> you build or create content or art, and then try to get attention for your work. The better you are at getting attention the more successful you are.</p></div>

          <div className='flex-row' style={{color: '#68a', width: isMobile ? '90%' : '50%', fontSize: isMobile ? '14px' : '15px', padding: isMobile ? '0px 10px 65px 10px' : '60px 10px 75px 10px', textAlign: 'center', fontWeight: '400'}}><p>In a <strong style={{color: '#8bf'}}>Creation Economy</strong> users seek to fairly value your work in an Impact Market. More impact means more success, curators get rewarded for their effort, and the ecosystem grows</p></div>
        </div>


        {!isLogged && (<>
          <div>
            {showLogin ? (
              <div className='frnt-nynr-btn' style={{color: 'white', fontSize: '18px', font: 'Ariel', textAlign: 'center', padding: '12px 12px 12px 32px', fontWeight: '600'}}>Connect Farcaster</div>
            ) : (
              <LoginButton onSignInSuccess={handleSignIn} />
            )}
          </div>
          <div className='flex-row' style={{color: '#59b', width: isMobile ? '75%' : '50%', fontSize: isMobile ? '13px' : '15px', padding: '10px 10px 95px 10px', justifyContent: 'center', textAlign: 'center'}}>/impact needs your permission to create tipping casts and follows on your behalf</div>
        </>)}
      </div>


      <div id="personal" style={{padding: isMobile ? '28px 0 20px 0' : '28px 0 20px 0', width: '40%'}}>
      </div>

      <div style={{padding: '8px', backgroundColor: '#11448888', borderRadius: '15px', border: '1px solid #11447799'}}>
        <div className='flex-row' style={{width: '100%', justifyContent: 'center', alignItems: 'center', padding: '16px 0 0 0'}}>
          <FaUser style={{fill: '#cde'}} size={24} />
          <Description {...{show: true, text: 'Personal /impact', padding: '4px 0 4px 10px', size: 'large' }} />
        </div>

        <div className='flex-row' style={{color: '#9df', width: '100%', fontSize: isMobile ? '15px' : '17px', padding: '10px 10px 15px 10px', justifyContent: 'center'}}>Nominate your favorite creators. Calibrate distribution of tips. Schedule recurring tips or tip throughout the day. Share curation with your friends and earn rewards</div>

        <div className='flex-row' style={{padding: '0px 0 0 0', width: '100%', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>

          <ItemWrap>
            <div className='flex-row' style={{justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} onClick={() => {toggleMenu('personal')}}>
              <Item {...{text: 'How it works'}} />
              <FaAngleDown size={28} style={{margin: '5px 15px 5px 5px', transform: display.personal ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease'}} />
            </div>
            {display.personal && (<>
              <Item {...{description: `1) Connect to Farcaster to enable multi-tipping`}} />
              <Item {...{description: `2) Install Cast Actions (below) `}} />
              <Item {...{description: `3a) Use $IMPACT Cast Actions to nominate your favorite creators, builders, etc.`}} />
              <Item {...{description: `3b) Tips can be weighted by adding more $IMPACT points on a cast`}} />
              <Item {...{description: `4a) Use Multi-tipping Frame to tip any of your token allowances (eg. 1000 $degen 700 $ham)`}} />
              <Item {...{description: `4b) You can also schedule recurring tips on the app`}} />
              <Item {...{description: `5) Share Multi-tipping Frame of your nominations with your friends. You get 10% of all tips`}} />
            </>)}
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Medal, text: 'Nominate', description: 'Nominate your favorite creators with a Cast Action'}} />
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Adjust, text: 'Calibrate', description: 'Tips can be weighted based on a point system'}} />
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Sched, text: 'Auto-tip / Multi-tip', description: `Don't let your allowance go to waste. Schedule recurring tips, or multi-tip your nominees through a frame`}} />
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Share, text: 'Share', description: 'Share tipping frame of your nominations and let your friends tip also. You get 10% of tips'}} />
          </ItemWrap>

          <div className='flex-col' style={{margin: '15px 0 10px 0', gap: '0.25rem', alignItems: 'center'}}>
            <div className='flex-row' style={{alignItems: 'center', gap: '0.5rem'}}>
              <Actions size={28} color={'#9cf'} />
              <div style={{fontSize: isMobile ? '15px' : '18px', fontWeight:'500', color: '#ace'}}>Get Cast Actions:</div>
            </div>
            <div className='flex-row' style={{gap: '0.5rem', margin: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>
              {isLogged ? (<a className="" title={`+1 $IMPACT`} href={`https://warpcast.com/~/add-cast-action?name=%2B1+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
                <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                  <FaRegStar size={14} />
                  <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap'}}>+1 $IMPACT</p>
                </div>
              </a>) : (
                <div className={`flex-row`} onClick={LoginPopup}>
                  <div>
                    <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: '#bbb'}}>
                      <FaRegStar size={14} />
                      <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap', color: '#222'}}>+1 $IMPACT</p>
                    </div>
                  </div>
                  <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                    <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
                      <FaLock size={8} color='#999' />
                    </div>
                  </div>
                </div>
              )}

              {isLogged ? (<a className="" title={`+5 $IMPACT`} href={`https://warpcast.com/~/add-cast-action?name=%2B5+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact5%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
                <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                  <FaRegStar size={14} />
                  <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap'}}>+5 $IMPACT</p>
                </div>
              </a>) : (
                <div className={`flex-row`} onClick={LoginPopup}>
                  <div>
                    <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: '#bbb'}}>
                      <FaRegStar size={14} />
                      <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap', color: '#222'}}>+5 $IMPACT</p>
                    </div>
                  </div>
                  <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                    <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
                      <FaLock size={8} color='#999' />
                    </div>
                  </div>
                </div>
              )}

              {isLogged ? (<a className="" title={`$$IMPACT Balance`} href={`https://warpcast.com/~/add-cast-action?name=%24IMPACT+Stats&icon=info&actionType=post&postUrl=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Faction%2Fbalance?points=IMPACT&description=Get+Cast+Balance+for+Impact+App`} target="_blank" rel="noopener noreferrer">
                <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                  <div style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                  <Info size={14} />
                  <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap'}}>$IMPACT Stats</p>
                  <div style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                </div>
              </a>) : (
                <div className={`flex-row`} onClick={LoginPopup}>
                  <div>
                    <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: '#bbb'}}>
                      <FaRegStar size={14} />
                      <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap', color: '#222'}}>$IMPACT Stats</p>
                      <div style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                    </div>
                  </div>
                  <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                    <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
                      <FaLock size={8} color='#999' />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="ecosystem" style={{padding: '40px 4px 80px 4px', width: feedMax}}>

      <div style={{padding: '8px', backgroundColor: '#335566aa', borderRadius: '15px', border: '1px solid #000'}}>
        <div className='flex-row' style={{width: '100%', justifyContent: 'center', alignItems: 'center', padding: '16px 0 0 0'}}>
          <FaGlobe style={{fill: '#cde'}} size={24} />
          <Description {...{show: true, text: 'Ecosystem /impact', padding: '4px 0 4px 10px', size: 'large' }} />
        </div>

        <div className='flex-row' style={{color: '#9df', width: '100%', fontSize: isMobile ? '15px' : '17px', padding: '10px 10px 15px 10px', justifyContent: 'center'}}>Let your community curate your channel/ecosystem. Ensure quality curation. Reward contributors and curators. Grow your community</div>

        <div className='flex-row' style={{padding: '0px 0 0 0', width: '100%', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>

          <ItemWrap>
            <div className='flex-row' style={{justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} onClick={() => {toggleMenu('ecosystem')}}>
              <Item {...{text: 'How it works'}} />
              <FaAngleDown size={28} style={{margin: '5px 15px 5px 5px', transform: display.ecosystem ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease'}} />
            </div>
            {display.ecosystem && (<>
              <Item {...{description: `1) Connect to Farcaster to enable multi-tipping & Ecosystem creation`}} />
              <Item {...{description: `2) Create Ecosystem with rules, curator eligibility criteria, curator and contributor incentives, etc.`}} />
              <Item {...{description: `3) Install Ecosystem Cast Actions`}} />
              <Item {...{description: `4a) Eligible curators get daily point allowance they can 'stake' on casts thru Cast Actions`}} />
              <Item {...{description: `4b) Curators get % of tips in proportion to 'staked' points`}} />
              <Item {...{description: `4c) Other curators can up/downvote 'staked' casts, which results in increase/decrease to curator's daily allownance, and maintains quality of curation`}} />
              <Item {...{description: `4d) Curator goal is to 'stake' points based on value of cast to the community - this maximizes daily allowance & expected tips`}} />
              <Item {...{description: `5) Curations can be used to moderate channels`}} />
              <Item {...{description: `6) Adjust incentives to promote contributions that better benefit the ecosystem`}} />
            </>)}
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Aligned, text: 'Aligned curators', description: 'Quality curation needs community alignment. Select criteria for who can curate (NFT, token-gating, channel follow, etc.)'}} />
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: FaCoins, text: 'Rewards & Incentives', description: 'Create incentives to drive growth in your channel & ecosystem, maintain curation quality. Curators can get % of tips'}} />
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Quality, text: 'Quality control', description: `Built in incentives & mechanisms to ensure high-quality curation`}} />
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Mod, text: 'Channel mod', description: `Let your curators moderate your channel. Set channel rules, select moderators manually or based on criteria`}} />
          </ItemWrap>

          <ItemWrap>
            <Item {...{icon: Grow, text: 'Grow ecosystem', description: 'Capture and distribute value in your ecosystem.'}} />
          </ItemWrap>

          <div className='flex-col' style={{margin: '15px 0 10px 0', gap: '1rem', alignItems: 'center'}}>

            <div className='flex-row' style={{alignItems: 'center', gap: '0.75rem'}}>
              <div style={{fontSize: isMobile ? '15px' : '18px', fontWeight:'500', color: '#ace'}}>Choose ecosystem:</div>
              {isLogged ? (
                <EcosystemMenu size={'large'} />
              ) : (
                <div className={`flex-row`}>
                  <div onClick={lockedSelect} style={{margin: '0', maxWidth: '237px', width: 'auto'}}>
                    <div style={{backgroundColor: '#334455ee', borderRadius: '16px', padding: '0px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
                      <div className='flex-row' style={{gap: '0.5rem', cursor: 'pointer'}}>
                        <select id="minuteSelect" value={'Select'} style={{backgroundColor: '#bbb', borderRadius: '4px', fontSize: isMobile ? '15px' : '18px', fontWeight: '600', padding: isMobile ?  '4px 1px' : '4px 3px', pointerEvents: 'none', color: '#222'}}>
                          <option key={'Select'} value={'Select'}>
                            {'Select'}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                    <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
                      <FaLock size={8} color='#999' />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isLogged ? (<div onClick={createEcosystem}>
              <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                <div style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                <FaPlus size={14} />
                <p style={{padding: '0px', fontSize: '14px', fontWeight: '500', textWrap: 'nowrap'}}>Create Ecosystem</p>
                <div style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
              </div>
            </div>) : (<div className={`flex-row`} onClick={LoginPopup}>
              <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 4px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: '#bbb'}}>
                <div style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
                <FaPlus size={14} />
                <p style={{padding: '0px', fontSize: '14px', fontWeight: '500', textWrap: 'nowrap', color: '#222'}}>Create Ecosystem</p>
                <div style={{width: '2px', fontSize: '0px'}}>&nbsp;</div>
              </div>
              <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
                  <FaLock size={8} color='#999' />
                </div>
              </div>
            </div>)}
          </div>
        </div>
      </div>
    </div>
    <div ref={ref}>&nbsp;</div>
  </div>
  )
}
