import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import useStore from '../../../utils/store';
import { Like, Recast, Message, Kebab, ActiveUser } from '../../assets'
import { FaLock, FaRegStar } from "react-icons/fa"
import { BsPatchCheckFill as Verified } from "react-icons/bs";
import { MdError as Rejected } from "react-icons/md";
import { shortenAddress, timePassed } from '../../../utils/utils'

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

  // useEffect(() => {

  //   console.log(articleData, username, articleHash)

  //   const updateArticle = async () => {
  //     if (articleData) {
  //       console.log('75:', articleData)
  //       let updatedArticleContent = { ...articleContent }
  //       if (typeof articleData.text !== 'undefined') {
  //         updatedArticleContent.text = articleData.text
  //       }
  //       if (typeof articleData.username !== 'undefined') {
  //         updatedArticleContent.username = articleData.username
  //         setVerifiedAuthor(username == articleData.username)
  //         getAuthorProfile(articleData.username)
  //       }
  //       if (typeof articleData.datetime !== 'undefined') {
  //         updatedArticleContent.date = articleData.datetime
  //       }
  //       if (typeof articleData.fid !== 'undefined') {
  //         updatedArticleContent.date = articleData.fid
  //       }
  //       setArticleContent(updatedArticleContent)

  //       setLoading(false)

  //     }
  //   }

  //   updateArticle()
  // }, [router]);

  // async function getAuthorProfile(name) {
  //   let fid = 3
  //   if (store.isAuth) {
  //     fid = store.fid
  //   }
  //   if (fid && name) {
  //     try {
  //       const response = await axios.get('/api/getUsers', {
  //         params: {
  //           fid: fid,
  //           name: name,
  //         }
  //       })
  //       const users = response.data.users
  //       console.log(users)
  //       const selectUser = users.find(user => user.username == name)
  //       if (selectUser)
  //         setAuthorData(selectUser)
  //     } catch (error) {
  //       console.error('Error submitting data:', error)
  //     }
  //   }
  //   else {
  //     console.log(fid, name)
  //   }
  // }

  // useEffect(() => {
  //   console.log(articleContent.username, username)
  //   console.log(verifiedAuthor)
  // }, [verifiedAuthor]);

  // const goToUserProfile = async (event, author) => {
  //   console.log('passed')
  //   event.preventDefault()
  //   const username = author.username
  //   await store.setUserData(author)
  //   console.log(author, store.userData)
  //   router.push(`/${username}`)
  // }

  const Article = () => {
    
    return (
    <div className="inner-container flex-col" style={{width: '100%'}}>
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
          
          <meta property="fc:frame:button:1" content='Longcast' />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:target" content={`${baseURL}/${username}/articles/${articleHash}`} />
          <meta property="fc:frame:button:2" content={`Next Page [2/${totalPages}]`} />
          <meta property="fc:frame:button:2:action" content="post" />
          <meta property="fc:frame:button:2:target" content={`${baseURL}/api/frames/page?id=${articleHash}&page=1&user=${username}&total=${totalPages}`} />
        </Head>
      )}

      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      { <Article/> }

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
        totalPages = Math.ceil(articleData.text.length / 300)
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