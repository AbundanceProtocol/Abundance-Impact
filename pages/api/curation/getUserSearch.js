import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import EcosystemRules from '../../../models/EcosystemRules';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    console.log('getUserSerach 7', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};



    async function getCuratorIds(fids) {
      try {
        await connectToDatabase();
        const impacts = await Impact.find({ curator_fid: { $in: fids }});
        const impactIds = impacts.map(impact => impact._id);
        return impactIds
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return null
      }   
    }

    let timeSort = null
    if (req?.query?.timeSort) {
      timeSort = Number(req?.query?.timeSort) || -1
    }

    let order = Number(req?.query?.order) || -1
    console.log('order', order)

    let sort = { impact_total: order, createdAt: -1 }
    if (timeSort) {
      sort = { createdAt: timeSort }
    }
    
    if (req?.query?.points) {
      query.points = req?.query?.points
    } else if (req?.query?.ecosystem) {

      async function getPoints(ecosystem) {
        try {
          await connectToDatabase();
          const eco = await EcosystemRules.findOne({ ecosystem_handle: ecosystem }).select('ecosystem_points_name').exec();
          console.log('eco', eco)
          return eco ? eco.ecosystem_points_name : '$IMPACT';
        } catch (error) {
          console.error('Error in getHash:', error);
          return '$IMPACT';
        }
      }

      query.points = await getPoints(req?.query?.ecosystem)
    }

    if (req?.query?.time) {
      query.createdAt = { $gte: req?.query?.time } ;
    }
    
    if (req?.query?.author_fid) {
      query.author_fid = { $in: req?.query?.author_fid } ;
    }

    if (req?.query?.author_username) {
      query.author_username = { $in: req?.query?.author_username } ;
    }

    if (req?.query['curators[]'] && req?.query['curators[]'].length > 0) {
      console.log('37', typeof req?.query['curators[]'])
      let curatorFids = null
      if (typeof req?.query['curators[]'] === 'string') {
        curatorFids = [parseInt(req?.query['curators[]'])];
        console.log('curatorFids', curatorFids)
      } else if (Array.isArray(req?.query['curators[]']) && req?.query['curators[]'].length > 0) {
        curatorFids = req.query['curators[]'].map(fid => parseInt(fid));
        console.log('curatorFids', curatorFids)
      }

      let impactIds
      if (curatorFids) {
        impactIds = await getCuratorIds(curatorFids)
      }
      if (impactIds) {
        query['impact_points'] = { $in: impactIds }
      }
    } else if (req?.query?.username) {
      let curatorFids = null

      async function getCuratorFid(username) {
        try {
          await connectToDatabase();
          const user = await User.findOne({ username }).select('fid').exec();
          console.log('user', user)
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
      }
      if (impactIds) {
        query['impact_points'] = { $in: impactIds }
      }
    }

    query.impact_total = { $gte: 1 }
    // if (req.query['tags[]'] && req.query['tags[]'].length > 0) {
    //   query.cast_tags = { $in: [req.query['tags[]']] };
    // }

    if (req?.query?.channels) {
      console.log('channels', req?.query?.channels)
      query.channel_id = { $in: req.query.channels }
    }

    if (req?.query?.channel) {
      console.log('channel', req?.query?.channel)
      query.channel_id = { $in: req.query.channel }
    }

    // if (req.query['channel[]'] && req.query['channel[]'].length > 0) {

    //   if (typeof req.query['channel[]'] === 'string') {
    //     query.channel_id = { $in: [req.query['channel[]']]};
    //   } else if (Array.isArray(req.query['channel[]']) && req.query['channel[]'].length > 0) {
    //     query.channel_id = { $in: req.query['channel[]']};
    //   }


    //   // query.cast_channel = { $in: [req.query['channel[]']] };
    // }

    // if (req.query.text) {
    //   query.cast_text = { $regex: req.query.text, $options: 'i' }; // Case-insensitive search
    // }

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
        return { casts: returnedCasts, totalCount };
      } catch (err) {
        console.error(err);
        return null;
      }
    }
    const { casts, totalCount } = await fetchCasts(query, req.query.shuffle === 'true', page, limit, order);
    // console.log('casts 157', casts)
    res.status(200).json({
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      per_page: limit,
      casts: casts,
      message: 'User selection fetched successfully'
    });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
