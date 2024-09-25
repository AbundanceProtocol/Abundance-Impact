import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import Impact from '../../../../models/Impact';
import Quality from '../../../../models/Quality';
import Cast from "../../../../models/Cast";
import EcosystemRules from "../../../../models/EcosystemRules";
import qs from "querystring";

import { decryptPassword } from "../../../../utils/utils"; 
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {

  const { removeImpact, iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else if (req.method === 'POST') {
    const points = pt
    const impactAmount = parseInt(removeImpact)
    const eco = points?.substring(1)
    // const points = '$' + eco
    const inputText = req.body.untrustedData?.inputText
    const curatorFid = req.body.untrustedData.fid
    const castHash = req.body.untrustedData.castId.hash
    const authorFid = req.body.untrustedData.castId.fid
    const signer = decryptPassword(encryptedBotUuid, secretKey)
    console.log(inputText)

    let balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu })}`

    let button1 = `<meta property="fc:frame:button:2" content='Refresh' />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/test?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu, impact, quality: ql, cI, hash, handle, rS, oO })}' />`
    let button2 = ''
    let button3 = ''
    let button4 = ''
    let textField = ''
    balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu })}`

    button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`
    button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`
    button3 = `<meta property="fc:frame:button:3" content='-1 Unstake' />
    <meta property="fc:frame:button:3:action" content="post" />
    <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/unstake?${qs.stringify({ removeImpact: 1, iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`
    button4 = `<meta property="fc:frame:button:4" content='More >' />
    <meta property="fc:frame:button:4:action" content="post" />
    <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS, oO })}' />`

    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

    let metatags = button1 + button2 + button3 + button4 + textField + postUrl

    async function getEcosystem(points) {
      try {
        await connectToDatabase();
        const ecosystem = await EcosystemRules.findOne({ ecosystem_points_name: points }).exec();
        return ecosystem
      } catch (error) {
        console.error('Error retrieving ecosystem', error)
        return null
      }
    }

    const ecosystem = await getEcosystem(points)

    async function getQuality(castHash, points) {
      try {
        await connectToDatabase();
        const quality = await Quality.countDocuments({ target_cast_hash: castHash, points })
        if (quality > 0) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error('Error handling request:', error);
        return false
      }
    }

    const quality = await getQuality(castHash, points)

    if (!quality) {

      let channelCuration = false

      async function unstakeImpact(curatorFid, castHash,impactAmount, points) {

        try {
          await connectToDatabase();
          const impact = await Impact.findOne({ curator_fid: curatorFid, target_cast_hash: castHash, points }).exec()
          const cast = await Cast.findOne({ cast_hash: castHash, points }).exec()

          if (impact?.impact_points >= impactAmount && cast?.impact_total >= impactAmount) {
            cast.impact_total -= impactAmount
            impact.impact_points -= impactAmount
            if (impact.impact_points == 0) {
              await impact.deleteOne()
              const impactIndex = cast.impact_points.indexOf(impact._id);
              if (impactIndex > -1) {
                cast.impact_points.splice(impactIndex, 1);
              }
              cast.save()
              return {castImpact: cast.impact_total, curatorCount: cast.impact_points.length, castChannel: cast.cast_channel, curatorImpact: 0}
            } else {
              await Promise.all([
                impact.save(),
                cast.save()
              ]);
              return {castImpact: cast.impact_total, curatorCount: cast.impact_points.length, castChannel: cast.cast_channel, curatorImpact: impact.impact_points}
            }
          } else {
            return {castImpact: iB, curatorCount: ecosystem.condition_curators_threshold, castChannel: null, curatorImpact: 0}
          }
        } catch (error) {
          console.error('Error handling request:', error);
          return {castImpact: iB, curatorCount: ecosystem.condition_curators_threshold, castChannel: null, curatorImpact: 0}
        }
      }

      let {castImpact, curatorCount, castChannel, curatorImpact} = await unstakeImpact(curatorFid, castHash, impactAmount, points)

      if (ecosystem?.channels?.length > 0 && castChannel) {
        for (const channel of ecosystem.channels) {
          if (channel.url == castChannel) {
            channelCuration = true
          }
        }
      }

      let curatedCast = null

      if (channelCuration) {
        if (impactTotal < ecosystem.condition_points_threshold || curatorCount < ecosystem.condition_curators_threshold) {

          async function curateCast(hash) {
            try {
              const base = "https://api.neynar.com/";
              const url = `${base}v2/farcaster/reaction`;
              const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  accept: "application/json",
                  api_key: apiKey,
                  'content-type': 'application/json',
                },
                body: JSON.stringify({
                  'signer_uuid': signer,
                  target: hash,
                  reaction_type: 'like'
                })})
                
              const cast = await response.json();
              return cast
            } catch (error) {
              console.error('Error handling POST request:', error);
              return null
            }
          }
          curatedCast = await curateCast(castHash)
        }
      }

      balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB: castImpact, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu })}`

      if (curatorImpact > 0) {
        button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: curatorImpact, ql, cI, hash: castHash, handle, rS: true })}' />`
        button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: curatorImpact, ql, cI, hash: castHash, handle, rS: true })}' />`
        button3 = `<meta property="fc:frame:button:3" content='-1 Unstake' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/unstake?${qs.stringify({ removeImpact: 1, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: curatorImpact, ql, cI, hash: castHash, handle, rS: true })}' />`
        button4 = `<meta property="fc:frame:button:4" content='More >' />
        <meta property="fc:frame:button:4:action" content="post" />
        <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: curatorImpact, ql, cI, hash: castHash, handle, rS: true })}' />`
        textField = ``
      } else if (curatorImpact == 0 && castImpact == 0) {
        button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: curatorImpact, ql, cI, hash: castHash, handle, rS: true })}' />`
        button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: curatorImpact, ql, cI, hash: castHash, handle, rS: true })}' />`
        button3 = `<meta property="fc:frame:button:3" content='More >' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: 0, qB, qT, author, iA, qA, ec, login, pt, cu, impact: 0, ql, cI, hash: castHash, handle, rS: false })}' />`
        button4 = ``
        textField = `<meta name="fc:frame:input:text" content="Add comment to nomination" />`
      } else if (curatorImpact == 0 && castImpact > 0) {
        button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: 0, ql, cI, hash: castHash, handle, rS: false })}' />`
        button2 = `<meta property="fc:frame:button:2" content='Upvote' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: 1, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: 0, ql, cI, hash: castHash, handle, rS: false })}' />`
        button3 = `<meta property="fc:frame:button:3" content='Downvote' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: -1, iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: 0, ql, cI, hash: castHash, handle, rS: false })}' />`
        button4 = `<meta property="fc:frame:button:4" content='More >' />
        <meta property="fc:frame:button:4:action" content="post" />
        <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: castImpact, qB, qT, author, iA, qA, ec, login, pt, cu, impact: 0, ql, cI, hash: castHash, handle, rS: false })}' />`
      }

      metatags = button1 + button2 + button3 + button4 + textField + postUrl

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
              <meta property='og:image' content='${balanceImg}' />
              <meta property="fc:frame:image:aspect_ratio" content="1:1" />
              <meta property="fc:frame:image" content='${balanceImg}' />
              ${metatags}
            </head>
            <body>
              <div>Tip frame</div>
            </body>
          </html>
        `);
        return;

      } catch (error) {
        console.log('error', error)
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Impact Nav</title>
              <meta name="fc:frame" content="vNext">
              <meta property="og:title" content="Impact Nav">
              <meta property='og:image' content='${balanceImg}' />
              <meta property="fc:frame:image:aspect_ratio" content="1:1" />
              <meta property="fc:frame:image" content='${balanceImg}' />
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
      res.setHeader('Content-Type', 'text/html');
      res.status(200)
      .send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${balanceImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${balanceImg}' />
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