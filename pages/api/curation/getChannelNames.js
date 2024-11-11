import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { points } = req.query
  if (req.method !== 'GET' || !points) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {


    async function getUniqueChannelIds(points) {
      try {
        await connectToDatabase();
        const uniqueChannelIds = await Cast.distinct('channel_id', { points: points });
        uniqueChannelIds.sort((a, b) => a.localeCompare(b));
        return uniqueChannelIds;
      } catch (error) {
        console.error('Error in getUniqueChannelIds:', error);
        return [];
      }
    }



    try {
      const channels = await getUniqueChannelIds(points)
      // console.log(curators)
      res.status(200).json({ channels });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
