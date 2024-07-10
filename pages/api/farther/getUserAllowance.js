export default async function handler(req, res) {
  const { fid } = req.query;

  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    const input = encodeURIComponent(JSON.stringify({ fid: fid }))
    try {
      const remainingUrl = `https://farther.social/api/v1/public.user.byFid?input=${input}`;
      const fartherData = await fetch(remainingUrl, {
        headers: {
          accept: "application/json",
        },
      });
      let remainingBalance = 0
      if (fartherData?.status == 200) {
        const fartherInfo = await fartherData.json()
        remainingBalance = fartherInfo?.result?.data?.tips?.currentCycle?.remainingAllowance
        console.log('20', remainingBalance)
      }

      let remaining = 0
      let total = 0
      if (remainingBalance) {
        remaining = Number(remainingBalance)
      }
      console.log(total, remaining)
      res.status(200).json({ total, remaining });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}