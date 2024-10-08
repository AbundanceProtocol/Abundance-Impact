import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import { encryptPassword, generateRandomString } from '../../../utils/utils';
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const { fid, uuid, shuffle, time, tags, channels, curators, percent, schedTime, currencies, points, ecosystem } = req.body;
  console.log(fid, shuffle, time, tags, channels, curators, percent, schedTime, currencies)
  if (req.method !== 'POST' || !fid || !uuid || !percent || !points || !ecosystem) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    const encryptedUuid = encryptPassword(uuid, secretKey);
    const code = generateRandomString(12)

    try {
      await connectToDatabase();
      let schedule = await ScheduleTip.findOne({ fid }).exec();
      if (schedule) {
        schedule.code = code
        schedule.search_shuffle = shuffle
        schedule.search_time = time
        schedule.search_tags = tags
        schedule.search_channels = channels
        schedule.search_curators = curators
        schedule.points = points
        schedule.percent_tip = percent
        schedule.ecosystem_name = ecosystem
        schedule.currencies = currencies
        schedule.schedule_time = schedTime
      } else {
        schedule = new ScheduleTip({ 
          fid: fid,
          uuid: encryptedUuid,
          code: code,
          search_shuffle: shuffle,
          search_time: time,
          search_tags: tags,
          search_channels: channels,
          search_curators: curators,
          points: points,
          percent_tip: percent,
          ecosystem_name: ecosystem,
          currencies: currencies,
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

      const cronTimezoneUrl = `https://www.easycron.com/rest/timezone?${qs.stringify({
        token: easyCronKey,
      })}`;
      const cronTimezoneResponse = await fetch(cronTimezoneUrl)
      console.log(cronTimezoneResponse)
      let timezone = null
      if (cronTimezoneResponse) {
        const cronTimezone = await cronTimezoneResponse.json()
        console.log(cronTimezone)
        if (cronTimezoneResponse.status == 'success') {
          timezone = cronTimezone.timezone
        }
      }

      const cronUrl = `https://www.easycron.com/rest/${cronId ? 'edit' : 'add'}?${qs.stringify({
        token: easyCronKey,
        url: `${baseURL}/api/curation/getScheduledJob?${qs.stringify({ fid, code })}`,
        id: cronId,
        cron_expression: schedTime,
        timezone_from: 2,
        timezone: timezone || 'America/New_York',
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
  }
} 