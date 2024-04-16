import Tip from '../../../models/Tip';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  const { signer, fid, data } = req.body;

  if (!signer || !fid || !data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  async function sendRequests(data, signer, apiKey) {
    const base = "https://api.neynar.com/";
    const url = `${base}v2/farcaster/cast`;

    for (const cast of data) {
      const castText = cast.text;
      const parentUrl = cast.cast;
      let body = {
        signer_uuid: signer,
        text: castText,
      };

      if (parentUrl) {
        body.parent = parentUrl;
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_key': apiKey,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error(`Failed to send request for ${castText}`);
        } else {
          console.log(`Request sent successfully for ${castText}`);
        }

        await Tip.create({
          receiver_fid: cast.fid,
          tipper_fid: fid,
          cast_hash: cast.cast,
          tip: [{
            currency: cast.coin,
            amount: cast.tip
          }],
        });

      } catch (error) {
        console.error(`Error occurred while sending request for ${castText}:`, error);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }



  try {
    await sendRequests(data, signer, apiKey);
    res.status(200).json({ message: 'Requests sent successfully' });
  } catch (error) {
    console.error('Error sending requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
