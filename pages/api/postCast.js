export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { signer, urls, channel, parentUrl, castText } = req.body;
 
  if (req.method !== 'POST' || !signer || !castText) {
    res.status(400).json({ error: 'Bad Request. Missing parameters' });
  } else {
    try {
      console.log( signer, urls, channel, parentUrl, castText )
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

      if (!body.embeds) {
        body.embeds = [];
      }
      
      if (urls) {
        urls.forEach(url => {
          body.embeds.push({ url });
        });
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

      res.status(200).json({ success: true, message: `Cast created successfully`, hash: cast.hash});
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}