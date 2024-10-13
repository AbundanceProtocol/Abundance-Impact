import connectToDatabase from "../../../libs/mongodb";
import User from "../../../models/User";
import qs from "querystring";
import { init, validateFramesMessage } from "@airstack/frames";
import { encryptPassword } from "../../../utils/utils";
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const userSecret = process.env.USER_SECRET

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)

  const { fid, points } = req.query;

  if (req.method === 'POST') {

    const curatorFid = message?.data?.fid
    console.log('curatorFid', curatorFid)

    async function getUser(curatorFid, points) {
      try {
        await connectToDatabase();
        let user = await User.findOne({ fid: curatorFid, ecosystem_points: points }).select('username').exec();
        if (user) {
          return user.username
        }
        return null
      } catch (error) {
        console.error("Error getting data:", error);
        return null
      }
    }

    const user = await getUser(curatorFid, points || null)
    
    let curator = 3
    if (fid) {
      curator = fid
    }
    console.log('cur0-1', curatorFid, fid, points, user )

    if (user) {
      const today = new Date();
      const todayData = today.toISOString().split('T')[0];
      let phrase = String(todayData) + String(curatorFid)
      let pass = encryptPassword(phrase, userSecret)
      let encodedPass = encodeURIComponent(pass)
      
      res.status(200).json({ 
        type: 'form',
        title: 'Curator page',
        url: `${baseURL}/~/curator/${curator || 9326}?${qs.stringify({ points, app: 'mini', userFid: curatorFid, pass: encodedPass })}`,
      });
      return

    } else {
      console.log('cur2', curatorFid)

      res.status(200).json({ 
        type: 'form',
        title: 'Curator page',
        url: `${baseURL}/~/curator/${curator || 9326}?${qs.stringify({ points, app: 'mini', userFid: curatorFid, pass: null })}`,
      });
      return

    }
   
  } else if (req.method === 'GET') {
    res.status(200).json({
      "type": "composer",
      "name": "Curator page",
      "icon": "person",
      "description": "Curator",
      "aboutUrl": `https://impact.abundance.id/~/curator/${fid || 9326}?${qs.stringify({ points, app: 'mini' })}`,
      "imageUrl": `${baseURL}/images/input.jpg`,
      "action": {
        "type": "post",
      }
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}