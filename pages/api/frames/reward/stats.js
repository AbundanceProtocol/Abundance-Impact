import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
// import Tip from  "../../../../models/Tip";
// import Cast from  "../../../../models/Cast";
// import ImpactFrame from  "../../../../models/ImpactFrame";
// import Raffle from  "../../../../models/Raffle";
// import Impact from  "../../../../models/Impact";
import CreatorFund from  "../../../../models/CreatorFund";
// import Score from  "../../../../models/Score";
// import EcosystemRules from  "../../../../models/EcosystemRules";
// import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../../utils/utils";
import _ from "lodash";
import qs from "querystring";
import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)
  console.log('isValid:', isValid)
  // const { referrer } = req.query;
  const { untrustedData } = req.body
  // const authorFid = message?.data?.frameActionBody?.castId?.fid

  if (req.method !== 'POST' ) {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    async function getSigner(fid) {
      try {
        await connectToDatabase();
        const user = await User.findOne({ fid }).select('username pfp').exec();
        if (user) {
          return {
            username: user.username,
            user_pfp: user.pfp,
          };
        } else {
          return {username: null, user_pfp: null}
        }
      } catch (error) {
        console.error('Error getting User:', error)
        return { username: null, user_pfp: null };
      }
    }

    async function followingChannel(fid) {
      const channelOptions = {
        method: 'GET',
        headers: {accept: 'application/json'}
      };
      try {
        const channelData = await fetch(`https://api.warpcast.com/v1/user-channel?fid=${fid}&channelId=impact`, channelOptions);
        if (!channelData.ok) {
          return true
        } else {
          const channelInfo = await channelData.json();
          if (channelInfo && channelInfo?.result) {
            let following = channelInfo.result?.following
            if (!following) {
              return false
            } else {
              return true
            }
          }
        }
      } catch (error) {
        console.error(`Error getting follower info: `, error)
        return true
      }
    }


    // const points = eco || '$IMPACT'
    // const points = '$IMPACT'

    const fid = untrustedData?.fid
    // const fid = 9326
    const issueImg = `${baseURL}/images/issue.jpg`;
    let circlesImg = ''
    // console.log('fid', ecosystem, referrer, fid)
    // const impactLink = `https://warpcast.com/abundance/0xea3aef76`

    // const retryPost = `${baseURL}/api/frames/reward/stats`

    // const refreshPost = `${baseURL}/api/frames/tip/refresh?${qs.stringify({ time, curators, eco, ecosystem, time1: timeMinus3 })}`

    // const startPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem })}`

    const postUrl = `${baseURL}?${qs.stringify({ referrer: fid })}`
    
    let shareText = ``

    let shareUrl = ``

    let encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {

      const isFollowing = await followingChannel(fid)
      
      const {username, user_pfp} = await getSigner(fid)
  
      if (!username && !isFollowing) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Need to login app & follow /impact'
        });
        return;
      } else if (!username) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Need to login app'
        });
        return;
      } else if (!isFollowing) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Need to follow /impact'
        });
        return;
      } else if (username && isFollowing) {


        async function getReward(fid) {
          try {
            // const objectId = new mongoose.Types.ObjectId(id)
            // console.log(id)
            await connectToDatabase();
            let reward = await CreatorFund.findOne({ fid }).exec();
            if (reward) {
              return reward
            } else {
              return null
            }
          } catch (error) {
            console.error("Error while fetching casts:", error);
            return null
          }  
        }
    
        let reward = await getReward(fid);

        circlesImg = `${baseURL}/api/frames/reward/frame?${qs.stringify({ fid })}`

        shareUrl = `https://impact.abundance.id/~/ecosystems/${'abundance'}/rewards-v1?${qs.stringify({ fid })}`


        shareText = `My /impact Creator Fund Season 3 airdrop (frame by @abundance)\n\nCheck out yours 👇`

        encodedShareText = encodeURIComponent(shareText)
      
        encodedShareUrl = encodeURIComponent(shareUrl); 
        shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

        let metatags = ``

        if (reward?.degen > 0 || reward?.ham > 0) {
          metatags = `
          <meta name="fc:frame:button:1" content="Share">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="${shareLink}" />
          <meta property="og:image" content="${circlesImg}">
          <meta name="fc:frame:image" content="${circlesImg}">
          <meta name="fc:frame:post_url" content="${postUrl}">`
        } else {
          metatags = `
          <meta name="fc:frame:button:1" content="Get started">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="https://impact.abundance.id" />
          <meta property="og:image" content="${circlesImg}">
          <meta name="fc:frame:image" content="${circlesImg}">
          <meta name="fc:frame:post_url" content="${postUrl}">`
        }
  

        try {

          res.setHeader('Content-Type', 'text/html');
          res.status(200)
          .send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Impact Creator Fund Rewards</title>
                <meta name="fc:frame" content="vNext">
                <meta property="og:title" content="Creator Fund Rewards">
                <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
                ${metatags}
              </head>
              <body>
                <div>Tip frame</div>
              </body>
            </html>
          `);
          return;

        } catch (error) {
          console.log('Error sending tip:', error)
          console.log('f')

          let metatags = `
          <meta name="fc:frame:button:1" content="Get started">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="https://impact.abundance.id" />
          <meta property="og:image" content="${issueImg}">
          <meta name="fc:frame:image" content="${issueImg}">
          <meta name="fc:frame:post_url" content="${postUrl}">`
    
          res.setHeader('Content-Type', 'text/html');
          res.status(500).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Impact Creator Fund Rewards</title>
                <meta name="fc:frame" content="vNext">
                <meta property="og:title" content="Creator Fund Rewards">
                <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
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
    } catch (error) {
      console.log(error, 'g')

      let metatags = `
      <meta name="fc:frame:button:1" content="Get started">
      <meta name="fc:frame:button:1:action" content="link">
      <meta name="fc:frame:button:1:target" content="https://impact.abundance.id" />
      <meta property="og:image" content="${issueImg}">
      <meta name="fc:frame:image" content="${issueImg}">
      <meta name="fc:frame:post_url" content="${postUrl}">`

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Creator Fund Rewards</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Creator Fund Rewards">
            <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
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


