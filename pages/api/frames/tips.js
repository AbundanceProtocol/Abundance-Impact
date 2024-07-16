import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import connectToDatabase from "../../../libs/mongodb";
import User from "../../../models/User";
import Tip from  "../../../models/Tip";
import Cast from  "../../../models/Cast";
import Impact from  "../../../models/Impact";
import EcosystemRules from  "../../../models/EcosystemRules";
import { decryptPassword, getTimeRange, processTips, populateCast } from "../../../utils/utils";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  const { tip, time, curators, channels, tags, shuffle, referrer, eco, ecosystem, refresh, retry } = req.query;
  const { untrustedData } = req.body

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    console.log('14:', tip, time, curators, shuffle, referrer, eco, ecosystem, req.query, refresh)

    const points = '$' + eco
    const fid = untrustedData?.fid
    // const castHash = untrustedData?.castId?.hash
    // const authorFid = untrustedData?.castId?.fid
    const inputText = untrustedData?.inputText
    // const button = untrustedData?.buttonIndex
    // console.log('20:', points, fid, castHash, authorFid)

    // let percent = tip
    let timeQuery = '&time=all'
    let curatorsQuery = ''
    let shuffleQuery = '&shuffle=true'
    let referrerQuery = ''
    let ecoQuery = '&eco=IMPACT'
    let ecosystemQuery = '&ecosystem=abundance'
    if (time) {
      timeQuery = 'time=' + time
    }
    if (curators) {
      for (const curator of curators) {
        curatorsQuery += '&curators=' + curator
      }
    }
    if (shuffle || shuffle == false) {
      shuffleQuery = '&shuffle=' + shuffle
    }
    if (referrer) {
      referrerQuery = '&referrer=' + referrer
    }
    if (eco) {
      ecoQuery = '&eco=' + eco
    }
    if (ecosystem) {
      ecosystemQuery = '&ecosystem=' + ecosystem
    }

    let timeRange = null
    // if (time) {
    //   timeRange = getTimeRange(time)
    // }

    const loginImg = `${baseURL}/images/login.jpg`;
    const processingImg = `${baseURL}/images/processing.jpg`;
    const finalImg = `${baseURL}/images/processing.jpg`;
    const inputImg = `${baseURL}/images/input.jpg`;
    const issueImg = `${baseURL}/images/issue.jpg`;
    const successImg = `${baseURL}/images/success.jpg`;

    const impactLink = `https://warpcast.com/abundance/0x43ddd672`
    const retryPost = `${baseURL}/api/frames/tips?tip=0${timeQuery + curatorsQuery + shuffleQuery + referrerQuery + ecoQuery + ecosystemQuery}`
    const loginUrl = `${baseURL}/~/ecosystems/${ecosystem}/tips-login?tip=0${timeQuery + curatorsQuery + shuffleQuery + referrerQuery + ecoQuery}`
    const sendPost = `${baseURL}/api/frames/tips?tip=0${timeQuery + curatorsQuery + shuffleQuery + referrerQuery + ecoQuery}`
    const postUrl = `${baseURL}/~/ecosystems/${ecosystem}/tips-login?tip=0${timeQuery + curatorsQuery + shuffleQuery + referrerQuery + ecoQuery}`
    const shareUrl = `${baseURL}/~/ecosystems/${ecosystem}/tips?tip=0${timeQuery + curatorsQuery + shuffleQuery + referrerQuery + ecoQuery}`

    // const encodedShareUrl = encodeURIComponent(shareUrl); 
    const shareText = 'I just multi-tipped builders and creators on /impact. Try it out here:'
    const encodedShareText = encodeURIComponent(shareText); 


    const shareLink = `https://warpcast.com/~/compose?text=${encodedShareText}&embeds[]=${shareUrl}`
    
    // Example usage
    // const input = "500 $degen, 400 $HAM 10000 $wild 🍖x400, 300 $HAM";
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
          ${metatags}
        </head>
        <body>
          <div>Tip frame</div>
        </body>
      </html>
      `);

    } else {

      function formatStringToArray(input) {
        // Split the input string by spaces and commas
        const items = input.split(/[\s,]+/);
      
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
              amount *= 10;
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
            const amount = parseInt(match[1], 10) * 10;
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
          min: 180
        }));
      
        return result;
      }

      allowances = formatStringToArray(inputText);
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
          ${metatags}
        </head>
        <body>
          <div>Tip frame</div>
        </body>
      </html>
      `);

    } else {

      async function getSigner(fid) {
        try {
          await connectToDatabase();
          const user = await User.findOne({ fid }).select('uuid').exec();
          if (user) {
            const signer = decryptPassword(user.uuid, secretKey)
            // console.log(user)
            return signer
          } else {
            return null
          }
        } catch (error) {
          console.error('Error getting User:', error)
          return null
        }
      }

      const decryptedUuid = await getSigner(fid)

      if (!decryptedUuid) {

        let metatags = `
        <meta name="fc:frame:button:1" content="Login /impact">
        <meta name="fc:frame:button:1:action" content="link">
        <meta name="fc:frame:button:1:target" content="${loginUrl}" />
        <meta name="fc:frame:button:1" content="Refresh">
        <meta name="fc:frame:button:1:action" content="post">
        <meta name="fc:frame:button:1:target" content="${retryPost}" />
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
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
        `);

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

          async function getUserSearch(time, tags, channel, curator, shuffle, points) {
    
            const page = 1;
            const limit = 10;
            const skip = (page - 1) * limit;
        
            let query = {};
                
            async function getCuratorIds(fids) {
              try {
                await connectToDatabase();
                const impacts = await Impact.find({ curator_fid: { $in: fids }, points });
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
        
            // if (channel && channel.length > 0) {
            //   query.cast_channel = { $in: [channel] };
            // }
        
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
      
          async function fetchCasts(query, shuffle, page, limit) {
            console.log('354:', query, shuffle)
            try {
              await connectToDatabase();
          
              let totalCount;
              let returnedCasts = []
              let random = true
              if (!random) {
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
          
          const { casts, totalCount } = await fetchCasts(query, shuffle === true);
          // console.log('223', casts, totalCount)
  
          return { casts, totalCount }
          }  
      
          const { casts, totalCount } = await getUserSearch(timeRange, tags, channels, curators, shuffle, points)

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
    
          const { castData, coinTotals } = await processTips(displayedCasts, fid, allowances, ecoName, curatorPercent)
        
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
                    amount = coin.tip * 10
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
      
              await new Promise(resolve => setTimeout(resolve, 80));
            }
            return tipCounter
          }

          const remainingTip = await sendRequests(castData, decryptedUuid, apiKey);

          if (remainingTip || remainingTip == 0) {

            let metatags = `
            <meta name="fc:frame:button:1" content="Share contribution">
            <meta name="fc:frame:button:1:action" content="link">
            <meta name="fc:frame:button:1:target" content="${shareLink}" />
            <meta name="fc:frame:button:2" content="Tip more">
            <meta name="fc:frame:button:2:action" content="post">
            <meta name="fc:frame:button:2:target" content="${retryPost}" />
            <meta name="fc:frame:button:3" content="What's /impact">
            <meta name="fc:frame:button:3:action" content="link">
            <meta name="fc:frame:button:3:target" content="${impactLink}" />
            <meta property="og:image" content="${successImg}">
            <meta name="fc:frame:image" content="${successImg}">
            <meta name="fc:frame:post_url" content="${sendPost}">
            <meta name="fc:frame:input:text" content="Eg.: 1000 $Degen, 500 $FARTHER" />`
      
            res.setHeader('Content-Type', 'text/html');
            res.status(200)
            
            .send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Tips | Impact App</title>
                <meta name="fc:frame" content="vNext">
                <meta property="og:title" content="Multi-Tip">
                ${metatags}
              </head>
              <body>
                <div>Tip frame</div>
              </body>
            </html>
            `);

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
                ${metatags}
              </head>
              <body>
                <div>Tip frame</div>
              </body>
            </html>
            `);

          }

        } catch (error) {
          console.log('Error sending tip:', error)

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
              ${metatags}
            </head>
            <body>
              <div>Tip frame</div>
            </body>
          </html>
          `);

        }
      }
    }
  }
}










