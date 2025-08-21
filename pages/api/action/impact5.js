import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../libs/mongodb";
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Cast from "../../../models/Cast";
import EcosystemRules from "../../../models/EcosystemRules";
import Allowlist from '../../../models/Allowlist';
import OptOut from "../../../models/OptOut";
import { decryptPassword } from "../../../utils/utils"; 
// import { init, validateFramesMessage } from "@airstack/frames";

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY ?? '')
  // const body = await req.body;
  // const {isValid, message} = await validateFramesMessage(body)

  if (req.method === 'POST' && req.body && req.body.untrustedData && req.query.points) {
    const impactAmount = 5
    const eco = req.query.points
    const points = '$' + eco
    // const curatorFid = message?.data?.fid
    const curatorFid = req.body.untrustedData?.fid
    const castHash = req.body.untrustedData.castId.hash
    // const authorFid = message?.data?.frameActionBody?.castId?.fid
    const authorFid = req.body.untrustedData.castId.fid
    const signer = decryptPassword(encryptedBotUuid, secretKey)

    async function checkOptOut(authorFid, points) {
      try {
        await connectToDatabase();
        let optOut = await OptOut.findOne({ fid: authorFid }).exec();
        if (optOut) {
          if (!optOut.opt_in) {
            return true;
          } else if (optOut.points.includes(points)) {
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Error checking opt out:", error);
        return false;
      }
    }

    const authorOptedOut = await checkOptOut(authorFid, points)

    if (authorOptedOut) {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send({
        message: `User opted-out of /impact`
      });
      return;
    }


    async function checkImpactAllowance(curatorFid) {
      try {
        await connectToDatabase();
        let user = await User.findOne({ fid: curatorFid, ecosystem_points: '$IMPACT' }).exec();
        if (user && user.impact_allowance > 0) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error checking opt out:", error);
        return false;
      }
    }

    const curatorImpactAllowance = await checkImpactAllowance(curatorFid)

    if (!curatorImpactAllowance) {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send({
        message: `User has no impact allowance`
      });
      return;
    }

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

      const getCastData = await populateCast(curatorFid, castHash)

      let castContext
      let castMedia = []

      if (getCastData) {

        async function getCastMedia(cast) {
          try {
          
            if (cast) {
              let embeds = cast?.embeds || []
              let frames = cast?.frames || []
              let media = []
    
    
              for (const embed of embeds) {
                if (embed?.metadata?.content_type) {
                  let image = {url: embed?.url, content_type: embed?.metadata?.content_type}
                  media.push(image)
                } else if (embed?.cast_id) {
                  let quote = {url: embed?.cast_id?.hash, content_type: 'quotecast'}
                  media.push(quote)
                }
              }

              for (const frame of frames) {
                if (frame?.image) {
                  let frameImage = {url: frame?.image, content_type: 'frame'}
                  media.push(frameImage)
                }
              }
    
              return media
            } else {
              return []
            }
          } catch (error) {
            console.error('Error handling GET request:', error);
            return []
          }
        }

        castMedia = await getCastMedia(getCastData)

        let userAddress = null
        if (getCastData?.author?.verified_addresses?.eth_addresses?.length > 0) {
          userAddress = getCastData?.author?.verified_addresses?.eth_addresses[0]
        }

        castContext = {
          author_fid: getCastData.author.fid,
          author_pfp: getCastData.author.pfp_url,
          author_username: getCastData.author.username,
          author_display_name: getCastData.author.display_name,
          cast_hash: getCastData.hash,
          cast_text: getCastData.text,
          cast_channel: getCastData.root_parent_url || null,
          channel_id: getCastData?.channel?.id || null,
          wallet: userAddress
        }
      }

      let channelCuration = false

      if (ecosystem?.channels?.length > 0 && castContext?.cast_channel) {
        for (const channel of ecosystem.channels) {
          if (channel.url == castContext.cast_channel) {
            channelCuration = true
          }
        }
      }

      async function postImpact(fid, castContext, impactAmount, points) {

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
        // console.log('5', fid, points)

        if (userRemainingImpact || userRemainingImpact !== 0) {
    
          if (userRemainingImpact >= impactAmount) {
    
            async function updateListings(fid, castContext, impactAmount, points) {
              // console.log(fid, castContext, impactAmount)
              try {
                await connectToDatabase();
                let user = await User.findOne({ fid, ecosystem_points: points }).exec();

                if (user) {
                  user.remaining_i_allowance -= impactAmount
                  
                  let cast = await Cast.findOne({ cast_hash: castContext.cast_hash, points: points }).exec();
    
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

                    try {
                      const [savedUser, savedImpact, savedCast] = await Promise.all([
                        user.save(),
                        impact.save(),
                        cast.save()
                      ]);

                      return { balance: savedUser.remaining_i_allowance, castImpact: cast.impact_total }
                      
                    } catch (error) {
                      console.error("Error saving lists:", error);
                      return { balance: null, castImpact: null }
                    }
                  }

                  if (cast) {
    
                    let impact
    
                    impact = await Impact.findOne({ target_cast_hash: castContext.cast_hash, points: points }).sort({ createdAt: -1 }).exec();

                    if (impact && impact.curator_fid == fid) {
                      impact.impact_points += impactAmount
                      cast.impact_total += impactAmount
                      let impactTotal = cast.impact_total
                      let curatorCount = cast.impact_points.length
                      const { balance, castImpact } = await saveAll(user, impact, cast)
                      return { balance, castImpact, impactTotal, curatorCount }
    
                    } else {
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
                      wallet: castContext?.wallet,
                      channel_id: castContext?.channel_id
                    });

                    cast.cast_media = [...castMedia]
                    cast.points = points

                    const { balance, castImpact } = await saveAll(user, impact, cast)
                    let impactTotal = impactAmount
                    let curatorCount = 1

                    async function nominationCast(user, curator, ecosystem, hash, signer, handle, fid, eco) {
                      try {
                        const base = "https://api.neynar.com/";
                        const url = `${base}v2/farcaster/cast`;
                  
                        let body = {
                          signer_uuid: signer,
                          text: `@${curator} just staked $impact on @${user}'s cast.\n\nSupport @${curator}'s nominees by subscribing to auto-fund their curation.\n\nOpt out of /impact nominations in frame`,
                        };
                        
                        const frameUrl = `https://impact.abundance.id/~/ecosystems/${handle}/tip-v6?time=all&shuffle=true&curators=${fid}&eco=${eco}&referrer=${fid}`

                        body.parent = hash;

                        if (!body.embeds) { body.embeds = []; }
                        body.embeds.push({ url: frameUrl });

                        const response = await fetch(url, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'api_key': apiKey,
                          },
                          body: JSON.stringify(body),
                        });
                        // console.log(response)
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
  
                    if (ecosystem.bot_reply) {
                      nominationCast(castContext.author_username, user.username, ecosystem.ecosystem_name, castContext.cast_hash, signer, ecosystem.ecosystem_handle, fid, eco)
                    }

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
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send({
          message: `Cannot stake points`
        });
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