import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import Moralis from 'moralis';
const apiKey = process.env.MORALIS_API_KEY

// shorten a hash address
export function shortenAddress(input, long) {
  if (!input) {
    return ''
  } else {
    let address = input
    let shortenedAddress = ''
    if (long) {
      const parts = input.split(':');
      address = parts[2].substring(2);
    } 
    if (address && address.length <= 8) {
      return address
    } else {
      shortenedAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
      return shortenedAddress;
    }
  }

  // } else {
  //   if (input.length <= 8) {
  //     return input;
  //   } else {
  //     return input.substring(0, 4) + '...' + input.substring(input.length - 4);
  //   }
  // }
}
  

// time passed in months, days, hours, or minutes
export function timePassed(timestamp) {
  const currentTime = new Date();
  const pastTime = new Date(timestamp);
  const timeDifference = currentTime - pastTime;
  const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutes = Math.floor(timeDifference / (1000 * 60));
  if (months > 1) {
    return `${months}mo`
  } else if (days > 0) {
    return `${days}d`
  } else if (hours > 0) {
    return `${hours}h`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return 'now'
  }
}


// add 'img' or 'url' label to embeds
export async function setEmbeds(feed) {
  if (feed) {
    for (let i = 0; i < feed.length; i++) {
      if (!feed[i].frames) {
        if (feed[i].embeds) {
          for (let j = 0; j < feed[i].embeds.length; j++) {
            const url = feed[i].embeds[j].url
            const isImg = await isImage(url)
            if (isImg) {
              feed[i].embeds[j].type = 'img'
            } else {
              feed[i].embeds[j].type = 'url'
            }
          }
        }
      }
    }
  }
  return feed
}


// format follower count
export function formatNum(num) {
  const number = Number(num)
  if (isNaN(number)) {
    return '-'
  } else {
    let formattedNumber = number
    if (number > 1000000) {
      formattedNumber = (number / 1000000).toFixed(1) + 'M'
    } else if (number > 1000) {
      formattedNumber = (number / 1000).toFixed(1) + 'K'
    }
    return formattedNumber
  }
}


export function getCurrentDateUTC() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  ));
};


export function isYesterday(previous, current) {

  const currentYear = current.getUTCFullYear();
  const currentMonth = current.getUTCMonth();
  const currentDay = current.getUTCDate();
  
  // Clone the date stored in store.userUpdateTime
  const storedDate = new Date(previous);
  const storedYear = storedDate.getUTCFullYear();
  const storedMonth = storedDate.getUTCMonth();
  const storedDay = storedDate.getUTCDate();
  
  const isPreviousYesterday = storedYear === currentYear && storedMonth === currentMonth && storedDay === currentDay - 1;

  if (isPreviousYesterday) {
    return true
  } else {
    return false
  }
}


export function getTimeRange(time) {

  let timeRange = null
  if (time === '24hr') {
    timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else if (time === '3days') {
    timeRange = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  } else if (time === '7days') {
    timeRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (time === '30days') {
    timeRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  } else if (time === 'all') {
    timeRange = null
  }
  return timeRange
}


async function isImage(url) {
  // console.log(url)
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(url)

    if (response.ok) {
      const contentType = response.headers.get('Content-Type');
      console.log(contentType, url)
      if (contentType && contentType.startsWith('image/')) {
        return 'image'
      } else if (contentType && contentType == 'application/x-mpegURL') {
        return 'video'
      } else if (contentType && contentType.startsWith('text/html')) {
        console.log(contentType)
        return 'html'
      } else {
        return 'other';
      }
    } else {
      return 'other';
    }
  } catch (error) {
    console.error('Error checking image URL:', error);
    return 'other';
  }
}

async function getEmbeds(url) {
  if (typeof url == 'undefined') {
    return 'other'
  } else {
    try {
      const embedType = await axios.get('/api/getEmbeds', {
        params: { url }
      })
      // console.log(embedType)
      // console.log(embedType.data)
      if (embedType?.data) {
        return embedType?.data?.embed
      } else {
        return 'other'
      }
    } catch (error) {
      console.error('Error handling GET request:', error);
      return 'other'
    }
  }
}


export async function checkEmbedType(cast) {
  const isCast = (cast) => {
    if (cast) {
      const { embeds } = cast
      return { embeds }
    } else {
      return { embeds: [] }
    }
  }

  const { embeds } = isCast(cast);

  if (embeds && embeds.length > 0) {
    const updatedEmbeds = await Promise.all(embeds.map(async (embed) => {

      // console.log(embed)
      // const imageResult = await isImage(embed.url);
      const embedType = await getEmbeds(embed.url)

      // console.log(embedType)
      // console.log(embedType.data.embed)
      const isSubcast = typeof embed.cast_id !== 'undefined'
      return {
        ...embed,
        type: isSubcast ? 'subcast' : embedType
      };
    }));
    
    return {
      ...cast,
      embeds: updatedEmbeds
    };
  }
  
  return cast; // Return original cast object if embeds array is empty or undefined
}


// Encryption function
export function encryptPassword(password, secretKey) {
  console.log('testing1')
    return CryptoJS.AES.encrypt(password, secretKey).toString();
}

// Decryption function
export function decryptPassword(encryptedPassword, secretKey) {
  console.log('testing2')
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}


export function desensitizeString(s) {
  s = s.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g, '***@***.***');
  s = s.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '***-***-****');
  s = s.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');
  return s;
}


