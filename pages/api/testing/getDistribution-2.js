// import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
// import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
// import Quality from '../../../models/Quality';
// import Score from '../../../models/Score';
// import Circle from '../../../models/Circle';
// import Raffle from '../../../models/Raffle';
import User from '../../../models/User';
import Fund from '../../../models/Fund';
import CreatorFund from '../../../models/CreatorFund';
// import ScheduleTip from '../../../models/ScheduleTip';
// import Tip from '../../../models/Tip';
// import EcosystemRules from '../../../models/EcosystemRules';
// import { getTimeRange, processTips, populateCast } from '../../../utils/utils';
// import { x1Testnet } from 'viem/chains';
// import { init, fetchQuery } from "@airstack/node";
import { createObjectCsvWriter } from 'csv-writer';
// import path from 'path'
// import fs from 'fs';

const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY
const baseApi = process.env.BASE_API
const baseApiKey = process.env.BASE_API_KEY

export default async function handler(req, res) {
  // const { fid, page = 1 } = req.query
  const { page = 1 } = req.query

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {
    try {

      
      // console.log('fid', fid)


      //// GET TOP PROMOTERS

      async function getDistribution() {
        try {
          await connectToDatabase()

          let totalCreators = 0
          let totalEcoCreators = 0

          const funds = await Fund.aggregate([
            {
              $match: {
                // fid,
                valid: true
              }
            },
            {
              $group: {
                _id: "$curator_fid",
                degen_total: { $sum: "$creator_degen_amount" },
                ham_total: { $sum: "$creator_ham_amount" },
                fid: { $first: "$fid" }
              }
            },
            {
              $project: {
                _id: "$fid",
                curators: "$_id",
                degen_total: 1,
                ham_total: 1
              }
            },
            {
              $sort: { _id: 1 }
            }
          ]);


          console.log('funds', funds)
          let finalCreatorDataset = []
          let finalCuratorDataset = []

          for (const set of funds) {


            let ratio = 1



            if (set?.curators?.length > 0) {
              
              let curators = set?.curators

              for (const curator of curators) {
                if (curator !== funds[0]?._id) {
                  ratio = 0.9
                }
              }

              if (ratio == 0.9) {
                set?.degen_total
                // console.log('set?.degen_total', set?.degen_total)
                // console.log('set?.ham_total', set?.ham_total)
                let curatorSet = []
                for (const curator of curators) {
                  // console.log('curator', curator)
                  if (curator !== funds[0]?._id) {
                    const total_points = await Impact.aggregate([
                      {
                        $match: {
                          curator_fid: curator,
                          points: '$IMPACT'
                        }
                      },
                      {
                        $group: {
                          _id: null,
                          total_points: { $sum: "$impact_points" },
                        }
                      }
                    ])
                    const curatorTotals = total_points[0]?.total_points || 0

                    // console.log('curatorTotals 1', curatorTotals)
                    let curatorData = {
                      fid: curator, 
                      points: curatorTotals, 
                      degen: 0, 
                      ham: 0
                    }
                    curatorSet.push(curatorData)
                  } else {
                    // console.log('curator 2', curator)

                  }
                }


                let totalPoints = 0
                for (const curator of curatorSet) {
                  totalPoints += curator?.points
                }
                if (curatorSet?.length > 0 && totalPoints > 0) {
                  for (let curator of curatorSet) {
                    let degen = Math.floor(set?.degen_total * 0.1 * curator?.points / totalPoints * 100) / 100
                    let ham = Math.floor(set?.ham_total * 0.1 * curator?.points / totalPoints * 100) / 100
                    curator.degen = degen
                    curator.ham = ham
                  }
                }


                for (const curator of curatorSet) {

                  const index = finalCuratorDataset.findIndex(object => object.fid === curator?.fid);
                  // console.log('index', index)
                  if (index !== -1) {
                    // finalCuratorDataset[index].points += curator?.points
                    finalCuratorDataset[index].degen += Math.floor(curator?.degen * 100) / 100
                    finalCuratorDataset[index].ham += Math.floor(curator?.ham * 100) / 100
                  } else {
                    let newCurator = {fid: curator?.fid, points: curator?.points || 0, degen: curator?.degen || 0, ham: curator?.ham || 0}
                    finalCuratorDataset.push(newCurator)
                  }
                }


                for (let curator of finalCuratorDataset) {
                  curator.degen = Math.floor(curator.degen * 100) / 100
                  curator.ham = Math.floor(curator.ham * 100) / 100
                }


              }

              // console.log('curators', set?.curators)

              let uniqueTargetCastHashes = await Impact.distinct('target_cast_hash', { curator_fid: { $in: curators }, impact_points: { $gt: 0 } });



              const creator_points = await Cast.aggregate([
                {
                  $match: {
                    cast_hash: { $in: uniqueTargetCastHashes },
                    author_fid: { "$nin": [funds[0]?._id] },
                    points: '$IMPACT',
                    impact_total: { $gt: 0 }
                  }
                },
                {
                  $group: {
                    _id: {
                      author_fid: "$author_fid",
                      // author_pfp: "$author_pfp",
                      // wallet: "$wallet",
                      // author_username: "$author_username"
                    },
                    total_points: { $sum: "$impact_total" },
                  }
                },
                {
                  $sort: { total_points: -1 }
                },
                // {
                //   $skip: (page - 1) * 10
                // },



                // {
                //   $limit: 20
                // }
              ])



              const total_creators = await Cast.aggregate([
                {
                  $match: {
                    cast_hash: { $in: uniqueTargetCastHashes },
                    author_fid: { "$nin": [funds[0]?._id] },
                    points: '$IMPACT',
                    impact_total: { $gt: 0 }
                  }
                },
                {
                  $group: {
                    _id: "$author_fid",
                    total_points: { $sum: "$impact_total" },
                  }
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 }
                  }
                }
              ])

              totalCreators = total_creators[0]?.count || 0

              // console.log('creator_points', creator_points)


              const total_points = await Cast.aggregate([
                {
                  $match: {
                    cast_hash: { $in: uniqueTargetCastHashes },
                    author_fid: { "$nin": [funds[0]?._id] },
                    points: '$IMPACT',
                    impact_total: { $gt: 0 }
                  }
                },
                {
                  $group: {
                    _id: null,
                    total_points: { $sum: "$impact_total" },
                  }
                }
              ])

              // console.log('total_points', total_points[0]?.total_points)

              const pointsTotal = total_points[0]?.total_points || 0



              let creatorList = []


              for (const creator of creator_points) {

                let degenFunding = Math.floor(creator?.total_points / pointsTotal * set?.degen_total * ratio * 100) / 100

                let hamFunding = Math.floor(creator?.total_points / pointsTotal * set?.ham_total * ratio * 100) / 100

                let creatorDataset = {
                  fid: creator?._id?.author_fid, 
                  // pfp: creator?._id?.author_pfp, 
                  // wallet: creator?._id?.wallet, 
                  // username: creator?._id?.author_username, 
                  points: creator?.total_points, 
                  degen: degenFunding, 
                  ham: hamFunding
                }

                creatorList.push(creatorDataset)

              }


              for (const creator of creatorList) {

                const index = finalCreatorDataset.findIndex(object => object.fid === creator?.fid);
                // console.log('index', index)
                if (index !== -1) {
                  // finalCreatorDataset[index].points += creator?.points
                  finalCreatorDataset[index].degen += creator?.degen
                  finalCreatorDataset[index].ham += creator?.ham
                } else {
                  let newCreator = {
                    fid: creator?.fid, 
                    // pfp: creator?.pfp, 
                    // wallet: creator?.wallet, 
                    // username: creator?.username, 
                    points: creator?.points || 0, 
                    degen: creator?.degen || 0, 
                    ham: creator?.ham || 0
                  }
                  finalCreatorDataset.push(newCreator)
                }



              }


            } else if (set?.degen_total > 0 || set?.ham_total > 0) {


              console.log('totals', set?.degen_total, set?.ham_total)

              // const distinctCuratorFids = await Impact.distinct('curator_fid', { points: '$IMPACT' });
              // console.log('Distinct Curator FIDs:', distinctCuratorFids);
              let curatorSet = []

              const totalImpactPoints = await Impact.aggregate([
                {
                  $match: {
                    points: '$IMPACT'
                  }
                },
                {
                  $group: {
                    _id: null,
                    total_points: { $sum: "$impact_points" },
                  }
                }
              ])

              let curatorPoints = totalImpactPoints[0]?.total_points || 0
              console.log('totalImpactPoints', totalImpactPoints)


              const curatorImpact = await Impact.aggregate([
                {
                  $match: {
                    points: '$IMPACT'
                  }
                },
                {
                  $group: {
                    _id: "$curator_fid",
                    impact_points: { $sum: "$impact_points" }
                  }
                },
                {
                  $sort: { impact_points: -1 }
                },


                // {
                //   $limit: 20
                // }
              ]);

              // console.log('curatorImpact', curatorImpact)

              let impactCounter = 0

              for (const points of curatorImpact) {
                impactCounter += points.impact_points
              }

              for (const curator of curatorImpact) {
                let degenFunding = Math.floor(curator?.impact_points / curatorPoints * set?.degen_total * 0.1 * 100) / 100

                let hamFunding = Math.floor(curator?.impact_points / curatorPoints * set?.ham_total * 0.1 * 100) / 100

                let newCurator = {
                  fid: curator?._id, 
                  points: curator?.impact_points || 0, 
                  degen: degenFunding || 0, 
                  ham: hamFunding || 0
                }
                curatorSet.push(newCurator)                  
              }


              for (const curator of curatorSet) {

                const index = finalCuratorDataset.findIndex(object => object.fid === curator?.fid);
                // console.log('index', index)
                if (index !== -1) {
                  // finalCuratorDataset[index].points += curator?.points
                  finalCuratorDataset[index].degen += Math.floor(curator?.degen * 100) / 100
                  finalCuratorDataset[index].ham += Math.floor(curator?.ham * 100) / 100
                } else {
                  let newCurator = {
                    fid: curator?.fid, 
                    points: curator?.points || 0, 
                    degen: curator?.degen || 0, 
                    ham: curator?.ham || 0
                  }
                  finalCuratorDataset.push(newCurator)
                }
              }







              // console.log('impactCounter', impactCounter)









              const creator_points = await Cast.aggregate([
                {
                  $match: {
                    // cast_hash: { $in: uniqueTargetCastHashes },
                    // author_fid: { "$nin": [funds[0]?._id] },
                    points: '$IMPACT',
                    impact_total: { $gt: 0 }
                  }
                },
                {
                  $group: {
                    _id: {
                      author_fid: "$author_fid",
                      // author_pfp: "$author_pfp",
                      // wallet: "$wallet",
                      // author_username: "$author_username"
                    },
                    total_points: { $sum: "$impact_total" },
                  }
                },
                {
                  $sort: { total_points: -1 }
                },
                // {
                //   $skip: (page - 1) * 10
                // },


                // {
                //   $limit: 20
                // }
              ])



              const total_creators = await Cast.aggregate([
                {
                  $match: {
                    points: '$IMPACT',
                    impact_total: { $gt: 0 }
                  }
                },
                {
                  $group: {
                    _id: "$author_fid",
                    total_points: { $sum: "$impact_total" },
                  }
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 }
                  }
                }
              ])

              totalEcoCreators = total_creators[0]?.count || 0

              // console.log('creator_points', creator_points)


              const total_points = await Cast.aggregate([
                {
                  $match: {
                    // cast_hash: { $in: uniqueTargetCastHashes },
                    // author_fid: { "$nin": [funds[0]?._id] },
                    points: '$IMPACT',
                    impact_total: { $gt: 0 }
                  }
                },
                {
                  $group: {
                    _id: null,
                    total_points: { $sum: "$impact_total" },
                  }
                }
              ])

              // console.log('total_points', total_points[0]?.total_points)

              const pointsTotal = total_points[0]?.total_points || 0



              let creatorList = []


              for (const creator of creator_points) {

                let degenFunding = Math.floor(creator?.total_points / pointsTotal * set?.degen_total * 0.9 * 100) / 100

                let hamFunding = Math.floor(creator?.total_points / pointsTotal * set?.ham_total * 0.9 * 100) / 100

                let creatorDataset = {
                  fid: creator?._id?.author_fid, 
                  // pfp: creator?._id?.author_pfp, 
                  // wallet: creator?._id?.wallet, 
                  // username: creator?._id?.author_username, 
                  points: creator?.total_points, 
                  degen: degenFunding, 
                  ham: hamFunding
                }

                creatorList.push(creatorDataset)

              }


              for (const creator of creatorList) {

                const index = finalCreatorDataset.findIndex(object => object.fid === creator?.fid);
                // console.log('index', index)
                if (index !== -1) {
                  // finalCreatorDataset[index].points += creator?.points
                  finalCreatorDataset[index].degen += creator?.degen
                  finalCreatorDataset[index].ham += creator?.ham
                } else {
                  let newCreator = {
                    fid: creator?.fid, 
                    // pfp: creator?.pfp, 
                    // wallet: creator?.wallet, 
                    // username: creator?.username, 
                    points: creator?.points || 0, 
                    degen: creator?.degen || 0, 
                    ham: creator?.ham || 0
                  }
                  finalCreatorDataset.push(newCreator)
                }

              }

            }
          }

          // console.log('finalCreatorDataset', finalCreatorDataset)


          finalCreatorDataset.sort((a, b) => {
            if (b.degen - a.degen === 0) {
              return b.ham - a.ham;
            }
            return b.degen - a.degen;
          });

          // if (finalCreatorDataset.length > 20) {
          //   finalCreatorDataset = finalCreatorDataset.slice(0, 20);
          // }

          // for (let creator of finalCreatorDataset) {
          //   creator.degen = Math.floor(creator.degen * 100) / 100
          //   creator.ham = Math.floor(creator.ham * 100) / 100
          // }

          for (let curator of finalCuratorDataset) {
            // await connectToDatabase()
            const user = await User.findOne({fid: curator?.fid.toString()}).select('wallet username pfp fid');
            // .select('username wallet pfp fid');
            // console.log('user', user)
            if (user) {
              curator.username = user.username;
              curator.pfp = user.pfp;
              curator.wallet = user.wallet;
            }
          }





          for (const curator of finalCuratorDataset) {

            const index = finalCreatorDataset.findIndex(object => object.fid === curator?.fid);
            // console.log('index', index)
            if (index !== -1) {
              // finalCreatorDataset[index].points += creator?.points
              finalCreatorDataset[index].degen += curator?.degen
              finalCreatorDataset[index].ham += curator?.ham
            } else {
              let newCreator = {
                fid: curator?.fid, 
                // pfp: curator?.pfp, 
                // wallet: curator?.wallet, 
                // username: curator?.username, 
                points: curator?.points || 0, 
                degen: curator?.degen || 0, 
                ham: curator?.ham || 0
              }
              finalCreatorDataset.push(newCreator)
            }

          }


          for (let creator of finalCreatorDataset) {
            creator.degen = Math.floor(creator.degen * 100) / 100
            creator.ham = Math.floor(creator.ham * 100) / 100
          }



          const updateOptions = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          };
    
          for (const creator of finalCreatorDataset) {
        
            const update = {
              $set: {
                impact_points: creator?.points || 0,
                // username: creator?.username,
                // pfp: creator?.pfp,
                // wallet: creator?.wallet || null,
                // points: '$IMPACT',
                ham: creator?.ham || 0,
                degen: creator?.degen || 0,
                season: 1
              },
            };
    
            try {
              const updatedDoc = await CreatorFund.findOneAndUpdate({ fid: creator?.fid }, update, updateOptions);
              // console.log(`Score document for fid ${userFid} updated:`, updatedDoc);
            } catch (error) {
              console.error(`Error updating CreatorFund document for fid ${creator?.fid}:`, error);
            }
          }



          async function getMissingData() {
            try {
              await connectToDatabase()
    
              let incompleteUsers = await CreatorFund.find({ $or: [{ pfp: null }, { username: null }, { wallet: null }] })
    
              return incompleteUsers
            } catch (error) {
              console.error('Error in getMissingData:', error);
              return []
            }
          }

          const missingData = await getMissingData()


          async function updatedUser(fid) {
            try {
              await connectToDatabase()
              let username = null
              let pfp = null
              let wallet = null

              let incompleteUsers = await User.findOne({ fid: fid.toString() }).select('pfp username wallet').exec()
              if (!incompleteUsers) {
                incompleteUsers = await Cast.findOne({ author_fid: Number(fid) }).select('author_pfp author_username wallet').exec()
                username = incompleteUsers?.author_username
                pfp = incompleteUsers?.author_pfp
                wallet = incompleteUsers?.wallet
              } else {
                username = incompleteUsers?.username
                pfp = incompleteUsers?.pfp
                wallet = incompleteUsers?.wallet
              }

              return {username, pfp, wallet}
            } catch (error) {
              console.error('Error in updatedUser:', error);
              return {username: null, pfp: null, wallet: null}
            }
          }


          for (let user of missingData) {
            let {username, pfp, wallet} = await updatedUser(user?.fid)
        
            const update = {
              $set: {
                username: username || null,
                pfp: pfp || null,
                wallet: wallet || null,
              },
            };
    
            const updatedDoc = await CreatorFund.findOneAndUpdate({ fid: user?.fid }, update, updateOptions);
          }

















          return {funds: funds, creatorDataset: finalCreatorDataset, curatorDataset: finalCuratorDataset, totalCreators: totalCreators || 0, totalEcoCreators: totalEcoCreators || 0}

        } catch (error) {
          console.error('Error:', error);
          // return {userFunds: [], dailyFunds: [], devFunds: 0};
          return {funds: [], creatorDataset: [], curatorDataset: [], totalCreators: 0, totalEcoCreators: 0}
        }
      }
      

      const {funds, creatorDataset, curatorDataset, totalCreators, totalEcoCreators} = await getDistribution()

      res.status(200).json({funds, creatorDataset, curatorDataset, totalCreators, totalEcoCreators, message: 'done' });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
