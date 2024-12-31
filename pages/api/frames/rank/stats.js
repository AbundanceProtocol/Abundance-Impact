import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
import Tip from  "../../../../models/Tip";
import Cast from  "../../../../models/Cast";
import ImpactFrame from  "../../../../models/ImpactFrame";
// import Raffle from  "../../../../models/Raffle";
import Impact from  "../../../../models/Impact";
import Score from  "../../../../models/Score";
// import EcosystemRules from  "../../../../models/EcosystemRules";
// import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../../utils/utils";
import _ from "lodash";
import qs from "querystring";
import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)
  console.log('isValid:', isValid)
  const { eco, ecosystem, referrer } = req.query;
  const { untrustedData } = req.body
  // const authorFid = message?.data?.frameActionBody?.castId?.fid

  if (req.method !== 'POST' || !ecosystem || !eco) {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    async function getSigner(fid) {
      try {
        await connectToDatabase();
        const user = await User.findOne({ fid }).select('username pfp').exec();
        if (user) {
          return {
            username: user.username,
            user_pfp: user.pfp,
          };
        } else {
          return {username: null, user_pfp: null}
        }
      } catch (error) {
        console.error('Error getting User:', error)
        return { username: null, user_pfp: null };
      }
    }

    async function followingChannel(fid) {
      const channelOptions = {
        method: 'GET',
        headers: {accept: 'application/json'}
      };
      try {
        const channelData = await fetch(`https://api.warpcast.com/v1/user-channel?fid=${fid}&channelId=impact`, channelOptions);
        if (!channelData.ok) {
          return true
        } else {
          const channelInfo = await channelData.json();
          if (channelInfo && channelInfo?.result) {
            let following = channelInfo.result?.following
            if (!following) {
              return false
            } else {
              return true
            }
          }
        }
      } catch (error) {
        console.error(`Error getting follower info: `, error)
        return true
      }
    }

    async function getUserData(fid, time) {
      try {
        await connectToDatabase();
        // const oneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
        let curatorQuery = {};
        // let creatorQuery = {};
        let tipperQuery = {};
        curatorQuery.curator_fid = fid
        // creatorQuery.author_fid = fid
        // creatorQuery.points = '$IMPACT'
        tipperQuery.tipper_fid = fid
        tipperQuery.points = '$IMPACT'
    
        if (time) {
          curatorQuery.createdAt = { $gte: time }
          // creatorQuery.createdAt = { $gte: time }
          tipperQuery.createdAt = { $gte: time }
        }
        
        const curatorImpact = await Impact.aggregate([
          { $match: curatorQuery },
          {
            $group: {
              _id: "$curator_fid",
              target_cast_hashes: { $addToSet: "$target_cast_hash" },
            },
          },
        ]);
    
        const totalImpact = await Promise.all(curatorImpact.map(async (curator) => {
          const casts = await Cast.find({ cast_hash: { $in: curator.target_cast_hashes } });
          const totalPoints = casts.reduce((acc, cast) => acc + cast.impact_total, 0);
          return { fid: curator._id, totalImpact: totalPoints };
        }));
    
        
        //// CURATOR POINTS
        const curatorsWithImpact = await Impact.aggregate([
          { $match: curatorQuery },
          {
            $group: {
              _id: "$curator_fid",
              target_cast_hashes: { $addToSet: "$target_cast_hash" },
            },
          },
        ]);
    
        const curatorDataset = await Promise.all(curatorsWithImpact.map(async (curator) => {
          const casts = await Cast.find({ cast_hash: { $in: curator.target_cast_hashes } });
          const totalPoints = casts.reduce((acc, cast) => acc + cast.impact_total, 0);
          return { fid: curator._id, curator_points: totalPoints };
        }));
    
        curatorDataset.sort((a, b) => b.curator_points - a.curator_points);
        
    
        //// TIPPER POINTS
        const uniqueTippers = await Tip.aggregate([
          { $match: tipperQuery },
          { $unwind: "$tip" },
          { $match: { "tip.currency": { $regex: /^\$degen|\$tn100x$/i } } },
          { $group: {
            _id: {
              tipper_fid: "$tipper_fid",
              currency: "$tip.currency"
            }, 
            totalTips: { $sum: "$tip.amount" }
          }},
        ]);
    
        const tipperDataset = uniqueTippers.reduce((acc, tipper) => {
          const { _id: { tipper_fid, currency }, totalTips } = tipper;
          const existingTipper = acc.find(t => t.fid === tipper_fid);
          if (existingTipper) {
            if (currency === '$DEGEN') {
              existingTipper.degen_tip = totalTips;
            } else if (currency === '$TN100x') {
              existingTipper.ham_tip = totalTips;
            }
          } else {
            acc.push({
              fid: tipper_fid,
              degen_tip: currency === '$DEGEN' ? totalTips : 0,
              ham_tip: currency === '$TN100x' ? totalTips : 0,
            });
          }
          return acc;
        }, []).sort((a, b) => a.fid - b.fid);
    
    
    
        //// CREATOR POINTS
        // const uniqueAuthorsImpactTotal = await Cast.aggregate([
        //   { $match: creatorQuery },
        //   {
        //     $group: {
        //       _id: "$author_fid",
        //       creator_points: { $sum: "$impact_total" },
        //     },
        //   },
        //   {
        //     $sort: { creator_points: -1 },
        //   },
        // ]);
    
        // const creatorDataset = uniqueAuthorsImpactTotal.map(author => {
        //   return { fid: author._id, creator_points: author.creator_points };
        // });
    
    
    
        //// MERGE POINTS
        const tipperMap = Object.fromEntries(
          tipperDataset.map((entry) => [
            entry.fid,
            { degen_tip: entry.degen_tip, ham_tip: entry.ham_tip },
          ])
        );
      
        const curatorMap = Object.fromEntries(
          curatorDataset.map((entry) => [entry.fid, { curator_points: entry.curator_points }])
        );
      
        // const creatorMap = Object.fromEntries(
        //   creatorDataset.map((entry) => [entry.fid, { creator_points: entry.creator_points }])
        // );
      
        // Get the union of all fids
        const allFids = new Set([
          ...tipperDataset.map((entry) => entry.fid),
          ...curatorDataset.map((entry) => entry.fid),
          // ...creatorDataset.map((entry) => entry.fid),
        ]);
      
        // Merge datasets
        let mergedDataset = Array.from(allFids).map((fid) => ({
          fid,
          degen_tip: tipperMap[fid]?.degen_tip || 0,
          ham_tip: tipperMap[fid]?.ham_tip || 0,
          curator_points: curatorMap[fid]?.curator_points || 0,
          // creator_points: creatorMap[fid]?.creator_points || 0,
        }));
      
        mergedDataset = mergedDataset.filter(entry => 
          entry.degen_tip !== 0 || 
          entry.ham_tip !== 0 || 
          entry.curator_points !== 0
          //  || 
          // entry.creator_points !== 0
        );
    
    
    
        //// CALCULATE IMPACT SCORE
        mergedDataset.forEach(entry => {
          entry.impact_score = (10 * entry.curator_points + 5 * entry.degen_tip + entry.ham_tip) / 1000;
        });
    
        mergedDataset.sort((a, b) => b.impact_score - a.impact_score);
    
        
        // console.log('combinedDataset', mergedDataset)
    
    
        return mergedDataset;
      } catch (error) {
        console.error("Error getting curator total points:", error);
        return null;
      }
    
    
    }



    const points = eco || '$IMPACT'

    const fid = untrustedData?.fid
    // const fid = 9326
    const issueImg = `${baseURL}/images/issue.jpg`;
    let circlesImg = ''
    console.log('fid', eco, ecosystem, referrer, fid)
    const impactLink = `https://warpcast.com/abundance/0x43ddd672`

    const retryPost = `${baseURL}/api/frames/rank/stats?${qs.stringify({ eco, ecosystem, referrer })}`

    // const refreshPost = `${baseURL}/api/frames/tip/refresh?${qs.stringify({ time, curators, eco, ecosystem, time1: timeMinus3 })}`

    // const startPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem })}`

    const postUrl = `${baseURL}?${qs.stringify({ eco, referrer })}`
    
    let shareText = ``

    let shareUrl = ``

    let encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {

      const isFollowing = await followingChannel(fid)
      
      const {username, user_pfp} = await getSigner(fid)
  
      if (!username && !isFollowing) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Need to login app & follow /impact'
        });
        return;
      } else if (!username) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Need to login app'
        });
        return;
      } else if (!isFollowing) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ 
          message: 'Need to follow /impact'
        });
        return;
      } else if (username && isFollowing) {

        async function getUserStats(fid) {
          try {

            async function getTopCurators(creator_fid) {
              try {
                await connectToDatabase();
                let topCurators = await Impact.aggregate([
                  {
                    $match: {
                      creator_fid: creator_fid, points
                    },
                  },
                  {
                    $group: {
                      _id: "$curator_fid",
                      impact: { $sum: "$impact_points" },
                    },
                  },
                  {
                    $sort: { impact: -1 },
                  },
                  {
                    $limit: 5,
                  },
                ]);
        
                const curatorInfo = await User.aggregate([
                  {
                    $match: {
                      fid: { $in: topCurators.map(c => c._id.toString()) },
                    },
                  },
                  {
                    $group: {
                      _id: "$fid",
                      username: { $first: "$username" },
                      pfp: { $first: "$pfp" },
                    },
                  },
                ]);
        
                topCurators.forEach(curator => {
                  const curatorDetails = curatorInfo.find(info => info._id === curator._id.toString());
                  if (curatorDetails) {
                    curator.username = curatorDetails.username;
                    curator.pfp = curatorDetails.pfp;
                  }
                });
        
                topCurators.forEach(curator => {
                  delete curator._id;
                });
                console.log('topCurators', topCurators)
        
                return topCurators;
              } catch (error) {
                console.error("Error getting top curators:", error);
                return null;
              }
            }

            async function getTopTippers(creator_fid) {
              try {
                await connectToDatabase();
            
                let topTippers = await Tip.aggregate([
                  {
                    $match: {
                      receiver_fid: creator_fid,
                    },
                  },
                  { $unwind: "$tip" },
                  { $match: { "tip.currency": { $regex: /^\$degen/i } } },
                  { $group: {
                    _id: "$tipper_fid", 
                    degen: { $sum: "$tip.amount" }
                  }},
                  {
                    $sort: { degen: -1 },
                  },
                  {
                    $limit: 5,
                  },
                ]);
        
                const tipperInfo = await User.aggregate([
                  {
                    $match: {
                      fid: { $in: topTippers.map(c => c._id.toString()) },
                    },
                  },
                  {
                    $group: {
                      _id: "$fid",
                      username: { $first: "$username" },
                      pfp: { $first: "$pfp" },
                    },
                  },
                ]);
        
                topTippers.forEach(curator => {
                  const curatorDetails = tipperInfo.find(info => info._id === curator._id.toString());
                  if (curatorDetails) {
                    curator.username = curatorDetails.username;
                    curator.pfp = curatorDetails.pfp;
                  }
                });
        
                topTippers.forEach(tipper => {
                  delete tipper._id;
                });

                console.log('tipperInfo', topTippers)
        
        
                return topTippers;
              } catch (error) {
                console.error("Error getting top curators:", error);
                return null;
              }
            }

            async function getImpact(fid) {
              try {
                await connectToDatabase();
            
                const score = await Score.findOne({ fid });
                let impactScore = score?.impact_score_all || 0;

                const rank = await Score.countDocuments({ impact_score_all: { $gt: impactScore } }) + 1;
                const totalUsers = await Score.countDocuments();
                let impactRank = (1 - (rank / totalUsers)) * 100;
        
                impactScore = impactScore > 100 ? parseFloat(impactScore).toFixed(1) : parseFloat(impactScore).toFixed(2);
                impactRank = Math.floor(impactRank * 10) / 10;
                
                console.log('score', score?.impact_score_all, impactRank, impactScore)
                return {impactScore, impactRank};
              } catch (error) {
                console.error("Error getting top curators:", error);
                return {impactScore: 0, impactRank: 0};
              }
            }

            const threeDays = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

            const userdata_3d = await getUserData(fid, threeDays);
            const topCurators = await getTopCurators(fid)
            const topTippers = await getTopTippers(fid)
            const {impactScore, impactRank} = await getImpact(fid)

            const raffleScore = fid !== 9326 ? userdata_3d[0]?.impact_score || 0 : 0
            // const raffleScore = userdata_3d[0]?.impact_score || 0
            let raffleTickets = 0
            if (raffleScore >= 0.25 && fid !== 9326) {
              raffleTickets = Math.ceil(raffleScore)
            }

            return {
              topCurators,
              topTippers,
              impactScore,
              impactRank,
              raffleScore,
              raffleTickets
            }

          } catch (error) {
            console.error("Error getting stats:", error);
            return {
              topCurators: [],
              topTippers: [],
              impactScore: 0,
              impactRank: 0,
              raffleScore: 0,
              raffleTickets: 0
            }
          }
        }

        const {topCurators, topTippers, impactScore, impactRank, raffleScore, raffleTickets} = await getUserStats(fid)
        console.log('scores', impactScore, impactRank, raffleScore, raffleTickets)

        async function createRankFrame(fid, username, pfp, curator, contributor, points, impactScore, impactRank, raffleScore, raffleTickets) {
          try {
            await connectToDatabase();
            console.log('create rank', fid, username, pfp, curator, contributor, points, impactScore, impactRank, raffleScore, raffleTickets)
            let rankFrame = new ImpactFrame({
              fid, username, pfp, curator, contributor, points, impact_score_all: impactScore, impact_score_all_rank: impactRank, raffle_score: raffleScore, raffle_tickets: raffleTickets
            });
            console.log('rankFrame', rankFrame)
            await rankFrame.save();
            const objectIdString = rankFrame._id.toString();
            return objectIdString;
          } catch (error) {
            console.error("Error while fetching circles:", error);
            return null;
          }
        }

        const getFrameId = await createRankFrame(fid, username, user_pfp, topCurators, topTippers, points, impactScore, impactRank, raffleScore, raffleTickets)


        circlesImg = `${baseURL}/api/frames/rank/frame?${qs.stringify({ id: getFrameId })}`

        shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem || 'abundance'}/rank-v1?${qs.stringify({ referrer: fid, id: getFrameId, eco: points })}`


        shareText = `My 2024 /impact score is: ${impactScore}`
        let textFragment = ``
        if (topCurators && topCurators?.length > 0) {
          textFragment += `\n\nMY TOP CURATORS:`
          for (const curator of topCurators) {
            textFragment += `\n@${curator.username} - ${curator.impact}pts`
          }
        }

        if (topTippers && topTippers?.length > 0) {
          textFragment += `\n\nMY TOP SUPPORTERS:`
          for (const tipper of topTippers) {
            textFragment += `\n@${tipper.username} - ${tipper.degen} degen`
          }
        }

        shareText += textFragment + `\n\nCheck who supported your /impact this year 👇`
        // if (curators && fid == curators) {
        //   shareText = `I just multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders'} thru /impact by @abundance.\n\nSupport my nominees here:`
        // } else if (curators?.length > 0) {
        //   const curatorName = await getCurator(curators, points)
        //   if (curatorName) {
        //     shareText = `I just multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders'} thru /impact by @abundance.\n\nThese creators were curated by ${curatorName}. Support their nominees here:`
        //   } else {
        //     shareText = `I just multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders'} thru /impact by @abundance. Try it out here:`
        //   }
        // } else {
        //   shareText = `I just multi-tipped ${tippedCreators !== '' ? tippedCreators : 'creators & builders'} thru /impact by @abundance. Try it out here:`
        // }

        encodedShareText = encodeURIComponent(shareText)
      
        encodedShareUrl = encodeURIComponent(shareUrl); 
        shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`


        let metatags = `
        <meta name="fc:frame:button:1" content="Share">
        <meta name="fc:frame:button:1:action" content="link">
        <meta name="fc:frame:button:1:target" content="${shareLink}" />
        <meta name="fc:frame:button:2" content="What's /impact">
        <meta name="fc:frame:button:2:action" content="link">
        <meta name="fc:frame:button:2:target" content="${impactLink}" />
        <meta property="og:image" content="${circlesImg}">
        <meta name="fc:frame:image" content="${circlesImg}">
        <meta name="fc:frame:post_url" content="${postUrl}">`
  

        try {

          res.setHeader('Content-Type', 'text/html');
          res.status(200)
          .send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Tips | Impact App</title>
                <meta name="fc:frame" content="vNext">
                <meta property="og:title" content="Multi-Tip">
                <meta property="fc:frame:image:aspect_ratio" content="1:1" />
                ${metatags}
              </head>
              <body>
                <div>Tip frame</div>
              </body>
            </html>
          `);
          return;

        } catch (error) {
          console.log('Error sending tip:', error)
          console.log('f')

          let metatags = `
          <meta name="fc:frame:button:1" content="Retry">
          <meta name="fc:frame:button:1:action" content="post">
          <meta name="fc:frame:button:1:target" content="${retryPost}" />
          <meta property="og:image" content="${issueImg}">
          <meta name="fc:frame:image" content="${issueImg}">
          <meta name="fc:frame:post_url" content="${postUrl}">`
    
          res.setHeader('Content-Type', 'text/html');
          res.status(500).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Tips | Impact App</title>
                <meta name="fc:frame" content="vNext">
                <meta property="og:title" content="Multi-Tip">
                <meta property="fc:frame:image:aspect_ratio" content="1:1" />
                ${metatags}
              </head>
              <body>
                <div>Tip frame</div>
              </body>
            </html>
          `);
          return;
        }
      }
    } catch (error) {
      console.log(error, 'g')

      let metatags = `
      <meta name="fc:frame:button:1" content="Retry">
      <meta name="fc:frame:button:1:action" content="post">
      <meta name="fc:frame:button:1:target" content="${retryPost}" />
      <meta property="og:image" content="${issueImg}">
      <meta name="fc:frame:image" content="${issueImg}">
      <meta name="fc:frame:post_url" content="${postUrl}">`

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tips | Impact App</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Multi-Tip">
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;
    }
  }
}


