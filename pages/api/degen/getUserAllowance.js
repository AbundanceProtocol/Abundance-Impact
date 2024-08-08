export default async function handler(req, res) {
  const { fid } = req.query;

  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    try {
      const remainingBase = "https://www.degentip.me/";
      const remainingUrl = `${remainingBase}api/get_allowance?fid=${fid}`;
      // const remainingBase = "https://www.degen.tips/";
      // const remainingUrl = `${remainingBase}api/airdrop2/tip-allowance?fid=${fid}`;
      const remainingBalance = await fetch(remainingUrl, {
        headers: {
          accept: "application/json",
        },
      });
      const getRemaining = await remainingBalance.json()
      let remaining = 0
      let total = 0
      console.log(getRemaining)

      if (getRemaining) {
        remaining = getRemaining?.allowance?.remaining_allowance
        total = getRemaining?.allowance?.tip_allowance
        // remaining = parseInt(getRemaining[0]?.remaining_allowance)
        // total = parseInt(getRemaining[0]?.tip_allowance)
      }
      if (!remaining && remaining !== 0) {
        remaining = total
      }
      res.status(200).json({ total, remaining });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}