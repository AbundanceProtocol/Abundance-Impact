import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;

export default async function handler(req, res) {
  const { cronId, fid } = req.query;
  if (req.method !== 'DELETE' || !cronId || !fid ) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function findAndDeleteObject(cronId, fid) {
      try {
        await connectToDatabase();

        // Find and delete the document
        const deletedObject = await ScheduleTip.findOneAndDelete({ cron_job_id: cronId, fid: fid });
        console.log('18', deletedObject);

        if (deletedObject) {
          console.log('Document deleted', deletedObject);
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
    
    try {
      const deleteObject = await findAndDeleteObject(cronId, fid);
  
      if (!deleteObject) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {

        async function findAndDeleteCron(cronId) {
          try {
            const deleteCron = `https://www.easycron.com/rest/delete?${qs.stringify({
              token: easyCronKey,
              id: cronId,
            })}`;
    
            const deletedResponse = await fetch(deleteCron)
    
            if (deletedResponse) {
              const deletedCron = await deletedResponse.json()
              console.log(deletedCron)
              if (deletedCron.status == 'success') {
                return true
              }
            }
            return false
          } catch (error) {
            console.error('Error:', error);
            return false
          }
        }

        try {
          const deleteCron = await findAndDeleteCron(cronId);
          console.log('65', deleteCron)
          if (!deleteCron) {
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.status(200).send({ message: `Tip schedule deleted successfully` });
          }

        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