export async function populateCast(casts) {
  let displayedCasts = []
  
  if (casts) {
    casts.forEach(cast => {
      let newCast = {
        author: {
          fid: cast.author_fid,
          pfp_url: cast.author_pfp,
          username: cast.author_username,
          display_name: cast.author_display_name,
          power_badge: false,
        },
        hash: cast.cast_hash,
        timestamp: cast.createdAt,
        text: cast.cast_text,
        impact_points: cast.impact_points,
        embeds: [],
        mentioned_profiles: [],
        replies: {
          count: 0
        },
        reactions: {
          recasts: [],
          likes: []
        },
        impact_balance: cast.impact_total,
        quality_absolute: cast.quality_absolute,
        quality_balance: cast.quality_balance
      }

      displayedCasts.push(newCast)
    });
  }
  return displayedCasts
}


export function filterObjects(castArray, filterFid) {
  return castArray.filter(obj => {
    if (obj.author.fid != filterFid) {
      obj.impact_points = obj.impact_points.filter(point => point.curator_fid != filterFid);
      return true; 
    }
    return false;
  });
}


export async function processTips(userFeed, userFid, tokenData, ecosystem) {
  let ecosystemName = ''
  if (ecosystem) {
    ecosystemName = ecosystem + ' Ecosystem on '
  }

  if (!userFeed || !userFid || !tokenData) {

    return { castData: null, coinTotals: null }

  } else {

    // console.log(userFeed)
  
    let casts = filterObjects(userFeed, userFid)
  
    // console.log(casts)
  
    let totalImpact = casts.reduce((total, cast) => {
      return total + cast.impact_balance - cast.quality_balance;
    }, 0);
  
    // console.log(totalImpact)
  
    let tipCasts = []
  
    for (const cast of casts) {
      let tipRatio = 1
      if (cast.impact_points && cast.impact_points.length > 0) {
        tipRatio = 0.92
      }
      let castImpact = cast.impact_balance - cast.quality_balance
      let tipWeight = tipRatio * castImpact / totalImpact
      let castSchema = {
        castWeight: tipWeight,
        castHash: cast.hash,
        fid: cast.author.fid,
        allCoins: [],
        text: ''
      }
      tipCasts.push(castSchema)
    }
  
    for (const cast of casts) {
      if (cast.impact_points && cast.impact_points.length > 0) {
        for (const subCast of cast.impact_points) {
          let subTipWeight = 0.08 * subCast.impact_points / totalImpact
          let subCastSchema = {
            castWeight: subTipWeight,
            castHash: subCast.target_cast_hash,
            fid: subCast.curator_fid,
            allCoins: [],
            text: ''
          }
          tipCasts.push(subCastSchema)
        }
      }
    }
  
    let tipCount = 0
    for (const tipCast of tipCasts) {
      tipCount += tipCast.castWeight
    }
  
    // console.log(tipCount)
  
    let coinTotals = []
  
    for (const coin of tokenData) {
      if (coin.set) {
        for (const tipCast of tipCasts) {
          let tip = 0
          if (coin.token == '$TN100x') {
            tip = Math.floor(tipCast.castWeight * coin.totalTip / 10)
          } else {
            tip = Math.floor(tipCast.castWeight * coin.totalTip)
          }
          let coinSchema = {
            coin: coin.token,
            tip: tip
          }
          tipCast.allCoins.push(coinSchema)
        }
      }
      coinTotals[coin.token] = {totalTip: 0, usedTip: 0, remaining: 0, mod: 0, div: 0}
      if (coin.token == '$TN100x') {
        coinTotals[coin.token].totalTip = Math.floor(coin.totalTip / 10)
      } else {
        coinTotals[coin.token].totalTip = coin.totalTip
      }
      coinTotals[coin.token].usedTip = 0
      coinTotals[coin.token].mod = 0
      coinTotals[coin.token].div = 0
      coinTotals[coin.token].remaining = 0
    }
  
    // console.log(tipCasts)
  
    // console.log(coinTotals)
  
    for (const tipCast of tipCasts) {
      if (tipCast.allCoins && tipCast.allCoins.length > 0) {
        for (const coin of tipCast.allCoins) {
          coinTotals[coin.coin].usedTip += coin.tip
        }
      }
    }
  
    for (const coin of tokenData) {
      if (coin.set) {
        coinTotals[coin.token].remaining = coinTotals[coin.token].totalTip - coinTotals[coin.token].usedTip
  
        if (tipCasts.length > 0) {
          coinTotals[coin.token].mod = coinTotals[coin.token].remaining % tipCasts.length
  
          coinTotals[coin.token].div = Math.floor(coinTotals[coin.token].remaining / tipCasts.length)
        }
      }
    }
  
    for (const cast of tipCasts) {
      if (cast.allCoins && cast.allCoins.length > 0) {
        for (const coin of cast.allCoins) {
          if (coinTotals[coin.coin].div > 0) {
            coin.tip += coinTotals[coin.coin].div
          }
        }
      }
    }
  
    // console.log(tipCasts)
  
    for (const token of tokenData) {
      if (token.set) {
        if (coinTotals[token.token].mod > 0) {
          for (let i = 0; i < coinTotals[token.token].mod; i++) {
            const coinIndex = tipCasts[i].allCoins.findIndex(currentCoin => currentCoin.coin == token.token)
            if (coinIndex !== -1 && tipCasts[i].allCoins[coinIndex].tip) {
              tipCasts[i].allCoins[coinIndex].tip += 1
            } else if (coinIndex !== -1) {
              tipCasts[i].allCoins[coinIndex].tip = 1
              tipCasts[i].allCoins[coinIndex].coin = token.token
            } else {
              tipCasts[i].allCoins.push({coin: token.token, tip: 1})
            }              
          }
        }
      }
    }
  
    // console.log(tipCasts)
  
    for (const cast of tipCasts) {
      if (cast.allCoins && cast.allCoins.length > 0) {
        for (const coin of cast.allCoins) {
          let coinText = ''
          if (coin.coin == '$TN100x' && coin.tip > 0) {
            coinText = `🍖x${coin.tip} \n`
            cast.text += coinText
          } else if (coin.tip > 0) {
            coinText = `${coin.tip} ${coin.coin} \n`
            cast.text += coinText
          }
        }
        if (cast.text.length > 0) {
          cast.text += `tipped via ${ecosystemName}/impact`
        }
      }
    }
  
    console.log(coinTotals)
  
    // console.log(tipCasts)
  
    let cleanTips = tipCasts.map(({ castWeight, ...rest }) => rest)
  
    // console.log(cleanTips)
  
    let finalTips = cleanTips.filter(cast => cast.text.length > 0)
  
    console.log(finalTips)
  
    return { castData: finalTips, coinTotals: coinTotals }
  }
}


