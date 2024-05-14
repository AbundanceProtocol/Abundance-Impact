import axios from 'axios';
import crypto from 'crypto';

// shorten a hash address
export function shortenAddress(input, long) {
  let address = input
  let shortenedAddress = ''
  if (long) {
    const parts = input.split(':');
    address = parts[2].substring(2);
  } 
  if (address.length <= 8) {
    return address
  } else {
    shortenedAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    return shortenedAddress;
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
  // console.log(url)
  try {
    const embedType = await axios.get('/api/getEmbeds', {
      params: { url }
    })
    // console.log(embedType)
    // console.log(embedType.data)
    if (embedType && embedType.data) {
      return embedType.data.embed
    } else {
      return 'other'
    }
  } catch (error) {
    console.error('Error handling GET request:', error);
    return 'other'
  }
}


export async function checkEmbedType(cast) {
  const { embeds } = cast;

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
export function encryptPassword(text, key) {
    const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

// Decryption function
export function decryptPassword(encryptedText, key) {
  const decipher = crypto.createDecipheriv('aes-256-ecb', key, null);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}