// import connectToDatabase from "../../../libs/mongodb";
// import User from "../../../models/User";
import qs from "querystring";
import { init, validateFramesMessage } from "@airstack/frames";
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)

  const { fid, points } = req.query;

  if (req.method === 'POST') {
    const { untrustedData } = req.body;
    console.log(untrustedData, fid);

    // const curatorFid = message?.data?.fid


    // async function getUser(curatorFid, points) {
    //   try {
    //     await connectToDatabase();
    //     let user = await User.findOne({ fid: curatorFid, ecosystem_points: points }).select('username').exec();
    //     if (user) {
    //       return user.username
    //     }
    //     return null
    //   } catch (error) {
    //     console.error("Error getting data:", error);
    //     return null
    //   }
    // }

    // const user = await getUser(curatorFid, points || null)
    
    let curator = 3
    if (fid) {
      curator = fid
    }

    res.status(200).json({ 
      type: 'form',
      title: 'Curator page',
      url: `https://impact.abundance.id/~/curator/${curator}?${qs.stringify({ points, app: 'mini' })}`,
    });
    return
   
  } else if (req.method === 'GET') {
    res.status(200).json({
      "type": "composer",
      "name": "Curator page",
      "icon": "person",
      "description": "Curator",
      "aboutUrl": `https://impact.abundance.id/~/curator/${fid}?${qs.stringify({ points, app: 'mini' })}`,
      "imageUrl": `${baseURL}/images/input.jpg`,
      "action": {
        "type": "post",
      }
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}