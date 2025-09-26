// pages/api/user/validate.js
import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import { getCurrentDateUTC } from "../../../utils/utils";
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY

  const { fid } = req.query;
  if (!fid) return res.status(400).json({ valid: false, error: 'Missing fid' });

  await connectToDatabase();
  let userExists = await User.findOne({ fid: fid.toString(), ecosystem_points: '$IMPACT' }).select('_id uuid');

  let signer = false
  let newUser = false

  if (!userExists) {

    async function getUser(fid, apiKey) {
      try {
        const base = "https://api.neynar.com/";
        const url = `${base}v2/farcaster/user/bulk?fids=${fid}`;
        const response = await fetch(url, {
          headers: {
            accept: "application/json",
            api_key: apiKey,
          },
        });
        const userData = await response.json();
        if (userData) {
          const user = userData.users[0]
          if (user) {
            return user
          } else {
            return null
          }
        } else {
          return null
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return null
      }
    }

    const user = await getUser(fid, apiKey)

    const getWallet = async (fid) => {
      try {
        const response = await fetch(`https://client.warpcast.com/v2/user-by-fid?fid=${fid}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const wallets = data?.result?.extras?.walletLabels
        
        let warpcastWallet = wallets.find(wallet => wallet.address.startsWith('0x') && wallet.labels.includes('warpcast'));
        // if (warpcastWallet) {
        //   console.log('Warpcast Wallet:', warpcastWallet);
        // } else {
        //   console.log('No Warpcast wallet found');
        // }

        if (!warpcastWallet) {
          warpcastWallet = wallets.find(wallet => wallet.address.startsWith('0x') && wallet.labels.includes('primary'));
        }

        return warpcastWallet?.address || '';
      } catch (error) {
        console.error('Error fetching data:', error);
        return '';
      }
    };

    const wallet = await getWallet(fid);

    const currentDate = getCurrentDateUTC();
    let midnight = new Date(currentDate);
    midnight.setUTCHours(0, 0, 0, 0);
    midnight.setUTCDate(midnight.getUTCDate() + 1);


    userExists = await User.create({
      invited_by: null,
      fid: user.fid,
      uuid: "",
      ecosystem_points: '$IMPACT',
      ecosystem_name: 'Abundance',
      pfp: user.pfp_url || "",
      wallet: wallet || "",
      username: user.username || "",
      display_name: user.display_name || "",
      set_cast_hash: "",
      need_cast_hash: true,
      impact_allowance: 30,
      remaining_i_allowance: 30,
      quality_allowance: 30,
      remaining_q_allowance: 30,
      quality_score_added: 0,
      quality_bonus_added: 0,
      power_badge: user.power_badge || false,
      next_update: midnight
    });


    await userExists.save()
    newUser = true
  }
  
  if (userExists) {
    if (userExists?.uuid == '' || userExists?.uuid == null) {
      signer = false
    } else {
      signer = true
    }
  }

  res.status(200).json({ valid: !!userExists, signer: signer, newUser: newUser });
}