// pages/api/user/validate.js
import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { fid } = req.query;
  if (!fid) return res.status(400).json({ valid: false, error: 'Missing fid' });

  await connectToDatabase();
  const userExists = await User.findOne({ fid: fid.toString(), ecosystem_points: '$IMPACT' }).select('_id');
  res.status(200).json({ valid: !!userExists });
}