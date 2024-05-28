import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
// import { decryptPassword } from '../../../utils/utils';
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const fid = req.query.fid
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getSchedule(fid) {
      try {
        await connectToDatabase();

        let schedule = await ScheduleTip.findOne({ fid }).exec();
        if (schedule) {
          return {
            shuffle: schedule.search_shuffle,
            time: schedule.search_time,
            tags: schedule.search_tags,
            channels: schedule.search_channels,
            curators: schedule.search_curators,
            percent: schedule.percent_tip,
            schedTime: schedule.schedule_time,
            cron_job_id: schedule.cron_job_id,
            active_cron: schedule.active_cron
          }
        } else {
          return {
            shuffle: null,
            time: null,
            tags: null,
            channels: null,
            curators: null,
            percent: null,
            schedTime: null,
            cron_job_id: null,
            active_cron: null,
          }
        }
      } catch (error) {
        console.error('Error:', error);
        return {
          shuffle: null,
          time: null,
          tags: null,
          channels: null,
          curators: null,
          percent: null,
          schedTime: null,
          cron_job_id: null,
          active_cron: null,
        }
      }
    }

    try {
      const { shuffle, time, tags, channels, curators, percent, schedTime, cron_job_id, active_cron } = await getSchedule(fid)
  
      res.status(200).json({ shuffle, time, tags, channels, curators, percent, schedTime, cron_job_id, active_cron });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}