export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
 
  if (req.method === 'POST') {
    try {
      const { fid, signer, urls, channel, parentUrl, castText } = req.body;
      console.log( fid, signer, urls, channel, parentUrl, castText )
      // console.log(typeof fid)

      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/cast`;
      const requestBody = {
        embeds: [],
        headers: {
          accept: "application/json",
          api_key: apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          signer_uuid: signer,
          text: castText
        })
      };
      if (parentUrl) {
        requestBody.parent = parentUrl;
      }
      if (channel) {
        requestBody.channel_id = channel;
      }
      if (urls) {
        for (let url in urls) 
        requestBody.embeds.push({url})
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: requestBody.headers,
        body: JSON.stringify(requestBody)
      });

      const cast = await response.json();
      console.log(cast)

      res.status(200).json({ success: true, message: `Cast created successfully`});
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}