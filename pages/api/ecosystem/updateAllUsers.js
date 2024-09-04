import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";
import Impact from "../../../models/Impact";
import User from "../../../models/User";
import Tip from "../../../models/Tip";
import Quality from "../../../models/Quality";
import { setTimeout } from 'timers/promises';

const savedCode = process.env.ECOSYSTEM_SECRET;

const BATCH_SIZE = 100;
const BATCH_DELAY = 1000;

async function getEcosystem(points) {
  try {
    await connectToDatabase();
    return await EcosystemRules.findOne({ecosystem_points_name: points}).exec();
  } catch (error) {
    console.error('Error retrieving ecosystem:', error);
    return null;
  }
}

async function getUsers(points) {
  try {
    await connectToDatabase();
    return await User.find({ecosystem_points: points, impact_allowance: { $ne: 0 } }).exec();
  } catch (error) {
    console.error('Error retrieving users:', error);
    return null;
  }
}

async function getTipValue(fid, points, lastDay) {
  try {
    await connectToDatabase();
    const tips = await Tip.find({tipper_fid: fid, points, createdAt: { $gte: lastDay }}).exec();
    
    if (tips && tips.length > 0) {
      let totalDegen = 0;
      let totalHam = 0;
      for (const tip of tips) {
        if (tip.tip.length > 0) {
          for (const tipType of tip.tip) {
            if (tipType.currency == '$DEGEN') {
              totalDegen += tipType.amount;
            } else if (tipType.currency == '$TN100x') {
              totalHam += tipType.amount;
            }
          }
        }
      }
      return (totalDegen * 0.003) + (totalHam * 0.00085); // Using placeholder values
    }
    return 0;
  } catch (error) {
    console.error('Error retrieving tip value:', error);
    return 0;
  }
}

async function getVoteBalance(fid, points, lastDay, lastWeek) {
  try {
    await connectToDatabase();
    const castHashes = await Impact.find({curator_fid: fid, createdAt: { $gte: lastWeek } }).select('target_cast_hash').exec();
    const hashes = castHashes.map(hash => hash.target_cast_hash);

    const votes = await Quality.find({target_cast_hash: { $in: hashes }, points, createdAt: { $gte: lastDay }}).exec();

    let userVotes = votes.reduce((sum, vote) => sum + vote.quality_points, 0);
    
    return userVotes >= 0 ? userVotes * ecosystem.upvote_value : userVotes * ecosystem.downvote_value;
  } catch (error) {
    console.error('Error retrieving vote balance:', error);
    return 0;
  }
}

async function processUsersBatch(users, ecosystem, lastDay, lastWeek, ecoPoints) {
  for (const user of users) {
    try {
      let userBonus = 0;

      if (ecosystem.points_per_tip) {
        const tipValue = await getTipValue(user.fid, ecoPoints, lastDay);
        userBonus += tipValue * ecosystem.points_per_tip;
      }

      if (ecosystem.upvote_value && ecosystem.downvote_value) {
        const voteBalance = await getVoteBalance(user.fid, ecoPoints, lastDay, lastWeek);
        userBonus += voteBalance;
      }

      let newBalance = user.impact_allowance + userBonus;
      user.impact_allowance = Math.round(newBalance);
      user.remaining_i_allowance = Math.round(newBalance);
      user.quality_allowance = Math.round(newBalance);
      user.remaining_q_allowance = Math.round(newBalance);
      
      await user.save();
    } catch (error) {
      console.error(`Error processing user ${user._id}:`, error);
    }
  }
}

async function processAllUsersInBatches(allUsers, ecosystem, lastDay, lastWeek, ecoPoints) {
  for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
    const usersBatch = allUsers.slice(i, i + BATCH_SIZE);
    await processUsersBatch(usersBatch, ecosystem, lastDay, lastWeek, ecoPoints);
    
    if (i + BATCH_SIZE < allUsers.length) {
      await setTimeout(BATCH_DELAY);
    }
  }
}

export default async function handler(req, res) {
  const { points, code } = req.query;
  if (req.method !== 'GET' || !points || code !== savedCode) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ecoPoints = '$' + points;
  const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const ecosystem = await getEcosystem(ecoPoints);
  if (!ecosystem) {
    return res.status(405).json({ error: 'Failed to retrieve ecosystem' });
  }

  const users = await getUsers(ecoPoints);
  if (!users) {
    return res.status(405).json({ error: 'No users found' });
  }

  await processAllUsersInBatches(users, ecosystem, lastDay, lastWeek, ecoPoints);

  res.status(200).json({ message: 'Update completed' });
}