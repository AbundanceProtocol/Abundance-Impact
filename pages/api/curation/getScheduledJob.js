import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';
import { getTimeRange } from '../../../utils/utils';

const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { fid, encryptedUuid } = req.query

  if (!(req.method === 'GET') || !fid || !encryptedUuid) {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {

    console.log('20', fid, encryptedUuid)

    async function getSchedule(uuid) {
      try {
        await connectToDatabase();
        const schedule = await ScheduleTip.findOne({ uuid }).exec();
        if (schedule) {
          const decryptedUuid = decryptPassword(uuid, secretKey);
          return {
            shuffle: schedule.search_shuffle,
            timeRange: schedule.search_time,
            tags: schedule.search_tags,
            channels: schedule.search_channels,
            curators: schedule.search_curators,
            percent: schedule.percent_tip,
            decryptedUuid: decryptedUuid
          }
        } else {
          return null
        }
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    }
  
    const { shuffle, timeRange, tags, channels, curators, percent, decryptedUuid } = await getSchedule(encryptedUuid)
    console.log('47', shuffle, timeRange, tags, channels, curators, percent)

    if (!percent || !decryptedUuid) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {

      let time = null
      if (timeRange) {
        time = getTimeRange(timeRange)
      }

      async function getAllowance(fid) {
        try {
          const remainingBase = "https://www.degentip.me/";
          const remainingUrl = `${remainingBase}api/get_allowance?fid=${fid}`;
          const remainingBalance = await fetch(remainingUrl, {
            headers: {
              accept: "application/json",
            },
          });
          const getRemaining = await remainingBalance.json()
          let remaining
    
          if (getRemaining) {
            remaining = getRemaining.allowance.remaining_allowance
            return remaining
          } else {
            return null
          }
        } catch (error) {
          console.error('Error handling GET request:', error);
          return null
        }
      }
    
      const tipAllowance = await getAllowance(fid)
      console.log('83', tipAllowance)

      if (!tipAllowance) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {

        async function getUserSearch(time, tags, channel, curator, shuffle) {
      
          const page = 1;
          const limit = 5;
          const skip = (page - 1) * limit;
      
          let query = {};
              
          async function getCuratorIds(fids) {
            try {
              await connectToDatabase();
              const impacts = await Impact.find({ curator_fid: { $in: fids } });
              const impactIds = impacts.map(impact => impact._id);
              return impactIds
            } catch (error) {
              console.error("Error while fetching casts:", error);
              return null
            }   
          }
            
          if (time) {
            query.createdAt = { $gte: time } ;
          }
          
          if (curator && curator.length > 0) {
            let curatorFids
            curatorFids = curator.map(fid => parseInt(fid));
      
            let impactIds
            if (curatorFids) {
              impactIds = await getCuratorIds(curatorFids)
            }
            if (impactIds) {
              query['impact_points'] = { $in: impactIds }
            }
          }
            
          // if (tags && tags.length > 0) {
          //   query.cast_tags = { $in: [tags] };
          // }
      
          // if (channel && channel.length > 0) {
          //   query.cast_channel = { $in: [channel] };
          // }
      
          // if (text) {
          //   query.cast_text = { $regex: text, $options: 'i' }; // Case-insensitive search
          // }
            
          function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
          }
      
          async function fetchCasts(query, shuffle, page, limit) {
            try {
              await connectToDatabase();
          
              let totalCount;
              let returnedCasts = []
          
              if (!shuffle) {
                totalCount = await Cast.countDocuments(query);
                returnedCasts = await Cast.find(query)
                  .sort({ impact_total: -1 })
                  .populate('impact_points')
                  .skip((page - 1) * limit)
                  .limit(limit)
                  .exec();
                // console.log('63', returnedCasts)
              } else {
      
                totalCount = await Cast.countDocuments(query);
          
                // Calculate the number of documents to be sampled from each range
                const top20PercentCount = Math.ceil(totalCount * 0.2);
                const middle40PercentCount = Math.ceil(totalCount * 0.4);
                const bottom40PercentCount = totalCount - top20PercentCount - middle40PercentCount;
          
                // Fetch documents from each range
                const top20PercentCasts = await Cast.find(query)
                  .sort({ impact_total: -1 })
                  .populate('impact_points')
                  .limit(top20PercentCount)
                  .exec();
                const middle40PercentCasts = await Cast.find(query)
                  .sort({ impact_total: -1 })
                  .populate('impact_points')
                  .skip(top20PercentCount)
                  .limit(middle40PercentCount)
                  .exec();
                const bottom40PercentCasts = await Cast.find(query)
                  .sort({ impact_total: -1 })
                  .populate('impact_points')
                  .skip(top20PercentCount + middle40PercentCount)
                  .limit(bottom40PercentCount)
                  .exec();
          
                returnedCasts = top20PercentCasts.concat(middle40PercentCasts, bottom40PercentCasts);
          
                returnedCasts.sort((a, b) => b.impact_total - a.impact_total);
          
                returnedCasts = returnedCasts.reduce((acc, current) => {
                  const existingItem = acc.find(item => item._id === current._id);
                  if (!existingItem) {
                    acc.push(current);
                  }
                  return acc;
                }, [])
      
                returnedCasts = shuffleArray(returnedCasts);
          
                returnedCasts = returnedCasts.slice(0, limit);
              }
          
              if (returnedCasts && returnedCasts.length > 10) {
                returnedCasts = returnedCasts.slice(0, 10);
              }
          
              // console.log('113', returnedCasts)
              if (!returnedCasts) {
                returnedCasts = []
              }
              return { casts: returnedCasts, totalCount };
            } catch (err) {
              console.error(err);
              return null;
            }
          }
          
          const { casts, totalCount } = await fetchCasts(query, shuffle === 'true');
          console.log('223', casts, totalCount)

          return { casts, totalCount }
        }  
      
        const { casts, totalCount } = await getUserSearch(time, tags, channels, curators, shuffle)
      
      
        async function determineDistribution(ulfilteredCasts, tip, fid) {
          console.log('232', ulfilteredCasts, tip, fid)
          function filterObjects(castArray, filterFid) {
            console.log('234', castArray, filterFid)

            return castArray.filter(obj => {
              if (obj.author.fid != filterFid) {
                obj.impact_points = obj.impact_points.filter(point => point.curator_fid != filterFid);
                return true; 
              }
              return false;
            });
          }
        
          let casts = filterObjects(ulfilteredCasts, fid);
          console.log('244', casts)

          const totalBalanceImpact = casts.reduce((total, obj) => {
            return total + obj.impact_balance - obj.quality_balance;
          }, 0);
      
          let newDistribution = []
          let newCurators = []
          if (casts && tip) {
            casts.forEach(cast => {
              let ratio = 1
              if (cast.impact_points && cast.impact_points.length > 0) {
                ratio =  0.92
              }
              let castTip = Math.floor((cast.impact_balance  - cast.quality_balance) / totalBalanceImpact * ratio * tip)
              // console.log(castTip)
              let castDistribution = null
              castDistribution = {
                fid: cast.author.fid,
                cast: cast.hash,
                tip: castTip,
                coin: '$degen'
              }
              newDistribution.push(castDistribution)
              const curators = cast.impact_points
              // console.log(curators)
              curators.forEach(curator => {
                // console.log(newCurators)
                let points = curator.impact_points
                // console.log(curator.impact_points)
                let curatorTip = Math.floor(curator.impact_points / totalBalanceImpact * 0.08 * tip)
                let curatorDistribution = null
                curatorDistribution = {
                  fid: curator.curator_fid,
                  cast: 'temp',
                  points: points,
                  // tip: curatorTip,
                  coin: '$degen'
                }
                newCurators.push(curatorDistribution)
              })
            })
      
            const tempCasts = newCurators.filter(obj => obj.cast === 'temp');
            console.log('288', tempCasts)

            tempCasts.sort((a, b) => a.fid - b.fid);
        
            // Combine objects with the same fid by adding up the tip
            const combinedCasts = tempCasts.reduce((acc, curr) => {
              const existingCast = acc.find(obj => obj.fid === curr.fid);
              if (existingCast) {
                existingCast.points += curr.points;
              } else {
                acc.push(curr);
              }
              return acc;
            }, []);
        
            let tipDistribution = {curators: combinedCasts, creators: newDistribution, totalPoints: totalBalanceImpact, totalTip: Math.round(tip)}
      
            let fidSet = []
        
            const curatorList = tipDistribution.curators
            if (curatorList && curatorList.length > 0) {
              curatorList.forEach(curator => {
                fidSet.push(curator.fid)
              })
            }
            console.log('313', curatorList)

      
            let returnedCurators = []
            if (fidSet.length > 0) {
        
              let userFids = fidSet.join(',')
      
              async function getCurators(curators) {
                try {
                  await connectToDatabase();
                  const users = await User.find({ fid: { $in: curators } }).select('fid set_cast_hash').exec();
                  if (users) {
                    return users;
                  } else {
                    return null
                  }
                } catch (error) {
                  console.error('Error:', error);
                  return null;
                }
              }
        
              returnedCurators = await getCurators(userFids)
            }
      
            const lookupTable = returnedCurators.reduce((acc, obj) => {
              acc[obj.fid] = obj;
              return acc;
            }, {});
      
            const creatorData = tipDistribution.creators
      
            let curatorData
            if (curatorList.legnth > 0) {
              curatorData = curatorList.map(obj => {
                const matchingObj = lookupTable[obj.fid];
                if (matchingObj) {
                  return {
                    fid: obj.fid,
                    cast: matchingObj.set_cast_hash,
                    coin: obj.coin,
                    tip: Math.floor(obj.points / tipDistribution.totalPoints * tipDistribution.totalTip * 0.08)
                  };
                } else {
                  return null;
                }
              }).filter(obj => obj !== null);
            }
      
            let combinedLists = [...new Set([...creatorData, ...curatorData])];
            console.log('364', combinedLists)

            combinedLists.forEach(cast => {
              cast.text = `${cast.tip} ${cast.coin} via /impact`
            })
      
      
            async function postMultipleTips(signer, fid, data) {
      
              if (!signer || !fid || !data || !Array.isArray(data)) {
                return null
              }
            
              const base = "https://api.neynar.com/";
              const url = `${base}v2/farcaster/cast`;
              let tipCounter = 0;
              for (const cast of data) {
                const castText = cast.text;
                const parentUrl = cast.cast;
                let body = {
                  signer_uuid: signer,
                  text: castText,
                };
          
                if (parentUrl) {
                  body.parent = parentUrl;
                }
          
                try {
                  if (cast.tip >= 1) {
                    const response = await fetch(url, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'api_key': apiKey,
                      },
                      body: JSON.stringify(body),
                    });
            
                    if (!response.ok) {
                      console.error(`Failed to send request for ${castText}`);
                    } else {
                      console.log(`Request sent successfully for ${castText}`);
                    }
      
                    await Tip.create({
                      receiver_fid: cast.fid,
                      tipper_fid: fid,
                      cast_hash: cast.cast,
                      tip: [{
                        currency: cast.coin,
                        amount: cast.tip
                      }],
                    });
                    tipCounter += Number(cast.tip)
                  }
      
                } catch (error) {
                  console.error(`Error occurred while sending request for ${castText}:`, error);
                }
          
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              return tipCounter
            }

            console.log('430', fid, combinedLists)

            const confirmCasts = await postMultipleTips(decryptedUuid, fid, combinedLists)
            console.log('433', confirmCasts)

            if (confirmCasts) {
              return true
            } else {
              return null
            }
          } else {
            return null
          }
        }
      
        const tip = tipAllowance * percent

        console.log('447', casts, tip, fid)
        const tipped = await determineDistribution(casts, tip, fid)
        console.log('449', tipped)

        if (!tipped) {
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'Task scheduled successfully.' });
        }
      }
    }
  }
}