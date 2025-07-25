import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { fid } = req.query
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    console.log('fid15', fid)
    
    async function getUserInfo(fid) {
      try {
        await connectToDatabase();

        const user = await User.findOne({ fid: fid.toString(), ecosystem_points: '$IMPACT' }).select('pfp username display_name').exec();


        let pfp = null
        let username = null
        let display = null

        if (user) {
          // console.log('User data01:', user);
          pfp = user?.pfp || null
          username = user?.username || null
          display = user?.display_name || null
        }

        return {pfp, username, display}
      } catch (error) {
        console.error('Error:', error);
        return {pfp: null, username: null, display: null}
      }
    }

    try {
      const {pfp, username, display} = await getUserInfo(fid)

      res.status(200).json({ pfp, username, display });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}