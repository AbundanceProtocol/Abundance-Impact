import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
// import qs from "querystring";

import connectToDatabase from "../../../libs/mongodb";
// import User from '../../../models/User';
// import Impact from '../../../models/Impact';
// import Quality from '../../../models/Quality';
// import Cast from "../../../models/Cast";
// import OptOut from "../../../models/OptOut";
// import EcosystemRules from "../../../models/EcosystemRules";
// import { init, validateFramesMessage } from "@airstack/frames";

// import Allowlist from '../../../models/Allowlist';

// import { decryptPassword } from "../../../utils/utils"; 

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
// const apiKey = process.env.NEYNAR_API_KEY
// const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
// const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY ?? '')
  // const body = await req.body;
  // const {isValid, message} = await validateFramesMessage(body)
  
  if (req.method === 'POST') {
    
    // const curatorFid = message?.data?.fid

    try {
      await connectToDatabase();

      res.setHeader('Content-Type', 'application/json');

      res.status(200).json({
        "type": "frame",
        "frameUrl": `https://impact.abundance.id/api/frames/admin/status`
      })
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