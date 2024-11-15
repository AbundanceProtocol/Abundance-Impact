import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";
// import OptOut from "../../../../models/OptOut";
import connectToDatabase from "../../../../libs/mongodb";
// import User from '../../../../models/User';
// import Impact from '../../../../models/Impact';
// import Quality from '../../../../models/Quality';
// import Cast from "../../../../models/Cast";
// import EcosystemRules from "../../../../models/EcosystemRules";
import { init, validateFramesMessage } from "@airstack/frames";
import { decryptPassword } from "../../../../utils/utils";
import Tip from "../../../../models/Tip";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
const apiKey = process.env.NEYNAR_API_KEY
const secretKey = process.env.SECRET_KEY;
const encryptedTipUuid = process.env.ENCRYPTED_TIP_UUID
const userFid = process.env.USER_FID

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)
  // console.log('message', message)

  if (req.method === 'POST') {
    // const points = req.query.pt
    // const eco = points?.substring(1)
    const curatorFid = message?.data?.fid
    const castHash = req.body.untrustedData.castId.hash
    const authorFid = message?.data?.frameActionBody?.castId?.fid
    console.log('authorFid 01', authorFid, castHash, curatorFid)

    if ((curatorFid !== 9326 && curatorFid !== userFid) || authorFid == 9326) {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    } else {
      const decryptedUuid = decryptPassword(encryptedTipUuid, secretKey);
      console.log('userFid', userFid, castHash, authorFid, curatorFid)
      const castText = `I'm tipping:\n15 $DEGEN\nvia Abundance Ecosystem on /impact\n\n/impact lets you earn curator rewards while supporting your favorite creators & builders on Farcaster`

      const tips = { currency: '$degen', amount: 15 }

      async function sendTip(signer) {
        const base = "https://api.neynar.com/";
        const url = `${base}v2/farcaster/cast`;
        const body = {
          signer_uuid: signer,
          text: castText,
          parent: castHash
        };
      
        try {
          await connectToDatabase();
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api_key': apiKey,
            },
            body: JSON.stringify(body),
          });
      
          if (!response.ok) {
            console.error(`Failed to send request for ${body.text}`);
            return 0;
          }
          
          await Tip.create({
            receiver_fid: authorFid,
            tipper_fid: 9326,
            auto_tip: false,
            points: '$IMPACT',
            cast_hash: castHash,
            tip: tips,
          });
      
          return 1;
        } catch (error) {
          console.error(`Error in sendTip for ${castText}:`, error);
          return 0;
        }
      }

      const tipped = await sendTip(decryptedUuid)

      let balanceImg = ``
      if (tipped !== 0) {
        balanceImg = `${baseURL}/api/frames/admin/frame?${qs.stringify({ confirmed: 15 })}`
      } else {
        balanceImg = `${baseURL}/api/frames/admin/frame?${qs.stringify({ error: 404 })}`
      }


      let button1 = ''
      let button2 = ''
      let button3 = ''
      let button4 = ''
      let textField = ''
      let postUrl = `<meta name="fc:frame:post_url" content='https://impact.abundance.id' />`

      let metatags = button1 + button2 + button3 + button4 + textField + postUrl
      console.log('balanceImg', balanceImg)
      try {

        res.setHeader('Content-Type', 'text/html');
        res.status(200)
        .send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Impact Nav</title>
              <meta name="fc:frame" content="vNext">
              <meta property="og:title" content="Admin">
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
              <meta property="og:title" content="Admin">
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
  } else {
    const retryPost = `${baseURL}/api/frames/admin/status`
    let balanceImg = `${baseURL}/api/frames/admin/frame`
    const issueImg = `${baseURL}/images/issue.jpg`;
    const postUrl = `${baseURL}/~/ecosystems/abundance`
    let metatags = `
    <meta name="fc:frame:button:1" content="Back">
    <meta name="fc:frame:button:1:action" content="post">
    <meta name="fc:frame:button:1:target" content="${retryPost}" />
    <meta property="og:image" content="${balanceImg}">
    <meta name="fc:frame:image" content="${balanceImg}">
    <meta name="fc:frame:post_url" content="${postUrl}">`

    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tips | Impact App</title>
          <meta name="fc:frame" content="vNext">
          <meta property="og:title" content="Admin">
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