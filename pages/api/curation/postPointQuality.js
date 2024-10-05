import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Cast from '../../../models/Cast';
import Quality from '../../../models/Quality';
import Allowlist from '../../../models/Allowlist';
import EcosystemRules from '../../../models/EcosystemRules';
import { getCurrentDateUTC, decryptPassword } from '../../../utils/utils'; 
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const { fid, castHash, castChannel, qualityAmount, points } = req.body;
  // console.log(fid, castHash, qualityAmount)
  
  if (req.method !== 'POST' || !fid || !qualityAmount || !castHash || !points) {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    // console.log('1')
    // console.log(fid, castHash, qualityAmount)
    await connectToDatabase();

    const ecosystem = await EcosystemRules.findOne({ ecosystem_points_name: points }).exec();
    // console.log('2', ecosystem)

    let channelCuration = false

    if (ecosystem.channels && ecosystem.channels.length > 0 && castChannel) {
      for (const channel of ecosystem.channels) {
        if (channel.url == castChannel) {
          channelCuration = true
        }
      }
    }

    async function getImpact(curatorFid, castHash, points) {
      try {
        await connectToDatabase();
        const impact = await Impact.find({ curator_fid: curatorFid, target_cast_hash: castHash, points })
        if (impact.length == 0) {
          return null
        } else {
          return impact
        }
      } catch (error) {
        console.error('Error handling request:', error);
        return null
      }
    }

    const impact = await getImpact(fid, castHash, points)

    if (!impact) {

      await connectToDatabase();

      // async function getCuratorFid(castHash, points, amount) {
      //   let created = 1
      //   if (amount > 0) {
      //     created = -1
      //   }

      //   try {
      //     await connectToDatabase();
      //     const latestImpact = await Impact.findOne({ target_cast_hash: castHash, points }).sort({ createdAt: created }).exec();
      //     if (latestImpact) {
      //       return latestImpact?.curator_fid;
      //     } else {
      //       return null
      //     }
      //   } catch(error) {
      //     console.error("Error getting curator fid:", error);
      //     return null
      //   }
      // }

      // const castCurator = await getCuratorFid(castHash, points, qualityAmount)
      
      
      const user = await User.findOne({ fid, ecosystem_points: points }).exec();

      if (!user) {
        res.status(404).json({ error: 'No eligible user found' });
      } else {

        const userRemainingQuality = user.remaining_q_allowance
  
        if (userRemainingQuality && userRemainingQuality !== 0) {
  
          async function updateListings(fid, castHash, qualityAmount, points) {
            // console.log(fid, castHash, qualityAmount)
            const absQuailty = Math.abs(qualityAmount)
            
            try {
              await connectToDatabase();
              
              let cast = await Cast.findOne({ cast_hash: castHash, points: points }).exec()
              
              // cast has no impact score - not reviewed
              if (!cast || cast.impact_points.length == 0) {
                return null
                
                // cast exists and has impact points
              } else {
                
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
                    // console.log(savedCast)
                    // console.log(savedCast.quality_balance)
                    // console.log(balance, qPoints, iPoints, qAbs)
                    return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ }
                  } catch (error) {
                    console.error("Error saving lists:", error);
                    return null
                  }
                }
  
                let user = await User.findOne({ fid, ecosystem_points: points }).exec();
                
                // if user exists
                if (user) {
                  // console.log('11', user)
                  
                  // check if quality points are negative & smaller than existing impact
                  if (qualityAmount < 0 && cast.impact_total < absQuailty) {
                    
                    let adjustedQuality = cast.impact_total
                    
                    const newQuality = new Quality({
                      curator_fid: fid,
                      points: points,
                      target_cast_hash: castHash,
                      quality_points: adjustedQuality * -1,
                    });
                    // console.log('261:', adjustedQuality, absQuailty, newQuality)
                    user.remaining_q_allowance -= adjustedQuality
                    user.quality_reviews.push(newQuality)
                    cast.quality_balance += adjustedQuality
                    cast.quality_absolute += absQuailty
                    cast.quality_points.push(newQuality)
                    cast.impact_total = 0
                    let impactTotal = 0

  
                    const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ } = await saveAll(user, newQuality, cast)
                    return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, impactTotal }
  
                  // quality points within ranges
                  } else {
  
                    const newQuality = new Quality({
                      curator_fid: fid,
                      target_cast_hash: castHash,
                      quality_points: qualityAmount,
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
                    return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, impactTotal }
                  }
                  
                // no user
                } else {
                  return { userBalance: null, addedPoints: null, castAbsoluteQ: null, castTotalI: null, castBalanceQ: null, impactTotal: null }
                }
              }
            } catch (error) {
              console.error("Error saving lists:", error);
              return { userBalance: null, addedPoints: null, castAbsoluteQ: null, castTotalI: null, castBalanceQ: null, impactTotal: null }
            }
          }
  
          const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, impactTotal } = await updateListings(fid, castHash, qualityAmount, points)
          // console.log(userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ)
  
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



          if ((userBalance || userBalance == 0) && (addedPoints || addedPoints == 0) && (castAbsoluteQ || castAbsoluteQ == 0) && (castTotalI || castTotalI == 0) && (castBalanceQ || castBalanceQ == 0)) {
            // console.log('305:', balance, qPoints, iPoints, qAbs)
            res.status(201).json({ userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, curated: curatedCast, message: 'User, cast and quality objects saved successfully' });
          } else {
            // console.log('failed')
            res.status(500).json({ error: 'Internal Server Error' });
          }
        } else {
          res.status(400).json({ error: 'Exceeded allowance' });
        }
        

      }


    } else {
      res.status(202).send({
        message: `Can't add q/dau to staked cast`
      });
    }
  }
}