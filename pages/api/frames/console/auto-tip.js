import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";

import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';
import Impact from '../../../../models/Impact';
import Quality from '../../../../models/Quality';
import Cast from "../../../../models/Cast";
import EcosystemRules from "../../../../models/EcosystemRules";
import ScheduleTip from "../../../../models/ScheduleTip";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
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


    async function getTipSchedule(fid) {
      try {
        await connectToDatabase();

        let schedule = await ScheduleTip.findOne({ fid }).select('_id search_curators').exec();

        if (schedule) {
          return {schedule, curators: schedule.search_curators}
        } else {
          return {schedule: null, curators: null}
        }
    
      } catch (error) {
        console.error("Error getting data:", error);
        return {schedule: null, curators: null}
      }
    }

    const {schedule, curators} = await getTipSchedule(curatorFid)

    if (schedule) {

      if (curators?.length > 0) {

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

        button1 = `<meta property="fc:frame:button:1" content='Stop auto-tip' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/auto-tip-stop?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`
  
        button2 = `<meta property="fc:frame:button:2" content='Find curator' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/auto-tip-search?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        button3 = `<meta property="fc:frame:button:3" content='< Back' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle })}' />`

        button4 = ''

        textField = `<meta name="fc:frame:input:text" content="Search for curator" />`
      }

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

    // let balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ecosystem: ecoName, login: needLogin, pt: points, cu: curator })}`


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