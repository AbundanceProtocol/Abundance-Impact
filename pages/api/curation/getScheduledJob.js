import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';
import EcosystemRules from '../../../models/EcosystemRules';
import { getTimeRange, processTips, populateCast } from '../../../utils/utils';

const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { fid, code } = req.query;

  if (req.method !== 'GET' || !fid || !code) {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  }

  console.log('20', fid, code);

  try {
    const schedule = await getSchedule(code);
    if (!schedule.percent || !schedule.decryptedUuid) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const curatorPercent = await getCuratorPercent(schedule.points);
    const time = schedule.timeRange ? getTimeRange(schedule.timeRange) : null;
    const allowances = await getAllowances(fid, schedule.currencies, schedule.percent);

    if (allowances.length === 0) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const { casts } = await getUserSearch(time, schedule.tags, schedule.channels, schedule.curators, schedule.points);
    const displayedCasts = await processCasts(casts, fid, allowances, schedule.ecosystem, curatorPercent);

    const remainingTip = await sendRequests(displayedCasts, schedule.decryptedUuid, process.env.API_KEY);
    return res.status(200).json({ message: 'All casts tipped successfully', tip: remainingTip });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getSchedule(code) {
  try {
    await connectToDatabase();
    const schedule = await ScheduleTip.findOne({ code }).select('search_shuffle search_time search_tags points search_channels search_curators percent_tip ecosystem_name currencies uuid').exec();

    if (!schedule) {
      return createEmptySchedule();
    }

    const decryptedUuid = decryptPassword(schedule.uuid, secretKey);
    return {
      shuffle: schedule.search_shuffle,
      timeRange: schedule.search_time,
      tags: schedule.search_tags,
      points: schedule.points,
      channels: schedule.search_channels,
      curators: schedule.search_curators,
      percent: schedule.percent_tip,
      ecosystem: schedule.ecosystem_name,
      currencies: schedule.currencies,
      decryptedUuid
    };
  } catch (error) {
    console.error('Error:', error);
    return createEmptySchedule();
  }
}

function createEmptySchedule() {
  return {
    shuffle: null,
    timeRange: null,
    tags: null,
    points: null,
    channels: null,
    curators: null,
    percent: null,
    ecosystem: null,
    currencies: null,
    decryptedUuid: null
  };
}

async function getCuratorPercent(points) {
  try {
    await connectToDatabase();
    const curatorPercentData = await EcosystemRules.findOne({ ecosystem_points_name: points }).select('percent_tipped').exec();
    return curatorPercentData ? curatorPercentData.percent_tipped : 10;
  } catch (error) {
    console.error('Error:', error);
    return 10;
  }
}

async function getAllowances(fid, currencies, percent) {
  const allowances = [];

  for (const coin of currencies) {
    let allowance = 0;
    if (coin === '$TN100x') {
      allowance = await getHamAllowance(fid);
    } else if (coin === '$DEGEN') {
      allowance = await getDegenAllowance(fid);
    } else if (coin === '$FARTHER') {
      const { allowance: fartherAllowance, minTip } = await getFartherAllowance(fid);
      allowances.push({ token: coin, set: true, allowance: fartherAllowance * percent / 100, totalTip: fartherAllowance, min: minTip });
      continue;
    }
    allowances.push({ token: coin, set: true, allowance: Math.floor(allowance * percent / 100), totalTip: allowance });
  }

  return allowances;
}

async function getUserSearch(time, tags, channel, curator, points) {
  const page = 1;
  const limit = 10;

  let query = {};

  if (time) query.createdAt = { $gte: time };
  if (points) query.points = points;
  if (curator && curator.length > 0) query['impact_points'] = { $in: await getCuratorIds(curator) };
  if (channel) query.cast_channel = { $in: Array.isArray(channel) ? channel : [channel] };

  return await fetchCasts(query, page, limit);
}

async function fetchCasts(query, page, limit) {
  try {
    await connectToDatabase();
    const totalCount = await Cast.countDocuments(query);
    const casts = await Cast.find(query).sort({ impact_total: -1 }).populate('impact_points').skip((page - 1) * limit).limit(limit).exec();
    return { casts: shuffleArray(casts), totalCount };
  } catch (error) {
    console.error('Error:', error);
    return { casts: [], totalCount: 0 };
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function processCasts(casts, fid, allowances, ecosystem, curatorPercent) {
  // Populate casts with necessary data
  const processedCasts = await populateCast(casts);

  // Initialize an array to store curator hashes
  let curatorHashes = [];

  // Function to fetch the hash for a given curator's fid
  async function getHash(fid) {
    try {
      await connectToDatabase();
      const user = await User.findOne({ fid }).select('set_cast_hash').exec();
      return user ? user.set_cast_hash : null;
    } catch (error) {
      console.error('Error getting User:', error);
      return null;
    }
  }

  // Attach hashes to curators in each cast
  for (const cast of processedCasts) {
    if (cast.impact_points && cast.impact_points.length > 0) {
      for (const subCast of cast.impact_points) {
        let fidExists = curatorHashes.some(item => item.fid == subCast.curator_fid);
        if (subCast.curator_fid !== fid && !fidExists) {
          let curatorHash = await getHash(subCast.curator_fid);
          let hash = { fid: subCast.curator_fid, hash: curatorHash, impact_points: subCast.impact_points };
          curatorHashes.push(hash);
          subCast.target_cast_hash = curatorHash;
        } else if (fidExists) {
          const curatorIndex = curatorHashes.findIndex(item => item.fid == subCast.curator_fid);
          if (curatorIndex !== -1) {
            subCast.target_cast_hash = curatorHashes[curatorIndex].hash;
            curatorHashes[curatorIndex].impact_points += subCast.impact_points;
          }
        }
      }
    }
  }

  // Reset impact points to zero
  for (const cast of processedCasts) {
    if (cast.impact_points && cast.impact_points.length > 0) {
      for (const subCast of cast.impact_points) {
        subCast.impact_points = 0;
      }
    }
  }

  // Reattach impact points from curatorHashes
  if (curatorHashes && curatorHashes.length > 0) {
    let i = 0;
    for (const cast of processedCasts) {
      if (cast.impact_points && cast.impact_points.length > 0) {
        for (const subCast of cast.impact_points) {
          if (curatorHashes.length > i && subCast.curator_fid == curatorHashes[i].fid) {
            subCast.impact_points = curatorHashes[i].impact_points;
            i++;
          }
        }
      }
    }
  }

  // Process tips based on the allowances, ecosystem, and curatorPercent
  const { castData, coinTotals } = await processTips(processedCasts, fid, allowances, ecosystem, curatorPercent);

  return castData;
}

async function sendRequests(castData, signer, apiKey) {
  const base = "https://api.neynar.com/v2/farcaster/cast";
  let tipCounter = 0;

  for (const cast of castData) {
    const body = { signer_uuid: signer, text: cast.text, parent: cast.castHash };
    try {
      await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api_key': apiKey },
        body: JSON.stringify(body)
      });

      const tips = cast.allCoins.filter(coin => coin.tip > 0).map(coin => ({ currency: coin.coin, amount: coin.tip }));
      await Tip.create({ receiver_fid: cast.fid, tipper_fid: fid, points: cast.points, cast_hash: cast.castHash, tip: tips });
      tipCounter += cast.tip;

    } catch (error) {
      console.error(`Error sending request for ${cast.text}:`, error);
    }

    await new Promise(resolve => setTimeout(resolve, 60));
  }

  return tipCounter;
}