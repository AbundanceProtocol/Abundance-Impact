import connectToDatabase from '../../../libs/mongodb';
import Tip from '../../../models/Tip';
// import Impact from '../../../models/Impact';
// import Quality from '../../../models/Quality';
import User from '../../../models/User';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { points, time } = req.query
  if (req.method !== 'GET' || !points) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let hours = 24

    if (time == '24h') {
      hours = 24
    } else if (time == '3d') {
      hours = 3 * 24
    } else if (time == '7d') {
      hours = 7 * 24
    } else if (time == '30d') {
      hours = 30 * 24
    } else if (time == 'all') {
      hours = 3650 * 24
    }


    async function getTopContributors(points) {
      try {

        const timeFrame = new Date();
        timeFrame.setHours(timeFrame.getHours() - hours);
    
        async function getContributors(points) {
          try {
            await connectToDatabase();

            const result = await Tip.aggregate([
              { $match: { createdAt: { $gte: timeFrame }, points } },
              { $unwind: "$tip" },
              { $match: { "tip.currency": { $regex: /^\$degen$/i } } },
              { $group: {
                _id: "$tipper_fid", 
                totalTips: { $sum: "$tip.amount" }
              }},
              { $sort: { totalTips: -1, _id: -1 } }, 
              { $skip: skip },
              { $limit: limit }
            ]);

            const contributorsWithDetails = await User.aggregate([
              { $match: { fid: { $in: result.map(r => r._id.toString()) } } },
              { $group: {
                _id: "$fid",
                username: { $first: "$username" }, 
                display_name: { $first: "$display_name" }, 
                author_pfp: { $first: "$pfp" }
              }}
            ]);

            const detailsMap = new Map(contributorsWithDetails.map(c => [c._id, c]));

            const finalResult = result.map(contributor => ({
              ...contributor,
              ...detailsMap.get(contributor._id.toString()), // Ensure to convert _id to string for the map lookup
              fid: contributor._id
            }));

            finalResult.sort((a, b) => b.totalTips - a.totalTips);

            return finalResult
          } catch (err) {
            console.error('Error:', err);
            return [];
          }
        }

        const topContributors = await getContributors(points)
    
        return topContributors;
      } catch (err) {
        console.error('Error:', err);
        return [];
      }
    };

    try {
      const topContributors = await getTopContributors(points)
      // console.log(topCurators)
      res.status(200).json({ topContributors });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
