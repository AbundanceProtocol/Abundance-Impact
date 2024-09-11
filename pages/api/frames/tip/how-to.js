import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;


export default async function handler(req, res) {

  const { time, curators, eco, ecosystem } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    
    let metatags = `
    <meta property="fc:frame:image" content='${baseURL}/images/personal-how-to.png' />

    <meta property="fc:frame:button:1" content="What's /impact?" />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:1:target" content='${baseURL}/api/frames/tip/install?${qs.stringify({ time, curators, eco, ecosystem })}' />

    <meta property="fc:frame:button:2" content='< Back' />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content='${baseURL}/api/frames/tip/start?${qs.stringify({ time, curators, eco, ecosystem })}' />

    <meta name="fc:frame:post_url" content='${baseURL}' />`

    try {

      res.setHeader('Content-Type', 'text/html');
      res.status(200)
      .send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tips | Impact App</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Personal /impact">
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
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
            <title>Tips | Impact App</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Personal /impact">
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










