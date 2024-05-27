export default async function handler(req, res) {
  const { fid } = req.query;

  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    try {
      // const remainingBase = "https://www.degentip.me/";
      const remainingUrl = `https://farcaster.dep.dev/lp/tips/${fid}`;
      const remainingBalance = await fetch(remainingUrl, {
        headers: {
          accept: "application/json",
        },
      });
      const getRemaining = await remainingBalance.json()
      let remaining = 0
      let total = 0

      if (getRemaining) {
        console.log(getRemaining)
        remaining = Number(getRemaining.allowance) - Number(getRemaining.used)
        total = Number(getRemaining.allowance)
      }
      res.status(200).json({ total, remaining });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}