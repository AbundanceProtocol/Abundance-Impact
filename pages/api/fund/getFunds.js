// import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
// import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Score from '../../../models/Score';
import Circle from '../../../models/Circle';
import Raffle from '../../../models/Raffle';
import Fund from '../../../models/Fund';
import ScheduleTip from '../../../models/ScheduleTip';
import Tip from '../../../models/Tip';
// import EcosystemRules from '../../../models/EcosystemRules';
// import { getTimeRange, processTips, populateCast } from '../../../utils/utils';
// import { x1Testnet } from 'viem/chains';
// import { init, fetchQuery } from "@airstack/node";
// import { createObjectCsvWriter } from 'csv-writer';
import path from 'path'
import fs from 'fs';

const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY
const baseApi = process.env.BASE_API
const baseApiKey = process.env.BASE_API_KEY

export default async function handler(req, res) {
  const { fid } = req.query

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {
    try {


      async function getFunds(fid) {
        try {
          await connectToDatabase()
          const oneDay = new Date(Date.now() - 24 * 60 * 60 * 1000);


          let userFunds = await Fund.aggregate([
            { $match: {valid: true, fid: Number(fid) } },
            { $group: {
              _id: null,
              dev_degen: {
                $sum: "$development_degen_amount"
              },
              growth_degen: {
                $sum: "$growth_degen_amount"
              },
              creator_degen: {
                $sum: "$creator_degen_amount"
              },
              special_degen: {
                $sum: "$special_degen_amount"
              },
              total_degen: {
                $sum: "$degen_amount"
              },
              growth_ham: {
                $sum: "$growth_ham_amount"
              },
              creator_ham: {
                $sum: "$creator_ham_amount"
              },
              dev_ham: {
                $sum: "$development_ham_amount"
              },
              special_ham: {
                $sum: "$special_ham_amount"
              },
              total_ham: {
                $sum: "$ham_amount"
              }
            } },
          ])

          console.log('userFunds', userFunds, fid)

          let totalFunds = await Fund.aggregate([
            { $match: {valid: true} },
            { $group: {
              _id: null,
              dev_degen: {
                $sum: "$development_degen_amount"
              },
              growth_degen: {
                $sum: "$growth_degen_amount"
              },
              creator_degen: {
                $sum: "$creator_degen_amount"
              },
              special_degen: {
                $sum: "$special_degen_amount"
              },
              total_degen: {
                $sum: "$degen_amount"
              },
              growth_ham: {
                $sum: "$growth_ham_amount"
              },
              creator_ham: {
                $sum: "$creator_ham_amount"
              },
              dev_ham: {
                $sum: "$development_ham_amount"
              },
              special_ham: {
                $sum: "$special_ham_amount"
              },
              total_ham: {
                $sum: "$ham_amount"
              }
            } },
          ])


          // let dailyFunds = await Fund.aggregate([
          //   { $match: {valid: true, fid} },
          //   { $sort: { createdAt: 1 } },
          //   { $group: {
          //     _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          //     total_dev_degen: {
          //       $sum: "$development_degen_amount"
          //     },
          //     total_growth_degen: {
          //       $sum: "$growth_degen_amount"
          //     },
          //     total_creator_degen: {
          //       $sum: "$creator_degen_amount"
          //     },
          //     total_special_degen: {
          //       $sum: "$special_degen_amount"
          //     },
          //     total_degen: {
          //       $sum: "$degen_amount"
          //     },
          //     total_growth_ham: {
          //       $sum: "$growth_ham_amount"
          //     },
          //     total_creator_ham: {
          //       $sum: "$creator_ham_amount"
          //     },
          //     total_dev_ham: {
          //       $sum: "$development_ham_amount"
          //     },
          //     total_special_ham: {
          //       $sum: "$special_ham_amount"
          //     },
          //     total_ham: {
          //       $sum: "$ham_amount"
          //     }
          //   } },
          //   { $sort: { _id: -1 } }
          // ])


          return {userFunds, totalFunds};
          
        } catch (error) {
          console.error('Error getting funds:', error);
          return {userFunds: null, totalFunds: null};
        }
      }
      

      const {userFunds, totalFunds} = await getFunds(fid)

      res.status(200).json({userFunds, totalFunds, message: 'Complete' });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
