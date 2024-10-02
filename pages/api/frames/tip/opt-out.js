import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
import Tip from  "../../../../models/Tip";
import Cast from  "../../../../models/Cast";
import Circle from  "../../../../models/Circle";
import OptOut from "../../../../models/OptOut";
import Impact from  "../../../../models/Impact";
import EcosystemRules from  "../../../../models/EcosystemRules";
import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../../utils/utils";
import _ from "lodash";
import qs from "querystring";
import { metaButton } from "../../../../utils/frames";
import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid} = await validateFramesMessage(body)
  console.log('isValid:', isValid)
  const { time, curators, channels, tags, eco, ecosystem, refresh, time1 } = req.query;
  const { untrustedData } = req.body

  if (req.method !== 'POST' || !ecosystem || !eco) {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    const params = { time, curators, channels, tags, eco, ecosystem, refresh, time1 }

    const points = '$' + eco

    const curatorFid = req.body.untrustedData.fid
    
    console.log('14-6:', req.query, refresh)

    const postUrl = `${baseURL}/~/ecosystems/${ecosystem}/tip-login?${qs.stringify({ time, curators, eco })}`
       
    let button1 = metaButton(1, 'opt-out', params)
    let button2 = metaButton(2, 'back', params)
    let button3 = ''
    let button4 = ''
    let textField = ``
    let optOutImg = `${baseURL}/api/frames/tip/opt-out-img?${qs.stringify({ status: 'opt-out' })}`
    try {
  
      async function createOptOut(fid) {
        try {
          const newOptOut = new OptOut({
            fid: fid,
            points: [],
            opt_in: false
          });
          await newOptOut.save();
          console.log(`OptOut document created for fid: ${fid}`);
          return true
        } catch (error) {
          console.error("Error creating OptOut document:", error);
          return false
        }
      }

      const optedOut = await createOptOut(curatorFid)

      if (optedOut) {

        optOutImg = `${baseURL}/api/frames/tip/opt-out-img?${qs.stringify({ status: 'opted-out' })}`

        button1 = metaButton(1, 'opt-in', params)
        button2 = metaButton(2, 'back', params)
        button3 = ''
        button4 = ''

      } else {

        optOutImg = `${baseURL}/api/frames/tip/opt-out-img?${qs.stringify({ status: 'opted-in' })}`

        button1 = metaButton(1, 'opt-out', params)
        button2 = metaButton(2, 'back', params)
        button3 = ''
        button4 = ''

      }

      let metatags = button1 + button2 + button3 + button4 + textField + postUrl

      res.setHeader('Content-Type', 'text/html');
      res.status(200)
      .send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${optOutImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${optOutImg}' />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;
     
    } catch (error) {
      console.log('g')

      let metatags = button1 + button2 + button3 + button4 + textField + postUrl

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${optOutImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${optOutImg}' />
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










