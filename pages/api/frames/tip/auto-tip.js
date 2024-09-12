import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";

import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';
import Impact from '../../../../models/Impact';
import Quality from '../../../../models/Quality';
import Cast from "../../../../models/Cast";
import EcosystemRules from "../../../../models/EcosystemRules";
import ScheduleTip from "../../../../models/ScheduleTip";
import { encryptPassword, generateRandomString } from '../../../../utils/utils'
import { metaButton } from '../../../../utils/frames'

const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const secretKey = process.env.SECRET_KEY

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
// const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  
  const { untrustedData } = req.body
  const { time, curators, eco, ecosystem } = req.query;

  if (req.method === 'POST') {
    const params = { time, curators, eco, ecosystem }
    const points = '$' + eco
    const curatorFid = req.body.untrustedData.fid
    // const castHash = req.body.untrustedData.castId.hash
    // const authorFid = req.body.untrustedData.castId.fid
    console.log('28', time, curators, eco, ecosystem)

    let autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points, add: curators })}`

    let button1 = metaButton(1, 'auto-tip-all', params)
    let button2 = metaButton(2, 'auto-tip-add', params)
    let button3 = metaButton(3, 'auto-tip-stop', params)
    let button4 = metaButton(4, 'back', params)

    // let textField = `<meta name="fc:frame:input:text" content="Search for curator" />`
    let textField = ``
    let postUrl = `<meta name="fc:frame:post_url" content='${baseURL}' />`

    console.log('58', ecosystem, eco)

    async function getUuid(fid, points) {
      try {
        await connectToDatabase();
        let userData = await User.findOne({ fid, ecosystem_points: points }).select('uuid').exec();
        
        if (userData) {
          return userData.uuid
        } else {
          return null
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
        return null
      }  
    }

    const encryptedUuid = await getUuid(curatorFid, points)

    if (!encryptedUuid) {

      autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points, needLogin: true })}`
      console.log('77', autoTipImg)

      button1 = metaButton(1, 'login', params, points)
      button2 = metaButton(2, 'refresh', params)
      button3 = metaButton(3, 'back', params)
      button4 = ''
      textField = ''

    } else {

      const code = generateRandomString(12)
    
      async function getSchedule(fid) {
        try {
          await connectToDatabase();
          const schedule = await ScheduleTip.findOne({ fid }).select('search_curators active_cron').exec();
          if (schedule) {
            return schedule;
          } else {
            return null
          }
        } catch (error) {
          console.error("Error while fetching schedule:", error);
          return null;  
        }
      }

      const schedule = await getSchedule(curatorFid)
  
      if (schedule?.active_cron) {

        if (schedule?.search_curators?.length > 0) {

          let curatorsMatch = false;
          if (schedule?.search_curators && schedule.search_curators.length > 0) {
            const curatorArray = Array.isArray(curators) ? curators : [curators];
            curatorsMatch = curatorArray.some(curator => 
              schedule.search_curators.some(searchCurator => 
                String(searchCurator) === String(curator)
              )
            );
          }

          if (curatorsMatch) {

            autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'curators', curators: schedule?.search_curators, points, remove: curators })}`

            if (curators) {

              button1 = metaButton(1, 'auto-tip-all', params)
              button2 = metaButton(2, 'auto-tip-remove', params)
              button3 = metaButton(3, 'auto-tip-stop', params)
              button4 = metaButton(4, 'back', params)

            } else {

              button1 = metaButton(1, 'auto-tip-all', params)
              button2 = metaButton(2, 'auto-tip-stop', params)
              button3 = metaButton(3, 'back', params)
              button4 = ''

            }

          } else {

            autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'curators', curators: schedule?.search_curators, points, add: curators })}`
            console.log('193', autoTipImg)


            if (curators) {

              button1 = metaButton(1, 'auto-tip-all', params)
              button2 = metaButton(2, 'auto-tip-add', params)
              button3 = metaButton(3, 'auto-tip-stop', params)
              button4 = metaButton(4, 'back', params)

            } else {

              button1 = metaButton(1, 'auto-tip-all', params)
              button2 = metaButton(2, 'auto-tip-stop', params)
              button3 = metaButton(3, 'back', params)
              button4 = ''
            }

          }

        } else {
          autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'all', curators: [], points, add: curators, needLogin: false })}`
          console.log('193', autoTipImg)
  
          if (curators) {
      
            button1 = metaButton(1, 'auto-tip-self', params)
            button2 = metaButton(2, 'auto-tip-add', params)
            button3 = metaButton(3, 'auto-tip-stop', params)
            button4 = metaButton(4, 'back', params)

          } else {
            
            button1 = metaButton(1, 'auto-tip-self', params)
            button2 = metaButton(2, 'auto-tip-stop', params)
            button3 = metaButton(3, 'back', params)
            button4 = ''

          }

        }

      } else {

        autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points, add: curators })}`
        console.log('216', autoTipImg)

        button1 = metaButton(1, 'auto-tip', params)
        button2 = metaButton(2, 'auto-tip-all', params)

        if (curators) {

          button3 = metaButton(3, 'auto-tip-add', params)
          button4 = metaButton(4, 'back', params)

        } else {

          button3 = metaButton(3, 'back', params)
          button4 = ''

        }

      }

    }  
    
    let metatags = button1 + button2 + button3 + button4 + textField + postUrl

    try {

      console.log('autoTipImg1', autoTipImg)

      res.setHeader('Content-Type', 'text/html');
      res.status(200)
      .send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${autoTipImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${autoTipImg}' />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;

    } catch (error) {

      console.log('autoTipImg2', autoTipImg)

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${autoTipImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${autoTipImg}' />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;
    }

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(401).send(`Request failed`);
  }
}