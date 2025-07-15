import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
  baseOptions: {
    headers: {
      'x-neynar-experimental': true,
    },
  },
});

const client = new NeynarAPIClient(config);

export default async function handler(req, res) {
  const { message, signature } = req.query;
  if (!message || !signature) {
    return res.status(400).json({ error: 'Message and signature are required' });
  }
  try {
    const data = await client.fetchSigners({ message, signature });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signers' });
  }
} 