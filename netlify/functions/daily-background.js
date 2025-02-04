import connectToDatabase from '../../libs/mongodb';
import OptOut from '../../models/OptOut';
import Impact from '../../models/Impact';
import Quality from '../../models/Quality';
import Circle from '../../models/Circle';
import User from '../../models/User';
import Tip from '../../models/Tip';
import Fund from '../../models/Fund';
import Claim from '../../models/Claim';
import Raffle from '../../models/Raffle';
// import { v4 as uuid } from 'uuid'

const wcApiKey = process.env.WC_API_KEY
const userFid = process.env.USER_FID

exports.handler = async function(event, context) {


  async function getClaimList() {
    try {

      // let funds = 2000 * 0.65
      let funds = await  getGrowthFunds()
      console.log('funds', funds)

      const unclaimed = await getUnclaimed()

      console.log('unclaimed', unclaimed)

      let userData = await getCombinedData()
      if (Array.isArray(userData)) {
        userData = userData.filter(user => user.fid !== 9326);
      }
  
      let newData = []

      for (let user of userData) {
        let adjusted = bellCurveMultiplier(user?.impact_score_3d)
        let updatedUser = {
          fid: user.fid,
          pfp: user.pfp,
          impact: user.impact_score_3d,
          username: user.username,
          adjusted
        }
        newData.push(updatedUser)
      }
  

      let pointCounter = 0

      for (let user of newData) {
        pointCounter += user.adjusted || 0
      } 

      console.log('pointCounter', pointCounter)

      let multiplier = 0
      
      if (pointCounter > 0) {
        multiplier = funds / pointCounter
      }
      console.log('multiplier', multiplier)
      
      let updatedData = []

      for (let user of newData) {
        console.log('data', user.adjusted, multiplier)
        let updatedUser = {
          fid: user.fid,
          pfp: user.pfp,
          impact: user.impact,
          username: user.username,
          adjusted: user.adjusted,
          degen: Math.floor(user.adjusted * multiplier),
          total: Math.floor(user.adjusted * multiplier)
        }

        updatedData.push(updatedUser)
      }

      let totalDegen = 0
      for (let user of updatedData) {
        totalDegen += user.degen
      }

      console.log('funds', funds, totalDegen)


      for (let user of updatedData) {
        if (user.degen < 5) {
          user.degen = 5
          user.total = 5
        }
      }

      totalDegen = 0
      for (let user of updatedData) {
        totalDegen += user.degen
      }

      let sumDegen = updatedData.reduce((acc, user) => acc + user.degen, 0);
      console.log('Sum of degen:', sumDegen);

      updatedData.sort((a, b) => b.degen - a.degen);

      while (sumDegen > funds) {
        for (let user of updatedData) {
          if (user.degen > 5) {
            user.degen -= 1;
            user.total -= 1;
          }
          sumDegen = updatedData.reduce((acc, user) => acc + user.degen, 0);
          console.log('Sum of degens:', sumDegen);
          if (sumDegen <= funds) {
            break;
          }
        }
      }

      for (let user of unclaimed) {
        const index = updatedData.findIndex(updatedUser => updatedUser.fid === user._id);

        if (index !== -1) {
          updatedData[index].total += user?.sum || 0
        } else {
          const newUser = {
            fid: user._id,
            pfp: user.pfp,
            username: user.username,
            degen: 0,
            total: user.sum,
            claimed: false
          };

          updatedData.push(newUser)
        }
      }


      console.log('funds', funds, totalDegen)

      for (let user of updatedData) {
        const newClaim = new Claim({
          fid: user.fid,
          pfp: user.pfp,
          username: user.username,
          degen_amount: user.degen || 0,
          degen_total: user.total || 0,
          claimed: false
        });
        await newClaim.save();
      }


      return updatedData
      // console.log('adjustedData', newData)
      // res.status(200).json({ message: 'nominations, tips', updatedData, unclaimed });
    } catch (error) {
      console.error('Error handling GET request:', error);
      return null
    }
  }

  const updatedClaimList = await getClaimList();

  console.log('mergedFids', updatedClaimList);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `updatedClaimList: ${updatedClaimList}` })
  };

};




