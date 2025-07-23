import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import ScheduleTip from '../../../models/ScheduleTip';

export default async function handler(req, res) {
  const { fid } = req.query
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    console.log('fid14', fid)
    
    async function getUserSettings(fid) {
      try {
        await connectToDatabase();

        const user = await User.findOne({ fid: fid.toString(), ecosystem_points: '$IMPACT' }).select('validator boost').exec();

        const schedule = await ScheduleTip.findOne({ fid: Number(fid) }).select('currencies active_cron creator_fund').exec();

        let validate = false
        let boost = false
        let autoFund = false
        let fund = 0
        let currencies = []


        if (user) {
          console.log('User data01:', user);
          validate = user?.validator || false
          boost = user?.boost || false
        }

        if (schedule) {
          console.log('schedule data01:', schedule);
          autoFund = schedule?.active_cron || false
          fund = schedule?.creator_fund || false
          currencies = schedule?.currencies || []
        }

        return {validate, boost, autoFund, fund, currencies}
      } catch (error) {
        console.error('Error:', error);
        return {validate: false, boost: false, autoFund: false, fund: 0, currencies: []}
      }
    }

    try {
      const {validate, boost, autoFund, fund, currencies} = await getUserSettings(fid)

      res.status(200).json({ validate, boost, autoFund, fund, currencies });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}