export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY

  const { fid, castString } = req.query;
  // console.log('4:', fid, castString)

  if (req.method === 'GET' && fid && castString) {
    try {


      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/casts?casts=${castString}&viewer_fid=${fid}`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const castData = await response.json();
      let casts = []
      if (castData && castData.result && castData.result.casts.length > 0) {
        casts = castData.result.casts
      }
      

      res.status(200).json({ casts });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

