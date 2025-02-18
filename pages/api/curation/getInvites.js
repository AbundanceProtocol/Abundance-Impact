import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Fund from '../../../models/Fund';
import ScheduleTip from '../../../models/ScheduleTip';
import Score from '../../../models/Score';
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

          let userData = await User.find({invited_by: Number(fid), ecosystem_points: '$IMPACT'}).select('fid username pfp').exec()

          // userData.map(user => {
          //   user.fid = Number(user.fid);
          // });
          let userDataset = []
          for (let user of userData) {
            let schedule = await ScheduleTip.findOne({fid: Number(user.fid)}).select('active_cron').lean().then(schedule => schedule?.active_cron || false)

            let score = await Score.findOne({fid: Number(user.fid)}).select('impact_score_all').lean().then(schedule => schedule?.impact_score_all || 0)

            let totalStaked = await Impact.aggregate([
              { $match: { curator_fid: Number(user.fid) } },
              { $group: { _id: null, total: { $sum: "$impact_points" } } }
            ]).exec()

            let staked = 0
            if (totalStaked.length > 0) {
              staked = Math.floor(totalStaked[0].total) || 0
            }

            let feb = new Date('2025-02-01T00:00:00Z')

            let degenAmountSum = await Fund.aggregate([
              { $match: { fid: Number(user.fid), createdAt: { $gte: feb } } },
              { $group: { _id: null, total: { $sum: "$degen_amount" } } }
            ]).exec()
            console.log('degenAmountSum', degenAmountSum)
            // userData.degenAmountSum = degenAmountSum[0].total || 0;
            let fundTotal = 0
            if (degenAmountSum.length > 0) {
              fundTotal = Math.floor(degenAmountSum[0].total * 0.05) || 0
            }
            let userData = {
              fid: Number(user.fid),
              username: user.username,
              pfp: user.pfp,
              active: schedule || false,
              autoFund: fundTotal || 0,
              staked: staked,
              score: score
            }
            userDataset.push(userData)
          }

          console.log('userDataset', userDataset)
          // const scheduleTips = await ScheduleTip.find({ fid: userData.map(user => user.fid) }).select('fid active_cron').exec();
          // const userDataWithActive = userData.map(user => {
          //   const scheduleTip = scheduleTips.find(st => st.fid.toString() === user.fid);
          //   return {
          //     ...user,
          //     active: scheduleTip ? scheduleTip.active_cron : false
          //   };
          // });
          // console.log('scheduleTips', scheduleTips)

          // console.log('userDataWithActive', userDataWithActive)


          // const pointsStaked = await Impact.aggregate([
          //   { $match: { curator_fid: fid } },
          //   { $group: { _id: null, total: { $sum: "$impact_points" } } }
          // ]).exec();

          // const uniqueCasts = await Impact.aggregate([
          //   { $match: { curator_fid: fid } },
          //   { $group: { _id: "$target_cast_hash" } },
          //   { $count: "total" }
          // ]);

          // const uniqueCreators = await Impact.aggregate([
          //   { $match: { curator_fid: fid } },
          //   { $group: { _id: "$creator_fid" } },
          //   { $count: "total" }
          // ]);

          
          
          return userDataset
        } catch (error) {
          console.error("Error while fetching casts:", error);
          return []
        }
      }



      const data = await getCuratorData(Number(fid))


        // console.log('adjustedData', newData)
        res.status(200).json({ message: 'nominations', data });
      } catch (error) {
        console.error('Error handling GET request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

