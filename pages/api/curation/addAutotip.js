import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import ScheduleTip from '../../../models/ScheduleTip';

export default async function handler(req, res) {
  const { fid, points, curators } = req.body;
  // console.log(fid, castHash, qualityAmount)
  
  if (req.method !== 'POST' || !fid || !curators || !points) {
    res.status(500).json({ error: 'Method not allowed' });
  } else {
    try {

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
  
      const {encryptedUuid, ecoName} = await getUuid(fid, points)

      if (!encryptedUuid) {
        res.status(500).json({ error: 'Method not allowed' });
      } else if (curators) {

        async function setSchedule(fid, points, ecoName, encryptedUuid, curators) {
  
          const formatCurators = (curators) => {
            if (!Array.isArray(curators)) {
              curators = [curators];
            }
            return curators.map(curator => {
              const parsedCurator = parseInt(curator, 10);
              return isNaN(parsedCurator) ? null : parsedCurator;
            }).filter(curator => curator !== null);
          };
  
          const formattedCurators = formatCurators(curators);
  
          let schedule = null
          try {
            await connectToDatabase();
            schedule = await ScheduleTip.findOne({ fid }).exec();
  
            if (schedule) {
  
              let curatorsMatch = false;
              if (schedule?.search_curators && schedule.search_curators.length > 0) {
                const curatorArray = Array.isArray(curators) ? curators : [curators];
                curatorsMatch = curatorArray.some(curator => 
                  schedule.search_curators.some(searchCurator => 
                    String(searchCurator) === String(curator)
                  )
                );
              }
              schedule.search_shuffle = true
              schedule.search_time = 'all'
              schedule.search_tags = []
              schedule.search_channels = []
              schedule.search_curators = [...schedule.search_curators, ...formattedCurators]
              schedule.points = points
              schedule.percent_tip = 100
              schedule.ecosystem_name = ecoName
              schedule.schedule_time = "45 18 * * *"
              schedule.active_cron = true
            } else {
              schedule = new ScheduleTip({ 
                fid: fid,
                uuid: encryptedUuid,
                search_shuffle: true,
                search_time: 'all',
                search_tags: [],
                search_channels: [],
                search_curators: [...formattedCurators],
                points: points,
                percent_tip: 100,
                ecosystem_name: ecoName,
                schedule_time: "45 18 * * *",
                schedule_count: 1,
                schedule_total: 1,
                active_cron: true
              });
            }
            await schedule.save()
            return schedule
          } catch (error) {
            console.error("Error while fetching data:", error);
            return null
          }  
        }
    
        const schedule = await setSchedule(fid, points, ecoName, encryptedUuid, curators)
        console.log('schedule 111', schedule)
        if (schedule) {
          res.status(200).json({ schedule });
        } else {
          res.status(404).json({ message: 'No auto-tip created' });
        }
      }
    } catch(error) {
      console.error('Error handling POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}