import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;


export default async function handler(req, res) {

  const { untrustedData } = req.body

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    
    try {

      let metatags = `
        <meta property="fc:frame:image" content={'${baseURL}/images/personal-how-to.png' />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />

        <meta property="fc:frame:button:1" content='Login' />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id' />

        <meta property="fc:frame:button:2" content='< Back' />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content='${baseURL}/api/frames/personal/install' />

        <meta property="fc:frame:button:3" content='Cast Action' />
        <meta property="fc:frame:button:3:action" content="link" />
        <meta property="fc:frame:button:3:target" content='https://warpcast.com/~/add-cast-action?name=%2B1+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App' />

        <meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

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

      let metatags = `
        <meta property="fc:frame:image" content={'${baseURL}/images/personal-how-to.png' />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />

        <meta property="fc:frame:button:1" content='Login' />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content='https://impact.abundance.id' />

        <meta property="fc:frame:button:2" content='< Back' />
        <meta property="fc:frame:button:2:action" content="post" />

        <meta property="fc:frame:button:2:target" content='${baseURL}/api/frames/personal/install' />

        <meta property="fc:frame:button:3" content='Cast Action' />
        <meta property="fc:frame:button:3:action" content="link" />
        <meta property="fc:frame:button:3:target" content='https://warpcast.com/~/add-cast-action?name=%2B1+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App' />

        <meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

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










