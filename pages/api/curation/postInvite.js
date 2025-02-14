import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import { encryptPassword, generateRandomString } from '../../../utils/utils';
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const { fid, referrer, uuid } = req.body;
  if (req.method !== 'POST' || !fid || !uuid || !referrer) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    const encryptedUuid = encryptPassword(uuid, secretKey);
    // const code = generateRandomString(12)

    try {
      await connectToDatabase();
      let schedule = await ScheduleTip.findOne({ fid: Number(fid) }).exec();
      if (!schedule) {
        schedule = new ScheduleTip({ 
          fid: fid,
          invited_by: referrer,
          uuid: encryptedUuid,
          search_shuffle: true,
          search_time: 'all',
          search_tags: [],
          search_channels: [],
          search_curators: [],
          points: points,
          percent_tip: 100,
          ecosystem_name: "Abundance",
          currencies: ['$DEGEN'],
          schedule_time: "45 18 * * *",
          schedule_count: 1,
          schedule_total: 1,
          active_cron: false,
          creator_fund: 100,
          development_fund: 0,
          growth_fund: 0,
          special_fund: 0,
        });
      }

      
      await schedule.save()

      res.status(200).send({ message: `Invite set successfully` });
    } catch (error) {
      console.error("Error while fetching casts:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }   
  }
} 