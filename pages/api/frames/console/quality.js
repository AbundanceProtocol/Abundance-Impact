import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';
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

  const { addQuality, iB, qB, qT, author, iA, qA, ec, login, pt, cu, im, ql, cI, hash, handle, rS } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else if (req.method === 'POST') {
    const points = pt
    const qualityAmount = parseInt(addQuality)
    const eco = points?.substring(1)
    const curatorFid = req.body.untrustedData.fid
    const castHash = req.body.untrustedData.castId.hash
    const authorFid = req.body.untrustedData.castId.fid
    const signer = decryptPassword(encryptedBotUuid, secretKey)


    let balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu })}`

    let button1 = `<meta property="fc:frame:button:2" content='Refresh' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/test?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu, impact: 0, quality: 1, cI, hash, handle, rS })}' />`
    let button2 = ''
    let button3 = ''
    let button4 = ''
    let textField = ''
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

    async function getImpact(curatorFid, castHash, points) {
      try {
        await connectToDatabase();
        const impact = await Impact.countDocuments({ curator_fid: curatorFid, target_cast_hash: castHash, points })
        if (impact > 0) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error('Error handling request:', error);
        return false
      }
    }

    const impact = await getImpact(curatorFid, castHash, points)
    
    if (!impact) {

      let channelCuration = false

      await connectToDatabase();
        
      const user = await User.findOne({ fid: curatorFid, ecosystem_points: points }).exec();

      if (!user) {
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
      } else {

        const userRemainingQuality = user.remaining_q_allowance
  
        if (userRemainingQuality && userRemainingQuality !== 0) {
  
          async function updateListings(fid, castHash, qualityAmount, points) {

            const absQuailty = Math.abs(qualityAmount)
            
            try {
              await connectToDatabase();
              
              let cast = await Cast.findOne({ cast_hash: castHash, points: points }).exec()
              
              // cast has no impact score - not reviewed
              if (!cast || cast.impact_points.length == 0) {
                return null
                
                // cast exists and has impact points
              } else {

                let castChannel = cast.cast_channel

                if (ecosystem?.channels?.length > 0 && castChannel) {
                  for (const channel of ecosystem.channels) {
                    if (channel.url == castChannel) {
                      channelCuration = true
                    }
                  }
                }

                const saveAll = async (user, quality, cast) => {
                  // console.log('saveAll')
                  try {
                    const [savedUser, savedQuality, savedCast] = await Promise.all([
                      user.save(),
                      quality.save(),
                      cast.save()
                    ]);
                    const userBalance = savedUser.remaining_q_allowance
                    const addedPoints = savedQuality.quality_points
                    const castAbsoluteQ = savedCast.quality_absolute
                    const castTotalI = savedCast.impact_total
                    const castBalanceQ = savedCast.quality_balance

                    return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ }
                  } catch (error) {
                    console.error("Error saving lists:", error);
                    return null
                  }
                }
  
                let user = await User.findOne({ fid, ecosystem_points: points }).exec();
                
                if (user) {
                  
                  if (qualityAmount < 0 && cast.impact_total < absQuailty) {
                    
                    let adjustedQuality = cast.impact_total
                    
                    const newQuality = new Quality({
                      curator_fid: fid,
                      points: points,
                      target_cast_hash: castHash,
                      quality_points: adjustedQuality * -1,
                    });

                    user.remaining_q_allowance -= adjustedQuality
                    user.quality_reviews.push(newQuality)
                    cast.quality_balance += adjustedQuality
                    cast.quality_absolute += absQuailty
                    cast.quality_points.push(newQuality)
                    cast.impact_total = 0
                    let impactTotal = 0

  
                    const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ } = await saveAll(user, newQuality, cast)
                    return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, impactTotal, qualityBalance: cast.quality_balance, qualityTotal: cast.quality_absolute }
  
                  } else {
  
                    const newQuality = new Quality({
                      curator_fid: fid,
                      target_cast_hash: castHash,
                      quality_points: qualityAmount,
                      points: points
                    });
                    // console.log('279:', qualityAmount, absQuailty)
                    user.remaining_q_allowance -= absQuailty
                    user.quality_reviews.push(newQuality)
                    cast.quality_balance += qualityAmount
                    cast.quality_absolute += absQuailty
                    cast.quality_points.push(newQuality)
                    cast.impact_total += qualityAmount
                    let impactTotal = cast.impact_total

                    const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ } = await saveAll(user, newQuality, cast)
                    return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, impactTotal, qualityBalance: cast.quality_balance, qualityTotal: cast.quality_absolute }
                  }
                  
                // no user
                } else {
                  return { userBalance: null, addedPoints: null, castAbsoluteQ: null, castTotalI: null, castBalanceQ: null, impactTotal: null, qualityBalance: null, qualityTotal: null }
                }
              }
            } catch (error) {
              console.error("Error saving lists:", error);
              return { userBalance: null, addedPoints: null, castAbsoluteQ: null, castTotalI: null, castBalanceQ: null, impactTotal: null, qualityBalance: null, qualityTotal: null }
            }
          }
  
          const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, impactTotal, qualityBalance, qualityTotal } = await updateListings(curatorFid, castHash, qualityAmount, points)
  
          let curatedCast = null

          if (channelCuration) {
            if (impactTotal < ecosystem.condition_points_threshold) {

              async function curateCast(hash) {
                const signer = decryptPassword(encryptedBotUuid, secretKey)
                try {
                  // console.log(hash)
            
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
                  // console.log(cast)
                  return cast
                } catch (error) {
                  console.error('Error handling POST request:', error);
                  return null
                }
              }
              curatedCast = await curateCast(castHash)
            }
          }


          balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB: impactTotal, qB: qualityBalance, qT: qualityTotal, author, iA, qA: userBalance, ecosystem: ec, login, pt, cu })}`

          button1 = `<meta property="fc:frame:button:1" content='Upvote' />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: 1, iB: impactTotal, qB: qualityBalance, qT: qualityTotal, author, iA, qA: userBalance, ec, login, pt, cu, impact: 0, ql: 1, cI, hash: castHash, handle, rS: false })}' />`
          button2 = `<meta property="fc:frame:button:2" content='Downvote' />
          <meta property="fc:frame:button:2:action" content="post" />
          <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: -1, iB: impactTotal, qB: qualityBalance, qT: qualityTotal, author, iA, qA: userBalance, ec, login, pt, cu, impact: 0, ql: 1, cI, hash: castHash, handle, rS: false })}' />`
          button3 = `<meta property="fc:frame:button:3" content='More >' />
          <meta property="fc:frame:button:3:action" content="post" />
          <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: impactTotal, qB: qualityBalance, qT: qualityTotal, author, iA, qA: userBalance, ec, login, pt, cu, impact: 0, ql: 1, cI, hash: castHash, handle, rS: false })}' />`
          textField = ``
      
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

            res.setHeader('Content-Type', 'text/html');
            res.status(500).send(`
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
  }
}