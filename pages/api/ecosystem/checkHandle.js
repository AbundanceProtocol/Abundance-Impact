import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";

export default async function handler(req, res) {
  const { handle } = req.query;

  if (req.method !== 'GET' || !handle) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function checkHandle(handle) {
      try {
        await connectToDatabase();
        const ecoHandle = await EcosystemRules.findOne({ecosystem_handle: { $regex: new RegExp(`^${handle}$`, 'i') }}).select('ecosystem_handle').exec()
        if (ecoHandle) {
          console.log(ecoHandle)
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return true
      }
    }


    try {
      const ecoHandle = await checkHandle(handle)

      res.status(200).json({ ecoHandle });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}