export function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}


export const isAlphanumeric = (str) => {
  const regex = /^[a-zA-Z0-9]*$/;
  return regex.test(str);
};


const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

export const getTokenBalance = async (walletAddress, tokenAddress, provider) => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    return balance;
  } catch (error) {
    console.error(error);
    return null;
  }
};


let moralisInitialized = false;

export const initializeMoralis = async () => {
  if (!moralisInitialized) {
    await Moralis.start({ apiKey });
    moralisInitialized = true;
  }
};

export const getTokenAddress = (chain, address, tokenType) => {
  if (!chain || !address || !tokenType) {
    return ''
  } else {
    let chainString = 'https://etherscan.io/'
    if (chain == 'eip155:8453') {
      chainString = 'https://basescan.org/'
    } else if (chain == 'eip155:42161') {
      chainString = 'https://arbiscan.io/'
    } else if (chain == 'eip155:10') {
      chainString = 'https://optimistic.etherscan.io/'
    } else if (chain == 'eip155:1') {
      chainString = 'https://etherscan.io/'
    }
    let tokenAddress = chainString + tokenType + '/' + address
    return tokenAddress
  }
}


export function getToken(address) {
  if (address == '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
    return '1'
  } else if (address == '0x4200000000000000000000000000000000000042') {
    return '2'
  } else if (address == '0x4ed4e862860bed51a9570b96d89af5e1b0efefed') {
    return '3'
  } else if (address == '0x5b5dee44552546ecea05edea01dcd7be7aa6144a') {
    return '4'
  } else if (address == '0xa6b280b42cb0b7c4a4f789ec6ccc3a7609a1bc39') {
    return '5'
  } else if (address == '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429') {
    return '6'
  } else if (address == '0xba5BDe662c17e2aDFF1075610382B9B691296350') {
    return '7'
  } else {
    return null
  }
}


export function getChain(chain) {
  if (chain == 'eip155:1') {
    return '1'
  } else if (chain == 'eip155:10') {
    return '2'
  } else if (chain == 'eip155:8453') {
    return '3'
  } else if (chain == 'eip155:42161') {
    return '4'
  } else if (chain == 'eip155:7777777') {
    return '5'
  } else if (chain == 'eip155:137') {
    return '6'
  } else if (chain == 'eip155:666666666') {
    return '7'
  } else if (chain == 'eip155:5112') {
    return '8'
  } else {
    return '1'
  }
}