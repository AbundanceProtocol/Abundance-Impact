import connectToDatabase from "../../../libs/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  const { fid, points } = req.query;

  if (req.method !== 'GET' || !fid || !points) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function getBalances(fid, points) {
      try {
        await connectToDatabase();
        const user = await User.findOne({fid: fid, ecosystem_points: points}).select('remaining_i_allowance remaining_q_allowance').exec()
        if (user) {
          console.log(user)
          return user
        } else {
          return null
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return null
      }
    }

    const user = await getBalances(fid, points)    

    res.status(200).json({ user });
  }
}