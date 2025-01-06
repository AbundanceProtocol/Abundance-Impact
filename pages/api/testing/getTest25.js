// import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
// import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Score from '../../../models/Score';
import Circle from '../../../models/Circle';
import Raffle from '../../../models/Raffle';
import User from '../../../models/User';
import ScheduleTip from '../../../models/ScheduleTip';
import Tip from '../../../models/Tip';
// import EcosystemRules from '../../../models/EcosystemRules';
import { decryptPassword } from '../../../utils/utils';
// import { x1Testnet } from 'viem/chains';
// import { init, fetchQuery } from "@airstack/node";
// import { createObjectCsvWriter } from 'csv-writer';
import path from 'path'
import fs from 'fs';
import axios from 'axios';

const secretKey = process.env.SECRET_KEY
const setCode = process.env.DATA_CODE
const apiKey = process.env.NEYNAR_API_KEY
const baseApi = process.env.BASE_API
const baseApiKey = process.env.BASE_API_KEY
const wcApiKey = process.env.DC_API_KEY
const encryptedTipUuid = process.env.ENCRYPTED_TIP_UUID

export default async function handler(req, res) {
  const { code } = req.query

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else if (code == setCode) {
    try {










      async function sendDc() {
        try {

          const response = await fetch(
            "https://api.warpcast.com/fc/message",
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${wcApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                recipientFid: 9326,
                message: "test",
                idempotencyKey: Math.random().toString(36).substring(7),
              }),
            },
          );
          console.log('response', response)
          return response
        } catch (error) {
          console.error('Error handling GET request:', error);
          return null;
        }

      }
      






    






      const result = await sendDc();
      console.log('result', result)
      res.status(200).json({result, message: 'done' });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
