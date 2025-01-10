import connectToDatabase from '../../libs/mongodb';
import Impact from '../../models/Impact';
import Quality from '../../models/Quality';
import User from '../../models/User';
import Cast from '../../models/Cast';
import { v4 as uuid } from 'uuid'

const wcApiKey = process.env.WC_API_KEY
const userFid = process.env.USER_FID

exports.handler = async function(event, context) {


  async function sendNotif() {
    try {
      await connectToDatabase()
      const oneDay = new Date(Date.now() - 24 * 60 * 60 * 1000);


      let targetHashes = await Quality.distinct("target_cast_hash", { createdAt: { $gte: oneDay } });

      const uniqueTargetHashes = await Impact.aggregate([
        { $match: { target_cast_hash: { $in: targetHashes } } },
        { $group: { _id: "$target_cast_hash", unique: { $addToSet: "$curator_fid" } } },
        { $match: { unique: { $size: 1 } } },
        { $project: { _id: 1 } }
      ]).then(results => results.map(result => result._id));

      let qualityPointsSum = await Quality.aggregate([
        { $match: { target_cast_hash: { $in: uniqueTargetHashes } } },
        { $group: { _id: "$target_cast_hash", totalQualityPoints: { $sum: "$quality_points" } } }
      ]).then(results => results.map(result => ({ hash: result._id, totalQualityPoints: result.totalQualityPoints })));


      const curatorFids = await Promise.all(qualityPointsSum.map(async ({ hash }) => {
        const impactDoc = await Impact.findOne({ target_cast_hash: hash }).select('curator_fid');
        return impactDoc ? impactDoc.curator_fid : null;
      }));

      qualityPointsSum.forEach((item, index) => {
        item.curator_fid = curatorFids[index];
      });
      

      for (const item of qualityPointsSum) {
        const castDoc = await Cast.findOne({ cast_hash: item.hash }).select('author_username');
        if (castDoc) {
          item.author = castDoc.author_username;
        }
      }


      for (const item of qualityPointsSum) {
        const castDoc = await Cast.findOne({ cast_hash: item.hash }).select('author_username');
        if (castDoc) {
          item.author = castDoc.author_username;
        }
      }



      for (const item of qualityPointsSum) {
        let castDoc = await Quality.distinct("curator_fid", { target_cast_hash: item.hash });

        let qualityUsers = await User.find({ fid: { $in: castDoc.map(c => c.toString()) }}).select('username').lean().then(users => users.map(user => user.username));

        qualityUsers = [...new Map(qualityUsers.map(item => [item.username, item])).values()];

        if (castDoc) {
          item.quality = qualityUsers;
        }
      }

      for (const item of qualityPointsSum) {
        let url = ``
        if (item?.author && item?.hash) {
          url = `https://warpcast.com/${item?.author}/${item?.hash?.substring(0, 10)}`
        }
        item.url = url
      }


      for (const item of qualityPointsSum) {
        const castDoc = await User.findOne({ fid: item.curator_fid.toString() }).select('username');
        if (castDoc) {
          item.curator = castDoc.username;
        }
      }


      const groupedByCurator = qualityPointsSum.reduce((acc, item) => {
        const key = item.curator_fid;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});

      
      for (const [curator_fid, items] of Object.entries(groupedByCurator)) {
        let message = ``
        let totalQDAU = 0
        for (const item of items) {
          totalQDAU += item.totalQualityPoints
        }
        if (items.some(item => item.totalQualityPoints < 0) && totalQDAU <= -5) {

          message = `Hi${items[0]?.curator ? ' @' + items[0]?.curator : ''},\nThis is an automated notification. Your staked casts were downvoted by ${totalQDAU} qDAU points today. Downvotes result in lost $impact allowance.\n\nHere are some casts that were downvoted:\n`
          
          for (const item of items.slice(0, 6)) {
            if (item.totalQualityPoints <= -1) {
              message += item.url + ' (' + item.totalQualityPoints + `pts)\n`
            }
          }
          
          message += `\n/impact's purpose is to boost & reward creators for impactful content. Please make sure to stake points on casts based on their value to the Farcaster ecosystem.\n\nIf this is a mistake please contact @abundance`

          async function sendDc(text, fid) {
            await new Promise(resolve => setTimeout(resolve, 50));
            console.log('fid', fid)
            try {
              const requestBody = {
                "recipientFid": 9326,
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
              console.log('sentDC', sentDC?.status)
              return sentDC?.status
            } catch (error) {
              console.error('Error handling request:', error);
              return 500;
            }
          }
    
          const messaged = await sendDc(message, curator_fid);

        }

      }

      return groupedByCurator
    } catch (error) {
      console.error('Error in groupedByCurator:', error);
      return null;
    }
  }

  const data = await sendNotif()

  console.log('data', data);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `data: ${data}` })
  };

};

