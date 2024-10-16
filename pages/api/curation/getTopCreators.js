import connectToDatabase from '../../../libs/mongodb';
import Tip from '../../../models/Tip';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { points } = req.query
  if (req.method !== 'GET' || !points) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getTopCreators(points) {
      try {
        await connectToDatabase();

        const results = await Tip.aggregate([
          { $match: { points: points } },
          { $unwind: "$tip" },
          { $group: {
            _id: "$receiver_fid",
            totalAmount: { $sum: "$tip.amount" }}},
          { $project: {
            _id: 0,
            receiver_fid: "$_id",
            totalAmount: 1 }},
          { $sort: { totalAmount: -1 } },
          { $limit: 10 },
          { $lookup: {
            from: 'casts',
            localField: 'receiver_fid',
            foreignField: 'author_fid',
            as: 'author_info'
          }},
          { $unwind: "$author_info" },
          { $group: {
            _id: "$receiver_fid",
            totalAmount: { $first: "$totalAmount" },
            author_name: { $first: "$author_info.author_username" },
            author_pfp: { $first: "$author_info.author_pfp" }
          }},
          { $project: {
            _id: 0,
            receiver_fid: "$_id",
            totalAmount: 1,
            author_name: 1,
            author_pfp: 1
          }},
          { $sort: { totalAmount: -1 } }
        ]);
    
        return results;
      } catch (err) {
        console.error('Error:', err);
        throw err;
      }
    };

    try {
      const topCreators = await getTopCreators(points)
      // console.log(topCreators)
      res.status(200).json({ topCreators: topCreators });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
