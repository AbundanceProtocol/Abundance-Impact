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


const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const secretKey = process.env.SECRET_KEY

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
// const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  
  const { untrustedData } = req.body
  const { iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle } = req.query;

  if (req.method === 'POST') {
    const points = pt
    const eco = points?.substring(1)
    const curatorFid = req.body.untrustedData.fid
    // const castHash = req.body.untrustedData.castId.hash
    // const authorFid = req.body.untrustedData.castId.fid
    // console.log('28', points, curatorFid, castHash)

    let autoTipImg = `${baseURL}/api/frames/console/auto-tipping`

    let button1 = `<meta property="fc:frame:button:1" content='Stop auto-tip' />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-stop?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

    let button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

    let button3 = `<meta property="fc:frame:button:3" content='Add curator' />
    <meta property="fc:frame:button:3:action" content="post" />
    <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

    let button4 = `<meta property="fc:frame:button:4" content='< Back' />
    <meta property="fc:frame:button:4:action" content="post" />
    <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

    let textField = `<meta name="fc:frame:input:text" content="Search for curator" />`
    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`
    textField = ``


    async function getUuid(fid) {
      try {
        await connectToDatabase();
        let userData = await User.findOne({ fid, ecosystem_points: points }).select('uuid ecosystem_name').exec();
        
        if (userData && ecoData) {
          return {uuid: userData.uuid, ecosystem: userData.ecosystem_name}
        } else {
          return {uuid: null, ecosystem: null}
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
        return {uuid: null, ecosystem: null}
      }  
    }

    const {uuid, ecosystem} = await getUuid(curatorFid, pt)

    if (!uuid) {

      button1 = `<meta property="fc:frame:button:1" content='Login' />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`

      button2 = `<meta property="fc:frame:button:2" content='Refresh' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/refresh?${qs.stringify({ pt })}' />`

      button3 = `<meta property="fc:frame:button:3" content='< Back' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

      textField = ``

    } else {

      const encryptedUuid = encryptPassword(uuid, secretKey);
      const code = generateRandomString(12)
    
      async function setSchedule(fid, code, points, ecosystem, encryptedUuid) {
        let schedule = null
        try {
          await connectToDatabase();
          schedule = await ScheduleTip.findOne({ fid }).exec();
          if (schedule) {
            schedule.code = code
            schedule.search_shuffle = true
            schedule.search_time = 'all'
            schedule.search_tags = []
            schedule.search_channels = []
            schedule.search_curators = [fid]
            schedule.points = points
            schedule.percent_tip = 100
            schedule.ecosystem_name = ecosystem
            schedule.currencies = ['$DEGEN']
            schedule.schedule_time = "45 18 * * *"
          } else {
            schedule = new ScheduleTip({ 
              fid: fid,
              uuid: encryptedUuid,
              code: code,
              search_shuffle: true,
              search_time: 'all',
              search_tags: [],
              search_channels: [],
              search_curators: [fid],
              points: points,
              percent_tip: 100,
              ecosystem_name: ecosystem,
              currencies: ['$DEGEN'],
              schedule_time: "45 18 * * *",
              schedule_count: 1,
              schedule_total: 1,
            });
          }
  
        } catch (error) {
          console.error("Error while fetching data:", error);
          return null
        }  
  
        let cronId = null
        if (schedule.cron_job_id) {
          console.log(schedule.cron_job_id)
          cronId = schedule.cron_job_id
        }
  
        const cronUrl = `https://www.easycron.com/rest/${cronId ? 'edit' : 'add'}?${qs.stringify({
          token: easyCronKey,
          url: `${baseURL}/api/curation/getScheduledJob?${qs.stringify({ fid, code })}`,
          id: cronId,
          cron_expression: "45 18 * * *",
          timezone_from: 2,
          timezone: 'America/New_York',
          cron_job_name: `${fid}ScheduledTips`,
        })}`;
    
    
        const cronResponse = await fetch(cronUrl)
        console.log(cronResponse)
        if (cronResponse) {
          const getCron = await cronResponse.json()
          console.log(getCron)
          schedule.cron_job_id = getCron.cron_job_id
        }
        schedule.active_cron = true
        await schedule.save()
        return schedule
      }
  
      const schedule = await setSchedule(curatorFid, code, pt, ecosystem, encryptedUuid)
  
      if (schedule) {

        button1 = `<meta property="fc:frame:button:1" content='Stop auto-tip' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-stop?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`
  
        button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        button3 = `<meta property="fc:frame:button:3" content='Add curator' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        button4 = `<meta property="fc:frame:button:4" content='< Back' />
        <meta property="fc:frame:button:4:action" content="post" />
        <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        textField = `<meta name="fc:frame:input:text" content="Search for curator" />`

      } else {

        button1 = `<meta property="fc:frame:button:1" content='Auto-tip' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-self?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        button3 = `<meta property="fc:frame:button:3" content='Find curator' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        button4 = `<meta property="fc:frame:button:4" content='< Back' />
        <meta property="fc:frame:button:4:action" content="post" />
        <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        textField = `<meta name="fc:frame:input:text" content="Search for curator" />`

      }

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