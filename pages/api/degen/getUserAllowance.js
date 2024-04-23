export default async function handler(req, res) {
  const { fid } = req.query;
  if (req.method === 'GET' && fid) {
    try {
      console.log(fid)
      // const base = "https://degen.tips/";
      // const url = `${base}api/airdrop2/tip-allowance?fid=${fid}`;
      // const response = await fetch(url, {
      //   headers: {
      //     accept: "application/json",
      //   },
      // });

      const remainingBase = "https://www.degentip.me/";
      const remainingUrl = `${remainingBase}api/get_allowance?fid=${fid}`;
      const remainingBalance = await fetch(remainingUrl, {
        headers: {
          accept: "application/json",
        },
      });
      const getRemaining = await remainingBalance.json()
      let remaining
      let total
      // if (response) {
      //   const userAllowance = await response.json();
      //   remaining = userAllowance[0].remaining_allowance
      //   total = userAllowance[0].tip_allowance
      //   console.log(total, remaining)
      // }
      if (getRemaining) {
        remaining = getRemaining.allowance.remaining_allowance
        total = getRemaining.allowance.tip_allowance
        console.log(remaining)
      }
      res.status(200).json({ total, remaining });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}


9326