import connectToDatabase from "../../libs/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  const { fid, username } = req.query;

  if (req.method !== 'GET' || (!fid && !username)) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    try {

      // console.log('p1',fid)
      async function getUser(query) {
        try {
          await connectToDatabase();
          const user = await User.findOne(query).select('fid pfp username display_name').exec();
          if (user) {
            const userProfile = {
              username: user?.username,
              pfp: {
                url: user?.pfp,
              },
              displayName: user?.display_name,
              activeOnFcNetwork: true,
              profile: { bio: { text: "" } },
              followingCount: 0,
              followerCount: 0,
              fid: Number(user?.fid)
            }
            return userProfile;
          } else {
            return null;
          }
        } catch (error) {
          console.error('Error:', error);
          return null;
        }
      }

      let query = {}
      if (fid) {
        query = { fid: fid }
      } else if (username) {
        query = { username: username }
      }
      const user = await getUser(query)

      res.status(200).json({ user });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}