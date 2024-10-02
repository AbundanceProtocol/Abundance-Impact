import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';
import Quality from '../../../models/Quality';
import OptOut from '../../../models/OptOut';

const dataCode = process.env.DATA_CODE
const wcApiKey = process.env.WC_API_KEY

export default async function handler(req, res) {
  const { code } = req.query

  if (req.method !== 'GET' || code !== dataCode) {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {

    const oneDay = new Date();
    oneDay.setHours(oneDay.getHours() - 24);

    async function getTopCuratorsByImpactPoints() {
      await connectToDatabase();

      const result = await Impact.aggregate([
        { $match: { createdAt: { $gte: oneDay } } },
        { $group: { _id: "$curator_fid", totalImpactPoints: { $sum: "$impact_points" } } },
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
        return {username: user ? user.username : 'Unknown User', points: tip.totalImpactPoints};
      }));

      const qualityUsernames = await Promise.all(getTopQDAU.map(async (tip) => {
        const user = await User.findOne({ fid: tip._id.toString() });
        return {username: user ? user.username : 'Unknown User', points: tip.totalQualityPoints};
      }));



      const tipperUsernames = await Promise.all(getTopTips.map(async (tip) => {
        const user = await User.findOne({ fid: tip._id.toString() });
        return {username: user ? user.username : 'Unknown User', tip: tip.totalTips};
      }));
  


      const uniqueCuratorsCount = await Impact.distinct("curator_fid", { createdAt: { $gte: oneDay } });
      console.log(`Number of unique 'curator_fid's that created Impact docs in the past 24 hours: ${uniqueCuratorsCount.length}`);

      const newUserCount = await User.countDocuments({ createdAt: { $gte: oneDay } });
      console.log(`Number of new User docs created in the last 24 hours: ${newUserCount}`);

      const uniqueQualityCuratorsCount = await Quality.distinct("curator_fid", { createdAt: { $gte: oneDay } });
      console.log(`Number of unique 'curator_fid's that created Quality docs in the past 24 hours: ${uniqueQualityCuratorsCount.length}`);


      const newOptOutCount = await OptOut.countDocuments({ createdAt: { $gte: oneDay } });
      console.log(`Number of new OptOut docs created in the last 24 hours: ${newOptOutCount}`);

      const uniqueTipperCount = await Tip.distinct("tipper_fid", { createdAt: { $gte: oneDay } });
      console.log(`Number of unique 'tipper_fid's that created new Tip docs in the past 24 hours: ${uniqueTipperCount.length}`);

      const totalDegenAmount = await Tip.aggregate([
        { $match: { createdAt: { $gte: oneDay }, 'tip.currency': { $regex: /degen/i } } },
        { $unwind: '$tip' },
        { $match: { 'tip.currency': { $regex: /degen/i } } },
        { $group: { _id: null, totalAmount: { $sum: '$tip.amount' } } }
      ]);
      console.log(`Total 'amount' of '$degen' 'currency' in Tip documents created in the past 24 hours: ${totalDegenAmount[0].totalAmount}`);


      let dcText = ''
      
      for (const tipper of tipperUsernames) {
        dcText += '@' + tipper.username + ' - tip: ' + tipper.tip + '\n'
      }
      dcText += '\n'
      for (const impact of impactUsernames) {
        dcText += '@' + impact.username + ' - points: ' + impact.points + '\n'
      }
      dcText += '\n'
      for (const quality of qualityUsernames) {
        dcText += '@' + quality.username + ' - tip: ' + quality.points + '\n'
      }

      dcText += '\nCurators staking: ' + uniqueCuratorsCount.length + '\n'
      dcText += 'New users: ' + newUserCount + '\n'
      dcText += 'Curators qDAU: ' + uniqueQualityCuratorsCount.length + '\n'
      dcText += 'New opt outs: ' + newOptOutCount + '\n'
      dcText += 'Users tipping: ' + uniqueTipperCount.length + '\n'
      dcText += 'Total $degen: ' + totalDegenAmount[0].totalAmount + '\n'

      async function sendDc() {
        const response = await fetch(
          "https://api.warpcast.com/v2/ext-send-direct-cast",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${wcApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipientFid: 9326,
              message: dcText,
              idempotencyKey: Math.random().toString(36).substring(7),
            }),
          },
        );
      }
      
      sendDc();

      console.log('nominations, tips', tipperUsernames, impactUsernames, uniqueCuratorsCount, newUserCount, uniqueQualityCuratorsCount, newOptOutCount, uniqueTipperCount, totalDegenAmount, qualityUsernames)


      res.status(200).json({ message: 'nominations, tips', tipperUsernames, impactUsernames, uniqueCuratorsCount, newUserCount, uniqueQualityCuratorsCount, newOptOutCount, uniqueTipperCount, totalDegenAmount, qualityUsernames });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
