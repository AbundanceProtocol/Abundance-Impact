import connectToDatabase from "../../libs/mongodb";
import Circle from "../../models/Circle";
import Tip from "../../models/Tip";
import Cast from "../../models/Cast";
import User from "../../models/User";
import EcosystemRules from "../../models/EcosystemRules";
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET' || !id) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    try {

      async function getCircle(id) {
        try {
          const objectId = new mongoose.Types.ObjectId(id)
          console.log('id', id, objectId)
          await connectToDatabase();
          let circle = await Circle.findOne({ _id: objectId }).exec();
          console.log('circle', circle)
          if (circle) {
            return {fid: circle.fid, time: circle.createdAt, points: circle.points, tip: circle.text, curators: circle.curators}
          } else {
            return {fid: null, time: null, points: null, tip: null, curators: null}
          }
        } catch (error) {
          console.error("Error while fetching casts:", error);
          return {fid: null, time: null, points: null, tip: null, curators: null}
        }  
      }

      let {fid, time, points, tip, curators} = await getCircle(id);

      let casts = []

      if (time) {

        async function getTips(fid, time, points) {

          const startTime = new Date(new Date(time).getTime() - 2 * 60 * 1000); // 2 minutes before
          const endTime = new Date(new Date(time).getTime() + 30 * 1000); // 30 seconds after

          try {
            await connectToDatabase();
            
            // retrieve cast_hashes and tips from Tip
            const tips = await Tip.find({
              tipper_fid: fid,
              points: points,
              createdAt: {
                $gte: startTime,
                $lte: endTime
              }
            }).select('cast_hash tip').lean().exec();

            const castHashes = tips.map(tip => tip.cast_hash);

            // find corresponding documents in Cast
            const casts = await Cast.find({
              cast_hash: { $in: castHashes }
            }).lean().exec();

            // Append the 'tip' field to each cast
            const castsWithTips = casts.map(cast => {
              const associatedTip = tips.find(tip => tip.cast_hash === cast.cast_hash);
              return {
                ...cast,
                tip: associatedTip ? associatedTip.tip : null
              };
            });
            console.log('castsWithTips', castsWithTips)
            return castsWithTips;
          } catch (error) {
            console.error("Error while fetching tips and casts:", error);
            return [];
          }

        }
        casts = await getTips(fid, time, points)
      }

      let curatorData =[] 

      if (curators?.length > 0) {
        async function getCurators(curators, points) {
          if (curators && curators.length > 0) {
            try {
              await connectToDatabase();
              const curatorUsers = await User.find({ fid: { $in: curators }, ecosystem_points: points }).select('username fid').lean().exec();
              return curatorUsers
            } catch (error) {
              console.error('Error fetching curator usernames:', error);
              return null
            }
          }
        }
  
        curatorData = await getCurators(curators, points)
      }

      let ecosystem = 'abundance'

      if (points) {
        async function getEcosystem(points) {
          if (curators && curators.length > 0) {
            try {
              await connectToDatabase();
              const ecosystem = await EcosystemRules.findOne({ ecosystem_points_name: points }).select('ecosystem_handle').lean().exec();
              return ecosystem
            } catch (error) {
              console.error('Error fetching curator usernames:', error);
              return 'abundance'
            }
          }
        }
  
        ecosystem = await getEcosystem(points)
      }

      console.log('curatorData', curatorData)

      res.status(200).json({ casts, fid, points, tip, curators, curatorData, ecosystem });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}