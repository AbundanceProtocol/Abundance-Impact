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
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export  async function POST(req, res) {
  return Response.json({
    type: 'form',
    title: `Create a Frame`,
    url: `https://impact.abundance.id/~/personal/frame`
});
}


export async function GET(request) {
  return Response.json({
      'type': 'composer',
      'name': 'Test',
      'icon': 'plus', 
      'description': 'Test Action',
      'imageUrl': `${baseURL}/images/personal.png`,
      'action': {
          'type': 'post',
      },
  });
}