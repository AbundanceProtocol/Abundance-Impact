import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import useStore from '../../../utils/store';
import { Like, Recast, Message, Kebab, ActiveUser } from '../../assets'
import { FaLock, FaRegStar } from "react-icons/fa"
import { BsPatchCheckFill as Verified } from "react-icons/bs";
import { BiSolidErrorAlt as Rejected } from "react-icons/bi";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function ArticlePage({articleData, username, articleHash, totalPages}) {
  const router = useRouter();
  const ref = useRef(null)
  const [cast, setCast] = useState(null)
  const [authorData, setAuthorData] = useState(null)
  const initialState = { text: null, author: null, date: null, fid: null }
  const [articleContent, setArticleContent] = useState(initialState)
  const [verifiedAuthor, setVerifiedAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const store = useStore()
  const [textMax, setTextMax] = useState('522px')

  useEffect(() => {

    console.log(articleData, username, articleHash)

    const updateArticle = async () => {
      if (articleData) {
        console.log('75:', articleData)
        let updatedArticleContent = { ...articleContent }
        if (typeof articleData.text !== 'undefined') {
          updatedArticleContent.text = articleData.text
        }
        if (typeof articleData.username !== 'undefined') {
          updatedArticleContent.username = articleData.username
          setVerifiedAuthor(username == articleData.username)
          getAuthorProfile(articleData.username)
        }
        if (typeof articleData.datetime !== 'undefined') {
          updatedArticleContent.date = articleData.datetime
        }
        if (typeof articleData.fid !== 'undefined') {
          updatedArticleContent.date = articleData.fid
        }
        setArticleContent(updatedArticleContent)

        setLoading(false)

      }
    }

    updateArticle()
  }, [router]);

  async function getAuthorProfile(name) {
    let fid = 3
    if (store.isAuth) {
      fid = store.fid
    }
    if (fid && name) {
      try {
        const response = await axios.get('/api/getUsers', {
          params: {
            fid: fid,
            name: name,
          }
        })
        const users = response.data.users
        console.log(users)
        const selectUser = users.find(user => user.username == name)
        if (selectUser)
          setAuthorData(selectUser)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
    else {
      console.log(fid, name)
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
    console.log(articleContent.username, username)
    console.log(verifiedAuthor)
  }, [verifiedAuthor]);

  const goToUserProfile = async (event, author) => {
    console.log('passed')
    event.preventDefault()
    const username = author.username
    await store.setUserData(author)
    console.log(author, store.userData)
    router.push(`/${username}`)
  }

  const Article = () => {

    function shortenAddress(input) {
      if (input.length <= 8) {
        return input;
      } else {
        return input.substring(0, 4) + '...' + input.substring(input.length - 4);
      }
    }
    
    return (articleContent) && (
    <div className="inner-container flex-col" style={{width: '100%'}}>
      <div className="top-layer flex-row" style={{padding: '0px 0 10px 0', alignItems: 'center', justifyContent: 'end', margin: '0'}}>
        <div className="flex-row" style={{margin: '0px 0px', gap: '0.7rem'}}>
          <div className="flex-row" style={{border: '1px solid #666', padding: '2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#eee'}}>
            <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
              <div className="flex-col">
                <div style={{fontSize: '12px', fontWeight: '500'}}>{loading ? 'Verifying' : (verifiedAuthor ? 'Verified' : 'Rejected')}</div>
                {loading ? (<div style={{fontSize: '13px'}}>...</div>) : (<div style={{fontSize: '13px'}}><a className='fc-lnk' href={`https://ipfs.io/ipfs/${articleHash}`} target="_blank" rel="noopener noreferrer">
                  {(articleHash && username == articleContent.username) ? (shortenAddress(articleHash)) : ('...')}</a></div>)}
              </div>
              {(<Verified color={(username == articleContent.username) ? '#32b439' : 'transparent'} size={24} />) 
            }
            </div>
          </div>
        </div>
      </div>
      <div>
        <div>
          <div className="">
            <div className="">
              <div className="flex-row">
                <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
                  <a className="" title="" href={authorData ? `https://warpcast.com/${authorData.username}` : ''}>
                    <img loading="lazy" src={authorData ? authorData.pfp_url : ''} className="" alt={authorData ? `${authorData.display_name} avatar` : ''} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #000'}} />
                  </a>
                </span>
                <div className="flex-col" style={{width: 'auto', gap: '0.5rem', alignItems: 'flex-start'}}>
                  <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '20px', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                      <span className="" data-state="closed">
                        <a href={authorData ? `/${authorData.username}` : `/${articleContent.username}`} className="fc-lnk" title={authorData ? authorData.display_name : ''} style={{cursor: 'pointer'}} onClick={() => {
                          if (authorData) {
                            goToUserProfile(event, authorData);
                          } else {
                            // Do nothing
                            return;
                          }}}>
                          <div className="flex-row" style={{alignItems: 'center'}}>
                            <span className="name-font">{authorData ? authorData.display_name : ''}</span>
                            <div className="" style={{margin: '0 0 0 3px'}}>
                              {(authorData && authorData.active_status == 'active') && (<ActiveUser />)}
                            </div>
                          </div>
                        </a>
                      </span>
                      <span className="user-font" datastate="closed">
                        <a href={authorData ? `/${authorData.username}` : `/${articleContent.username}`} className="fc-lnk" title={authorData ? authorData.display_name : `${articleContent.username}`} onClick={() => {
                          if (authorData) {
                            goToUserProfile(event, authorData);
                          } else {
                            // Do nothing
                            return;
                          }}}>@{articleContent.username}</a>
                      </span>
                      <div className="">·</div>
                      <a className="fc-lnk" title="Navigate to cast" href={authorData && `https://warpcast.com/${authorData.username}/${cast && cast.hash.slice(0,10)}`}>
                        <div className="user-font">{articleContent.date && timePassed(articleContent.date)}</div>
                      </a>
                    </div>
                    <div className="">
                      <Kebab />
                    </div>
                  </div>
                  <div className="">
                    <div style={{wordWrap: 'break-word', maxWidth: `100%`, width: textMax, whiteSpace: 'pre-line'}}>{articleContent.text}</div>
                    {(cast && cast.embeds.length > 0) && (cast.embeds.map((embed, subindex) => (
                    <div className='flex-col' style={{alignItems: 'center'}}>
                      {(cast && embed.type && embed.type == 'img') && (
                        <div className="" key={`${index}-${subindex}`}>
                          <div className="flex-col" style={{position: 'relative'}}>
                            <img 
                              loading="lazy" 
                              src={embed.url} 
                              alt="Cast image embed" 
                              style={{aspectRatio: '0.75 / 1', 
                                maxWidth: textMax, 
                                maxHeight: '500px', 
                                marginTop: '10px', 
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
                  {(cast && typeof cast.channelName !== 'undefined') && (
                    <div className="flex-row" style={{border: '1px solid #666', padding: '2px 4px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
                        <img loading="lazy" src={cast && cast.channelImg} className="" alt="Channel image" style={{width: '17px', height: '17px', minWidth: '17px', minHeight: '17px', borderRadius: '3px'}} />
                        <span className="channel-font">{cast && cast.channelName}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                    <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                      <div className="">
                        <Message />
                      </div>
                      <span className="" style={{padding: '0 0 0 5px'}}>{cast && cast.replies.count}</span>
                    </div>
                    <div className="flex-row" style={{flex: 1}}>
                      <div className='flex-row recast-btn'
                      //  onClick={() => postRecast(cast.hash, index, cast.reactions.recasts.length)}
                        >
                        <div className="">
                          <Recast />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{cast && cast.reactions.recasts.length}</span>
                      </div>
                    </div>
                    <div className="flex-row" style={{flex: 1}}>
                      <div className='flex-row like-btn'
                      //  onClick={() => postLike(cast.hash, index, cast.reactions.likes.length)}
                        >
                        <div className="">
                          <Like />
                        </div>
                        <span className="" style={{padding: '0 0 0 5px'}}>{cast && cast.reactions.likes.length}</span>
                      </div>
                    </div>
                    <div className="flex-row" style={{flex: 1, padding: '3px'}}>
                      <div className="" style={{padding: '2px 0 0 0px'}}>
                        <FaRegStar />
                      </div>
                      <span style={{padding: '0 0 0 5px'}}>{cast && cast.impact && (`${cast.impact}`)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>)
  }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
            
      {(totalPages !== 0) && (
        <Head>
          <title>@{username} Articles | Impact App </title>
          <meta name="description" content={`Building the global superalignment layer`} />
          <meta name="viewport" content="width=device-width"/>
          <meta property="og:title" content="Longcast" />
          <meta property='og:image' content={`${baseURL}/api/frames/image?id=${articleHash}&page=0`} />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content={`${baseURL}/api/frames/image?id=${articleHash}&page=0`} />
          
          <meta property="fc:frame:button:1" content='To Longcast' />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content={`${baseURL}/${username}/articles/${articleHash}`} />
          <meta property="fc:frame:button:2" content='Refresh' />
          <meta property="fc:frame:button:2:action" content="post" />
          <meta property="fc:frame:button:2:target" content={`${baseURL}/api/frames/page?id=${articleHash}&page=0&user=${username}&total=${totalPages}`} />
          <meta property="fc:frame:button:3" content={`Next Page [2/${totalPages}]`} />
          <meta property="fc:frame:button:3:action" content="post" />
          <meta property="fc:frame:button:3:target" content={`${baseURL}/api/frames/page?id=${articleHash}&page=1&user=${username}&total=${totalPages}`} />
        </Head>
      )}

      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { (articleContent) && <Article/> }

    </div>
  );
}


export async function getServerSideProps(context) {
  // Fetch dynamic parameters from the context object
  const { params } = context;
  const { username, article } = params;
  let articleData = null
  const articleHash = article
  let totalPages = 0
  try {
    const response = await fetch(`${baseURL}/api/getIPFS?hash=${article}`);
    // console.log('402 reponse:', response)
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      articleData = await response.json();
      if (articleData.text) {
        totalPages = Math.round(articleData.text.length / 300)
      }
    }

  } catch (error) {
    console.error('Error submitting data:', error)
    return null
  }
  console.log(articleData, username, articleHash, totalPages)
  return {
    props: {
      articleData, username, articleHash, totalPages
    },
  };
}