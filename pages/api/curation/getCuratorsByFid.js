import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
import User from '../../../models/User';

export default async function handler(req, res) {
  const curators = req.query.name
  console.log(curators)
  if (req.method === 'GET') {

    async function getCurators(curators) {
      try {
        await connectToDatabase();
        const users = await User.find({ fid: { $in: curators } }).select('fid set_cast_hash').exec();

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