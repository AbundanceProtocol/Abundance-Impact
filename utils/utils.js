import axios from 'axios';

// shorten a hash address
export function shortenAddress(input) {
  if (input.length <= 8) {
    return input;
  } else {
    return input.substring(0, 4) + '...' + input.substring(input.length - 4);
  }
}
  

// time passed in days, hours, or minutes
export function timePassed(timestamp) {
  const currentTime = new Date();
  const pastTime = new Date(timestamp);
  const timeDifference = currentTime - pastTime;
  
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  if (days > 0) {
    const stamp = `${days}d`
    return stamp
  } else {
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    if (hours > 0) {
      const stamp = `${hours}h`
      return stamp
    } else {
      const minutes = Math.floor(timeDifference / (1000 * 60));
      if (minutes > 0) {
        const stamp = `${minutes}m`
        return stamp
      } else {
        return `now`
      }
    }
  }
}


// check if url is an image
export async function isImage(url) {
  if (url) {
    try {
      const response = await axios.get('/api/getHeader', {
        params: { url }
      })
      if (response.data) {
        return response.data
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  } else {
    return false
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
  let formattedNumber = number
  if (number > 1000000) {
    formattedNumber = (number / 1000000).toFixed(1) + 'M'
  } else if (number > 1000) {
    formattedNumber = (number / 1000).toFixed(1) + 'K'
  }
  return formattedNumber
}