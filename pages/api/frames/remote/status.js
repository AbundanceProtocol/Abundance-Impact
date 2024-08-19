import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;


export default async function handler(req, res) {

  const { untrustedData } = req.body
  const { iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu, impact, quality, cI } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    console.log('17', iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu, impact, quality, cI)
    let balanceImg = `${baseURL}/api/frames/remote/balance?${qs.stringify({ iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu })}`

    let button1 = ''
    let button2 = ''
    let button3 = ''
    let button4 = ''
    let textField = ''
    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

    if (login) {
      button1 = `<meta property="fc:frame:button:1" content='Login' />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`
    } else if (cI == 0 && impact == 0 && quality == 0) {
      button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/?eco=${pt}' />`
      textField = `<meta name="fc:frame:input:text" content="Add comment to nomination" />`
    } else if (cI !== 0 && impact == 0 && quality == 0) {
      button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button2 = `<meta property="fc:frame:button:2" content='Upvote' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button3 = `<meta property="fc:frame:button:3" content='Downvote' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button4 = `<meta property="fc:frame:button:4" content='More >' />
      <meta property="fc:frame:button:4:action" content="post" />
      <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/?eco=${pt}' />`
    } else if (impact !== 0) {
      button1 = `<meta property="fc:frame:button:1" content='+1 ${pt}' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button2 = `<meta property="fc:frame:button:2" content='+5 ${pt}' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/?eco=${pt}' />`
    } else if (quality !== 0) {
      button1 = `<meta property="fc:frame:button:1" content='Upvote' />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button2 = `<meta property="fc:frame:button:2" content='Downvote' />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/?eco=${pt}' />`
      button3 = `<meta property="fc:frame:button:3" content='More >' />
      <meta property="fc:frame:button:3:action" content="post" />
      <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/?eco=${pt}' />`
    }

    let metatags = button1 + button2 + button3 + button4 + textField + postUrl

    try {

      // let metatags = `
      //   <meta property="fc:frame:image" content='${balanceImg}' />

      //   <meta property="fc:frame:button:1" content='Login' />
      //   <meta property="fc:frame:button:1:action" content="link" />
      //   <meta property="fc:frame:button:1:target" content='https://impact.abundance.id' />

      //   <meta property="fc:frame:button:2" content='How it works' />
      //   <meta property="fc:frame:button:2:action" content="post" />
      //   <meta property="fc:frame:button:2:target" content='${baseURL}/api/frames/personal/how-to' />

      //   <meta property="fc:frame:button:3" content='Cast Action' />
      //   <meta property="fc:frame:button:3:action" content="link" />
      //   <meta property="fc:frame:button:3:target" content='https://warpcast.com/~/add-cast-action?name=%2B1+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App' />

      //   <meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

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

      // let metatags = `
      //   <meta property="fc:frame:image" content='${balanceImg}' />

      //   <meta property="fc:frame:button:1" content='Login' />
      //   <meta property="fc:frame:button:1:action" content="link" />
      //   <meta property="fc:frame:button:1:target" content='https://impact.abundance.id' />

      //   <meta property="fc:frame:button:2" content='How it works' />
      //   <meta property="fc:frame:button:2:action" content="post" />
      //   <meta property="fc:frame:button:2:target" content='${baseURL}/api/frames/personal/how-to' />

      //   <meta property="fc:frame:button:3" content='Cast Action' />
      //   <meta property="fc:frame:button:3:action" content="link" />
      //   <meta property="fc:frame:button:3:target" content='https://warpcast.com/~/add-cast-action?name=%2B1+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App' />

      //   <meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

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










