export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
 
  if (req.method === 'POST') {
    try {
      const { fid, signer } = req.body;
      console.log(fid, signer)
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/user/follow`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: "application/json",
          api_key: apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({signer_uuid: signer, target_fids: [fid]})
      });
      const following = await response.json();
      console.log(following)

      res.status(200).json({ success: true, message: `User ${fid} successfully followed` });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}