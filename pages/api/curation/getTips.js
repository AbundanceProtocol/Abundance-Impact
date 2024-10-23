import connectToDatabase from '../../../libs/mongodb';
import Circle from '../../../models/Circle';
import User from '../../../models/User';
import EcosystemRules from '../../../models/EcosystemRules';

export default async function handler(req, res) {
  const { fid } = req.query
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    async function getMultitips(fid) {
      try {
        await connectToDatabase();

        let latestCircles = await Circle.find({ fid })
          .sort({ createdAt: -1 }).limit(5).exec();

        const uniquePoints = [...new Set(latestCircles.flatMap(circle => circle.points))];
        console.log('uniquePoints', uniquePoints);

        const curatorFids = [...new Set(latestCircles.flatMap(circle => circle.curators))];
        console.log('curatorFids', curatorFids)

        const ecosystemHandles = await EcosystemRules.find({ ecosystem_points_name: { $in: uniquePoints } })
          .select('ecosystem_points_name ecosystem_handle').lean().exec();

        console.log('ecosystemHandles', ecosystemHandles)

        const pointsToHandleMap = ecosystemHandles.reduce((map, ecosystem) => {
          map[ecosystem.ecosystem_points_name] = ecosystem.ecosystem_handle;
          return map;
        }, {});

        console.log('pointsToHandleMap', pointsToHandleMap)

        const circlesWithHandles = latestCircles.map(circle => ({
          ...circle.toObject(),
          handle: pointsToHandleMap[circle.points] || 'Unknown'
          
        }));

        console.log('circlesWithHandles', circlesWithHandles)


        const curatorUsers = await User.find({ fid: { $in: curatorFids } })
          .select('fid username')
          .lean()
          .exec();

        const fidToUsernameMap = curatorUsers.reduce((map, user) => {
          map[user.fid] = user.username;
          return map;
        }, {});

        console.log('fidToUsernameMap', fidToUsernameMap)


        const circlesWithUsernames = circlesWithHandles.map(circle => ({
          ...circle,
          curators: circle.curators.map(fid => ({
            fid,
            username: fidToUsernameMap[fid] || 'Unknown'
          }))
        }));

        if (circlesWithUsernames) {
          return circlesWithUsernames;
        } else {
          return []
        }
      } catch (err) {
        console.error('Error:', err);
        return [];
      }
    };

    try {
      const latestTips = await getMultitips(fid)
      // console.log(topCurators)
      res.status(200).json({ latestTips });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
