export default async function handler(req, res) {
  const { fid } = req.query;

  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    const total = 0
    try {

      async function getDegenAllowance(fid) {
        try {
          const response = await fetch(`https://api.degen.tips/airdrop2/allowances?fid=${fid}`);
          const data = await response.json();
          
          if (data?.length > 0) {
            const remainingAllowance = data[0].remaining_tip_allowance;
            console.log('Latest remaining_tip_allowance:', remainingAllowance);
            return remainingAllowance;
          } else {
            console.log('No data found.');
            return 0;
          }
        } catch (error) {
          return 0;
        }
      }
      
      const data = await getDegenAllowance(fid);
      console.log('data 30', data)
      res.status(200).json({ total, remaining: parseInt(data) });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}