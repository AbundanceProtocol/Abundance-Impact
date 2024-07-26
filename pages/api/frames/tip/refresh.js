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
  const { tip, time, curators, channels, tags, shuffle, referrer, eco, ecosystem, refresh, time1 } = req.query;
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
          const amount = parseInt(match[1], 10) * 10;
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
        const result = await Tip.find(
        {
          tipper_fid: fid,
          points: points,
          createdAt: {
            $gte: startTime,
          }
        }, {receiver_fid: 1, _id: 0}).limit(15).lean()
        if (result) {
          const tippedFids = result.map(doc => doc.receiver_fid);
          const uniqueFids = [...new Set(tippedFids)]; 
          console.log(uniqueFids)
          return uniqueFids
        } else {
          return []
        }
      } catch (error) {
        console.error('Error getting PFPs:', error)
        return []
      }
    }

    let tipText = ''

    const now = new Date();
    const timeMinus3 = new Date(now.getTime() - 3 * 60 * 1000);
    const timePlus1 = new Date(now.getTime() + 1 * 60 * 1000);
    const points = '$' + eco

    const fid = untrustedData?.fid
    const loginImg = `${baseURL}/images/login.jpg`;
    const tipsImg = `${baseURL}/images/tips.jpg`
    const inputImg = `${baseURL}/images/input.jpg`;
    const issueImg = `${baseURL}/images/issue.jpg`;
    let circlesImg = ''
    
    console.log('14:', req.query, refresh)

    const exploreLink = `${baseURL}/~/ecosystems/${ecosystem}?${qs.stringify({ tip: 0, shuffle: false, time: 'all', curators, referrer, eco, ecosystem })}`

    const impactLink = `https://warpcast.com/abundance/0x43ddd672`

    const retryPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ tip: 0, shuffle: true, time, curators, referrer, eco, ecosystem })}`

    const refreshPost = `${baseURL}/api/frames/tip/refresh?${qs.stringify({ tip: 0, shuffle: true, time, curators, referrer, eco, ecosystem, time1: timeMinus3 })}`

    const startPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ tip: 0, shuffle: true, time, curators, referrer, eco, ecosystem })}`

    const loginUrl = `${baseURL}/~/ecosystems/${ecosystem}/tip-login?${qs.stringify({ tip: 0, shuffle: true, time, curators, referrer, eco, ecosystem })}`

    const sendPost = `${baseURL}/api/frames/tip/tip?${qs.stringify({ tip: 0, shuffle: true, time, curators, referrer, eco, ecosystem })}`

    const postUrl = `${baseURL}/~/ecosystems/${ecosystem}/tip-login?${qs.stringify({ tip: 0, shuffle: true, time, curators, referrer, eco, ecosystem })}`
    
    const shareText = 'I just multi-tipped builders and creators on /impact. Try it out here:'

    let shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem}/tip-share?${qs.stringify({ tip: 0, shuffle: true, time, curators, referrer, eco, ecosystem })}`

    const encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {

      const isTipped = await checkTips(fid, points, timeMinus3, timePlus1)

      if (isTipped) {

        const circleFids = await getFids(fid, time1, timePlus1, points)

        const {username} = await getSigner(fid)

        const {text} = formatStringToArray(inputText);

        circlesImg = `${baseURL}/api/frames/tip/circle?${qs.stringify({ text, username, fids: circleFids })}`

        shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem}/tip-share?${qs.stringify({ tip: 0, shuffle: true, text, fids: circleFids, username, eco, referrer, time, curators })}`
    
        encodedShareUrl = encodeURIComponent(shareUrl); 
        shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

        let metatags = `
        <meta name="fc:frame:button:1" content="Share contribution">
        <meta name="fc:frame:button:1:action" content="link">
        <meta name="fc:frame:button:1:target" content="${shareLink}" />
        <meta name="fc:frame:button:2" content="Tip more >">
        <meta name="fc:frame:button:2:action" content="post">
        <meta name="fc:frame:button:2:target" content="${startPost}" />
        <meta name="fc:frame:button:3" content="What's /impact">
        <meta name="fc:frame:button:3:action" content="link">
        <meta name="fc:frame:button:3:target" content="${impactLink}" />
        <meta name="fc:frame:button:4" content="Refresh">
        <meta name="fc:frame:button:4:action" content="post">
        <meta name="fc:frame:button:4:target" content="${refreshPost}" />
        <meta property="og:image" content="${circlesImg}">
        <meta name="fc:frame:image" content="${circlesImg}">
        <meta name="fc:frame:post_url" content="${postUrl}">`
  
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
        <meta name="fc:frame:button:1" content="Tip Nominees">
        <meta name="fc:frame:button:1:action" content="post">
        <meta name="fc:frame:button:1:target" content="${sendPost}" />
        <meta name="fc:frame:button:2" content="Explore curation">
        <meta name="fc:frame:button:2:action" content="link">
        <meta name="fc:frame:button:2:target" content="${exploreLink}" />
        <meta name="fc:frame:button:3" content="What's /impact">
        <meta name="fc:frame:button:3:action" content="link">
        <meta name="fc:frame:button:3:target" content="${impactLink}" />
        <meta name="fc:frame:button:4" content="Refresh">
        <meta name="fc:frame:button:4:action" content="post">
        <meta name="fc:frame:button:4:target" content="${refreshPost}" />
        <meta property="og:image" content="${tipsImg}">
        <meta name="fc:frame:image" content="${tipsImg}">
        <meta name="fc:frame:post_url" content="${postUrl}">
        <meta name="fc:frame:input:text" content="Eg.: 1000 $Degen, 500 $FARTHER" />`
  
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










