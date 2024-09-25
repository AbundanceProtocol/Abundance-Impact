import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';

const dataCode = process.env.DATA_CODE
const wcApiKey = process.env.WC_API_KEY

export default async function handler(req, res) {
  const { code } = req.query

  if (req.method !== 'GET' || code !== dataCode) {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {


    async function getTopCuratorsByImpactPoints() {
      await connectToDatabase();
      const oneDay = new Date();
      oneDay.setHours(oneDay.getHours() - 24);

      const result = await Impact.aggregate([
        { $match: { createdAt: { $gte: oneDay } } },
        { $group: { _id: "$curator_fid", totalImpactPoints: { $sum: "$impact_points" } } },
        { $sort: { totalImpactPoints: -1 } },
        { $limit: 8 }
      ]);

      return result
    }

    async function getTop5UsersByTips() {
      await connectToDatabase();

      const result = await Tip.aggregate([
        { $group: { _id: "$tipper_fid", totalTips: { $sum: 1 } } },
        { $sort: { totalTips: -1 } },
        { $limit: 8 }
      ]);

      return result;
    }

    
    try {
      const getTopNominations = await getTopCuratorsByImpactPoints()
      const getTopTips = await getTop5UsersByTips()

      const impactUsernames = await Promise.all(getTopNominations.map(async (tip) => {
        const user = await User.findOne({ fid: tip._id.toString() });
        return {username: user ? user.username : 'Unknown User', points: tip.totalImpactPoints};
      }));


      const tipperUsernames = await Promise.all(getTopTips.map(async (tip) => {
        const user = await User.findOne({ fid: tip._id.toString() });
        return {username: user ? user.username : 'Unknown User', tip: tip.totalTips};
      }));
  
      console.log('nominations, tips', tipperUsernames, impactUsernames)

      let dcText = ''

      for (const tipper of tipperUsernames) {
        dcText += '@' + tipper.username + ' - tip: ' + tipper.tip + '\n'
      }
      dcText += '\n'
      for (const tipper of impactUsernames) {
        dcText += '@' + tipper.username + ' - points: ' + tipper.points + '\n'
      }

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

      res.status(200).json({ message: 'nominations, tips', tipperUsernames, impactUsernames });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
