import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';
// import { init, fetchQuery } from "@airstack/node";

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY);

  const { channel, more } = req.query
  if (req.method !== 'GET' || !channel) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {

    try {

      // let query = `
      //     query GetChannelById {
      //       FarcasterChannels(
      //         input: {blockchain: ALL, filter: {channelId: {_regex_in: "${channel}"}}}
      //       ) {
      //         FarcasterChannel {
      //           channelId
      //           url
      //           followerCount
      //           imageUrl
      //         }
      //       }
      //     }`;

      // const main = async () => {
      //   const { data, error } = await fetchQuery(query);
      
      //   if (error) {
      //     throw new Error(error.message);
      //   }
      //   console.log('airstack data', data);
      //   return data
      // };
    
    
      const data = await main();

      let cleanData = data?.FarcasterChannels?.FarcasterChannel || null

      console.log('more', more)
      let dataLength = 0
      if (!more) {
        dataLength = cleanData?.length
        cleanData = cleanData.slice(0, 20);
      }
      console.log('dataLength', dataLength)

      // console.log('adjustedData', newData)
      res.status(200).json({ message: 'done', data: cleanData, length: dataLength });
    } catch (error) {
      console.error('Error submitting data:', error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
