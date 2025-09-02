import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Score from '../../../models/Score';
import Miniapp from '../../../models/Miniapp';
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

        const user = await User.findOne({ fid: fid.toString(), ecosystem_points: '$IMPACT' }).select('validator boost impact_boost').exec();

        const schedule = await ScheduleTip.findOne({ fid: Number(fid) }).select('active_cron creator_fund').exec();

        const score = await Score.findOne({ fid: Number(fid), points: '$IMPACT' }).select('impact_score_30d').exec();

        const notifs = await Miniapp.findOne({ fid: Number(fid) }).select('active').exec();

        let validate = false
        let boost = false
        let impactBoost = false
        let autoFund = false
        let scoreTotal = 0
        let userNotifs = false

        if (user) {
          console.log('User data01:', user);
          validate = user?.validator || false
          boost = user?.boost || false
          impactBoost = user?.impact_boost || false
        }

        if (schedule) {
          console.log('schedule data01:', schedule);
          autoFund = schedule?.active_cron || false
        }

        if (score) {
          console.log('schedule data01:', schedule);
          scoreTotal = score?.impact_score_30d || 0
        }

        if (notifs) {
          userNotifs = notifs.active || false
        }

        return {validate, boost, autoFund, impactBoost, score: scoreTotal, notifs: userNotifs}
      } catch (error) {
        console.error('Error:', error);
        return {validate: false, boost: false, autoFund: false, impactBoost: false, score: 0, notifs: false}
      }
    }

    try {
      const {validate, boost, autoFund, impactBoost, score, notifs} = await getUserSettings(fid)

      res.status(200).json({ validate, boost, autoFund, impactBoost, score, notifs });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}