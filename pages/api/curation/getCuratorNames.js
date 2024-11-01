import connectToDatabase from '../../../libs/mongodb';
// import Tip from '../../../models/Tip';
import Impact from '../../../models/Impact';
// import Quality from '../../../models/Quality';
import User from '../../../models/User';
// import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { points } = req.query
  if (req.method !== 'GET' || !points) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    async function getCuratorsByImpact(points) {
      try {
        await connectToDatabase();
        const uniqueFids = await Impact.aggregate([
          { $match: { points: points, impact_points: { $gte: 1 } } },
          { $group: { _id: "$curator_fid" } },
          { $project: { _id: 0, curator_fid: "$_id" } }
        ]);
        return uniqueFids.map(item => item.curator_fid);
      } catch (error) {
        console.error('Error in getTopCurators:', error);
        return [];
      }
    }

    async function getEcoCurators(points) {
      try {
        const uniqueFids = await getCuratorsByImpact(points)

        const curatorDetails = await User.find(
          { fid: { $in: uniqueFids } },
          'fid username'
        ).lean().then(users => 
          users.reduce((acc, user) => {
            if (!acc.some(item => item.fid === user.fid)) {
              acc.push({
                value: user.username,
                label: '@' + user.username,
                fid: user.fid
              });
            }
            return acc;
          }, [])
        ).then(curators => 
          curators.sort((a, b) => a.value.localeCompare(b.value))
        );

        const filteredCuratorDetails = curatorDetails.filter(curator => curator !== null);

        filteredCuratorDetails.sort((a, b) => a.value.localeCompare(b.value));

        return filteredCuratorDetails;
      } catch (error) {
        console.error('Error in getTopCurators:', error);
        return [];
      }
    }

    try {
      const curators = await getEcoCurators(points)
      // console.log(curators)
      res.status(200).json({ curators });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
