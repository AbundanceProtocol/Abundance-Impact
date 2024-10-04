import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useStore from '../../../utils/store';
import { ActiveUser } from '../../../pages/assets'
import { timePassed } from '../../../utils/utils';
import CastText from '../Text';
import axios from 'axios';

export default function Subcast({ castHash, index }) {
  const store = useStore()
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(undefined)
  const [textMax, setTextMax] = useState('462px')
  const [feedMax, setFeedMax ] = useState('620px')
  const likeRefs = useRef([])
  const recastRefs = useRef([])
  const [userFid, setuserFid] = useState(null)
  const [fail, setFail] = useState(false)
  const [cast, setCast] = useState(null)

  useEffect(() => {
    if (screenWidth) {
      if (screenWidth > 680) {
        setTextMax(`462px`)
        setFeedMax('620px')
      }
      else if (screenWidth >= 635 && screenWidth <= 680) {
        setTextMax(`${screenWidth - 220}px`)
        setFeedMax('580px')
      }
      else {
        setTextMax(`${screenWidth - 170}px`)
        setFeedMax(`${screenWidth}px`)
      }
    }
    else {
      setTextMax(`100%`)
      setFeedMax(`100%`)
    }
  }, [screenWidth])

  async function getSubcast(hash, userFid) {
    if (hash && userFid) {
      try {
        const response = await axios.get('/api/getCastByHash', {
          params: { hash, userFid } })
        const castData = response.data.cast.cast
        if (castData) {
          console.log('castData', castData)
          setCast(castData)
        } else {
          return null
        }
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }
    }
  }




  useEffect(() => {
    setuserFid(store.fid)
    console.log('subcast triggered')
    getSubcast(castHash, 3)

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

  const goToCast = async (event, cast) => {
    event.preventDefault()
    const username = cast.author.username
    const castHash = cast.hash
    await store.setCastData(cast)
    router.push(`/${username}/casts/${castHash}`)
  }

  const goToUserProfile = async (event, author) => {
    event.preventDefault()
    const username = author.username
    await store.setUserData(author);
    router.push(`/${username}`)
  }


  return (<>{
    cast && (<div className="inner-container" style={{width: '100%', display: 'flex', flexDirection: 'row', borderRadius: '8px', border: '1px solid #888'}}>

      <div className="flex-col" style={{gap: '0.75rem'}}>
        <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '', alignItems: 'center', flexWrap: 'wrap'}}>
          <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', userSelect: 'none'}}>
            
            <div className="" style={{margin: '5px 5px 0 0'}}>
              <a className="" title="" href={`/${cast.author.username}`} onClick={() => {goToUserProfile(event, cast.author)}}>
                <img loading="lazy" src={cast.author.pfp_url} className="" alt={`${cast.author.display_name} avatar`} style={{width: '24px', height: '24px', maxWidth: '24px', maxHeight: '24px', borderRadius: '24px', border: '1px solid #000'}} />
              </a>
            </div>

            <span className="">
              <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} style={{cursor: 'pointer'}} onClick={() => {goToUserProfile(event, cast.author)}}>
                <div className="flex-row" style={{alignItems: 'center'}}>
                  <span className="name-font">{cast.author.display_name}</span>
                  <div className="" style={{margin: '0 0 0 3px'}}>
                    {(cast.author.power_badge) && (<ActiveUser />)}
                  </div>
                </div>
              </a>
            </span>
            <span className="user-font">
              <a href={`/${cast.author.username}`} className="fc-lnk" title={cast.author.display_name} onClick={() => {goToUserProfile(event, cast.author)}}>@{cast.author.username}</a>
            </span>
            <div className="">·</div>
            <a href={`/${cast.author.username}/casts/${cast.hash}`} className="fc-lnk" title="Navigate to cast" onClick={() => {goToCast(event, cast)}}>
              <div className="user-font">{timePassed(cast.timestamp)}</div>
            </a>
          </div>
        </div>
        <div className="">
          <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax, whiteSpace: 'pre-line'}}>
            {/* <CastText text={cast.text} embeds={cast.embeds} mentions={cast.mentioned_profiles} /> */}
            {cast.text}
            </div>
          {(cast?.embeds?.length > 0) && (cast.embeds.map((embed, subindex) => (
            
          <div key={subindex} className='flex-col' style={{alignItems: 'center'}}>
            {(embed?.metadata?.content_type?.startsWith('image/')) && (
              <div className="" key={`${index}-${subindex}`}>
                <div className="flex-col" style={{position: 'relative'}}>
                  <img 
                    loading="lazy" 
                    src={embed.url} 
                    alt="Cast image embed" 
                    style={{
                      maxWidth: textMax, 
                      maxHeight: '500px', 
                      marginTop: '10px', 
                      cursor: 'default', 
                      position: 'relative',
                      borderRadius: '8px'}} 
                        />
                </div>
              </div>
            )}
          </div>
          )))}
        </div>
      </div>
    </div>)}</>
  );
}