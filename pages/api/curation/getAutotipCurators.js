import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
// import { decryptPassword } from '../../../utils/utils';
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const fid = req.query?.fid
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getSchedule(fid) {
      try {
        await connectToDatabase();
        let schedule = await ScheduleTip.findOne({ fid }).select("search_curators").exec();
        if (schedule) {
          return schedule?.search_curators
        } else {
          return null
        }
      } catch (error) {
        console.error('Error:', error);
        return null
      }
    }

    try {
      const curators = await getSchedule(fid)
  
      res.status(200).json({ curators });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}