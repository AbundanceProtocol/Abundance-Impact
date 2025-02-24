import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
import Tip from  "../../../../models/Tip";
import Cast from  "../../../../models/Cast";
import Circle from  "../../../../models/Circle";
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
  const { time, curators, channels, tags, eco, ecosystem, refresh, time1, referrer } = req.query;
  const { untrustedData } = req.body

  if (req.method !== 'POST' || !ecosystem || !eco) {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {

    function sanitizeInput(input) {
      input = _.trim(input);
      input = _.replace(input, /[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
      return input;
    }

    function formatStringToArray(input) {
    
      // Sanitize the input
      const sanitizedInput = sanitizeInput(input)

      // Split the input string by spaces and commas
      const items = sanitizedInput.split(/[\s,]+/);
    
      // Initialize an object to track the combined amounts for each coin
      const combinedAmounts = {};
    
      // Iterate through the items
      for (let i = 0; i < items.length; i++) {
        // Check if the item is a number (amount)
        if (!isNaN(items[i])) {
          let amount = parseInt(items[i], 10);
          let coin = items[i + 1].toUpperCase();
          
          // Check for specific coins that need special handling
          if (coin === '$HAM') {
            coin = '$TN100x';
          }
          
          // Combine amounts for the same coin
          if (combinedAmounts[coin]) {
            combinedAmounts[coin] += amount;
          } else {
            combinedAmounts[coin] = amount;
          }
        } 
        // Check if the item matches the pattern 🍖x<number>
        else if (/🍖x\d+/i.test(items[i])) {
          const match = items[i].match(/🍖x(\d+)/i);
          const amount = parseInt(match[1], 10);
          const coin = '$TN100x';
    
          // Combine amounts for the same coin
          if (combinedAmounts[coin]) {
            combinedAmounts[coin] += amount;
          } else {
            combinedAmounts[coin] = amount;
          }
        }
      }
    
      // Convert the combined amounts object into the desired array format
      const result = Object.keys(combinedAmounts).map(coin => ({
        allowance: combinedAmounts[coin],
        totalTip: combinedAmounts[coin],
        token: coin,
        set: true,
        min: 180
      }));
    
      return {result, text: sanitizedInput};
    }

    async function getSigner(fid) {
      try {
        await connectToDatabase();
        const user = await User.findOne({ fid }).select('uuid username').exec();
        if (user) {
          const signer = decryptPassword(user.uuid, secretKey)
          // console.log(user)
          return {decryptedUuid: signer, username: user.username}
        } else {
          return {decryptedUuid: null, username: null}
        }
      } catch (error) {
        console.error('Error getting User:', error)
        return {decryptedUuid: null, username: null}
      }
    }

    async function checkTips(fid, points, startTime, endTime) {
      try {
        await connectToDatabase();
        const tips = await Tip.countDocuments({
          tipper_fid: fid,
          points: points,
          createdAt: {
            $gte: startTime,
            $lte: endTime
          }});

        if (tips && tips > 0) {
          return true
        } else {
          return false
        }
      } catch (err) {
        console.error(err);
        return false;
      }
    }

    async function getFids(fid, startTime, endTime, points) {
      try {
        await connectToDatabase();
        const result = await Circle.findOne(
        {
          fid: fid,
          points: points,
          createdAt: {
            $gte: startTime,
          }
        }, {_id: 1}).lean()
        if (result) {
          return result
        } else {
          return null
        }
      } catch (error) {
        console.error('Error getting PFPs:', error)
        return null
      }
    }

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
    
    console.log('14-2:', req.query, refresh)

    let exploreLink = `${baseURL}/~/ecosystems/${ecosystem}?${qs.stringify({ time: 'all', curators, referrer })}`

    if (curators) {
      let curatorId = Array.isArray(curators) ? curators[0] : Number(curators);
      exploreLink = `${baseURL}/~/curator/${curatorId || 9326}?${qs.stringify({ points })}`
    }

    const impactLink = `https://warpcast.com/abundance/0x43ddd672`

    const retryPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const refreshPost = `${baseURL}/api/frames/tip/refresh?${qs.stringify({ time, curators, eco, ecosystem, time1: timeMinus3, referrer })}`

    const startPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const loginUrl = `${baseURL}/?${qs.stringify({ eco: points, referrer: referrer || authorFid })}`

    const sendPost = `${baseURL}/api/frames/tip/tip?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const postUrl = `${baseURL}/~/ecosystems/${ecosystem}/tip-login?${qs.stringify({ time, curators, eco, referrer })}`
    
    const autoTipPost = `${baseURL}/api/frames/tip/auto-tip?${qs.stringify({ time, curators, eco, ecosystem, referrer })}`

    const shareText = 'I just multi-tipped builders and creators on /impact. Try it out here:'

    let shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem}/tip-share-v2?${qs.stringify({ time, curators, eco })}`

    const encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {

      const isTipped = await checkTips(fid, points, timeMinus3, timePlus1)

      if (isTipped) {

        const circleFids = await getFids(fid, time1, timePlus1, points)

        const {username} = await getSigner(fid)

        const {text} = formatStringToArray(inputText);

        // const jointFids = circleFids.join(',')

        circlesImg = `${baseURL}/api/frames/tip/circle?${qs.stringify({ id: circleFids })}`

        shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem}/tip-share-v2?${qs.stringify({ id: circleFids })}`
    
        encodedShareUrl = encodeURIComponent(shareUrl); 
        shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

        let threshold = true

        if (inputText) {
          const numbers = inputText.match(/\d+/g).map(Number);
          const numTest = numbers.some(number => number >= 100);
          if (!numTest) {
            threshold = false
          }
        }
    
        let metatags = ''

        if (threshold) {
          metatags = `
          <meta name="fc:frame:button:1" content="Share contribution">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="${shareLink}" />
          <meta name="fc:frame:button:2" content="Tip more >">
          <meta name="fc:frame:button:2:action" content="post">
          <meta name="fc:frame:button:2:target" content="${startPost}" />
          <meta name="fc:frame:button:3" content="Auto-tip >">
          <meta name="fc:frame:button:3:action" content="post">
          <meta name="fc:frame:button:3:target" content="${autoTipPost}" />
          <meta name="fc:frame:button:4" content="Refresh">
          <meta name="fc:frame:button:4:action" content="post">
          <meta name="fc:frame:button:4:target" content="${refreshPost}" />
          <meta property="og:image" content="${circlesImg}">
          <meta name="fc:frame:image" content="${circlesImg}">
          <meta name="fc:frame:post_url" content="${postUrl}">`
        } else {
          metatags = `
          <meta name="fc:frame:button:1" content="Tip more >">
          <meta name="fc:frame:button:1:action" content="post">
          <meta name="fc:frame:button:1:target" content="${startPost}" />
          <meta name="fc:frame:button:2" content="Auto-tip >">
          <meta name="fc:frame:button:2:action" content="post">
          <meta name="fc:frame:button:2:target" content="${autoTipPost}" />
          <meta name="fc:frame:button:3" content="Refresh">
          <meta name="fc:frame:button:3:action" content="post">
          <meta name="fc:frame:button:3:target" content="${refreshPost}" />
          <meta property="og:image" content="${circlesImg}">
          <meta name="fc:frame:image" content="${circlesImg}">
          <meta name="fc:frame:post_url" content="${postUrl}">`
        }
  
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
      } else {
        let metatags = `
        <meta name="fc:frame:button:1" content="Multi-Tip >">
        <meta name="fc:frame:button:1:action" content="post">
        <meta name="fc:frame:button:1:target" content="${sendPost}" />
        <meta name="fc:frame:button:2" content="Explore curation">
        <meta name="fc:frame:button:2:action" content="link">
        <meta name="fc:frame:button:2:target" content="${exploreLink}" />
        <meta name="fc:frame:button:3" content="Auto-tip">
        <meta name="fc:frame:button:3:action" content="post">
        <meta name="fc:frame:button:3:target" content="${autoTipPost}" />
        <meta name="fc:frame:button:4" content="Refresh">
        <meta name="fc:frame:button:4:action" content="post">
        <meta name="fc:frame:button:4:target" content="${refreshPost}" />
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
      }
    } catch (error) {
      console.log('g')

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










