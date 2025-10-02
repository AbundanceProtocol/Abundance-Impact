import connectToDatabase from "../../libs/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY);
  const { channel } = req.query;

  if (req.method !== 'GET' || (!channel)) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    try {

      const fetchData = async (channel) => {
        try {
          const response = await fetch(`https://api.farcaster.xyz/v1/channel?channelId=${channel}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching data:', error);
          return null;
        }
      };
    
      const getChannel = await fetchData(channel)
      const channelData = getChannel?.result?.channel || null

      res.status(200).json({ data: channelData });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}