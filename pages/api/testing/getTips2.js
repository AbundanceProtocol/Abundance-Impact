import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';
import EcosystemRules from '../../../models/EcosystemRules';
import { getTimeRange, processTips, populateCast } from '../../../utils/utils';

const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { fid } = req.query

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {


    // async function getTopCuratorsByImpactPoints() {
    //   await connectToDatabase();
    //   const twentyFourHoursAgo = new Date();
    //   twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    //   const result = await Impact.aggregate([
    //     { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
    //     { $group: { _id: "$curator_fid", totalImpactPoints: { $sum: "$impact_points" } } },
    //     { $sort: { totalImpactPoints: -1 } },
    //     { $limit: 5 }
    //   ]);

    //   return result
    // }

    // async function getTop5UsersByTips() {
    //   await connectToDatabase();

    //   const result = await Tip.aggregate([
    //     { $group: { _id: "$tipper_fid", totalTips: { $sum: 1 } } },
    //     { $sort: { totalTips: -1 } },
    //     { $limit: 5 }
    //   ]);

    //   return result;
    // }

    async function getTipCountsAndAmountsByCastHash(tipper_fid) {
      await connectToDatabase();

      const result = await Tip.aggregate([
        { $match: { tipper_fid: parseInt(tipper_fid) } },
        { $unwind: "$tip" },
        {
          $group: {
            _id: "$cast_hash",
            count: { $sum: 1 },
            totalAmount: { $sum: "$tip.amount" }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Count how many documents are in each "count" by number
      const countByNumber = result.reduce((acc, cur) => {
        acc[cur.count] = (acc[cur.count] || 0) + 1;
        return acc;
      }, {});

      return { result, countByNumber };
    }

    // async function getTipCountsAndAmountsByCastHash(tipper_fid) {
    //   await connectToDatabase();

    //   const result = await Tip.aggregate([
    //     { $match: { tipper_fid: parseInt(tipper_fid) } },
    //     { $unwind: "$tip" },
    //     {
    //       $group: {
    //         _id: "$cast_hash",
    //         count: { $sum: 1 },
    //         totalAmount: { $sum: "$tip.amount" }
    //       }
    //     },
    //     { $sort: { count: -1 } }
    //   ]);

    //   return result;
    // }

    // async function getTipCountsAndAmountsByCastHash(tipper_fid) {
    //   await connectToDatabase();

    //   const result = await Tip.aggregate([
    //     { $match: { tipper_fid: parseInt(tipper_fid) } },
    //     { $unwind: "$tip" },
    //     {
    //       $group: {
    //         _id: { cast_hash: "$cast_hash", currency: "$tip.currency" },
    //         count: { $sum: 1 },
    //         totalAmount: { $sum: "$tip.amount" }
    //       }
    //     },
    //     { $sort: { count: -1 } }
    //   ]);

    //   return result;
    // }



    // async function getTotalTipsByAllCurrencies() {
    //   await connectToDatabase();

    //   const result = await Tip.aggregate([
    //     { $unwind: "$tip" },
    //     { 
    //       $group: {
    //         _id: { $toLower: "$tip.currency" },
    //         totalAmount: { $sum: "$tip.amount" }
    //       }
    //     },
    //     { $sort: { _id: 1 } }
    //   ]);
      
    //   // Combine results for currencies that differ only in case
    //   const combinedResult = result.reduce((acc, curr) => {
    //     const existingCurrency = acc.find(item => item._id.toLowerCase() === curr._id.toLowerCase());
    //     if (existingCurrency) {
    //       existingCurrency.totalAmount += curr.totalAmount;
    //     } else {
    //       acc.push(curr);
    //     }
    //     return acc;
    //   }, []);
      
    //   console.log('Total Amount for all currencies:', combinedResult);
    //   return combinedResult;
    // }
    
    try {
      const getTips = await getTipCountsAndAmountsByCastHash(fid)
      // const getTopTips = await getTop5UsersByTips()
  
      console.log('tips', getTips)
      // const totalAmount = await getTotalTipsByAllCurrencies()
      // console.log('totalAmount', totalAmount)
      res.status(200).json({ message: 'tips', getTips });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
