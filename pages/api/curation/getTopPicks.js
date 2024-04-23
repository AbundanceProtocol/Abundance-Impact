import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
const apiKey = process.env.NEYNAR_API_KEY


export default async function handler(req, res) {

  if (req.method === 'GET') {

    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    async function fetchCasts() {
      
      try {
        await connectToDatabase();

        const totalCount = await Cast.countDocuments({});

        let returnedCasts = await Cast.find({})
          .sort({ impact_total: -1 })
          .skip(skip)
          .limit(limit)
          .exec();

        return { casts: returnedCasts, totalCount }
      } catch (err) {
        console.error(err);
        return null
      }
    }

    const { casts, totalCount } = await fetchCasts();

    res.status(200).json({
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      per_page: limit,
      casts: casts,
      message: 'Top picks fetched successfully'
    });

  // res.status(200).json({ casts, message: 'Top picks fetched successfully' });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}