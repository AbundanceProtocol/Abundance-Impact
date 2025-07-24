import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import mongoose from 'mongoose';

const dataCode = process.env.DATA_CODE

export default async function handler(req, res) {
  const { fid } = req.query
  const points = '$IMPACT'
  // if (req.method !== 'GET' || code !== dataCode) {
  if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {
    try {

      //// CURATOR POINTS, CASTS, USERS

      async function getCuratorData(fid) {
        try {
          await connectToDatabase();

          const userData = await User.findOne({fid: fid.toString(), ecosystem_points: '$IMPACT'}).select('fid username pfp')

          const pointsStaked = await Impact.aggregate([
            { $match: { curator_fid: fid } },
            { $group: { _id: null, total: { $sum: "$impact_points" } } }
          ]).exec();

          const uniqueCasts = await Impact.aggregate([
            { $match: { curator_fid: fid } },
            { $group: { _id: "$target_cast_hash" } },
            { $count: "total" }
          ]);

          const uniqueCreators = await Impact.aggregate([
            { $match: { curator_fid: fid } },
            { $group: { _id: "$creator_fid" } },
            { $count: "total" }
          ]);

          
          
          return {pointsStaked: pointsStaked[0].total, uniqueCasts: uniqueCasts[0].total, uniqueCreators: uniqueCreators[0].total, userData}
        } catch (error) {
          console.error("Error while fetching casts:", error);
          return {pointsStaked: 0, uniqueCasts: 0, uniqueCreators: 0, userData: null}
        }
      }



      const {pointsStaked, uniqueCasts, uniqueCreators, userData} = await getCuratorData(Number(fid))


        // console.log('adjustedData', newData)
        res.status(200).json({ message: 'nominations', pointsStaked, uniqueCasts, uniqueCreators, userData });
      } catch (error) {
        console.error('Error handling GET request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

