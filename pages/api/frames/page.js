import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    // console.log('api/frames/page 15:', req.query.id)
    // console.log('api/frames/page 16:', req.query.page)
    // console.log('api/frames/page 17:', req.query.total)
    // console.log('api/frames/page 19:', req.body.untrustedData.buttonIndex)
    // console.log('api/frames/page 20:', req.body.untrustedData.url)
    const articleHash = req.query.id;
    try {
      const page = Number(req.query.page);
      const articleHash = req.query.id;
      const username = req.query.user;
      const totalPages = Number(req.query.total);

      const imageUrl = `${baseURL}/api/frames/image?id=${articleHash}&page=${page}`;
      let button1 = `<meta name="fc:frame:button:1" content="Restart">
      <meta name="fc:frame:button:1:action" content="post">
      <meta name="fc:frame:button:1:target" content="${baseURL}/api/frames/page?id=${articleHash}&page=0&user=${username}&total=${totalPages}" />`

      let button2 = `
      <meta name="fc:frame:button:2" content='Longcast' />
      <meta name="fc:frame:button:2:action" content="link" />
      <meta name="fc:frame:button:2:target" content="${baseURL}/${username}/articles/${articleHash}" />`

      let button3 = ''
      let button4 = ''
      if (page == 0 && totalPages > page+1) {
        button3 = `
        <meta name="fc:frame:button:3" content="Next Page [${page+2}/${totalPages}]">
        <meta name="fc:frame:button:3:action" content="post">
        <meta name="fc:frame:button:3:target" content="${baseURL}/api/frames/page?id=${articleHash}&page=${page+1}&user=${username}&total=${totalPages}" />`
    
      } else if (page > 0 && totalPages > page+1) {
        button3 = `
        <meta name="fc:frame:button:3" content="Prev. Page [${page}/${totalPages}]">
        <meta name="fc:frame:button:3:action" content="post">
        <meta name="fc:frame:button:3:target" content="${baseURL}/api/frames/page?id=${articleHash}&page=${page-1}&user=${username}&total=${totalPages}" />`
    
        button4 = `
        <meta name="fc:frame:button:4" content="Next Page [${page+2}/${totalPages}]">
        <meta name="fc:frame:button:4:action" content="post">
        <meta name="fc:frame:button:4:target" content="${baseURL}/api/frames/page?id=${articleHash}&page=${page+1}&user=${username}&total=${totalPages}" />`
      } else if (totalPages == page+1) {
        button3 = `
        <meta name="fc:frame:button:3" content="Prev. Page [${page}/${totalPages}]">
        <meta name="fc:frame:button:3:action" content="post">
        <meta name="fc:frame:button:3:target" content="${baseURL}/api/frames/page?id=${articleHash}&page=${page-1}&user=${username}&total=${totalPages}" />`
      }

      

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Recorded</title>
          <meta property="og:title" content="Longcast">
          <meta property="og:image" content="${imageUrl}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${imageUrl}">
          <meta name="fc:frame:post_url" content="${baseURL}/api/frames/page?id=${articleHash}&page=${page}&total=${totalPages}">
          ${button1}
          ${button2}
          ${button3}
          ${button4}

        </head>
        <body>
          <a href="${baseURL}/${username}/articles/${articleHash}">Return to @${username}'s Longcast</a>
        </body>
      </html>
    `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
  }
}

















