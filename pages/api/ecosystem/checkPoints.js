import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";

export default async function handler(req, res) {
  const { points } = req.query;

  if (req.method !== 'GET' || !points) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function checkPoints(points) {
      try {
        await connectToDatabase();
        const ecoPoints = await EcosystemRules.findOne({ecosystem_points_name: points}).select('ecosystem_points_name').exec()
        if (ecoPoints) {
          console.log(ecoPoints)
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
      const ecoPoints = await checkPoints(points)

      res.status(200).json({ ecoPoints });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}