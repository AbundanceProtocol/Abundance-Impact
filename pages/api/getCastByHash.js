export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  if (req.method === 'GET') {
    try {
      const { hash } = req.query;
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/cast?identifier=${hash}&type=hash`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const cast = await response.json();
      // console.log(cast)
      res.status(200).json({ cast: cast });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}