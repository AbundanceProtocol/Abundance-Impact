import connectToDatabase from '../../../libs/mongodb';
import Score from '../../../models/Score';
import Raffle from '../../../models/Raffle';
// import { decryptPassword } from '../../../utils/utils';
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const {fid, time} = req.query
  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    function formatScore(score) {
      let formattedScore = 0
      if (typeof score === 'number') {
        formattedScore = score > 100 ? parseFloat(score).toFixed(1) : parseFloat(score).toFixed(2);
      }
      return Number(formattedScore)
    }

    async function getTotalScore(fid) {
      try {
        await connectToDatabase();

        const score = await Score.findOne({ fid });
        let impactScore = formatScore(score?.impact_score_all || 0)
        let curatorScore = formatScore(score?.curator_points_all || 0)
        let creatorScore = formatScore(score?.creator_points_all || 0)
        let contributorScore = formatScore(score?.contributor_points_all || 0)
        let inviteScore = formatScore(0)

        const totalUsers = await Score.countDocuments();
        const impactCount = await Score.countDocuments({ impact_score_all: { $gt: impactScore } }) + 1;
        let impactRank = (1 - (impactCount / totalUsers)) * 100;
        impactRank = Math.floor(impactRank * 10) / 10;

        const curatorCount = await Score.countDocuments({ curator_points_all: { $gt: curatorScore } }) + 1;
        let curatorRank = (1 - (curatorCount / totalUsers)) * 100;
        curatorRank = Math.floor(curatorRank * 10) / 10;

        const creatorCount = await Score.countDocuments({ creator_points_all: { $gt: creatorScore } }) + 1;
        let creatorRank = (1 - (creatorCount / totalUsers)) * 100;
        creatorRank = Math.floor(creatorRank * 10) / 10;

        const contributorCount = await Score.countDocuments({ contributor_points_all: { $gt: contributorScore } }) + 1;
        let contributorRank = (1 - (contributorCount / totalUsers)) * 100;
        contributorRank = Math.floor(contributorRank * 10) / 10;
        
        let inviteRank = 0
        
        return {impactScore, curatorScore, creatorScore, contributorScore, inviteScore, impactRank, curatorRank, creatorRank, contributorRank, inviteRank};
      } catch (error) {
        console.error("Error getting top curators:", error);
        return {impactScore: 0, curatorScore: 0, creatorScore: 0, contributorScore: 0, inviteScore: 0, impactRank: 0, curatorRank: 0, creatorRank: 0, contributorRank: 0, inviteRank: 0};
      }
    }


    async function get30dScore(fid) {
      try {
        await connectToDatabase();

        const score = await Score.findOne({ fid });
        let impactScore = formatScore(score?.impact_score_30d || 0)
        let curatorScore = formatScore(score?.curator_points_30d || 0)
        let creatorScore = formatScore(score?.creator_points_30d || 0)
        let contributorScore = formatScore(score?.contributor_points_30d || 0)
        let inviteScore = formatScore(0)

        const totalUsers = await Score.countDocuments();
        const impactCount = await Score.countDocuments({ impact_score_30d: { $gt: impactScore } }) + 1;
        let impactRank = (1 - (impactCount / totalUsers)) * 100;
        impactRank = Math.floor(impactRank * 10) / 10;

        const curatorCount = await Score.countDocuments({ curator_points_30d: { $gt: curatorScore } }) + 1;
        let curatorRank = (1 - (curatorCount / totalUsers)) * 100;
        curatorRank = Math.floor(curatorRank * 10) / 10;

        const creatorCount = await Score.countDocuments({ creator_points_30d: { $gt: creatorScore } }) + 1;
        let creatorRank = (1 - (creatorCount / totalUsers)) * 100;
        creatorRank = Math.floor(creatorRank * 10) / 10;

        const contributorCount = await Score.countDocuments({ contributor_points_30d: { $gt: contributorScore } }) + 1;
        let contributorRank = (1 - (contributorCount / totalUsers)) * 100;
        contributorRank = Math.floor(contributorRank * 10) / 10;
        
        let inviteRank = 0
        
        return {impactScore, curatorScore, creatorScore, contributorScore, inviteScore, impactRank, curatorRank, creatorRank, contributorRank, inviteRank};
      } catch (error) {
        console.error("Error getting top curators:", error);
        return {impactScore: 0, curatorScore: 0, creatorScore: 0, contributorScore: 0, inviteScore: 0, impactRank: 0, curatorRank: 0, creatorRank: 0, contributorRank: 0, inviteRank: 0};
      }
    }


    async function get7dScore(fid) {
      try {
        await connectToDatabase();

        const score = await Raffle.findOne({ fid });
        let impactScore = formatScore(score?.impact_score_7d || 0)
        let curatorScore = formatScore(score?.curator_points_7d || 0)
        let creatorScore = formatScore(score?.creator_points_7d || 0)
        let contributorScore = formatScore(score?.contributor_points_7d || 0)
        let inviteScore = formatScore(score?.promotion_points_7d || 0)

        const totalUsers = await Raffle.countDocuments();
        const impactCount = await Raffle.countDocuments({ impact_score_7d: { $gt: impactScore } }) + 1;
        let impactRank = (1 - (impactCount / totalUsers)) * 100;
        impactRank = Math.floor(impactRank * 10) / 10;

        const curatorCount = await Raffle.countDocuments({ curator_points_7d: { $gt: curatorScore } }) + 1;
        let curatorRank = (1 - (curatorCount / totalUsers)) * 100;
        curatorRank = Math.floor(curatorRank * 10) / 10;

        const creatorCount = await Raffle.countDocuments({ creator_points_7d: { $gt: creatorScore } }) + 1;
        let creatorRank = (1 - (creatorCount / totalUsers)) * 100;
        creatorRank = Math.floor(creatorRank * 10) / 10;

        const contributorCount = await Raffle.countDocuments({ contributor_points_7d: { $gt: contributorScore } }) + 1;
        let contributorRank = (1 - (contributorCount / totalUsers)) * 100;
        contributorRank = Math.floor(contributorRank * 10) / 10;
        

        const inviteCount = await Raffle.countDocuments({ promotion_points_7d: { $gt: inviteScore } }) + 1;
        let inviteRank = (1 - (inviteCount / totalUsers)) * 100;
        inviteRank = Math.floor(inviteRank * 10) / 10;
        
        return {impactScore, curatorScore, creatorScore, contributorScore, inviteScore, impactRank, curatorRank, creatorRank, contributorRank, inviteRank};
      } catch (error) {
        console.error("Error getting top curators:", error);
        return {impactScore: 0, curatorScore: 0, creatorScore: 0, contributorScore: 0, inviteScore: 0, impactRank: 0, curatorRank: 0, creatorRank: 0, contributorRank: 0, inviteRank: 0};
      }
    }


    async function get3dScore(fid) {
      try {
        await connectToDatabase();

        const score = await Raffle.findOne({ fid });
        let impactScore = formatScore(score?.impact_score_3d || 0)
        let curatorScore = formatScore(score?.curator_points_3d || 0)
        let creatorScore = formatScore(score?.creator_points_3d || 0)
        let contributorScore = formatScore(score?.contributor_points_3d || 0)
        let inviteScore = formatScore(0)

        const totalUsers = await Raffle.countDocuments();
        const impactCount = await Raffle.countDocuments({ impact_score_3d: { $gt: impactScore } }) + 1;
        let impactRank = (1 - (impactCount / totalUsers)) * 100;
        impactRank = Math.floor(impactRank * 10) / 10;

        const curatorCount = await Raffle.countDocuments({ curator_points_3d: { $gt: curatorScore } }) + 1;
        let curatorRank = (1 - (curatorCount / totalUsers)) * 100;
        curatorRank = Math.floor(curatorRank * 10) / 10;

        const creatorCount = await Raffle.countDocuments({ creator_points_3d: { $gt: creatorScore } }) + 1;
        let creatorRank = (1 - (creatorCount / totalUsers)) * 100;
        creatorRank = Math.floor(creatorRank * 10) / 10;

        const contributorCount = await Raffle.countDocuments({ contributor_points_3d: { $gt: contributorScore } }) + 1;
        let contributorRank = (1 - (contributorCount / totalUsers)) * 100;
        contributorRank = Math.floor(contributorRank * 10) / 10;
        
        const inviteCount = await Raffle.countDocuments({ contributor_points_3d: { $gt: contributorScore } }) + 1;
        let inviteRank = (1 - (inviteCount / totalUsers)) * 100;
        inviteRank = Math.floor(inviteRank * 10) / 10;
        
        return {impactScore, curatorScore, creatorScore, contributorScore, inviteScore, impactRank, curatorRank, creatorRank, contributorRank, inviteRank};
      } catch (error) {
        console.error("Error getting top curators:", error);
        return {impactScore: 0, curatorScore: 0, creatorScore: 0, contributorScore: 0, inviteScore: 0, impactRank: 0, curatorRank: 0, creatorRank: 0, contributorRank: 0, inviteRank: 0};
      }
    }


    async function get24hScore(fid) {
      try {
        await connectToDatabase();

        const score = await Raffle.findOne({ fid });
        let impactScore = formatScore(score?.impact_score_24h || 0)
        let curatorScore = formatScore(score?.curator_points_24h || 0)
        let creatorScore = formatScore(score?.creator_points_24h || 0)
        let contributorScore = formatScore(score?.contributor_points_24h || 0)
        let inviteScore = formatScore(0)

        const totalUsers = await Raffle.countDocuments();
        const impactCount = await Raffle.countDocuments({ impact_score_24h: { $gt: impactScore } }) + 1;
        let impactRank = (1 - (impactCount / totalUsers)) * 100;
        impactRank = Math.floor(impactRank * 10) / 10;

        const curatorCount = await Raffle.countDocuments({ curator_points_24h: { $gt: curatorScore } }) + 1;
        let curatorRank = (1 - (curatorCount / totalUsers)) * 100;
        curatorRank = Math.floor(curatorRank * 10) / 10;

        const creatorCount = await Raffle.countDocuments({ creator_points_24h: { $gt: creatorScore } }) + 1;
        let creatorRank = (1 - (creatorCount / totalUsers)) * 100;
        creatorRank = Math.floor(creatorRank * 10) / 10;

        const contributorCount = await Raffle.countDocuments({ contributor_points_24h: { $gt: contributorScore } }) + 1;
        let contributorRank = (1 - (contributorCount / totalUsers)) * 100;
        contributorRank = Math.floor(contributorRank * 10) / 10;
        
        const inviteCount = await Raffle.countDocuments({ contributor_points_24h: { $gt: contributorScore } }) + 1;
        let inviteRank = (1 - (inviteCount / totalUsers)) * 100;
        inviteRank = Math.floor(inviteRank * 10) / 10;
        
        return {impactScore, curatorScore, creatorScore, contributorScore, inviteScore, impactRank, curatorRank, creatorRank, contributorRank, inviteRank};
      } catch (error) {
        console.error("Error getting top curators:", error);
        return {impactScore: 0, curatorScore: 0, creatorScore: 0, contributorScore: 0, inviteScore: 0, impactRank: 0, curatorRank: 0, creatorRank: 0, contributorRank: 0, inviteRank: 0};
      }
    }


    try {
      let scoreData = null
      if (time == '30d') {
        scoreData = await get30dScore(fid)
      } else if (time == '7d') {
        scoreData = await get7dScore(fid)
      } else if (time == '3d') {
        scoreData = await get3dScore(fid)
      } else if (time == '24h') {
        scoreData = await get24hScore(fid)
      } else {
        scoreData = await getTotalScore(fid)
      }
  
      res.status(200).json({ scoreData });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}