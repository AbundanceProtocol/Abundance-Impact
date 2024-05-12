import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import { decryptPassword } from '../../../utils/utils';
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const fid = req.query.fid
  if (req.method === 'GET' && fid) {

    async function getSchedule(fid) {
      try {
        await connectToDatabase();

        let schedule = await ScheduleTip.findOne({ fid }).exec();
        if (schedule) {
          const decryptedUuid = decryptPassword(schedule.uuid, secretKey);
          return {
            shuffle: schedule.search_shuffle,
            time: schedule.search_time,
            tags: schedule.search_tags,
            channels: schedule.search_channels,
            curators: schedule.search_curators,
            percent: schedule.percent_tip,
            schedTime: schedule.schedule_time,
            uuid: decryptedUuid
          }
        } else {
          return null
        }
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    }

    const { shuffle, time, tags, channels, curators, percent, schedTime, uuid } = await getSchedule(fid)

    res.status(200).json({ shuffle, time, tags, channels, curators, percent, schedTime, uuid });
  } else {

    res.status(405).json({ error: 'Method not allowed' });
  }
}