import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import User from '../../../models/User';
import { encryptPassword, generateRandomString } from '../../../utils/utils';
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const { fid, referrer } = req.body;
  if (req.method !== 'POST' || !fid || !referrer) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    // const encryptedUuid = encryptPassword(uuid, secretKey);
    // const code = generateRandomString(12)

    async function updateInvitedBy(fid, referrer) {
      try {
        await connectToDatabase();
        let updated = await User.findOneAndUpdate({ fid: fid.toString() }, { invited_by: Number(referrer) }, { new: true, select: '-uuid' });

        const objectIdString = updated._id.toString();
        return objectIdString;
      } catch (error) {
        console.error("Error while fetching data:", error);
        return null
      }  
    }






    try {
      
      let data = await updateInvitedBy(fid, referrer)

      res.status(200).send({ message: `Invite set successfully`, data });
    } catch (error) {
      console.error("Error while fetching casts:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }   
  }
} 