import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
// import Tip from  "../../../../models/Tip";
// import Cast from  "../../../../models/Cast";
// import ImpactFrame from  "../../../../models/ImpactFrame";
// import Raffle from  "../../../../models/Raffle";
// import Impact from  "../../../../models/Impact";
// import Score from  "../../../../models/Score";
// import ScheduleTip from  "../../../../models/ScheduleTip";

// import EcosystemRules from  "../../../../models/EcosystemRules";
// import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../../utils/utils";
import _ from "lodash";
import qs from "querystring";
// import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
// const secretKey = process.env.SECRET_KEY
// const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY ?? '')
  // const body = await req.body;
  // const {isValid, message} = await validateFramesMessage(body)
  // console.log('isValid:', isValid)
  const { fund } = req.query;
  const { untrustedData } = req.body
  // const authorFid = message?.data?.frameActionBody?.castId?.fid
  // console.log('ecosystem', ecosystem)
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {

    async function getSigner(fid) {
      try {
        await connectToDatabase();
        const user = await User.findOne({ fid }).select('username').exec();
        if (user) {
          return {
            username: user.username,
            // user_pfp: user.pfp,
          };
        } else {
          return {username: null}
        }
      } catch (error) {
        console.error('Error getting User:', error)
        return { username: null };
      }
    }

    let boost = false
    let validate = false
    if (fund == 'boost') {
      boost = true
    } else if (fund == 'validate') {
      validate = true
    }



    const fid = untrustedData?.fid
    // const fid = 9326
    let circlesImg = ''
    console.log('fid', fid)
    const stopFund = `${baseURL}/api/frames/subscribe/stop-fund`
    // const stopFund = `${baseURL}/api/frames/subscribe/stop-fund?${qs.stringify({ ecosystem: ecosystem || 'abundance' })}`
    const loginUrl = `${baseURL}?${qs.stringify({ referrer: fid, autoFund: 'true' })}`
    
    let shareText = ``

    let shareUrl = ``

    let encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {

      const {username} = await getSigner(fid)
      if (!username) {

        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Need to login app'
        });
        return;

      } else if (username) {

        async function getSchedule(fid, points) {
          try {
            await connectToDatabase();
            let fundSchedule = await User.findOne({ fid: fid.toString(), ecosystem_points: points }).exec();
            return fundSchedule || null
          } catch (error) {
            console.error("Error while fetching data:", error);
            return null
          }  
        }

        let userId = null
        let booster = null
        let validator = null
        
        let fundSchedule = await getSchedule(fid, '$IMPACT')


        if (fundSchedule) {

          async function updateSchedule(fid) {
            try {
              await connectToDatabase();
              let updated = null
              if (boost) {
                updated = await User.findOneAndUpdate({ fid: fid.toString(), ecosystem_points: '$IMPACT' }, { boost: true }, { new: true, select: '-uuid' });
              } else if (validate) {
                updated = await User.findOneAndUpdate({ fid: fid.toString(), ecosystem_points: '$IMPACT' }, { validator: true }, { new: true, select: '-uuid' });
              }
              const objectIdString = updated?._id.toString();
              const updatedBoost = updated?.boost
              const updatedValidator = updated?.validator
              return {userId: objectIdString, booster: updatedBoost, validator: updatedValidator};
            } catch (error) {
              console.error("Error while updating user:", error);
              return {userId: null, booster: null, validator: null}
            }  
          }

          ({userId, booster, validator} = await updateSchedule(fid))
        }

        if (userId) {

          console.log('fid', fid)

          circlesImg = `${baseURL}/api/frames/subscribe/fund-dash?${qs.stringify({ fid, fund })}`

          shareUrl = `https://impact.abundance.id/~/ecosystems/abundance/subscribe-v1?${qs.stringify({ referrer: fid })}`

          shareText = `I just subscribed to participate in Impact 2.0 ${(booster || validator) && 'as a ' + (booster && validator) && 'Booster & Validator' || booster && 'Booster' || validator && 'Validator'}\n\nSubscribe 👇`

          encodedShareText = encodeURIComponent(shareText)
    
          encodedShareUrl = encodeURIComponent(shareUrl); 
          shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`


          let addBoost = `
          <meta name="fc:frame:button:1" content="Boost">
          <meta name="fc:frame:button:1:action" content="post">
          <meta name="fc:frame:button:1:target" content="${baseURL}/api/frames/subscribe/fund?fund=boost" />`

          let removeBoost = `
          <meta name="fc:frame:button:1" content="Un-Boost">
          <meta name="fc:frame:button:1:action" content="post">
          <meta name="fc:frame:button:1:target" content="${baseURL}/api/frames/subscribe/unfund?fund=boost" />`

          let addValidator = `
          <meta name="fc:frame:button:2" content="Validate">
          <meta name="fc:frame:button:2:action" content="post">
          <meta name="fc:frame:button:2:target" content="${baseURL}/api/frames/subscribe/fund?fund=boost" />`

          let removeValidator = `
          <meta name="fc:frame:button:2" content="Un-Validate">
          <meta name="fc:frame:button:2:action" content="post">
          <meta name="fc:frame:button:2:target" content="${baseURL}/api/frames/subscribe/unfund?fund=boost" />`


          let metatags = `
          ${booster ? removeBoost : addBoost}
          ${validator ? removeValidator : addValidator}
          <meta name="fc:frame:button:3" content="Share">
          <meta name="fc:frame:button:3:action" content="link">
          <meta name="fc:frame:button:3:target" content="${shareLink}" />
          <meta property="og:image" content="${circlesImg}">
          <meta name="fc:frame:image" content="${circlesImg}">
          <meta name="fc:frame:post_url" content="${loginUrl}">`
    
  
          try {

            res.setHeader('Content-Type', 'text/html');
            res.status(200)
            .send(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Auto-Fund | Impact Alpha</title>
                  <meta name="fc:frame" content="vNext">
                  <meta property="og:title" content="Auto-Fund">
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

            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ 
              message: 'Retry Auto-Funding'
            });
            return;
    
          }




        } else {

          res.setHeader('Content-Type', 'application/json');
          res.status(400).json({ 
            message: 'Retry Auto-Funding'
          });
          return;

        }
        
  
      }
      
    } catch (error) {
      console.log(error, 'g')

      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({ 
        message: 'Need to login app'
      });
      return;

    }
  }
}


