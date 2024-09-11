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
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const secretKey = process.env.SECRET_KEY

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
// const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  
  const { untrustedData } = req.body
  const { time, curators, eco, ecosystem } = req.query;

  if (req.method === 'POST') {
    const params = { time, curators, eco, ecosystem }
    const points = pt
    const eco = points?.substring(1)
    const curatorFid = req.body.untrustedData.fid

    let autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'all', curators: [], points })}`

    let button1 = metaButton(1, 'auto-tip', params)
    let button2 = metaButton(2, 'auto-tip-all', params)
    let button3 = metaButton(3, 'back', params)
    let button4 = ''
    let textField = ''

    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

    async function pauseSchedule(fid) {
    
      async function getSchedule(fid) {
        try {
          await connectToDatabase();
          let schedule = await ScheduleTip.findOne({ fid }).exec();
          if (schedule) {
            schedule.active_cron = false
            schedule.save()
            return schedule
          } else {
            return null
          }

        } catch (error) {
          console.error("Error while fetching data:", error);
          return null
        }
      }

      async function updateCron(cronId) {
        try {
          const updatedCron = `https://www.easycron.com/rest/disable?${qs.stringify({
            token: easyCronKey,
            id: cronId,
          })}`;
    
          const cronResponse = await fetch(updatedCron)
    
          if (cronResponse) {
            const cronData = await cronResponse.json()
            console.log('89', cronData)
            if (cronData.status == 'success') {
              console.log('91', cronData)
              return true
            }
          }
          return null
        } catch (error) {
          console.error('Error:', error);
          return null
        }
      }

      const schedule = await getSchedule(fid)

      if (schedule?.cron_job_id) {
        const updatedCron = await updateCron(schedule?.cron_job_id)
        if (updatedCron) {
          return {schedCurators: schedule.curators, isPaused: true}
        } else {
          return {schedCurators: schedule.curators, isPaused: null}
        }
      } else {
        return {schedCurators: [], isPaused: null}
      }
    }

    const {schedCurators, isPaused} = await pauseSchedule(curatorFid)


    if (!isPaused) {

      if (schedCurators) {
        autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'curators', curators: schedCurators, points })}`
      } else {
        autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'all', curators: [], points })}`
      }

      button1 = metaButton(1, 'auto-tip-stop', params)
      button2 = metaButton(2, 'auto-tip-all', params)
      button3 = metaButton(3, 'back', params)
      button4 = ''

    } else {

      autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points })}`

      button1 = metaButton(1, 'auto-tip', params)
      button2 = metaButton(2, 'auto-tip-all', params)
      button3 = metaButton(3, 'back', params)
      button4 = ''

    }  
    
    let metatags = button1 + button2 + button3 + button4 + textField + postUrl

    try {

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