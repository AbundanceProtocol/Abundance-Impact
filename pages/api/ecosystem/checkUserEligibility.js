import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";
import User from "../../../models/User";
import { getCurrentDateUTC } from "../../../utils/utils";
import { Alchemy, Network } from "alchemy-sdk";

export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const ethAlchemyKey = process.env.ALCHEMY_ETH_API_KEY
  const BaseAlchemyKey = process.env.ALCHEMY_BASE_API_KEY
  const OpAlchemyKey = process.env.ALCHEMY_OP_API_KEY
  const ArbAlchemyKey = process.env.ALCHEMY_ARB_API_KEY
  const { fid, points } = req.query;

  if (req.method !== 'GET' || !fid || !points) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function getEcosystem(points) {
      try {
        await connectToDatabase();
        const ecosystem = await EcosystemRules.findOne({ ecosystem_points_name: points }).exec()
        if (ecosystem) {
          console.log(ecosystem)
          return ecosystem
        } else {
          return null
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return null
      }
    }

    const ecosystem = await getEcosystem(points)

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

    if (!user || !ecosystem) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {

      let badge = false
      let badgeReq = false
      let channelFollower = false
      let channelFollowerReq = false
      let ownerFollower = false
      let ownerFollowerReq = false
      let holdingNFT = false
      let holdingNFTReq = false
      let holdingERC20 = false
      let holdingERC20Req = false
      let eligibility = true
      let hasWallet = true


      if (ecosystem.condition_channels && ecosystem.condition_following_channel) {
        channelFollowerReq = true
        async function getChannel(fid, channels) {
          const channelOptions = {
            method: 'GET',
            headers: {accept: 'application/json'}
          };
          let following = true
          for (const channel of channels) {
            try {
              const channelData = await fetch(`https://api.warpcast.com/v1/user-channel?fid=${fid}&channelId=${channel.name}`, channelOptions);
              if (!channelData.ok) {
                return false
              } else {
                const channelInfo = await channelData.json();
                if (channelInfo && channelInfo.result) {
                  following = channelInfo.result?.following
                  if (!following) {
                    return false
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching data:', error);
              return false
            }
          }
          return following
        }

        channelFollower = await getChannel(user.fid, ecosystem.channels)
      }
      console.log('channelFollower', channelFollower)

      if (user.verifications && user.verifications.length > 0) {
        hasWallet = true
      } else {
        hasWallet = false
      }


      if (ecosystem.condition_following_owner) {
        ownerFollowerReq = true
        async function getOwner(userFid, ownerFid) {
          if (userFid == ownerFid) {
            return true
          } else {
            try {
              const base = "https://api.neynar.com/";
              const url = `${base}v2/farcaster/user/bulk?fids=${ownerFid}&viewer_fid=${userFid}`;
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
                  let followOwener = user.viewer_context?.following
                  return followOwener
                } else {
                  return false
                }
              } else {
                return false
              }
            } catch (error) {
              console.error('Error fetching data:', error);
              return false
            }
          }
        }

        ownerFollower = await getOwner(fid, ecosystem.fid)
      }
      console.log('ownerFollower', ownerFollower)


      if (ecosystem.condition_powerbadge) {
        badgeReq = true
        badge = user.power_badge
      }
      console.log('badge', badge)


      if (ecosystem.condition_holding_nft) {
        holdingNFTReq = true
        async function getNFTs(wallets, nfts) {
          holdingNFT = false

          const options = {
            method: 'GET',
            headers: {accept: 'application/json'}
          };
          let nftsInWallet = []
          for (const nft of nfts) {

            let alchemyKey = ethAlchemyKey
            let network = 'eth-mainnet'

            if (nft.nft_chain == 'eip155:1') {
              alchemyKey = ethAlchemyKey
              network = 'eth-mainnet'
            } else if (nft.nft_chain == 'eip155:10') {
              alchemyKey = OpAlchemyKey
              network = 'opt-mainnet'
            } else if (nft.nft_chain == 'eip155:8453') {
              alchemyKey = BaseAlchemyKey
              network = 'base-mainnet'
            } else if (nft.nft_chain == 'eip155:42161') {
              alchemyKey = ArbAlchemyKey
              network = 'arb-mainnet'
            }

            let nftInWallet = false
            for (const wallet of wallets) {
              try {
                const nftHolder = await fetch(`https://${network}.g.alchemy.com/nft/v3/${alchemyKey}/isHolderOfContract?wallet=${wallet}&contractAddress=${nft.nft_address}`, options);
                
                if (!nftHolder.ok) {
                  throw new Error(`HTTP error! Status: ${nftHolder.status}`);
                }
                
                const data = await nftHolder.json();
                if (data) {
                  if (data.isHolderOfContract) {
                    nftInWallet = true
                    break
                  }
                }

              } catch (error) {
                console.error('Error fetching data:', error);
              }

            }
            if (!nftInWallet) {
              return false
            } else {
              nftsInWallet.push(true)
            }
          }

          for (const nftCheck of nftsInWallet) {
            if (!nftCheck) {
              return false
            }
          }
          return true
        }

        holdingNFT = await getNFTs(user.verifications, ecosystem.nfts)
      }


      if (ecosystem.condition_holding_erc20) {
        holdingERC20Req = true
        async function getErc20(wallets, erc20s) {
          holdingERC20 = false

          let alchemyKey = ethAlchemyKey
          let network = Network.ETH_MAINNET

          for (const erc20 of erc20s) {
            if (erc20.erc20_chain == 'eip155:1') {
              alchemyKey = ethAlchemyKey
              network = Network.ETH_MAINNET
            } else if (erc20.erc20_chain == 'eip155:10') {
              alchemyKey = OpAlchemyKey
              network = Network.OPT_MAINNET
            } else if (erc20.erc20_chain == 'eip155:8453') {
              alchemyKey = BaseAlchemyKey
              network = Network.BASE_MAINNET
            } else if (erc20.erc20_chain == 'eip155:42161') {
              alchemyKey = ArbAlchemyKey
              network = Network.ARB_MAINNET
            }

            const config = {
              apiKey: alchemyKey,
              network: network,
            };

            let tokenValue = 0
            for (const wallet of wallets) {
              try {

                const alchemy = new Alchemy(config);
                const ownerAddress = wallet;
                const tokenContractAddresses = [erc20.erc20_address];
          
                const data = await alchemy.core.getTokenBalances(
                  ownerAddress,
                  tokenContractAddresses
                );
                
                // console.log(ownerAddress, tokenContractAddresses, network, data)

                function getTokenValue(data) {
                  if (data && data.tokenBalances[0]?.tokenBalance) {
                    const balance = data.tokenBalances[0]?.tokenBalance
                    const cleanHexValue = balance.startsWith('0x') ? balance.slice(2) : balance;
                    const decimal = BigInt(`0x${cleanHexValue}`).toString();
                    const dividedDecimal = decimal / 1000000000000000000;
                    const tokenAmount = Number(dividedDecimal).toFixed(4);
                    console.log('value', parseFloat(tokenAmount))
                    return parseFloat(tokenAmount)
                  } else {
                    return 0
                  }
                }
          
                if (data) {
                  tokenValue += getTokenValue(data)
                }
              } catch (error) {
                console.error('Error fetching data:', error);
                return 0
              }
            }
            // console.log(tokenValue, erc20.min)
            if (tokenValue < erc20.min) {
              return false
            }
          }
          return true
        }

        holdingERC20 = await getErc20(user.verifications, ecosystem.erc20s)
      }

      console.log(
        'badge', badge,
        'badgeReq', badgeReq,
        'channelFollower', channelFollower,
        'channelFollowerReq', channelFollowerReq,
        'ownerFollower', ownerFollower,
        'ownerFollowerReq', ownerFollowerReq,
        'holdingNFT', holdingNFT,
        'holdingNFTReq', holdingNFTReq,
        'holdingERC20', holdingERC20,
        'holdingERC20Req', holdingERC20Req,
        'eligibility', eligibility,
      )

      let createUser = null 

      if (hasWallet == false || (badgeReq == true && badge == false) || (channelFollowerReq == true && channelFollower == false) || (ownerFollowerReq == true && ownerFollower == false) || (holdingNFTReq == true && holdingNFT == false) || (holdingERC20Req == true && holdingERC20 == false)) {
        eligibility = false
      } else {
        eligibility = true

        createUser = await User.findOne({ fid: fid, ecosystem_name: ecosystem.ecosystem_name }).exec();
        console.log(createUser)

        if (!createUser) {

          async function getLatestCastHash(fid) {
            try {
              const base = "https://api.neynar.com/";
              const url = `${base}v2/farcaster/feed?feed_type=filter&filter_type=fids&fid=${fid}&fids=${fid}&with_recasts=false&limit=1`;
              const response = await fetch(url, {
                headers: {
                  accept: "application/json",
                  api_key: apiKey,
                },
              });
              const cast = await response.json();
              let hash = null
              if (cast && cast.casts && cast.casts.length > 0) {
                hash = cast.casts[0].hash;
                // console.log(hash);
                return { hash, needHash: false }
              } else {
                return { hash: null, needHash: true }
              }
            } catch (error) {
              console.error('Error processing request:', error);
              return { hash: null, needHash: true }
            }
          }
  
          const { hash, needHash } = await getLatestCastHash(user.fid)

          const currentDate = getCurrentDateUTC();
          let midnight = new Date(currentDate);
          midnight.setUTCHours(0, 0, 0, 0);
          midnight.setUTCDate(midnight.getUTCDate() + 1);

          let verification = null
          if (user.verifications.length > 0) {
            verification = user.verifications[0]
          }

          createUser = await User.create({
            fid: user.fid,
            ecosystem_points: ecosystem.ecosystem_points_name,
            ecosystem_name: ecosystem.ecosystem_name,
            pfp: user.pfp_url,
            wallet: verification,
            username: user.username,
            display_name: user.display_name,
            set_cast_hash: hash,
            need_cast_hash: needHash,
            impact_allowance: 100,
            remaining_i_allowance: 100,
            quality_allowance: 100,
            remaining_q_allowance: 100,
            quality_score_added: 0,
            quality_bonus_added: 0,
            power_badge: user.power_badge,
            next_update: midnight
          });

          console.log('createUser', createUser)
        }
      }

      const eligibilityData = {
        badge,
        badgeReq,
        channelFollower,
        channelFollowerReq,
        ownerFollower,
        ownerFollowerReq,
        holdingNFT,
        holdingNFTReq,
        holdingERC20,
        holdingERC20Req,
        eligibility,
        hasWallet
      }

      res.status(200).json({ ecosystem, user, eligibilityData, createUser });
    }
  }
}