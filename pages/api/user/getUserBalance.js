import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { fid } = req.query
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    console.log('fid10', fid)
    
    async function getUserBalance(fid) {
      try {
        await connectToDatabase();

        const user = await User.findOne({ fid: fid.toString(), ecosystem_points: '$IMPACT' }).select('remaining_i_allowance').exec();
        if (user) {
          console.log('User data01:', user.remaining_i_allowance);
          return user?.remaining_i_allowance;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    }

    try {
      const userBalance = await getUserBalance(fid)

      res.status(200).json({ balance: userBalance });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}