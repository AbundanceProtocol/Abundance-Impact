import connectToDatabase from '../../../libs/mongodb';
import Circle from '../../../models/Circle';
import { getCurrentDateUTC } from '../../../utils/utils'; 
// const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { fid, time, curator, channel, showcase } = req.body;
  console.log('createCircle', fid, time, curator, channel, showcase);
  
  if (req.method !== 'POST') {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {

    async function createCircle(
      fid,
      time,
      curator,
      channel,
      showcase
    ) {

      // console.log(curator, curator?.fid);
      if (channel == ' ') {
        channel = null
      }
      try {
        await connectToDatabase();

        let circle = new Circle({
          fid,
          time,
          curators: [curator?.fid || null],
          channels: [channel],
          ecosystem: 'IMPACT',
          points: '$IMPACT',
          circles: [],
          curator,
          showcase,
          type: "curation",
        });
        await circle.save();
        const objectIdString = circle._id.toString();
        return objectIdString;
      } catch (error) {
        console.error("Error while fetching circles:", error);
        return null;
      }
    }

    try {
      const circleId = await createCircle(fid, time, curator, channel, showcase);
      console.log(circleId);
  
      res.status(200).json({ circleId });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
    
    