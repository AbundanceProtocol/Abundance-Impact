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


    
    
    if (req?.query?.points) {
      console.log('points', req?.query?.points)
      query.points = req?.query?.points
    }
    

    

    if (req?.query?.time) {
      console.log('time', req?.query?.time)
      query.createdAt = { $gte: req?.query?.time } ;
    }

    


    if (req?.query['curators[]'] && req?.query['curators[]'].length > 0) {
      console.log('37', req?.query['curators[]'])
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

    if (req?.query?.channels && req?.query?.channels !== ' ') {
      console.log('channel', req?.query?.channels)
      query.channel_id = { $in: req.query.channels }
    }




    async function fetchCasts(query) {
      try {
        await connectToDatabase();
        const totalCount = await Cast.countDocuments(query);
    
        return totalCount
      } catch (err) {
        console.error(err);
        return 0;
      }
    }
    const totalCount = await fetchCasts(query);
    console.log('totalCount', totalCount)
    res.status(200).json({ docs: totalCount,
      message: 'User selection fetched successfully'
    });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
