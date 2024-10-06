import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
const apiKey = process.env.NEYNAR_API_KEY
import connectToDatabase from "../../../libs/mongodb";
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Cast from "../../../models/Cast";
import Allowlist from '../../../models/Allowlist';
import OptOut from "../../../models/OptOut";
import { getCurrentDateUTC } from "../../../utils/utils"; 
import { init, validateFramesMessage } from "@airstack/frames";

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)

  if (req.method === 'POST' && req.body && req.body.untrustedData && req.query.p) {
    const impactAmount = Number(req.query.p)
    const curatorFid = message?.data?.fid
    const castHash = req.body.untrustedData.castId.hash
    const authorFid = message?.data?.frameActionBody?.castId?.fid

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

    async function getQuality(curatorFid, castHash) {
      try {
        await connectToDatabase();
        const quality = await Quality.countDocuments({ curator_fid: curatorFid, target_cast_hash: castHash })
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

    const quality = await getQuality(curatorFid, castHash)

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
          console.log(castData)
          let casts = []
          if (castData && castData.result && castData.result.casts.length > 0) {
            casts = castData.result.casts[0]
          }
          
          return casts
        } catch (error) {
          console.error('Error handling GET request:', error);
          return null
        }
      }
      console.log('populateCasts:', curatorFid, castHash)

      const getCastData = await populateCast(curatorFid, castHash)
      console.log('getCastData:', getCastData)

      let castContext
      let channel = null
      if (getCastData) {
        // if (getCastData.root_parent_url) {
        //   const isChannel = getCastData.root_parent_url.slice(0,31)
        //   if (isChannel == 'https://warpcast.com/~/channel/') {
        //     channel = getCastData.root_parent_url
        //   }
        // }

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


      async function postImpact(fid, castContext, impactAmount) {
        // console.log(fid, castContext, impactAmount)

        

        async function postUserStatus(fid) {
          let remainingImpact = 0
          // console.log(fid)
          
          const currentDate = getCurrentDateUTC();
          
          let midnight = new Date(currentDate);
          midnight.setUTCHours(0, 0, 0, 0);
          
          // Set top range to last midnight UTC
          const dateTopRange = midnight
          
          // Set to next midnight UTC
          midnight.setUTCDate(midnight.getUTCDate() + 1);
    
          
          try {
            await connectToDatabase();
          
            let user = await User.findOne({ fid }).exec();
            if (user) {
              // console.log('2')
    
              if (user.next_update < currentDate) {
                // console.log('3')
    
                const userDate = new Date(user.next_update);
    
                // Set bottom range to 24 prior to last update
                const dateBottomRange = new Date(userDate.getTime() - (24 * 60 * 60 * 1000));
      
                const qualityScoresInRange = user.quality_score.filter(score =>
                  score.createdAt >= dateBottomRange && score.createdAt <= dateTopRange
                );
                const totalQualityPoints = qualityScoresInRange.reduce((sum, score) => sum + score.quality_points, 0);
                let updatedAllowance = 0
                let qualityBonus = 0
                if (user.remaining_q_allowance == 0) {
                  qualityBonus = Math.ceil(user.impact_allowance * 0.08)
                }
                if (totalQualityPoints < 0 && user.impact_allowance < 420 && Math.abs(totalQualityPoints * 4) > user.impact_allowance) {
                  updatedAllowance = Math.ceil(user.impact_allowance * 0.75)
                  user.quality_score_change = updatedAllowance - user.impact_allowance + qualityBonus
                } else {
                  updatedAllowance = user.impact_allowance + totalQualityPoints
                  user.quality_score_change = totalQualityPoints + qualityBonus
                }
                user.quality_bonus_added = qualityBonus
                const finalAllowance = updatedAllowance + qualityBonus
                user.impact_allowance = finalAllowance
                user.remaining_i_allowance = finalAllowance
                user.quality_allowance = finalAllowance
                user.remaining_q_allowance = finalAllowance
                user.next_update = midnight
                await user.save();
                remainingImpact = user.remaining_i_allowance
                return remainingImpact
              } else if (user.next_update >= currentDate) {
                remainingImpact = user.remaining_i_allowance
                return remainingImpact
              }
            } else {
              // console.log('4')
    
              async function getUserProfile(fid) {
                try {
                  const base = "https://api.neynar.com/";
                  const url = `${base}v2/farcaster/user/bulk?fids=${fid}`;
                  const response = await fetch(url, {
                    headers: {
                      accept: "application/json",
                      api_key: apiKey,
                    },
                  });
                  const userProfile = await response.json();
                  if (userProfile.users[0]) {
                    return userProfile.users[0]
                  } else {
                    return null
                  }
                } catch (error) {
                  console.error('Error processing request:', error);
                  return null
                }
              }
      
              async function getLatestCastHash(fid) {
                try {
                  const base = "https://api.neynar.com/";
                  const url = `${base}v2/farcaster/feed?feed_type=filter&filter_type=fids&fid=${fid}&fids=${fid}&with_recasts=false&limit=1`;
                  const response = await fetch(url, {
                    headers: {
                      accept: "application/json",
                      api_key: apiKey,
                    },
                  });
                  const cast = await response.json();
                  let hash = null
                  if (cast && cast.casts && cast.casts.length > 0) {
                    hash = cast.casts[0].hash;
                    // console.log(hash);
                    return { hash, needHash: false }
                  } else {
                    return { hash: null, needHash: true }
                  }
                } catch (error) {
                  console.error('Error processing request:', error);
                  return { hash: null, needHash: true }
                }
              }
      
              const userProfile = await getUserProfile(fid)
              const { hash, needHash } = await getLatestCastHash(fid)
      
              if (userProfile) {
                // console.log('5')
    
                const powerBadge = userProfile.power_badge
                let allowList = false
                if (!powerBadge) {
                  async function getUser(fid) {
                    try {
                      const allowListUser = await Allowlist.findOne({ fid }).exec();
                      if (allowListUser) {
                        return true
                      } else {
                        return false
                      }
                    } catch (error) {
                      console.error("Error getting data:", error);
                      return false
                    }
                  }
                  allowList = await getUser(fid)
                }
                const pfp = userProfile.pfp_url
                const username = userProfile.username
                const displayName = userProfile.display_name
                let wallet
                if (userProfile.verified_addresses?.eth_addresses[0]) {
                  wallet = userProfile.verified_addresses?.eth_addresses[0]
                } else if (userProfile.verified_addresses?.sol_addresses[0]) {
                  wallet = userProfile.verified_addresses?.sol_addresses[0]
                }
                
                if (powerBadge === true || allowList === true) {
                  // console.log('6')
    
                  user = await User.create({
                    fid: fid,
                    pfp: pfp,
                    wallet: wallet,
                    username: username,
                    display_name: displayName,
                    set_cast_hash: hash,
                    need_cast_hash: needHash,
                    impact_allowance: 100,
                    remaining_i_allowance: 100,
                    quality_allowance: 100,
                    remaining_q_allowance: 100,
                    quality_score_added: 0,
                    quality_bonus_added: 0,
                    power_badge: true,
                    next_update: midnight
                  });
                  remainingImpact = user.remaining_i_allowance
                  return remainingImpact
                } else {
                  // console.log('7')
    
                  user = await User.create({
                    fid: fid,
                    pfp: pfp,
                    wallet: wallet,
                    set_cast_hash: hash,
                    need_cast_hash: needHash,
                    username: username,
                    display_name: displayName,
                    impact_allowance: 0,
                    remaining_i_allowance: 0,
                    quality_allowance: 0,
                    remaining_q_allowance: 0,
                    quality_score_added: 0,
                    quality_bonus_added: 0,
                    power_badge: false,
                    next_update: midnight
                  });
                  remainingImpact = user.remaining_i_allowance
                  return remainingImpact
                }
              } else {
                // console.log('8')
    
                remainingImpact = user.remaining_i_allowance
                return remainingImpact            
              }
            }
          } catch (error) {
            console.error('Error creating post:', error);
            return null
          }
        }
    
        const userRemainingImpact = await postUserStatus(fid)
    
        if (userRemainingImpact || userRemainingImpact == 0) {
          // console.log('9')
    
          if (userRemainingImpact >= impactAmount) {
            // console.log('10')
    
            async function updateListings(fid, castContext, impactAmount) {
              // console.log(fid, castContext, impactAmount)
              try {
                await connectToDatabase();
                let user = await User.findOne({ fid }).exec();
      
                if (user) {
                  // console.log('11', user)
                  user.remaining_i_allowance -= impactAmount
                  
                  let cast = await Cast.findOne({ cast_hash: castContext.cast_hash }).exec();
    
    
                  function createdImpact(fid, castContext, impactAmount) {
                    const newImpact = new Impact({
                      curator_fid: fid,
                      target_cast_hash: castContext.cast_hash,
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
                      return null
                    }
                  }
    
                  if (cast) {
    
                    let impact
    
                    impact = await Impact.findOne({ target_cast_hash: castContext.cast_hash }).sort({ createdAt: -1 }).exec();
    
                    if (impact && impact.curator_fid == fid) {
                      impact.impact_points += impactAmount
                      cast.impact_total += impactAmount
    
                      const { balance, castImpact } = await saveAll(user, impact, cast)
                      return { balance, castImpact }
    
                    } else {
                      impact = createdImpact(fid, castContext, impactAmount)
                      cast.impact_total += impactAmount
                      cast.impact_points.push(impact)
                      user.impact_reviews.push(impact)
                      
                      const { balance, castImpact } = await saveAll(user, impact, cast)
                      return { balance, castImpact }
    
                    }
    
                  } else {
      
                    let impact = createdImpact(fid, castContext, impactAmount)
      
                    cast = new Cast({
                      author_fid: castContext.author_fid,
                      author_pfp: castContext.author_pfp,
                      author_username: castContext.author_username,
                      author_display_name: castContext.author_display_name,
                      cast_hash: castContext.cast_hash,
                      cast_text: castContext.cast_text,
                      cast_channel: castContext.cast_channel,
                      quality_balance: 0,
                      quality_absolute: 0,
                      impact_total: impactAmount,
                      impact_points: [impact],
                    });
                    const { balance, castImpact } = await saveAll(user, impact, cast)
                    return { balance, castImpact }
                  }
                  
                } else {
                  // console.log('18')
                  return null
                }
              } catch (error) {
                console.error("Error while saving user, cast and impact objects:", error);
                return null
              }
            }
    
            const { balance, castImpact } = await updateListings(fid, castContext, impactAmount)
    
            if ((balance || balance == 0) && castImpact) {
              console.log('19')
              return { balance, castImpact }
            } else {
              console.log('20')
              return null
            }
          } else {
            return null
          }
        } else {
          return null
        }
      }


      let {balance, castImpact} = await postImpact(curatorFid, castContext, impactAmount)
      console.log(balance, castImpact)

      if ((balance || balance == 0) && castImpact) {
        try {
          res.setHeader('Content-Type', 'text/html');
          res.status(200).send({
            message: `Cast Impact: ${castImpact} / Balance: ${balance}`
          });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }

      } else {
        res.setHeader('Allow', ['POST']);
        res.status(200).end(`Request failed`);
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