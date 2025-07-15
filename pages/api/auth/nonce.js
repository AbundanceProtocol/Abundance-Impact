export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.neynar.com/v2/auth/nonce', {
      headers: { 'api_key': process.env.NEYNAR_API_KEY }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nonce' });
  }
} 