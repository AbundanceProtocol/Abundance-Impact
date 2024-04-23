import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Allowlist from '../../../models/Allowlist';
import axios from 'axios';
import { getCurrentDateUTC } from '../../../utils/utils'; 
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { fid, invited } = req.body;
  if (req.method === 'POST' && fid) {

    const currentDate = getCurrentDateUTC();

    let midnight = new Date(currentDate);
    midnight.setUTCHours(0, 0, 0, 0);

    // Set top range to last midnight UTC
    const dateTopRange = midnight

    // Set to next midnight UTC
    midnight.setUTCDate(midnight.getUTCDate() + 1);

    await connectToDatabase();

    try {
      let user = await User.findOne({ fid }).exec();

      if (user) {

        if (user.next_update < currentDate) {

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
          res.status(200).json({ impact_allowance: finalAllowance, quality_allowance: finalAllowance, remaining_i_allowance: finalAllowance, remaining_q_allowance: finalAllowance, message: null });

        } else if (user.next_update >= currentDate) {
          res.status(200).json({ impact_allowance: user.impact_allowance, quality_allowance: user.quality_allowance, remaining_i_allowance: user.remaining_i_allowance, remaining_q_allowance: user.remaining_q_allowance, message: null });
        }

      } else {
        
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
            user = await User.create({
              invited_by: invited,
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
            res.status(201).json({ impact_allowance: user.impact_allowance, quality_allowance: user.quality_allowance, remaining_i_allowance: user.remaining_i_allowance, remaining_q_allowance: user.remaining_q_allowance, message: null });
          } else {
            user = await User.create({
              invited_by: invited,
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
            res.status(201).json({ impact_allowance: 0, quality_allowance: 0, remaining_i_allowance: 0, remaining_q_allowance: 0, message: 'Not currently eligible for allowance' });
          }
        } else {
          res.status(400).json({ error: 'Failed user check' });
        }
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
