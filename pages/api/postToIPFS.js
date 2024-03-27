import pinataSDK from '@pinata/sdk'

export default async function handler(req, res) {
  const fs = require('fs')
  const pinataSecret = process.env.PINATA_API_SECRET
  const pinataKey = process.env.PINATA_API_KEY
  const pinata = new pinataSDK(pinataKey, pinataSecret)

  if (req.method === 'POST') {
    try {
      const { username, text, fid } = req.body;
      const datetime = new Date().toISOString()
      const jsonData = { text, username, datetime, fid };
      const jsonString = JSON.stringify(jsonData);
      const readableStreamForFile = require('stream').Readable.from([jsonString]);

      const options = {
        pinataMetadata: {
          name: `longcast-${username}-${datetime}`,
          keyvalues: {
            username: username,
            datetime: datetime,
            fid: fid
          }
        },
        pinataOptions: {
          cidVersion: 0,
        }
      }

      const response = await pinata.pinFileToIPFS(readableStreamForFile, options)

      res.status(200).json({ ipfsHash: response.IpfsHash });
      // res.status(200).json({ ipfsHash: responseData.IpfsHash });
    } catch (error) {
      console.error('Error handling POST requests:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).end();
  }
}
