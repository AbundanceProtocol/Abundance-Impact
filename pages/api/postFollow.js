import axios from 'axios';

export default async function handler(req, res) {
  const apiKey = process.env.REDASH_404_API_KEY
  const queryId = 404 // SELECT count(type) FROM links WHERE fid = {{fid}} AND target_fid = {{target}} - check if fid follows target_fid
  const { fid, target } = req.body
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  if (req.method !== 'POST' || !target || !fid) {
    res.status(404).json({ error: 'Not found' });
  } else {
    console.log(fid)
    const options = {"parameters": {"fid": fid, "target": target}, "max_age": 100}

    try {
      async function postFollowing() {
        const instance = axios.create({
          baseURL: `https://data.hubs.neynar.com`,
          timeout: 2000,
          headers: {
              Authorization: `Key ${apiKey}`,
          }
        });
   
        const url = `/api/queries/${queryId}/results`;
        let response = await instance.post(url, options);
        return response
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
      
      console.log('following:', following)

      res.status(200).json({ following });
    } catch (error) {
      console.error('Error handling POST requests:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}