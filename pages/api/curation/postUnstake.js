import connectToDatabase from '../../../libs/mongodb';
// import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Cast from '../../../models/Cast';
// import Allowlist from '../../../models/Allowlist';
import EcosystemRules from '../../../models/EcosystemRules';
// import axios from 'axios';
import { decryptPassword } from '../../../utils/utils'; 
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;


export default async function handler(req, res) {
  const { fid, castHash, points } = req.body;
  console.log(fid, points)
  
  if (req.method !== 'POST' || !fid || fid == '-' || !points || !castHash) {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  } else {

    const impactAmount = 1
    const eco = points?.substring(1)
    const curatorFid = fid
    const signer = decryptPassword(encryptedBotUuid, secretKey)

    async function getEcosystem(points) {
      try {
        await connectToDatabase();
        const ecosystem = await EcosystemRules.findOne({ ecosystem_points_name: points }).exec();
        return ecosystem
      } catch (error) {
        console.error('Error retrieving ecosystem', error)
        return null
      }
    }

    const ecosystem = await getEcosystem(points)

    async function getQuality(castHash, points) {
      try {
        await connectToDatabase();
        const quality = await Quality.countDocuments({ target_cast_hash: castHash, points })
        if (quality > 0) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error('Error handling request:', error);
        return false
      }
    }

    const quality = await getQuality(castHash, points)

    if (quality) {
      res.status(202).send({message: `Can't unstake cast`});
    } else {

      let channelCuration = false

      async function unstakeImpact(curatorFid, castHash, impactAmount, points) {

        try {
          await connectToDatabase();
          const impact = await Impact.findOne({ curator_fid: curatorFid, target_cast_hash: castHash, points }).exec()
          const cast = await Cast.findOne({ cast_hash: castHash, points }).exec()
          // console.log('us1 impact_points', impact?.impact_points, impactAmount, cast?.impact_total, impact)
          if (impact?.impact_points >= impactAmount && cast?.impact_total >= impactAmount) {
            cast.impact_total -= impactAmount
            impact.impact_points -= impactAmount
            if (impact.impact_points == 0) {
              await impact.deleteOne()
              const impactIndex = cast.impact_points.indexOf(impact._id);
              if (impactIndex > -1) {
                cast.impact_points.splice(impactIndex, 1);
              }
              cast.save()
              return {castImpact: cast.impact_total, curatorCount: cast.impact_points.length, castChannel: cast.cast_channel, curatorImpact: 0}
            } else {
              await Promise.all([
                impact.save(),
                cast.save()
              ]);
              return {castImpact: cast.impact_total, curatorCount: cast.impact_points.length, castChannel: cast.cast_channel, curatorImpact: impact.impact_points}
            }
          } else {
            return {castImpact: 0, curatorCount: ecosystem.condition_curators_threshold, castChannel: null, curatorImpact: 0}
          }
        } catch (error) {
          console.error('Error handling request:', error);
          return {castImpact: 0, curatorCount: ecosystem.condition_curators_threshold, castChannel: null, curatorImpact: 0}
        }
      }

      let {castImpact, curatorCount, castChannel} = await unstakeImpact(curatorFid, castHash, impactAmount, points)

      if (ecosystem?.channels?.length > 0 && castChannel) {
        for (const channel of ecosystem.channels) {
          if (channel.url == castChannel) {
            channelCuration = true
          }
        }
      }

      let curatedCast = null

      if (channelCuration) {
        if (impactTotal < ecosystem.condition_points_threshold || curatorCount < ecosystem.condition_curators_threshold) {

          async function curateCast(hash) {
            try {
              const base = "https://api.neynar.com/";
              const url = `${base}v2/farcaster/reaction`;
              const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  accept: "application/json",
                  api_key: apiKey,
                  'content-type': 'application/json',
                },
                body: JSON.stringify({
                  'signer_uuid': signer,
                  target: hash,
                  reaction_type: 'like'
                })})
                
              const cast = await response.json();
              return cast
            } catch (error) {
              console.error('Error handling POST request:', error);
              return null
            }
          }
          curatedCast = await curateCast(castHash)
        }
      }

      res.status(201).json({ castImpact });
      return
      
    }












  }
}