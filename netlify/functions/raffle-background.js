// import { decryptPassword } from '../../utils/utils';
import connectToDatabase from '../../libs/mongodb';
// import ScheduleTip from '../../models/ScheduleTip';
import Cast from '../../models/Cast';
import Impact from '../../models/Impact';
import Quality from '../../models/Quality';
import Raffle from '../../models/Raffle';
// import User from '../../models/User';
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
      const threeDays = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const oneDay = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

      const uniqueCuratorFids = await Impact.distinct('curator_fid', { createdAt: { $gte: oneWeek } });

      const uniqueQualityFids = await Quality.distinct('curator_fid', { createdAt: { $gte: oneWeek } });

      const uniqueTipperFids = await Tip.distinct('tipper_fid', { createdAt: { $gte: oneWeek } });

      const mergedFids = [...new Set([...uniqueCuratorFids, ...uniqueQualityFids, ...uniqueTipperFids])];


      const updateOptions = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };

      for (const userFid of mergedFids) {

        const userdata_7d = await getUserData(userFid, oneWeek);
        const userdata_3d = await getUserData(userFid, threeDays);
        const userdata_24h = await getUserData(userFid, oneDay);

        const update = {
          $set: {
            points: '$IMPACT', 
            degen_tip_7d: userdata_7d[0]?.degen_tip || 0,
            ham_tip_7d: userdata_7d[0]?.ham_tip || 0,
            curator_points_7d: userdata_7d[0]?.curator_points || 0,
            impact_score_7d: userdata_7d[0]?.impact_score || 0,
            degen_tip_3d: userdata_3d[0]?.degen_tip || 0,
            ham_tip_3d: userdata_3d[0]?.ham_tip || 0,
            curator_points_3d: userdata_3d[0]?.curator_points || 0,
            impact_score_3d: userdata_3d[0]?.impact_score || 0,
            degen_tip_24h: userdata_24h[0]?.degen_tip || 0,
            ham_tip_24h: userdata_24h[0]?.ham_tip || 0,
            curator_points_24h: userdata_24h[0]?.curator_points || 0,
            impact_score_24h: userdata_24h[0]?.impact_score || 0,
          }
        }

        try {
          const updatedDoc = await Raffle.findOneAndUpdate({ fid: userFid }, update, updateOptions);
          // console.log(`Raffle document for fid ${userFid} updated:`, updatedDoc);
        } catch (error) {
          console.error(`Error updating Raffle document for fid ${userFid}:`, error);
        }
      }
      
      
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

