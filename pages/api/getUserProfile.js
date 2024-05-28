export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { fid } = req.query;

  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    try {
      // console.log(fid)
      // console.log(typeof fid)
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/user/bulk?fids=${fid}`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const userProfile = await response.json();
      // console.log(userProfile.users)
      res.status(200).json({ userProfile: userProfile.users });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}