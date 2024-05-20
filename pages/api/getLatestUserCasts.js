export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { fid, userFid } = req.query;
  console.log('4:', fid)
  if (req.method !== 'GET' || !fid || !userFid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    try {
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/feed?feed_type=filter&filter_type=fids&fid=${fid}&fids=${fid}&with_recasts=false&limit=10`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const castData = await response.json();
      console.log(castData)
      // let hash = null
      if (castData) {
        res.status(200).json({ feed: castData.casts });
      } else {
        res.status(404).json({ message: 'No casts found for user' });
      }
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}