export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { hash, signer } = req.body;
 
  if (req.method !== 'DELETE' || !hash || !signer) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    try {
      console.log(hash, signer)

      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/reaction`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          accept: "application/json",
          api_key: apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          'signer_uuid': signer,
          target: hash,
          reaction_type: 'like'
        })})
        
      const cast = await response.json();
      console.log(cast)

      res.status(200).json({ success: true, message: `Removed Liked successfully`});
    } catch (error) {
      console.error('Error handling DELETE request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}