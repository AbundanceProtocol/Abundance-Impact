import connectToDatabase from '../../libs/mongodb';
import OptOut from '../../models/OptOut';
import Impact from '../../models/Impact';
import Quality from '../../models/Quality';
import Circle from '../../models/Circle';
import User from '../../models/User';
import Tip from '../../models/Tip';
import Fund from '../../models/Fund';
import { v4 as uuid } from 'uuid'

const wcApiKey = process.env.WC_API_KEY
const userFid = process.env.USER_FID

exports.handler = async function(event, context) {


  async function updateRaffleScores() {

    try {
      await connectToDatabase()

      const points = '$IMPACT'

      const oneDay = new Date();
      oneDay.setHours(oneDay.getHours() - 24);
  
      async function getTopCuratorsByImpactPoints() {
        await connectToDatabase();
  
        const result = await Impact.aggregate([
          { $match: { createdAt: { $gte: oneDay } } },
          { $group: { 
              _id: "$curator_fid", 
              totalImpactPoints: { $sum: "$impact_points" }, 
              totalImpactDocs: { $sum: 1 } 
          } },
          { $sort: { totalImpactPoints: -1 } },
          { $limit: 15 }
        ]);
  
        return result
      }
  
      async function getUniqueCuratorsQualityCount() {
        await connectToDatabase();
  
        const result = await Quality.aggregate([
          { $match: { createdAt: { $gte: oneDay } } },
          { $group: { _id: "$curator_fid", totalQualityPoints: { $sum: 1 } } },
        ]);
  
        return result
      }
  
  
      async function getTop5UsersByTips() {
        await connectToDatabase();
  
        const result = await Tip.aggregate([
          { $group: { _id: "$tipper_fid", totalTips: { $sum: 1 } } },
          { $sort: { totalTips: -1 } },
          { $limit: 15 }
        ]);
  
        return result;
      }
  
      
      try {
        const getTopNominations = await getTopCuratorsByImpactPoints()
        const getTopQDAU = await getUniqueCuratorsQualityCount()
        const getTopTips = await getTop5UsersByTips()
  
  
  
  
        const impactUsernames = await Promise.all(getTopNominations.map(async (tip) => {
          const user = await User.findOne({ fid: tip._id.toString() });
          return {username: user ? user.username : 'Unknown User', points: tip.totalImpactPoints, casts: tip.totalImpactDocs};
        }));
  
        const qualityUsernames = await Promise.all(getTopQDAU.map(async (tip) => {
          const user = await User.findOne({ fid: tip._id.toString() });
          return {username: user ? user.username : 'Unknown User', points: tip.totalQualityPoints};
        }));
  
        console.log('qualityUsernames', qualityUsernames)
        console.log('impactUsernames', impactUsernames)
  
  
        let combinedPoints = impactUsernames.reduce((acc, current) => {
          const found = qualityUsernames.find(item => item.username === current.username);
          if (found) {
            acc[current.username] = { points: current.points + found.points };
          } else {
            acc[current.username] = { points: current.points };
          }
          return acc;
        }, {});
  
  
  
        const impactCurators = await Impact.distinct("curator_fid", { createdAt: { $gte: oneDay }, points });
  
        const curatorQualityPoints = await Promise.all(impactCurators.map(async (curator_fid) => {
            const user = await User.findOne({ fid: curator_fid.toString() });
            const target_cast_hashes = await Impact.distinct("target_cast_hash", { curator_fid, createdAt: { $gte: oneDay } });
            
            const qualityPoints = await Quality.aggregate([
                { $match: { target_cast_hash: { $in: target_cast_hashes }, createdAt: { $gte: oneDay } } },
                { $group: { _id: null, totalPoints: { $sum: '$quality_points' } } }
            ]);
        
            // Check if qualityPoints has results
            const totalPoints = qualityPoints.length > 0 ? qualityPoints[0].totalPoints : 0; // Default to 0 if no results
        
            return { curator_fid, username: user ? user.username : 'Unknown User', points: totalPoints };
        }));
  
        console.log('curatorQualityPoints', curatorQualityPoints)
  
  
  
        const combinedPointsArray = Object.entries(combinedPoints).map(([username, data]) => ({
          username,
          points: data.points
        }));
      
        const finalPoints = combinedPointsArray.reduce((acc, current) => {
          const found = curatorQualityPoints.find(item => item.username === current.username);
          if (found) {
              acc[current.username] = { points: current.points + found.points };
          } else {
              acc[current.username] = { points: current.points };
          }
          return acc;
        }, {});
  
  
  
  
  
  
  
  
        const combinedUsernames = Object.entries(finalPoints).map(([username, { points }]) => ({
          username,
          points
        }));
  
        combinedUsernames.sort((a, b) => b.points - a.points);
  
  
        
        // const tipperUsernames = await Promise.all(getTopTips.map(async (tip) => {
        //   const user = await User.findOne({ fid: tip._id.toString() });
        //   return {username: user ? user.username : 'Unknown User', tip: tip.totalTips};
        // }));
    
  
  
        const uniqueCuratorsCount = await Impact.distinct("curator_fid", { createdAt: { $gte: oneDay } });
  
        const newUserCount = await User.countDocuments({ createdAt: { $gte: oneDay } });
  
        const uniqueQualityCuratorsCount = await Quality.distinct("curator_fid", { createdAt: { $gte: oneDay } });
  
        const newOptOutCount = await OptOut.countDocuments({ createdAt: { $gte: oneDay } });
  
        const uniqueTipperCount = await Tip.distinct("tipper_fid", { createdAt: { $gte: oneDay } });
  
        const totalDegenAmount = await Tip.aggregate([
          { $match: { createdAt: { $gte: oneDay }, 'tip.currency': { $regex: /degen/i } } },
          { $unwind: '$tip' },
          { $match: { 'tip.currency': { $regex: /degen/i } } },
          { $group: { _id: null, totalAmount: { $sum: '$tip.amount' } } }
        ]);
  
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        yesterday.setHours(0, 0, 0, 0);
        const circles = await Circle.find({ createdAt: { $gte: yesterday } }).sort({ username: 1 });
  
        const circlesByUsername = circles.reduce((acc, circle) => {
          if (!acc[circle.username]) {
            acc[circle.username] = [];
          }
          acc[circle.username].push(circle.text);
          return acc;
        }, {});
  
        const circlesData = Object.entries(circlesByUsername).map(([username, texts]) => ({
          username,
          texts
        }));
  
        let dcText = ''
        
        // for (const tipper of tipperUsernames) {
        //   dcText += '@' + tipper.username + ' - tip: ' + tipper.tip + ' \n'
        // }
        // dcText += '\n'
        // for (const impact of impactUsernames) {
        //   dcText += '@' + impact.username + ' - points: ' + impact.points + ' \n'
        // }
        dcText += '\n'
        for (const quality of qualityUsernames) {
          dcText += '@' + quality.username + ' - quality: ' + quality.points + ' \n'
        }
        dcText += '\n'
        for (const user of combinedUsernames) {
          dcText += '@' + user.username + ' - combined: ' + user.points + ' \n'
        }
  
  
        dcText += '\nCurators staking: ' + uniqueCuratorsCount.length + ' \n'
        dcText += 'New users: ' + newUserCount + ' \n'
        dcText += 'Curators qDAU: ' + uniqueQualityCuratorsCount.length + ' \n'
        dcText += 'New opt outs: ' + newOptOutCount + ' \n'
        dcText += 'Users tipping: ' + uniqueTipperCount.length + ' \n'
        dcText += 'Total $degen: ' + totalDegenAmount[0].totalAmount + ' \n'
        // dcText += 'Circle data: ' + circlesData + '\n'
        console.log('dcText', dcText)

        if (dcText?.length >= 990) {
          dcText = dcText.substring(0, 990);
        }

  
        async function sendDc(text, fid) {
          await new Promise(resolve => setTimeout(resolve, 50));

          try {
            const requestBody = {
              "recipientFid": fid,
              "message": text,
            };
            const headers = {
              Authorization: `Bearer ${wcApiKey}`,
              "Content-Type": "application/json",
              "idempotency-key": uuid()
            };
            const sentDC = await fetch('https://api.warpcast.com/fc/message', {
              method: 'PUT',
              headers: headers,
              body: JSON.stringify(requestBody),
            })
            console.log('sentDC', sentDC)
            return sentDC
          } catch (error) {
            console.error('Error handling request:', error);
            return null;
          }
        }
  
        await sendDc(dcText, 9326);
        await sendDc(dcText, Number(userFid));

        const getTipDcs = await getTips()

        for (const dc of getTipDcs) {
          await sendDc(dc, 9326);
          await sendDc(dc, Number(userFid));
        }

        return dcText

      } catch (error) {
        console.error('Error handling GET request:', error);
        return null
      }


    } catch (error) {
      console.error('Error handling GET request:', error);
      return null
    }
  }

  const mergedFids = await updateRaffleScores();

  console.log('mergedFids', mergedFids);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `mergedFids: ${mergedFids}` })
  };

};




