import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';
import EcosystemRules from '../../../models/EcosystemRules';
import { getTimeRange, processTips, populateCast } from '../../../utils/utils';

const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY
const baseApi = process.env.BASE_API
const baseApiKey = process.env.BASE_API_KEY

export default async function handler(req, res) {
  const { fid } = req.query

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {
    // const points = '$IMPACT'
    // const fid = 9326
    // async function getCurator(curator, points) {

    //   async function getUsername(fids, points) {
    //     console.log(points)
    //     try {
    //       await connectToDatabase();
    //       const users = await User.find({ fid: { $in: fids }, ecosystem_points: points }).select('username').exec();
    //       if (users?.length == 1) {
    //         let usernames = `@${users[0].username}`
    //         return usernames
    //       } else if (users?.length == 2) {
    //         let usernames = `@${users[0].username} & @${users[1].username}`
    //         return usernames
    //       } else if (users?.length > 2) {
    //         let usernames = `@${users[0].username}, @${users[1].username} & co`
    //         return usernames
    //       } else {
    //         return null
    //       }
    //     } catch (error) {
    //       console.error("Error while fetching casts:", error);
    //       return null
    //     }   
    //   }

    //   if (curator && curator.length > 0) {
    //     let curatorFids

    //     if (typeof curator === 'string') {
    //       curatorFids = [parseInt(curator)];
    //     } else if (Array.isArray(curator) && curator.length > 0) {
    //       curatorFids = curator.map(fid => parseInt(fid));
    //     }

    //     // curatorFids = curator.map(fid => parseInt(fid));
  
    //     let usernames = null
    //     if (curatorFids) {
    //       usernames = await getUsername(curatorFids, points)
    //     }
    //     return usernames
    //   } else {
    //     return null
    //   }
    // }




    // let shareText = 'I just multi-tipped builders and creators on /impact. Try it out here:'

    // if (curators && fid == curators) {
    //   shareText = 'I just multi-tipped builders & creators on /impact.\n\nSupport my nominees here:'
    // } else if (curators?.length > 0) {
    //   const curatorName = await getCurator(curators, points)
    //   if (curatorName) {
    //     shareText = `I just multi-tipped ${curatorName}'s curation of builders & creators thru /impact.\n\nSupport ${curatorName}'s nominees here:`
    //   } else {
    //     shareText = 'I just multi-tipped builders & creators on /impact. Try it out here:'
    //   }
    // } else {
    //   shareText = 'I just multi-tipped builders & creators on /impact. Try it out here:'
    // }

    // console.log(shareText)



    // let castContext = null

    // async function populateCast(fid) {
    //   try {
    //     const remainingUrl = `https://farcaster.dep.dev/ham/user/${fid}`;
    //     const remainingBalance = await fetch(remainingUrl, {
    //       headers: { accept: "application/json" },
    //     });
    //     const getRemaining = await remainingBalance.json();
    //     return getRemaining ? Math.floor((Number(getRemaining?.todaysAllocation) - Number(getRemaining?.totalTippedToday))/1e18) : 0;
    //   } catch (error) {
    //     console.error('Error in getHamAllowance:', error);
    //     return 0;
    //   }
    // }

    // https://tip.hunt.town/api/stats/fid/9326
    
    async function populateCast(fid) {
      try {
        const remainingUrl = `https://client.warpcast.com/v2/user-by-fid?fid=${fid}`;
        const remainingBalance = await fetch(remainingUrl, {
          headers: { accept: "application/json" },
        });
        const getRemaining = await remainingBalance.json();
        return getRemaining;
      } catch (error) {
        console.error('Error in getWildAllowance:', error);
        return 0;
      }
    }


    const getCastData = await populateCast(fid)
    console.log('result', getCastData)
    console.log('pfp', getCastData?.result?.user?.pfp)
    console.log('profile', getCastData?.result?.user?.profile)

    // if (getCastData) {
      // castContext = {
      //   author_fid: getCastData.author.fid,
      //   author_pfp: getCastData.author.pfp_url,
      //   author_username: getCastData.author.username,
      //   author_display_name: getCastData.author.display_name,
      //   cast_hash: getCastData.hash,
      //   parent_hash: getCastData.parent_hash,
      //   cast_text: getCastData.text,
      //   cast_channel: getCastData.root_parent_url
      // }

    //   castContext = {
    //     author_fid: getCastData?.author?.fid,
    //     author_pfp: getCastData.author?.pfp?.url,
    //     author_username: getCastData?.author?.username,
    //     author_display_name: getCastData?.author?.displayName,
    //     cast_hash: getCastData?.hash,
    //     parent_hash: getCastData?.threadHash,
    //     cast_text: getCastData?.text,
    //     cast_channel: getCastData?.parentUrl
    //   }
    // }






    try {
      res.status(200).json({ getCastData });

    

    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
