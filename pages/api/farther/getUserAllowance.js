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
      let allowance = 0
      let remainingAllowance = 0
      let tipMin = 0
      if (fartherData?.status == 200) {
        const fartherInfo = await fartherData.json()
        allowance = fartherInfo?.result?.data?.tips?.currentCycle?.allowance
        tipMin = fartherInfo?.result?.data?.tips?.currentCycle?.tipMinimum
        remainingAllowance = fartherInfo?.result?.data?.tips?.currentCycle?.remainingAllowance
        if (!remainingAllowance) {
          remainingAllowance = allowance
        }
      }
      let total = 0
      let remaining = 0
      let minTip = 0
      if (remainingAllowance) {
        remaining = Number(remainingAllowance)
      }
      if (tipMin) {
        minTip = Number(tipMin)
      }
      console.log(total, remaining, minTip)
      res.status(200).json({ total, remaining, minTip });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}