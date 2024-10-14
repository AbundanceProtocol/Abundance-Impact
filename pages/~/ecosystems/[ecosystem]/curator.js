import Head from 'next/head';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../../../../context'
import Link from 'next/link'
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints'
// import useStore from '../../utils/store'
import axios from 'axios';
// import { FaPen, FaPlus } from "react-icons/fa"
import { useRouter } from 'next/router';
// import { formatNum, isAlphanumeric, getToken, getChain } from '../../utils/utils';
// import Spinner from '../../components/Common/Spinner';
// import Button from '../../components/Ecosystem/Button';
// import Description from '../../components/Ecosystem/Description';
// import InputField from '../../components/Ecosystem/InputField';
// import Dropdown from '../../components/Ecosystem/Dropdown';
// import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import Modal from '../../../../components/Layout/Modals/Modal';
// import Checkbox from '../../components/Ecosystem/Checkbox';
import Spinner from '../../../../components/Common/Spinner';
import { BsClock } from "react-icons/bs";


export default function Ecosystem() {
  const ref = useRef(null)
  const { isMobile } = useMatchBreakpoints();
  const { points } = useContext(AccountContext)
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [screenHeight, setScreenHeight] = useState(undefined)
  // const store = useStore()
  const [textMax, setTextMax] = useState('562px')
  const [feedMax, setFeedMax ] = useState('620px')
  const [curators, setCurators] = useState(null)
  const router = useRouter()
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  // const [jobScheduled, setJobScheduled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ecoPoints, setEcoPoints] = useState(null)
  const [timeframe, setTimeframe] = useState('24h')
  const [page, setPage] = useState(1)
  const { ecosystem } = router.query;

  useEffect(() => {
    // const { trigger } = router.query;
    console.log('points', points, page)
    setTimeframe('24h')
    if (points) {
      setEcoPoints(points)
    } else {
      setEcoPoints('$IMPACT')
    }
    console.log(router)
    // if (trigger === 'createEcosystem') {
    //   setupEcosystem('start');
    // }
  }, [router.query]);


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
    if (ecoPoints) {
      console.log('eco1')
      getCurators(ecoPoints, timeframe, 1)
    }
  }, [ecoPoints])

  useEffect(() => {
    if (ecoPoints) {
      console.log('time1')
      getCurators(ecoPoints, timeframe, 1)
    }
  }, [timeframe])


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


  // function setupEcosystem(target) {
    
  // }


  async function getCurators(points, time, page) {
    console.log(points, time)
    // const points = '$IMPACT'
    try {
      const response = await axios.get('/api/curation/getEcoCurators', {
        params: { points, time, page } })
      if (response?.data?.topCurators?.length > 0 || curators) {
        const curatorData = response?.data?.topCurators
        console.log(curatorData)
        if (page > 1) {
          let combinedCurators = curators.concat(curatorData)
          console.log(combinedCurators)
          setCurators((prevUserFeed) => prevUserFeed.concat(curatorData))
        } else {
          setCurators(curatorData)
        }
        setPage(page+1)
      } else {
        console.log('1')
        setPage(1)
        setCurators([])
      }
      setLoaded(true)
    } catch (error) {
      console.error('Error submitting data:', error)
      setLoaded(true)
      setPage(1)
      setCurators([])
    }
  }

  function updateTime(time) {
    setLoaded(false)
    setPage(1)
    setCurators([])
    setTimeframe(time)
  }

  function updatePage(getPage) {
    setPage(getPage)
    getCurators(ecoPoints, timeframe, getPage)
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
      <p className='' style={{padding: '10px', color: '#fff', fontWeight: '700', fontSize: '20px'}}>Ecosystem Curators </p>
    </div>
    {/* <Description {...{show: true, text: 'Ecosystem Curators', padding: '30px 0 4px 10px'}} /> */}

    <div className='flex-row' style={{height: '30px', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
      <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
        <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>TIME</div>
        <div className={timeframe == '24h' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('24h')}}>24hr</div>
        <div className={timeframe == '3d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('3d')}}>3d</div>
        <div className={timeframe == '7d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('7d')}}>7d</div>
        <div className={timeframe == '30d' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('30d')}}>30d</div>
        <div className={timeframe == 'all' ? 'filter-item-on' : 'filter-item'} onClick={() => {updateTime('all')}}>all</div>
      </div>
    </div>


    <div className='flex-row' style={{padding: '10px 0 0 0', flexWrap: 'wrap', minWidth: feedMax, gap: '0.5rem', justifyContent: 'center'}}>
      {curators?.length > 0 ? curators.map((curator, index) => { return (
        <Link key={index} href={`/~/ecosystems/${ecosystem}/curator/${curator?.username}`}>
          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <img loading="lazy" src={curator?.author_pfp} className="" alt={`${curator?.author_name} avatar`} style={{width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '24px', border: '1px solid #000'}} />
            <div style={{fontSize: '18px', fontWeight: '400', color: '#eff'}}>@{curator?.username}</div>
          </div>
        </Link>
      )}) : (
        <>
          {!loaded ? (<div className='flex-row' style={{height: '100%', alignItems: 'center', width: '100%', justifyContent: 'center', padding: '20px'}}>
            <Spinner size={31} color={'#999'} />
          </div>) : (<div style={{fontSize: '20px', color: '#def'}}>No curators found</div>)}
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
