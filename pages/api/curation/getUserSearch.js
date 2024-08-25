import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';

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
        const impacts = await Impact.find({ curator_fid: { $in: fids } });
        const impactIds = impacts.map(impact => impact._id);
        return impactIds
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return null
      }   
    }

    if (req.query.points) {
      query.points = req.query.points
    }

    if (req.query.time) {
      query.createdAt = { $gte: req.query.time } ;
    }
    
    if (req.query['curator[]'] && req.query['curator[]'].length > 0) {
      console.log('37', typeof req.query['curator[]'])
      let curatorFids
      if (typeof req.query['curator[]'] === 'string') {
        curatorFids = [parseInt(req.query['curator[]'])];
      } else if (Array.isArray(req.query['curator[]']) && req.query['curator[]'].length > 0) {
          curatorFids = req.query['curator[]'].map(fid => parseInt(fid));
      }

      let impactIds
      if (curatorFids) {
        impactIds = await getCuratorIds(curatorFids)
      }
      if (impactIds) {
        query['impact_points'] = { $in: impactIds }
      }
    }

    // if (req.query['tags[]'] && req.query['tags[]'].length > 0) {
    //   query.cast_tags = { $in: [req.query['tags[]']] };
    // }

    if (req.query['channel[]'] && req.query['channel[]'].length > 0) {

      if (typeof req.query['channel[]'] === 'string') {
        query.cast_channel = { $in: [req.query['channel[]']]};
      } else if (Array.isArray(req.query['channel[]']) && req.query['channel[]'].length > 0) {
        query.cast_channel = { $in: req.query['channel[]']};
      }


      // query.cast_channel = { $in: [req.query['channel[]']] };
    }

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
    const { casts, totalCount } = await fetchCasts(query, req.query.shuffle === 'true', page, limit);
    console.log('casts 157', casts)
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
