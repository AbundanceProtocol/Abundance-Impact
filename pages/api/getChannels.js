export default async function handler(req, res) {
  const apiKey = process.env.NEYNAR_API_KEY
  if (req.method === 'GET') {
    try {
      const { name } = req.query;
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/channel/search?q=${name}`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });
      const channels = await response.json();

    ////  get channel followers   ////
    // if (typeof channels !== 'undefined') {
    //   for (let i = 0; i < channels.channels.length; i++) {
    //     // const base = "https://api.neynar.com/";
    //     const channelId = channels.channels[i].id
    //     const channelQuery = `${base}v2/farcaster/channel/followers?id=${channelId}`;
    //     const channelData = await fetch(channelQuery, {
    //       headers: {
    //         accept: "application/json",
    //         api_key: apiKey,
    //       },
    //     });
    //     const getChannel = await channelData.json();
    //     const channelQuery = `${base}v2/farcaster/channel?id=${getChannel}`;
    //     const channelData = await fetch(channelQuery, {
    //       headers: {
    //         accept: "application/json",
    //         api_key: apiKey,
    //       },
    //     });
    //     console.log(channelInfo)
    //     const channelImg = channel.channel.image_url
    //     const channelName = channel.channel.name
    //     feed1.casts[i].channelImg = channelImg
    //     feed1.casts[i].channelName = channelName
    //   }
    // }

    // console.log(channels)

      // console.log(channels.channels)
      res.status(200).json({ channels: channels });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}