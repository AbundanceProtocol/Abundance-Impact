import { decryptPassword } from '../../utils/utils';
import connectToDatabase from '../../libs/mongodb';
import ScheduleTip from '../../models/ScheduleTip';
import Cast from '../../models/Cast';
import Impact from '../../models/Impact';
import User from '../../models/User';
import Tip from '../../models/Tip';
import EcosystemRules from '../../models/EcosystemRules';
import { getTimeRange, processTips, populateCast } from '../../utils/utils';

const secretKey = process.env.SECRET_KEY;
const secretCode = process.env.SECRET_CODE;
const apiKey = process.env.NEYNAR_API_KEY;

exports.handler = async function(event, context) {

  const tipTime = '7pm'

  // function sleep(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  async function autotip() {

    let counter = 0;
    let errors = 0;
  
    try {
      await connectToDatabase();
  
      const uniquePoints = await getUniquePoints();
      let users = [];
  
      for (const points of uniquePoints) {
        const curatorPercent = await getCuratorPercent(points);
        const uniqueFids = await getUniqueFids(points);
        console.log('uniqueFids', uniqueFids);
        
        for (const fid of uniqueFids) {
          await new Promise(resolve => setTimeout(resolve, 100));
          let time = null;
          let schedule = null;
          let allowances = [];
          
          try {
            schedule = await getSchedule(fid, points);
            time = schedule?.timeRange ? getTimeRange(schedule?.timeRange) : null;
            allowances = await getAllowances(fid, schedule?.currencies || [], schedule?.percent, tipTime);
          } catch (error) {
            console.error(`Error fetching allowances or user search for fid ${fid}:`, error);
            continue;
          }
  
          if (!schedule?.percent || !schedule?.decryptedUuid || allowances?.length === 0) {
            continue;
          }
          users.push({
            points, 
            fid, 
            allowances, 
            time, 
            curators: schedule?.curators, 
            tags: schedule?.tags, 
            channels: schedule?.channels, 
            ecosystem: schedule?.ecosystem, 
            curatorPercent, 
            uuid: schedule?.decryptedUuid
          });
        }
      }
  
      for (const user of users) {
        const { castData } = await getCasts(user);
        
        console.log('Processing user:', user?.fid, castData.length);
        for (const userCast of castData) {
          try {
            await new Promise(resolve => setTimeout(resolve, 40));
            // const tipped = await sendTip(userCast, user?.uuid, user?.fid, user?.points);
            const tipped = 1
            if (tipped) {
              counter++;
            } else {
              errors++;
            }
          } catch(error) {
            console.error('Error processing tip:', error);
            errors++;
          }
        }
      }
  

      return {counter, errors}
  
    } catch (error) {
      console.error('Background processing error:', error);
      return {counter: 0, errors: 0}
    }


  }

  const {counter, errors} = await autotip();

  console.log(`Processing complete. Success: ${counter}, Errors: ${errors}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Processing complete. Success: ${counter}, Errors: ${errors}` })
  };

};










async function getCasts(user) {
  try {
    const { casts } = await getUserSearch(user?.time, user?.tags, user?.channels, user?.curators, user?.points);
    console.log('getCasts', casts?.length, user?.time, user?.tags, user?.channels, user?.curators, user?.points)
    if (!casts) {
      console.log('no casts')
      return {castData: [], coinTotals: 0}
    }
    console.log('casts')
    const displayedCasts = await processCasts(casts, user?.fid);
    if (!displayedCasts) {
      console.log('no displayedCasts')
    }
    const { castData, coinTotals } = await processTips(displayedCasts, user?.fid, user?.allowances, user?.ecosystem, user?.curatorPercent);
    return {castData, coinTotals}
  } catch(error) {
    console.error('Error in handler:', error);
    return {castData: [], coinTotals: 0}
  }
}


async function getSchedule(fid, points) {
  try {
    const schedule = await ScheduleTip.findOne({ fid, points, active_cron: true }).select('search_shuffle search_time search_tags points search_channels search_curators percent_tip ecosystem_name currencies uuid').exec();
    if (schedule) {
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
        decryptedUuid: decryptedUuid
      };
    }
    return {};
  } catch (error) {
    console.error('Error in getSchedule:', error);
    return {};
  }
}

async function getUniquePoints() {
  try {
    const uniquePoints = await ScheduleTip.distinct('points');
    return uniquePoints;
  } catch (error) {
    console.error('Error in getUniquePoints:', error);
    return [];
  }
}

async function getUniqueFids(points) {
  try {
    const uniqueFids = await ScheduleTip.distinct('fid', { points: points });
    return uniqueFids;
  } catch (error) {
    console.error('Error in getUniqueFids:', error);
    return [];
  }
}

