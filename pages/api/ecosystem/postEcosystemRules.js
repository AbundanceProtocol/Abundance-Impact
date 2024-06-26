import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const code = process.env.ECOSYSTEM_SECRET

export default async function handler(req, res) {
  const { fid, data } = req.body;
  
  if (req.method !== 'POST' || !fid || !data) {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    console.log(data)

    try {
      await connectToDatabase();
      let ecosystem = new EcosystemRules({fid: fid})
      let rules = []
      let channels = []
      let moderators = []
      let nfts = []
      let erc20s = []

      ecosystem.owner_name = data.ecoOwner
      ecosystem.ecosystem_name = data.ecoName
      ecosystem.ecosystem_handle = data.ecoHandle
      ecosystem.ecosystem_points_name = data.ecoPoints
      if (data.ecoRules && data.ecoRules.length > 0) {
        for (const rule of data.ecoRules) {
          rules.push(rule.value)
        }
      }
      if (data.ecoChannels && data.ecoChannels.length > 0) {
        for (const channel of data.ecoChannels) {
          let channelInfo = {url: channel.url, name: channel.name}
          channels.push(channelInfo)
        }
        ecosystem.condition_points_threshold = data.channelPointThreshold
        ecosystem.condition_curators_threshold = data.channelCuratorThreshold
      }
      if (data.ecoModerators && data.ecoModerators.length > 0) {
        for (const moderator of data.ecoModerators) {
          moderators.push(moderator.fid)
        }
      }
      if (data.ecoEligibility && data.ecoEligibility.length > 0) {
        for (const eligibility of data.ecoEligibility) {
          if (eligibility.type == 'powerbadge') {
            ecosystem.condition_powerbadge = true
          } else if (eligibility.type == 'follow-owner') {
            ecosystem.condition_following_owner = true
          } else if (eligibility.type == 'follow-channel') {
            ecosystem.condition_following_channel = true
          } else if (eligibility.type == 'nft') {
            ecosystem.condition_holding_nft = true
            nfts.push({nft_address: eligibility.address, nft_chain: eligibility.chain})
          } else if (eligibility.type == 'erc20') {
            ecosystem.condition_holding_erc20 = true
            erc20s.push({erc20_address: eligibility.token, erc20_chain: eligibility.chain, min: eligibility.min})
          }
        }
      }
      if (data.ecoIncentives && data.ecoIncentives.length > 0) {
        for (const incentive of data.ecoIncentives) {
          if (incentive.type == 'percent-tipped') {
            ecosystem.percent_tipped = incentive.percent
          } else if (incentive.type == 'qdao') {
            ecosystem.upvote_value = incentive.upvote
            ecosystem.downvote_value = Math.abs(incentive.downvote)
          } else if (incentive.type == 'tip') {
            ecosystem.points_per_tip = incentive.value
          }
        }
      }
      ecosystem.channels = channels
      if (channels && channels.length > 0) {
        ecosystem.condition_channels = true
      }
      ecosystem.nfts = nfts
      ecosystem.ecosystem_rules = rules
      ecosystem.ecosystem_moderators = moderators
      ecosystem.erc20s = erc20s
      await ecosystem.save()

      async function updateUserAllowance(easyCronKey, baseURL, points, code) {
        try {
          const cronUrl = `https://www.easycron.com/rest/add?${qs.stringify({
            token: easyCronKey,
            url: `${baseURL}/api/ecosystem/updateAllUsers?${qs.stringify({ points, code })}`,
            cron_expression: '59 23 * * *',
            cron_job_name: `${points}_Ecosystem`,
          })}`;
      
          const cronResponse = await fetch(cronUrl)
          return cronResponse
        } catch (error) {
          console.error('Error handling POST request:', error);
          return null
        }
      }
      const ecoPoints = data.ecoPoints.substring(1)
      const createCron = await updateUserAllowance(easyCronKey, baseURL, ecoPoints, code)
    
      res.status(200).json({ ecosystem: ecosystem });
    } catch (error) {
      console.error('Error handling POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}