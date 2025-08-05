import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Miniapp from '../../../models/Miniapp';
import ScheduleTip from '../../../models/ScheduleTip';

export default async function handler(req, res) {
  const { fid, setting, data } = req.body;
  // console.log(fid, castHash, qualityAmount)
  
  if (req.method !== 'POST' || !fid || !setting) {
    res.status(500).json({ error: 'Method not allowed' });
  } else {

    try {

      async function getUuid(fid, points) {
        try {
          await connectToDatabase();
          let userData = await User.findOne({ fid, ecosystem_points: points }).select('uuid').exec();
          
          if (userData) {
            return {encryptedUuid: userData.uuid}
          } else {
            return {encryptedUuid: null}
          }
        } catch (error) {
          console.error("Error while fetching data:", error);
          return {encryptedUuid: null}
        }  
      }


      async function getSettings(fid, points) {
        try {
          await connectToDatabase();
          let userSettings = await User.findOne({ fid: fid.toString(), ecosystem_points: '$IMPACT' }).exec();
          return userSettings || null
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


          // } else if (setting == 'on') {
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true }, { new: true, select: '-uuid' });
          // } else if (setting == 'standard') {
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 100, development_fund: 0, growth_fund: 0, special_fund: 0 }, { new: true, select: '-uuid' });
          // } else if (setting == 'optimized') {
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 80, development_fund: 10, growth_fund: 10, special_fund: 0 }, { new: true, select: '-uuid' });
          // } else if (setting == 'accelerated') {
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 60, development_fund: 20, growth_fund: 20, special_fund: 0 }, { new: true, select: '-uuid' });
          // } else if (setting == 'special') {
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 0, development_fund: 0, growth_fund: 0, special_fund: 100 }, { new: true, select: '-uuid' });
          // } else if (setting == 'add-channel') {
          //   let channel = data
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { search_channels: channel }, search_curators: [] }, { new: true, select: '-uuid' });
          // } else if (setting == 'remove-channel') {
          //   let channel = data
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { search_channels: channel }, search_curators: [] }, { new: true, select: '-uuid' });
          // } else if (setting == 'add-curator') {
          //   let curator = Number(data)
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { search_curators: curator }, search_channels: [] }, { new: true, select: '-uuid' });
          // } else if (setting == 'remove-curator') {
          //   let curator = Number(data)
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { search_curators: curator }, search_channels: [] }, { new: true, select: '-uuid' });
          // } else if (setting == 'degen-off') {
          //   // let curator = Number(data)
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { currencies: '$DEGEN' } }, { new: true, select: '-uuid' });
          // } else if (setting == 'degen-on') {
          //   // let curator = Number(data)
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { currencies: '$TIPN' } }, { new: true, select: '-uuid' });
          // } else if (setting == 'tipn-off') {
          //   // let curator = Number(data)
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { currencies: '$TIPN' } }, { new: true, select: '-uuid' });
          // } else if (setting == 'tipn-on') {
          //   // let curator = Number(data)
          //   updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { currencies: '$TIPN' } }, { new: true, select: '-uuid' });
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

      async function getCurators(updatedSettings) {
        try {
          let curators = []
          if (updatedSettings.search_curators.length > 0) {
            const curatorFids = updatedSettings.search_curators.map(curator => curator.toString());
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


      // console.log('data', fid, setting)

      let userSettings = await getUuid(fid, '$IMPACT')

      // console.log('data2', userSettings)


      if (userSettings) {

        const {updated, message} = await updateSettings(fid, setting)

        if (updated) {

          // let curators = await getCurators(updatedSettings)

          res.status(200).json({ updatedSettings: updated, message });
          return
        } else {
          res.status(404).json({ message: 'Need to login' });
          return
        }
        
      } else {



      // const encryptedUuid = await getUuid(fid, '$IMPACT')

      // console.log('data3', encryptedUuid, ecoName)



      // if (!encryptedUuid) {
      //   res.status(500).json({ error: 'Method not allowed' });
      // } else {

      //   async function setSchedule(fid, points, encryptedUuid) {

      //     let active_cron = true
      //     let creator_fund = 80
      //     let development_fund = 10
      //     let growth_fund = 10
      //     let special_fund = 0

      //     // if (setting == 'off') {
      //     //   active_cron = false
      //     // } else if (setting == 'on') {
      //     //   active_cron = true
      //     // } else if (setting == 'standard') {
      //     //   active_cron = true
      //     //   creator_fund = 100
      //     //   development_fund = 0
      //     //   growth_fund = 0
      //     //   special_fund = 0
      //     // } else if (setting == 'optimized') {
      //     //   active_cron = true
      //     //   creator_fund = 80
      //     //   development_fund = 10
      //     //   growth_fund = 10
      //     //   special_fund = 0
      //     // } else if (setting == 'accelerated') {
      //     //   active_cron = true
      //     //   creator_fund = 60
      //     //   development_fund = 20
      //     //   growth_fund = 20
      //     //   special_fund = 0
      //     // } else if (setting == 'special') {
      //     //   active_cron = true
      //     //   creator_fund = 0
      //     //   development_fund = 0
      //     //   growth_fund = 0
      //     //   special_fund = 100
      //     // }

      //     let newSchedule = null
      //     try {
      //       await connectToDatabase();

            
      //       newSchedule = new ScheduleTip({ 
      //         fid: fid,
      //         uuid: encryptedUuid,
      //         search_shuffle: true,
      //         search_time: 'all',
      //         search_tags: [],
      //         search_channels: [],
      //         search_curators: [],
      //         points: points,
      //         percent_tip: 100,
      //         ecosystem_name: "Abundance",
      //         currencies: ['$DEGEN', '$TIPN'],
      //         schedule_time: "45 18 * * *",
      //         schedule_count: 1,
      //         schedule_total: 1,
      //         active_cron,
      //         ...(creator_fund !== null ? { creator_fund } : {}),
      //         ...(development_fund !== null ? { development_fund } : {}),
      //         ...(growth_fund !== null ? { growth_fund } : {}),
      //         ...(special_fund !== null ? { special_fund } : {}),
      //       });
            
      //       await newSchedule.save()
      //       const updatedSettings = { ...newSchedule.toObject(), uuid: undefined };
      //       return updatedSettings
      //     } catch (error) {
      //       console.error("Error while fetching data:", error);
      //       return null
      //     }  
      //   }
    
      //   const updatedSettings = await setSchedule(fid, '$IMPACT', encryptedUuid, [])
      //   console.log('setting 111', updatedSettings)

      //   let curators = await getCurators(updatedSettings)

      //   if (updatedSettings) {
      //     res.status(200).json({ updatedSettings, curators });
      //     return
      //   } else {
      //     res.status(404).json({ message: 'No auto-fund created' });
      //     return
      //   }
      // }

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