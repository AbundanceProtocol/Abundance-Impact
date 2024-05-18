import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { name } = req.query
  if (req.method !== 'GET' || !name) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    console.log('10', name, fid)
    
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

    try {
      const topCurators = await getCurators(name)

      res.status(200).json({ users: topCurators });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}