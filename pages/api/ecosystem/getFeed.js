export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY

  const { fid, channel, curated, cursor } = req.query;

  // ?channel_ids=dev&with_recasts=true&viewer_fid=3&with_replies=false&limit=10&should_moderate=false

  if (req.method !== 'GET' || !channel) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    let userFid = 3
    let isCurated = true
    let cursorData = ''
    if (fid) {
      userFid = fid
    }
    if (curated || curated == false) {
      isCurated = curated
    }
    if (cursor) {
      cursorData = '&cursor=' + cursor
    }


    async function getFeed(channel, userFid, isCurated, cursorData) {
      try {
        const base = "https://api.neynar.com/";
        const url = `${base}v2/farcaster/feed/channels?channel_ids=${channel}&with_recasts=true&viewer_fid=${userFid}&with_replies=false&limit=10${cursorData}&should_moderate=${isCurated}`;
        const response = await fetch(url, {
          headers: {
            accept: "application/json",
            api_key: apiKey,
          },
        });
        const castData = await response.json();
        console.log(castData)
        let casts = []
        let cursor = null
        if (castData && castData.casts && castData.casts.length > 0) {
          casts = castData.casts
        }
        if (castData && castData.next && castData.next.cursor) {
          cursor = castData.next.cursor
        }
        return {casts, cursor}
      } catch (error) {
        console.error('Error handling GET request:', error);
        return {casts: [], cursor: null}
      }
    }
    try {
      const {casts, cursor} = await getFeed(channel, userFid, isCurated, cursorData)
      res.status(200).json({ casts, cursor });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

  }
}