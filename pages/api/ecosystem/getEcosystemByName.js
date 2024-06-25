import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";

export default async function handler(req, res) {
  const { name, fid } = req.query;

  if (req.method !== 'GET' || !name || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function getEcosystems(name) {
      try {
        await connectToDatabase();
        const ecosystems = await EcosystemRules.findOne({ecosystem_name: name}).exec()
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

    const ecosystems = await getEcosystems(name)    

    res.status(200).json({ ecosystems });
  }
}