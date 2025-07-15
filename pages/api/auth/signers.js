export default async function handler(req, res) {
  const { message, signature } = req.query;
  if (!message || !signature) {
    return res.status(400).json({ error: 'Message and signature are required' });
  }
  try {
    const response = await fetch(`https://api.neynar.com/v2/auth/signers?message=${encodeURIComponent(message)}&signature=${signature}`, {
      headers: { 'api_key': process.env.NEYNAR_API_KEY }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signers' });
  }
} 