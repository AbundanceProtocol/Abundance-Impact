import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Raffle from '../../../models/Raffle';
import Circle from '../../../models/Circle';
import Tip from '../../../models/Tip';
import Quality from '../../../models/Quality';
import OptOut from '../../../models/OptOut';

const dataCode = process.env.DATA_CODE
const wcApiKey = process.env.WC_API_KEY

export default async function handler(req, res) {
  const { code } = req.query
  const points = '$IMPACT'
  // if (req.method !== 'GET' || code !== dataCode) {
  if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {

    async function getCombinedData() {
      try {
        const impactScoreData = await Raffle.find({ impact_score_3d: { $gte: 0.25 } }, { fid: 1, impact_score_3d: 1 }).lean();

        const usernames = await Promise.all(impactScoreData.map(async (item) => {
          const user = await User.findOne({ fid: item.fid.toString() }, { username: 1 }).lean();
          return user ? user.username : 'Unknown User';
        }));
        impactScoreData.forEach((item, index) => {
          item.username = usernames[index];
        });
        // console.log('Impact Score Data:', impactScoreData);
        return impactScoreData
      } catch (error) {
        return null
      }
    }
    


    
    try {
      let userData = await getCombinedData()
      if (Array.isArray(userData)) {
        userData = userData.filter(user => user.fid !== 9326);
      }
      console.log('adjustedData', userData)
      res.status(200).json({ message: 'nominations, tips', userData });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
