import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";

import connectToDatabase from "../../../libs/mongodb";
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Cast from "../../../models/Cast";
import EcosystemRules from "../../../models/EcosystemRules";
// import Allowlist from '../../../models/Allowlist';

// import { decryptPassword } from "../../../utils/utils"; 

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY
// const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
// const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // const impactAmount = 1
    const eco = req.query.points
    const points = '$' + eco
    const curatorFid = req.body.untrustedData.fid
    const castHash = req.body.untrustedData.castId.hash
    // const authorFid = req.body.untrustedData.castId.fid
    console.log('28', points, curatorFid, castHash)

    let quality = 0
    let impact = 0

    async function getCuratorBalances(curatorFid, points) {
      try {
        await connectToDatabase();

        let user = await User.findOne({ fid: curatorFid, ecosystem_points: points }).select('remaining_i_allowance remaining_q_allowance ecosystem_name username').exec();
        console.log('37', user, curatorFid, points)
        let impactAllowance = null
        let qualityAllowance = null
        let ecoName = null
        let curator = ''

        if (user) {
          impactAllowance = user.remaining_i_allowance
          qualityAllowance = user.remaining_q_allowance
          ecoName = user.ecosystem_name
          curator = user.username
        }

        return { impactAllowance, qualityAllowance, ecoName, curator }
    
      } catch (error) {
        console.error("Error getting data:", error);
        return { impactAllowance: null, qualityAllowance: null, ecoName: null, curator: '' }
      }
    }

    let needLogin = false

    let { impactAllowance, qualityAllowance, ecoName, curator } = await getCuratorBalances(curatorFid, points)

    console.log('62', impactAllowance, qualityAllowance, ecoName, curator)

    if ((!impactAllowance && impactAllowance !== 0) || (!qualityAllowance && qualityAllowance !== 0) || !ecoName) {
      needLogin = true
      impactAllowance = 0
      qualityAllowance = 0
      quality = 0
      impact = 0

      async function getEcosystem(points) {
        try {
          await connectToDatabase();
  
          let eco = await EcosystemRules.findOne({ ecosystem_points_name: points }).exec();
  
          let ecoName = ''
  
          if (eco) {
            ecoName = eco.ecosystem_name
          }
  
          return { ecoName }
      
        } catch (error) {
          console.error("Error getting data:", error);
          return { ecoName: '' }
        }
      }

      ecoName = await getEcosystem(points)
    }

    async function getCastBalances(castHash, points) {
      try {
        await connectToDatabase();

        let cast = await Cast.findOne({ cast_hash: castHash, points }).exec();

        let impactBalance = null
        let qualityBalance = null
        let qualityTotal = null
        let author = ''
        let castImpact = 0

        if (cast) {
          impactBalance = cast.impact_total
          qualityBalance = cast.quality_balance
          qualityTotal = cast.quality_absolute
          author = cast.author_username
          castImpact = cast.impact_points.length
        }

        return { impactBalance, qualityBalance, qualityTotal, author, castImpact }
    
      } catch (error) {
        console.error("Error getting data:", error);
        return { impactBalance: null, qualityBalance: null, qualityTotal: null, author: '', castImpact: 0 }
      }
    }

    let { impactBalance, qualityBalance, qualityTotal, author, castImpact } = await getCastBalances(castHash, points)

    console.log('124', impactBalance, qualityBalance, qualityTotal, author, castImpact)

    if ((!impactBalance && impactBalance !== 0) || (!qualityBalance && qualityBalance !== 0) || (!qualityTotal && qualityTotal !== 0)) {
      impactBalance = 0
      qualityBalance = 0
      qualityTotal = 0

      async function populateCast(fid, castString) {
        try {
          const base = "https://api.neynar.com/";
          const url = `${base}v2/farcaster/casts?casts=${castString}&viewer_fid=${fid}`;
          const response = await fetch(url, {
            headers: {
              accept: "application/json",
              api_key: apiKey,
            },
          });
          const castData = await response.json();
          // console.log(castData)
          let casts = []
          if (castData?.result?.casts?.length > 0) {
            casts = castData?.result?.casts[0]
          }
          
          return casts
        } catch (error) {
          console.error('Error handling GET request:', error);
          return []
        }
      }

      const getCastData = await populateCast(curatorFid, castHash)

      let castContext

      if (getCastData) {
        castContext = {
          author_fid: getCastData.author.fid,
          author_pfp: getCastData.author.pfp_url,
          author_username: getCastData.author.username,
          author_display_name: getCastData.author.display_name,
          cast_hash: getCastData.hash,
          cast_text: getCastData.text,
          cast_channel: getCastData.root_parent_url
        }

        let cast = new Cast({
          author_fid: castContext.author_fid,
          author_pfp: castContext.author_pfp,
          author_username: castContext.author_username,
          author_display_name: castContext.author_display_name,
          points: points,
          cast_hash: castContext.cast_hash,
          cast_text: castContext.cast_text,
          cast_channel: castContext.cast_channel,
          quality_balance: 0,
          quality_absolute: 0,
          impact_total: 0,
          impact_points: [],
        });
  
        await cast.save()
  
        author = castContext.author_username

      }

    }

    if (needLogin !== true) {

      async function getUserImpact(castHash, curatorFid, points) {
        try {
          await connectToDatabase();
  
          let impact = await Impact.countDocuments({ target_cast_hash: castHash, curator_fid: parseInt(curatorFid), points })
          console.log('impact data', castHash, curatorFid, points, typeof curatorFid)
          console.log('impact', impact)

          if (impact) {
            return impact
          } else {
            return 0
          }
      
        } catch (error) {
          console.error("Error getting data:", error);
          return 0
        }
      }

      impact = await getUserImpact(castHash, curatorFid, points)
      console.log('impact2', impact)

      if (impact !== 0) {

        async function getUserQuality(castHash, curatorFid, points) {
          try {
            await connectToDatabase();
    
            let quality = await Quality.countDocuments({ target_cast_hash: castHash, curator_fid: curatorFid, points })
            console.log('quality', quality)
            if (quality) {
              return quality
            } else {
              return 0
            }
        
          } catch (error) {
            console.error("Error getting data:", error);
            return 0
          }
        }
  
        quality = await getUserQuality(castHash, curatorFid, points)
        console.log('quality2', quality)

      }

    }

    console.log('242', impactBalance, qualityBalance, qualityTotal, author, impactAllowance,  qualityAllowance, ecoName, needLogin, points, curator, impact, quality, castImpact)

    console.log('test')

    try {

      res.setHeader('Content-Type', 'application/json');

      res.status(200).json({
        "type": "frame",
        "frameUrl": `https://impact.abundance.id/api/frames/remote/status?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ecosystem: ecoName, login: needLogin, pt: points, cu: curator, impact, quality, cI: castImpact, hash: castHash })}`
      })
    } catch (error) {
      console.error(error);
      console.log('test3')
      res.setHeader('Allow', ['POST']);
      res.status(200).send(`Request failed`);
    }



  } else {
    console.log('test4')
    res.setHeader('Allow', ['POST']);
    res.status(401).send(`Request failed`);
  }
}