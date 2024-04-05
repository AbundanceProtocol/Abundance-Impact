import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useEffect, useState } from 'react';


const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default function ArticlePage({params}) {
  const router = useRouter();
  const ref = useRef(null)
  const initialState = { text: null, author: null, date: null, fid: null }

  const Article = () => {
    
    return (
    <div className="inner-container flex-col" style={{width: '100%'}}>
    </div>)
  }

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}} ref={ref}>
            

        <Head>
          <title>@{username} Balance | Impact App </title>
          <meta name="description" content={`Building the global superalignment layer`} />
          <meta name="viewport" content="width=device-width"/>
          <meta property="og:title" content="Longcast" />
          <meta property='og:image' content={`${baseURL}/api/frames/image?id=${articleHash}&page=0`} />
          <meta property="fc:frame" content="vNext" />

          
          <meta property="fc:frame:button:1" content={`Next Page [2/${totalPages}]`} />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:target" content={`${baseURL}/api/action/degenbalance`} />
        </Head>

      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
       <Article/> 

    </div>
  );
}


export async function getServerSideProps(context) {
  // Fetch dynamic parameters from the context object
  const { params } = context;

  console.log(params)
  return {
    props: {
      params
    },
  };
}