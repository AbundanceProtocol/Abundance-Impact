import { decryptPassword } from '../../utils/utils';
import connectToDatabase from '../../libs/mongodb';
import User from '../../models/User';
import ScheduleTip from '../../models/ScheduleTip';
import Fund from '../../models/Fund';

const secretKey = process.env.SECRET_KEY;
const special = process.env.SPECIAL_KEY;
const apiKey = process.env.NEYNAR_API_KEY;

exports.handler = async function(event, context) {

  async function autoFund() {
    try {
      await connectToDatabase()
      // let testFids = [195117, 388571, 512380, 321795, 476047] // testing 
      const twoHours = new Date(Date.now() - 2 * 60 * 60 * 1000);
      let fundedFids = await Fund.distinct("fid", { createdAt: { $gte: twoHours }, points: '$IMPACT', funding_type: 'remaining' });

      let userSchedules = await ScheduleTip.find({ active_cron: true, points: '$IMPACT', fid: { "$nin": fundedFids } }).select('fid search_curators currencies uuid creator_fund development_fund growth_fund special_fund').exec()

      let userData = await getFundingData(userSchedules)

      let totalCasts = 0
      for (const user of userData) {
        if (user?.castText) {
          await new Promise(resolve => setTimeout(resolve, 10));
          totalCasts += await sendTip(user)
        }
      }

      return {userData: userData?.length || 0, totalCasts};
      
    } catch (error) {
      console.error('Error in autoFund:', error);
      return {userData: 0, totalCasts: 0};
    }
  }


  const {userData, totalCasts} = await autoFund()

  console.log(`Processing complete. Success: ${totalCasts} of ${userData}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Processing complete. Success: ${totalCasts} of ${userData}` })
  };

};






async function sendTip(user) {
  let degen = 0
  let ham = 0
  let growthDegen = 0
  let creatorDegen = 0
  let devDegen = 0
  let specialDegen = 0
  let growthHam = 0
  let creatorHam = 0
  let devHam = 0
  let specialHam = 0

  const signer = decryptPassword(user?.uuid, secretKey)

  for (const coin of user?.allowances) {
    if (coin?.totalTip > 0) {
      if (coin?.token == "$TN100x") {
        ham = coin.totalTip
      } else {
        degen = coin.totalTip
      }
    }
  }

  growthDegen = Math.floor(degen * user?.growth_fund / 100) || 0
  creatorDegen = Math.floor(degen * user?.creator_fund / 100) || 0
  specialDegen = Math.floor(degen * user?.special_fund / 100) || 0
  devDegen = degen - growthDegen - creatorDegen - specialDegen
  growthHam = Math.floor(ham * user?.growth_fund / 100) || 0
  creatorHam = Math.floor(ham * user?.creator_fund / 100) || 0
  specialHam = Math.floor(ham * user?.special_fund / 100) || 0
  devHam = ham - growthHam - creatorHam - specialHam

  const base = "https://api.neynar.com/";
  const url = `${base}v2/farcaster/cast`;
  const body = {
    signer_uuid: signer,
    text: user?.castText,
    parent: "0x3108138fb5b2f3e88d3bbc06df043c8a9b66d68f" // to be updated
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
      console.error(`Failed to send request for ${user?.fid}`);
      return 0;
    } else {

      await Fund.create({
        fid: user?.fid,
        degen_amount: degen,
        ham_amount: ham,
        points: '$IMPACT',
        growth_fund: user?.growth_fund || 0,
        growth_degen_amount: growthDegen || 0,
        growth_ham_amount: growthHam || 0,
        development_fund: user?.development_fund || 0,
        development_degen_amount: devDegen,
        development_ham_amount: devHam,
        creator_fund: user?.creator_fund || 0,
        creator_degen_amount: creatorDegen,
        creator_ham_amount: creatorHam,
        special_fund: user?.special_fund,
        special_degen_amount: specialDegen || 0,
        special_ham_amount: specialHam || 0,
        funding_type: 'remaining',
        season: 2,
        curator_fid: user?.curator_fids || [],
        channel_id: user?.channels || [],
      });
  
      return 1;
    }

  } catch (error) {
    console.error(`Error in sendTip for ${user?.fid}:`, error);
    return 0;
  }
}






async function getCurators(curators) {
  if (curators?.length > 0) {
    try {
      let curatorsData = curators.map(String);
      await connectToDatabase();
      let usernames = await User.distinct('username', { fid: { $in: curatorsData }, ecosystem_points: '$IMPACT' });
      return usernames
    } catch (error) {
      console.error('Error in getting curators:', error);
      return [];
    }
  } else {
    return []
  }
}

function getCastText(user, allowances, curators) {
  let castText = "@impactfund: "
  for (const coin of allowances) {
    if (coin?.totalTip > 0) {
      if (coin?.token == "$TN100x") {
        castText += `🍖x${coin.totalTip} `
      } else {
        castText += `${coin.totalTip} ${coin.token} `
      }
    }
  }
  if (user?.creator_fund > 0) {
    castText += `\n\nCreator Fund: ${user?.creator_fund}%`
    if (curators?.length > 0) {
      castText += `\n(curations by`
      for (const curator of curators) {
        castText += ` @${curator}`
      }
      castText += `)`
    }
    if (user?.search_channels?.length > 0) {
      castText += `\n(curations for`
      for (const channel of user?.search_channels) {
        castText += ` /${channel}`
      }
      castText += `)`
    }
  }
  if (user?.growth_fund > 0) {
    castText += `\n\nGrowth Fund: ${user?.growth_fund}%`
  }
  if (user?.development_fund > 0) {
    castText += `\n\nDevelopment Fund: ${user?.development_fund}%`
  }
  if (user?.special_fund > 0) {
    castText += `\n\n${special} Fund: ${user?.special_fund}%`
  }
  return castText
}




async function getFundingData(userSchedules) {
  // console.log('userSchedules', userSchedules)
  let userData = []
  for (let user of userSchedules) {
    let allowances = await getAllowances(user.fid, user.currencies, 100, '7pm')

    let curators = []
    if (user?.search_curators?.length > 0) {
      curators = await getCurators(user?.search_curators)
    }
    console.log('curators', curators)

    let castText = null
    if (allowances.some(allowance => allowance.totalTip > 0)) {
      castText = getCastText(user, allowances, curators)
    }
    console.log('castText', castText)

    let userObject = { 
      fid: user?.fid, 
      uuid: user?.uuid, 
      curator_fids: user?.search_curators,
      curators: curators, 
      channels: user?.search_channels,
      creator_fund: user?.creator_fund, 
      development_fund: user?.development_fund, 
      growth_fund: user?.growth_fund, 
      special_fund: user?.special_fund, 
      allowances, 
      castText
     };
    userData.push(userObject);
  }
  return userData;
}

async function getAllowances(fid, currencies, percent, tipTime) {
  await new Promise(resolve => setTimeout(resolve, 30));
  const allowances = [];
  for (const coin of currencies) {
    let allowance, tip;
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
    return (getRemaining?.todaysAllocation && Math.floor((Number(getRemaining?.todaysAllocation) - Number(getRemaining?.totalTippedToday))/1e18) >= 0) ? Math.floor((Number(getRemaining?.todaysAllocation) - Number(getRemaining?.totalTippedToday))/1e18) : 0
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
      if (Number(data[0]?.remaining_tip_allowance) >= 0) {
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
