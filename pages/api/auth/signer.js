import { NeynarAPIClient } from '@neynar/nodejs-sdk';

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Create new signer
    const { message, signature } = req.body;
    try {
      const data = await client.createSigner({ message, signature });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create signer' });
    }
  } else if (req.method === 'GET') {
    // Check signer status
    const { signerUuid } = req.query;
    if (!signerUuid) {
      return res.status(400).json({ error: 'signerUuid is required' });
    }
    try {
      const data = await client.lookupSigner({ signerUuid });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch signer status' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 