import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import ScheduleTip from '../../../models/ScheduleTip';

export default async function handler(req, res) {
  const { fid, schedule, data } = req.body;
  // console.log(fid, castHash, qualityAmount)
  
  if (req.method !== 'POST' || !fid || !schedule) {
    res.status(500).json({ error: 'Method not allowed' });
  } else {

    try {

      async function getSchedule(fid, points) {
        try {
          await connectToDatabase();
          let fundSchedule = await ScheduleTip.findOne({ fid }).exec();
          return fundSchedule || null
        } catch (error) {
          console.error("Error while fetching data:", error);
          return null
        }  
      }

      async function updateSchedule(fid, schedule) {
        try {
          await connectToDatabase();
          let updated = null
          if (schedule == 'off') {
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: false }, { new: true, select: '-uuid' });
          } else if (schedule == 'on') {
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true }, { new: true, select: '-uuid' });
          } else if (schedule == 'standard') {
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 100, development_fund: 0, growth_fund: 0, special_fund: 0 }, { new: true, select: '-uuid' });
          } else if (schedule == 'optimized') {
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 80, development_fund: 10, growth_fund: 10, special_fund: 0 }, { new: true, select: '-uuid' });
          } else if (schedule == 'accelerated') {
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 60, development_fund: 20, growth_fund: 20, special_fund: 0 }, { new: true, select: '-uuid' });
          } else if (schedule == 'special') {
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, creator_fund: 0, development_fund: 0, growth_fund: 0, special_fund: 100 }, { new: true, select: '-uuid' });
          } else if (schedule == 'add-channel') {
            let channel = data
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { search_channels: channel }, search_curators: [] }, { new: true, select: '-uuid' });
          } else if (schedule == 'remove-channel') {
            let channel = data
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { search_channels: channel }, search_curators: [] }, { new: true, select: '-uuid' });
          } else if (schedule == 'add-curator') {
            let curator = Number(data)
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { search_curators: curator }, search_channels: [] }, { new: true, select: '-uuid' });
          } else if (schedule == 'remove-curator') {
            let curator = Number(data)
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { search_curators: curator }, search_channels: [] }, { new: true, select: '-uuid' });
          } else if (schedule == 'degen-off') {
            // let curator = Number(data)
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { currencies: '$DEGEN' } }, { new: true, select: '-uuid' });
          } else if (schedule == 'degen-on') {
            // let curator = Number(data)
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { currencies: '$TIPN' } }, { new: true, select: '-uuid' });
          } else if (schedule == 'tipn-off') {
            // let curator = Number(data)
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $pull: { currencies: '$TIPN' } }, { new: true, select: '-uuid' });
          } else if (schedule == 'tipn-on') {
            // let curator = Number(data)
            updated = await ScheduleTip.findOneAndUpdate({ fid }, { active_cron: true, $addToSet: { currencies: '$TIPN' } }, { new: true, select: '-uuid' });
          } else {
            updated = null
          }
          console.log('updated', updated)
          return updated
        } catch (error) {
          console.error("Error while fetching data:", error);
          return null
        }  
      }

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


      console.log('data', fid, schedule)

      let fundSchedule = await getSchedule(fid, '$IMPACT')

      console.log('data2', fundSchedule)


      if (fundSchedule) {

        const updatedSchedule = await updateSchedule(fid, schedule)

        if (updatedSchedule) {

          let curators = await getCurators(updatedSchedule)

          res.status(200).json({ updatedSchedule, curators });
          return
        } else {
          res.status(404).json({ message: 'Could not update Auto-Fund' });
          return
        }
        
      } else {

        async function getUuid(fid, points) {
          try {
            await connectToDatabase();
            let userData = await User.findOne({ fid, ecosystem_points: points }).select('uuid ecosystem_name').exec();
            
            if (userData) {
              return {encryptedUuid: userData.uuid, ecoName: userData.ecosystem_name}
            } else {
              return {encryptedUuid: null, ecoName: null}
            }
          } catch (error) {
            console.error("Error while fetching data:", error);
            return {encryptedUuid: null, ecoName: null}
          }  
        }

      const {encryptedUuid, ecoName} = await getUuid(fid, '$IMPACT')

      // console.log('data3', encryptedUuid, ecoName)



      if (!encryptedUuid) {
        res.status(500).json({ error: 'Method not allowed' });
      } else {

        async function setSchedule(fid, points, ecoName, encryptedUuid, curators) {
  
          // const formatCurators = (curators) => {
          //   if (!Array.isArray(curators)) {
          //     curators = [curators];
          //   }
          //   return curators.map(curator => {
          //     const parsedCurator = parseInt(curator, 10);
          //     return isNaN(parsedCurator) ? null : parsedCurator;
          //   }).filter(curator => curator !== null);
          // };
  
          // const formattedCurators = formatCurators(curators);
  
          let active_cron = true
          let creator_fund = null
          let development_fund = null
          let growth_fund = null
          let special_fund = null

          if (schedule == 'off') {
            active_cron = false
          } else if (schedule == 'on') {
            active_cron = true
          } else if (schedule == 'standard') {
            active_cron = true
            creator_fund = 100
            development_fund = 0
            growth_fund = 0
            special_fund = 0
          } else if (schedule == 'optimized') {
            active_cron = true
            creator_fund = 80
            development_fund = 10
            growth_fund = 10
            special_fund = 0
          } else if (schedule == 'accelerated') {
            active_cron = true
            creator_fund = 60
            development_fund = 20
            growth_fund = 20
            special_fund = 0
          } else if (schedule == 'special') {
            active_cron = true
            creator_fund = 0
            development_fund = 0
            growth_fund = 0
            special_fund = 100
          }

          let newSchedule = null
          try {
            await connectToDatabase();
            // schedule = await ScheduleTip.findOne({ fid }).exec();
  
            // if (schedule) {
  
            //   let curatorsMatch = false;
            //   if (schedule?.search_curators && schedule.search_curators.length > 0) {
            //     const curatorArray = Array.isArray(curators) ? curators : [curators];
            //     curatorsMatch = curatorArray.some(curator => 
            //       schedule.search_curators.some(searchCurator => 
            //         String(searchCurator) === String(curator)
            //       )
            //     );
            //   }
            //   schedule.search_shuffle = true
            //   schedule.search_time = 'all'
            //   schedule.search_tags = []
            //   schedule.search_channels = []
            //   schedule.search_curators = [...schedule.search_curators, ...formattedCurators]
            //   schedule.points = points
            //   schedule.percent_tip = 100
            //   schedule.ecosystem_name = ecoName
            //   schedule.currencies = ['$DEGEN']
            //   schedule.schedule_time = "45 18 * * *"
            //   schedule.active_cron = true
            // } else {
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
              ecosystem_name: ecoName,
              currencies: ['$DEGEN', '$TIPN'],
              schedule_time: "45 18 * * *",
              schedule_count: 1,
              schedule_total: 1,
              active_cron,
              ...(creator_fund !== null ? { creator_fund } : {}),
              ...(development_fund !== null ? { development_fund } : {}),
              ...(growth_fund !== null ? { growth_fund } : {}),
              ...(special_fund !== null ? { special_fund } : {}),
            });
            
            await newSchedule.save()
            const updatedSchedule = { ...newSchedule.toObject(), uuid: undefined };
            return updatedSchedule
          } catch (error) {
            console.error("Error while fetching data:", error);
            return null
          }  
        }
    
        const updatedSchedule = await setSchedule(fid, '$IMPACT', ecoName, encryptedUuid, [])
        console.log('schedule 111', updatedSchedule)

        let curators = await getCurators(updatedSchedule)

        if (updatedSchedule) {
          res.status(200).json({ updatedSchedule, curators });
          return
        } else {
          res.status(404).json({ message: 'No auto-fund created' });
          return
        }
      }

        res.status(404).json({ message: 'Not processed' });
        return
      }

    } catch(error) {
      console.error('Error handling POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return
    }
  }
}