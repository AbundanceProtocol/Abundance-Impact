import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";
// import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;


export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY ?? '')
  // const body = await req.body;
  // const {isValid, message} = await validateFramesMessage(body)
  // console.log('isValid:', isValid)
  // const { untrustedData } = req.body
  const { iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu, impact, quality, cI, hash, handle, rS, oO } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    console.log('17', iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu, impact, quality, cI)
    console.log('18', typeof iB, typeof cI, typeof impact, typeof quality, typeof login)
    const needLogin = login == 'true'
    const unstake = rS == 'true'
    const optOut = oO == 'true'
    console.log('19', unstake, rS)
    
    let balanceImg = `${baseURL}/api/frames/console/balance?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu, oO })}`

    let button1 = ''
    let button2 = ''
    let button3 = ''
    let button4 = ''
    let textField = ''
    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

    console.log('1', needLogin)
    console.log('2', parseInt(cI) == 0, parseInt(impact) == 0, parseInt(quality) == 0, cI, impact, quality)
    console.log('3', parseInt(cI) !== 0, parseInt(impact) == 0, parseInt(quality) == 0, cI, impact, quality)
    console.log('4', parseInt(impact) !== 0, impact, unstake)
    console.log('5', parseInt(impact) !== 0, impact)
    console.log('6', parseInt(quality) !== 0, quality)

    if (needLogin) {
      console.log('1')
      button1 = `<meta property="fc:frame:button:1" content='Login' />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button2 = `<meta property="fc:frame:button:2" content='Refresh' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/refresh?${qs.stringify({ pt })}' />`
    } else if (optOut) {
      console.log('1b')
      button1 = `<meta property="fc:frame:button:1" content='More >' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button2 = ''
      button3 = ''
      button4 = ''
      textField = ''
    } else if (parseInt(cI) == 0 && parseInt(impact) == 0 && parseInt(quality) == 0) {
      console.log('2')
      button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      textField = `<meta name="fc:frame:input:text" content="Add comment to nomination" />`
    } else if (parseInt(cI) !== 0 && parseInt(impact) == 0 && parseInt(quality) == 0) {
      console.log('3')

      button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button2 = `<meta property="fc:frame:button:2" content='Upvote' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: 1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button3 = `<meta property="fc:frame:button:3" content='Downvote' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: -1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button4 = `<meta property="fc:frame:button:4" content='More >' />
      <meta property="fc:frame:button:4:action" content="post" />
      <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
    } else if (parseInt(impact) !== 0 && unstake) {
      console.log('4')
      button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button3 = `<meta property="fc:frame:button:3" content='-1 Unstake' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/unstake?${qs.stringify({ removeImpact: 1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button4 = `<meta property="fc:frame:button:4" content='More >' />
      <meta property="fc:frame:button:4:action" content="post" />
      <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
    } else if (parseInt(impact) !== 0) {
      console.log('5')
      button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/impact?${qs.stringify({ addImpact: 5, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
    } else if (parseInt(quality) !== 0) {
      console.log('6')
      button1 = `<meta property="fc:frame:button:1" content='Upvote' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: 1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button2 = `<meta property="fc:frame:button:2" content='Downvote' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/console/quality?${qs.stringify({ addQuality: -1, iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/console/more?${qs.stringify({ iB, qB, qT, author, iA, qA, ec: ecosystem, login, pt, cu, impact, ql: quality, cI, hash, handle, rS, oO })}' />`
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
  }
}