async function getCuratorPercent(points) {
  try {
    const curatorPercentData = await EcosystemRules.findOne({ ecosystem_points_name: points }).select('percent_tipped').exec();
    return curatorPercentData?.percent_tipped || 10;
  } catch (error) {
    console.error('Error in getCuratorPercent:', error);
    return 10;
  }
}

async function getAllowances(fid, currencies, percent, tipTime) {
  const allowances = [];
  for (const coin of currencies) {
    let allowance, tip, minTip;
    if (coin == '$TN100x' && tipTime == '7pm') {
      allowance = await getHamAllowance(fid);
      console.log('$TN100x', allowance)
      tip = Math.floor(allowance * percent / 100);
      allowances.push({token: coin, set: true, allowance: tip, totalTip: tip});
    } else if (coin == '$DEGEN' && tipTime == '7pm') {
      allowance = await getDegenAllowance(fid);
      console.log('$DEGEN', allowance)
      tip = Math.round(allowance * percent / 100);
      allowances.push({token: coin, set: true, allowance: tip, totalTip: tip});
    } else if (coin == '$HUNT' && tipTime == '7pm') {
      allowance = await getHuntAllowance(fid);
      console.log('$HUNT', allowance)
      tip = Math.round(allowance * percent / 100);
      allowances.push({token: coin, set: true, allowance: tip, totalTip: tip});
    }
  }
  return allowances;
}

async function getHamAllowance(fid) {
  try {
    const remainingUrl = `https://farcaster.dep.dev/ham/user/${fid}`;
    const remainingBalance = await fetch(remainingUrl, {
      headers: { accept: "application/json" },
    });
    const getRemaining = await remainingBalance.json();
    // console.log(getRemaining)
    return getRemaining?.todaysAllocation ? Math.floor((Number(getRemaining?.todaysAllocation) - Number(getRemaining?.totalTippedToday))/1e18) : 0;
  } catch (error) {
    console.error('Error in getHamAllowance:');
    return 0;
  }
}

async function getDegenAllowance(fid) {
  try {
    const response = await fetch(`https://api.degen.tips/airdrop2/allowances?fid=${fid}`);
    const data = await response.json();
    const today = new Date();
    const dayOfMonth = today.getDate();
    // console.log(fid, data[0], Number(data[0]?.remaining_tip_allowance))
    if (data && data[0]?.remaining_tip_allowance) {
      if (Number(data[0]?.remaining_tip_allowance) >= 0 && (dayOfMonth % 3 == Number(fid) % 3)) {
        return Number(data[0]?.remaining_tip_allowance) || 0
      } else {
        return 0
      }
    }
    return 0
  } catch (error) {
    console.error('Error in getDegenAllowance:');
    return 0;
  }
}

async function getHuntAllowance(fid) {
  try {
    const remainingUrl = `https://tip.hunt.town/api/stats/fid/${fid}`;
    const remainingBalance = await fetch(remainingUrl, {
      headers: { accept: "application/json" },
    });
    const getRemaining = await remainingBalance.json();
    if (getRemaining?.remaining_allowance) {
      return Math.floor(Number(getRemaining?.remaining_allowance)) || 0
    } else {
      return 0
    }
    // console.log(Math.floor(Number(getRemaining?.remaining_allowance)))
    // return getRemaining ? Math.floor(Number(getRemaining?.remaining_allowance)) : 0;
  } catch (error) {
    console.error('Error in getHuntAllowance:');
    return 0;
  }
}

async function getUserSearch(time, tags, channel, curator, points) {
  const limit = 10;
  let query = {};
  
  if (time) query.createdAt = { $gte: time };
  if (points) query.points = points;
  
  if (curator && curator.length > 0) {
    const curatorFids = Array.isArray(curator) ? curator.map(fid => parseInt(fid)) : [parseInt(curator)];
    const impactIds = await getCuratorIds(curatorFids, points);
    if (impactIds) query['impact_points'] = { $in: impactIds };
  }
  
  // if (channel && channel.length > 0) {
  //   query.cast_channel = { $in: Array.isArray(channel) ? channel : [channel] };
  // }
  if (channel && channel !== ' ') {
    query.channel_id = channel
  }

  const { casts, totalCount } = await fetchCasts(query, limit);
  return { casts: casts || [], totalCount };
}

