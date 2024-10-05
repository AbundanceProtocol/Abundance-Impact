import { decryptPassword } from '../../../utils/utils';
import connectToDatabase from '../../../libs/mongodb';
import ScheduleTip from '../../../models/ScheduleTip';
import Cast from '../../../models/Cast';
import Impact from '../../../models/Impact';
import User from '../../../models/User';
import Tip from '../../../models/Tip';
import EcosystemRules from '../../../models/EcosystemRules';
import { getTimeRange, processTips, populateCast } from '../../../utils/utils';

const secretKey = process.env.SECRET_KEY
const apiKey = process.env.NEYNAR_API_KEY
const baseApi = process.env.BASE_API
const baseApiKey = process.env.BASE_API_KEY

export default async function handler(req, res) {
  const { castHash } = req.query

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
    return
  }

  try {
    await connectToDatabase()

    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      let cast = null
      let hash = null
      let castMedia = null

      let docs = await Cast.countDocuments({ cast_media: { $exists: false } });
      console.log('docs left', docs)

      cast = await Cast.findOne({ cast_media: { $exists: false } });
  
      // console.log('cast', cast)
  
      if (!cast) {
        // res.status(500).json({ error: 'Error getting cast' });
        continue
      }
  
      hash = cast?.cast_hash
      console.log('hash', hash)
      async function getCastMedia(hash) {
        try {
        
          const base = "https://api.neynar.com/";
          const url = `${base}v2/farcaster/cast?identifier=${hash}&type=hash`;
          const response = await fetch(url, {
            headers: {
              accept: "application/json",
              api_key: apiKey,
            },
          })
          
          const neynarCast = await response.json();
          if (neynarCast) {
            let embeds = neynarCast?.cast?.embeds || []
            let frames = neynarCast?.cast?.frames || []
            let media = []
            console.log('hash', neynarCast?.cast?.hash)
  
  
            for (const embed of embeds) {
              if (embed?.metadata?.content_type) {
                let image = {url: embed?.url, content_type: embed?.metadata?.content_type}
                media.push(image)
              } else if (embed?.cast_id) {
                let quote = {url: embed?.cast_id?.hash, content_type: 'quotecast'}
                media.push(quote)
              }
            }
            for (const frame of frames) {
              if (frame?.image) {
                let frameImage = {url: frame?.image, content_type: 'frame'}
                media.push(frameImage)
              }
            }
  
            return media
          } else {
            return []
          }
        } catch (error) {
          console.error('Error handling GET request:', error);
          return null
        }
      }
  
  
  
      
      castMedia = await getCastMedia(hash)
  
      cast.cast_media = [...castMedia]
      console.log('find cast2', cast.cast_media)
  
      cast.save()



    }




    res.status(200).json({ message: 'Done' });

  } catch(error) {
    console.error('Error handling GET request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
