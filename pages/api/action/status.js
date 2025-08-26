import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
// import qs from "querystring";

// import connectToDatabase from "../../../libs/mongodb";
// import User from '../../../models/User';
// import Impact from '../../../models/Impact';
// import Quality from '../../../models/Quality';
// import Cast from "../../../models/Cast";
// import OptOut from "../../../models/OptOut";
// import EcosystemRules from "../../../models/EcosystemRules";

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
  
  try {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send({
      message: `Please install Impact 2.0 Miniapp`
    });
  } catch (error) {
    console.error(error);
    res.setHeader('Allow', ['POST']);
    res.status(200).send(`Please install Impact 2.0 Miniapp`);
  }
}