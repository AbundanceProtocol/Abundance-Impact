export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
 
  if (req.method === 'POST') {
    try {
      const { fid, signer, urls, channel, parentUrl, castText } = req.body;
      // console.log( fid, signer, urls, channel, parentUrl, castText )

      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/cast`;

      let body = {
        signer_uuid: signer,
        text: castText,
      };

      if (parentUrl) {
        body.replyTo = parentUrl;
      }
      if (channel) {
        body.channel_id = channel;
      }
      if (urls) {
        for (let url in urls) 
        body.embeds.push({url})
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': apiKey,
        },
        body: JSON.stringify(body),
      });

      const cast = await response.json();
      console.log(cast)

      res.status(200).json({ success: true, message: `Cast created successfully`, hash: response.cast.hash});
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}