import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
// import qs from "querystring";
// import { init, validateFramesMessage } from "@airstack/frames";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;


export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  // const {isValid, message} = await validateFramesMessage(body)
  // console.log('isValid:', isValid)
  // const { untrustedData } = req.body
  // const { confirmed } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    
    let balanceImg = `${baseURL}/api/frames/admin/frame`

    let button1 = ''
    let button2 = ''
    let button3 = ''
    let button4 = ''
    let textField = ''
    let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`


    // if (confirmed) {
    //   console.log('1')
    //   button1 = ``
    //   button2 = ``
    // } else {
    console.log('1b')
    button1 = `<meta property="fc:frame:button:1" content='1000 $degen' />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:1:target" content='https://impact.abundance.id/api/frames/admin/degen1000' />`
    button2 = `<meta property="fc:frame:button:2" content='200 $degen' />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content='https://impact.abundance.id/api/frames/admin/degen200' />`
    button3 = `<meta property="fc:frame:button:3" content='100 $degen' />
    <meta property="fc:frame:button:3:action" content="post" />
    <meta property="fc:frame:button:3:target" content='https://impact.abundance.id/api/frames/admin/degen100' />`;
    button4 = `<meta property="fc:frame:button:4" content='50 $degen' />
    <meta property="fc:frame:button:4:action" content="post" />
    <meta property="fc:frame:button:4:target" content='https://impact.abundance.id/api/frames/admin/degen50' />`;
    textField = ''
    // }

    let metatags = button1 + button2 + button3 + button4 + textField + postUrl

    try {
      console.log('x1')
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
      console.log('x2')

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(`
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