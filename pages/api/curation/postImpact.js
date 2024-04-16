import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Cast from '../../../models/Cast';
import axios from 'axios';
import { getCurrentDateUTC } from '../../../utils/utils'; 
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { fid, castContext, impactAmount } = req.body;
  // // console.log(fid, castContext, amount)
  
  if (req.method === 'POST' && fid && fid != '-' && impactAmount && castContext) {
    // console.log('1')

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
                  return savedUser.remaining_i_allowance
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

                  const saveLists = await saveAll(user, impact, cast)
                  return saveLists

                } else {
                  impact = createdImpact(fid, castContext, impactAmount)
                  cast.impact_total += impactAmount
                  cast.impact_points.push(impact)
                  user.impact_reviews.push(impact)
                  
                  const saveLists = await saveAll(user, impact, cast)
                  return saveLists

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
                  cast_channel: castContext.channel,
                  quality_balance: 0,
                  quality_absolute: 0,
                  impact_total: impactAmount,
                  impact_points: [impact],
                });
                // console.log('325', cast)
                const saveLists = await saveAll(user, impact, cast)
                // console.log('savelists 3', saveLists)
                return saveLists
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

        const updateAllLists = await updateListings(fid, castContext, impactAmount)

        if (updateAllLists || updateAllLists == 0) {
          console.log('19')

          res.status(201).json({ balance: updateAllLists, points: impactAmount, message: 'User, cast and impact objects saved successfully' });
        } else {
          console.log('20')

          res.status(500).json({ error: 'Internal Server Error' });
        }

      } else {
        // console.log('21')

        res.status(400).json({ error: 'Exceeded allowance' });
      }
    } else {
      // console.log('22')

      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // console.log('23')

    res.status(405).json({ error: 'Method not allowed' });
  }
}