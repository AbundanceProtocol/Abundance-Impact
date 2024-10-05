import connectToDatabase from "../../../libs/mongodb";
import User from "../../../models/User";
import { createGuildClient, createSigner } from "@guildxyz/sdk";

export default async function handler(req, res) {
  // const { fid, points } = req.query;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    const userIdOrAddress = '0xdca6F7CB3cF361C8dF8FDE119370F1b21b2fFf63'

    try {
      const guildClient = await createGuildClient("Octant Guild")
      const { guild: client  } = guildClient;
      // const { user: userClient } = guildClient;
      // const user = await userClient.get(userIdOrAddress);
      const guild = await client.get('onctant');

      console.log(guild)
      // if (user?.id) {
      //   const profile = await userClient.getProfile(user.id)

      //   console.log('user', user)
      //   console.log('profile', profile)
      // } else {
      //   console.log('error')

      // }


      // console.log(guildClient)
      // console.log(guildClient.guild)
      // console.log('address', guildClient.user.address.get)
      // console.log(guildClient)
      // console.log(guildClient)

    } catch (error) {
      console.error('Error fetching data:', error);
    }


    // const { user: userClient } = guildClient;

    // async function getBalances(fid, points) {
    //   try {
    //     await connectToDatabase();
    //     const user = await User.findOne({fid: fid, ecosystem_points: points}).select('remaining_i_allowance remaining_q_allowance').exec()
    //     if (user) {
    //       console.log(user)
    //       return user
    //     } else {
    //       return null
    //     }
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //     return null
    //   }
    // }

    // const user = await getBalances(fid, points)    
    const user = 3
    res.status(200).json({ user });
  }
}




// {
//   guild: {
//     role: {
//       requirement: [Object],
//       reward: [Object],
//       get: [Function: get],
//       getAll: [Function: getAll],
//       create: [Function: create],
//       update: [Function: update],
//       delete: [Function: delete]
//     },
//     reward: {
//       get: [Function: get],
//       getAll: [Function: getAll],
//       create: [Function: create],
//       update: [Function: update],
//       delete: [Function: delete]
//     },
//     admin: {
//       get: [Function: get],
//       getAll: [Function: getAll],
//       create: [Function: create],
//       update: [Function: update],
//       delete: [Function: delete]
//     },
//     get: [Function: get],
//     getMany: [Function: getMany],
//     search: [Function: search],
//     getLeaderboard: [Function: getLeaderboard],
//     getMembers: [Function: getMembers],
//     getUserMemberships: [Function: getUserMemberships],
//     create: [Function: create],
//     update: [Function: update],
//     delete: [Function: delete],
//     join: [Function: join],
//     accessCheck: [Function: accessCheck]
//   },
//   platform: {
//     getGuildByPlatform: [Function: getGuildByPlatform],
//     getUserGuildAccessByPlatform: [Function: getUserGuildAccessByPlatform],
//     withPlatformName: [Function: withPlatformName]
//   },
//   user: {
//     platform: {
//       get: [Function: get],
//       getAll: [Function: getAll],
//       create: [Function: create],
//       delete: [Function: delete]
//     },
//     address: {
//       get: [Function: get],
//       getAll: [Function: getAll],
//       create: [AsyncFunction: create],
//       update: [Function: update],
//       delete: [Function: delete]
//     },
//     get: [Function: get],
//     getPoints: [Function: getPoints],
//     getRankInGuild: [Function: getRankInGuild],
//     getProfile: [Function: getProfile],
//     getMemberships: [Function: getMemberships],
//     delete: [Function: delete],
//     listGateables: [Function: listGateables]
//   }
// }