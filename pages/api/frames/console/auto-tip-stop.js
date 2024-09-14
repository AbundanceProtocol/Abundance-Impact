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
  const { iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS } = req.query;

  if (req.method === 'POST') {
    const points = pt
    const eco = points?.substring(1)
    const curatorFid = req.body.untrustedData.fid

    let autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'all', curators: [], points: pt })}`

    let button1 = `<meta property="fc:frame:button:1" content='Auto-tip' />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-self?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

    let button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

    // let button3 = `<meta property="fc:frame:button:3" content='Find curator' />
    // <meta property="fc:frame:button:3:action" content="post" />
    // <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

    let button3 = `<meta property="fc:frame:button:3" content='< Back' />
    <meta property="fc:frame:button:3:action" content="post" />
    <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

    let button4 = ''

    // let textField = `<meta name="fc:frame:input:text" content="Search for curator" />`
    let textField = ''
    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`
    textField = ``

    async function pauseSchedule(fid) {
      try {
        await connectToDatabase();
        let schedule = await ScheduleTip.findOne({ fid }).exec();
        if (schedule) {
          schedule.active_cron = false
          schedule.save()
          return {curators: schedule.curators, isPaused: true}
        } else {
          return {curators: [], isPaused: null}
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
        return {curators: [], isPaused: null}
      }
    }

    const {curators, isPaused} = await pauseSchedule(curatorFid)

    if (!isPaused) {

      if (curators) {
        autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'curators', curators: curators, points: pt })}`
      } else {
        autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'all', curators: [], points: pt })}`
      }

      button1 = `<meta property="fc:frame:button:1" content='Stop auto-tip' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-stop?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      // button3 = `<meta property="fc:frame:button:3" content='Add curator' />
      // <meta property="fc:frame:button:3:action" content="post" />
      // <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      button3 = `<meta property="fc:frame:button:3" content='< Back' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      // textField = `<meta name="fc:frame:input:text" content="Search for curator" />`

    } else {

      autoTipImg = `${baseURL}/api/frames/console/auto-tipping?${qs.stringify({ status: 'off', curators: [], points: pt })}`

      button1 = `<meta property="fc:frame:button:1" content='Auto-tip' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-self?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      button2 = `<meta property="fc:frame:button:2" content='Auto-tip all' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-all?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      // button3 = `<meta property="fc:frame:button:3" content='Find curator' />
      // <meta property="fc:frame:button:3:action" content="post" />
      // <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      button3 = `<meta property="fc:frame:button:3" content='< Back' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS })}' />`

      // textField = `<meta name="fc:frame:input:text" content="Search for curator" />`

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