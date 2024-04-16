import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;


export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('api/frames/page 15:', req.query.id)
    console.log('api/frames/page 19:', req.body.untrustedData)
    try {
      let test = null
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
    
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

















