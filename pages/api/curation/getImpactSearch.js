import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import EcosystemRules from '../../../models/EcosystemRules';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    console.log('getUserSerach 7', req.query);
    console.log('tags parameter:', req.query.tags, typeof req.query.tags);
    const page = parseInt(req?.query?.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};



    async function getCuratorIds(fids) {
      // console.log('getCuratorIds', fids)
      try {
        await connectToDatabase();
        
        // Ensure fids is an array and not empty
        if (!fids || !Array.isArray(fids) || fids.length === 0) {
          // console.log('Invalid or empty fids array, returning empty result');
          return [];
        }
        
        const impacts = await Impact.find({ curator_fid: { $in: fids }});
        const impactIds = impacts.map(impact => impact._id);
        return impactIds
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return []
      }
    }

    let timeSort = null
    if (req?.query?.timeSort) {
      timeSort = Number(req?.query?.timeSort) || -1
    }

    let order = Number(req?.query?.order) || -1
    // console.log('order', order)

    let sort = { impact_total: order, createdAt: -1 }
    if (timeSort) {
      sort = { createdAt: timeSort }
    }
    
    // if (req?.query?.points) {
    //   query.points = req?.query?.points
    // } else if (req?.query?.ecosystem) {

    //   async function getPoints(ecosystem) {
    //     try {
    //       await connectToDatabase();
    //       const eco = await EcosystemRules.findOne({ ecosystem_handle: ecosystem }).select('ecosystem_points_name').exec();
    //       console.log('eco', eco)
    //       return eco ? eco.ecosystem_points_name : '$IMPACT';
    //     } catch (error) {
    //       console.error('Error in getHash:', error);
    //       return '$IMPACT';
    //     }
    //   }

    //   query.points = await getPoints(req?.query?.ecosystem)
    // }

    if (req?.query?.time) {
      // Convert the time string to a proper Date object
      const timeDate = new Date(req?.query?.time);
      if (!isNaN(timeDate.getTime())) {
        query.createdAt = { $gte: timeDate };
      } else {
        // console.log('Invalid time format:', req?.query?.time);
      }
    }
    
    if (req?.query?.author_fid) {
      query.author_fid = { $in: req?.query?.author_fid } ;
    }

    if (req?.query?.author_username) {
      query.author_username = { $in: req?.query?.author_username } ;
    }

    if (req?.query['curators[]'] && req?.query['curators[]'].length > 0) {
      // console.log('37', typeof req?.query['curators[]'])
      let curatorFids = null
      if (typeof req?.query['curators[]'] === 'string') {
        curatorFids = [parseInt(req?.query['curators[]'])];
        // console.log('curatorFids', curatorFids)
      } else if (Array.isArray(req?.query['curators[]']) && req?.query['curators[]'].length > 0) {
        curatorFids = req.query['curators[]'].map(fid => parseInt(fid));
        // console.log('curatorFids', curatorFids)
      }

      let impactIds
      if (curatorFids) {
        impactIds = await getCuratorIds(curatorFids)
        // console.log('impactIds from getCuratorIds:', impactIds)
      }
      if (impactIds && impactIds.length > 0) {
        query['impact_points'] = { $in: impactIds }
        // console.log('Added impact_points to query:', query['impact_points'])
      } else {
        // console.log('No impactIds found, skipping impact_points query')
      }
    } else if (req?.query?.username) {
      let curatorFids = null

      async function getCuratorFid(username) {
        try {
          await connectToDatabase();
          const user = await User.findOne({ username }).select('fid').exec();
          // console.log('user', user)
          return user ? parseInt(user.fid) : 9326;
        } catch (error) {
          console.error('Error in getHash:', error);
          return 9326;
        }
      }
      let curatorFid = 9326
      curatorFid = await getCuratorFid(req?.query?.username)
      curatorFids = [curatorFid]
      let impactIds
      if (curatorFids) {
        impactIds = await getCuratorIds(curatorFids)
        // console.log('impactIds from getCuratorIds (username):', impactIds)
      }
      if (impactIds && impactIds.length > 0) {
        query['impact_points'] = { $in: impactIds }
        // console.log('Added impact_points to query (username):', query['impact_points'])
      } else {
        // console.log('No impactIds found, skipping impact_points query (username)')
      }
    }

    query.impact_total = { $gte: 1 }
    
    // Handle tags filtering
    let tags = [];
    
    // Check for direct tags parameter
    if (req?.query?.tags) {
      if (typeof req.query.tags === 'string') {
        tags = [req.query.tags];
      } else if (Array.isArray(req.query.tags)) {
        tags = req.query.tags;
      }
    }
    
    // Check for indexed tags parameters (tags[0], tags[1], etc.)
    Object.keys(req.query).forEach(key => {
      if (key.match(/^tags\[\d+\]$/)) {
        tags.push(req.query[key]);
      }
    });
    
    // console.log('Processed tags:', tags, 'Length:', tags.length);
    
    if (tags?.length > 0) {
      // console.log('Setting tags query with:', tags);
      // Use $elemMatch since cast_tags is an array of objects
      query.cast_tags = { $elemMatch: { tag: { $in: tags } } };
    }
    
    // console.log('Final query before aggregation:', JSON.stringify(query, null, 2));

    if (req?.query?.channels && req?.query?.channels !== ' ') {
      // console.log('channels', req?.query?.channels)
      const channels = Array.isArray(req.query.channels) ? req.query.channels : [req.query.channels];
      if (channels.length > 0) {
        query.channel_id = { $in: channels }
      }
    }

    if (req?.query?.channel && req?.query?.channel !== ' ') {
      // console.log('channel', req?.query?.channel)
      const channel = Array.isArray(req.query.channel) ? req.query.channel : [req.query.channel];
      if (channel.length > 0) {
        query.channel_id = { $in: channel }
      }
    }

    if (req?.query?.hash && req?.query?.hash !== '') {
      if (req?.query?.override && (req?.query?.override == '1' || req?.query?.override == 1)) {
        query = { cast_hash: req?.query?.hash }
      }
      query.cast_hash = req?.query?.hash
    }


    // if (req.query['channel[]'] && req.query['channel[]'].length > 0) {

    //   if (typeof req.query['channel[]'] === 'string') {
    //     query.channel_id = { $in: [req.query['channel[]']]};
    //   } else if (Array.isArray(req.query['channel[]']) && req.query['channel[]'].length > 0) {
    //     query.channel_id = { $in: req.query['channel[]']};
    //   }


    //   // query.cast_channel = { $in: [req.query['channel[]']] };
    // }

    // Handle text search
    if (req?.query?.text && req.query.text.trim() !== '') {
      const searchText = req.query.text.trim();
      // console.log('Setting text search for:', searchText);
      query.cast_text = { $regex: searchText, $options: 'i' }; // Case-insensitive search
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    async function fetchCasts(query, shuffle, page, limit, order) {
      try {
        await connectToDatabase();
    
        let totalCount;
        let returnedCasts = []

        let creators = await Cast.aggregate([
          { 
            $match: { 
              ...query, 
              wallet: { $exists: true, $ne: '' } 
            }
          },
          { 
            $group: {
              _id: "$author_fid",
              impact_sum: { $sum: { $ifNull: ["$impact_total", 0] } },
              wallet: { $first: "$wallet" },
              author_pfp: { $first: "$author_pfp" },
              author_username: { $first: "$author_username" },
            }
          },
          { 
            $project: {
              author_fid: "$_id",
              impact_sum: 1,
              wallet: 1,
              author_pfp: 1,
              author_username: 1,
              type: 'creator',
              _id: 0
            }
          },
          { $sort: { impact_sum: order } },
          { $limit: 200 },
        ]);

        const totalImpactSum = creators.reduce((acc, item) => acc + (item.impact_sum || 0), 0);

        creators.forEach(item => {
          if (totalImpactSum > 0) {
            item.impact_sum = (item.impact_sum / totalImpactSum) * 0.9;
          } else {
            item.impact_sum = 0;
          }
        });

        const castHashes = await Cast.find({
          ...query,
          wallet: { $exists: true, $ne: '' }
        }).select('cast_hash -_id');

        const castHashList = castHashes.map(c => c.cast_hash);

        // Ensure castHashList is an array and not empty for $in operator
        if (!castHashList || castHashList.length === 0) {
          // console.log('No cast hashes found, returning empty results');
          return { casts: [], totalCount: 0, combinedImpact: [] };
        }

        const impactAggregation = await Impact.aggregate([
          { $match: { target_cast_hash: { $in: castHashList } } },
          {
            $group: {
              _id: "$curator_fid",
              impact_sum: { $sum: { $ifNull: ["$impact_points", 0] } }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        const curatorFids = impactAggregation.map(item => item._id);

        const users = await User.find({ fid: { $in: curatorFids } }).select('fid pfp username wallet -_id').lean();

        const userMap = {};
        users.forEach(user => {
          userMap[Number(user.fid)] = user;
        });

        let impactCuratorDataset = impactAggregation.map(item => {
          const user = userMap[item._id];
          return {
            author_fid: item._id,
            author_pfp: user ? user.pfp : null,
            author_username: user ? user.username : null,
            impact_sum: item.impact_sum,
            wallet: user ? user.wallet : null,
            type: 'curator'
          };
        });

        const totalCuratorImpactSum = impactCuratorDataset.reduce((acc, item) => acc + (item.impact_sum || 0), 0);

        impactCuratorDataset.forEach(item => {
          if (totalCuratorImpactSum > 0) {
            item.impact_sum = (item.impact_sum / totalCuratorImpactSum) * 0.1;
          } else {
            item.impact_sum = 0;
          }
        });

        const resultMap = {};
        creators.forEach(item => {
          resultMap[item.author_fid] = { ...item };
        });

        const combinedFids = new Set();

        let combinedImpact = creators.map(item => {
          const curatorItem = impactCuratorDataset.find(curator => curator.author_fid === item.author_fid);
          if (curatorItem) {
            combinedFids.add(item.author_fid);
            return {
              ...item,
              impact_sum: (item.impact_sum || 0) + (curatorItem.impact_sum || 0)
            };
          } else {
            return { ...item };
          }
        });


        impactCuratorDataset.forEach(curatorItem => {
          if (!resultMap[curatorItem.author_fid]) {
            combinedImpact.push({ ...curatorItem });
          }
        });

        const combinedTotal = combinedImpact.reduce((acc, item) => acc + (item.impact_sum || 0), 0);


        if (combinedTotal > 1) {
          combinedImpact = combinedImpact.map(item => ({
            ...item,
            impact_sum: (item.impact_sum || 0) / combinedTotal
          }));
        }




        if (!shuffle) {
          totalCount = await Cast.countDocuments(query);
          returnedCasts = await Cast.find(query)
            .sort(sort)
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
            .sort(sort)
            .populate('impact_points')
            .limit(top20PercentCount)
            .exec();
          const middle40PercentCasts = await Cast.find(query)
            .sort(sort)
            .populate('impact_points')
            .skip(top20PercentCount)
            .limit(middle40PercentCount)
            .exec();
          const bottom40PercentCasts = await Cast.find(query)
            .sort(sort)
            .populate('impact_points')
            .skip(top20PercentCount + middle40PercentCount)
            .limit(bottom40PercentCount)
            .exec();
    
          returnedCasts = top20PercentCasts.concat(middle40PercentCasts, bottom40PercentCasts);

          if (timeSort) {
            if (timeSort == -1) {
              returnedCasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else {
              returnedCasts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            }
          } else {
            if (order == -1) {
              returnedCasts.sort((a, b) => b.impact_total - a.impact_total);
            } else {
              returnedCasts.sort((a, b) => a.impact_total - b.impact_total);
            }
          }

    
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
        return { casts: returnedCasts, totalCount, combinedImpact };
      } catch (err) {
        console.error(err);
        return { casts: [], totalCount: 0, combinedImpact: [] };
      }
    }

    let setShuffle = false
    if (req?.query?.shuffle === 'true') {
      setShuffle = true
    }
    const fetchResult = await fetchCasts(query, setShuffle, page, limit, order);
    
    if (!fetchResult) {
      return res.status(500).json({ 
        error: 'Failed to fetch casts',
        casts: [],
        total: 0,
        combinedImpact: []
      });
    }
    
    const { casts, totalCount, combinedImpact } = fetchResult;
    // console.log('casts 157', casts)
    res.status(200).json({
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      per_page: limit,
      casts: casts,
      combinedImpact: combinedImpact,
      message: 'User selection fetched successfully'
    });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
