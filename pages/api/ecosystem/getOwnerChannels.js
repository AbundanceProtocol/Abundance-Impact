export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { name, fid } = req.query;

  if (req.method !== 'GET' || !name || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    try {
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/channel/search?q=${name}`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const channels = await response.json();

      let filteredChannels = []

      if (channels && channels.channels && channels.channels.length > 0) {
        const channelData = channels.channels
        filteredChannels = channelData.filter(channel => 
          channel.lead && channel.lead.fid == fid)
      }

      console.log(filteredChannels)

      res.status(200).json({ channels: filteredChannels });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}