import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Miniapp from '../../../models/Miniapp';
import ScheduleTip from '../../../models/ScheduleTip';

export default async function handler(req, res) {
  const { fid, setting, data } = req.body;
  
  if (req.method !== 'POST' || !fid || !setting) {
    res.status(500).json({ error: 'Method not allowed' });
  } else {

    try {

      async function getUuid(fid, points) {
        try {
          await connectToDatabase();
          let userData = await User.findOne({ fid, ecosystem_points: points }).select('uuid').exec();
          
          if (userData) {
            return userData?.uuid || null
          } else {
            return null
          }
        } catch (error) {
          console.error("Error while fetching data:", error);
          return null
        }  
      }

      async function updateSettings(fid, setting) {
        try {
          await connectToDatabase();
          let updated = null
          let message = null
          if (setting == 'boost-on') {
            updated = await User.findOneAndUpdate({ fid: fid.toString(), ecosystem_points: '$IMPACT' }, { boost: true }, { new: true, select: '-uuid' });
          } else if (setting == 'boost-off') {
            updated = await User.findOneAndUpdate({ fid: fid.toString(), ecosystem_points: '$IMPACT' }, { boost: false }, { new: true, select: '-uuid' });
          } else if (setting == 'validate-on') {
            const notifs = await Miniapp.findOne({fid}).select('active token').exec()
            if (notifs && notifs.active && notifs.token) {
              updated = await User.findOneAndUpdate({ fid: fid.toString(), ecosystem_points: '$IMPACT' }, { validator: true }, { new: true, select: '-uuid' });
            } else {
              message = 'Turn on notifications'
            }
          } else if (setting == 'validate-off') {
            const notifs = await Miniapp.findOne({fid}).select('active token').exec()
            if (notifs && notifs.active && notifs.token) {
              updated = await User.findOneAndUpdate({ fid: fid.toString(), ecosystem_points: '$IMPACT' }, { validator: false }, { new: true, select: '-uuid' });
            } else {
              message = 'Turn on notifications'
            }
          } else if (setting == 'autoFund-on') {
            const schedule = await ScheduleTip.findOne({fid})
            if (schedule) {
              updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true }, { new: true, select: '-uuid' });
            } else {
              const encryptedUuid = await getUuid(fid, '$IMPACT')
              if (encryptedUuid) {
                let newSchedule = null
                newSchedule = new ScheduleTip({ 
                  fid: fid,
                  uuid: encryptedUuid,
                  search_shuffle: true,
                  search_time: 'all',
                  search_tags: [],
                  search_channels: [],
                  search_curators: [],
                  points: points,
                  percent_tip: 100,
                  ecosystem_name: "Abundance",
                  currencies: ['$DEGEN', '$TIPN'],
                  schedule_time: "45 18 * * *",
                  schedule_count: 1,
                  schedule_total: 1,
                  active_cron: true,
                  creator_fund: 80,
                  development_fund: 10,
                  growth_fund: 10,
                  special_fund: 0,
                });
                await newSchedule.save()
                if (newSchedule && newSchedule.toObject) {
                  const obj = newSchedule.toObject();
                  delete obj.uuid;
                  updated = obj;
                } else {
                  updated = newSchedule;
                }
                updated = newSchedule
              } else {
                message = 'Need to login'
              }
            }
          } else if (setting == 'autoFund-off') {
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: false }, { new: true, select: '-uuid' });
          } else {
            updated = null
          }
          console.log('updated', updated)
          return {updated, message}
        } catch (error) {
          console.error("Error while fetching data:", error);
          return {updated: null, message: null}
        }  
      }

      let userSettings = await getUuid(fid, '$IMPACT')

      if (userSettings) {

        const {updated, message} = await updateSettings(fid, setting)

        if (updated) {


          res.status(200).json({ updatedSettings: updated, message });
          return
        } else {
          res.status(404).json({ message: 'Need to login' });
          return
        }
        
      } else {

        res.status(404).json({ message: 'Need to login' });
        return
      }

    } catch(error) {
      console.error('Error handling POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return
    }
  }
}