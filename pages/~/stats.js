import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../../context'
import Link from 'next/link'
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints'
// import useStore from '../../utils/store'
import axios from 'axios';
// import { FaPen, FaPlus } from "react-icons/fa"
import { useAppRouter } from '../../hooks/useAppRouter';
import { formatNum, isAlphanumeric, getToken, getChain } from '../../utils/utils';
// import Spinner from '../../components/Common/Spinner';
// import Button from '../../components/Ecosystem/Button';
// import Description from '../../components/Ecosystem/Description';
// import InputField from '../../components/Ecosystem/InputField';
// import Dropdown from '../../components/Ecosystem/Dropdown';
// import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import Modal from '../../components/Layout/Modals/Modal';
// import Checkbox from '../../components/Ecosystem/Checkbox';
import Spinner from '../../components/Common/Spinner';
import { BsClock } from "react-icons/bs";


export default function Curators() {
  const ref = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const { points, fid, autotipping, setAutotipping, isLogged, LoginPopup } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  // const store = useStore()
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [curators, setCurators] = useState(null)
  const router = useAppRouter()
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  // const [jobScheduled, setJobScheduled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // const [ecoPoints, setEcoPoints] = useState(null)
  // const [timeframe, setTimeframe] = useState('24h')
  const [page, setPage] = useState(1)
  const { ecosystem } = router.query;
  const initStats = {activeCurators: 0, uniqueCurators: 0, users: 0, degen: 0, hunt: 0, ham: 0, units: 0, casts: 0, creators: 0, autoTip: 0}
  const [stat, setStat] = useState(initStats)
  const [sched, setSched] = useState({stats: false, setPoints: false})

  
  useEffect(() => {
    if (sched.stats) {
      getSystemStats()
      setSched(prev => ({...prev, stats: false }))
    } else {
      const timeoutId = setTimeout(() => {
        getSystemStats()
        setSched(prev => ({...prev, stats: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [router.query, fid, sched.stats]);


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


  useEffect(() => {
    console.log('e2 triggered')

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


  async function getSystemStats() {
    console.log('trigger getSystemStats')
    try {
      const response = await axios.get('/api/curation/getStats'
        // , { params: { fid } }
      )
      console.log('response', response?.data)
      if (response?.data) {
        const statData = response?.data
        // console.log('userAutotips', userAutotips)
        const degen = statData?.getTips?.find(tip => tip._id === '$degen')?.totalAmount || 0;
        const ham = statData?.getTips?.find((tip) => tip._id === "$tn100x")?.totalAmount || 0;
        const hunt = statData?.getTips?.find((tip) => tip._id === "$hunt")?.totalAmount || 0;
        const units = statData?.getTips?.find((tip) => tip._id === "$units")?.totalAmount || 0;
        setStat({
          activeCurators: statData?.activeCurators || 0,
          uniqueCurators: statData?.uniqueCurator || 0,
          users: statData?.uniqueUsers || 0,
          degen: formatNum(degen),
          ham: formatNum(ham),
          hunt: formatNum(hunt),
          units: formatNum(units),
          casts: statData?.curatedCasts || 0,
          creators: statData?.uniqueCreators || 0,
          uniqueTipped: statData?.uniqueCreatorsTipped || 0,
          autoTip: statData?.autoTips || 0,
        });
      } else {
        setStat(initStats)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setAutotipping([])
    }
  }


  return (
  <div name='feed' style={{width: 'auto', maxWidth: '620px'}} ref={ref}>
    <Head>
      <title>Impact App | Abundance Protocol</title>
      <meta name="description" content={`Building the global superalignment layer`} />
    </Head>
    <div style={{padding: '58px 0 0 0', width: feedMax}}>
    </div>

    <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
      <p className='' style={{padding: '10px', color: '#fff', fontWeight: '700', fontSize: '20px'}}>/impact Stats Dashboard </p>
    </div>
    

    <div className='flex-row' style={{padding: '10px 0 0 0', flexWrap: 'wrap', minWidth: feedMax, gap: '0.5rem', justifyContent: 'center'}}>
      {stat.casts > 0 ? (
        <div className='flex-col' style={{gap: '0.5rem'}}>
          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>Total users: {stat?.users}</div>
          </div>

          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>Total curators: {stat?.uniqueCurators}</div>
          </div>

          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>Super curators: {stat?.activeCurators}</div>
          </div>

          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>Casts curated: {stat?.casts}</div>
          </div>

          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>Creators curated: {stat?.creators}</div>
          </div>

          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>Creators tipped: {stat?.uniqueTipped}</div>
          </div>

          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>Users auto-tipping: {stat?.autoTip}</div>
          </div>

          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff', paddingBottom: '10px'}}>Total tipped thru /impact:</div>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>$degen: {stat?.degen}</div>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>$ham: {stat?.ham}</div>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>$hunt: {stat?.hunt}</div>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>$units: {stat?.units}</div>
          </div>
        </div>
      ) : (
        <>
          {!loaded ? (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
            <Spinner size={31} color={'#999'} />
          </div>) : (<div style={{fontSize: '20px', color: '#def'}}>No stats found</div>)}
        </>
      )}

    </div>

    {(loaded && curators?.length > 0 && curators?.length % 10 == 0) && (<div className='flex-row' style={{height: '30px', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px', margin: '10px 0 50px 0'}}>
      <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
        <div className={'filter-item'} onClick={() => {updatePage(page)}} style={{fontSize: '12px'}}>Load more</div>
      </div>
    </div>)}

    <div style={{margin: '0 0 70px 0'}}></div>
    <Modal modal={modal} />
  </div>
  )
}
