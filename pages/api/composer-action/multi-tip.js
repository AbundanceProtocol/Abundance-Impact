import qs from "querystring";
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
// const userSecret = process.env.USER_SECRET

export default async function handler(req, res) {
  // init(process.env.AIRSTACK_API_KEY ?? '')
  // const body = await req.body;
  // const {isValid, message} = await validateFramesMessage(body)
  const { untrustedData } = req.body

  if (req.method === 'POST') {
    // const curatorFid = message?.data?.fid
    const curatorFid = untrustedData?.fid

    res.status(200).json({ 
      type: 'form',
      title: 'Impact Multi-tip',
      url: `${baseURL}/~/studio/multi-tip-compose?${qs.stringify({ fid: curatorFid })}`,
    });
    return
   
  } else if (req.method === 'GET') {
    res.status(200).json({
      "type": "composer",
      "name": "Impact Multi-tip",
      "icon": "person",
      "description": "Curator",
      "aboutUrl": `${baseURL}/~/studio/multi-tip-compose?${qs.stringify({ fid: 3 })}`,
      "imageUrl": `${baseURL}/images/Logo.png`,
      "action": {
        "type": "post",
      }
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}