import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Cast from '../../../models/Cast';
import Quality from '../../../models/Quality';
import axios from 'axios';
import { getCurrentDateUTC } from '../../../utils/utils'; 
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { fid, castHash, qualityAmount } = req.body;
  // console.log(fid, castHash, qualityAmount)
  
  if (req.method === 'POST' && fid && qualityAmount && castHash) {
    // console.log('1')
    // console.log(fid, castHash, qualityAmount)

    async function postUserStatus(fid) {
      let remainingQuality = 0
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
          console.log('2')

          if (user.next_update < currentDate) {
            console.log('3')

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
            remainingQuality = user.remaining_q_allowance
            return remainingQuality
          } else if (user.next_update >= currentDate) {
            remainingQuality = user.remaining_q_allowance
            return remainingQuality
          }
        } else {
          console.log('4')

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
            const pfp = userProfile.pfp_url
            const username = userProfile.username
            const displayName = userProfile.display_name
            let wallet
            if (userProfile.verified_addresses?.eth_addresses[0]) {
              wallet = userProfile.verified_addresses?.eth_addresses[0]
            } else if (userProfile.verified_addresses?.sol_addresses[0]) {
              wallet = userProfile.verified_addresses?.sol_addresses[0]
            }
            
            if (powerBadge === true) {
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
              remainingQuality = user.remaining_q_allowance
              return remainingQuality
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
              remainingQuality = user.remaining_q_allowance
              return remainingQuality
            }
          } else {
            // console.log('8')

            remainingQuality = user.remaining_q_allowance
            return remainingQuality            
          }
        }
      } catch (error) {
        console.error('Error creating post:', error);
        return null
      }
    }

    const userRemainingQuality = await postUserStatus(fid)
    // console.log(userRemainingQuality)

    // remaining quality balance exists and isn't zero
    if (userRemainingQuality && userRemainingQuality != 0) {

      async function updateListings(fid, castHash, qualityAmount) {
        // console.log(fid, castHash, qualityAmount)
        const absQuailty = Math.abs(qualityAmount)
        
        try {
          await connectToDatabase();
          
          let cast = await Cast.findOne({ cast_hash: castHash }).exec()
          
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

            let user = await User.findOne({ fid }).exec();
            
            // if user exists
            if (user) {
              // console.log('11', user)
              
              // check if quality points are negative & smaller than existing impact
              if (qualityAmount < 0 && cast.impact_total < absQuailty) {
                
                let adjustedQuality = cast.impact_total
                
                const newQuality = new Quality({
                  curator_fid: fid,
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

                const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ } = await saveAll(user, newQuality, cast)
                return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ }

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

                const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ } = await saveAll(user, newQuality, cast)
                return { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ }
              }
              
            // no user
            } else {
              return null
            }
          }
        } catch (error) {
          console.error("Error saving lists:", error);
          return null
        }
      }

      const { userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ } = await updateListings(fid, castHash, qualityAmount)
      // console.log(userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ)

      if ((userBalance || userBalance == 0) && (addedPoints || addedPoints == 0) && (castAbsoluteQ || castAbsoluteQ == 0) && (castTotalI || castTotalI == 0) && (castBalanceQ || castBalanceQ == 0)) {
        // console.log('305:', balance, qPoints, iPoints, qAbs)
        res.status(201).json({ userBalance, addedPoints, castAbsoluteQ, castTotalI, castBalanceQ, message: 'User, cast and quality objects saved successfully' });
      } else {
        // console.log('failed')
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(400).json({ error: 'Exceeded allowance' });
    }
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 