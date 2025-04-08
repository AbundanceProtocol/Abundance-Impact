import connectToDatabase from "../../libs/mongodb";
import User from "../../models/User";
// import { init, fetchQuery } from "@airstack/node";

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY);
  const { fid, username } = req.query;



  if (req.method !== 'GET' || (!fid && !username)) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    // console.log('p1',fid)


    // let setFid = 9326
    // if (fid) {
    //   setFid = fid
    // } else if (username) {
    //   async function getUserFid(username) {
    //     try {
    //       await connectToDatabase();
    //       const user = await User.findOne({ username }).select('fid').exec();
    //       return user ? user.fid : 9326;
    //     } catch (error) {
    //       console.error('Error in getHash:', error);
    //       return 9326;
    //     }
    //   }
    //   setFid = await getUserFid(username)
    // }


    try {
      // let query = ''

      // if (fid) {
      //   query = `
      //     query GetFarcasterUserProfileForFID${fid} {
      //     Socials(
      //       input: {filter: {dappName: {_eq: farcaster}, userId: {_eq: "${fid}"}}, blockchain: ethereum}
      //     ) {
      //       Social {
      //         dappName
      //         profileName
      //         profileBio
      //         profileDisplayName
      //         profileImage
      //         profileUrl
      //         followingCount
      //         followerCount
      //         userId
      //       }
      //     }
      //   }`;
      // } else if (username) {
      //   query = `
      //   query GetFarcasterUserProfileForFID${username} {
      //   Socials(
      //     input: {filter: {dappName: {_eq: farcaster}, profileName: {_eq: "${username}"}}, blockchain: ethereum}
      //   ) {
      //     Social {
      //       dappName
      //       profileName
      //       profileBio
      //       profileDisplayName
      //       profileImage
      //       profileUrl
      //       followingCount
      //       followerCount
      //       userId
      //     }
      //   }
      // }`;
      // }

      async function getUserFid(username) {
        try {
          let fid = null
          await connectToDatabase();
          const user = await User.findOne({ username });
          if (user) {
            fid = Number(user.fid)
          }
          return fid;
        } catch (error) {
          console.error('Error fetching data:', error);
          return null;
        }
      }

      let userFid = fid || null

      if (username) {
        userFid = await getUserFid(username)
      }

      const fetchData = async (fid) => {
        try {
          const response = await fetch(`https://api.warpcast.com/v2/user?fid=${fid}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching data:', error);
          return null;
        }
      };
    
      const userData = await fetchData(userFid)
      const user = userData?.result?.user || null
      console.log('userData', userData?.result)

      // const main = async () => {
      //   const { data, error } = await fetchQuery(query);
      
      //   if (error) {
      //     throw new Error(error.message);
      //   }
      //   console.log('airstack data', data);
      //   return data
      // };
    
    
      // const data = await main();
      // console.log(data)

      res.status(200).json({ data: user });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}