import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
// import Tip from  "../../../../models/Tip";
// import Cast from  "../../../../models/Cast";
// import ImpactFrame from  "../../../../models/ImpactFrame";
// import Raffle from  "../../../../models/Raffle";
// import Impact from  "../../../../models/Impact";
// import Score from  "../../../../models/Score";
import ScheduleTip from  "../../../../models/ScheduleTip";

// import EcosystemRules from  "../../../../models/EcosystemRules";
// import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../../utils/utils";
import _ from "lodash";
import qs from "querystring";
import { init, validateFramesMessage } from "@airstack/frames";

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
  const { ecosystem } = req.query;
  const { untrustedData } = req.body
  // const authorFid = message?.data?.frameActionBody?.castId?.fid

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {


    const fid = untrustedData?.fid
    let circlesImg = ''
    console.log('fid', ecosystem, fid)
    const startFund = `${baseURL}/api/frames/fund/auto-fund?${qs.stringify({ ecosystem })}`

    const loginUrl = `${baseURL}?${qs.stringify({ referrer: fid })}`
    
    let shareText = ``

    let shareUrl = ``

    let encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {
    
      async function getSchedule(fid, points) {
        try {
          await connectToDatabase();
          let fundSchedule = await ScheduleTip.findOne({ fid }).exec();
          return fundSchedule || null
        } catch (error) {
          console.error("Error while fetching data:", error);
          return null
        }  
      }

      let schedId = null
      let fundSchedule = await getSchedule(fid, '$IMPACT')


      if (fundSchedule) {

        async function updateSchedule(fid) {
          try {
            await connectToDatabase();
            let updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: false }, { new: true, select: '-uuid' });

            const objectIdString = updated._id.toString();
            return objectIdString;
          } catch (error) {
            console.error("Error while fetching data:", error);
            return null
          }  
        }

        schedId = await updateSchedule(fid)
        console.log('schedId1', schedId)
      } else {

        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Auto-Fund not found'
        });
        return;
      }
  

      if (schedId) {

        circlesImg = `${baseURL}/api/frames/fund/frame`

        shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem || 'abundance'}/fund-v1?${qs.stringify({ referrer: fid })}`

        shareText = `Auto-fund farcasters who support the LA wildfire relief effort with your daily (remaining) $degen & $ham thru /impact's @impactfund 👇`

        encodedShareText = encodeURIComponent(shareText)
  
        encodedShareUrl = encodeURIComponent(shareUrl); 
        shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`


        let metatags = `
        <meta name="fc:frame:button:1" content="Share">
        <meta name="fc:frame:button:1:action" content="link">
        <meta name="fc:frame:button:1:target" content="${shareLink}" />
        <meta name="fc:frame:button:2" content="Auto-Fund">
        <meta name="fc:frame:button:2:action" content="post">
        <meta name="fc:frame:button:2:target" content="${startFund}" />
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
    
  
      
    } catch (error) {
      console.log(error, 'g')

      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({ 
        message: 'Please Retry'
      });
      return;

    }
  }
}


