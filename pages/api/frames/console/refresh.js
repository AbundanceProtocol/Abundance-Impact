import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";
import OptOut from "../../../../models/OptOut";
import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';
import Impact from '../../../../models/Impact';
import Quality from '../../../../models/Quality';
import Cast from "../../../../models/Cast";
import EcosystemRules from "../../../../models/EcosystemRules";
// import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY ?? '')
  // const body = await req.body;
  // const {isValid, message} = await validateFramesMessage(body)

  if (req.method === 'POST') {
    const points = req.query.pt
    const eco = points?.substring(1)
    // const curatorFid = message?.data?.fid
    const curatorFid = req.body.untrustedData?.fid
    const castHash = req.body.untrustedData.castId.hash
    // const authorFid = message?.data?.frameActionBody?.castId?.fid
    console.log('28', points, curatorFid, castHash)

    let quality = 0
    let impact = 0

    async function checkOptOut(authorFid, points) {
      try {
        await connectToDatabase();
        let optOut = await OptOut.findOne({ fid: authorFid }).exec();
        if (optOut) {
          if (!optOut.opt_in) {
            return true;
          } else if (optOut.points.includes(points)) {
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Error checking opt out:", error);
        return false;
      }
    }

    const authorOptedOut = await checkOptOut(authorFid, points)
    
    async function getCuratorBalances(curatorFid, points) {
      try {
        await connectToDatabase();

        let user = await User.findOne({ fid: curatorFid, ecosystem_points: points }).select('remaining_i_allowance remaining_q_allowance ecosystem_name username').exec();
        console.log('37', user, curatorFid, points)
        let impactAllowance = null
        let qualityAllowance = null
        let ecoName = null
        let curator = ''

        if (user) {
          impactAllowance = user.remaining_i_allowance
          qualityAllowance = user.remaining_q_allowance
          ecoName = user.ecosystem_name
          curator = user.username
        }

        return { impactAllowance, qualityAllowance, ecoName, curator }
    
      } catch (error) {
        console.error("Error getting data:", error);
        return { impactAllowance: null, qualityAllowance: null, ecoName: null, curator: '' }
      }
    }

    let needLogin = false

    let { impactAllowance, qualityAllowance, ecoName, curator } = await getCuratorBalances(curatorFid, points)

    console.log('62', impactAllowance, qualityAllowance, ecoName, curator)

    if ((!impactAllowance && impactAllowance !== 0) || (!qualityAllowance && qualityAllowance !== 0) || !ecoName) {
      needLogin = true
      impactAllowance = 0
      qualityAllowance = 0
      quality = 0
      impact = 0
      removeStake = false

      async function getEcosystem(points) {
        try {
          await connectToDatabase();
  
          let eco = await EcosystemRules.findOne({ ecosystem_points_name: points }).exec();
  
          let ecoName = ''
  
          if (eco) {
            ecoName = eco.ecosystem_name
          }
  
          return { ecoName }
      
        } catch (error) {
          console.error("Error getting data:", error);
          return { ecoName: '' }
        }
      }

      ecoName = await getEcosystem(points)
    }

    async function getCastBalances(castHash, points) {
      try {
        await connectToDatabase();

        let cast = await Cast.findOne({ cast_hash: castHash, points }).exec();

        let impactBalance = null
        let qualityBalance = null
        let qualityTotal = null
        let author = ''
        let castImpact = 0

        if (cast) {
          impactBalance = cast.impact_total
          qualityBalance = cast.quality_balance
          qualityTotal = cast.quality_absolute
          author = cast.author_username
          castImpact = cast.impact_points.length
        }

        return { impactBalance, qualityBalance, qualityTotal, author, castImpact }
    
      } catch (error) {
        console.error("Error getting data:", error);
        return { impactBalance: null, qualityBalance: null, qualityTotal: null, author: '', castImpact: 0 }
      }
    }

    let impactBalance = 0, qualityBalance = 0, qualityTotal = 0, author = '', castImpact = 0
    
    if (!authorOptedOut) {
      ({ impactBalance, qualityBalance, qualityTotal, author, castImpact } = await getCastBalances(castHash, points))
    }

    console.log('124', impactBalance, qualityBalance, qualityTotal, author, castImpact)

    if (!authorOptedOut && ((!impactBalance && impactBalance !== 0) || (!qualityBalance && qualityBalance !== 0) || (!qualityTotal && qualityTotal !== 0))) {
      impactBalance = 0
      qualityBalance = 0
      qualityTotal = 0

      async function populateCast(fid, castString) {
        try {
          const base = "https://api.neynar.com/";
          const url = `${base}v2/farcaster/casts?casts=${castString}&viewer_fid=${fid}`;
          const response = await fetch(url, {
            headers: {
              accept: "application/json",
              api_key: apiKey,
            },
          });
          const castData = await response.json();
          // console.log(castData)
          let casts = []
          if (castData?.result?.casts?.length > 0) {
            casts = castData?.result?.casts[0]
          }
          
          return casts
        } catch (error) {
          console.error('Error handling GET request:', error);
          return []
        }
      }

      const getCastData = await populateCast(curatorFid, castHash)

      let castContext

      let userAddress = null
      if (getCastData?.author?.verified_addresses?.eth_addresses?.length > 0) {
        userAddress = getCastData?.author?.verified_addresses?.eth_addresses[0]
      }


      if (getCastData) {
        castContext = {
          author_fid: getCastData.author.fid,
          author_pfp: getCastData.author.pfp_url,
          author_username: getCastData.author.username,
          author_display_name: getCastData.author.display_name,
          cast_hash: getCastData.hash,
          cast_text: getCastData.text,
          cast_channel: getCastData.root_parent_url || null,
          channel_id: getCastData?.channel?.id || null,
          wallet: userAddress
        }

        let cast = new Cast({
          author_fid: castContext.author_fid,
          author_pfp: castContext.author_pfp,
          author_username: castContext.author_username,
          author_display_name: castContext.author_display_name,
          points: points,
          cast_hash: castContext.cast_hash,
          cast_text: castContext.cast_text,
          cast_channel: castContext.cast_channel,
          quality_balance: 0,
          quality_absolute: 0,
          impact_total: 0,
          impact_points: [],
          wallet: castContext?.wallet,
          channel_id: castContext?.channel_id
        });
  
        await cast.save()
  
        author = castContext.author_username

      }

    }

    if (needLogin !== true && !authorOptedOut) {

      async function getUserImpact(castHash, curatorFid, points) {
        try {
          await connectToDatabase();
  
          let impact = await Impact.findOne({ target_cast_hash: castHash, curator_fid: parseInt(curatorFid), points }).select('impact_points').exec()
          console.log('impact data', castHash, curatorFid, points, typeof curatorFid)
          console.log('impact', impact)

          if (impact) {
            return impact
          } else {
            return 0
          }
      
        } catch (error) {
          console.error("Error getting data:", error);
          return 0
        }
      }

      impact = await getUserImpact(castHash, curatorFid, points)
      console.log('impact2', impact)

      if (impact !== 0) {

        if (qualityTotal > 0) {
          removeStake = false
        } else {
          removeStake = true
        }
        
      } else {
        removeStake = false

        async function getUserQuality(castHash, curatorFid, points) {
          try {
            await connectToDatabase();
    
            let quality = await Quality.countDocuments({ target_cast_hash: castHash, curator_fid: curatorFid, points })
            console.log('quality', quality)
            if (quality) {
              return quality
            } else {
              return 0
            }
        
          } catch (error) {
            console.error("Error getting data:", error);
            return 0
          }
        }
  
        quality = await getUserQuality(castHash, curatorFid, points)
        console.log('quality2', quality)

      }

    }

    console.log('242-2', impactBalance, qualityBalance, qualityTotal, author, impactAllowance,  qualityAllowance, ecoName, needLogin, points, curator, impact, quality, castImpact, removeStake)

    let balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ecosystem: ecoName, login: needLogin, pt: points, cu: curator })}`

    let button1 = ''
    let button2 = ''
    let button3 = ''
    let button4 = ''
    let textField = ''
    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`


    // console.log('1', login == true, login)
    console.log('2', parseInt(castImpact) == 0, parseInt(impact) == 0, parseInt(quality) == 0, castImpact, impact, quality)
    console.log('3', parseInt(castImpact) !== 0, parseInt(impact) == 0, parseInt(quality) == 0, castImpact, impact, quality)
    console.log('4', parseInt(impact) !== 0, impact)
    console.log('5', parseInt(quality) !== 0, quality)



    if (needLogin == true) {
      console.log('1a')
      button1 = `<meta property="fc:frame:button:1" content='Login' />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${points}' />`
      button2 = `<meta property="fc:frame:button:2" content='Refresh' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/refresh?${qs.stringify({ pt: points })}' />`
    } else if (authorOptedOut) {
      console.log('1b')
      button1 = `<meta property="fc:frame:button:1" content='More >' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button2 = ''
      button3 = ''
      button4 = ''
      textField = ''
    } else if (parseInt(castImpact) == 0 && parseInt(impact) == 0 && parseInt(quality) == 0) {
      console.log('2')

      button1 = `<meta property="fc:frame:button:1" content='+1 ${points}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${points}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      textField = `<meta name="fc:frame:input:text" content="Add comment to nomination" />`
    } else if (parseInt(castImpact) !== 0 && parseInt(impact) == 0 && parseInt(quality) == 0) {
      console.log('3')

      button1 = `<meta property="fc:frame:button:1" content='+1 ${points}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button2 = `<meta property="fc:frame:button:2" content='Upvote' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: 1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button3 = `<meta property="fc:frame:button:3" content='Downvote' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: -1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button4 = `<meta property="fc:frame:button:4" content='More >' />
      <meta property="fc:frame:button:4:action" content="post" />
      <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
    } else if (parseInt(impact) !== 0 && removeStake == true) {
      console.log('4')
      button1 = `<meta property="fc:frame:button:1" content='+1 ${points}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${points}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button3 = `<meta property="fc:frame:button:3" content='-1 Unstake' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/unstake?${qs.stringify({ removeImpact: 1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button4 = `<meta property="fc:frame:button:4" content='More >' />
      <meta property="fc:frame:button:4:action" content="post" />
      <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
    } else if (parseInt(impact) !== 0) {
      console.log('4')
      button1 = `<meta property="fc:frame:button:1" content='+1 ${points}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${points}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
    } else if (parseInt(quality) !== 0) {
      console.log('5')
      button1 = `<meta property="fc:frame:button:1" content='Upvote' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: 1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button2 = `<meta property="fc:frame:button:2" content='Downvote' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: -1, iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB: impactBalance, qB: qualityBalance, qT: qualityTotal, author, iA: impactAllowance, qA: qualityAllowance, ec: ecoName, login: needLogin, pt: points, cu: curator, impact, ql: quality, cI: castImpact, hash: castHash, rS: removeStake })}' />`
    }

    let metatags = button1 + button2 + button3 + button4 + textField + postUrl

    try {

      res.setHeader('Content-Type', 'text/html');
      res.status(200)
      .send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${balanceImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${balanceImg}' />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;

    } catch (error) {

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${balanceImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${balanceImg}' />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;
    }

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(401).send(`Request failed`);
  }
}