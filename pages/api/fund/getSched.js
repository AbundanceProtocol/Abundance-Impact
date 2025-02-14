import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import User from '../../../models/User';
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

      async function getCurators(updatedSchedule) {
        try {
          let curators = []
          if (updatedSchedule.search_curators.length > 0) {
            const curatorFids = updatedSchedule.search_curators.map(curator => curator.toString());
            const curatorDetails = await Promise.all(curatorFids.map(async fid => {
              const user = await User.findOne({fid, ecosystem_points: '$IMPACT'}).select('fid username pfp');
              return { fid: Number(user?.fid), username: user.username, pfp: user.pfp };
            }));
            curators = curatorDetails;
          }
          return curators
        } catch (error) {
          console.error("Error while fetching data:", error);
          return []
        } 
      }

      let curators = await getCurators(schedule)

      console.log('schedule', schedule, curators)
      res.status(200).json({ schedule, curators });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}