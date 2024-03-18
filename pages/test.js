import Head from 'next/head';
import { useContext, useState, useRef, useEffect } from 'react'
import { ethers } from 'ethers'
import { Like, Recast, Message, Kebab, Warp, ActiveUser } from './assets'
import Link from 'next/link'
import { AccountContext } from '../context'
import useMatchBreakpoints from '../hooks/useMatchBreakpoints'
// import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FaSearch, FaLock } from 'react-icons/fa';
import useStore from '../utils/store'
import axios from 'axios';

export default function Test({ metadata1, metadata2 }) {
  const ref = useRef(null)
  const initialState = { search: '' }
	const [userSearch, setUserSearch] = useState(initialState)
  const searchButtons = ['Ecosystems', 'Channels', 'Proposals', 'Users']
  const [ searchSelect, setSearchSelect ] = useState('Channels')
  const [ searchResults, setSearchResults ] = useState({kind: 'ecosystems', data: []})
  const { isMobile } = useMatchBreakpoints();
  const account = useContext(AccountContext)
  const [ screenWidth, setScreenWidth ] = useState(undefined)

  // const client = new NeynarAPIClient(apiKey);
  const [textMax, setTextMax] = useState('430px')
  const [textChMax, setTextChMax] = useState('430px')
  const [ feedMax, setFeedMax ] = useState('620px')
  const store = useStore()
	function onChange(e) {
		setUserSearch( () => ({ ...userSearch, [e.target.name]: e.target.value }) )
	}

  const searchOption = (e) => {
    setSearchSelect(e.target.getAttribute('name'))
  }

  function routeSearch() {
    // console.log(store.isAuth, userSearch.search)
    if (searchSelect == 'Channels') {
      getChannels(userSearch.search)
    }
    else if (searchSelect == 'Users' && store.isAuth) {
      getUsers(userSearch.search)
    }
  }

  async function getUsers(name) {
    let fid = 3
    if (store.isAuth) {
      fid = store.fid
    }

    try {
      const response = await axios.get('/api/getUsers', {
        params: {
          fid: fid,
          name: name,
        }
      })
      const users = response.data.users
      // console.log(users)
      setSearchResults({kind: 'users', data: users})
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function getChannels(name) {
    try {
      const response = await axios.get('/api/getChannels', {
        params: {
          name: name,
        }
      })
      const channels = response.data.channels.channels
      setSearchResults({kind: 'channels', data: channels})
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  async function followUser(fid) {
    console.log('follow')
    // try {
    //   const signer = store.signer_uuid

    //   // console.log(fid)
    //   // console.log(signer)
    //   // console.log(store.signer_uuid)
    //   const response = await axios.post('/api/postFollowUser', {       
    //     fid: fid,
    //     signer: signer,
    //   })
    //   const followed = response
    //   console.log(followed.status === 200)
    //   if (followed.status === 200) {

    //   } else {

    //   }
    //   // setSearchResults({kind: 'channels', data: channels})
    // } catch (error) {
    //   console.error('Error submitting data:', error)
    // }
  }

  useEffect(() => {
    if (!store.isAuth && searchSelect == 'Users') {
      setSearchSelect('Ecosystems')
    }
  }, [store.isAuth])

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`430px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`390px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 190}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])

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

  const SearchOptionButton = (props) => {
    const btn = props.buttonName
    let isSearchable = true
    let comingSoon = false
    if (props.buttonName == 'Users' && !store.isAuth) {
      isSearchable = false
    }
    if (props.buttonName == 'Ecosystems' || props.buttonName == 'Proposals') {
      comingSoon = true
    }

    return isSearchable ? (<>{comingSoon ? (<div className='flex-row' style={{position: 'relative'}}><div className={(searchSelect == btn) ? 'active-nav-link btn-hvr lock-btn-hvr' : 'nav-link btn-hvr lock-btn-hvr'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '12px' : '15px'}}>{btn}</div>
      <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(20%, -50%)' }}>
        <div className='soon-btn'>SOON</div>
      </div>
    </div>) : (
      <div className={(searchSelect == btn) ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'} onClick={searchOption} name={btn} style={{fontWeight: '600', padding: '5px 14px', borderRadius: '14px', fontSize: isMobile ? '12px' : '15px'}}>{btn}</div>)}</>
    ) : (
      <div className='flex-row' style={{position: 'relative'}}>
        <div className='lock-btn-hvr' name={btn} style={{color: '#bbb', fontWeight: '600', padding: '5px 14px', borderRadius: '14px', cursor: 'pointer', fontSize: isMobile ? '12px' : '15px'}} onClick={account.LoginPopup}>{btn}</div>
        <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(-20%, -50%)' }}>
          <FaLock size={8} color='#999' />
        </div>
      </div>
    )
  }

  return (
  <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
      <Head>
        <title>Impact | Abundance | Frame test</title>

        <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width"/>
            
            <meta property="og:title" content="Test Frame" />
            <meta property='og:image' content="https://i.imgur.com/tKUoyvi.jpg" />
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://i.imgur.com/tKUoyvi.jpg" />
            
            <meta property="fc:frame:button:1" content={metadata1} />
            <meta property="fc:frame:button:1:action" content="link" />
            <meta property="fc:frame:button:1:target" content="https://impact.abundance.id" />
            
            <meta property="fc:frame:button:2" content={metadata2} />
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content="https://impact.abundance.id/test" />
                        

        <meta name="description" content={`Metadata 1: ${metadata1}, Metadata 2: ${metadata2}`} />
      </Head>
    <div className="" style={{padding: '58px 0 0 0'}}>
    </div>
    <div style={{padding: '12px 20px', backgroundColor: '#66666611', borderRadius: '10px', border: '1px solid #888', marginBottom: '16px', width: feedMax}}>
      <div className="top-layer flex-row" style={{padding: '10px 0 10px 0', alignItems: 'center', justifyContent: 'space-between', margin: '0', borderBottom: '1px solid #888'}}>
        { searchButtons.map((btn, index) => (
          <SearchOptionButton buttonName={btn} key={index} /> ))}
      </div>
      <div sytle={{}}>
        <div className="flex-row" style={{padding: '10px 0 0 0'}}>
            <input onChange={onChange} name='search' placeholder={`Search ${searchSelect}`} value={userSearch.search} className='srch-btn' style={{width: '100%', backgroundColor: '#234'}} />
            <div className='srch-select-btn' onClick={routeSearch} style={{padding: '12px 14px 9px 14px'}}><FaSearch /></div>
          </div>
        </div>
    </div>
    <div>Link 1: {metadata1} Link 2: {metadata2}</div>

  </div>
  )
}


export async function getServerSideProps(context) {
  const { metadata1, metadata2 } = context.query;
  const sanitizedMetadata1 = encodeURIComponent(metadata1)
  const sanitizedMetadata2 = encodeURIComponent(metadata2)
  return {
    props: {
      metadata1: sanitizedMetadata1 || 'Link 1', // Default to empty string if metadata1 is not provided
      metadata2: sanitizedMetadata2 || 'Link 2'  // Default to empty string if metadata2 is not provided
    }
  };
}