import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../libs/mongodb";
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Cast from "../../../models/Cast";
import EcosystemRules from "../../../models/EcosystemRules";
import Allowlist from '../../../models/Allowlist';

import { decryptPassword } from "../../../utils/utils"; 

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  if (req.method === 'POST' && req.body && req.body.untrustedData && req.query.points) {
    const impactAmount = 1
    const points = '$' + req.query.points
    const curatorFid = req.body.untrustedData.fid
    const castHash = req.body.untrustedData.castId.hash
    // const authorFid = req.body.untrustedData.castId.fid
    const signer = decryptPassword(encryptedBotUuid, secretKey)

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
    // console.log('1', quality)
    if (!quality) {

      async function populateCast(fid, castString) {
        try {
          const base = "https://api.neynar.com/";
          const url = `${base}v2/farcaster/casts?casts=${castString}&viewer_fid=${fid}`;
          const response = await fetch(url, {
            headers: {
              accept: "application/json",
              api_key: apiKey,
            },
          });
          const castData = await response.json();
          // console.log(castData)
          let casts = []
          if (castData?.result?.casts?.length > 0) {
            casts = castData?.result?.casts[0]
          }
          
          return casts
        } catch (error) {
          console.error('Error handling GET request:', error);
          return null
        }
      }
      // console.log('populateCasts:', curatorFid, castHash)

      const getCastData = await populateCast(curatorFid, castHash)
      // console.log('2', getCastData)

      let castContext

      if (getCastData) {
        castContext = {
          author_fid: getCastData.author.fid,
          author_pfp: getCastData.author.pfp_url,
          author_username: getCastData.author.username,
          author_display_name: getCastData.author.display_name,
          cast_hash: getCastData.hash,
          cast_text: getCastData.text,
          cast_channel: getCastData.root_parent_url
        }
      }
      // console.log('2', castContext)

      let channelCuration = false

      if (ecosystem?.channels?.length > 0 && castContext?.cast_channel) {
        for (const channel of ecosystem.channels) {
          if (channel.url == castContext.cast_channel) {
            channelCuration = true
          }
        }
      }
      // console.log('3', channelCuration)


      async function postImpact(fid, castContext, impactAmount, points) {
        // console.log(fid, castContext, impactAmount)

        async function postUserStatus(fid, points) {
          let remainingImpact = 0
          // console.log('4', fid, points)

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
        // console.log('5', fid, points)

        if (userRemainingImpact || userRemainingImpact !== 0) {
          // console.log('9')
    
          if (userRemainingImpact >= impactAmount) {
            // console.log('10')
    
            async function updateListings(fid, castContext, impactAmount, points) {
              // console.log(fid, castContext, impactAmount)
              try {
                await connectToDatabase();
                let user = await User.findOne({ fid, ecosystem_points: points }).exec();
                // console.log('user', user)

                if (user) {
                  // console.log('11', user)
                  user.remaining_i_allowance -= impactAmount
                  
                  let cast = await Cast.findOne({ cast_hash: castContext.cast_hash, points: points }).exec();
                  // console.log('cast1', cast)
    
                  function createdImpact(fid, castContext, impactAmount, points) {
                    const newImpact = new Impact({
                      curator_fid: fid,
                      target_cast_hash: castContext.cast_hash,
                      points: points,
                      creator_fid: castContext.author_fid,
                      impact_points: impactAmount
                    });
                    return newImpact
                  }
                  
    
                  const saveAll = async (user, impact, cast) => {
                    // console.log('save all', cast)

                    try {
                      const [savedUser, savedImpact, savedCast] = await Promise.all([
                        user.save(),
                        impact.save(),
                        cast.save()
                      ]);
                      // console.log('7', savedImpact, savedCast)

                      return { balance: savedUser.remaining_i_allowance, castImpact: cast.impact_total }
                      
                    } catch (error) {
                      console.error("Error saving lists:", error);
                      return { balance: null, castImpact: null }
                    }
                  }

                  if (cast) {
    
                    let impact
    
                    impact = await Impact.findOne({ target_cast_hash: castContext.cast_hash, points: points }).sort({ createdAt: -1 }).exec();
                    // console.log('impact', impact)

                    if (impact && impact.curator_fid == fid) {
                      // console.log('option 1')

                      impact.impact_points += impactAmount
                      cast.impact_total += impactAmount
                      let impactTotal = cast.impact_total
                      let curatorCount = cast.impact_points.length
                      const { balance, castImpact } = await saveAll(user, impact, cast)
                      return { balance, castImpact, impactTotal, curatorCount }
    
                    } else {
                      // console.log('option 2')

                      impact = createdImpact(fid, castContext, impactAmount)
                      cast.impact_total += impactAmount
                      cast.impact_points.push(impact)
                      user.impact_reviews.push(impact)
                      let impactTotal = cast.impact_total
                      let curatorCount = cast.impact_points.length
                      const { balance, castImpact } = await saveAll(user, impact, cast)
                      return { balance, castImpact, impactTotal, curatorCount }
                    }
    
                  } else {
      
                    let impact = createdImpact(fid, castContext, impactAmount, points)
                    // console.log('impact2', impact)
                    // console.log('points', points)
                    cast = new Cast({
                      author_fid: castContext.author_fid,
                      author_pfp: castContext.author_pfp,
                      author_username: castContext.author_username,
                      author_display_name: castContext.author_display_name,
                      points: points,
                      cast_hash: castContext.cast_hash,
                      cast_text: castContext.cast_text,
                      cast_channel: castContext.cast_channel,
                      quality_balance: 0,
                      quality_absolute: 0,
                      impact_total: impactAmount,
                      impact_points: [impact],
                    });

                    cast.points = points
                    // console.log('cast2', cast)

                    const { balance, castImpact } = await saveAll(user, impact, cast)
                    let impactTotal = impactAmount
                    let curatorCount = 1

                    async function nominationCast(user, curator, ecosystem, hash, signer) {
                      try {
                        const base = "https://api.neynar.com/";
                        const url = `${base}v2/farcaster/cast`;
                  
                        let body = {
                          signer_uuid: signer,
                          text: `@${user} has been nominated by @${curator} for contributing to the ${ecosystem} Ecosystem on /impact`,
                        };
                  
                        body.parent = hash;
  
                        const response = await fetch(url, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'api_key': apiKey,
                          },
                          body: JSON.stringify(body),
                        });
                        console.log(response)
                        if (!response.ok) {
                          console.error(`Failed to send nomination`);
                          return false
                        } else {
                          console.log(`Nomination sent successfully`);
                          return true
                        }
  
                      } catch (error) {
                        console.error('Error handling GET request:', error);
                        return false
                      }
                    }
  
                    nominationCast(castContext.author_username, user.username, ecosystem.ecosystem_name, castContext.cast_hash, signer)

                    return { balance, castImpact, impactTotal, curatorCount }
                  }
                  
                } else {
                  // console.log('18')
                  return { balance: null, castImpact: null, impactTotal: null, curatorCount: null }
                }
              } catch (error) {
                console.error("Error while saving user, cast and impact objects:", error);
                return { balance: null, castImpact: null, impactTotal: null, curatorCount: null }
              }
            }
    
            const { balance, castImpact, impactTotal, curatorCount } = await updateListings(fid, castContext, impactAmount, points)
    
            if ((balance || balance == 0) && castImpact) {
              // console.log('19')
              return { balance, castImpact, impactTotal, curatorCount }
            } else {
              // console.log('20')
              return { balance: null, castImpact: null, impactTotal: null, curatorCount: null }
            }
          } else {
            return { balance: null, castImpact: null, impactTotal: null, curatorCount: null }
          }
        } else {
          return { balance: null, castImpact: null, impactTotal: null, curatorCount: null }
        }
      }

      let {balance, castImpact, impactTotal, curatorCount} = await postImpact(curatorFid, castContext, impactAmount, points)
      // console.log(balance, castImpact)
      // console.log(balance, castImpact, impactTotal, curatorCount)
      if ((balance || balance == 0) && castImpact) {

        let curatedCast = null

        if (channelCuration) {
          if (impactTotal >= ecosystem.condition_points_threshold &&  curatorCount >= ecosystem.condition_curators_threshold) {

            async function curateCast(hash) {
              try {
                // console.log(hash)
          
                const base = "https://api.neynar.com/";
                const url = `${base}v2/farcaster/reaction`;
                const response = await fetch(url, {
                  method: 'POST',
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

        try {
          res.setHeader('Content-Type', 'text/html');
          res.status(200).send({
            message: `Cast Impact: ${castImpact} / Balance: ${balance}`
          });
        } catch (error) {
            console.error(error);
            res.setHeader('Allow', ['POST']);
            res.status(200).send(`Request failed`);
          }

      } else {
        res.setHeader('Allow', ['POST']);
        res.status(200).send(`Request failed`);
      }
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send({
        message: `Can't add Impact to reviewed cast`
      });
    }

  } else {
      res.setHeader('Allow', ['POST']);
      res.status(401).end(`Request failed`);
  }
}