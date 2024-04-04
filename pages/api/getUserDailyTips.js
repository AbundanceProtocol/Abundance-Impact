import axios from 'axios';

export default async function handler(req, res) {
  const neyNarApiKey = process.env.NEYNAR_API_KEY
  const redashApiKey = process.env.REDASH_487_API_KEY
  const queryId = 487 // SELECT SUM(extracted_number) AS total_extracted_numbers FROM (SELECT (REGEXP_MATCHES(c2.text, '(\d+)\s*\$degen'))[1]::int AS extracted_number FROM casts c1 JOIN casts c2 ON c1.hash = c2.parent_hash WHERE c1.fid = {{fid}} AND c1. reated_at >= NOW() - INTERVAL '1 DAY' AND c1.fid <> c2.fid AND c2.text LIKE '%$degen%') AS subquery
  
  const { fid } = req.query;

  if (req.method === 'GET' && fid) {
    const options = {"parameters": {"fid": fid}, "max_age": 100}
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    try {
      sleep(100)
      async function userTips() {
        const instance = axios.create({
          baseURL: `https://data.hubs.neynar.com`,
          timeout: 1000,
          headers: {
              Authorization: `Key ${redashApiKey}`,
          }
        });
    
        const url = `/api/queries/${queryId}/results`;
        let tips = await instance.post(url, options);
        return tips
      }
      let dailyTips = 0
      let counter = 0
      let getUserTips = await userTips()
      while (typeof getUserTips.data.job !== 'undefined' && counter <= 2) { 
        getUserTips = await userTips()
        counter++
        if (typeof getUserTips.data.query_result !== 'undefined') {
          dailyTips = getUserTips.data.query_result.data.rows[0].total_extracted_numbers
        }
        else 
          await sleep(1000);
      }
      if (typeof getUserTips.data.query_result !== 'undefined' && counter == 0) {
        dailyTips = getUserTips.data.query_result.data.rows[0].total_extracted_numbers
      }
      
      console.log(getUserTips.data.query_result.data.rows[0].total_extracted_numbers)
      res.status(200).json({ tips: dailyTips });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(400).json({ error: 'Bad Request.' });
  }
}