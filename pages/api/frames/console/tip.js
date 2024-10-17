import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../../libs/mongodb";
import User from "../../../../models/User";
import Tip from  "../../../../models/Tip";
import Cast from  "../../../../models/Cast";
import Circle from  "../../../../models/Circle";
import Impact from  "../../../../models/Impact";
import EcosystemRules from  "../../../../models/EcosystemRules";
import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../../utils/utils";
import _ from "lodash";
import qs from "querystring";
import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)
  console.log('isValid:', isValid)
  const { time, curators, channels, tags, eco, ecosystem, time1 } = req.query;
  const { untrustedData } = req.body

  if (req.method !== 'POST' || !ecosystem || !eco) {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {

    function sanitizeInput(input) {
      input = _.trim(input);
      input = _.replace(input, /[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
      return input;
    }

    function formatStringToArray(input) {
    
      // Sanitize the input
      const sanitizedInput = sanitizeInput(input)

      // Split the input string by spaces and commas
      const items = sanitizedInput.split(/[\s,]+/);
    
      // Initialize an object to track the combined amounts for each coin
      const combinedAmounts = {};
    
      // Iterate through the items
      for (let i = 0; i < items.length; i++) {
        // Check if the item is a number (amount)
        if (!isNaN(items[i])) {
          let amount = parseInt(items[i], 10);
          let coin = items[i + 1].toUpperCase();
          
          // Check for specific coins that need special handling
          if (coin === '$HAM') {
            coin = '$TN100x';
          }
          
          // Combine amounts for the same coin
          if (combinedAmounts[coin]) {
            combinedAmounts[coin] += amount;
          } else {
            combinedAmounts[coin] = amount;
          }
        } 
        // Check if the item matches the pattern 🍖x<number>
        else if (/🍖x\d+/i.test(items[i])) {
          const match = items[i].match(/🍖x(\d+)/i);
          const amount = parseInt(match[1], 10);
          const coin = '$TN100x';
    
          // Combine amounts for the same coin
          if (combinedAmounts[coin]) {
            combinedAmounts[coin] += amount;
          } else {
            combinedAmounts[coin] = amount;
          }
        }
      }
    
      // Convert the combined amounts object into the desired array format
      const result = Object.keys(combinedAmounts).map(coin => ({
        allowance: combinedAmounts[coin],
        totalTip: combinedAmounts[coin],
        token: coin,
        set: true,
        min: 200
      }));
    
      return {result, text: sanitizedInput};
    }

    async function getSigner(fid) {
      try {
        await connectToDatabase();
        const user = await User.findOne({ fid }).select('uuid username').exec();
        if (user) {
          const signer = decryptPassword(user.uuid, secretKey)
          // console.log(user)
          return {decryptedUuid: signer, username: user.username}
        } else {
          return {decryptedUuid: null, username: null}
        }
      } catch (error) {
        console.error('Error getting User:', error)
        return {decryptedUuid: null, username: null}
      }
    }

    async function checkTips(fid, points, startTime, endTime) {
      try {
        await connectToDatabase();
        const tips = await Tip.countDocuments({
          tipper_fid: fid,
          points: points,
          createdAt: {
            $gte: startTime,
            $lte: endTime
          }});

        if (tips && tips > 0) {
          return true
        } else {
          return false
        }
      } catch (err) {
        console.error(err);
        return false;
      }
    }

    async function getFids(fid, startTime, endTime, points) {
      try {
        await connectToDatabase();
        const result = await Tip.find(
        {
          tipper_fid: fid,
          points: points,
          createdAt: {
            $gte: startTime,
          }
        }, {receiver_fid: 1, _id: 0}).limit(15).lean()
        if (result) {
          const tippedFids = result.map(doc => doc.receiver_fid);
          const uniqueFids = [...new Set(tippedFids)]; 
          console.log(uniqueFids)
          return uniqueFids
        } else {
          return []
        }
      } catch (error) {
        console.error('Error getting PFPs:', error)
        return []
      }
    }

    async function createCircle(fid, time, curators, text, ecosystem, username, points, circles) {
      try {
        await connectToDatabase();
        let circle = new Circle({ 
          fid, time, curators, text, ecosystem, username, points, circles
        });
        await circle.save()
        const objectIdString = circle._id.toString();
        return objectIdString
      } catch (error) {
        console.error("Error while fetching circles:", error);
        return null
      }
    }

    let tipText = ''

    const now = new Date();
    const timeMinus3 = new Date(now.getTime() - 3 * 60 * 1000);
    const timePlus1 = new Date(now.getTime() + 1 * 60 * 1000);
    const points = '$' + eco

    const fid = untrustedData?.fid
    const loginImg = `${baseURL}/images/login.jpg`;
    const tipsImg = `${baseURL}/images/frame36.gif`
    const inputImg = `${baseURL}/images/input.jpg`;
    const issueImg = `${baseURL}/images/issue.jpg`;
    let circlesImg = ''
    
    console.log('14-1:', req.query)

    const exploreLink = `${baseURL}/~/ecosystems/${ecosystem}?${qs.stringify({ time: 'all', curators, eco })}`

    const impactLink = `https://warpcast.com/abundance/0x43ddd672`

    const retryPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem })}`

    const refreshPost = `${baseURL}/api/frames/tip/refresh?${qs.stringify({ time, curators, eco, ecosystem, time1: timeMinus3 })}`

    const startPost = `${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem })}`

    const loginUrl = `${baseURL}/?${qs.stringify({ eco: points })}`

    const sendPost = `${baseURL}/api/frames/tip/tip?${qs.stringify({ time, curators, eco, ecosystem })}`

    const postUrl = `${baseURL}/~/ecosystems/${ecosystem}/tip-login?${qs.stringify({ time, curators, eco })}`
    
    let shareText = 'I just multi-tipped builders and creators on /impact. Try it out here:'

    let shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem}/tip-share-v2?${qs.stringify({ time, curators, eco })}`

    let encodedShareText = encodeURIComponent(shareText); 
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`
    
    try {

      const inputText = untrustedData?.inputText
      console.log('inputText', inputText)

      let curator = 3
      if (typeof curators === 'string') {
        curator = parseInt(curators);
      } else if (Array.isArray(curators) && curators.length > 0) {
        curator = curators[0]
      }
      console.log('inputText2', inputText)
  
      let timeRange = null
      // if (time) {
      //   timeRange = getTimeRange(time)
      // } 
      
      // Example usage
      // const input = "500 $degen, 400 $HAM 10000 🍖x400, 300 $HAM";
      let allowances = []
  
      if (!inputText || inputText == '') {
        let metatags = `
        <meta name="fc:frame:button:1" content="Retry">
        <meta name="fc:frame:button:1:action" content="post">
        <meta name="fc:frame:button:1:target" content="${retryPost}" />
        <meta property="og:image" content="${inputImg}">
        <meta name="fc:frame:image" content="${inputImg}">
        <meta name="fc:frame:post_url" content="${postUrl}">`
  
        res.setHeader('Content-Type', 'text/html');
        res.status(200)
        .send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Tips | Impact App</title>
              <meta name="fc:frame" content="vNext">
              <meta property="og:title" content="Multi-Tip">
              <meta property="fc:frame:image:aspect_ratio" content="1:1" />
              ${metatags}
            </head>
            <body>
              <div>Tip frame</div>
            </body>
          </html>
        `);
        return;
      } else {
  
        const {result, text} = formatStringToArray(inputText);
        allowances = result
        tipText = text
        console.log('allowances', allowances)
      }
  
      if (allowances?.length == 0) {
        let metatags = `
        <meta name="fc:frame:button:1" content="Retry">
        <meta name="fc:frame:button:1:action" content="post">
        <meta name="fc:frame:button:1:target" content="${retryPost}" />
        <meta property="og:image" content="${inputImg}">
        <meta name="fc:frame:image" content="${inputImg}">
        <meta name="fc:frame:post_url" content="${postUrl}">`
  
        res.setHeader('Content-Type', 'text/html');
        res.status(200)
        .send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Tips | Impact App</title>
              <meta name="fc:frame" content="vNext">
              <meta property="og:title" content="Multi-Tip">
              <meta property="fc:frame:image:aspect_ratio" content="1:1" />
              ${metatags}
            </head>
            <body>
              <div>Tip frame</div>
            </body>
          </html>
        `);
        return;
      } else {
      
        const {decryptedUuid, username} = await getSigner(fid)
  
        if (!decryptedUuid) {
          console.log('d')

          let metatags = `
          <meta name="fc:frame:button:1" content="Login /impact">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="${loginUrl}" />
          <meta name="fc:frame:button:2" content="Refresh">
          <meta name="fc:frame:button:2:action" content="post">
          <meta name="fc:frame:button:2:target" content="${retryPost}" />
          <meta property="og:image" content="${loginImg}">
          <meta name="fc:frame:image" content="${loginImg}">
          <meta name="fc:frame:post_url" content="${postUrl}">`
  
          res.setHeader('Content-Type', 'text/html');
          res.status(200)
          .send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Tips | Impact App</title>
                <meta name="fc:frame" content="vNext">
                <meta property="og:title" content="Multi-Tip">
                <meta property="fc:frame:image:aspect_ratio" content="1:1" />
                ${metatags}
              </head>
              <body>
                <div>Tip frame</div>
              </body>
            </html>
          `);
          return;
        } else {
  
          try {
  
            async function getCuratorPercent(points) {
              try {
                await connectToDatabase();
  
                const ecoData = await EcosystemRules.findOne({ ecosystem_points_name: points }).select('percent_tipped ecosystem_name').exec();
                // console.log(ecoData)
                if (ecoData) {
                  return {
                    curatorPercent: ecoData.percent_tipped, ecoName: ecoData.ecosystem_name }
                } else {
                  return { curatorPercent: 10, ecoName: ecosystem }
                }
              } catch (error) {
                console.error('Error:', error);
                return { curatorPercent: 10, ecoName: ecosystem }
              }
            }
  
            const {curatorPercent, ecoName } = await getCuratorPercent(points)
  
            async function getUserSearch(time, tags, channel, curator, points) {
      
              const page = 1;
              const limit = 10;
              const skip = (page - 1) * limit;
          
              let query = {};
                  
              async function getCuratorIds(fids) {
                try {
                  await connectToDatabase();
                  const impacts = await Impact.find({ curator_fid: { $in: fids }, points }).select('_id');
                  const impactIds = impacts.map(impact => impact._id);
                  return impactIds
                } catch (error) {
                  console.error("Error while fetching casts:", error);
                  return null
                }   
              }
              
              if (time) {
                query.createdAt = { $gte: time } ;
              }
      
              if (points) {
                query.points = points
              }
            
              if (curator && curator.length > 0) {
                let curatorFids
  
                if (typeof curator === 'string') {
                  curatorFids = [parseInt(curator)];
                } else if (Array.isArray(curator) && curator.length > 0) {
                  curatorFids = curator.map(fid => parseInt(fid));
                }
  
                // curatorFids = curator.map(fid => parseInt(fid));
          
                let impactIds
                if (curatorFids) {
                  impactIds = await getCuratorIds(curatorFids)
                }
                if (impactIds) {
                  query['impact_points'] = { $in: impactIds }
                }
              }
              
              // if (tags && tags.length > 0) {
              //   query.cast_tags = { $in: [tags] };
              // }
          
              if (req.query['channel[]'] && req.query['channel[]'].length > 0) {

                if (typeof req.query['channel[]'] === 'string') {
                  query.cast_channel = { $in: [req.query['channel[]']]};
                } else if (Array.isArray(req.query['channel[]']) && req.query['channel[]'].length > 0) {
                  query.cast_channel = { $in: req.query['channel[]']};
                }
                      
                // query.cast_channel = { $in: [req.query['channel[]']] };
              }
          
              // if (text) {
              //   query.cast_text = { $regex: text, $options: 'i' }; // Case-insensitive search
              // }
              
              function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
              }
        
            async function fetchCasts(query, page, limit) {
              try {
                await connectToDatabase();
            
                let totalCount;
                let returnedCasts = []
                let shuffle = true
                if (!shuffle) {
                  totalCount = await Cast.countDocuments(query);
                  returnedCasts = await Cast.find(query)
                    .sort({ impact_total: -1 })
                    .populate('impact_points')
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
                  // console.log('63', returnedCasts)
                } else {
        
                  totalCount = await Cast.countDocuments(query);
            
                  // Calculate the number of documents to be sampled from each range
                  const top20PercentCount = Math.ceil(totalCount * 0.2);
                  const middle40PercentCount = Math.ceil(totalCount * 0.4);
                  const bottom40PercentCount = totalCount - top20PercentCount - middle40PercentCount;
            
                  // Fetch documents from each range
                  const top20PercentCasts = await Cast.find(query)
                    .sort({ impact_total: -1 })
                    .populate('impact_points')
                    .limit(top20PercentCount)
                    .exec();
                  const middle40PercentCasts = await Cast.find(query)
                    .sort({ impact_total: -1 })
                    .populate('impact_points')
                    .skip(top20PercentCount)
                    .limit(middle40PercentCount)
                    .exec();
                  const bottom40PercentCasts = await Cast.find(query)
                    .sort({ impact_total: -1 })
                    .populate('impact_points')
                    .skip(top20PercentCount + middle40PercentCount)
                    .limit(bottom40PercentCount)
                    .exec();
            
                  returnedCasts = top20PercentCasts.concat(middle40PercentCasts, bottom40PercentCasts);
            
                  returnedCasts.sort((a, b) => b.impact_total - a.impact_total);
            
                  returnedCasts = returnedCasts.reduce((acc, current) => {
                    const existingItem = acc.find(item => item._id === current._id);
                    if (!existingItem) {
                      acc.push(current);
                    }
                    return acc;
                  }, [])
        
                  returnedCasts = shuffleArray(returnedCasts);
            
                  returnedCasts = returnedCasts.slice(0, limit);
                }
            
                if (returnedCasts && returnedCasts.length > 10) {
                  returnedCasts = returnedCasts.slice(0, 10);
                }
            
                // console.log('113', returnedCasts)
                if (!returnedCasts) {
                  returnedCasts = []
                }
                return { casts: returnedCasts, totalCount };
              } catch (err) {
                console.error(err);
                return { casts: null, totalCount: null};
              }
            }
            
            const { casts, totalCount } = await fetchCasts(query);
            // console.log('223', casts, totalCount)
    
            return { casts, totalCount }
            }  
        
            const { casts } = await getUserSearch(timeRange, tags, channels, curators, points)
  
            // console.log(casts)
            // console.log(casts[0].impact_points)
    
            let filteredCasts = await casts.reduce((acc, current) => {
              const existingItem = acc.find(item => item._id === current._id);
              if (!existingItem) {
                acc.push(current);
              }
              return acc;
            }, [])
    
            let sortedCasts = filteredCasts.sort((a, b) => b.impact_total - a.impact_total);
      
            let displayedCasts = await populateCast(sortedCasts)

            let curatorHashes = []

            async function getHash(fid) {
              try {
                await connectToDatabase();
                const user = await User.findOne({ fid }).select('set_cast_hash').exec();
                if (user) {
                  const castHash = user.set_cast_hash
                  return castHash
                } else {
                  return null
                }
              } catch (error) {
                console.error('Error getting User:', error)
                return null
              }
            }

            for (const cast of displayedCasts) {
              if (cast.impact_points && cast.impact_points.length > 0) {
                for (const subCast of cast.impact_points) {
                  let fidExists = curatorHashes.some(item => item.fid == subCast.curator_fid)
                  if (subCast.curator_fid !== fid && !fidExists) {
                    let curatorHash = await getHash(subCast.curator_fid)
                    let hash = {fid: subCast.curator_fid, hash: curatorHash, impact_points: subCast.impact_points}
                    curatorHashes.push(hash)
                    subCast.target_cast_hash = curatorHash
                  } else if (fidExists) {
                    const curatorIndex = curatorHashes.findIndex(item => item.fid == subCast.curator_fid);
                    if (curatorIndex !== -1) {
                      subCast.target_cast_hash = curatorHashes[curatorIndex].hash
                      curatorHashes[curatorIndex].impact_points += subCast.impact_points
                    }
                  }
                }
              }
            }

            for (const cast of displayedCasts) {
              if (cast.impact_points && cast.impact_points.length > 0) {
                for (const subCast of cast.impact_points) {
                  subCast.impact_points = 0
                }
              }
            }
            
            if (curatorHashes && curatorHashes.length > 0) {
              let i = 0
              for (const cast of displayedCasts) {
                if (cast.impact_points && cast.impact_points.length > 0) {
                  for (const subCast of cast.impact_points) {
                    if (curatorHashes.length > i && subCast.curator_fid == curatorHashes[i].fid) {
                      subCast.impact_points = curatorHashes[i].impact_points;
                      i++;
                    }
                  }
                }
              }
            }
      
            const { castData, circle, pfps } = await processTips(displayedCasts, fid, allowances, ecoName, curatorPercent)
            console.log('pfps', pfps)
            const jointFids = circle.join(',')

            async function sendRequests(data, signer, apiKey) {
              const base = "https://api.neynar.com/";
              const url = `${base}v2/farcaster/cast`;
              let tipCounter = 0;
              for (const cast of data) {
                const castText = cast.text;
                const parentUrl = cast.castHash;
                let body = {
                  signer_uuid: signer,
                  text: castText,
                };
        
                if (parentUrl) {
                  body.parent = parentUrl;
                }
        
                try {
                  const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'api_key': apiKey,
                    },
                    body: JSON.stringify(body),
                  });
        
                  if (!response.ok) {
                    // console.error(`Failed to send request for ${castText}`);
                  } else {
                    // console.log(`Request sent successfully for ${castText}`);
                  }
                  let tips = []
        
                  for (const coin of cast.allCoins) {
                    let amount = 0
                    if (coin.coin == '$TN100x' && coin.tip > 0) {
                      amount = coin.tip
                    } else if (coin.tip > 0) {
                      amount = coin.tip
                    }
                    if (coin.tip > 0) {
                      let tip = {currency: coin.coin, amount: amount}
                      tips.push(tip)
                    }
                  }
                  
                  await Tip.create({
                    receiver_fid: cast.fid,
                    tipper_fid: fid,
                    points: points, 
                    cast_hash: cast.castHash,
                    tip: tips,
                  });
                  // tipCounter += Number(cast.tip)
        
                } catch (error) {
                  console.error(`Error occurred while sending request for ${castText}:`, error);
                }
        
                await new Promise(resolve => setTimeout(resolve, 60));
              }
              return tipCounter
            }

            const circleId = await createCircle(fid, time, curators, tipText, eco, username, points, pfps)

            circlesImg = `${baseURL}/api/frames/tip/circle?${qs.stringify({ id: circleId })}`

            const remainingTip = await sendRequests(castData, decryptedUuid, apiKey);
            // const remainingTip = 0 

            shareUrl = `https://impact.abundance.id/~/ecosystems/${ecosystem}/tip-share-v2?${qs.stringify({ id: circleId })}`
          
            async function getCurator(curator, points) {

              async function getUsername(fids, points) {
                try {
                  await connectToDatabase();
                  const users = await User.find({ fid: { $in: fids }, ecosystem_points: points }).select('username').exec();
                  if (users?.length == 1) {
                    let usernames = `@${users[0].username}`
                    return usernames
                  } else if (users?.length == 2) {
                    let usernames = `@${users[0].username} & @${users[1].username}`
                    return usernames
                  } else if (users?.length > 2) {
                    let usernames = `@${users[0].username}, @${users[1].username} & co`
                    return usernames
                  } else {
                    return null
                  }
                } catch (error) {
                  console.error("Error while fetching casts:", error);
                  return null
                }   
              }

              if (curator && curator.length > 0) {
                let curatorFids
  
                if (typeof curator === 'string') {
                  curatorFids = [parseInt(curator)];
                } else if (Array.isArray(curator) && curator.length > 0) {
                  curatorFids = curator.map(fid => parseInt(fid));
                }
          
                let usernames = null
                if (curatorFids) {
                  usernames = await getUsername(curatorFids, points)
                }
                return usernames
              } else {
                return null
              }
            }

            if (curators && fid == curators) {
              shareText = 'I just multi-tipped builders & creators on /impact.\n\nSupport my nominees here:'
            } else if (curators?.length > 0) {
              const curatorName = await getCurator(curators, points)
              if (curatorName) {
                shareText = `I just multi-tipped ${curatorName}'s curation of builders & creators thru /impact by @abundance.\n\nSupport ${curatorName}'s nominees here:`
              } else {
                shareText = 'I just multi-tipped builders & creators on /impact. Try it out here:'
              }
            } else {
              shareText = 'I just multi-tipped builders & creators on /impact. Try it out here:'
            }
            encodedShareText = encodeURIComponent(shareText)
          
            encodedShareUrl = encodeURIComponent(shareUrl); 
            shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

            if (remainingTip || remainingTip == 0) {
              console.log('e')

              let metatags = `
              <meta name="fc:frame:button:1" content="Share contribution">
              <meta name="fc:frame:button:1:action" content="link">
              <meta name="fc:frame:button:1:target" content="${shareLink}" />
              <meta name="fc:frame:button:2" content="Tip more >">
              <meta name="fc:frame:button:2:action" content="post">
              <meta name="fc:frame:button:2:target" content="${startPost}" />
              <meta name="fc:frame:button:3" content="What's /impact">
              <meta name="fc:frame:button:3:action" content="link">
              <meta name="fc:frame:button:3:target" content="${impactLink}" />
              <meta name="fc:frame:button:4" content="Refresh">
              <meta name="fc:frame:button:4:action" content="post">
              <meta name="fc:frame:button:4:target" content="${refreshPost}" />
              <meta property="og:image" content="${circlesImg}">
              <meta name="fc:frame:image" content="${circlesImg}">
              <meta name="fc:frame:post_url" content="${postUrl}">`
        
              res.setHeader('Content-Type', 'text/html');
              res.status(200)
              .send(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Tips | Impact App</title>
                    <meta name="fc:frame" content="vNext">
                    <meta property="og:title" content="Multi-Tip">
                    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
                    ${metatags}
                  </head>
                  <body>
                    <div>Tip frame</div>
                  </body>
                </html>
              `);
              return;
            } else {
  
              let metatags = `
              <meta name="fc:frame:button:1" content="Retry">
              <meta name="fc:frame:button:1:action" content="post">
              <meta name="fc:frame:button:1:target" content="${retryPost}" />
              <meta property="og:image" content="${issueImg}">
              <meta name="fc:frame:image" content="${issueImg}">
              <meta name="fc:frame:post_url" content="${postUrl}">`
        
              res.setHeader('Content-Type', 'text/html');
              res.status(200)
              .send(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Tips | Impact App</title>
                    <meta name="fc:frame" content="vNext">
                    <meta property="og:title" content="Multi-Tip">
                    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
                    ${metatags}
                  </head>
                  <body>
                    <div>Tip frame</div>
                  </body>
                </html>
              `);
              return;
            }
  
          } catch (error) {
            console.log('Error sending tip:', error)
            console.log('f')

            let metatags = `
            <meta name="fc:frame:button:1" content="Retry">
            <meta name="fc:frame:button:1:action" content="post">
            <meta name="fc:frame:button:1:target" content="${retryPost}" />
            <meta property="og:image" content="${issueImg}">
            <meta name="fc:frame:image" content="${issueImg}">
            <meta name="fc:frame:post_url" content="${postUrl}">`
      
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Tips | Impact App</title>
                  <meta name="fc:frame" content="vNext">
                  <meta property="og:title" content="Multi-Tip">
                  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
                  ${metatags}
                </head>
                <body>
                  <div>Tip frame</div>
                </body>
              </html>
            `);
            return;
          }
        }
      }
      

    } catch (error) {
      console.log('g')

      let metatags = `
      <meta name="fc:frame:button:1" content="Retry">
      <meta name="fc:frame:button:1:action" content="post">
      <meta name="fc:frame:button:1:target" content="${retryPost}" />
      <meta property="og:image" content="${issueImg}">
      <meta name="fc:frame:image" content="${issueImg}">
      <meta name="fc:frame:post_url" content="${postUrl}">`

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tips | Impact App</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Multi-Tip">
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;
    }
  }
}










