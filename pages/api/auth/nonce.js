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
  try {
    const response = await client.fetchNonce();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nonce' });
  }
} 