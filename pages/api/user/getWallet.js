export default async function handler(req, res) {
  const { fid } = req.query
  const points = '$IMPACT'
  if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {
    try {

      const fetchData = async (fid) => {
        try {
          const response = await fetch(`https://client.warpcast.com/v2/user-by-fid?fid=${fid}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const wallets = data?.result?.extras?.walletLabels
          
          const warpcastWallet = wallets.find(wallet => wallet.address.startsWith('0x') && wallet.labels.includes('warpcast'));
          if (warpcastWallet) {
            console.log('Warpcast Wallet:', warpcastWallet);
          } else {
            console.log('No Warpcast wallet found');
          }

          return warpcastWallet?.address || '';
        } catch (error) {
          console.error('Error fetching data:', error);
          return '';
        }
      };

      const wallet = await fetchData(fid);

      res.status(200).json({ message: 'nominations', wallet });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

