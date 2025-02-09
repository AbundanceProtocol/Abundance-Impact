import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { name, more } = req.query
  if (req.method !== 'GET' || !name) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getCurators(curators) {
      try {
        await connectToDatabase();
        const userCount = await User.countDocuments({
          $or: [
            { fid: { $regex: curators, $options: 'i' } },
            { username: { $regex: curators, $options: 'i' } },
            { display_name: { $regex: curators, $options: 'i' } }
          ]
        });

        const users = await User.find({
          $or: [
            { fid: { $regex: curators, $options: 'i' } },
            { username: { $regex: curators, $options: 'i' } },
            { display_name: { $regex: curators, $options: 'i' } }
          ]
        }).select('fid username display_name pfp').limit(!more && 20).sort({ display_name: 1 }).exec();

        const uniqueFids = new Set();
        const uniqueUsers = users.filter(user => {
          if (!uniqueFids.has(user.fid)) {
            uniqueFids.add(user.fid);
            return true;
          }
          return false;
        });

        return {curators: uniqueUsers, total: userCount};
      } catch (error) {
        console.error('Error:', error);
        return {curators: [], total: 0};
      }
    }

    try {
      const {curators, total} = await getCurators(name)

      res.status(200).json({ users: curators, length: total });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}