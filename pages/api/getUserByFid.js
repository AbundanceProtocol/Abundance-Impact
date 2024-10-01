import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { fid } = req.query;
  if (req.method !== 'GET' || !fid) {
    return res.status(400).json({ error: 'URL parameter is missing' });
  } else {
  
    try {
      async function getUser(fid) {
        try {
          const base = "https://client.warpcast.com/";
          const url = `${base}v2/user-by-fid?fid=${fid}`;
    
          const response = await fetch(url, {
            headers: {
              accept: "application/json",
            },
          });
    
          if (response) {
            const user = await response.json()
            if (user) {
              const userProfile = user?.result?.user
              // console.log(userProfile, userProfile.pfp, userProfile.profile, userProfile.viewerContext)
              console.log('userProfile', userProfile)
              return userProfile
            }
          }
          return null
        } catch (error) {
          console.error('Error handling GET request:', error);
          return null
        }        
      }
      const user = await getUser(fid)
      res.status(200).json(user);
      
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}