async function getTips() {
  try {
    await connectToDatabase()
    const oneDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let fundData = await Fund.find({ createdAt: { $gte: oneDay } }).select('-_id fid degen_amount ham_amount');



    const totalDegen = await Tip.aggregate([
      {
        $unwind: "$tip",
      },
      {
        $match: {
          "tip.currency": "$DEGEN",
          createdAt: { $gte: oneDay }
        },
      },
      {
        $group: {
          _id: "$tipper_fid",
          degen_amount: { $sum: "$tip.amount" },
        },
      },
    ]);



    let totalHam = await Tip.aggregate([
      {
        $unwind: "$tip",
      },
      {
        $match: {
          "tip.currency": "$TN100x",
          createdAt: { $gte: oneDay }
        },
      },
      {
        $group: {
          _id: "$tipper_fid",
          ham_amount: { $sum: "$tip.amount" },
        },
      },
    ]);

    let combinedData = totalDegen.map(degen => {
      const hamData = totalHam.find(ham => ham._id === degen._id);
      return {
        fid: degen._id,
        degen_amount: degen.degen_amount,
        ham_amount: hamData ? hamData.ham_amount : 0,
      };
    });


    totalHam.forEach(ham => {
      if (!combinedData.some(degen => degen.fid === ham._id)) {
        combinedData.push({
          fid: ham._id,
          degen_amount: 0,
          ham_amount: ham.ham_amount,
        });
      }
    });

    let combinedAllData = combinedData.map(degen => {
      const fundDataItem = fundData.find(fund => fund.fid === degen.fid);
      return {
        fid: degen.fid,
        degen_amount: degen.degen_amount + (fundDataItem ? fundDataItem.degen_amount : 0),
        ham_amount: degen.ham_amount + (fundDataItem ? fundDataItem.ham_amount : 0),
      };
    });

    fundData.forEach(fund => {
      if (!combinedAllData.some(degen => degen.fid === fund.fid)) {
        combinedAllData.push({
          fid: fund.fid,
          degen_amount: fund.degen_amount,
          ham_amount: fund.ham_amount,
        });
      }
    });

    combinedAllData.sort((a, b) => a.fid - b.fid);

             
    let combinedTipData = await Promise.all(combinedAllData.map(async (fund) => {
      const user = await User.findOne({ fid: fund.fid.toString() }).select('username');
      return {
        username: user ? user.username : 'Unknown',
        fid: fund.fid,
        degen: fund.degen_amount,
        ham: fund.ham_amount,
        score: (5 * fund.degen_amount + fund.ham_amount) / 1000
      };
    }));
    
    combinedTipData.sort((a, b) => b.score - a.score);
        
    let dcs = []
    
    let dcText = ''
    for (const user of combinedTipData) {
      const addition = `@${user.username} degen: ${user.degen} ham: ${user.ham} rank: ${user.score}\n`;
      if (dcText.length + addition.length < 900) {
        dcText += addition;
      } else {
        dcs.push(dcText);
        dcText = '';
      }
    }
    dcs.push(dcText)

    // for (const dc of dcs) {
    //   console.log('dc', dc)
    // }

    // console.log('dcs', dcs)
    return dcs
  } catch (error) {
    console.error('Error in getDegenAllowance:');
    return [];
  }
}