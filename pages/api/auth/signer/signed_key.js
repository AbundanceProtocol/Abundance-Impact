import { NeynarAPIClient } from '@neynar/nodejs-sdk';

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { signedKeyRequest } = req.body;
  try {
    const data = await client.registerSignedKey(signedKeyRequest);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register signed key' });
  }
} 