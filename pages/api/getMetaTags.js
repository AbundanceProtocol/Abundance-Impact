import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;
  if (req.method !== 'GET' || !url) {
    return res.status(400).json({ error: 'URL parameter is missing' });
  } else {
  
    async function extractMetaTags(url) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors'
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
    
        const metaTags = {};
        $('meta').each((index, element) => {
          const property = $(element).attr('property');
          const content = $(element).attr('content');
          if (property && content) {
            if (property.startsWith('og:')) {
              metaTags[property.slice(3)] = content;
            }
          }
        });
    
        const title = $('title').text();
            const domain = new URL(url).hostname;
        return { ...metaTags, title, domain };

      } catch (error) {
        console.error('Error fetching URL:', error);

        throw new Error('Failed to fetch URL');
      }
    }


    try {
      // console.log(url)
      let metaTags = await extractMetaTags(url);
      if (metaTags) {
        // console.log('1', metaTags)
        res.status(200).json(metaTags);
      } else {
        // console.log('2', metaTags)
        metaTags = null
        res.status(200).json(metaTags);
      }

    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}