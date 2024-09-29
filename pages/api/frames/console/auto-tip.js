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
import { init, validateFramesMessage } from "@airstack/frames";

const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const secretKey = process.env.SECRET_KEY

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
// const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.json()
  const {isValid} = await validateFramesMessage(body)
  console.log('isValid:', isValid)
  const { untrustedData } = req.body
  const { iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO } = req.query;

  if (req.method === 'POST') {
    const points = pt
    const eco = points?.substring(1)
    const curatorFid = req.body.untrustedData.fid
    // const castHash = req.body.untrustedData.castId.hash
    // const authorFid = req.body.untrustedData.castId.fid
    // console.log('28', points, curatorFid, castHash)

    let autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'off', curators: [], points: pt })}`

    let button1 = `<meta property="fc:frame:button:1" content='Stop auto-tip' />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-stop?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

    let button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

    // let button3 = `<meta property="fc:frame:button:3" content='Add curator' />
    // <meta property="fc:frame:button:3:action" content="post" />
    // <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

    let button3 = `<meta property="fc:frame:button:3" content='< Back' />
    <meta property="fc:frame:button:3:action" content="post" />
    <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

    let button4 = ''

    // let textField = `<meta name="fc:frame:input:text" content="Search for curator" />`
    let textField = ``
    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

    async function getUuid(fid, points) {
      try {
        await connectToDatabase();
        let userData = await User.findOne({ fid, ecosystem_points: points }).select('uuid ecosystem_name').exec();
        
        if (userData) {
          return {encryptedUuid: userData.uuid, ecosystem: userData.ecosystem_name}
        } else {
          return {encryptedUuid: null, ecosystem: null}
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
        return {encryptedUuid: null, ecosystem: null}
      }  
    }

    const {encryptedUuid, ecosystem} = await getUuid(curatorFid, pt)

    if (!encryptedUuid) {

      autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'off', curators: [], points: pt })}`
      console.log('77', autoTipImg)

      button1 = `<meta property="fc:frame:button:1" content='Login' />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`

      button2 = `<meta property="fc:frame:button:2" content='Refresh' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/refresh?${qs.stringify({ pt })}' />`

      button3 = `<meta property="fc:frame:button:3" content='< Back' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

      textField = ``

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
          autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'curators', curators: schedule?.search_curators, points: pt })}`
          console.log('191', autoTipImg)
        } else {
          autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'all', curators: [], points: pt })}`
          console.log('193', autoTipImg)
        }

        button1 = `<meta property="fc:frame:button:1" content='Stop auto-tip' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-stop?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`
  
        button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

        // button3 = `<meta property="fc:frame:button:3" content='Add curator' />
        // <meta property="fc:frame:button:3:action" content="post" />
        // <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

        button3 = `<meta property="fc:frame:button:3" content='< Back' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

        // textField = `<meta name="fc:frame:input:text" content="Search for curator" />`

      } else {

        autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'off', curators: [], points: pt })}`
        console.log('216', autoTipImg)
        button1 = `<meta property="fc:frame:button:1" content='Auto-tip' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-self?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

        button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

        // button3 = `<meta property="fc:frame:button:3" content='Find curator' />
        // <meta property="fc:frame:button:3:action" content="post" />
        // <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

        button3 = `<meta property="fc:frame:button:3" content='< Back' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

        // textField = `<meta name="fc:frame:input:text" content="Search for curator" />`

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