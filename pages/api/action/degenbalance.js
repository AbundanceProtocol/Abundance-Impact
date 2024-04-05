import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;


export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('api/frames/page 15:', req.query.id)
    console.log('api/frames/page 19:', req.body.untrustedData)
    let fid = 3

    try {
      const responseTotal = await axios.get('/api/degen/getUserAllowance', {
        params: {
          fid: fid,
        }
      })

      if (responseTotal?.data) {
        console.log(responseTotal.data.total)
        totalAllowance = await responseTotal.data.total
      }

      const responseUsed = await axios.get('/api/degen/getUsedTips', {
        params: {
          fid: fid,
        }
      })

      if (responseUsed?.data) {
        console.log(responseUsed.data.tips)
        usedAllowance = await responseUsed.data.tips
      }

      let remaningAllowance = Number(totalAllowance) - Number(usedAllowance)
      console.log(remaningAllowance)
      res.status(200).send({message: 'Balance:', remaningAllowance});

    } catch (error) {
        console.error(error);
        res.status(500).send('Balance error');
    }
    
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

