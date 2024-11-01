import connectToDatabase from "../../libs/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  const { fid, username, pfp, displayName } = req.body;
  if (req.method !== 'POST' || !fid) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function updateUser(fid, username, pfp, displayName) {
      try {
        await connectToDatabase();
        const users = await User.find({ fid: fid.toString() });
        if (users.length > 0) {
          for (const user of users) {
            user.username = username;
            user.display_name = displayName; 
            user.pfp = pfp;
            await user.save();
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    }

    try {
      const updatedUser = await updateUser(fid, username, pfp, displayName);
      res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
      console.error('Error sending requests:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
