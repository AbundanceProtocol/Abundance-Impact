import axios from 'axios';

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


// check if url is an image
// export async function isImage(url) {
//   if (url) {
//     try {
//       const response = await axios.get('/api/getHeader', {
//         params: { url }
//       })
//       if (response.data) {
//         return response.data
//       } else {
//         return false
//       }
//     } catch (error) {
//       return false
//     }
//   } else {
//     return false
//   }
// }


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
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    timeRange = { $gte: twentyFourHoursAgo };
  } else if (time === '3days') {
    const sevenDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    timeRange = { $gte: sevenDaysAgo };
  } else if (time === '7days') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    timeRange = { $gte: sevenDaysAgo };
  } else if (time === '30days') {
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);
    timeRange = { $gte: lastMonthStart, $lte: lastMonthEnd };
  }
  return timeRange
}


async function isImage(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      const contentType = response.headers.get('Content-Type');
      // console.log(contentType)
      return contentType && contentType.startsWith('image/');
    }
    return false;
  } catch (error) {
    console.error('Error checking image URL:', error);
    return false;
  }
}

export async function checkImageUrls(cast) {
  const { embeds } = cast;

  if (embeds && embeds.length > 0) {
    const updatedEmbeds = await Promise.all(embeds.map(async (embed) => {
      const isImageResult = await isImage(embed.url);
      return {
        ...embed,
        type: isImageResult ? 'image' : 'other'
      };
    }));
    
    return {
      ...cast,
      embeds: updatedEmbeds
    };
  }
  
  return cast; // Return original cast object if embeds array is empty or undefined
}
