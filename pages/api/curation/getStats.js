import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';
import Fund from '../../../models/Fund';
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

    async function aggregateTipsByCurrency() {
      await connectToDatabase();

      let result = await Tip.aggregate([
        { $unwind: "$tip" },
        {
          $group: {
            _id: { $toLower: "$tip.currency" },
            totalAmount: { $sum: "$tip.amount" }
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);

      let devFunds = await Fund.aggregate([
        { $match: {valid: true} },
        { $group: {
          _id: null,
          // total_dev_degen: {
          //   $sum: "$development_degen_amount"
          // },
          // total_growth_degen: {
          //   $sum: "$growth_degen_amount"
          // },
          // total_creator_degen: {
          //   $sum: "$creator_degen_amount"
          // },
          total_degen: {
            $sum: "$degen_amount"
          },
          // total_growth_ham: {
          //   $sum: "$growth_ham_amount"
          // },
          // total_creator_ham: {
          //   $sum: "$creator_ham_amount"
          // },
          // total_dev_ham: {
          //   $sum: "$development_ham_amount"
          // },
          total_ham: {
            $sum: "$ham_amount"
          }
        } },
      ])

      if (devFunds?.length > 0 && result?.length > 0) {
        const degenIndex = result.findIndex(item => item._id === '$degen');
        if (degenIndex !== -1) {
          result[degenIndex].totalAmount += devFunds[0].total_degen;
        }
        const hamIndex = result.findIndex(item => item._id === '$tn100x');
        if (hamIndex !== -1) {
          result[hamIndex].totalAmount += devFunds[0].total_ham;
        }
      }
      
      return result;
    }

    async function countUniqueTippers() {
      await connectToDatabase();

      const result = await Tip.aggregate([
        { $group: { _id: "$tipper_fid" } },
        { $count: "uniqueTipperCount" }
      ]);

      return result[0]?.uniqueTipperCount || 0;
    }

    async function countUniqueCurators() {
      await connectToDatabase();

      const result = await Impact.aggregate([
        {
          $group: {
            _id: "$curator_fid",
            totalImpactPoints: { $sum: "$impact_points" }
          }
        },
        {
          $match: {
            totalImpactPoints: { $gte: 1 } // min points staked
          }
        },
        {
          $count: "uniqueCuratorCount"
        }
      ]);

      return result[0]?.uniqueCuratorCount || 0;
    }

    async function countActiveCurators() {
      await connectToDatabase();

      const result = await Impact.aggregate([
        {
          $match: {
            impact_points: { $gte: 1 }
          }
        },
        {
          $group: {
            _id: {
              curator_fid: "$curator_fid",
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            }
          }
        },
        {
          $group: {
            _id: "$_id.curator_fid",
            uniqueDays: { $sum: 1 }
          }
        },
        {
          $match: {
            uniqueDays: { $gte: 10 }
          }
        },
        {
          $count: "activeCuratorCount"
        }
      ]);

      return result[0]?.activeCuratorCount || 0;
    }


    async function countUniqueUsers() {
      await connectToDatabase();

      const result = await User.aggregate([
        {
          $group: {
            _id: "$fid"
          }
        },
        {
          $count: "uniqueUserCount"
        }
      ]);

      return result[0]?.uniqueUserCount || 0;
    }

    async function countUniqueCastAuthors() {
      await connectToDatabase();

      const result = await Cast.aggregate([
        {
          $group: {
            _id: "$author_fid"
          }
        },
        {
          $count: "uniqueAuthorCount"
        }
      ]);

      return result[0]?.uniqueAuthorCount || 0;
    }

    async function countUniqueImpactedCasts() {
      await connectToDatabase();

      const result = await Impact.aggregate([
        {
          $match: {
            impact_points: { $gte: 1 }
          }
        },
        {
          $group: {
            _id: "$target_cast_hash"
          }
        },
        {
          $count: "uniqueImpactedCastCount"
        }
      ]);

      return result[0]?.uniqueImpactedCastCount || 0;
    }


    async function getTotalDegenTipsForSetCasts() {
      await connectToDatabase();

      const result = await User.aggregate([
        { $match: { set_cast_hash: { $exists: true, $ne: null } } },
        {
          $lookup: {
            from: 'tips',
            localField: 'set_cast_hash',
            foreignField: 'cast_hash',
            as: 'matchingTips'
          }
        },
        { $unwind: '$matchingTips' },
        { $unwind: '$matchingTips.tip' },
        {
          $match: {
            'matchingTips.tip.currency': { $regex: /^degen$/i }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$matchingTips.tip.amount' }
          }
        }
      ]);

      return result[0]?.totalAmount || 0;
    }



    
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

    async function countUniqueReceivers() {
      try {
        await connectToDatabase();
        const uniqueCount = await Tip.distinct("receiver_fid").exec();
        return uniqueCount.length;
      } catch (error) {
        console.error("Error counting unique receivers:", error);
        return null;
      }
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
    async function countActiveScheduledTips() {
      await connectToDatabase();
      
      const result = await ScheduleTip.countDocuments({ active_cron: true });
      
      return result;
    }
    
    try {
      const getTips = await aggregateTipsByCurrency(fid)
      // const getTopTips = await getTop5UsersByTips()
      const uniqueTips = await countUniqueTippers()
      const uniqueCurator = await countUniqueCurators()
      const activeCurators = await countActiveCurators()
      const uniqueUsers = await countUniqueUsers()
      const uniqueCreators = await countUniqueCastAuthors()
      const curatedCasts = await countUniqueImpactedCasts()
      const uniqueCreatorsTipped = await countUniqueReceivers()
      // const degenCuratorRewards = await getTotalDegenTipsForSetCasts()
      const autoTips = await countActiveScheduledTips();
      // console.log('tips', getTips, uniqueTips, uniqueCurator, uniqueUsers, uniqueCreators, curatedCasts, autoTips)
      // const totalAmount = await getTotalTipsByAllCurrencies()
      // console.log('totalAmount', totalAmount)
      res
        .status(200)
        .json({
          message: "tips",
          getTips,
          uniqueTips,
          uniqueCurator,
          activeCurators,
          uniqueUsers,
          uniqueCreators,
          curatedCasts,
          uniqueCreatorsTipped, 
          autoTips,
        });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
