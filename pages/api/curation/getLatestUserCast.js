export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { fid } = req.query;
  console.log('4:', fid)
  if (req.method === 'GET' && fid) {
    try {
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/feed?feed_type=filter&filter_type=fids&fid=${fid}&fids=${fid}&with_recasts=false&limit=1`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const cast = await response.json();
      let hash = null
      if (cast && cast.casts && cast.casts.length > 0) {
        hash = cast.casts[0].hash;
        console.log(hash);
        res.status(200).json({ hash });
      } else {
        res.status(404).json({ message: 'No casts found for user', hash });
      }
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}