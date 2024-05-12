import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import { encryptPassword } from '../../../utils/utils';
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const frontUrl = baseURL.replace("localhost", "locolhost");
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const { fid, uuid, shuffle, time, tags, channels, curators, percent, schedTime } = req.body;
  
  if (req.method === 'POST' && fid && uuid && shuffle && percent) {
    const encryptedUuid = encryptPassword(uuid, secretKey);

    try {
      await connectToDatabase();

      let schedule = await ScheduleTip.findOne({ fid }).exec();
      if (schedule) {
        schedule.search_shuffle = shuffle
        schedule.search_time = time
        schedule.search_tags = tags
        schedule.search_channels = channels
        schedule.search_curators = curators
        schedule.percent_tip = percent
        schedule.schedule_time = schedTime
      } else {
        schedule = new ScheduleTip({ 
          fid: fid,
          uuid: encryptedUuid,
          search_shuffle: shuffle,
          search_time: time,
          search_tags: tags,
          search_channels: channels,
          search_curators: curators,
          percent_tip: percent,
          schedule_time: schedTime,
          schedule_count: 1,
          schedule_total: 1,
        });
      }
      let cronId = null
      if (schedule.cron_job_id) {
        console.log(schedule.cron_job_id)
        cronId = schedule.cron_job_id
      }
      const cronUrl = `https://www.easycron.com/rest/${cronId ? 'edit' : 'add'}?${qs.stringify({
        token: easyCronKey,
        url: `${frontUrl}/api/curation/getScheduledJob?${qs.stringify({ fid, encryptedUuid })}`,
        id: cronId,
        cron_expression: schedTime,
        cron_job_name: `${fid}ScheduledTips`,
      })}`;

      const cronResponse = await fetch(cronUrl)
      console.log(cronResponse)
      if (cronResponse) {
        const getCron = await cronResponse.json()
        console.log(getCron)
        schedule.cron_job_id = getCron.cron_job_id
      }
      schedule.active_cron = true
      await schedule.save()

      res.status(200).send({ message: `Tip scheduled successfully` });
    } catch (error) {
      console.error("Error while fetching casts:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }   
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 