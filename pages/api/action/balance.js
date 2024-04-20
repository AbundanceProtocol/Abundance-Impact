import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../libs/mongodb";
import Cast from "../../../models/Cast";

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;

export default async function handler(req, res) {
  if (req.method === 'POST' && req.body && req.body.untrustedData) {
    const castHash = req.body.untrustedData.castId.hash

    async function getCastBalances(castHash) {
      try {
        await connectToDatabase();

        let cast = await Cast.findOne({ cast_hash: castHash }).exec();

        let impactBalance = 0
        let qualityBalance = 0
        let qualityTotal = 0

        if (cast) {
          impactBalance = cast.impact_total
          qualityBalance = cast.quality_balance
          qualityTotal = cast.quality_absolute
        }

        return { impactBalance, qualityBalance, qualityTotal }
    
      } catch (error) {
        console.error("Error getting data:", error);
        return null
      }
    }

    const { impactBalance, qualityBalance, qualityTotal } = await getCastBalances(castHash)
  
    if ((impactBalance || impactBalance == 0) && (qualityBalance || qualityBalance == 0) && (qualityTotal || qualityTotal == 0)) {
      try {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send({
          message: `Cast Impact: ${impactBalance} / q/dau: ${qualityBalance} (${qualityTotal})`
        });
      } catch (error) {
          console.error(error);
          res.setHeader('Allow', ['POST']);
          res.status(401).send('Request failed');
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(401).end(`Request failed`);
    }
  } else {
      res.setHeader('Allow', ['POST']);
      res.status(401).end(`Request failed`);
  }
}