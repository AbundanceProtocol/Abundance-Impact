// import { decryptPassword } from '../../utils/utils';
import connectToDatabase from '../../libs/mongodb';
// import ScheduleTip from '../../models/ScheduleTip';
import Cast from '../../models/Cast';
import Fund from '../../models/Fund';
import Impact from '../../models/Impact';
import Quality from '../../models/Quality';
import Raffle from '../../models/Raffle';
import User from '../../models/User';
import Tip from '../../models/Tip';
// import EcosystemRules from '../../models/EcosystemRules';
// import { getTimeRange, processTips, populateCast } from '../../utils/utils';

// const secretKey = process.env.SECRET_KEY;
// const secretCode = process.env.SECRET_CODE;
// const apiKey = process.env.NEYNAR_API_KEY;

exports.handler = async function(event, context) {


  async function updateRaffleScores() {

    try {
      await connectToDatabase()

      const oneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeks = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      let uniqueNewUsers = await User.distinct('fid', { invited_by: { "$ne": null }, createdAt: { $gte: twoWeeks } });

      uniqueNewUsers = uniqueNewUsers.map(Number);

      const uniqueCuratorFids = await Impact.distinct('curator_fid', { createdAt: { $gte: oneWeek } });

      const uniqueAutoFundFids = await Fund.distinct('fid', { createdAt: { $gte: oneWeek } });

      const uniqueQualityFids = await Quality.distinct('curator_fid', { createdAt: { $gte: oneWeek } });

      const uniqueTipperFids = await Tip.distinct('tipper_fid', { createdAt: { $gte: oneWeek } });

      const mergedFids = [...new Set([...uniqueCuratorFids, ...uniqueQualityFids, ...uniqueTipperFids, ...uniqueAutoFundFids])];



      async function updateUsers(userFid) {

        const updateOptions = {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        };

        const userdata_7d = await getUserData(userFid, '7d');
        const userdata_3d = await getUserData(userFid, '3d');
        const userdata_24h = await getUserData(userFid, '24h');

        const update = {
          $set: {
            points: '$IMPACT', 
            degen_tip_7d: userdata_7d[0]?.degen_tip || 0,
            ham_tip_7d: userdata_7d[0]?.ham_tip || 0,
            curator_points_7d: userdata_7d[0]?.curator_points || 0,
            contributor_points_7d: userdata_7d[0]?.contributor_score || 0,
            promotion_points_7d: userdata_7d[0]?.promoter_points || 0,
            impact_score_7d: userdata_7d[0]?.impact_score || 0,
            degen_tip_3d: userdata_3d[0]?.degen_tip || 0,
            ham_tip_3d: userdata_3d[0]?.ham_tip || 0,
            curator_points_3d: userdata_3d[0]?.curator_points || 0,
            contributor_points_3d: userdata_3d[0]?.contributor_score || 0,
            promotion_points_3d: userdata_3d[0]?.promoter_points || 0,
            impact_score_3d: userdata_3d[0]?.impact_score || 0,
            degen_tip_24h: userdata_24h[0]?.degen_tip || 0,
            ham_tip_24h: userdata_24h[0]?.ham_tip || 0,
            curator_points_24h: userdata_24h[0]?.curator_points || 0,
            contributor_points_24h: userdata_24h[0]?.contributor_score || 0,
            promotion_points_24h: userdata_24h[0]?.promoter_points || 0,
            impact_score_24h: userdata_24h[0]?.impact_score || 0,
          }
        }

        try {
          const updatedDoc = await Raffle.findOneAndUpdate({ fid: userFid }, update, updateOptions);
          return updatedDoc
        } catch (error) {
          console.error(`Error updating Raffle document for fid ${userFid}:`, error);
          return null
        }
      }

      let counter = 0
      let error = 0
      for (const userFid of uniqueNewUsers) {
        const doc = await updateUsers(userFid)
        if (doc) {
          counter++
        } else {
          error++
        }
      }

      console.log('counter', counter, error)
      for (const userFid of mergedFids) {
        const doc = await updateUsers(userFid)
        if (doc) {
          counter++
        } else {
          error++
        }
      }
      console.log('counter', counter, error)
      
      return mergedFids
    } catch (error) {
      console.error('Error handling GET request:', error);
      return null
    }


  }

  const mergedFids = await updateRaffleScores();

  console.log('mergedFids', mergedFids);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `mergedFids: ${mergedFids}` })
  };

};


