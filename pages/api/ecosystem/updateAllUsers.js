import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";
import Impact from "../../../models/Impact";
import User from "../../../models/User";
import Tip from "../../../models/Tip";
import Quality from "../../../models/Quality";
import Cast from "../../../components/Cast";
const savedCode = process.env.ECOSYSTEM_SECRET

export default async function handler(req, res) {
  const { points, code } = req.query;
  if (req.method !== 'GET' || !points || code !== savedCode) {
      res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    const ecoPoints = '$' + points
    const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function getEcosystem(points) {
      try {
        await connectToDatabase();
        const ecosystem = await EcosystemRules.findOne({ecosystem_points_name: points}).exec()
  
        if (ecosystem) {
          return ecosystem
        } else {
          return null
        }

      } catch (error) {
        console.error('Error retrieve documents:', error);
        return null
      }

    }

    const ecosystem = await getEcosystem(ecoPoints)

    if (!ecosystem) {
      res.status(405).json({ error: 'Failed to retrieve ecosystem' });
    } else {

      async function getUsers(points) {
        try {
          await connectToDatabase();
          const users = await User.find({ecosystem_points: points, impact_allowance: { $ne: 0 } }).exec()
  
          if (users) {
            return users
          } else {
            return null
          }
        } catch (error) {
          console.error('Error retrieve documents:', error);
          return null
        }
      }

      let users = await getUsers(ecoPoints)

      if (!users) {
        res.status(405).json({ error: 'No users found' });
      } else {

        for (const user of users) {
          let userBonus = 0
          if (ecosystem.points_per_tip) {

            async function getTipValue(fid, points, lastDay) {
              try {
                await connectToDatabase();
                const tips = await Tip.find({tipper_fid: fid, points, createdAt: { $gte: lastDay }}).exec()
        
                if (tips && tips.length > 0) {
                  let totalTipValue = 0
                  let degenValue = 0.01 // placeholder
                  let hamValue = 0.00085 // placeholder
                  let totalDegen = 0
                  let totalHam = 0
                  for (const tip of tips) {
                    if (tip.tip.length > 0) {
                      for (const tipType of tip.tip) {
                        if (tipType.currency == '$DEGEN') {
                          totalDegen += tipType.amount
                        } else if (tipType.currency == '$TN100x') {
                          totalHam += tipType.amount
                        }
                      }
                    }
                  }
                  totalTipValue = (totalDegen * degenValue) + (totalHam * hamValue)

                  return totalTipValue
                } else {
                  return 0
                }
              } catch (error) {
                console.error('Error retrieve documents:', error);
                return 0
              }

            }

            const tipValue = await getTipValue(user.fid, ecoPoints, lastDay)

            let tipBonus = tipValue * ecosystem.points_per_tip

            userBonus += tipBonus
          }

          if (ecosystem.upvote_value && ecosystem.downvote_value) {

            async function getVoteBalance(fid, points, lastDay, lastWeek) {
              try {
                let hashes = []
                await connectToDatabase();
                const castHashes = await Impact.find({curator_fid: fid, createdAt: { $gte: lastWeek } }).select('target_cast_hash').exec()
                console.log(castHashes)
                if (castHashes && castHashes.length > 0) {
                  for (const hash of castHashes) {
                    hashes.push(hash.target_cast_hash)
                  }
                }

                const votes = await Quality.find({target_cast_hash: { $in: hashes }, points, createdAt: { $gte: lastDay }}).exec()

                let userVotes = 0

                if (votes && votes.length > 0) {
                  for (const vote of votes) {
                    userVotes += vote.quality_points
                  }
                }
                
                let voteBonus = 0
                if (userVotes >= 0) {
                  voteBonus = userVotes * ecosystem.upvote_value
                } else {
                  voteBonus = userVotes * ecosystem.downvote_value
                }
                return voteBonus
              } catch (error) {
                console.error('Error retrieve documents:', error);
                return 0
              }
            }

            const voteBalance = await getVoteBalance(user.fid, ecoPoints, lastDay, lastWeek)

            userBonus += voteBalance
          }

          let previousBalance = user.impact_allowance
          let newBalance = previousBalance + userBonus

          user.impact_allowance = Math.round(newBalance)
          user.remaining_i_allowance = Math.round(newBalance)
          user.quality_allowance = Math.round(newBalance)
          user.remaining_q_allowance = Math.round(newBalance)
          
          await user.save()
          await delay(100);
        }
      }
    }

    res.status(200).json({ message: 'Update completed' });
  }
}