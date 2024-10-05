import { decryptPassword } from "../../utils/utils";
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {

  const { hash } = req.body;
 
  if (req.method !== 'POST' || !hash) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    const signer = decryptPassword(encryptedBotUuid, secretKey)
    try {
      console.log(hash)

      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/reaction`;
      const response = await fetch(url, {
        method: 'POST',
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

      res.status(200).json({ success: true, message: `Liked successfully`});
    } catch (error) {
      console.error('Error handling POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}