import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getCasts() {
      try {
        await connectToDatabase();
        const casts = await Cast.find().sort({ impact_total: -1 }).exec();
        console.log('Casts:', casts);
        return casts;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    }

    try {
      const topCasts = await getCasts()
      if (topCasts) {
        res.status(200).json({ casts: topCasts });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}