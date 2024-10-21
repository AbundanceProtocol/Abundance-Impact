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
  const router = useRouter()
  const [modal, setModal] = useState({on: false, success: false, text: ''})
  // const [jobScheduled, setJobScheduled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ecoPoints, setEcoPoints] = useState(null)
  const [timeframe, setTimeframe] = useState('24h')
  const [page, setPage] = useState(1)
  const { ecosystem } = router.query;
  const [sched, setSched] = useState({autotip: false, setPoints: false})

  useEffect(() => {
    // const { trigger } = router.query;
    console.log('points', points, page)
    function updatePoints() {
      setTimeframe('24h')
      if (points) {
        setEcoPoints(points)
      } else {
        setEcoPoints('$IMPACT')
      }
    }
    console.log(router)

    if (sched.setPoints) {
      updatePoints()
      setSched(prev => ({...prev, setPoints: false }))
    } else {
      const timeoutId = setTimeout(() => {
        updatePoints()
        setSched(prev => ({...prev, setPoints: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [router.query, sched.setPoints]);


  useEffect(() => {
    console.log('trigger getUserAutotips', fid, autotipping)
    if (sched.autotip) {
      if (fid) {
        getUserAutotips(fid)
      }
      setSched(prev => ({...prev, autotip: false }))
    } else {
      const timeoutId = setTimeout(() => {
        if (fid) {
          getUserAutotips(fid)
        }
        setSched(prev => ({...prev, autotip: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [router.query, fid, sched.autotip]);


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
  async function getUserAutotips(fid) {
    console.log('trigger getAutotipCurators', fid)
    try {
      const response = await axios.get('/api/curation/getAutotipCurators', {
        params: { fid } })
      if (response?.data?.curators?.length > 0 || curators) {
        const userAutotips = response?.data?.curators
        console.log('userAutotips', userAutotips)
        setAutotipping(userAutotips)
      } else {
        setAutotipping([])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setAutotipping([])
    }
  }

  async function removeAutotip(event, curatorFid) {
    event.preventDefault();
    console.log('remove', curatorFid)
    if (!isLogged) {
      LoginPopup()
      return
    } else {
      try {
        const response = await axios.post('/api/curation/removeAutotip', { fid, curators: curatorFid, points });
        console.log(response)
        if (response?.data) {
          let schedCurators = response?.data?.schedule?.search_curators || []
          if (!schedCurators.includes(curatorFid)) {
            setAutotipping(schedCurators);
            console.log(`Added ${curatorFid} to autotipping list`);
          }
        } else {
          console.log('Failed to add curator to autotipping list');
        }
      } catch (error) {
        console.error('Error adding autotip curator:', error);
      }
    }
  }

  async function addAutotip(event, curatorFid) {
    event.preventDefault();
    console.log('add', fid, curatorFid, points)
    if (!isLogged) {
      LoginPopup()
      return
    } else {
      try {
        const response = await axios.post('/api/curation/addAutotip', { fid, curators: curatorFid, points });
        console.log(response)
        if (response?.data) {
          let schedCurators = response?.data?.schedule?.search_curators || []
          if (schedCurators.includes(curatorFid)) {
            setAutotipping(prevAutotipping => [...prevAutotipping, curatorFid]);
            console.log(`Added ${curatorFid} to autotipping list`);
          }
        } else {
          console.log('Failed to add curator to autotipping list');
        }
      } catch (error) {
        console.error('Error adding autotip curator:', error);
      }
    }
  }

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

    <div className='flex-row' style={{height: '30px', alignItems: 'center', justifyContent: 'flex-start', padding: '20px 0 30px 0'}}>
      <div className='flex-row' style={{padding: '4px 8px', backgroundColor: '#33445522', border: '1px solid #666', borderRadius: '20px', alignItems: 'center', gap: '0.25rem'}}>
        {/* <div className='filter-desc' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>TIME</div> */}

        <Link href={`/~/ecosystems/${ecosystem}`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>{ecosystem}</div></Link>
        <div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px', padding: '0'}}>{'>'}</div>
        <div className='filter-item-on' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>curators</div>
        <Link href={`/~/ecosystems/${ecosystem}/creators`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>creators</div></Link>
        <Link href={`/~/ecosystems/${ecosystem}/contributors`}><div className='filter-item' style={{fontWeight: '600', fontSize: isMobile ? '9px' : '10px'}}>contributors</div></Link>
      </div>
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
        <Link key={index} href={`/~/ecosystems/${ecosystem}/curators/${curator?.username}`}>
          <div className='curator-frame' style={{gap: '1.5rem', minWidth: isMobile ? '200px' : '250px'}}>
            <div className='flex-row' style={{gap: '1rem', paddingBottom: '10px', justifyContent: 'space-between'}}>
              <img loading="lazy" src={curator?.author_pfp} className="" alt={`${curator?.author_name} avatar`} style={{width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '24px', border: '1px solid #000'}} />
              <div>
                {autotipping.includes(curator?.fid) ? (<div className='curator-button' style={{fontSize: isMobile ? '9px' : '10px'}} onClick={(event) => {removeAutotip(event, curator?.fid)}}>Auto-tipping</div>) : (<div className='curator-button-on' style={{fontSize: isMobile ? '9px' : '10px'}} onClick={(event) => {addAutotip(event, curator?.fid)}}>Auto-tip</div>)}
              </div>
            </div>
            <div style={{fontSize: isMobile ? '16px' : '17px', fontWeight: '400', color: '#eff'}}>@{curator?.username}</div>
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
