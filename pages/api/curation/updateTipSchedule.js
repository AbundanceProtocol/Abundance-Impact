import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;

export default async function handler(req, res) {
  const { cronId } = req.query;
  if (!(req.method === 'GET') || !cronId ) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    console.log(cronId)


    async function getJobStatus(cronId) {
      try {
        const cronJob = `https://www.easycron.com/rest/detail?${qs.stringify({
          token: easyCronKey,
          id: cronId,
        })}`;
  
        const jobResponse = await fetch(cronJob)
  
        if (jobResponse) {
          const cronData = await jobResponse.json()
          console.log('23', cronData.cron_job.status)
          if (cronData.status == 'success') {
            return cronData.cron_job.status
          }
        }
        return null
      } catch (error) {
        console.error('Error:', error);
        return null
      }
    }
  
    
    const cronStatus = await getJobStatus(cronId);
    console.log('38', cronStatus)
    
    if (cronStatus !== 1 && cronStatus !== 0) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {

      async function updateCron(cronId, cronStatus) {
        try {
          const updatedCron = `https://www.easycron.com/rest/${(cronStatus == 1) ? 'disable' : 'enable'}?${qs.stringify({
            token: easyCronKey,
            id: cronId,
          })}`;
    
          const cronResponse = await fetch(updatedCron)
    
          if (cronResponse) {
            const cronData = await cronResponse.json()
            console.log('23', cronData)
            if (cronData.status == 'success') {
              console.log('25', cronData)
  
              return true
            }
          }
          return false
        } catch (error) {
          console.error('Error:', error);
          return false
        }
      }
    
      const updatedCron = await updateCron(cronId, cronStatus);
      console.log('38', updatedCron)
  
      if (!updatedCron) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log('40')
        async function updateObject(cronId, cronStatus) {
          try {
            console.log('46', cronId)
  
            await connectToDatabase();
      
            // Find and delete the document
            const getObject = await ScheduleTip.findOne({ cron_job_id: cronId }).exec();
            console.log('46', getObject)
  
            if (getObject) {
              if (cronStatus == 1) {
                getObject.active_cron = false
              } else if (cronStatus == 0) {
                getObject.active_cron = true
              }
              getObject.save()
              console.log('Document deleted');
              return true
            } else {
              console.log('Document not found');
              return false
            }
          } catch (error) {
            console.error('Error:', error);
            return false
          }
        }
        
        const updatedObject = await updateObject(cronId, cronStatus);
        if (!updatedObject) {
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).send({ message: `Tip schedule updated successfully`, update: cronStatus });
        }
      }   
    }
  }
}
  

