import connectToDatabase from '../../../libs/mongodb';
import Tip from '../../../models/Tip';
// import Impact from '../../../models/Impact';
// import Quality from '../../../models/Quality';
// import User from '../../../models/User';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { points, time, sort } = req.query
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


    async function getTopCreators(points) {
      try {
        await connectToDatabase();

        const timeFrame = new Date();
        timeFrame.setHours(timeFrame.getHours() - hours);
    
        async function getTopCreatorsByImpact() {
          await connectToDatabase();
    

          const result = await Cast.aggregate([
            { $match: { createdAt: { $gte: timeFrame }, points } },
            { $group: { 
              _id: "$author_fid", 
              totalImpact: { $sum: "$impact_total" },
              username: { $first: "$author_username" },
              author_name: { $first: "$author_display_name" },
              author_pfp: { $first: "$author_pfp" }
            }},
            { $project: {
              fid: "$_id",
              username: 1,
              author_name: 1,
              author_pfp: 1,
              totalImpact: 1,
              _id: 0
            }},
            { $sort: { totalImpact: -1, fid: -1 } },
            { $skip: skip },
            { $limit: limit }
          ]);

          const creatorTips = await Tip.aggregate([
            { $match: { 
              receiver_fid: { $in: result.map(r => r.fid) }
            }},
            { $unwind: "$tip" }, 
            { $match: { 
              "tip.currency": { $regex: /^\$degen$/i }
            }},
            { $group: {
              _id: "$receiver_fid",
              totalTips: { $sum: "$tip.amount" } 
            }}
          ]);

          const tipsMap = new Map(creatorTips.map(t => [t._id, t.totalTips]));

          result.forEach(creator => {
            creator.totalTips = tipsMap.get(creator.fid) || 0;
          });

          result.sort((a, b) => b.totalImpact - a.totalImpact);

          return result;
        }


        async function getTopCreatorsByTips(points) {
          try {
            await connectToDatabase();
      
            const result = await Tip.aggregate([
              { $match: { createdAt: { $gte: timeFrame }, points } },
              { $unwind: "$tip" },
              { $match: { "tip.currency": { $regex: /^\$degen$/i } } },
              { $group: {
                _id: "$receiver_fid",
                totalTips: { $sum: "$tip.amount" }
              }},
              { $sort: { totalTips: -1, receiver_fid: -1 } },
              { $skip: skip },
              { $limit: limit }
            ]);

            const contributorsWithDetails = await Cast.aggregate([
              { $match: { author_fid: { $in: result.map(r => r._id) } } },
              { $group: {
                _id: "$author_fid",
                username: { $first: "$author_username" },
                author_name: { $first: "$author_display_name" },
                author_pfp: { $first: "$author_pfp" }
              }}
            ]);

            const detailsMap = new Map(contributorsWithDetails.map(c => [c._id, c]));

            const finalResult = result.map(contributor => ({
              ...contributor,
              ...detailsMap.get(contributor._id),
              fid: contributor._id
            }));

            finalResult.sort((a, b) => b.totalTips - a.totalTips);

            return finalResult;
          } catch (err) {
            console.error('Error:', err);
            return [];
          }
        }


        let getTopCreators = []
        if (sort && sort == 'tips') {
          getTopCreators = await getTopCreatorsByTips(points)
        } else {
          getTopCreators = await getTopCreatorsByImpact()
        }
    
        return getTopCreators;
      } catch (err) {
        console.error('Error:', err);
        return [];
      }
    };

    try {
      const topCreators = await getTopCreators(points)
      // console.log(topCurators)
      res.status(200).json({ topCreators });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
