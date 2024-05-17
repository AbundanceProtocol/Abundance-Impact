import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;

export default async function handler(req, res) {
  const { cronId } = req.query;
  if ((req.method === 'DELETE') || !cronId ) {
    res.status(405).json({ error: 'Method not allowed' });
  }

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
        if (deletedCron.status !== 'success') {
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error:', error);
      return false
    }
  }

  const deleteCron = await findAndDeleteCron(cronId);

  if (!deleteCron) {
    res.status(500).json({ error: 'Internal Server Error' });
  }

  async function findAndDeleteObject(cronId) {
    try {
      await connectToDatabase();

      // Find and delete the document
      const deletedObject = await ScheduleTip.findOneAndDelete({ cron_job_id: cronId });

      if (deletedObject) {
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
  
  const deleteObject = await findAndDeleteObject(cronId);
  if (!deleteObject) {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(200).send({ message: `Tip schedule deleted successfully` });
  }
}   
