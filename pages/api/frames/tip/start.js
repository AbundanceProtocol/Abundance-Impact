import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
import Tip from  "../../../../models/Tip";
import Cast from  "../../../../models/Cast";
import Impact from  "../../../../models/Impact";
import EcosystemRules from  "../../../../models/EcosystemRules";
import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../../utils/utils";
import _ from "lodash";
import qs from "querystring";
// import { createCircle } from "./circle2";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { time, curators, channels, tags, eco, ecosystem, refresh, retry, start, referrer } = req.query;
  const { untrustedData } = req.body

  if (req.method !== 'POST' || !ecosystem || !eco) {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {

    let tipText = ''

    const now = new Date();
    const timeMinus3 = new Date(now.getTime() - 3 * 60 * 1000);
    const timePlus1 = new Date(now.getTime() + 1 * 60 * 1000);
    const points = '$' + eco

    const fid = untrustedData?.fid
    const authorFid = untrustedData?.castId?.fid
    const loginImg = `${baseURL}/images/login.jpg`;
    const tipsImg = `${baseURL}/images/frame36.gif`
    const inputImg = `${baseURL}/images/input.jpg`;
    const issueImg = `${baseURL}/images/issue.jpg`;
    let circlesImg = ''
    
    console.log('14-3:', req.query, refresh)

    // const exploreLink = `${baseURL}/~/ecosystems/${ecosystem}?${qs.stringify({ time: 'all', curators })}`

    const impactLink = `https://warpcast.com/abundance/0x43ddd672`

    const retryPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const refreshPost = `${baseURL}/api/frames/tip/refresh?${qs.stringify({ time, curators, eco, ecosystem, time1: timeMinus3, referrer })}`

    const startPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const loginUrl = `${baseURL}/?${qs.stringify({ eco: points, referrer: referrer || authorFid })}`

    const sendPost = `${baseURL}/api/frames/tip/tip?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const postUrl = `${baseURL}/~/ecosystems/${ecosystem}/tip-login?${qs.stringify({ time, curators, eco, referrer })}`
    
    const shareText = 'I just multi-tipped builders and creators on /impact. Try it out here:'

    const autoTipPost = `${baseURL}/api/frames/tip/auto-tip?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const optOutPost = `${baseURL}/api/frames/tip/opt-out-menu?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    let shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem}/tip-share-v2?${qs.stringify({ time, curators, eco })}`

    const encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {

      let metatags = `
      <meta name="fc:frame:button:1" content="Multi-Tip >">
      <meta name="fc:frame:button:1:action" content="post">
      <meta name="fc:frame:button:1:target" content="${sendPost}" />
      <meta name="fc:frame:button:2" content="Menu">
      <meta name="fc:frame:button:2:action" content="post">
      <meta name="fc:frame:button:2:target" content="${baseURL}/api/frames/tip/menu?${qs.stringify({ time, curators, eco, ecosystem })}" />
      <meta name="fc:frame:button:3" content="Auto-tip >">
      <meta name="fc:frame:button:3:action" content="post">
      <meta name="fc:frame:button:3:target" content="${autoTipPost}" />
      <meta name="fc:frame:button:4" content="Opt-out?">
      <meta name="fc:frame:button:4:action" content="post">
      <meta name="fc:frame:button:4:target" content="${optOutPost}" />
      <meta property="og:image" content="${tipsImg}">
      <meta name="fc:frame:image" content="${tipsImg}">
      <meta name="fc:frame:post_url" content="${postUrl}">
      <meta name="fc:frame:input:text" content="Eg.: 1000 $Degen, 500 $HAM" />`

      res.setHeader('Content-Type', 'text/html');
      res.status(200)
      .send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tips | Impact App</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Multi-Tip">
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;

    } catch (error) {

      let metatags = `
      <meta name="fc:frame:button:1" content="Retry">
      <meta name="fc:frame:button:1:action" content="post">
      <meta name="fc:frame:button:1:target" content="${retryPost}" />
      <meta property="og:image" content="${issueImg}">
      <meta name="fc:frame:image" content="${issueImg}">
      <meta name="fc:frame:post_url" content="${postUrl}">`

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tips | Impact App</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Multi-Tip">
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;
    }
  }
}