async function getGrowthFunds() {
  try {
    await connectToDatabase();
    const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sumGrowthDegenAmount = await Fund.aggregate([
      { $match: { createdAt: { $gt: lastDay } } },
      { $group: { _id: null, sum: { $sum: "$growth_degen_amount" } } }
    ]).then(result => result[0].sum);

    return sumGrowthDegenAmount * 0.65
  } catch (error) {
    return 0
  }
}




async function getCombinedData() {
  try {
    await connectToDatabase();

    const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);

    let threeTimeWinners = []
    threeTimeWinners = await Tip.aggregate([
      { $match: { 
        tipper_fid: 9326,
        "tip.amount": 5000,
        "tip.currency": { $regex: /^\$degen$/i },
        createdAt: { $gte: threeWeeksAgo }
      }},
      { $group: {
        _id: "$receiver_fid",
        count: { $sum: 1 }
      }},
      { $match: { count: { $gte: 3 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } }
    ]).then(tips => tips.map(tip => tip._id));

    threeTimeWinners.push(388571) // exclude @impactbot from raffle

    const impactScoreData = await Raffle.find({ impact_score_3d: { $gte: 0.25 }, fid: { $nin: threeTimeWinners } }, { fid: 1, impact_score_3d: 1 }).lean();

    const usernames = await Promise.all(impactScoreData.map(async (item) => {
      const user = await User.findOne({ fid: item.fid.toString() }, { username: 1 }).lean();
      return user ? user.username : 'Unknown User';
    }));
    impactScoreData.forEach((item, index) => {
      item.username = usernames[index];
    });

    const pfps = await Promise.all(impactScoreData.map(async (item) => {
      const user = await User.findOne({ fid: item.fid.toString() }, { pfp: 1 }).lean();
      return user ? user.pfp : 'Unknown User';
    }));
    impactScoreData.forEach((item, index) => {
      item.pfp = pfps[index];
    });


    // console.log('Impact Score Data:', impactScoreData);
    return impactScoreData
  } catch (error) {
    return null
  }
}


function bellCurveMultiplier(inputNumber) {
  const probabilities = [
      { multiplier: 10, chance: 0.01 },
      { multiplier: 9, chance: 0.01 },
      { multiplier: 8, chance: 0.01 },
      { multiplier: 7, chance: 0.02 },
      { multiplier: 6, chance: 0.02 },
      { multiplier: 4, chance: 0.03 },
      { multiplier: 3, chance: 0.04 },
      { multiplier: 2, chance: 0.0919 },
      { multiplier: 1.5, chance: 0.1191 },
      { multiplier: 1, chance: 0.1336 },
      { multiplier: 0.75, chance: 0.1191 },
      { multiplier: 0.5, chance: 0.0919 },
      { multiplier: 1/3, chance: 0.023 }, 
      { multiplier: 0.25, chance: 0.001 }  
  ];

  let random = Math.random();
  let cumulative = 0;

  for (const { multiplier, chance } of probabilities) {
      cumulative += chance;
      if (random < cumulative) {
          return inputNumber * multiplier;
      }
  }

  return inputNumber; // Fallback
}


async function getUnclaimed() {
  try {
    await connectToDatabase();
    const lastFourDays = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

    const unclaimed = await Claim.aggregate([
      { $match: { createdAt: { $gt: lastFourDays }, claimed: false } },
      { $group: { _id: "$fid", pfp: { $first: "$pfp" }, username: { $first: "$username" }, sum: { $sum: "$degen_amount" } } }
    ])
    // .then(result => result[0].sum);

    return unclaimed
  } catch (error) {
    return []
  }
}