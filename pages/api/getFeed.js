export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  const { fid } = req.query;

  if (req.method !== 'GET' || !fid) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    try {
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/feed?feed_type=filter&filter_type=global_trending&with_recasts=true&with_replies=false&limit=4`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const feed = await response.json();
      if (typeof feed !== 'undefined') {
        for (let i = 0; i < feed.casts.length; i++) {
          if (feed.casts[i].root_parent_url !== null) {
            const isChannel = feed.casts[i].root_parent_url.slice(0,31)
            if (isChannel == 'https://farcaster.xyz/~/channel/') {
              const base = "https://api.neynar.com/";
              const getChannel = feed.casts[i].root_parent_url.slice(31)
              const channelQuery = `${base}v2/farcaster/channel?id=${getChannel}`;
              const channelData = await fetch(channelQuery, {
                headers: {
                  accept: "application/json",
                  api_key: apiKey,
                },
              });
              const channel = await channelData.json();
              const channelImg = channel.channel.image_url
              const channelName = channel.channel.name
              feed.casts[i].channelImg = channelImg
              feed.casts[i].channelName = channelName

              //  add impact score api  //
              // feed.casts[i].impact = 5 
            }
          }
        }
      }
      res.status(200).json({ feed: feed.casts });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}