import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Circle from '../../../models/Circle';
import Tip from '../../../models/Tip';
import Quality from '../../../models/Quality';
import OptOut from '../../../models/OptOut';

const dataCode = process.env.DATA_CODE
const wcApiKey = process.env.WC_API_KEY

export default async function handler(req, res) {
  const { code } = req.query
  const points = '$IMPACT'
  // if (req.method !== 'GET' || code !== dataCode) {
  if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {

    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    yesterday.setHours(0, 0, 0, 0);
    // const oneDay = new Date();
    // oneDay.setHours(oneDay.getHours() - 24);

    async function countTipsPerTipper() {
      try {
        await connectToDatabase();
        const result = await Tip.aggregate([
          { $match: { createdAt: { $gte: yesterday }, points } },
          { $group: { _id: "$tipper_fid", total: { $sum: 1 } } },
          { $project: { _id: 0, fid: "$_id", total: { $multiply: ["$total", 2] } } }
        ]);
        return result;
      } catch (error) {
        console.error('Error counting tips per tipper:', error);
        return [];
      }
    }

    async function countImpactPerCurator(tipsData) {
      try {
        await connectToDatabase();
        const impactData = await Impact.aggregate([
          { $match: { createdAt: { $gte: yesterday }, points } },
          { $group: { _id: "$curator_fid", totalImpact: { $sum: "$impact_points" } } },
          { $project: { _id: 0, fid: "$_id", totalImpact: 1 } }
        ]);

        const mergedData = tipsData.map(tip => {
          const impact = impactData.find(i => i.fid === tip.fid);
          return { ...tip, total: (tip.total || 0) + (impact ? impact.totalImpact : 0) };
        });

        return mergedData;
      } catch (error) {
        console.error('Error counting impact per curator:', error);
        return tipsData;
      }
    }

    async function adjustCountWithQuality(data) {
      try {
        await connectToDatabase();
        const qualityData = await Promise.all(data.map(async (item) => {
          const targetCastHashes = await Impact.find({ curator_fid: item.fid, points }, { target_cast_hash: 1 }).distinct('target_cast_hash');
          const qualitySum = await Quality.find({ target_cast_hash: { $in: targetCastHashes } }, { quality_points: 1 }).sum('quality_points');
          return { fid: item.fid, qualitySum };
        }));

        const adjustedData = data.map(item => {
          const quality = qualityData.find(q => q.fid === item.fid);
          return { ...item, total: item.total + (quality ? quality.qualitySum : 0) };
        });

        return adjustedData;
      } catch (error) {
        console.error('Error adjusting count with quality:', error);
        return data;
      }
    }

    async function getCombinedData() {
      const tipsData = await countTipsPerTipper();
      const impactData = await countImpactPerCurator(tipsData);
      const adjustedData = await adjustCountWithQuality(impactData);

      const fidArray = adjustedData.map(item => item.fid);
      let users = await User.find({fid: { $in: fidArray } }, { fid: 1, username: 1, _id: 0 }).lean();

      users.forEach(user => {
        const adjustedDoc = adjustedData.find(doc => doc.fid.toString() === user.fid.toString());
        if (adjustedDoc) {
          user.total = adjustedDoc.total;
        }
      });
      users = users.filter((user, index, self) =>
        index === self.findIndex((t) => (
          t.fid === user.fid
        ))
      );

      return users;
    }


    
    try {
      let userData = await getCombinedData()
      userData = userData.filter(user => user.fid !== '9326');
      console.log('adjustedData', userData)
      res.status(200).json({ message: 'nominations, tips', userData });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