async function getCuratorIds(fids, points) {
  try {
    const impacts = await Impact.find({ curator_fid: { $in: fids }, points }).select('_id');
    return impacts.map(impact => impact._id);
  } catch (error) {
    console.error("Error in getCuratorIds:", error);
    return null;
  }   
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function fetchCasts(query, limit) {
  console.log('query', query?.impact_points?.$in?.lnegth)
  try {
    await connectToDatabase();

    let totalCount;
    let returnedCasts = []

    totalCount = await Cast.countDocuments(query);
    console.log('totalCount', totalCount)
    // Calculate the number of documents to be sampled from each range
    const top20PercentCount = Math.ceil(totalCount * 0.2);
    const middle40PercentCount = Math.ceil(totalCount * 0.4);
    const bottom40PercentCount = totalCount - top20PercentCount - middle40PercentCount;

    // Fetch documents from each range
    const top20PercentCasts = await Cast.find(query)
      .sort({ impact_total: -1 })
      .populate('impact_points')
      .limit(top20PercentCount)
      .exec();
    const middle40PercentCasts = await Cast.find(query)
      .sort({ impact_total: -1 })
      .populate('impact_points')
      .skip(top20PercentCount)
      .limit(middle40PercentCount)
      .exec();
    const bottom40PercentCasts = await Cast.find(query)
      .sort({ impact_total: -1 })
      .populate('impact_points')
      .skip(top20PercentCount + middle40PercentCount)
      .limit(bottom40PercentCount)
      .exec();

    returnedCasts = top20PercentCasts.concat(middle40PercentCasts, bottom40PercentCasts);

    returnedCasts.sort((a, b) => b.impact_total - a.impact_total);

    returnedCasts = returnedCasts.reduce((acc, current) => {
      const existingItem = acc.find(item => item._id === current._id);
      if (!existingItem) {
        acc.push(current);
      }
      return acc;
    }, [])

    returnedCasts = shuffleArray(returnedCasts);

    returnedCasts = returnedCasts.slice(0, limit);
    

    if (returnedCasts && returnedCasts.length > 10) {
      returnedCasts = returnedCasts.slice(0, 10);
    }

    console.log('113', returnedCasts?.length)
    if (!returnedCasts) {
      returnedCasts = []
    }
    return { casts: returnedCasts, totalCount };
  } catch (err) {
    console.error('Error in fetchCasts:', err);
    return { casts: null, totalCount: null };
  }
}

async function processCasts(casts, fid) {
  // console.log(casts)
  let filteredCasts = (casts || []).reduce((acc, current) => {
    const existingItem = acc.find(item => item._id === current._id);
    if (!existingItem) {
      acc.push(current);
    }
    return acc;
  }, []);

  let sortedCasts = filteredCasts.sort((a, b) => b.impact_total - a.impact_total);
  let displayedCasts = await populateCast(sortedCasts);

  const curatorHashes = await getCuratorHashes(displayedCasts, fid);
  return updateCastsWithCuratorInfo(displayedCasts, curatorHashes);
}

async function getCuratorHashes(casts, fid) {
  const curatorHashes = [];
  for (const cast of casts) {
    if (cast.impact_points && cast.impact_points.length > 0) {
      for (const subCast of cast.impact_points) {
        if (subCast.curator_fid !== fid && !curatorHashes.some(item => item.fid == subCast.curator_fid)) {
          const curatorHash = await getHash(subCast.curator_fid);
          curatorHashes.push({
            fid: subCast.curator_fid,
            hash: curatorHash,
            impact_points: subCast.impact_points
          });
        }
      }
    }
  }
  return curatorHashes;
}

async function getHash(fid) {
  try {
    const user = await User.findOne({ fid }).select('set_cast_hash').exec();
    return user ? user.set_cast_hash : null;
  } catch (error) {
    console.error('Error in getHash:', error);
    return null;
  }
}

function updateCastsWithCuratorInfo(displayedCasts, curatorHashes) {
  for (const cast of displayedCasts) {
    if (cast.impact_points && cast.impact_points.length > 0) {
      for (const subCast of cast.impact_points) {
        const curatorInfo = curatorHashes.find(item => item.fid == subCast.curator_fid);
        if (curatorInfo) {
          subCast.target_cast_hash = curatorInfo.hash;
          subCast.impact_points = curatorInfo.impact_points;
        }
      }
    }
  }
  return displayedCasts;
}

async function sendTip(cast, signer, fid, points) {
  const base = "https://api.neynar.com/";
  const url = `${base}v2/farcaster/cast`;
  const body = {
    signer_uuid: signer,
    text: cast.text,
    parent: cast.castHash
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Failed to send request for ${body.text}`);
      return 0;
    }

    const tips = cast.allCoins
      .filter(coin => coin.tip > 0)
      .map(coin => ({ currency: coin.coin, amount: coin.tip }));

    await Tip.create({
      receiver_fid: cast.fid,
      tipper_fid: fid,
      points: points,
      cast_hash: cast.castHash,
      tip: tips,
    });

    return tips.reduce((total, tip) => total + tip.amount, 0);
  } catch (error) {
    console.error(`Error in sendTip for ${cast.text}:`, error);
    return 0;
  }
}