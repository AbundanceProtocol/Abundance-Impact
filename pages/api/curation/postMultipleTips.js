import Tip from '../../../models/Tip';


export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { signer, fid, data, points } = req.body;
  if (req.method !== 'POST' || !signer || !fid || !data || !points || !Array.isArray(data)) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function sendRequests(data, signer, apiKey) {
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/cast`;
      let tipCounter = 0;
      for (const cast of data) {
        const castText = cast.text;
        const parentUrl = cast.castHash;
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
          let tips = []

          for (const coin of cast.allCoins) {
            let amount = 0
            if (coin.coin == '$TN100x' && coin.tip > 0) {
              amount = coin.tip * 10
            } else if (coin.tip > 0) {
              amount = coin.tip
            }
            if (coin.tip > 0) {
              let tip = {currency: coin.coin, amount: amount}
              tips.push(tip)
            }
          }
          
          await Tip.create({
            receiver_fid: cast.fid,
            tipper_fid: fid,
            points: points,
            cast_hash: cast.castHash,
            tip: tips,
          });
          // tipCounter += Number(cast.tip)

        } catch (error) {
          console.error(`Error occurred while sending request for ${castText}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }
      return tipCounter
    }

    try {
      const remainingTip = await sendRequests(data, signer, apiKey);
      res.status(200).json({ message: 'All casts tipped successfully', tip: remainingTip });
    } catch (error) {
      console.error('Error sending requests:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
