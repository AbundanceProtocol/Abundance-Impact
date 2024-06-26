import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";

export default async function handler(req, res) {
  const { handle, fid } = req.query;

  if (req.method !== 'GET' || !handle || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function getEcosystems(handle) {
      try {
        await connectToDatabase();
        const ecosystems = await EcosystemRules.findOne({ecosystem_handle:  { $regex: new RegExp(`^${handle}$`, 'i') }}).exec()
        if (ecosystems) {
          console.log(ecosystems)
          return ecosystems
        } else {
          return null
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return null
      }
    }

    const ecosystems = await getEcosystems(handle)    

    res.status(200).json({ ecosystems });
  }
}