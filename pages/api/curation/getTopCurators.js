import connectToDatabase from '../../../libs/mongodb';
import Tip from '../../../models/Tip';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import User from '../../../models/User';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { points } = req.query
  if (req.method !== 'GET' || !points) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getTopCurators(points) {
      try {
        await connectToDatabase();

        const oneDay = new Date();
        oneDay.setHours(oneDay.getHours() - 24);
    
        async function getTopCuratorsByImpactPoints() {
          await connectToDatabase();
    
          const result = await Impact.aggregate([
            { $match: { createdAt: { $gte: oneDay }, points } },
            { $group: { _id: "$curator_fid", totalImpactPoints: { $sum: "$impact_points" } } },
            { $sort: { totalImpactPoints: -1 } },
            { $limit: 15 }
          ]);
    
          return result
        }

        async function getUniqueCuratorsQualityCount() {
          await connectToDatabase();
    
          const result = await Quality.aggregate([
            { $match: { createdAt: { $gte: oneDay }, points } },
            { $group: { _id: "$curator_fid", totalQualityPoints: { $sum: 1 } } },
          ]);
    
          return result
        }

        const getTopNominations = await getTopCuratorsByImpactPoints()
        const getTopQDAU = await getUniqueCuratorsQualityCount()
    
        const impactUsernames = await Promise.all(getTopNominations.map(async (tip) => {
          const user = await User.findOne({ fid: tip._id.toString() });
          return {username: user ? user?.username : 'Unknown User', points: tip.totalImpactPoints, fid: tip._id, author_pfp: user.pfp, author_name: user.username };
        }));

        const qualityUsernames = await Promise.all(getTopQDAU.map(async (tip) => {
          const user = await User.findOne({ fid: tip._id.toString() });
          return {username: user ? user?.username : 'Unknown User', points: tip.totalQualityPoints, fid: tip._id, author_pfp: user.pfp, author_name: user.username };
        }));

        let combinedPoints = impactUsernames.reduce((acc, current) => {
          const found = qualityUsernames.find(item => item.username === current.username);
          if (found) {
            acc[current.username] = { points: current.points + found.points, author_pfp: current.author_pfp, author_name: current.author_name, fid: current.fid };
          } else {
            acc[current.username] = { points: current.points, author_pfp: current.author_pfp, author_name: current.author_name, fid: current.fid };
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
        
            const totalPoints = qualityPoints.length > 0 ? qualityPoints[0].totalPoints : 0;
        
            return { curator_fid, username: user ? user.username : 'Unknown User', points: totalPoints };
        }));

        const combinedPointsArray = Object.entries(combinedPoints).map(([username, { points, author_pfp, author_name, fid }]) => ({
          username,
          points,
          author_pfp,
          author_name,
          fid
        }));
  

        let finalPoints = combinedPointsArray.reduce((acc, current) => {
          const found = curatorQualityPoints.find(item => item.username === current.username);
          if (found) {
            acc[current.username] = { points: current.points + found.points, author_pfp: current.author_pfp, author_name: current.author_name, fid: current.fid };
          } else {
            acc[current.username] = { points: current.points, author_pfp: current.author_pfp, author_name: current.author_name, fid: current.fid };
          }
          return acc;
        }, {});




        const combinedUsernames = Object.entries(finalPoints).map(([username, { points, author_pfp, author_name, fid }]) => ({
          username,
          points,
          author_pfp,
          author_name,
          fid
        }));

        combinedUsernames.sort((a, b) => b.points - a.points);
  
        const top10CombinedUsernames = combinedUsernames.slice(0, 10);
        return top10CombinedUsernames;
      } catch (err) {
        console.error('Error:', err);
        return [];
      }
    };

    try {
      const topCurators = await getTopCurators(points)
      console.log(topCurators)
      res.status(200).json({ topCurators });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
