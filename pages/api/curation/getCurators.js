import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
import User from '../../../models/User';

export default async function handler(req, res) {
  const curators = req.query.name
  if (req.method === 'GET') {

    async function getCurators(curators) {
      try {
        await connectToDatabase();
        const users = await User.find({
          $or: [
            { fid: { $regex: curators, $options: 'i' } },
            { username: { $regex: curators, $options: 'i' } },
            { display_name: { $regex: curators, $options: 'i' } }
          ]
        }).select('fid username display_name pfp').sort({ display_name: 1 }).exec();

        console.log('Users:', users);
        return users;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    }

    const topCurators = await getCurators(curators)

    res.status(200).json({ users: topCurators });
  } else {

    res.status(405).json({ error: 'Method not allowed' });
  }
}