async function getUserData(fid, time) {
  try {
    await connectToDatabase();
    // const oneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
    const oneDay = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

    const oneDayShift = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysShift = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const oneWeekShift = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

    const oneDayFrame = { $gte: oneDayShift, $lte: oneDay }
    const threeDaysFrame = { $gte: threeDaysShift, $lte: oneDay }
    const oneWeekFrame = { $gte: oneWeekShift, $lte: oneDay }
    
    let promotionScore = "$impact_score_24h"
    let setTime = null
    if (time == '24h') {
      setTime = oneDayFrame
      promotionScore = "$impact_score_24h"
    } else if (time == '3d') {
      setTime = threeDaysFrame
      promotionScore = "$impact_score_3d"
    } else if (time == '7d') {
      setTime = oneWeekFrame
      promotionScore = "$impact_score_7d"
    }

    const oneMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let curatorQuery = {};
    // let creatorQuery = {};
    let tipperQuery = {};
    let fundQuery = {};
    curatorQuery.curator_fid = fid
    // creatorQuery.author_fid = fid
    // creatorQuery.points = '$IMPACT'
    tipperQuery.tipper_fid = fid
    tipperQuery.points = '$IMPACT'
    fundQuery.fid = fid
    fundQuery.valid = true

    if (setTime) {
      curatorQuery.createdAt = setTime
      // creatorQuery.createdAt = { $gte: time }
      tipperQuery.createdAt = setTime
      fundQuery.createdAt = setTime
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


    let fundData = await Fund.aggregate([
      { $match: fundQuery },
      {
        $group: {
          _id: "$fid",
          degen_tip: { $sum: "$degen_amount" },
          ham_tip: { $sum: "$degen_amount" },
        },
      },
    ]);

    fundData = fundData.map(data => {
      data.fid = data._id;
      delete data._id;
      return data;
    });


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

    let mergedTipperDataset = tipperDataset.map(tipper => {
      const fund = fundData.find(f => f.fid === tipper.fid);
      return {
        fid: tipper.fid,
        degen_tip: tipper.degen_tip + (fund ? fund.degen_tip : 0),
        ham_tip: tipper.ham_tip + (fund ? fund.ham_tip : 0),
      };
    });

    fundData.forEach(fund => {
      if (!tipperDataset.some(tipper => tipper.fid === fund.fid)) {
        mergedTipperDataset.push({
          fid: fund.fid,
          degen_tip: fund.degen_tip,
          ham_tip: fund.ham_tip,
        });
      }
    });


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


    //// PROMOTER POINTS
    let invitedUsers = await User.distinct('fid', { invited_by: fid, createdAt: { $gte: oneMonth } });

    invitedUsers = invitedUsers.map(Number);


    const totalImpactScore = await Raffle.aggregate([
      { $match: { fid: { $in: invitedUsers } } },
      { $group: { _id: null, totalImpactScore: { $sum: { "$cond": { if: { $gt: [promotionScore, 0] }, then: promotionScore, else: 0 } } } } }
    ]);

    const totalImpactScoreValue = totalImpactScore.length > 0 ? totalImpactScore[0].totalImpactScore : 0;



    //// MERGE POINTS
    const tipperMap = Object.fromEntries(
      mergedTipperDataset.map((entry) => [
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
      ...mergedTipperDataset.map((entry) => entry.fid),
      ...curatorDataset.map((entry) => entry.fid),
      // ...creatorDataset.map((entry) => entry.fid),
    ]);
  
    // Merge datasets
    let mergedDataset = Array.from(allFids).map((fid) => ({
      fid,
      degen_tip: tipperMap[fid]?.degen_tip || 0,
      ham_tip: tipperMap[fid]?.ham_tip || 0,
      curator_points: curatorMap[fid]?.curator_points || 0,
      promoter_points: totalImpactScoreValue || 0,
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
      entry.impact_score = (10 * entry.curator_points + 5 * entry.degen_tip + entry.ham_tip) / 1000 + (entry.promoter_points / 2);
      entry.contributor_score = (5 * entry.degen_tip + entry.ham_tip) / 1000 || 0
    });

    mergedDataset.sort((a, b) => b.impact_score - a.impact_score);

    
    // console.log('combinedDataset', mergedDataset)


    return mergedDataset;
  } catch (error) {
    console.error("Error getting curator total points:", error);
    return null;
  }


}

