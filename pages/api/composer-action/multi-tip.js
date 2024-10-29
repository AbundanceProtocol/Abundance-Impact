import qs from "querystring";
import { init, validateFramesMessage } from "@airstack/frames";
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const userSecret = process.env.USER_SECRET

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)
  
  if (req.method === 'POST') {
    const curatorFid = message?.data?.fid
    
    res.status(200).json({ 
      type: 'form',
      title: 'Curator page',
      url: `${baseURL}/~/studio/multi-tip-compose?${qs.stringify({ fid: curatorFid })}`,
    });
    return
   
  } else if (req.method === 'GET') {
    res.status(200).json({
      "type": "composer",
      "name": "Curator page",
      "icon": "person",
      "description": "Curator",
      "aboutUrl": `${baseURL}/~/studio/multi-tip-compose?${qs.stringify({ fid: 3 })}`,
      "imageUrl": `${baseURL}/images/input.jpg`,
      "action": {
        "type": "post",
      }
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}