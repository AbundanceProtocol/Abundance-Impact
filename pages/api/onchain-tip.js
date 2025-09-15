import connectToDatabase from '../../libs/mongodb';
import OnchainTip from '../../models/OnchainTip';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    console.log('📝 API received payload:', req.body);
    console.log('🔍 Fund field in API:', {
      fund: req.body.fund,
      fundType: typeof req.body.fund,
      fundPercent: req.body.fundPercent
    });
    console.log('🌐 Network field in API:', {
      network: req.body.network,
      networkType: typeof req.body.network,
      defaultNetwork: req.body.network || 'base'
    });

    const {
      tipper_fid,
      tipper_pfp,
      tipper_username,
      fund,
      network,
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
      fund,
      network: network || 'base', // Default to 'base' if network not provided
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


