export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { fid, recasts } = req.query;
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    let castBool = false
    if (!recasts) {
      castBool = false
    } else {
      castBool = recasts
    }
    try {
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/feed/following?fid=${fid}&with_recasts=${castBool}&limit=5`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const feed = await response.json();

      res.status(200).json({ feed: feed.casts });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}