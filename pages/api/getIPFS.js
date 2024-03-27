export default async function handler(req, res) {
  const pinataGatewayToken = process.env.PINATA_GATEWAY_TOKEN

  if (req.method === 'GET') {
    const { hash } = req.query;
    console.log('6: hash:', hash)
    
    const url = `https://emerald-keen-peacock-448.mypinata.cloud/ipfs/${hash}?pinataGatewayToken=${pinataGatewayToken}`

    try {
      const textResponse = await fetch(url);
      
      // console.log('13 textResponse:', textResponse)
      if (!textResponse.ok) {
        throw new Error('Network response was not ok');
      }
  
      const jsonData = await textResponse.json();
      // console.log('19 jsonData:', jsonData)

      const text = jsonData.text
      const username = jsonData.username
      const datetime = jsonData.datetime
      const fid = jsonData.fid
      // console.log(username, text, datetime, fid)
      res.status(200).json({ username, text, datetime, fid });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
      res.status(405).json({ error: 'Method Not Allowed' });
  }
}