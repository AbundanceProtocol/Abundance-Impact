import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Circle from '../../../models/Circle';
import Tip from '../../../models/Tip';
import Quality from '../../../models/Quality';
import OptOut from '../../../models/OptOut';
import { v4 as uuid } from 'uuid'

const dataCode = process.env.DATA_CODE
const wcApiKey = process.env.WC_API_KEY

export default async function handler(req, res) {
  const { code } = req.query
  const points = '$IMPACT'
  // if (req.method !== 'GET' || code !== dataCode) {
  if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {

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




      async function sendDc(text, fid) {
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

      const dcData = await sendDc(dcText, 9326);
      // await sendDc(dcText, Number(userFid));

      console.log('nominations, tips', impactUsernames, uniqueCuratorsCount, newUserCount, uniqueQualityCuratorsCount, newOptOutCount, uniqueTipperCount, totalDegenAmount, qualityUsernames)
      console.log('combinedUsernames', combinedUsernames)

      res.status(200).json({ message: 'nominations, tips', combinedUsernames, circlesData, combinedUsernames, qualityUsernames, userdata: dcText, dcData });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
