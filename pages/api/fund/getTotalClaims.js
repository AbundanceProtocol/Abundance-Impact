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
import Claim from '../../../models/Claim';
import Tip from '../../../models/Tip';
// import EcosystemRules from '../../../models/EcosystemRules';
// import { getTimeRange, processTips, populateCast } from '../../../utils/utils';
// import { x1Testnet } from 'viem/chains';
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


      async function getReward(fid) {
        try {
          await connectToDatabase();
          let totalClaims = await Claim.aggregate([
            { $match: { fid: fid, claimed: true, season: 8 } }, // update season 5/15
            { $group: { _id: null, total: { $sum: "$degen_amount" } } }
          ]).exec();
          if (totalClaims.length > 0) {
            // Make sure to handle undefined/null/NaN cases for .total
            const total = totalClaims[0]?.total;
            return typeof total === "number" && !isNaN(total) ? total : 0;
          } else {
            return 0;
          }
        } catch (error) {
          console.error("Error while fetching casts:", error);
          return 0
        }  
      }
      

      // Validate fid before converting to number
      if (!fid || isNaN(Number(fid))) {
        return res.status(400).json({ error: 'Invalid fid parameter' });
      }
      
      const reward = await getReward(Number(fid))
      // await new Promise(resolve => setTimeout(resolve, 10000));


      res.status(200).json({data: reward, message: 'Complete' });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
