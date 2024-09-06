import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';
import Impact from '../../../../models/Impact';
import Quality from '../../../../models/Quality';
import Cast from "../../../../models/Cast";
import EcosystemRules from "../../../../models/EcosystemRules";
// import Allowlist from '../../../../models/Allowlist';
import qs from "querystring";

import { decryptPassword } from "../../../../utils/utils"; 
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {

  const { addImpact, iB, qB, qT, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash, handle, rS } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else if (req.method === 'POST') {
    const points = pt
    const impactAmount = parseInt(addImpact)
    const eco = points?.substring(1)
    // const points = '$' + eco
    const inputText = req.body.untrustedData?.inputText
    const curatorFid = req.body.untrustedData.fid
    const castHash = req.body.untrustedData.castId.hash
    const authorFid = req.body.untrustedData.castId.fid
    const signer = decryptPassword(encryptedBotUuid, secretKey)


    let balanceImg = `${baseURL}/api/frames/console/balance-tip?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu })}`

    let button1 = `<meta property="fc:frame:button:2" content='Refresh' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/test?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem: ec, login, pt, cu, impact, quality: ql, cI, hash, handle, rS })}' />`
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

    async function getQuality(curatorFid, castHash, points) {
      try {
        await connectToDatabase();
        const quality = await Quality.countDocuments({ curator_fid: curatorFid, target_cast_hash: castHash, points })
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

    const quality = await getQuality(curatorFid, castHash, points)

    if (!quality) {

      let channelCuration = false

      async function postImpact(fid, impactAmount, points) {

        async function postUserStatus(fid, points) {
          let remainingImpact = 0

          try {
            await connectToDatabase();
          
            let user = await User.findOne({ fid, ecosystem_points: points }).select('remaining_i_allowance').exec();
            if (user) {
                remainingImpact = user.remaining_i_allowance
                return remainingImpact
            } else {
              return null
            }
          } catch (error) {
            console.error('error', error)
            return null
          }
        }
    
        const userRemainingImpact = await postUserStatus(fid, points)

        if (userRemainingImpact || userRemainingImpact !== 0) {
    
          if (userRemainingImpact >= impactAmount) {
    
            async function updateListings(fid, impactAmount, points) {

              try {
                await connectToDatabase();
                let user = await User.findOne({ fid, ecosystem_points: points }).exec();

                if (user) {
                  user.remaining_i_allowance -= impactAmount
                  
                  let existImpact = 0

                  let impact = await Impact.findOne({ target_cast_hash: castHash, points: points, curator_fid: fid }).exec();
    
                  const saveAll = async (user, impact) => {
                    try {
                      const [savedUser, savedImpact] = await Promise.all([
                        user.save(),
                        impact.save(),
                      ]);

                      return { balance: savedUser.remaining_i_allowance, castImpact: savedImpact.impact_points }
                      
                    } catch (error) {
                      console.error("Error saving lists:", error);
                      return { balance: null, castImpact: null }
                    }
                  }

                  if (impact) {
                    existImpact = impact.impact_points

                    if (impact?.curator_fid == fid) {
                      impact.impact_points += impactAmount
                      let impactTotal = impact.impact_points
                      let curatorCount = 1
                      const { balance, castImpact } = await saveAll(user, impact)
                      return { balance, castImpact, impactTotal, curatorCount, qualityBalance: 0, qualityTotal: 0 }
    
                    } else {
                      return { balance: null, castImpact: null, impactTotal: null, curatorCount: null, qualityBalance: null, qualityTotal: null }
                    }

    
                  } else {
                    return { balance: null, castImpact: null, impactTotal: null, curatorCount: null, qualityBalance: null, qualityTotal: null }
                  }
                  
                } else {
                  return { balance: null, castImpact: null, impactTotal: null, curatorCount: null, qualityBalance: null, qualityTotal: null }
                }
              } catch (error) {
                console.error("Error while saving user, cast and impact objects:", error);
                return { balance: null, castImpact: null, impactTotal: null, curatorCount: null, qualityBalance: null, qualityTotal: null }
              }
            }
    
            const { balance, castImpact, impactTotal, curatorCount, qualityBalance, qualityTotal } = await updateListings(fid, impactAmount, points)
    
            if ((balance || balance == 0) && castImpact) {
              return { balance, castImpact, impactTotal, curatorCount, qualityBalance, qualityTotal }
            } else {
              return { balance: null, castImpact: null, impactTotal: null, curatorCount: null, qualityBalance: null, qualityTotal: null }
            }
          } else {
            return { balance: null, castImpact: null, impactTotal: null, curatorCount: null, qualityBalance: null, qualityTotal: null }
          }
        } else {
          return { balance: null, castImpact: null, impactTotal: null, curatorCount: null, qualityBalance: null, qualityTotal: null }
        }
      }



      // iB: impactBalance, qB: qualityBalance, qT: qualityTotal, iA: impactAllowance, qA: qualityAllowance, impact, quality, cI: castImpact, hash: castHash

      // iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu, impact, quality, cI, hash


      let {balance, castImpact, impactTotal, curatorCount, qualityBalance, qualityTotal} = await postImpact(curatorFid, impactAmount, points)

      if ((balance || balance == 0) && castImpact) {

        // let curatedCast = null

        // if (channelCuration) {
        //   if (impactTotal >= ecosystem.condition_points_threshold &&  curatorCount >= ecosystem.condition_curators_threshold) {

        //     async function curateCast(hash) {
        //       try {
        //         const base = "https://api.neynar.com/";
        //         const url = `${base}v2/farcaster/reaction`;
        //         const response = await fetch(url, {
        //           method: 'POST',
        //           headers: {
        //             accept: "application/json",
        //             api_key: apiKey,
        //             'content-type': 'application/json',
        //           },
        //           body: JSON.stringify({
        //             'signer_uuid': signer,
        //             target: hash,
        //             reaction_type: 'like'
        //           })})
                  
        //         const cast = await response.json();
        //         return cast
        //       } catch (error) {
        //         console.error('Error handling POST request:', error);
        //         return null
        //       }
        //     }
        //     curatedCast = await curateCast(castHash)
        //   }
        // }


        balanceImg = `${baseURL}/api/frames/console/balance-tip?${qs.stringify({ iB: castImpact, qB: qualityBalance, qT: qualityTotal, author, iA: balance, qA, ecosystem: ec, login, pt, cu })}`

        button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact-tip?${qs.stringify({ addImpact: 1, iB: castImpact, qB: qualityBalance, qT: qualityTotal, author, iA: balance, qA, ec, login, pt, cu, impact, ql, cI, hash: castHash, handle, rS })}' />`
        button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact-tip?${qs.stringify({ addImpact: 5, iB: castImpact, qB: qualityBalance, qT: qualityTotal, author, iA: balance, qA, ec, login, pt, cu, impact, ql, cI, hash: castHash, handle, rS })}' />`
        button3 = `<meta property="fc:frame:button:3" content='More >' />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more-tip?${qs.stringify({ iB: castImpact, qB: qualityBalance, qT: qualityTotal, author, iA, qA, ec, login, pt, cu, impact, ql, cI, hash: castHash, handle, rS })}' />`
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