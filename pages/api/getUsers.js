export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  if (req.method === 'GET') {
    try {
      const { fid, name } = req.query;
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/user/search?q=${name}&viewer_fid=${fid}`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const users = await response.json();

      //  need api to check if profile is following users  //

      res.status(200).json({ users: users.result.users });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}