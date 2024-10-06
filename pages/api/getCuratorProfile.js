import { init, fetchQuery } from "@airstack/node";

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY);
  const { fid } = req.query;



  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log('p1',fid)
    try {

    const query = `
      query GetFarcasterUserProfileForFID${fid} {
      Socials(
        input: {filter: {dappName: {_eq: farcaster}, userId: {_eq: "${fid}"}}, blockchain: ethereum}
      ) {
        Social {
          dappName
          profileName
          profileBio
          profileDisplayName
          profileImage
          profileUrl
          followingCount
          followerCount
        }
      }
    }`;
  
  
    const main = async () => {
      const { data, error } = await fetchQuery(query);
    
      if (error) {
        throw new Error(error.message);
      }
      console.log('airstack data', data);
      return data
    };
  
  
    const data = await main();
    console.log(data)









      res.status(200).json({ data });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}