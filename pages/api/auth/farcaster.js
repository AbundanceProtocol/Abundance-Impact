import { verifySignInMessage } from '@farcaster/auth-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { message, signature } = req.body;

  try {
    // 1. Verify Farcaster sign-in
    const result = await verifySignInMessage(message, signature);
    const fid = result.fid; // Farcaster user ID

    // 2. Use Neynar API to fetch signers for this user
    const neynarRes = await fetch(
      `https://api.neynar.com/v2/farcaster/user/signers?fid=${fid}`,
      { headers: { 'api_key': process.env.NEYNAR_API_KEY } }
    );
    const neynarData = await neynarRes.json();

    // 3. Get the signer UUID (if exists)
    const signerUuid = neynarData.signers?.[0]?.signer_uuid || null;

    // 4. Return combined info
    res.status(200).json({
      fid,
      signerUuid,
      user: result,
      neynarSigners: neynarData.signers,
    });
  } catch (e) {
    res.status(401).json({ error: 'Invalid Farcaster sign-in' });
  }
} 