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
import { v4 as uuid } from 'uuid'

const secretKey = process.env.SECRET_KEY
const setCode = process.env.DATA_CODE
const apiKey = process.env.NEYNAR_API_KEY
const baseApi = process.env.BASE_API
const baseApiKey = process.env.BASE_API_KEY
const wcApiKey = process.env.WC_API_KEY
const encryptedTipUuid = process.env.ENCRYPTED_TIP_UUID

export default async function handler(req, res) {
  const { code } = req.query

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else if (code == setCode) {
    try {










      async function sendDc(text, fid) {
        try {
          const requestBody = {
            "recipientFid": fid,
            "message": text,
          };
          const headers = {
            Authorization: `Bearer ${wcApiKey}`,
            "Content-Type": "application/json",
            "idempotency-key": uuid()
          };
          const sentDC = await fetch('https://api.warpcast.com/fc/message', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(requestBody),
          })
          console.log('sentDC', sentDC)
          return sentDC
        } catch (error) {
          console.error('Error handling request:', error);
          return null;
        }
      }

          // console.log(uuid())
          // const response = await fetch(
          //   "https://api.warpcast.com/fc/message",
          //   {
          //     method: "PUT",
          //     headers: {
          //       "Content-Type": "application/json",
          //       "Authorization": `Bearer ${wcApiKey}`,
          //     },
          //     body: JSON.stringify({
          //       recipientFid: fid,
          //       message: "test",
          //       idempotencyKey: uuid(),
          //     }),
          //   },
          // );
          // console.log('response', response)

      
      // let sendText = 'hi there'

      // `https://warpcast.com/~/inbox/create/9326?text=${sendText}`



    



      let text = 'abc'
      let fid = 9326


      const result = await sendDc(text, 9326);
      // console.log('result', result)
      res.status(200).json({result, message: 'done' });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
