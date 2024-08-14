import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
// import connectToDatabase from "../../../libs/mongodb";
// import User from '../../../models/User';
// import Impact from '../../../models/Impact';
// import Quality from '../../../models/Quality';
// import Cast from "../../../models/Cast";
// import EcosystemRules from "../../../models/EcosystemRules";
// import Allowlist from '../../../models/Allowlist';

// import { decryptPassword } from "../../../utils/utils"; 

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY
// const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
// const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  if (req.method === 'POST') {



    console.log('test')



    try {
      console.log('test2')

      // res.setHeader('Content-Type', 'text/html');
      const frameData = {
        "type": "frame",
        "frameUrl": "https://impact.abundance.id/~/personal/frame"
      }
      return res.json(frameData)
    } catch (error) {
      console.error(error);
      console.log('test3')
      res.setHeader('Allow', ['POST']);
      res.status(200).send(`Request failed`);
    }



  } else {
    console.log('test4')
    res.setHeader('Allow', ['POST']);
    res.status(401).send(`Request failed`);
  }
}