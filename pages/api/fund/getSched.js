import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
// import Raffle from '../../../models/Raffle';
// import { decryptPassword } from '../../../utils/utils';
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const {fid} = req.query
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getSchedule(fid) {
      try {
        await connectToDatabase();

        const schedule = await ScheduleTip.findOne({ fid }, { uuid: 0, code: 0 });
        
        return schedule
      } catch (error) {
        console.error("Error getting top curators:", error);
        return null
      }
    }


    try {
      
      let schedule = await getSchedule(fid)
      console.log('schedule', schedule)
      res.status(200).json({ schedule });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}