import connectToDatabase from '../../libs/mongodb';
import OnchainTip from '../../models/OnchainTip';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const {
      tipper_fid,
      tipper_pfp,
      tipper_username,
      tip,
      receiver,
      transaction_hash,
    } = req.body || {};

    if (!transaction_hash) {
      return res.status(400).json({ error: 'transaction_hash is required' });
    }

    const doc = await OnchainTip.create({
      tipper_fid,
      tipper_pfp,
      tipper_username,
      tip,
      receiver,
      transaction_hash,
    });

    return res.status(200).json({ success: true, id: doc._id });
  } catch (e) {
    console.error('onchain-tip api error:', e);
    return res.status(500).json({ error: 'Failed to create OnchainTip' });
  }
}


