import axios from 'axios';

export default async function handler(req, res) {
  const neyNarApiKey = process.env.NEYNAR_API_KEY
  const redashApiKey = process.env.REDASH_404_API_KEY
  const queryId = 404 // SELECT count(type) FROM links WHERE fid = {{fid}} AND target_fid = {{target}} - check if fid follows target_fid
  const { fid, name } = req.query;

  if (req.method !== 'GET' || !fid || !name) {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {
    console.log(fid)
    try {
      const base = "https://api.neynar.com/";
      const url = `${base}v2/farcaster/user/search?q=${name}&viewer_fid=${fid}`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          api_key: neyNarApiKey,
        },
      });
      const users = await response.json();

      // check if users are following fid
      for (let i = 0; i < users.result.users.length; i++) {
        users.result.users[i].following = 0
        const options = {"parameters": {"fid": fid, "target": users.result.users[i].fid}, "max_age": 100}

        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        try {
          sleep(100)
          async function postFollowing() {
            const instance = axios.create({
              baseURL: `https://data.hubs.neynar.com`,
              timeout: 1000,
              headers: {
                  Authorization: `Key ${redashApiKey}`,
              }
            });
       
            const url = `/api/queries/${queryId}/results`;
            let followResponse = await instance.post(url, options);
            return followResponse
          }
          let following = 0
          let counter = 0
          let postResponse = await postFollowing()
          while (typeof postResponse.data.job !== 'undefined' && counter <= 2) { 
            postResponse = await postFollowing()
            counter++
            if (typeof postResponse.data.query_result !== 'undefined')
              following = postResponse.data.query_result.data.rows[0].count
            else 
              await sleep(1000);
          }
          if (typeof postResponse.data.query_result !== 'undefined' && counter == 0) 
            following = postResponse.data.query_result.data.rows[0].count
          users.result.users[i].following = following
        } catch (error) {
          console.error('Error handling POST requests:', error);
        }
      }

      res.status(200).json({ users: users.result.users });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}